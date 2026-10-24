"use server";

import { db } from "@/shared/db/storage";
import { safeRevalidatePath } from "@/shared/utils/cache";
import {
  EventSettingsFormData,
  EventSettingsFormSchema,
  DiagnosticReport,
} from "../domain/settings.schema";
import { runDiagnosticChecks } from "../domain/diagnostic.runner";
import { SeedEventSettings, SeedAuditLog } from "@/shared/db/seed-data";

export async function getEventSettingsAction(eventId: string): Promise<SeedEventSettings | null> {
  return db.getEventSettings(eventId);
}

export async function updateEventSettingsAction(
  eventId: string,
  data: EventSettingsFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = EventSettingsFormSchema.parse(data);

    db.saveEventSettings({
      event_id: eventId,
      currency: validated.currency,
      timezone: validated.timezone,
      default_catering_budget_per_guest: validated.default_catering_budget_per_guest,
      notifications_enabled: validated.notifications_enabled,
      ai_features_enabled: validated.ai_features_enabled,
      privacy_mode: validated.privacy_mode,
      updated_at: new Date().toISOString(),
    });

    // Record audit log
    db.createAuditLog({
      event_id: eventId,
      action: "UPDATE_SETTINGS",
      entity_type: "EVENT_SETTINGS",
      entity_id: eventId,
      actor: "Organizer",
      details: `Saved currency=${validated.currency}, timezone=${validated.timezone}`,
    });

    safeRevalidatePath(`/events/${eventId}`);
    safeRevalidatePath(`/events/${eventId}/settings`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to save settings." };
  }
}

export async function resetSampleEventAction(
  eventId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    db.resetSampleEvent(eventId);

    db.createAuditLog({
      event_id: eventId,
      action: "RESET_TO_BENCHMARK",
      entity_type: "EVENT",
      entity_id: eventId,
      actor: "Evaluator / Demo Toolkit",
      details: "Restored all 15 modules to pristine competition seed benchmark.",
    });

    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reset sample event." };
  }
}

export async function runSystemDiagnosticAction(
  eventId: string
): Promise<DiagnosticReport | null> {
  const start = performance.now();
  const event = db.getEventById(eventId);
  if (!event) return null;

  const categories = db.getBudgetCategoriesByEventId(eventId);
  const lineItems = db.getBudgetLineItemsByEventId(eventId);
  const tasks = db.getTasksByEventId(eventId);
  const vendors = db.getVendorsByEventId(eventId);
  const quotations = db.getQuotationsByEventId(eventId);
  const guests = db.getGuestsByEventId(eventId);
  const tables = db.getSeatingTablesByEventId(eventId);
  const assignments = db.getSeatingAssignmentsByEventId(eventId);
  const runSheetItems = db.getRunSheetItemsByEventId(eventId);
  const notifications = db.getNotificationsByEventId(eventId);

  const duration = Math.round((performance.now() - start) * 10) / 10;
  const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);

  return runDiagnosticChecks({
    event,
    categories,
    lineItems,
    tasks,
    vendors,
    quotations,
    guests,
    tables,
    assignments,
    runSheetItems,
    notifications,
    isGeminiConfigured,
    latencyMs: Math.max(0.8, duration),
  });
}

export async function exportEventBackupAction(
  eventId: string
): Promise<{ success: boolean; jsonString?: string; filename?: string; error?: string }> {
  try {
    const event = db.getEventById(eventId);
    if (!event) return { success: false, error: "Event not found" };

    const backup = {
      version: "2.0.0",
      exportedAt: new Date().toISOString(),
      event,
      categories: db.getBudgetCategoriesByEventId(eventId),
      budgetLineItems: db.getBudgetLineItemsByEventId(eventId),
      tasks: db.getTasksByEventId(eventId),
      taskDependencies: db.getTaskDependenciesByEventId(eventId),
      vendors: db.getVendorsByEventId(eventId),
      quotations: db.getQuotationsByEventId(eventId),
      runSheetItems: db.getRunSheetItemsByEventId(eventId),
      runSheetIncidents: db.getRunSheetIncidentsByEventId(eventId),
      householdGroups: db.getHouseholdGroupsByEventId(eventId),
      guests: db.getGuestsByEventId(eventId),
      seatingTables: db.getSeatingTablesByEventId(eventId),
      seatingAssignments: db.getSeatingAssignmentsByEventId(eventId),
      invitationDesign: db.getInvitationDesignByEventId(eventId),
      communicationLogs: db.getCommunicationLogsByEventId(eventId),
      insights: db.getEventInsightsByEventId(eventId),
      notifications: db.getNotificationsByEventId(eventId),
      settings: db.getEventSettings(eventId),
      auditLogs: db.getAuditLogsByEventId(eventId),
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const filename = `quveta_${event.id}_backup_${new Date().toISOString().slice(0, 10)}.json`;

    return { success: true, jsonString, filename };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to export JSON backup." };
  }
}
