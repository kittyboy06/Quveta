import { SeedGuest, SeedSeatingTable, SeedSeatingAssignment } from "@/shared/db/seed-data";

export interface TableWithGuests {
  table: SeedSeatingTable;
  assignedGuests: {
    guest: SeedGuest;
    assignment: SeedSeatingAssignment;
  }[];
  occupancyCount: number;
  availableSeats: number;
  dietarySummary: Record<string, number>;
  accessibilityConflicts: string[];
}

export interface SeatingPlanAnalysis {
  tablesWithGuests: TableWithGuests[];
  unseatedGuests: SeedGuest[];
  totalConfiguredCapacity: number;
  totalAssignedSeats: number;
  totalAttendingGuests: number;
  seatingConflicts: {
    severity: "HIGH" | "WARNING";
    message: string;
    guestId?: string;
    tableId?: string;
  }[];
}

export function analyzeSeatingPlan(
  tables: SeedSeatingTable[],
  guests: SeedGuest[],
  assignments: SeedSeatingAssignment[]
): SeatingPlanAnalysis {
  const guestMap = new Map(guests.map((g) => [g.id, g]));
  const assignmentByGuestId = new Map(assignments.map((a) => [a.guest_id, a]));

  const seatingConflicts: SeatingPlanAnalysis["seatingConflicts"] = [];

  const tablesWithGuests: TableWithGuests[] = tables.map((tbl) => {
    const tableAssignments = assignments.filter((a) => a.table_id === tbl.id);
    const assignedGuests: TableWithGuests["assignedGuests"] = [];
    const dietarySummary: Record<string, number> = {};
    const accessibilityConflicts: string[] = [];

    tableAssignments.forEach((a) => {
      const guest = guestMap.get(a.guest_id);
      if (guest) {
        assignedGuests.push({ guest, assignment: a });

        // Dietary tally
        (guest.dietary_restrictions || []).forEach((diet) => {
          dietarySummary[diet] = (dietarySummary[diet] || 0) + 1;
        });

        // Accessibility checks
        if (
          guest.accessibility_needs?.includes("WHEELCHAIR") &&
          !tbl.accessibility_friendly
        ) {
          const conflictMsg = `Guest ${guest.first_name} ${guest.last_name} requires wheelchair access, but '${tbl.name}' has accessibility_friendly = false.`;
          accessibilityConflicts.push(conflictMsg);
          seatingConflicts.push({
            severity: "HIGH",
            message: conflictMsg,
            guestId: guest.id,
            tableId: tbl.id,
          });
        }

        // Check if declined guest is seated
        if (guest.rsvp_status === "DECLINED") {
          seatingConflicts.push({
            severity: "WARNING",
            message: `Guest ${guest.first_name} ${guest.last_name} has declined RSVP but remains assigned to '${tbl.name}'.`,
            guestId: guest.id,
            tableId: tbl.id,
          });
        }
      }
    });

    // Check overcapacity
    if (assignedGuests.length > tbl.capacity) {
      seatingConflicts.push({
        severity: "HIGH",
        message: `Table '${tbl.name}' exceeds capacity: ${assignedGuests.length}/${tbl.capacity} assigned!`,
        tableId: tbl.id,
      });
    }

    return {
      table: tbl,
      assignedGuests,
      occupancyCount: assignedGuests.length,
      availableSeats: Math.max(0, tbl.capacity - assignedGuests.length),
      dietarySummary,
      accessibilityConflicts,
    };
  });

  // Find unseated attending guests
  const attendingGuests = guests.filter((g) => g.rsvp_status === "ATTENDING");
  const unseatedGuests = attendingGuests.filter((g) => !assignmentByGuestId.has(g.id));

  const totalConfiguredCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
  const totalAssignedSeats = assignments.length;

  return {
    tablesWithGuests,
    unseatedGuests,
    totalConfiguredCapacity,
    totalAssignedSeats,
    totalAttendingGuests: attendingGuests.length,
    seatingConflicts,
  };
}

export function autoSuggestSeatingAssignments(
  tables: SeedSeatingTable[],
  guests: SeedGuest[],
  currentAssignments: SeedSeatingAssignment[]
): { tableId: string; guestId: string }[] {
  const analysis = analyzeSeatingPlan(tables, guests, currentAssignments);
  const unassigned = [...analysis.unseatedGuests];
  const newAssignments: { tableId: string; guestId: string }[] = [];

  // Track remaining seats per table
  const remainingSeats = new Map<string, number>();
  tables.forEach((t) => {
    const assignedCount = currentAssignments.filter((a) => a.table_id === t.id).length;
    remainingSeats.set(t.id, Math.max(0, t.capacity - assignedCount));
  });

  // Prioritize placing wheelchair guests in accessible tables first
  const wheelchairGuests = unassigned.filter((g) => g.accessibility_needs?.includes("WHEELCHAIR"));
  const nonWheelchairGuests = unassigned.filter((g) => !g.accessibility_needs?.includes("WHEELCHAIR"));

  wheelchairGuests.forEach((guest) => {
    const accessibleTable = tables.find(
      (t) => t.accessibility_friendly && (remainingSeats.get(t.id) || 0) > 0
    );
    if (accessibleTable) {
      newAssignments.push({ tableId: accessibleTable.id, guestId: guest.id });
      remainingSeats.set(accessibleTable.id, (remainingSeats.get(accessibleTable.id) || 0) - 1);
    }
  });

  // Assign remaining guests
  nonWheelchairGuests.forEach((guest) => {
    const availableTable = tables.find((t) => (remainingSeats.get(t.id) || 0) > 0);
    if (availableTable) {
      newAssignments.push({ tableId: availableTable.id, guestId: guest.id });
      remainingSeats.set(availableTable.id, (remainingSeats.get(availableTable.id) || 0) - 1);
    }
  });

  return newAssignments;
}
