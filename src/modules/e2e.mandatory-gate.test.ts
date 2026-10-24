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

    // -------------------------------------------------------------
    // STEP 9: Module 07 - Vendor Quotation Acceptance & Budget Coupling
    // -------------------------------------------------------------
    const vendor = repository.createVendor({
      event_id: eventId,
      name: "Heritage Royal Caterers",
      category: "CATERING",
      contact_person: "Vikram Mehta",
      email: "vikram@heritageroyal.com",
      phone: "+91 98765 43210",
      status: "CONTACTED",
    });

    const quotation = repository.createQuotation({
      vendor_id: vendor.id,
      event_id: eventId,
      quote_reference: "Q-HR-2026",
      amount_minor: 22000000, // ₹2,20,000 (minor units)
      currency: "INR",
      valid_until: "2026-11-01",
      deposit_required_minor: 4400000,
      inclusions: ["3 Course Buffet", "Welcome Drinks", "Live Chaat Station"],
      exclusions: ["Imported Wine"],
      status: "UNDER_REVIEW",
      line_items: [
        { description: "Dinner Buffet (200 guests)", amount_minor: 18000000, is_mandatory: true },
        { description: "Live Counter Staffing", amount_minor: 4000000, is_mandatory: true },
      ],
    });

    // Accept quotation with direct link to budget
    const acceptRes = repository.acceptQuotation(quotation.id);
    expect(acceptRes.success).toBe(true);
    const acceptedQuote = repository.getQuotationById(quotation.id);
    expect(acceptedQuote?.status).toBe("ACCEPTED");

    // Verify line item was updated
    const updatedLineItems = repository.getLineItemsByEventId(eventId);
    expect(updatedLineItems.some((li) => li.planned_amount === 22000000)).toBe(true);

    // -------------------------------------------------------------
    // STEP 10: Module 08 - Event-Day Run Sheet & Cascading Delay
    // -------------------------------------------------------------
    const cue1 = repository.createRunSheetItem({
      event_id: eventId,
      title: "Groom Baraat Arrival",
      scheduled_start_time: "17:00",
      scheduled_end_time: "18:00",
      sequence_order: 1,
      category: "CEREMONY",
      responsible_person: "Lead Coordinator",
      location: "Main Entrance",
      status: "COMPLETED",
    });

    const cue2 = repository.createRunSheetItem({
      event_id: eventId,
      title: "Varmala Stage Ceremony",
      scheduled_start_time: "18:00",
      scheduled_end_time: "18:45",
      sequence_order: 2,
      category: "CEREMONY",
      responsible_person: "Stage Manager",
      location: "Grand Mandap",
      status: "IN_PROGRESS",
    });
    expect(cue1.id).toBeDefined();
    expect(cue2.id).toBeDefined();

    // -------------------------------------------------------------
    // STEP 11: Module 09 - Guest Management & Dietary Restrictions
    // -------------------------------------------------------------
    const guest1 = repository.createGuest({
      event_id: eventId,
      first_name: "Aadhav",
      last_name: "Kumar",
      email: "aadhav@example.com",
      rsvp_status: "ATTENDING",
      invitation_status: "SENT",
      plus_one_allowed: true,
      plus_ones_count: 1,
      dietary_restrictions: ["VEGETARIAN", "JAIN"],
      accessibility_needs: ["WHEELCHAIR"],
    });

    const guest2 = repository.createGuest({
      event_id: eventId,
      first_name: "Simran",
      last_name: "Kaur",
      email: "simran@example.com",
      rsvp_status: "ATTENDING",
      invitation_status: "SENT",
      plus_one_allowed: false,
      plus_ones_count: 0,
      dietary_restrictions: ["GLUTEN_FREE"],
      accessibility_needs: [],
    });
    expect(guest1.id).toBeDefined();
    expect(guest2.id).toBeDefined();

    // -------------------------------------------------------------
    // STEP 12: Module 10 - Seating Planner & Floor Plan Capacity
    // -------------------------------------------------------------
    const table1 = repository.createSeatingTable({
      event_id: eventId,
      name: "Table 1 (VIP Front)",
      shape: "ROUND",
      capacity: 8,
      location_zone: "Main Hall",
      accessibility_friendly: true,
      is_accessible: true,
    });

    const asg1 = repository.assignGuestToTable(table1.id, guest1.id);
    const asg2 = repository.assignGuestToTable(table1.id, guest2.id);
    expect(asg1.success).toBe(true);
    expect(asg2.success).toBe(true);

    // -------------------------------------------------------------
    // STEP 13: Module 11 - Invitations & Token Interpolation
    // -------------------------------------------------------------
    const invDesign = repository.saveInvitationDesign({
      event_id: eventId,
      title: "Royal Heritage Wedding Invitation",
      template_id: "ELEGANT_WEDDING",
      headline: "Celebrate with Priya & Rohan",
      body_text: "Join us for an unforgettable evening at {{venue}} on {{date}}.",
      venue_name: "Taj West End, Bangalore",
      venue_address: "Race Course Rd, High Grounds, Bengaluru",
      date_time_display: "November 6, 2026 at 5:00 PM",
      primary_color: "#1E1B4B",
      accent_color: "#D97706",
    });
    expect(invDesign.template_id).toBe("ELEGANT_WEDDING");

    // -------------------------------------------------------------
    // STEP 14: Module 12 - AI Event Insights & 5-Pillar Readiness Score
    // -------------------------------------------------------------
    const { calculateReadinessScore } = await import("@/modules/insights/domain/readiness.calculator");
    const readiness = calculateReadinessScore({
      event: repository.getEventById(eventId)!,
      budgetLineItems: repository.getBudgetLineItemsByEventId(eventId),
      tasks: repository.getTasksByEventId(eventId),
      vendors: repository.getVendorsByEventId(eventId),
      quotations: repository.getQuotationsByEventId(eventId),
      guests: repository.getGuestsByEventId(eventId),
      tables: repository.getSeatingTablesByEventId(eventId),
      assignments: repository.getSeatingAssignmentsByEventId(eventId),
    });
    expect(readiness.overallScore).toBeGreaterThanOrEqual(0);
    expect(readiness.overallScore).toBeLessThanOrEqual(100);
    expect(readiness.pillars.budget).toBeDefined();
    expect(readiness.pillars.tasks).toBeDefined();
    expect(readiness.pillars.vendors).toBeDefined();
    expect(readiness.pillars.rsvp).toBeDefined();
    expect(readiness.pillars.seating).toBeDefined();

    // -------------------------------------------------------------
    // STEP 15: Module 13 - Notifications & Automation Rules
    // -------------------------------------------------------------
    const notif = repository.createNotification({
      event_id: eventId,
      title: "Quotation Accepted & Committed",
      message: "Heritage Royal Caterers quotation has been committed to the event budget.",
      category: "VENDOR",
      priority: "MEDIUM",
      read: false,
      action_url: `/events/${eventId}/vendors`,
    });
    expect(notif.id).toBeDefined();
    const eventNotifs = repository.getNotificationsByEventId(eventId);
    expect(eventNotifs.length).toBeGreaterThan(0);

    // -------------------------------------------------------------
    // STEP 16: Module 14 - Reports & RFC-4180 CSV Serialization
    // -------------------------------------------------------------
    const { getReportSnapshotAction, exportReportCsvAction } = await import(
      "@/modules/reports/server/report.actions"
    );
    const reportSnapshot = await getReportSnapshotAction(eventId, "GUEST_DIETARY_ROSTER");
    expect(reportSnapshot).not.toBeNull();
    expect(reportSnapshot?.columns).toContain("Dietary Needs");
    expect(reportSnapshot?.rows.length).toBeGreaterThanOrEqual(2);

    const csvRes = await exportReportCsvAction(eventId, "GUEST_DIETARY_ROSTER");
    expect(csvRes.success).toBe(true);
    expect(csvRes.csvString).toContain("VEGETARIAN, JAIN");

    // -------------------------------------------------------------
    // STEP 17: Module 15 - System Self-Test Diagnostic & Backup
    // -------------------------------------------------------------
    const { runSystemDiagnosticAction, exportEventBackupAction } = await import(
      "@/modules/settings/server/settings.actions"
    );
    const diagReport = await runSystemDiagnosticAction(eventId);
    expect(diagReport).not.toBeNull();
    expect(diagReport?.relationalIntegrity.passed).toBe(true);
    expect(diagReport?.relationalIntegrity.orphanedRecordsCount).toBe(0);

    const backupRes = await exportEventBackupAction(eventId);
    if (!backupRes.success) {
      console.error("Backup export error:", backupRes.error);
    }
    expect(backupRes.success).toBe(true);
    expect(backupRes.jsonString).toContain("Heritage Royal Caterers");
    expect(backupRes.jsonString).toContain("Aadhav");

  });
});
