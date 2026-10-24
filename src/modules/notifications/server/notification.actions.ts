"use server";

import { db } from "@/shared/db/storage";
import { safeRevalidatePath } from "@/shared/utils/cache";
import { evaluateNotificationRules } from "../domain/notification.rules";
import { SeedNotification } from "@/shared/db/seed-data";

export async function getEventNotificationsAction(eventId: string): Promise<SeedNotification[]> {
  return db.getNotificationsByEventId(eventId);
}

export async function markNotificationReadAction(
  notificationId: string,
  eventId: string
): Promise<{ success: boolean }> {
  const success = db.markNotificationRead(notificationId);
  safeRevalidatePath(`/events/${eventId}/notifications`);
  safeRevalidatePath(`/events/${eventId}`);
  return { success };
}

export async function dismissAllNotificationsAction(
  eventId: string
): Promise<{ success: boolean }> {
  const success = db.dismissAllNotifications(eventId);
  safeRevalidatePath(`/events/${eventId}/notifications`);
  safeRevalidatePath(`/events/${eventId}`);
  return { success };
}

export async function triggerAutomationEvaluationAction(
  eventId: string
): Promise<{ success: boolean; newCount: number }> {
  const event = db.getEventById(eventId);
  if (!event) return { success: false, newCount: 0 };

  const budgetLineItems = db.getBudgetLineItemsByEventId(eventId);
  const tasks = db.getTasksByEventId(eventId);
  const guests = db.getGuestsByEventId(eventId);
  const runSheetItems = db.getRunSheetItemsByEventId(eventId);
  const incidents = db.getRunSheetIncidentsByEventId(eventId);
  const existingNotifications = db.getNotificationsByEventId(eventId);

  const newNotifs = evaluateNotificationRules({
    event,
    budgetLineItems,
    tasks,
    guests,
    runSheetItems,
    incidents,
    existingNotifications,
  });

  for (const n of newNotifs) {
    db.createNotification({
      event_id: eventId,
      title: n.title,
      message: n.message,
      category: n.category,
      priority: n.priority,
      read: false,
      action_url: n.action_url,
    });
  }

  safeRevalidatePath(`/events/${eventId}/notifications`);
  safeRevalidatePath(`/events/${eventId}`);
  return { success: true, newCount: newNotifs.length };
}
