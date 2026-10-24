import { describe, it, expect } from "vitest";
import { analyzeSeatingPlan, autoSuggestSeatingAssignments } from "../domain/seating.engine";
import { SeedGuest, SeedSeatingTable, SeedSeatingAssignment } from "@/shared/db/seed-data";

describe("Seating Planner & Conflict Detection Engine (Module 10)", () => {
  const mockTables: SeedSeatingTable[] = [
    {
      id: "tbl-1",
      event_id: "evt-test",
      name: "Table 1 (Accessible)",
      shape: "ROUND",
      capacity: 4,
      location_zone: "STAGE_FRONT",
      accessibility_friendly: true,
    },
    {
      id: "tbl-2",
      event_id: "evt-test",
      name: "Table 2 (Standard)",
      shape: "ROUND",
      capacity: 4,
      location_zone: "MAIN_FLOOR",
      accessibility_friendly: false,
    },
  ];

  const mockGuests: SeedGuest[] = [
    {
      id: "g-1",
      event_id: "evt-test",
      first_name: "Ramanathan",
      last_name: "Iyer",
      invitation_status: "DELIVERED",
      rsvp_status: "ATTENDING",
      plus_one_allowed: false,
      dietary_restrictions: ["VEG", "JAIN"],
      accessibility_needs: ["WHEELCHAIR"],
      created_at: "2026-01-01",
    },
    {
      id: "g-2",
      event_id: "evt-test",
      first_name: "Ananya",
      last_name: "Roy",
      invitation_status: "DELIVERED",
      rsvp_status: "ATTENDING",
      plus_one_allowed: false,
      dietary_restrictions: ["VEGAN"],
      accessibility_needs: [],
      created_at: "2026-01-01",
    },
    {
      id: "g-3",
      event_id: "evt-test",
      first_name: "Karan",
      last_name: "Johar",
      invitation_status: "DELIVERED",
      rsvp_status: "DECLINED",
      plus_one_allowed: false,
      dietary_restrictions: [],
      accessibility_needs: [],
      created_at: "2026-01-01",
    },
  ];

  it("calculates table occupancy and aggregates dietary summary for caterers", () => {
    const assignments: SeedSeatingAssignment[] = [
      { id: "sa-1", table_id: "tbl-1", guest_id: "g-1", assigned_at: "2026-01-01" },
      { id: "sa-2", table_id: "tbl-1", guest_id: "g-2", assigned_at: "2026-01-01" },
    ];

    const analysis = analyzeSeatingPlan(mockTables, mockGuests, assignments);
    const table1 = analysis.tablesWithGuests.find((t) => t.table.id === "tbl-1")!;

    expect(table1.occupancyCount).toBe(2);
    expect(table1.availableSeats).toBe(2);
    expect(table1.dietarySummary["VEG"]).toBe(1);
    expect(table1.dietarySummary["JAIN"]).toBe(1);
    expect(table1.dietarySummary["VEGAN"]).toBe(1);
  });

  it("detects accessibility conflict when a wheelchair guest is placed at non-accessible table", () => {
    // Assign wheelchair guest g-1 to tbl-2 (accessibility_friendly: false)
    const badAssignments: SeedSeatingAssignment[] = [
      { id: "sa-bad", table_id: "tbl-2", guest_id: "g-1", assigned_at: "2026-01-01" },
    ];

    const analysis = analyzeSeatingPlan(mockTables, mockGuests, badAssignments);
    const conflict = analysis.seatingConflicts.find((c) => c.severity === "HIGH");

    expect(conflict).toBeDefined();
    expect(conflict?.message).toContain("requires wheelchair access");
    expect(conflict?.tableId).toBe("tbl-2");
  });

  it("auto-suggests seating by honoring accessibility requirements first", () => {
    const unseatedGuests = [mockGuests[0], mockGuests[1]]; // g-1 (wheelchair) and g-2 (regular)
    const suggestions = autoSuggestSeatingAssignments(mockTables, unseatedGuests, []);

    expect(suggestions.length).toBe(2);

    // Wheelchair guest g-1 should be assigned to tbl-1 (accessible table)
    const g1Assignment = suggestions.find((s) => s.guestId === "g-1");
    expect(g1Assignment?.tableId).toBe("tbl-1");
  });
});
