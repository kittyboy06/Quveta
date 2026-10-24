"use server";

import { db } from "@/shared/db/storage";
import { ReportType, ReportSnapshot } from "../domain/report.schema";
import { serializeRowsToCsv } from "../domain/csv.serializer";

export async function getReportSnapshotAction(
  eventId: string,
  reportType: ReportType
): Promise<ReportSnapshot | null> {
  const event = db.getEventById(eventId);
  if (!event) return null;

  const now = new Date().toISOString();

  switch (reportType) {
    case "EXECUTIVE_SUMMARY": {
      const budgetItems = db.getBudgetLineItemsByEventId(eventId);
      const tasks = db.getTasksByEventId(eventId);
      const vendors = db.getVendorsByEventId(eventId);
      const guests = db.getGuestsByEventId(eventId);
      const tables = db.getSeatingTablesByEventId(eventId);
      const assignments = db.getSeatingAssignmentsByEventId(eventId);

      const totalAllocated = budgetItems.reduce(
        (sum, item) => sum + (item.actual_amount ?? item.estimated_amount),
        0
      );
      const confirmedGuests = guests.filter(
        (g) => g.rsvp_status === "CONFIRMED" || g.rsvp_status === "ATTENDING"
      ).length;
      const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
      const bookedVendors = vendors.filter((v) => v.status === "BOOKED").length;

      return {
        reportType,
        eventId,
        title: `${event.title} - Executive Planning Summary`,
        subtitle: `Master status briefing generated for ${event.event_type} on ${new Date(event.start_date).toLocaleDateString()}`,
        generatedAt: now,
        summaryStats: [
          {
            label: "Target Budget",
            value: `${event.currency} ${(event.total_budget / 100).toLocaleString()}`,
            subtext: `Committed: ${event.currency} ${(totalAllocated / 100).toLocaleString()}`,
          },
          {
            label: "Guest Attendance",
            value: `${confirmedGuests} Confirmed`,
            subtext: `Out of ${guests.length} invited`,
          },
          {
            label: "Task Velocity",
            value: `${completedTasks} / ${tasks.length}`,
            subtext: `${Math.round((completedTasks / (tasks.length || 1)) * 100)}% complete`,
          },
          {
            label: "Vendors & Tables",
            value: `${bookedVendors} Vendors Booked`,
            subtext: `${tables.length} tables arranged (${assignments.length} seated)`,
          },
        ],
        columns: ["Pillar", "Key Metric", "Status", "Target / Baseline", "Notes"],
        rows: [
          [
            "Financial Control",
            `${event.currency} ${(totalAllocated / 100).toLocaleString()}`,
            totalAllocated <= event.total_budget ? "ON TRACK" : "OVER BUDGET",
            `${event.currency} ${(event.total_budget / 100).toLocaleString()}`,
            totalAllocated <= event.total_budget
              ? "Healthy buffer maintained"
              : "Review flexible items in budget simulator",
          ],
          [
            "Guest RSVPs",
            `${confirmedGuests} Attending`,
            confirmedGuests > 0 ? "CONFIRMED" : "PENDING",
            `${event.guest_count} Expected`,
            `${guests.filter((g) => g.rsvp_status === "NO_RESPONSE").length} responses still pending`,
          ],
          [
            "Seating Arrangements",
            `${assignments.length} Seated`,
            assignments.length >= confirmedGuests ? "COMPLETE" : "IN PROGRESS",
            `${confirmedGuests} Confirmed Guests`,
            `${Math.max(0, confirmedGuests - assignments.length)} guests pending assignment`,
          ],
          [
            "Milestones & Tasks",
            `${completedTasks} Done`,
            tasks.filter((t) => t.status === "BLOCKED").length === 0 ? "CLEAR" : "BLOCKED",
            `${tasks.length} Total Milestones`,
            "Critical path dependencies active",
          ],
          [
            "Vendor Contracts",
            `${bookedVendors} Booked`,
            bookedVendors >= 2 ? "ACTIVE" : "IN REVIEW",
            `${vendors.length} Total Partners`,
            "Quotations verified and linked to budget",
          ],
        ],
      };
    }

    case "BUDGET_AUDIT": {
      const items = db.getBudgetLineItemsByEventId(eventId);
      const vendors = db.getVendorsByEventId(eventId);
      const vendorMap = new Map(vendors.map((v) => [v.id, v.name]));

      let totalEst = 0;
      let totalAct = 0;

      const rows = items.map((item) => {
        const est = item.estimated_amount / 100;
        const act = (item.actual_amount ?? item.estimated_amount) / 100;
        const diff = est - act;
        totalEst += item.estimated_amount;
        totalAct += item.actual_amount ?? item.estimated_amount;

        return [
          item.category,
          item.name,
          `${event.currency} ${est.toLocaleString()}`,
          `${event.currency} ${act.toLocaleString()}`,
          diff >= 0 ? `+${event.currency} ${diff.toLocaleString()}` : `-${event.currency} ${Math.abs(diff).toLocaleString()}`,
          item.vendor_id ? vendorMap.get(item.vendor_id) || "Assigned" : "Unassigned",
        ];
      });

      return {
        reportType,
        eventId,
        title: `${event.title} - Comprehensive Budget Audit`,
        subtitle: `Itemized financial breakdown across ${items.length} line items`,
        generatedAt: now,
        summaryStats: [
          {
            label: "Total Budget Target",
            value: `${event.currency} ${(event.total_budget / 100).toLocaleString()}`,
          },
          {
            label: "Total Allocated Spend",
            value: `${event.currency} ${(totalAct / 100).toLocaleString()}`,
          },
          {
            label: "Net Variance",
            value: `${event.currency} ${((event.total_budget - totalAct) / 100).toLocaleString()}`,
            subtext: totalAct <= event.total_budget ? "Under Target" : "Over Target",
          },
        ],
        columns: ["Category", "Line Item", "Estimated Amount", "Actual Amount", "Variance", "Linked Vendor"],
        rows,
      };
    }

    case "GUEST_DIETARY_ROSTER": {
      const guests = db.getGuestsByEventId(eventId);
      const assignments = db.getSeatingAssignmentsByEventId(eventId);
      const tables = db.getSeatingTablesByEventId(eventId);
      const households = db.getHouseholdGroupsByEventId(eventId);

      const tableMap = new Map(tables.map((t) => [t.id, t.name]));
      const assignmentMap = new Map(assignments.map((a) => [a.guest_id, a.table_id]));
      const householdMap = new Map(households.map((h) => [h.id, h.name]));

      const rows = guests.map((g) => {
        const tableId = assignmentMap.get(g.id);
        const tableName = tableId ? tableMap.get(tableId) || "Table Assigned" : "Unassigned";
        const household = g.household_group_id ? householdMap.get(g.household_group_id) || "—" : "—";
        const dietary = (g.dietary_restrictions || []).join(", ") || "None";
        const accessibility = (g.accessibility_needs || []).join(", ") || "Standard";

        return [
          `${g.first_name} ${g.last_name}`,
          g.email || "—",
          household,
          g.rsvp_status,
          String(g.plus_ones_count || 0),
          dietary,
          accessibility,
          tableName,
        ];
      });

      return {
        reportType,
        eventId,
        title: `${event.title} - Guest & Dietary Manifest`,
        subtitle: `Complete attendee directory with dietary restrictions for catering coordination`,
        generatedAt: now,
        summaryStats: [
          { label: "Total Guests", value: String(guests.length) },
          {
            label: "Confirmed Attending",
            value: String(
              guests.filter((g) => g.rsvp_status === "CONFIRMED" || g.rsvp_status === "ATTENDING").length
            ),
          },
          { label: "Special Dietary Needs", value: String(guests.filter((g) => (g.dietary_restrictions || []).length > 0).length) },
          { label: "Wheelchair Accessible", value: String(guests.filter((g) => (g.accessibility_needs || []).includes("WHEELCHAIR")).length) },
        ],
        columns: [
          "Guest Name",
          "Email",
          "Household Group",
          "RSVP Status",
          "Plus Ones",
          "Dietary Needs",
          "Accessibility",
          "Assigned Table",
        ],
        rows,
      };
    }

    case "SEATING_MANIFEST": {
      const tables = db.getSeatingTablesByEventId(eventId);
      const assignments = db.getSeatingAssignmentsByEventId(eventId);
      const guests = db.getGuestsByEventId(eventId);
      const guestMap = new Map(guests.map((g) => [g.id, g]));

      const rows = tables.map((tbl) => {
        const tblAssignments = assignments.filter((a) => a.table_id === tbl.id);
        const seatedGuests = tblAssignments
          .map((a) => guestMap.get(a.guest_id))
          .filter(Boolean);
        const names = seatedGuests.map((g) => `${g!.first_name} ${g!.last_name}`).join(", ") || "None";

        const dietaryList: string[] = [];
        for (const g of seatedGuests) {
          if (g && g.dietary_restrictions) {
            dietaryList.push(...g.dietary_restrictions);
          }
        }
        const dietaryCounts: Record<string, number> = {};
        for (const d of dietaryList) {
          dietaryCounts[d] = (dietaryCounts[d] || 0) + 1;
        }
        const dietarySummary = Object.entries(dietaryCounts)
          .map(([k, v]) => `${k} (${v})`)
          .join("; ") || "Standard";

        return [
          tbl.name,
          tbl.shape,
          `${tblAssignments.length} / ${tbl.capacity}`,
          tbl.is_accessible ? "Yes (Accessible)" : "Standard",
          dietarySummary,
          names,
        ];
      });

      return {
        reportType,
        eventId,
        title: `${event.title} - Seating Chart & Table Manifest`,
        subtitle: `Floor plan assignments, capacity enforcement, and catering manifests per table`,
        generatedAt: now,
        summaryStats: [
          { label: "Total Tables", value: String(tables.length) },
          { label: "Total Seated", value: String(assignments.length) },
          { label: "Accessible Tables", value: String(tables.filter((t) => t.is_accessible).length) },
        ],
        columns: ["Table Name", "Shape", "Occupancy", "Accessibility", "Catering Dietary Manifest", "Assigned Guests"],
        rows,
      };
    }

    case "RUN_SHEET_CUES": {
      const cues = db.getRunSheetItemsByEventId(eventId);

      const rows = cues.map((cue) => [
        cue.start_time,
        cue.end_time,
        cue.title,
        cue.category,
        cue.lead_person || "Lead Coordinator",
        cue.location || "Main Stage",
        cue.status,
        cue.notes || "—",
      ]);

      return {
        reportType,
        eventId,
        title: `${event.title} - Operational Run Sheet`,
        subtitle: `Chronological cue sheet for live event-day production and stage coordination`,
        generatedAt: now,
        summaryStats: [
          { label: "Total Cues", value: String(cues.length) },
          { label: "Completed", value: String(cues.filter((c) => c.status === "COMPLETED").length) },
          { label: "Delayed", value: String(cues.filter((c) => c.status === "DELAYED").length) },
        ],
        columns: ["Start Time", "End Time", "Activity Title", "Category", "Lead Person", "Location", "Status", "Operational Notes"],
        rows,
      };
    }

    case "VENDOR_DIRECTORY": {
      const vendors = db.getVendorsByEventId(eventId);
      const quotations = db.getQuotationsByEventId(eventId);

      const rows = vendors.map((v) => {
        const vQuotes = quotations.filter((q) => q.vendor_id === v.id);
        const acceptedQuote = vQuotes.find((q) => q.status === "ACCEPTED");
        const amountDisplay = acceptedQuote
          ? `${event.currency} ${(acceptedQuote.total_amount / 100).toLocaleString()}`
          : "—";

        return [
          v.name,
          v.category,
          v.contact_name || "—",
          v.contact_email || "—",
          v.contact_phone || "—",
          v.status,
          String(vQuotes.length),
          amountDisplay,
        ];
      });

      return {
        reportType,
        eventId,
        title: `${event.title} - Vendor Partner Directory`,
        subtitle: `Contract records, quotations, and verified contact directory`,
        generatedAt: now,
        summaryStats: [
          { label: "Total Vendors", value: String(vendors.length) },
          { label: "Booked Partners", value: String(vendors.filter((v) => v.status === "BOOKED").length) },
          { label: "Total Quotations", value: String(quotations.length) },
        ],
        columns: [
          "Vendor Name",
          "Category",
          "Contact Person",
          "Email",
          "Phone",
          "Status",
          "Quotes Received",
          "Accepted Contract",
        ],
        rows,
      };
    }
  }
}

export async function exportReportCsvAction(
  eventId: string,
  reportType: ReportType
): Promise<{ success: boolean; csvString?: string; filename?: string; error?: string }> {
  try {
    const snapshot = await getReportSnapshotAction(eventId, reportType);
    if (!snapshot) return { success: false, error: "Report could not be generated." };

    const csvString = serializeRowsToCsv(snapshot.columns, snapshot.rows);
    const filename = `${snapshot.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;

    return { success: true, csvString, filename };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to serialize CSV report." };
  }
}
