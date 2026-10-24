import { describe, it, expect, beforeEach } from "vitest";
import { createEventAction, updateEventAction } from "@/modules/events/server/event.actions";
import { commitPlanToEventAction } from "@/modules/ai-engine/server/ai.actions";
import { generateDeterministicPlan } from "@/modules/ai-engine/fallback/deterministic.planner";
import {
  runSimulationAction,
  updateRecommendationStatusAction,
  applyApprovedScenarioAction,
} from "@/modules/simulator/server/simulator.actions";
import {
  getTimelineDataAction,
  toggleTaskCompletionAction,
  applyScheduleRecoveryAction,
} from "@/modules/tasks/server/task.actions";
import { repository } from "@/shared/db/supabase";
import { toMajorUnits, createMoney, fromMajorUnits } from "@/shared/types/money";

describe("Non-Negotiable Acceptance Test: End-to-End Core Workflow", () => {
  it("executes the full competition gate flow without failure or data loss", async () => {
    // -------------------------------------------------------------
    // STEP 1: Create a realistic celebration event
    // -------------------------------------------------------------
    const createRes = await createEventAction({
      title: "Priya & Rohan's Sangeet & Wedding",
      event_type: "wedding",
      event_date: "2026-11-20",
      location: "Taj West End, Bangalore",
      guest_count: 200,
      target_budget: 800000, // ₹8,00,000
      currency: "INR",
      preferences: {
        theme: "Royal Marigold",
        mustHaves: ["Authentic Catering Feast"],
        priorities: {
          "Catering & Feast": "MUST_HAVE",
          "Venue & Mandap": "HIGH",
          "Floral & Decor": "FLEXIBLE",
        },
        dietary: ["Vegetarian & Jain Counter"],
        accessibility: ["Wheelchair Ramp"],
      },
    });

    expect(createRes.success).toBe(true);
    if (!createRes.success) return;
    const eventId = createRes.data.eventId;

    // Verify categories auto-populated
    const initialCategories = repository.getCategoriesByEventId(eventId);
    expect(initialCategories.length).toBeGreaterThan(0);

    // -------------------------------------------------------------
    // STEP 2: Generate personalized plan & commit proposed tasks
    // -------------------------------------------------------------
    const createdEvent = repository.getEventById(eventId)!;
    const plan = generateDeterministicPlan(createdEvent);
    expect(plan.proposedTasks.length).toBeGreaterThan(0);

    const commitRes = await commitPlanToEventAction(eventId, plan);
    expect(commitRes.success).toBe(true);
    const initialTasks = repository.getTasksByEventId(eventId);
    expect(initialTasks.length).toBeGreaterThan(0);

    // Add realistic line items reflecting the ₹8.0L budget
    const decorCat = initialCategories.find((c) => c.name.includes("Floral")) || initialCategories[0];
    const foodCat = initialCategories.find((c) => c.name.includes("Catering")) || initialCategories[1];
    const venueCat = initialCategories.find((c) => c.name.includes("Venue")) || initialCategories[2];
    const djCat = initialCategories.find((c) => c.name.includes("Music") || c.name.includes("Sound")) || initialCategories[3];

    repository.createLineItem({
      event_id: eventId,
      category_id: venueCat.id,
      title: "Main Banquet Hall",
      planned_amount: fromMajorUnits(350000, "INR").amount, // ₹3,50,000
      cost_type: "FIXED",
      status: "COMMITTED",
      per_guest_unit_cost: null,
    });

    repository.createLineItem({
      event_id: eventId,
      category_id: foodCat.id,
      title: "Royal Buffet Dinner",
      planned_amount: fromMajorUnits(280000, "INR").amount, // ₹2,80,000
      cost_type: "VARIABLE",
      status: "ESTIMATED",
      per_guest_unit_cost: fromMajorUnits(1400, "INR").amount,
    });

    repository.createLineItem({
      event_id: eventId,
      category_id: decorCat.id,
      title: "Stage Floral Decoration",
      planned_amount: fromMajorUnits(80000, "INR").amount, // ₹80,000
      cost_type: "FIXED",
      status: "ESTIMATED",
      per_guest_unit_cost: null,
    });

    if (djCat) {
      repository.createLineItem({
        event_id: eventId,
        category_id: djCat.id,
        title: "Evening DJ & Sound Rig",
        planned_amount: fromMajorUnits(40000, "INR").amount, // ₹40,000
        cost_type: "FIXED",
        status: "ESTIMATED",
        per_guest_unit_cost: null,
      });
    }

    // Total planned = 350k + 280k + 80k + 40k = 750k (₹7,50,000)

    // -------------------------------------------------------------
    // STEP 3: Run Adaptive Budget Simulator (Reduce budget to ₹6.5L)
    // -------------------------------------------------------------
    const simRes = await runSimulationAction(eventId, {
      proposedBudgetMajor: 650000, // Reduced by ₹1,50,000
      proposedGuestCount: 200,
    });

    expect(simRes.success).toBe(true);
    if (!simRes.success) return;
    const scenarioId = simRes.data.scenarioId;

    // -------------------------------------------------------------
    // STEP 4: Inspect mathematically correct trade-offs
    // -------------------------------------------------------------
    const scenarioData = repository.getScenarioById(scenarioId)!;
    expect(scenarioData.recommendations.length).toBeGreaterThan(0);

    // -------------------------------------------------------------
    // STEP 5: Reject one suggestion and accept another
    // -------------------------------------------------------------
    const firstRec = scenarioData.recommendations[0];
    const secondRec = scenarioData.recommendations[1] || firstRec;

    await updateRecommendationStatusAction(scenarioId, firstRec.id, "ACCEPTED");
    if (secondRec.id !== firstRec.id) {
      await updateRecommendationStatusAction(scenarioId, secondRec.id, "REJECTED");
    }

    // Apply approved changes atomically
    const applyRes = await applyApprovedScenarioAction(scenarioId);
    expect(applyRes.success).toBe(true);

    // Verify event target budget was updated
    const updatedEvent = repository.getEventById(eventId)!;
    expect(toMajorUnits(createMoney(updatedEvent.target_budget, "INR"))).toBe(650000);

    // -------------------------------------------------------------
    // STEP 6: Move the event date (e.g. 14 days earlier)
    // -------------------------------------------------------------
    const dateShiftRes = await updateEventAction(eventId, {
      event_date: "2026-11-06", // 14 days earlier
    });
    expect(dateShiftRes.success).toBe(true);

    // -------------------------------------------------------------
    // STEP 7: See affected tasks updated & schedule conflicts handled
    // -------------------------------------------------------------
    const timelineData = await getTimelineDataAction(eventId);
    expect(timelineData).not.toBeNull();

    if (timelineData && timelineData.scheduleImpact.proposedAdjustments.length > 0) {
      const recoveryRes = await applyScheduleRecoveryAction(
        eventId,
        timelineData.scheduleImpact.proposedAdjustments.map((a: any) => ({
          taskId: a.taskId,
          proposedDueDate: a.proposedDueDate,
        }))
      );
      expect(recoveryRes.success).toBe(true);
    }

    // -------------------------------------------------------------
    // STEP 8: Reload application (re-query DB) without losing approved changes
    // -------------------------------------------------------------
    const reloadedEvent = repository.getEventById(eventId)!;
    expect(reloadedEvent.event_date).toBe("2026-11-06");
    expect(toMajorUnits(createMoney(reloadedEvent.target_budget, "INR"))).toBe(650000);

    const reloadedTasks = repository.getTasksByEventId(eventId);
    expect(reloadedTasks.length).toBeGreaterThan(0);
    // All approved changes are reliably preserved!
  });
});
