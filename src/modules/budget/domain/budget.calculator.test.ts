import { describe, it, expect } from "vitest";
import { calculateBudgetSummary, calculateCategoryBreakdowns } from "./budget.calculator";
import { fromMajorUnits, toMajorUnits } from "@/shared/types/money";

describe("Budget Calculator (Module 04 Domain Engine)", () => {
  it("accurately aggregates planned, committed, and paid costs", () => {
    const lineItems = [
      {
        id: "1",
        category_id: "c1",
        title: "Venue Deposit",
        planned_amount: fromMajorUnits(100000, "INR").amount, // ₹1,00,000
        cost_type: "FIXED" as const,
        status: "PAID" as const,
        per_guest_unit_cost: null,
      },
      {
        id: "2",
        category_id: "c2",
        title: "Catering",
        planned_amount: fromMajorUnits(200000, "INR").amount, // ₹2,00,000
        cost_type: "VARIABLE" as const,
        status: "COMMITTED" as const,
        per_guest_unit_cost: fromMajorUnits(1000, "INR").amount,
      },
      {
        id: "3",
        category_id: "c3",
        title: "Flowers",
        planned_amount: fromMajorUnits(50000, "INR").amount, // ₹50,000
        cost_type: "FIXED" as const,
        status: "ESTIMATED" as const,
        per_guest_unit_cost: null,
      },
    ];

    const targetBudget = fromMajorUnits(400000, "INR").amount; // ₹4,00,000
    const summary = calculateBudgetSummary(targetBudget, lineItems, 200, "INR");

    expect(toMajorUnits(summary.totalPlanned)).toBe(350000);
    expect(toMajorUnits(summary.totalCommitted)).toBe(300000); // 100k paid + 200k committed
    expect(toMajorUnits(summary.totalPaid)).toBe(100000);
    expect(toMajorUnits(summary.remainingBudget)).toBe(50000);
    expect(summary.isOverBudget).toBe(false);
    expect(toMajorUnits(summary.costPerGuest!)).toBe(1750); // 350,000 / 200 = 1,750
    expect(toMajorUnits(summary.fixedTotal)).toBe(150000);
    expect(toMajorUnits(summary.variableTotal)).toBe(200000);
  });

  it("correctly identifies over-budget deficit and variance", () => {
    const lineItems = [
      {
        id: "1",
        category_id: "c1",
        title: "Luxury Mandap",
        planned_amount: fromMajorUnits(600000, "INR").amount,
        cost_type: "FIXED" as const,
        status: "ESTIMATED" as const,
        per_guest_unit_cost: null,
      },
    ];

    const targetBudget = fromMajorUnits(500000, "INR").amount; // ₹5,00,000
    const summary = calculateBudgetSummary(targetBudget, lineItems, 100, "INR");

    expect(summary.isOverBudget).toBe(true);
    expect(toMajorUnits(summary.remainingBudget)).toBe(-100000); // Negative buffer = deficit
    expect(toMajorUnits(summary.varianceAmount)).toBe(100000);
    expect(summary.variancePercentage).toBe(20); // 20% over target
  });
});
