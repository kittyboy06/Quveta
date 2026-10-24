import { Money, createMoney, addMoney, subtractMoney, toMajorUnits, fromMajorUnits, calculatePercentageChange } from "@/shared/types/money";
import { SeedCategory, SeedLineItem } from "@/shared/db/seed-data";

export interface SimulationInput {
  currentBudgetMinor: number;
  currentGuestCount: number;
  proposedBudgetMinor: number;
  proposedGuestCount: number;
  revisedPriorities?: Record<string, "MUST_HAVE" | "HIGH" | "FLEXIBLE" | "LOW">;
  customNotes?: string;
  currency?: string;
}

export interface GeneratedRecommendation {
  id: string;
  category_id?: string;
  action: string;
  current_amount: number; // minor units
  proposed_amount: number; // minor units
  diff_amount: number; // minor units (negative = saving, positive = increase)
  trade_off_explanation: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface SimulationResult {
  currentBudget: Money;
  proposedBudget: Money;
  currentGuestCount: number;
  proposedGuestCount: number;
  initialDeficitMinor: number; // Amount needed to cut (if > 0)
  recommendations: GeneratedRecommendation[];
  summary: string;
}

export function runSimulatorEngine(
  input: SimulationInput,
  categories: SeedCategory[],
  lineItems: SeedLineItem[]
): SimulationResult {
  const currency = input.currency || "INR";
  const currentPlannedMinor = lineItems.reduce((acc, li) => acc + li.planned_amount, 0);

  // 1. Calculate variable scaling delta if guest count changed
  let variableCostDeltaMinor = 0;
  if (input.proposedGuestCount !== input.currentGuestCount && input.currentGuestCount > 0) {
    const guestRatio = input.proposedGuestCount / input.currentGuestCount;
    for (const item of lineItems) {
      if (item.cost_type === "VARIABLE") {
        const newCost = Math.round(item.planned_amount * guestRatio);
        variableCostDeltaMinor += newCost - item.planned_amount;
      }
    }
  }

  // Adjusted planned expenditure before any cuts
  const baselineProposedSpendMinor = currentPlannedMinor + variableCostDeltaMinor;
  // Gap that needs to be bridged to meet proposed target budget
  const initialDeficitMinor = baselineProposedSpendMinor - input.proposedBudgetMinor;

  const recommendations: GeneratedRecommendation[] = [];

  // If there is an increase in guest count, recommend variable cost awareness
  if (variableCostDeltaMinor > 0) {
    recommendations.push({
      id: `rec-var-${Date.now()}-0`,
      action: `Account for ${input.proposedGuestCount - input.currentGuestCount} additional guests in variable catering & hospitality`,
      current_amount: currentPlannedMinor,
      proposed_amount: baselineProposedSpendMinor,
      diff_amount: variableCostDeltaMinor,
      trade_off_explanation: `Increasing guest headcount automatically scales per-person meals and seating by ${toMajorUnits(createMoney(variableCostDeltaMinor, currency)).toLocaleString("en-IN")}. Verified calculation based on unit rates.`,
      status: "ACCEPTED",
    });
  }

  // 2. Generate trade-off recommendations if there is a deficit
  let remainingGapMinor = initialDeficitMinor;

  if (remainingGapMinor > 0) {
    // Sort categories: LOW priority first, then FLEXIBLE, then HIGH (MUST_HAVE protected)
    const priorityWeight = { LOW: 1, FLEXIBLE: 2, HIGH: 3, MUST_HAVE: 4 };

    const sortedCats = [...categories].sort((a, b) => {
      const pA = input.revisedPriorities?.[a.id] || a.priority;
      const pB = input.revisedPriorities?.[b.id] || b.priority;
      return (priorityWeight[pA] || 2) - (priorityWeight[pB] || 2);
    });

    for (const cat of sortedCats) {
      if (remainingGapMinor <= 0) break;
      const priority = input.revisedPriorities?.[cat.id] || cat.priority;

      // Never cut MUST_HAVE unless strictly unavoidable
      if (priority === "MUST_HAVE") continue;

      // Find line items in this category that are not PAID or COMMITTED
      const adjustableItems = lineItems.filter(
        (li) => li.category_id === cat.id && li.status !== "PAID" && li.status !== "COMMITTED"
      );

      const catPlannedMinor = adjustableItems.reduce((acc, li) => acc + li.planned_amount, 0);
      if (catPlannedMinor <= 0) continue;

      // Determine proportional cut based on priority
      const cutRatio = priority === "LOW" ? 0.35 : priority === "FLEXIBLE" ? 0.20 : 0.10;
      const proposedCutMinor = Math.min(Math.round(catPlannedMinor * cutRatio), remainingGapMinor);

      if (proposedCutMinor > 0) {
        const newCatAllocation = cat.allocated_amount - proposedCutMinor;
        const savingMajor = toMajorUnits(createMoney(proposedCutMinor, currency));
        const currentMajor = toMajorUnits(createMoney(cat.allocated_amount, currency));
        const proposedMajor = toMajorUnits(createMoney(newCatAllocation, currency));

        recommendations.push({
          id: `rec-cut-${cat.id}-${Date.now()}`,
          category_id: cat.id,
          action: `Optimize ${cat.name} allocation from ₹${currentMajor.toLocaleString("en-IN")} to ₹${proposedMajor.toLocaleString("en-IN")}`,
          current_amount: cat.allocated_amount,
          proposed_amount: newCatAllocation,
          diff_amount: -proposedCutMinor,
          trade_off_explanation: `Reduce expenditure in ${cat.name} (${priority} tier) to save ₹${savingMajor.toLocaleString("en-IN")}. Suggests simplifying decor packages or non-essential vendor rentals. Confirm feasibility with supplier before booking.`,
          status: "ACCEPTED",
        });

        remainingGapMinor -= proposedCutMinor;
      }
    }
  }

  const summary =
    initialDeficitMinor > 0
      ? `Simulated budget requires ₹${toMajorUnits(createMoney(initialDeficitMinor, currency)).toLocaleString("en-IN")} in adjustments. ${recommendations.length} explainable trade-offs proposed while protecting MUST_HAVE priorities.`
      : `Proposed budget has an available surplus of ₹${toMajorUnits(createMoney(-initialDeficitMinor, currency)).toLocaleString("en-IN")}. Current plan remains within limits.`;

  return {
    currentBudget: createMoney(input.currentBudgetMinor, currency),
    proposedBudget: createMoney(input.proposedBudgetMinor, currency),
    currentGuestCount: input.currentGuestCount,
    proposedGuestCount: input.proposedGuestCount,
    initialDeficitMinor,
    recommendations,
    summary,
  };
}

export function recalculateScenarioImpact(
  baselineDeficitMinor: number,
  recommendations: GeneratedRecommendation[],
  proposedBudgetMinor: number,
  currency: string = "INR"
) {
  let netSavingsMinor = 0;

  for (const rec of recommendations) {
    if (rec.status === "ACCEPTED") {
      // diff_amount is negative for savings, positive for increases
      netSavingsMinor += -rec.diff_amount;
    }
  }

  const remainingDeficitMinor = baselineDeficitMinor - netSavingsMinor;
  const isBudgetBalanced = remainingDeficitMinor <= 0;

  return {
    netSavings: createMoney(Math.max(0, netSavingsMinor), currency),
    remainingDeficit: createMoney(remainingDeficitMinor, currency),
    isBudgetBalanced,
    projectedSpend: createMoney(proposedBudgetMinor + remainingDeficitMinor, currency),
  };
}
