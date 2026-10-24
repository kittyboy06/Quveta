import { Money, createMoney, addMoney, subtractMoney, calculatePercentageChange, toMajorUnits } from "@/shared/types/money";

export interface LineItemLike {
  id: string;
  category_id: string;
  title: string;
  planned_amount: number; // minor units
  cost_type: "FIXED" | "VARIABLE" | "MIXED";
  status: "ESTIMATED" | "QUOTED" | "COMMITTED" | "PAID";
  per_guest_unit_cost: number | null;
}

export interface CategoryLike {
  id: string;
  name: string;
  priority: "MUST_HAVE" | "HIGH" | "FLEXIBLE" | "LOW";
  allocated_amount: number; // minor units
}

export interface BudgetSummary {
  targetBudget: Money;
  totalPlanned: Money;
  totalCommitted: Money;
  totalPaid: Money;
  remainingBudget: Money;
  isOverBudget: boolean;
  varianceAmount: Money;
  variancePercentage: number;
  costPerGuest: Money | null;
  fixedTotal: Money;
  variableTotal: Money;
  mixedTotal: Money;
}

export interface CategoryBreakdown {
  id: string;
  name: string;
  priority: "MUST_HAVE" | "HIGH" | "FLEXIBLE" | "LOW";
  allocatedAmount: Money;
  plannedAmount: Money;
  difference: Money;
  percentageUsed: number;
  itemsCount: number;
}

export function calculateBudgetSummary(
  targetBudgetMinor: number,
  lineItems: LineItemLike[],
  guestCount: number,
  currency: string = "INR"
): BudgetSummary {
  let plannedSum = 0;
  let committedSum = 0;
  let paidSum = 0;
  let fixedSum = 0;
  let variableSum = 0;
  let mixedSum = 0;

  for (const item of lineItems) {
    plannedSum += item.planned_amount;

    if (item.status === "PAID") {
      paidSum += item.planned_amount;
      committedSum += item.planned_amount;
    } else if (item.status === "COMMITTED") {
      committedSum += item.planned_amount;
    }

    if (item.cost_type === "FIXED") {
      fixedSum += item.planned_amount;
    } else if (item.cost_type === "VARIABLE") {
      variableSum += item.planned_amount;
    } else {
      mixedSum += item.planned_amount;
    }
  }

  const targetBudget = createMoney(targetBudgetMinor, currency);
  const totalPlanned = createMoney(plannedSum, currency);
  const totalCommitted = createMoney(committedSum, currency);
  const totalPaid = createMoney(paidSum, currency);
  const remainingBudget = createMoney(targetBudgetMinor - plannedSum, currency);
  const isOverBudget = plannedSum > targetBudgetMinor;
  const varianceAmount = createMoney(Math.abs(targetBudgetMinor - plannedSum), currency);
  const variancePercentage = calculatePercentageChange(targetBudgetMinor, plannedSum);

  const costPerGuest =
    guestCount > 0 ? createMoney(Math.round(plannedSum / guestCount), currency) : null;

  return {
    targetBudget,
    totalPlanned,
    totalCommitted,
    totalPaid,
    remainingBudget,
    isOverBudget,
    varianceAmount,
    variancePercentage,
    costPerGuest,
    fixedTotal: createMoney(fixedSum, currency),
    variableTotal: createMoney(variableSum, currency),
    mixedTotal: createMoney(mixedSum, currency),
  };
}

export function calculateCategoryBreakdowns(
  categories: CategoryLike[],
  lineItems: LineItemLike[],
  currency: string = "INR"
): CategoryBreakdown[] {
  return categories.map((cat) => {
    const items = lineItems.filter((li) => li.category_id === cat.id);
    const plannedSum = items.reduce((acc, curr) => acc + curr.planned_amount, 0);

    const allocatedAmount = createMoney(cat.allocated_amount, currency);
    const plannedAmount = createMoney(plannedSum, currency);
    const difference = createMoney(cat.allocated_amount - plannedSum, currency);
    const percentageUsed =
      cat.allocated_amount > 0 ? Math.round((plannedSum / cat.allocated_amount) * 100) : 0;

    return {
      id: cat.id,
      name: cat.name,
      priority: cat.priority,
      allocatedAmount,
      plannedAmount,
      difference,
      percentageUsed,
      itemsCount: items.length,
    };
  });
}
