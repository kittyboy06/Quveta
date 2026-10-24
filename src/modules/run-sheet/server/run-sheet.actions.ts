"use server";

import { db } from "@/shared/db/storage";
import { safeRevalidatePath } from "@/shared/utils/cache";
import {
  RunSheetItemFormSchema,
  IncidentFormSchema,
  RunSheetItemFormData,
  IncidentFormData,
  RunSheetStatus,
} from "../domain/run-sheet.schema";
import { analyzeScheduleDelay, minutesToTime, timeToMinutes } from "../domain/delay.engine";

export async function createRunSheetItemAction(
  eventId: string,
  data: RunSheetItemFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = RunSheetItemFormSchema.parse(data);
    db.createRunSheetItem({
      event_id: eventId,
      title: validated.title.trim(),
      scheduled_start_time: validated.scheduled_start_time,
      scheduled_end_time: validated.scheduled_end_time,
      category: validated.category,
      location: validated.location?.trim() || undefined,
      responsible_person: validated.responsible_person?.trim() || undefined,
      vendor_id: validated.vendor_id || undefined,
      linked_task_id: validated.linked_task_id || undefined,
      status: validated.status,
      notes: validated.notes?.trim() || undefined,
      sequence_order: validated.sequence_order,
    });

    safeRevalidatePath(`/events/${eventId}/run-sheet`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create run sheet item." };
  }
}

export async function updateRunSheetStatusAction(
  eventId: string,
  itemId: string,
  status: RunSheetStatus,
  actualStartTime?: string,
  actualEndTime?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { status };
    if (actualStartTime) updates.actual_start_time = actualStartTime;
    if (actualEndTime) updates.actual_end_time = actualEndTime;

    // If starting now, record actual start time
    if (status === "IN_PROGRESS" && !actualStartTime) {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      updates.actual_start_time = `${hh}:${mm}`;
    }

    if (status === "COMPLETED" && !actualEndTime) {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      updates.actual_end_time = `${hh}:${mm}`;
    }

    const updated = db.updateRunSheetItem(itemId, updates);
    if (!updated) return { success: false, error: "Run sheet item not found." };

    safeRevalidatePath(`/events/${eventId}/run-sheet`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update item status." };
  }
}

export async function logIncidentAction(
  eventId: string,
  data: IncidentFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = IncidentFormSchema.parse(data);
    const incident = db.createIncident({
      event_id: eventId,
      run_sheet_item_id: validated.run_sheet_item_id || undefined,
      severity: validated.severity,
      description: validated.description.trim(),
      reported_by: validated.reported_by?.trim() || "Stage Manager",
    });

    // If critical incident, trigger urgent notification
    if (validated.severity === "CRITICAL" || validated.severity === "HIGH") {
      db.createNotification({
        event_id: eventId,
        title: `Run Sheet Alert: ${validated.severity} Incident Reported`,
        message: validated.description,
        category: "RUN_SHEET",
        priority: validated.severity === "CRITICAL" ? "URGENT" : "HIGH",
        read: false,
        action_url: `/events/${eventId}/run-sheet`,
      });
    }

    safeRevalidatePath(`/events/${eventId}/run-sheet`);
    safeRevalidatePath(`/events/${eventId}/notifications`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to log incident." };
  }
}

export async function resolveIncidentAction(
  eventId: string,
  incidentId: string,
  resolutionNotes: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resolved = db.resolveIncident(incidentId, resolutionNotes.trim());
    if (!resolved) return { success: false, error: "Incident not found." };

    safeRevalidatePath(`/events/${eventId}/run-sheet`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to resolve incident." };
  }
}

export async function applyScheduleRecoveryAction(
  eventId: string,
  delayedItemId: string,
  delayMinutes: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const items = db.getRunSheetItemsByEventId(eventId);
    const impact = analyzeScheduleDelay(items, delayedItemId, delayMinutes);

    for (const cascaded of impact.cascadedItems) {
      db.updateRunSheetItem(cascaded.id, {
        scheduled_start_time: cascaded.projectedStart,
        scheduled_end_time: cascaded.projectedEnd,
      });
    }

    safeRevalidatePath(`/events/${eventId}/run-sheet`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to apply schedule adjustment." };
  }
}
