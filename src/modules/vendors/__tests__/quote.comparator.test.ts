import { describe, it, expect } from "vitest";
import { compareQuotations } from "../domain/quote.comparator";
import { SeedQuotation, SeedVendor } from "@/shared/db/seed-data";

describe("Quotation Comparator Engine (Module 07)", () => {
  const mockVendors: SeedVendor[] = [
    {
      id: "v-1",
      event_id: "evt-test",
      name: "Heritage Royal Catering",
      category: "CATERING",
      contact_person: "Chef Ramesh",
      email: "ramesh@heritage.in",
      phone: "+91 99000 12345",
      status: "QUOTED",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
    {
      id: "v-2",
      event_id: "evt-test",
      name: "SpiceBazaar Express",
      category: "CATERING",
      contact_person: "Chef Sunita",
      email: "sunita@spicebazaar.in",
      phone: "+91 99000 54321",
      status: "QUOTED",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  const mockQuotes: SeedQuotation[] = [
    {
      id: "q-1",
      vendor_id: "v-1",
      event_id: "evt-test",
      quote_reference: "HRC-01",
      amount_minor: 25000000, // ₹2,50,000
      currency: "INR",
      status: "RECEIVED",
      valid_until: "2026-10-10",
      line_items: [
        { description: "Dinner Buffet", amount_minor: 20000000, is_mandatory: true },
        { description: "Live Chaat Station", amount_minor: 5000000, is_mandatory: false },
      ],
      inclusions: ["Chafing dishes", "Cutlery", "20 Servers"],
      exclusions: ["Dessert counter"],
      deposit_required_minor: 5000000, // 20%
      created_at: "2026-01-01",
    },
    {
      id: "q-2",
      vendor_id: "v-2",
      event_id: "evt-test",
      quote_reference: "SBE-02",
      amount_minor: 20000000, // ₹2,00,000
      currency: "INR",
      status: "RECEIVED",
      valid_until: "2026-10-10",
      line_items: [
        { description: "Standard Dinner", amount_minor: 20000000, is_mandatory: true },
      ],
      inclusions: ["Chafing dishes"],
      exclusions: ["Cutlery", "Dessert counter"],
      deposit_required_minor: 10000000, // 50% (High deposit!)
      created_at: "2026-01-01",
    },
  ];

  it("calculates accurate price spread, per-guest cost, and identifies cheapest option", () => {
    const comparison = compareQuotations(mockQuotes, mockVendors, 200);

    expect(comparison.quotes.length).toBe(2);
    expect(comparison.cheapestQuoteId).toBe("q-2");
    expect(comparison.mostExpensiveQuoteId).toBe("q-1");
    expect(comparison.priceSpreadMinor).toBe(5000000); // ₹50,000 spread

    // Per guest calculation: ₹2,50,000 / 200 = ₹1,250 (125000 paise)
    const quote1Processed = comparison.quotes.find((q) => q.quote.id === "q-1");
    expect(quote1Processed?.perGuestMoney.amount).toBe(125000);

    // Per guest calculation: ₹2,00,000 / 200 = ₹1,000 (100000 paise)
    const quote2Processed = comparison.quotes.find((q) => q.quote.id === "q-2");
    expect(quote2Processed?.perGuestMoney.amount).toBe(100000);
  });

  it("correctly identifies inclusion differences across quotes", () => {
    const comparison = compareQuotations(mockQuotes, mockVendors, 200);

    const cutleryInc = comparison.inclusionsMatrix.find((inc) => inc.inclusion === "Cutlery");
    expect(cutleryInc).toBeDefined();
    expect(cutleryInc?.coveredByQuoteIds).toEqual(["q-1"]); // Only quote 1 includes Cutlery
  });

  it("flags high deposit warning when a vendor requests >40% upfront", () => {
    const comparison = compareQuotations(mockQuotes, mockVendors, 200);

    const depositWarning = comparison.analysisNotes.find((note) => note.includes("deposit of 50%"));
    expect(depositWarning).toBeDefined();
    expect(depositWarning).toContain("SpiceBazaar Express");
  });
});
