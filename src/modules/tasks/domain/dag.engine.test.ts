import { describe, it, expect } from "vitest";
import { wouldCreateCycle, deriveTaskStates } from "./dag.engine";
import { evaluateScheduleImpact } from "./schedule.recovery";
import { SeedTask, SeedDependency } from "@/shared/db/seed-data";

describe("DAG & Timeline Engine (Module 06)", () => {
  it("detects and rejects circular dependencies", () => {
    // Existing: Task 2 depends on Task 1
    const deps: SeedDependency[] = [{ id: "d1", task_id: "tsk-2", prerequisite_task_id: "tsk-1" }];

    // Self dependency: Task 1 depends on Task 1 -> Cycle
    expect(wouldCreateCycle("tsk-1", "tsk-1", deps)).toBe(true);

    // Direct cycle: Task 1 depends on Task 2 -> Cycle
    expect(wouldCreateCycle("tsk-1", "tsk-2", deps)).toBe(true);

    // Valid non-cycle: Task 3 depends on Task 2 -> No Cycle
    expect(wouldCreateCycle("tsk-3", "tsk-2", deps)).toBe(false);
  });

  it("derives BLOCKED status when prerequisites are incomplete, and unblocks when completed", () => {
    const tasks: SeedTask[] = [
      { id: "t1", event_id: "e1", title: "Book Venue", description: "", category: "Venue", priority: "CRITICAL", status: "NOT_STARTED", start_date: "2026-05-01", due_date: "2026-05-10", estimated_days: 2 },
      { id: "t2", event_id: "e1", title: "Setup Decor", description: "", category: "Decor", priority: "HIGH", status: "NOT_STARTED", start_date: "2026-05-11", due_date: "2026-05-15", estimated_days: 1 },
    ];

    const deps: SeedDependency[] = [
      { id: "d1", task_id: "t2", prerequisite_task_id: "t1" },
    ];

    // Initially t1 is NOT_STARTED, so t2 must be BLOCKED by t1
    let states = deriveTaskStates(tasks, deps, "2026-05-02");
    const t2State = states.find((s) => s.task.id === "t2");
    expect(t2State?.derivedStatus).toBe("BLOCKED");
    expect(t2State?.blockedBy).toContain("Book Venue");

    // Once t1 is COMPLETED, t2 unblocks to READY
    tasks[0].status = "COMPLETED";
    states = deriveTaskStates(tasks, deps, "2026-05-02");
    const t2Updated = states.find((s) => s.task.id === "t2");
    expect(t2Updated?.derivedStatus).toBe("READY");
    expect(t2Updated?.blockedBy.length).toBe(0);
  });

  it("detects schedule conflicts when event date is shifted earlier", () => {
    const tasks: SeedTask[] = [
      { id: "t1", event_id: "e1", title: "Final Rehearsal", description: "", category: "Coordination", priority: "HIGH", status: "NOT_STARTED", start_date: "2026-08-10", due_date: "2026-08-14", estimated_days: 1 },
    ];
    const deps: SeedDependency[] = [];

    // Event moved to 2026-08-10 -> task due date 2026-08-14 exceeds event date!
    const impact = evaluateScheduleImpact(tasks, deps, "2026-08-10", -14);
    expect(impact.conflictsDetected.length).toBe(1);
    expect(impact.conflictsDetected[0].type).toBe("EXCEEDS_EVENT_DATE");
    expect(impact.proposedAdjustments.length).toBe(1);
  });
});
