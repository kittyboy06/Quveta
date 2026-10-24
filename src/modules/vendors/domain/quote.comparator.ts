import { SeedQuotation, SeedVendor } from "@/shared/db/seed-data";
import { createMoney, formatMoney, Money } from "@/shared/types/money";

export interface QuotationComparisonResult {
  quotes: {
    quote: SeedQuotation;
    vendor?: SeedVendor;
    priceMoney: Money;
    formattedPrice: string;
    perGuestMoney: Money;
    formattedPerGuest: string;
    depositMoney: Money;
    formattedDeposit: string;
    depositPercentage: number;
    mandatoryItemsTotal: Money;
    optionalItemsTotal: Money;
  }[];
  priceSpreadMinor: number;
  cheapestQuoteId: string;
  mostExpensiveQuoteId: string;
  inclusionsMatrix: {
    inclusion: string;
    coveredByQuoteIds: string[];
  }[];
  exclusionsMatrix: {
    exclusion: string;
    excludedByQuoteIds: string[];
  }[];
  analysisNotes: string[];
}

export function compareQuotations(
  quotes: SeedQuotation[],
  vendors: SeedVendor[],
  guestCount: number
): QuotationComparisonResult {
  if (quotes.length === 0) {
    return {
      quotes: [],
      priceSpreadMinor: 0,
      cheapestQuoteId: "",
      mostExpensiveQuoteId: "",
      inclusionsMatrix: [],
      exclusionsMatrix: [],
      analysisNotes: ["No quotations selected for comparison."],
    };
  }

  const vendorMap = new Map(vendors.map((v) => [v.id, v]));
  const safeGuests = Math.max(1, guestCount);

  let minAmount = Number.MAX_SAFE_INTEGER;
  let maxAmount = 0;
  let cheapestId = quotes[0].id;
  let expensiveId = quotes[0].id;

  const processed = quotes.map((q) => {
    if (q.amount_minor < minAmount) {
      minAmount = q.amount_minor;
      cheapestId = q.id;
    }
    if (q.amount_minor > maxAmount) {
      maxAmount = q.amount_minor;
      expensiveId = q.id;
    }

    const priceMoney = createMoney(q.amount_minor, q.currency);
    const perGuestMinor = Math.round(q.amount_minor / safeGuests);
    const perGuestMoney = createMoney(perGuestMinor, q.currency);
    const depositMoney = createMoney(q.deposit_required_minor, q.currency);
    const depositPercentage = q.amount_minor > 0 ? Math.round((q.deposit_required_minor / q.amount_minor) * 100) : 0;

    const mandatoryItemsMinor = q.line_items
      .filter((li) => li.is_mandatory)
      .reduce((sum, li) => sum + li.amount_minor, 0);
    const optionalItemsMinor = q.line_items
      .filter((li) => !li.is_mandatory)
      .reduce((sum, li) => sum + li.amount_minor, 0);

    return {
      quote: q,
      vendor: vendorMap.get(q.vendor_id),
      priceMoney,
      formattedPrice: formatMoney(priceMoney),
      perGuestMoney,
      formattedPerGuest: formatMoney(perGuestMoney),
      depositMoney,
      formattedDeposit: formatMoney(depositMoney),
      depositPercentage,
      mandatoryItemsTotal: createMoney(mandatoryItemsMinor, q.currency),
      optionalItemsTotal: createMoney(optionalItemsMinor, q.currency),
    };
  });

  // Build Inclusions & Exclusions matrix
  const allInclusions = new Set<string>();
  const allExclusions = new Set<string>();

  quotes.forEach((q) => {
    q.inclusions.forEach((inc) => allInclusions.add(inc));
    q.exclusions.forEach((exc) => allExclusions.add(exc));
  });

  const inclusionsMatrix = Array.from(allInclusions).map((inc) => ({
    inclusion: inc,
    coveredByQuoteIds: quotes.filter((q) => q.inclusions.includes(inc)).map((q) => q.id),
  }));

  const exclusionsMatrix = Array.from(allExclusions).map((exc) => ({
    exclusion: exc,
    excludedByQuoteIds: quotes.filter((q) => q.exclusions.includes(exc)).map((q) => q.id),
  }));

  // Analytical Notes
  const analysisNotes: string[] = [];
  const priceSpreadMinor = maxAmount - minAmount;

  if (quotes.length > 1 && priceSpreadMinor > 0) {
    const spreadMoney = createMoney(priceSpreadMinor, quotes[0].currency);
    const cheapVendor = processed.find((p) => p.quote.id === cheapestId)?.vendor?.name || "Lowest quote";
    const expVendor = processed.find((p) => p.quote.id === expensiveId)?.vendor?.name || "Highest quote";
    analysisNotes.push(
      `Price variance is ${formatMoney(spreadMoney)}. ${cheapVendor} is most cost-effective, while ${expVendor} carries premium inclusions.`
    );
  }

  // Check deposit exposure
  const highDepositQuote = processed.find((p) => p.depositPercentage > 40);
  if (highDepositQuote) {
    analysisNotes.push(
      `Warning: ${highDepositQuote.vendor?.name || "A vendor"} requires an upfront deposit of ${highDepositQuote.depositPercentage}% (${highDepositQuote.formattedDeposit}), which is above the standard 25–30% threshold.`
    );
  }

  return {
    quotes: processed,
    priceSpreadMinor,
    cheapestQuoteId: cheapestId,
    mostExpensiveQuoteId: expensiveId,
    inclusionsMatrix,
    exclusionsMatrix,
    analysisNotes,
  };
}
