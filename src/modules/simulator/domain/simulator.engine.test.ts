import { describe, it, expect } from "vitest";
import { runSimulatorEngine, recalculateScenarioImpact } from "./simulator.engine";
import { fromMajorUnits, toMajorUnits, createMoney } from "@/shared/types/money";
import { SeedCategory, SeedLineItem } from "@/shared/db/seed-data";

describe("Adaptive Budget Simulator Engine (Module 05 Signature Feature)", () => {
  const mockCategories: SeedCategory[] = [
    { id: "c-food", event_id: "evt-1", name: "Catering", priority: "MUST_HAVE", allocated_amount: fromMajorUnits(300000, "INR").amount },
    { id: "c-decor", event_id: "evt-1", name: "Floral Decor", priority: "FLEXIBLE", allocated_amount: fromMajorUnits(100000, "INR").amount },
    { id: "c-music", event_id: "evt-1", name: "DJ & Sound", priority: "LOW", allocated_amount: fromMajorUnits(50000, "INR").amount },
  ];

  const mockLineItems: SeedLineItem[] = [
    { id: "li-1", event_id: "evt-1", category_id: "c-food", title: "Buffet", planned_amount: fromMajorUnits(300000, "INR").amount, cost_type: "VARIABLE", status: "ESTIMATED", per_guest_unit_cost: fromMajorUnits(1500, "INR").amount },
    { id: "li-2", event_id: "evt-1", category_id: "c-decor", title: "Flowers", planned_amount: fromMajorUnits(100000, "INR").amount, cost_type: "FIXED", status: "ESTIMATED", per_guest_unit_cost: null },
    { id: "li-3", event_id: "evt-1", category_id: "c-music", title: "DJ", planned_amount: fromMajorUnits(50000, "INR").amount, cost_type: "FIXED", status: "ESTIMATED", per_guest_unit_cost: null },
  ];

  it("calculates budget deficit when budget is reduced from ₹4.5L to ₹4.0L", () => {
    const input = {
      currentBudgetMinor: fromMajorUnits(450000, "INR").amount,
      currentGuestCount: 200,
      proposedBudgetMinor: fromMajorUnits(400000, "INR").amount, // ₹50,000 deficit
      proposedGuestCount: 200,
      currency: "INR",
    };

    const result = runSimulatorEngine(input, mockCategories, mockLineItems);
    expect(toMajorUnits(createMoney(result.initialDeficitMinor, "INR"))).toBe(50000);
    expect(result.recommendations.length).toBeGreaterThan(0);

    // MUST_HAVE Catering must not have a cut recommendation
    const cateringCut = result.recommendations.find((r) => r.category_id === "c-food");
    expect(cateringCut).toBeUndefined();

    // LOW priority DJ and FLEXIBLE Floral Decor should be recommended for cuts
    const djCut = result.recommendations.find((r) => r.category_id === "c-music");
    expect(djCut).toBeDefined();
    expect(djCut!.diff_amount).toBeLessThan(0); // savings
  });

  it("scales variable costs when guest count increases", () => {
    const input = {
      currentBudgetMinor: fromMajorUnits(450000, "INR").amount,
      currentGuestCount: 200,
      proposedBudgetMinor: fromMajorUnits(450000, "INR").amount,
      proposedGuestCount: 220, // +20 guests
      currency: "INR",
    };

    const result = runSimulatorEngine(input, mockCategories, mockLineItems);
    // +20 guests * 1500 = 30,000 extra in variable catering
    expect(toMajorUnits(createMoney(result.initialDeficitMinor, "INR"))).toBe(30000);

    const varRec = result.recommendations.find((r) => r.diff_amount > 0);
    expect(varRec).toBeDefined();
    expect(toMajorUnits(createMoney(varRec!.diff_amount, "INR"))).toBe(30000);
  });

  it("dynamically recalculates remaining deficit when recommendations are accepted or rejected", () => {
    const baselineDeficit = fromMajorUnits(40000, "INR").amount;
    const recs = [
      { id: "r1", action: "Cut Decor", current_amount: 10000000, proposed_amount: 8000000, diff_amount: -2000000, trade_off_explanation: "", status: "ACCEPTED" as const },
      { id: "r2", action: "Cut DJ", current_amount: 5000000, proposed_amount: 3500000, diff_amount: -1500000, trade_off_explanation: "", status: "ACCEPTED" as const },
    ];

    // Both accepted: 20k + 15k = 35k saved out of 40k deficit -> 5k remaining deficit
    let impact = recalculateScenarioImpact(baselineDeficit, recs, fromMajorUnits(400000, "INR").amount, "INR");
    expect(toMajorUnits(impact.netSavings)).toBe(35000);
    expect(toMajorUnits(impact.remainingDeficit)).toBe(5000);
    expect(impact.isBudgetBalanced).toBe(false);

    // Reject r2 (DJ cut): only 20k saved -> 20k remaining deficit
    recs[1].status = "REJECTED";
    impact = recalculateScenarioImpact(baselineDeficit, recs, fromMajorUnits(400000, "INR").amount, "INR");
    expect(toMajorUnits(impact.netSavings)).toBe(20000);
    expect(toMajorUnits(impact.remainingDeficit)).toBe(20000);
  });
});
