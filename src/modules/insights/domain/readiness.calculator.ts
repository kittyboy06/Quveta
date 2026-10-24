import {
  ReadinessScore,
  EventInsight,
} from "./insights.schema";
import {
  SeedEvent,
  SeedBudgetLineItem,
  SeedTask,
  SeedVendor,
  SeedVendorQuotation,
  SeedGuest,
  SeedSeatingTable,
  SeedSeatingAssignment,
} from "@/shared/db/seed-data";

export interface ReadinessCalculationInput {
  event: SeedEvent;
  budgetLineItems: SeedBudgetLineItem[];
  tasks: SeedTask[];
  vendors: SeedVendor[];
  quotations: SeedVendorQuotation[];
  guests: SeedGuest[];
  tables: SeedSeatingTable[];
  assignments: SeedSeatingAssignment[];
  referenceDate?: string; // ISO date string, defaults to current time
}

export function calculateReadinessScore(input: ReadinessCalculationInput): ReadinessScore {
  const {
    event,
    budgetLineItems,
    tasks,
    vendors,
    quotations,
    guests,
    tables,
    assignments,
    referenceDate = new Date().toISOString(),
  } = input;

  const notes: string[] = [];

  // --- 1. BUDGET HEALTH (Weight: 25%) ---
  let budgetScore = 100;
  const targetBudget = event.target_budget || event.total_budget || 0;
  const totalAllocated = budgetLineItems.reduce(
    (sum, item: any) => sum + (item.planned_amount ?? item.actual_amount ?? item.estimated_amount ?? 0),
    0
  );

  if (targetBudget > 0) {
    if (totalAllocated > targetBudget) {
      const overagePercent = ((totalAllocated - targetBudget) / targetBudget) * 100;
      budgetScore = Math.max(0, Math.round(100 - overagePercent * 2.5));
      notes.push(`Budget allocated exceeds target by ${(overagePercent).toFixed(1)}%`);
    } else {
      const bufferPercent = ((targetBudget - totalAllocated) / targetBudget) * 100;
      notes.push(`Budget remains healthy with ${(bufferPercent).toFixed(1)}% contingency buffer.`);
    }
  }

  const overBudgetItems = budgetLineItems.filter(
    (i: any) => i.actual_amount != null && i.actual_amount > (i.estimated_amount ?? i.planned_amount ?? 0)
  );
  if (overBudgetItems.length > 0) {
    budgetScore = Math.max(0, budgetScore - overBudgetItems.length * 5);
  }

  const budgetPillarStatus =
    budgetScore >= 80 ? "HEALTHY" : budgetScore >= 50 ? "WARNING" : "CRITICAL";

  // --- 2. TASK & TIMELINE HEALTH (Weight: 25%) ---
  let taskScore = 100;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const refDateObj = new Date(referenceDate);

  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.due_date && new Date(t.due_date) < refDateObj
  );
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED");

  if (totalTasks > 0) {
    const baseCompletion = (completedTasks / totalTasks) * 60;
    const overduePenalty = overdueTasks.length * 15;
    const blockedPenalty = blockedTasks.length * 10;
    taskScore = Math.max(0, Math.min(100, Math.round(baseCompletion + 40 - overduePenalty - blockedPenalty)));

    if (overdueTasks.length > 0) {
      notes.push(`${overdueTasks.length} task(s) are overdue past their deadline.`);
    }
    if (blockedTasks.length > 0) {
      notes.push(`${blockedTasks.length} task(s) are currently marked as blocked.`);
    }
  }

  const taskPillarStatus =
    taskScore >= 80 ? "HEALTHY" : taskScore >= 50 ? "WARNING" : "CRITICAL";

  // --- 3. VENDOR & QUOTE HEALTH (Weight: 20%) ---
  let vendorScore = 80;
  const bookedVendors = vendors.filter((v) => v.status === "BOOKED");
  const pendingQuotes = quotations.filter(
    (q: any) => q.status === "PENDING_REVIEW" || q.status === "UNDER_REVIEW" || q.status === "RECEIVED"
  );

  if (vendors.length === 0) {
    vendorScore = 30;
    notes.push("No vendor partners logged for this event.");
  } else {
    const bookedRatio = bookedVendors.length / vendors.length;
    vendorScore = Math.round(bookedRatio * 70 + (pendingQuotes.length > 0 ? 15 : 30));
    if (bookedVendors.length === 0) {
      vendorScore = Math.min(vendorScore, 45);
      notes.push("No vendor contracts confirmed yet.");
    } else {
      notes.push(`${bookedVendors.length} of ${vendors.length} vendors are officially booked.`);
    }
  }

  const vendorPillarStatus =
    vendorScore >= 75 ? "HEALTHY" : vendorScore >= 50 ? "WARNING" : "CRITICAL";

  // --- 4. GUEST & RSVP HEALTH (Weight: 15%) ---
  let rsvpScore = 100;
  const totalGuests = guests.length;
  const isConfirmed = (g: any) => g.rsvp_status === "CONFIRMED" || g.rsvp_status === "ATTENDING";
  const confirmedGuests = guests.filter(isConfirmed).length;
  const declinedGuests = guests.filter((g) => g.rsvp_status === "DECLINED").length;
  const responded = confirmedGuests + declinedGuests;

  if (totalGuests > 0) {
    const responseRate = responded / totalGuests;
    rsvpScore = Math.min(100, Math.round(responseRate * 100));
    notes.push(`${Math.round(responseRate * 100)}% RSVP response rate (${confirmedGuests} confirmed).`);
  } else {
    rsvpScore = 50;
    notes.push("Guest directory has not been populated.");
  }

  const rsvpPillarStatus =
    rsvpScore >= 75 ? "HEALTHY" : rsvpScore >= 50 ? "WARNING" : "CRITICAL";

  // --- 5. SEATING HEALTH (Weight: 15%) ---
  let seatingScore = 100;
  const attendingGuests = guests.filter(isConfirmed);
  const seatedGuestIds = new Set(assignments.map((a) => a.guest_id));
  const unseatedCount = attendingGuests.filter((g) => !seatedGuestIds.has(g.id)).length;

  if (attendingGuests.length > 0) {
    const seatedRatio = (attendingGuests.length - unseatedCount) / attendingGuests.length;
    seatingScore = Math.round(seatedRatio * 100);

    // Check table capacity overflows
    const tableAssignedCounts: Record<string, number> = {};
    for (const a of assignments) {
      tableAssignedCounts[a.table_id] = (tableAssignedCounts[a.table_id] || 0) + 1;
    }
    const overflowTables = tables.filter(
      (t) => (tableAssignedCounts[t.id] || 0) > t.capacity
    );
    if (overflowTables.length > 0) {
      seatingScore = Math.max(0, seatingScore - overflowTables.length * 20);
      notes.push(`${overflowTables.length} table(s) exceed maximum seating capacity.`);
    }

    if (unseatedCount > 0) {
      notes.push(`${unseatedCount} confirmed guest(s) need table assignments.`);
    }
  } else {
    seatingScore = 100;
  }

  const seatingPillarStatus =
    seatingScore >= 80 ? "HEALTHY" : seatingScore >= 50 ? "WARNING" : "CRITICAL";

  // --- OVERALL AGGREGATION ---
  const weightedTotal =
    budgetScore * 0.25 +
    taskScore * 0.25 +
    vendorScore * 0.20 +
    rsvpScore * 0.15 +
    seatingScore * 0.15;

  const overallScore = Math.round(weightedTotal);

  const status =
    overallScore >= 80 ? "ON_TRACK" : overallScore >= 55 ? "ATTENTION_NEEDED" : "AT_RISK";

  return {
    overallScore,
    status,
    pillars: {
      budget: {
        score: budgetScore,
        weight: 0.25,
        weightedScore: Math.round(budgetScore * 0.25),
        status: budgetPillarStatus,
        details: `Spent/Allocated ${totalAllocated} of ${targetBudget}`,
      },
      tasks: {
        score: taskScore,
        weight: 0.25,
        weightedScore: Math.round(taskScore * 0.25),
        status: taskPillarStatus,
        details: `${completedTasks}/${totalTasks} completed, ${overdueTasks.length} overdue`,
      },
      vendors: {
        score: vendorScore,
        weight: 0.20,
        weightedScore: Math.round(vendorScore * 0.2),
        status: vendorPillarStatus,
        details: `${bookedVendors.length}/${vendors.length} vendors booked`,
      },
      rsvp: {
        score: rsvpScore,
        weight: 0.15,
        weightedScore: Math.round(rsvpScore * 0.15),
        status: rsvpPillarStatus,
        details: `${responded}/${totalGuests} responses collected`,
      },
      seating: {
        score: seatingScore,
        weight: 0.15,
        weightedScore: Math.round(seatingScore * 0.15),
        status: seatingPillarStatus,
        details: `${unseatedCount} attending guests unseated`,
      },
    },
    breakdownNotes: notes,
    calculatedAt: referenceDate,
  };
}

export function generateProactiveInsights(input: ReadinessCalculationInput): EventInsight[] {
  const {
    event,
    budgetLineItems,
    tasks,
    quotations,
    guests,
    tables,
    assignments,
    referenceDate = new Date().toISOString(),
  } = input;

  const insights: EventInsight[] = [];
  const refDateObj = new Date(referenceDate);

  // 1. Overdue tasks insight
  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.due_date && new Date(t.due_date) < refDateObj
  );
  if (overdueTasks.length > 0) {
    insights.push({
      id: `ins-task-${Date.now()}-1`,
      event_id: event.id,
      category: "TIMELINE_BOTTLENECK",
      severity: overdueTasks.length > 2 ? "CRITICAL" : "WARNING",
      title: `${overdueTasks.length} Overdue Task${overdueTasks.length > 1 ? "s" : ""}`,
      description: `Tasks including "${overdueTasks[0].title}" have passed their target dates without completion.`,
      evidence_data: {
        overdueCount: overdueTasks.length,
        taskNames: overdueTasks.map((t) => t.title),
      },
      recommended_action: "Review timeline dependencies and re-sequence deadlines.",
      action_href: `/events/${event.id}/timeline`,
      action_label: "View Timeline",
      created_at: referenceDate,
    });
  }

  // 2. Unseated Guests
  const attendingGuests = guests.filter(
    (g: any) => g.rsvp_status === "CONFIRMED" || g.rsvp_status === "ATTENDING"
  );
  const seatedGuestIds = new Set(assignments.map((a) => a.guest_id));
  const unseatedGuests = attendingGuests.filter((g) => !seatedGuestIds.has(g.id));
  if (unseatedGuests.length > 0) {
    const wheelchairUnseated = unseatedGuests.filter((g) =>
      g.accessibility_needs?.includes("WHEELCHAIR")
    );
    insights.push({
      id: `ins-seat-${Date.now()}-2`,
      event_id: event.id,
      category: "SEATING_ISSUE",
      severity: wheelchairUnseated.length > 0 ? "CRITICAL" : "WARNING",
      title: `${unseatedGuests.length} Confirmed Guest${unseatedGuests.length > 1 ? "s" : ""} Unassigned`,
      description: wheelchairUnseated.length > 0
        ? `${unseatedGuests.length} confirmed guests lack seating, including ${wheelchairUnseated.length} with wheelchair accessibility requirements.`
        : `${unseatedGuests.length} guests confirmed attending are waiting for table assignments.`,
      evidence_data: {
        unseatedCount: unseatedGuests.length,
        wheelchairCount: wheelchairUnseated.length,
      },
      recommended_action: "Run intelligent auto-seat or assign tables in Seating Planner.",
      action_href: `/events/${event.id}/seating`,
      action_label: "Open Seating Planner",
      created_at: referenceDate,
    });
  }

  // 3. Pending Vendor Quotations
  const pendingQuotes = quotations.filter(
    (q: any) => q.status === "PENDING_REVIEW" || q.status === "UNDER_REVIEW" || q.status === "RECEIVED"
  );
  if (pendingQuotes.length > 0) {
    insights.push({
      id: `ins-quote-${Date.now()}-3`,
      event_id: event.id,
      category: "VENDOR_GAP",
      severity: "INFO",
      title: `${pendingQuotes.length} Vendor Quotation${pendingQuotes.length > 1 ? "s" : ""} Pending Review`,
      description: `You have submitted quotations awaiting comparison and acceptance.`,
      evidence_data: {
        pendingCount: pendingQuotes.length,
      },
      recommended_action: "Compare side-by-side and accept the preferred quotation.",
      action_href: `/events/${event.id}/vendors`,
      action_label: "Compare Quotes",
      created_at: referenceDate,
    });
  }

  // 4. Budget Variance Check
  const effectiveTarget = event.target_budget || event.total_budget || 0;
  const totalAllocated = budgetLineItems.reduce(
    (sum, item: any) => sum + (item.planned_amount ?? item.actual_amount ?? item.estimated_amount ?? 0),
    0
  );
  if (effectiveTarget > 0 && totalAllocated > effectiveTarget) {
    const diff = totalAllocated - effectiveTarget;
    insights.push({
      id: `ins-budget-${Date.now()}-4`,
      event_id: event.id,
      category: "BUDGET_RISK",
      severity: "CRITICAL",
      title: "Allocated Spend Exceeds Target Budget",
      description: `Planned expenses are higher than the defined target budget.`,
      evidence_data: {
        targetBudget: event.total_budget,
        allocated: totalAllocated,
        overage: diff,
      },
      recommended_action: "Simulate savings scenarios in the Adaptive Budget Simulator.",
      action_href: `/events/${event.id}/simulator`,
      action_label: "Open Simulator",
      created_at: referenceDate,
    });
  }

  return insights;
}
