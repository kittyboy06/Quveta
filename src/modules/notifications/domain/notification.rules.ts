import { NotificationItem, NotificationCategory, NotificationPriority } from "./notification.schema";
import {
  SeedEvent,
  SeedBudgetLineItem,
  SeedTask,
  SeedGuest,
  SeedRunSheetItem,
  SeedRunSheetIncident,
} from "@/shared/db/seed-data";

export interface EvaluationInput {
  event: SeedEvent;
  budgetLineItems: SeedBudgetLineItem[];
  tasks: SeedTask[];
  guests: SeedGuest[];
  runSheetItems?: SeedRunSheetItem[];
  incidents?: SeedRunSheetIncident[];
  existingNotifications: NotificationItem[];
  referenceDate?: string;
}

export function evaluateNotificationRules(input: EvaluationInput): NotificationItem[] {
  const {
    event,
    budgetLineItems,
    tasks,
    guests,
    runSheetItems = [],
    incidents = [],
    existingNotifications,
    referenceDate = new Date().toISOString(),
  } = input;

  const refDateObj = new Date(referenceDate);
  const newNotifications: NotificationItem[] = [];

  // Helper to check deduplication
  const alreadyExists = (title: string, category: NotificationCategory) => {
    return (
      existingNotifications.some(
        (n) => n.title.toLowerCase() === title.toLowerCase() && n.category === category
      ) ||
      newNotifications.some(
        (n) => n.title.toLowerCase() === title.toLowerCase() && n.category === category
      )
    );
  };

  // Rule 1: Overdue Tasks
  const overdueTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.due_date && new Date(t.due_date) < refDateObj
  );
  if (overdueTasks.length > 0) {
    const title = `${overdueTasks.length} Task${overdueTasks.length > 1 ? "s" : ""} Overdue`;
    if (!alreadyExists(title, "TASK")) {
      newNotifications.push({
        id: `notif-auto-task-${Date.now()}`,
        event_id: event.id,
        title,
        message: `Task "${overdueTasks[0].title}" ${overdueTasks.length > 1 ? `and ${overdueTasks.length - 1} other(s)` : ""} are past their target deadlines.`,
        category: "TASK",
        priority: overdueTasks.length > 2 ? "URGENT" : "HIGH",
        read: false,
        action_url: `/events/${event.id}/timeline`,
        created_at: referenceDate,
      });
    }
  }

  // Rule 2: Budget Deficit
  const totalAllocated = budgetLineItems.reduce(
    (sum, item) => sum + (item.actual_amount ?? item.estimated_amount),
    0
  );
  if (event.total_budget > 0 && totalAllocated > event.total_budget) {
    const title = "Budget Overage Detected";
    if (!alreadyExists(title, "BUDGET")) {
      const overage = totalAllocated - event.total_budget;
      newNotifications.push({
        id: `notif-auto-budget-${Date.now()}`,
        event_id: event.id,
        title,
        message: `Current committed allocations exceed your target budget by ${event.currency} ${(overage / 100).toLocaleString()}.`,
        category: "BUDGET",
        priority: "URGENT",
        read: false,
        action_url: `/events/${event.id}/budget`,
        created_at: referenceDate,
      });
    }
  }

  // Rule 3: Unresolved Operational Incidents
  const openIncidents = incidents.filter((inc) => inc.status !== "RESOLVED");
  if (openIncidents.length > 0) {
    const title = `${openIncidents.length} Unresolved Incident${openIncidents.length > 1 ? "s" : ""}`;
    if (!alreadyExists(title, "RUN_SHEET")) {
      newNotifications.push({
        id: `notif-auto-inc-${Date.now()}`,
        event_id: event.id,
        title,
        message: `Active incident logged: "${openIncidents[0].description}". Operational intervention required.`,
        category: "RUN_SHEET",
        priority: openIncidents.some((i) => i.severity === "CRITICAL") ? "URGENT" : "HIGH",
        read: false,
        action_url: `/events/${event.id}/run-sheet`,
        created_at: referenceDate,
      });
    }
  }

  // Rule 4: Run Sheet Delays
  const delayedCues = runSheetItems.filter((rs) => rs.status === "DELAYED");
  if (delayedCues.length > 0) {
    const title = "Schedule Delay on Run Sheet";
    if (!alreadyExists(title, "RUN_SHEET")) {
      newNotifications.push({
        id: `notif-auto-rs-${Date.now()}`,
        event_id: event.id,
        title,
        message: `Activity "${delayedCues[0].title}" is flagged as delayed. Run schedule recovery to prevent downstream cascade.`,
        category: "RUN_SHEET",
        priority: "HIGH",
        read: false,
        action_url: `/events/${event.id}/run-sheet`,
        created_at: referenceDate,
      });
    }
  }

  // Rule 5: Pending RSVPs
  const noResponseGuests = guests.filter((g) => g.rsvp_status === "NO_RESPONSE");
  if (guests.length > 0 && noResponseGuests.length > 0) {
    const pendingPercent = (noResponseGuests.length / guests.length) * 100;
    if (pendingPercent >= 20) {
      const title = `${noResponseGuests.length} Unanswered Invitations`;
      if (!alreadyExists(title, "GUEST")) {
        newNotifications.push({
          id: `notif-auto-guest-${Date.now()}`,
          event_id: event.id,
          title,
          message: `${Math.round(pendingPercent)}% of invited guests have not replied. Send an automated reminder campaign.`,
          category: "GUEST",
          priority: "MEDIUM",
          read: false,
          action_url: `/events/${event.id}/invitations`,
          created_at: referenceDate,
        });
      }
    }
  }

  return newNotifications;
}
