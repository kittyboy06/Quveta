import { SeedTask, SeedDependency } from "@/shared/db/seed-data";

export interface ScheduleConflict {
  taskId: string;
  taskTitle: string;
  type: "EXCEEDS_EVENT_DATE" | "LEAD_TIME_COLLISION";
  currentDueDate: string;
  eventDate: string;
  message: string;
}

export interface ProposedDateAdjustment {
  taskId: string;
  taskTitle: string;
  currentDueDate: string;
  proposedDueDate: string;
  daysShifted: number;
}

export interface ScheduleRecoveryPlan {
  conflictsDetected: ScheduleConflict[];
  proposedAdjustments: ProposedDateAdjustment[];
  summary: string;
}

export function evaluateScheduleImpact(
  tasks: SeedTask[],
  dependencies: SeedDependency[],
  newEventDate: string,
  daysShiftedDelta: number = 0
): ScheduleRecoveryPlan {
  const conflicts: ScheduleConflict[] = [];
  const adjustments: ProposedDateAdjustment[] = [];

  const taskMap = new Map<string, SeedTask>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  for (const task of tasks) {
    if (task.status === "COMPLETED") continue;

    // Check if task deadline exceeds new event date
    if (task.due_date > newEventDate) {
      conflicts.push({
        taskId: task.id,
        taskTitle: task.title,
        type: "EXCEEDS_EVENT_DATE",
        currentDueDate: task.due_date,
        eventDate: newEventDate,
        message: `Deadline (${task.due_date}) falls after the rescheduled event date (${newEventDate}).`,
      });
    }

    // Propose date adjustment if delta provided
    if (daysShiftedDelta !== 0) {
      const origDate = new Date(task.due_date);
      const newDate = new Date(origDate);
      newDate.setDate(newDate.getDate() + daysShiftedDelta);

      // Clamp to not exceed newEventDate
      const clampedDate =
        newDate.toISOString().split("T")[0] > newEventDate
          ? newEventDate
          : newDate.toISOString().split("T")[0];

      adjustments.push({
        taskId: task.id,
        taskTitle: task.title,
        currentDueDate: task.due_date,
        proposedDueDate: clampedDate,
        daysShifted: daysShiftedDelta,
      });
    }
  }

  const summary =
    conflicts.length > 0
      ? `Detected ${conflicts.length} scheduling conflicts due to date movement. Proposing ${adjustments.length} non-destructive task adjustments for review.`
      : `All task timelines remain valid under the current event date.`;

  return {
    conflictsDetected: conflicts,
    proposedAdjustments: adjustments,
    summary,
  };
}
