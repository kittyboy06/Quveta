"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/shared/db/storage";
import {
  ReadinessScore,
  EventInsight,
  ChatMessage,
  Citation,
  SuggestedAction,
} from "../domain/insights.schema";
import {
  calculateReadinessScore,
  generateProactiveInsights,
} from "../domain/readiness.calculator";
import { safeRevalidatePath } from "@/shared/utils/cache";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

export async function getReadinessScoreAction(eventId: string): Promise<ReadinessScore | null> {
  const event = db.getEventById(eventId);
  if (!event) return null;

  const budgetLineItems = db.getBudgetLineItemsByEventId(eventId);
  const tasks = db.getTasksByEventId(eventId);
  const vendors = db.getVendorsByEventId(eventId);
  const quotations = db.getQuotationsByEventId(eventId);
  const guests = db.getGuestsByEventId(eventId);
  const tables = db.getSeatingTablesByEventId(eventId);
  const assignments = db.getSeatingAssignmentsByEventId(eventId);

  return calculateReadinessScore({
    event,
    budgetLineItems,
    tasks,
    vendors,
    quotations,
    guests,
    tables,
    assignments,
  });
}

export async function getProactiveInsightsAction(eventId: string): Promise<EventInsight[]> {
  const event = db.getEventById(eventId);
  if (!event) return [];

  const budgetLineItems = db.getBudgetLineItemsByEventId(eventId);
  const tasks = db.getTasksByEventId(eventId);
  const vendors = db.getVendorsByEventId(eventId);
  const quotations = db.getQuotationsByEventId(eventId);
  const guests = db.getGuestsByEventId(eventId);
  const tables = db.getSeatingTablesByEventId(eventId);
  const assignments = db.getSeatingAssignmentsByEventId(eventId);

  const proactive = generateProactiveInsights({
    event,
    budgetLineItems,
    tasks,
    vendors,
    quotations,
    guests,
    tables,
    assignments,
  });

  const stored = db.getEventInsightsByEventId(eventId);
  return [...proactive, ...stored];
}

export async function queryAiDecisionAssistantAction(
  eventId: string,
  query: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  try {
    const event = db.getEventById(eventId);
    if (!event) return { success: false, error: "Event not found" };

    const budgetLineItems = db.getBudgetLineItemsByEventId(eventId);
    const tasks = db.getTasksByEventId(eventId);
    const vendors = db.getVendorsByEventId(eventId);
    const quotations = db.getQuotationsByEventId(eventId);
    const guests = db.getGuestsByEventId(eventId);
    const tables = db.getSeatingTablesByEventId(eventId);
    const assignments = db.getSeatingAssignmentsByEventId(eventId);

    const totalAllocated = budgetLineItems.reduce(
      (sum, item) => sum + (item.actual_amount ?? item.estimated_amount),
      0
    );
    const isConfirmed = (g: any) => g.rsvp_status === "CONFIRMED" || g.rsvp_status === "ATTENDING";
    const confirmedGuests = guests.filter(isConfirmed).length;
    const declinedGuests = guests.filter((g) => g.rsvp_status === "DECLINED").length;
    const unrespondedGuests = guests.filter((g) => g.rsvp_status === "NO_RESPONSE").length;
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
    const now = new Date();
    const overdueTasks = tasks.filter(
      (t) => t.status !== "COMPLETED" && t.due_date && new Date(t.due_date) < now
    );
    const seatedCount = new Set(assignments.map((a) => a.guest_id)).size;
    const unseatedCount = Math.max(0, confirmedGuests - seatedCount);

    const readiness = calculateReadinessScore({
      event,
      budgetLineItems,
      tasks,
      vendors,
      quotations,
      guests,
      tables,
      assignments,
    });

    const citations: Citation[] = [
      {
        module: "Budget",
        label: "Target Budget",
        value: `${event.currency} ${(event.total_budget / 100).toLocaleString()}`,
        href: `/events/${eventId}/budget`,
      },
      {
        module: "Budget",
        label: "Allocated Spend",
        value: `${event.currency} ${(totalAllocated / 100).toLocaleString()}`,
        href: `/events/${eventId}/budget`,
      },
      {
        module: "Tasks",
        label: "Task Completion",
        value: `${completedTasks}/${tasks.length} Done (${overdueTasks.length} Overdue)`,
        href: `/events/${eventId}/timeline`,
      },
      {
        module: "Guests",
        label: "RSVP Confirmed",
        value: `${confirmedGuests}/${guests.length} Confirmed`,
        href: `/events/${eventId}/guests`,
      },
      {
        module: "Seating",
        label: "Seated Guests",
        value: `${seatedCount}/${confirmedGuests} Assigned (${unseatedCount} Unseated)`,
        href: `/events/${eventId}/seating`,
      },
    ];

    const suggestedActions: SuggestedAction[] = [];
    if (totalAllocated > event.total_budget) {
      suggestedActions.push({
        label: "Run Budget Reduction Simulator",
        actionType: "SIMULATE",
        target: `/events/${eventId}/simulator`,
      });
    }
    if (overdueTasks.length > 0) {
      suggestedActions.push({
        label: `Review ${overdueTasks.length} Overdue Tasks`,
        actionType: "NAVIGATE",
        target: `/events/${eventId}/timeline`,
      });
    }
    if (unseatedCount > 0) {
      suggestedActions.push({
        label: `Auto-Seat ${unseatedCount} Unassigned Guests`,
        actionType: "EXECUTE",
        target: `/events/${eventId}/seating`,
      });
    }
    if (unrespondedGuests > 0) {
      suggestedActions.push({
        label: `Send RSVP Reminders (${unrespondedGuests} pending)`,
        actionType: "NAVIGATE",
        target: `/events/${eventId}/invitations`,
      });
    }

    let answerText = "";

    if (apiKey && apiKey.trim() !== "") {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
        });

        const systemPrompt = `You are Quveta's Senior Event Strategy & Decision Copilot.
You have access to the complete live state of this event. Provide concise, expert, data-grounded answers.
Always cite authoritative figures from the data. Never invent facts.

EVENT STATE:
- Event: "${event.title}" (${event.event_type}) on ${event.start_date}
- Overall Readiness Score: ${readiness.overallScore}/100 (${readiness.status})
- Target Budget: ₹${(event.total_budget / 100).toLocaleString()}
- Allocated / Spent: ₹${(totalAllocated / 100).toLocaleString()} (Variance: ₹${((event.total_budget - totalAllocated) / 100).toLocaleString()})
- Tasks: ${tasks.length} total, ${completedTasks} completed, ${overdueTasks.length} overdue (${overdueTasks.map((t) => t.title).join(", ") || "none"})
- Vendors: ${vendors.length} logged, ${vendors.filter((v) => v.status === "BOOKED").length} booked, ${quotations.filter((q) => q.status === "PENDING_REVIEW").length} quotes pending review
- Guests & RSVP: ${guests.length} invited, ${confirmedGuests} confirmed, ${declinedGuests} declined, ${unrespondedGuests} no response
- Seating: ${tables.length} tables, ${seatedCount} seated, ${unseatedCount} unseated confirmed guests

User Question: "${query}"`;

        const result = await model.generateContent(systemPrompt);
        answerText = result.response.text();
      } catch (e: any) {
        console.warn("Gemini call failed, using deterministic assistant response:", e?.message);
        answerText = generateDeterministicAssistantReply(query, {
          eventTitle: event.title,
          currency: event.currency,
          targetBudget: event.total_budget,
          allocatedSpend: totalAllocated,
          readinessScore: readiness.overallScore,
          overdueTasksCount: overdueTasks.length,
          overdueTaskNames: overdueTasks.map((t) => t.title),
          confirmedGuests,
          unseatedCount,
          unrespondedGuests,
        });
      }
    } else {
      answerText = generateDeterministicAssistantReply(query, {
        eventTitle: event.title,
        currency: event.currency,
        targetBudget: event.total_budget,
        allocatedSpend: totalAllocated,
        readinessScore: readiness.overallScore,
        overdueTasksCount: overdueTasks.length,
        overdueTaskNames: overdueTasks.map((t) => t.title),
        confirmedGuests,
        unseatedCount,
        unrespondedGuests,
      });
    }

    const assistantMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content: answerText,
      timestamp: new Date().toISOString(),
      citations,
      suggestedActions,
    };

    return { success: true, message: assistantMessage };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to query Decision Assistant." };
  }
}

function generateDeterministicAssistantReply(
  query: string,
  ctx: {
    eventTitle: string;
    currency: string;
    targetBudget: number;
    allocatedSpend: number;
    readinessScore: number;
    overdueTasksCount: number;
    overdueTaskNames: string[];
    confirmedGuests: number;
    unseatedCount: number;
    unrespondedGuests: number;
  }
): string {
  const q = query.toLowerCase();

  if (q.includes("budget") || q.includes("financial") || q.includes("spend") || q.includes("cost")) {
    const diff = ctx.targetBudget - ctx.allocatedSpend;
    const status = diff >= 0 ? "within your target budget" : "over your target budget";
    return `### Financial Status Analysis\n\n- **Target Budget:** ${ctx.currency} ${(ctx.targetBudget / 100).toLocaleString()}\n- **Allocated Spend:** ${ctx.currency} ${(ctx.allocatedSpend / 100).toLocaleString()}\n- **Net Variance:** ${ctx.currency} ${(Math.abs(diff) / 100).toLocaleString()} (${status})\n\n${
      diff < 0
        ? `⚠️ **Action Required:** Your expenses exceed the target by ${ctx.currency} ${(Math.abs(diff) / 100).toLocaleString()}. We recommend using the **Adaptive Budget Simulator** to model a 10% trim on flexible categories.`
        : `✅ **On Track:** You have a buffer of ${ctx.currency} ${(diff / 100).toLocaleString()} available for contingency or upgraded decor.`
    }`;
  }

  if (q.includes("task") || q.includes("timeline") || q.includes("schedule") || q.includes("overdue") || q.includes("deadline")) {
    if (ctx.overdueTasksCount > 0) {
      return `### Timeline & Task Bottlenecks\n\nYou currently have **${ctx.overdueTasksCount} overdue task(s)** requiring immediate attention:\n\n${ctx.overdueTaskNames
        .map((name) => `- ⚠️ **${name}** (deadline passed)`)
        .join("\n")}\n\n**Recommendation:** Check dependencies on the DAG timeline view and adjust sequence or reassign responsibility.`;
    }
    return `### Timeline Health\n\nAll active milestones and tasks are currently **on schedule**! No tasks are flagged as overdue. You can monitor upcoming phase completions in the Timeline workspace.`;
  }

  if (q.includes("guest") || q.includes("rsvp") || q.includes("seat") || q.includes("dietary")) {
    return `### Guest & Seating Coordination\n\n- **Confirmed RSVPs:** ${ctx.confirmedGuests} guests\n- **Awaiting Response:** ${ctx.unrespondedGuests} invitations\n- **Unseated Confirmed Guests:** ${ctx.unseatedCount}\n\n${
      ctx.unseatedCount > 0
        ? `⚠️ **Action Item:** There are ${ctx.unseatedCount} confirmed guests without table assignments. Use the 1-click **Intelligent Auto-Seat** in the Seating Planner to resolve this instantly.`
        : `✅ All confirmed guests have been assigned to tables with catering manifests compiled.`
    }`;
  }

  return `### Event Overview & Readiness Status\n\n- **Overall Readiness:** **${ctx.readinessScore}/100**\n- **Budget:** ${ctx.currency} ${(ctx.allocatedSpend / 100).toLocaleString()} / ${(ctx.targetBudget / 100).toLocaleString()}\n- **RSVP Count:** ${ctx.confirmedGuests} confirmed attendees\n- **Action Items:** ${ctx.overdueTasksCount} overdue tasks, ${ctx.unseatedCount} unseated guests.\n\nHow else can I assist with your planning today?`;
}
