"use server";

import { safeRevalidatePath } from "@/shared/utils/cache";
import { repository } from "@/shared/db/supabase";
import { fromMajorUnits } from "@/shared/types/money";
import { calculateBudgetSummary, calculateCategoryBreakdowns } from "../domain/budget.calculator";
import { ok, err, Result } from "@/shared/types/result";

export async function createLineItemAction(
  eventId: string,
  categoryId: string,
  data: {
    title: string;
    planned_amount_major: number;
    cost_type: "FIXED" | "VARIABLE" | "MIXED";
    status: "ESTIMATED" | "QUOTED" | "COMMITTED" | "PAID";
    per_guest_unit_cost_major?: number | null;
    notes?: string;
  }
): Promise<Result<{ id: string }>> {
  try {
    const event = repository.getEventById(eventId);
    if (!event) return err("Event not found");

    if (!data.title || data.title.trim().length < 2) {
      return err("Item title must be at least 2 characters.");
    }
    if (data.planned_amount_major < 0) {
      return err("Planned amount cannot be negative.");
    }

    const plannedAmountMinor = fromMajorUnits(data.planned_amount_major, event.currency).amount;
    const unitCostMinor =
      data.per_guest_unit_cost_major !== undefined && data.per_guest_unit_cost_major !== null
        ? fromMajorUnits(data.per_guest_unit_cost_major, event.currency).amount
        : null;

    const newItem = repository.createLineItem({
      event_id: eventId,
      category_id: categoryId,
      title: data.title.trim(),
      planned_amount: plannedAmountMinor,
      cost_type: data.cost_type,
      status: data.status,
      per_guest_unit_cost: unitCostMinor,
      notes: data.notes?.trim() || undefined,
    });

    safeRevalidatePath(`/events/${eventId}/budget`);
    safeRevalidatePath(`/events/${eventId}`);
    safeRevalidatePath(`/events/${eventId}/simulator`);
    return ok({ id: newItem.id });
  } catch (error: any) {
    console.error("Failed to create line item:", error);
    return err(error.message || "Failed to create line item.");
  }
}

export async function updateLineItemAction(
  eventId: string,
  itemId: string,
  data: {
    title?: string;
    planned_amount_major?: number;
    cost_type?: "FIXED" | "VARIABLE" | "MIXED";
    status?: "ESTIMATED" | "QUOTED" | "COMMITTED" | "PAID";
    per_guest_unit_cost_major?: number | null;
    notes?: string;
  }
): Promise<Result<{ success: true }>> {
  try {
    const event = repository.getEventById(eventId);
    if (!event) return err("Event not found");

    const updates: any = {};
    if (data.title !== undefined) updates.title = data.title.trim();
    if (data.cost_type !== undefined) updates.cost_type = data.cost_type;
    if (data.status !== undefined) updates.status = data.status;
    if (data.notes !== undefined) updates.notes = data.notes.trim();

    if (data.planned_amount_major !== undefined) {
      updates.planned_amount = fromMajorUnits(data.planned_amount_major, event.currency).amount;
    }
    if (data.per_guest_unit_cost_major !== undefined) {
      updates.per_guest_unit_cost =
        data.per_guest_unit_cost_major !== null
          ? fromMajorUnits(data.per_guest_unit_cost_major, event.currency).amount
          : null;
    }

    const updated = repository.updateLineItem(itemId, updates);
    if (!updated) return err("Line item not found");

    safeRevalidatePath(`/events/${eventId}/budget`);
    safeRevalidatePath(`/events/${eventId}`);
    safeRevalidatePath(`/events/${eventId}/simulator`);
    return ok({ success: true });
  } catch (error: any) {
    console.error("Failed to update line item:", error);
    return err(error.message || "Failed to update line item.");
  }
}

export async function deleteLineItemAction(eventId: string, itemId: string): Promise<Result<{ success: true }>> {
  try {
    const deleted = repository.deleteLineItem(itemId);
    if (!deleted) return err("Line item not found or could not be deleted");

    safeRevalidatePath(`/events/${eventId}/budget`);
    safeRevalidatePath(`/events/${eventId}`);
    safeRevalidatePath(`/events/${eventId}/simulator`);
    return ok({ success: true });
  } catch (error: any) {
    console.error("Failed to delete line item:", error);
    return err(error.message || "Failed to delete line item.");
  }
}

export async function getBudgetDetailsAction(eventId: string) {
  const event = repository.getEventById(eventId);
  if (!event) return null;

  const categories = repository.getCategoriesByEventId(eventId);
  const lineItems = repository.getLineItemsByEventId(eventId);

  const summary = calculateBudgetSummary(event.target_budget, lineItems, event.guest_count, event.currency);
  const categoryBreakdowns = calculateCategoryBreakdowns(categories, lineItems, event.currency);

  return {
    event,
    categories,
    lineItems,
    summary,
    categoryBreakdowns,
  };
}
