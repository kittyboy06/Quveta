"use server";

import { safeRevalidatePath } from "@/shared/utils/cache";
import { repository } from "@/shared/db/supabase";
import { fromMajorUnits } from "@/shared/types/money";
import { runSimulatorEngine, recalculateScenarioImpact } from "../domain/simulator.engine";
import { ok, err, Result } from "@/shared/types/result";

export async function runSimulationAction(
  eventId: string,
  data: {
    proposedBudgetMajor: number;
    proposedGuestCount: number;
    revisedPriorities?: Record<string, "MUST_HAVE" | "HIGH" | "FLEXIBLE" | "LOW">;
    customNotes?: string;
  }
): Promise<Result<{ scenarioId: string; initialDeficitMinor: number; recommendationsCount: number }>> {
  try {
    const event = repository.getEventById(eventId);
    if (!event) return err("Event not found");

    const categories = repository.getCategoriesByEventId(eventId);
    const lineItems = repository.getLineItemsByEventId(eventId);

    const proposedBudgetMinor = fromMajorUnits(data.proposedBudgetMajor, event.currency).amount;

    const simulationResult = runSimulatorEngine(
      {
        currentBudgetMinor: event.target_budget,
        currentGuestCount: event.guest_count,
        proposedBudgetMinor,
        proposedGuestCount: data.proposedGuestCount,
        revisedPriorities: data.revisedPriorities,
        customNotes: data.customNotes,
        currency: event.currency,
      },
      categories,
      lineItems
    );

    const created = repository.createScenario(
      {
        event_id: eventId,
        proposed_budget: proposedBudgetMinor,
        proposed_guest_count: data.proposedGuestCount,
        summary: simulationResult.summary,
        status: "DRAFT",
      },
      simulationResult.recommendations.map((r) => ({
        category_id: r.category_id,
        action: r.action,
        current_amount: r.current_amount,
        proposed_amount: r.proposed_amount,
        diff_amount: r.diff_amount,
        trade_off_explanation: r.trade_off_explanation,
        status: r.status,
      }))
    );

    safeRevalidatePath(`/events/${eventId}/simulator`);
    return ok({
      scenarioId: created.scenario.id,
      initialDeficitMinor: simulationResult.initialDeficitMinor,
      recommendationsCount: created.recommendations.length,
    });
  } catch (error: any) {
    console.error("Simulation failed:", error);
    return err(error.message || "Failed to execute simulation.");
  }
}

export async function updateRecommendationStatusAction(
  scenarioId: string,
  recommendationId: string,
  status: "ACCEPTED" | "REJECTED" | "PENDING"
): Promise<Result<{ success: true }>> {
  try {
    const updated = repository.updateRecommendationStatus(recommendationId, status);
    if (!updated) return err("Recommendation not found");

    return ok({ success: true });
  } catch (error: any) {
    console.error("Failed to update recommendation status:", error);
    return err(error.message || "Failed to update recommendation status.");
  }
}

export async function getScenarioDetailsAction(scenarioId: string) {
  const result = repository.getScenarioById(scenarioId);
  if (!result) return null;

  const event = repository.getEventById(result.scenario.event_id);
  const currency = event?.currency || "INR";

  const baselineDeficitMinor = result.recommendations.reduce((acc, r) => {
    // If recommendation is negative diff (saving needed), account for it
    return r.diff_amount < 0 ? acc + Math.abs(r.diff_amount) : acc;
  }, 0);

  const impact = recalculateScenarioImpact(
    baselineDeficitMinor,
    result.recommendations as any,
    result.scenario.proposed_budget,
    currency
  );

  return {
    ...result,
    impact,
    currency,
  };
}

export async function applyApprovedScenarioAction(scenarioId: string): Promise<Result<{ success: true }>> {
  try {
    const success = repository.applyApprovedScenario(scenarioId);
    if (!success) return err("Failed to apply scenario: record not found");

    const scenario = repository.getScenarioById(scenarioId);
    if (scenario) {
      safeRevalidatePath(`/events/${scenario.scenario.event_id}`);
      safeRevalidatePath(`/events/${scenario.scenario.event_id}/budget`);
      safeRevalidatePath(`/events/${scenario.scenario.event_id}/simulator`);
      safeRevalidatePath(`/events/${scenario.scenario.event_id}/timeline`);
      safeRevalidatePath("/");
    }

    return ok({ success: true });
  } catch (error: any) {
    console.error("Failed to apply approved scenario:", error);
    return err(error.message || "Failed to apply scenario changes.");
  }
}
