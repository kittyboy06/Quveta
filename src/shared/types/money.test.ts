import { describe, it, expect } from "vitest";
import {
  createMoney,
  fromMajorUnits,
  toMajorUnits,
  formatMoney,
  addMoney,
  subtractMoney,
  scaleMoney,
  calculatePercentageChange,
} from "./money";

describe("Money utility (Financial Precision)", () => {
  it("creates and formats INR currency accurately without floating-point errors", () => {
    const budget = fromMajorUnits(800000, "INR"); // ₹8,00,000
    expect(budget.amount).toBe(80000000); // 8 crore paise
    expect(toMajorUnits(budget)).toBe(800000);
    expect(formatMoney(budget)).toContain("8,00,000");
  });

  it("performs deterministic addition and subtraction", () => {
    const a = fromMajorUnits(50000, "INR");
    const b = fromMajorUnits(25000, "INR");
    expect(toMajorUnits(addMoney(a, b))).toBe(75000);
    expect(toMajorUnits(subtractMoney(a, b))).toBe(25000);
  });

  it("prevents cross-currency addition without explicit conversion", () => {
    const inr = fromMajorUnits(100, "INR");
    const usd = fromMajorUnits(100, "USD");
    expect(() => addMoney(inr, usd)).toThrow(/Currency mismatch/);
  });

  it("scales variable costs accurately by headcount ratio", () => {
    const perGuestCost = fromMajorUnits(1400, "INR"); // ₹1,400 per guest
    const totalFor150 = scaleMoney(perGuestCost, 150);
    expect(toMajorUnits(totalFor150)).toBe(210000); // ₹2,10,000
  });

  it("calculates percentage changes correctly", () => {
    expect(calculatePercentageChange(100000, 80000)).toBe(-20);
    expect(calculatePercentageChange(100000, 125000)).toBe(25);
  });
});
