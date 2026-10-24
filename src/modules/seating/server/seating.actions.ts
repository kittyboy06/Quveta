"use server";

import { db } from "@/shared/db/storage";
import { safeRevalidatePath } from "@/shared/utils/cache";
import { TableFormSchema, TableFormData } from "../domain/seating.schema";
import { autoSuggestSeatingAssignments } from "../domain/seating.engine";

export async function createTableAction(
  eventId: string,
  data: TableFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = TableFormSchema.parse(data);
    db.createSeatingTable({
      event_id: eventId,
      name: validated.name.trim(),
      shape: validated.shape,
      capacity: validated.capacity,
      location_zone: validated.location_zone,
      accessibility_friendly: validated.accessibility_friendly,
      notes: validated.notes?.trim() || undefined,
    });

    safeRevalidatePath(`/events/${eventId}/seating`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create table." };
  }
}

export async function assignGuestToTableAction(
  eventId: string,
  tableId: string,
  guestId: string,
  seatNumber?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = db.assignGuestToTable(tableId, guestId, seatNumber);
    if (!res.success) {
      return { success: false, error: res.error || "Failed to assign guest to seat." };
    }

    safeRevalidatePath(`/events/${eventId}/seating`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process seat assignment." };
  }
}

export async function unassignGuestAction(
  eventId: string,
  guestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    db.unassignGuest(guestId);
    safeRevalidatePath(`/events/${eventId}/seating`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to unseat guest." };
  }
}

export async function autoAssignGuestsAction(
  eventId: string
): Promise<{ success: boolean; assignedCount?: number; error?: string }> {
  try {
    const tables = db.getSeatingTablesByEventId(eventId);
    const guests = db.getGuestsByEventId(eventId);
    const assignments = db.getSeatingAssignmentsByEventId(eventId);

    const suggestions = autoSuggestSeatingAssignments(tables, guests, assignments);

    let count = 0;
    for (const s of suggestions) {
      const res = db.assignGuestToTable(s.tableId, s.guestId);
      if (res.success) count++;
    }

    safeRevalidatePath(`/events/${eventId}/seating`);
    return { success: true, assignedCount: count };
  } catch (err: any) {
    return { success: false, error: err.message || "Auto-assignment failed." };
  }
}

export async function deleteTableAction(
  eventId: string,
  tableId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    db.deleteSeatingTable(tableId);
    safeRevalidatePath(`/events/${eventId}/seating`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete table." };
  }
}
