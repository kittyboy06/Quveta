/**
 * Authoritative financial representation for Quveta.
 * All monetary amounts are handled in integer minor currency units (e.g., paise for INR, cents for USD)
 * to eliminate floating-point arithmetic errors.
 */

export interface Money {
  /** Amount in integer minor units (e.g. 100000 paise = ₹1,000) */
  amount: number;
  /** ISO 4217 currency code (default: 'INR') */
  currency: string;
}

export function createMoney(amountMinor: number, currency: string = "INR"): Money {
  if (!Number.isInteger(amountMinor)) {
    amountMinor = Math.round(amountMinor);
  }
  return { amount: amountMinor, currency };
}

export function fromMajorUnits(majorAmount: number, currency: string = "INR"): Money {
  return createMoney(Math.round(majorAmount * 100), currency);
}

export function toMajorUnits(money: Money): number {
  return money.amount / 100;
}

export function formatMoney(money: Money): string {
  const major = toMajorUnits(money);
  if (money.currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(major);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(major);
}

export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: Cannot add ${a.currency} and ${b.currency}`);
  }
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: Cannot subtract ${a.currency} and ${b.currency}`);
  }
  return { amount: a.amount - b.amount, currency: a.currency };
}

export function scaleMoney(money: Money, factor: number): Money {
  if (factor < 0) {
    throw new Error("Scaling factor cannot be negative");
  }
  return createMoney(Math.round(money.amount * factor), money.currency);
}

export function calculatePercentageChange(original: number, updated: number): number {
  if (original === 0) return 0;
  const diff = updated - original;
  return Math.round((diff / original) * 1000) / 10; // 1 decimal place
}
