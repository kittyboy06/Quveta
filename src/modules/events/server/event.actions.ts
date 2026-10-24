"use server";

import { safeRevalidatePath } from "@/shared/utils/cache";
import { repository } from "@/shared/db/supabase";
import { CreateEventSchema, UpdateEventSchema, CreateEventInput, UpdateEventInput } from "../domain/event.schema";
import { fromMajorUnits } from "@/shared/types/money";
import { getDefaultCategoriesForEvent } from "@/modules/budget/domain/category.defaults";
import { ok, err, Result } from "@/shared/types/result";

export async function createEventAction(rawInput: unknown): Promise<Result<{ eventId: string }>> {
  try {
    const parsed = CreateEventSchema.safeParse(rawInput);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      return err(msg);
    }

    const data: CreateEventInput = parsed.data;
    const budgetMinor = fromMajorUnits(data.target_budget, data.currency).amount;

    const newEvent = repository.createEvent({
      title: data.title,
      event_type: data.event_type,
      event_date: data.event_date,
      start_time: data.start_time,
      end_time: data.end_time,
      location: data.location,
      guest_count: data.guest_count,
      target_budget: budgetMinor,
      currency: data.currency,
      preferences: data.preferences,
      status: "planning",
    });

    // Populate default budget categories according to event type
    const defaultCategories = getDefaultCategoriesForEvent(data.event_type, data.target_budget, data.currency);
    for (const cat of defaultCategories) {
      repository.createCategory({
        event_id: newEvent.id,
        name: cat.name,
        priority: cat.priority,
        allocated_amount: cat.allocated_amount,
      });
    }

    safeRevalidatePath("/");
    safeRevalidatePath(`/events/${newEvent.id}`);
    return ok({ eventId: newEvent.id });
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return err(error.message || "An unexpected error occurred while creating the event.");
  }
}

export async function updateEventAction(
  eventId: string,
  rawInput: unknown
): Promise<Result<{ eventId: string; dateChanged: boolean; oldDate?: string; newDate?: string }>> {
  try {
    const existing = repository.getEventById(eventId);
    if (!existing) {
      return err("Event not found");
    }

    const parsed = UpdateEventSchema.safeParse(rawInput);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join(", ");
      return err(msg);
    }

    const data: UpdateEventInput = parsed.data;
    const updates: any = { ...data };

    if (data.target_budget !== undefined) {
      updates.target_budget = fromMajorUnits(data.target_budget, existing.currency).amount;
    }

    const dateChanged = !!(data.event_date && data.event_date !== existing.event_date);
    const oldDate = existing.event_date;
    const newDate = data.event_date;

    repository.updateEvent(eventId, updates);

    safeRevalidatePath("/");
    safeRevalidatePath(`/events/${eventId}`);
    safeRevalidatePath(`/events/${eventId}/timeline`);

    return ok({ eventId, dateChanged, oldDate, newDate });
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return err(error.message || "Failed to update event.");
  }
}

export async function getEventAction(eventId: string) {
  const event = repository.getEventById(eventId);
  return event;
}

export async function listEventsAction() {
  const events = repository.getEvents();
  return events;
}
