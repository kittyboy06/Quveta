import { describe, it, expect } from "vitest";
import { evaluateNotificationRules } from "../domain/notification.rules";
import { SeedEvent, SeedTask, SeedBudgetLineItem, SeedGuest } from "@/shared/db/seed-data";

describe("Module 13: Notification & Automation Rules Engine", () => {
  const baseEvent: SeedEvent = {
    id: "evt-test-1",
    user_id: "usr-1",
    title: "Leadership Summit",
    event_type: "CORPORATE",
    start_date: "2026-11-20T09:00:00Z",
    end_date: "2026-11-20T17:00:00Z",
    guest_count: 100,
    total_budget: 5000000,
    currency: "INR",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };

  it("triggers task overdue notification when tasks pass deadline", () => {
    const overdueTask: SeedTask = {
      id: "t-1",
      event_id: "evt-test-1",
      title: "Print Name Badges",
      status: "TODO",
      priority: "HIGH",
      phase: "LOGISTICS",
      due_date: "2026-06-01",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };

    const notifs = evaluateNotificationRules({
      event: baseEvent,
      budgetLineItems: [],
      tasks: [overdueTask],
      guests: [],
      existingNotifications: [],
      referenceDate: "2026-07-01T00:00:00Z",
    });

    expect(notifs.some((n) => n.category === "TASK" && n.priority === "HIGH")).toBe(true);
  });

  it("triggers budget overage notification when spend exceeds total budget", () => {
    const lineItem: SeedBudgetLineItem = {
      id: "b-1",
      event_id: "evt-test-1",
      category: "VENUE",
      name: "Summit Center",
      estimated_amount: 6000000, // 60,000 > 50,000 target
      actual_amount: 6000000,
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };

    const notifs = evaluateNotificationRules({
      event: baseEvent,
      budgetLineItems: [lineItem],
      tasks: [],
      guests: [],
      existingNotifications: [],
      referenceDate: "2026-07-01T00:00:00Z",
    });

    const budgetNotif = notifs.find((n) => n.category === "BUDGET");
    expect(budgetNotif).toBeDefined();
    expect(budgetNotif?.priority).toBe("URGENT");
  });

  it("deduplicates alerts and does not trigger duplicate notifications", () => {
    const overdueTask: SeedTask = {
      id: "t-1",
      event_id: "evt-test-1",
      title: "Print Name Badges",
      status: "TODO",
      priority: "HIGH",
      phase: "LOGISTICS",
      due_date: "2026-06-01",
      created_at: "2026-01-01",
      updated_at: "2026-01-01",
    };

    const existing = [
      {
        id: "existing-1",
        event_id: "evt-test-1",
        title: "1 Task Overdue",
        message: "Already notified",
        category: "TASK" as const,
        priority: "HIGH" as const,
        read: false,
        created_at: "2026-06-15",
      },
    ];

    const notifs = evaluateNotificationRules({
      event: baseEvent,
      budgetLineItems: [],
      tasks: [overdueTask],
      guests: [],
      existingNotifications: existing,
      referenceDate: "2026-07-01T00:00:00Z",
    });

    expect(notifs.length).toBe(0);
  });
});
