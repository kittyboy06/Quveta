"use server";

import { db } from "@/shared/db/storage";
import { safeRevalidatePath } from "@/shared/utils/cache";
import {
  VendorFormSchema,
  QuotationFormSchema,
  VendorFormData,
  QuotationFormData,
  VendorStatus,
} from "../domain/vendor.schema";
import { compareQuotations, QuotationComparisonResult } from "../domain/quote.comparator";

export async function createVendorAction(
  eventId: string,
  data: VendorFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = VendorFormSchema.parse(data);
    db.createVendor({
      event_id: eventId,
      name: validated.name.trim(),
      category: validated.category,
      contact_person: validated.contact_person.trim(),
      email: validated.email.trim(),
      phone: validated.phone.trim(),
      website: validated.website || undefined,
      address: validated.address?.trim() || undefined,
      status: validated.status,
      notes: validated.notes?.trim() || undefined,
    });

    safeRevalidatePath(`/events/${eventId}/vendors`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create vendor." };
  }
}

export async function updateVendorStatusAction(
  eventId: string,
  vendorId: string,
  status: VendorStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = db.updateVendor(vendorId, { status });
    if (!updated) return { success: false, error: "Vendor not found." };

    safeRevalidatePath(`/events/${eventId}/vendors`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update vendor status." };
  }
}

export async function createQuotationAction(
  eventId: string,
  data: QuotationFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = QuotationFormSchema.parse(data);
    db.createQuotation({
      vendor_id: validated.vendor_id,
      event_id: eventId,
      quote_reference: validated.quote_reference.trim(),
      amount_minor: validated.amount_minor,
      currency: validated.currency,
      status: "RECEIVED",
      valid_until: validated.valid_until,
      line_items: validated.line_items,
      inclusions: validated.inclusions,
      exclusions: validated.exclusions,
      payment_terms: validated.payment_terms?.trim() || undefined,
      deposit_required_minor: validated.deposit_required_minor,
      notes: validated.notes?.trim() || undefined,
    });

    // Update vendor status to QUOTED if still RESEARCHING or CONTACTED
    const vendor = db.getVendorById(validated.vendor_id);
    if (vendor && (vendor.status === "RESEARCHING" || vendor.status === "CONTACTED")) {
      db.updateVendor(vendor.id, { status: "QUOTED" });
    }

    safeRevalidatePath(`/events/${eventId}/vendors`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create quotation." };
  }
}

export async function acceptQuotationAction(
  eventId: string,
  quotationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = db.acceptQuotation(quotationId);
    if (!result.success) return { success: false, error: "Failed to accept quotation." };

    safeRevalidatePath(`/events/${eventId}/vendors`);
    safeRevalidatePath(`/events/${eventId}/budget`);
    safeRevalidatePath(`/events/${eventId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process quotation acceptance." };
  }
}

export async function deleteVendorAction(
  eventId: string,
  vendorId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    db.deleteVendor(vendorId);
    safeRevalidatePath(`/events/${eventId}/vendors`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete vendor." };
  }
}

export async function compareQuotationsAction(
  eventId: string,
  quoteIds: string[]
): Promise<QuotationComparisonResult> {
  const allQuotes = db.getQuotationsByEventId(eventId);
  const selectedQuotes = allQuotes.filter((q) => quoteIds.includes(q.id));
  const vendors = db.getVendorsByEventId(eventId);
  const event = db.getEventById(eventId);
  const guestCount = event?.guest_count || 100;

  return compareQuotations(selectedQuotes, vendors, guestCount);
}
