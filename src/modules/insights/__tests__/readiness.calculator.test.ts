import { describe, it, expect } from "vitest";
import {
  calculateReadinessScore,
  generateProactiveInsights,
} from "../domain/readiness.calculator";
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

describe("Module 12: Readiness Score Engine", () => {
  const baseEvent: SeedEvent = {
    id: "evt-test-1",
    user_id: "usr-1",
    title: "Test Gala",
    event_type: "ANNIVERSARY",
    event_date: "2026-12-01",
    location: "Grand Ballroom, Mumbai",
    start_date: "2026-12-01T18:00:00Z",
    end_date: "2026-12-01T23:00:00Z",
    guest_count: 50,
    target_budget: 10000000, // 100,000 INR
    total_budget: 10000000,
    currency: "INR",
    preferences: {
      theme: "Classic",
      mustHaves: [],
      priorities: {},
      dietary: [],
      accessibility: [],
    },
    status: "planning",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };

  const sampleBudget: SeedBudgetLineItem[] = [
    {
      id: "b1",
      event_id: "evt-test-1",
      category_id: "cat-1",
      category: "VENUE",
      name: "Grand Ballroom",
      title: "Grand Ballroom",
      cost_type: "FIXED",
      planned_amount: 5000000,
      status: "COMMITTED",
      per_guest_unit_cost: null,
      estimated_amount: 5000000,
      actual_amount: 5000000,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  const sampleTasks: SeedTask[] = [
    {
      id: "t1",
      event_id: "evt-test-1",
      title: "Confirm Venue Booking",
      status: "COMPLETED",
      priority: "HIGH",
      phase: "CONTRACTING",
      due_date: "2026-06-01",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
    {
      id: "t2",
      event_id: "evt-test-1",
      title: "Send Menu Cards",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      phase: "LOGISTICS",
      due_date: "2026-11-01",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  const sampleVendors: SeedVendor[] = [
    {
      id: "v1",
      event_id: "evt-test-1",
      name: "The Royal Ballroom",
      category: "VENUE",
      status: "BOOKED",
      contact_person: "Manager",
      email: "ballroom@example.com",
      phone: "+91 99999 99999",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  const sampleGuests: SeedGuest[] = [
    {
      id: "g1",
      event_id: "evt-test-1",
      first_name: "Rahul",
      last_name: "Sharma",
      email: "rahul@example.com",
      rsvp_status: "ATTENDING",
      invitation_status: "SENT",
      plus_one_allowed: true,
      plus_ones_count: 0,
      dietary_restrictions: [],
      accessibility_needs: [],
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
    {
      id: "g2",
      event_id: "evt-test-1",
      first_name: "Pooja",
      last_name: "Sharma",
      email: "pooja@example.com",
      rsvp_status: "DECLINED",
      invitation_status: "SENT",
      plus_one_allowed: false,
      plus_ones_count: 0,
      dietary_restrictions: [],
      accessibility_needs: [],
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  const sampleTables: SeedSeatingTable[] = [
    {
      id: "tbl-1",
      event_id: "evt-test-1",
      name: "Table 1",
      shape: "ROUND",
      capacity: 8,
      is_accessible: true,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    },
  ];

  const sampleAssignments: SeedSeatingAssignment[] = [
    {
      id: "asg-1",
      event_id: "evt-test-1",
      table_id: "tbl-1",
      guest_id: "g1",
      assigned_at: "2026-01-01",
    },
  ];

  it("calculates a high readiness score when healthy and on track", () => {
    const result = calculateReadinessScore({
      event: baseEvent,
      budgetLineItems: sampleBudget,
      tasks: sampleTasks,
      vendors: sampleVendors,
      quotations: [],
      guests: sampleGuests,
      tables: sampleTables,
      assignments: sampleAssignments,
      referenceDate: "2026-07-01T00:00:00Z",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(80);
    expect(result.status).toBe("ON_TRACK");
    expect(result.pillars.budget.status).toBe("HEALTHY");
    expect(result.pillars.seating.score).toBe(100); // 1 attending guest, 1 seated
  });

  it("penalizes task score when tasks are overdue", () => {
    const overdueTask: SeedTask = {
      id: "t-overdue",
      event_id: "evt-test-1",
      title: "Overdue Catering Contract",
      status: "TODO",
      priority: "CRITICAL",
      phase: "CONTRACTING",
      due_date: "2026-05-01",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };

    const result = calculateReadinessScore({
      event: baseEvent,
      budgetLineItems: sampleBudget,
      tasks: [...sampleTasks, overdueTask],
      vendors: sampleVendors,
      quotations: [],
      guests: sampleGuests,
      tables: sampleTables,
      assignments: sampleAssignments,
      referenceDate: "2026-07-01T00:00:00Z",
    });

    expect(result.pillars.tasks.score).toBeLessThan(80);
    expect(result.breakdownNotes.some((n) => n.includes("overdue"))).toBe(true);
  });

  it("generates proactive insights for unassigned guests and overdue tasks", () => {
    const unseatedGuest: SeedGuest = {
      id: "g-unseated",
      event_id: "evt-test-1",
      first_name: "Anita",
      last_name: "Roy",
      rsvp_status: "ATTENDING",
      invitation_status: "SENT",
      plus_one_allowed: false,
      plus_ones_count: 0,
      dietary_restrictions: [],
      accessibility_needs: ["WHEELCHAIR"],
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };

    const overdueTask: SeedTask = {
      id: "t-overdue",
      event_id: "evt-test-1",
      title: "Late Payment",
      status: "NOT_STARTED",
      priority: "CRITICAL",
      phase: "CONTRACTING",
      due_date: "2026-05-01",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };

    const insights = generateProactiveInsights({
      event: baseEvent,
      budgetLineItems: sampleBudget,
      tasks: [overdueTask],
      vendors: sampleVendors,
      quotations: [],
      guests: [...sampleGuests, unseatedGuest],
      tables: sampleTables,
      assignments: sampleAssignments,
      referenceDate: "2026-07-01T00:00:00Z",
    });

    expect(insights.length).toBeGreaterThanOrEqual(2);
    const seatingInsight = insights.find((i) => i.category === "SEATING_ISSUE");
    expect(seatingInsight).toBeDefined();
    expect(seatingInsight?.severity).toBe("CRITICAL"); // because wheelchair guest is unseated
    expect(seatingInsight?.action_href).toBe("/events/evt-test-1/seating");
  });
});
