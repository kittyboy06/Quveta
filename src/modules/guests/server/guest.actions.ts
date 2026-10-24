"use server";

import { db } from "@/shared/db/storage";
import { safeRevalidatePath } from "@/shared/utils/cache";
import {
  GuestFormSchema,
  HouseholdFormSchema,
  GuestFormData,
  HouseholdFormData,
  RsvpStatus,
} from "../domain/guest.schema";
import { parseGuestsCsv, exportGuestsToCsv } from "../domain/csv.parser";
import { calculateGuestStatistics, GuestStatistics } from "../domain/guest.stats";

export async function createGuestAction(
  eventId: string,
  data: GuestFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = GuestFormSchema.parse(data);
    db.createGuest({
      event_id: eventId,
      first_name: validated.first_name.trim(),
      last_name: validated.last_name.trim(),
      email: validated.email?.trim() || undefined,
      phone: validated.phone?.trim() || undefined,
      household_group_id: validated.household_group_id || undefined,
      invitation_status: validated.invitation_status,
      rsvp_status: validated.rsvp_status,
      plus_one_allowed: validated.plus_one_allowed,
      plus_one_name: validated.plus_one_name?.trim() || undefined,
      dietary_restrictions: validated.dietary_restrictions,
      accessibility_needs: validated.accessibility_needs,
      notes: validated.notes?.trim() || undefined,
    });

    safeRevalidatePath(`/events/${eventId}/guests`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create guest." };
  }
}

export async function updateGuestRsvpAction(
  eventId: string,
  guestId: string,
  rsvpStatus: RsvpStatus,
  plusOneName?: string,
  dietaryRestrictions?: string[],
  accessibilityNeeds?: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { rsvp_status: rsvpStatus };
    if (plusOneName !== undefined) updates.plus_one_name = plusOneName.trim() || undefined;
    if (dietaryRestrictions) updates.dietary_restrictions = dietaryRestrictions;
    if (accessibilityNeeds) updates.accessibility_needs = accessibilityNeeds;

    const updated = db.updateGuest(guestId, updates);
    if (!updated) return { success: false, error: "Guest not found." };

    safeRevalidatePath(`/events/${eventId}/guests`);
    safeRevalidatePath(`/events/${eventId}/seating`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update RSVP status." };
  }
}

export async function importGuestsFromCsvAction(
  eventId: string,
  csvContent: string
): Promise<{ success: boolean; importedCount?: number; errors?: string[] }> {
  try {
    const { guests, errors } = parseGuestsCsv(csvContent);
    if (errors.length > 0 && guests.length === 0) {
      return { success: false, errors };
    }

    const count = db.batchImportGuests(
      eventId,
      guests.map((g) => ({
        ...g,
        invitation_status: "NOT_SENT",
        rsvp_status: "NO_RESPONSE",
      }))
    );

    safeRevalidatePath(`/events/${eventId}/guests`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true, importedCount: count, errors: errors.length > 0 ? errors : undefined };
  } catch (err: any) {
    return { success: false, errors: [err.message || "Failed to parse CSV."] };
  }
}

export async function deleteGuestAction(
  eventId: string,
  guestId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    db.deleteGuest(guestId);
    safeRevalidatePath(`/events/${eventId}/guests`);
    safeRevalidatePath(`/events/${eventId}/seating`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete guest." };
  }
}

export async function getGuestStatsAction(eventId: string): Promise<GuestStatistics> {
  const guests = db.getGuestsByEventId(eventId);
  const event = db.getEventById(eventId);
  const planned = event?.guest_count || 100;
  return calculateGuestStatistics(guests, planned, 140000); // default ₹1,400 per plate in paise
}

export async function exportGuestsCsvStringAction(eventId: string): Promise<string> {
  const guests = db.getGuestsByEventId(eventId);
  return exportGuestsToCsv(guests);
}
