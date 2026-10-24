"use server";

import { safeRevalidatePath } from "@/shared/utils/cache";
import { repository } from "@/shared/db/supabase";
import { deriveTaskStates, wouldCreateCycle } from "../domain/dag.engine";
import { evaluateScheduleImpact } from "../domain/schedule.recovery";
import { ok, err, Result } from "@/shared/types/result";

export async function getTimelineDataAction(eventId: string) {
  const event = repository.getEventById(eventId);
  if (!event) return null;

  const tasks = repository.getTasksByEventId(eventId);
  const dependencies = repository.getDependenciesByEventId(eventId);

  const derivedStates = deriveTaskStates(tasks, dependencies);
  const scheduleImpact = evaluateScheduleImpact(tasks, dependencies, event.event_date);

  return {
    event,
    tasks: derivedStates,
    rawTasks: tasks,
    dependencies,
    scheduleImpact,
  };
}

export async function toggleTaskCompletionAction(
  eventId: string,
  taskId: string,
  completed: boolean
): Promise<Result<{ taskId: string; status: string }>> {
  try {
    const updated = repository.updateTask(taskId, {
      status: completed ? "COMPLETED" : "NOT_STARTED",
    });
    if (!updated) return err("Task not found");

    safeRevalidatePath(`/events/${eventId}/timeline`);
    safeRevalidatePath(`/events/${eventId}`);
    safeRevalidatePath("/");

    return ok({ taskId, status: updated.status });
  } catch (error: any) {
    console.error("Failed to toggle task completion:", error);
    return err(error.message || "Failed to toggle task completion.");
  }
}

export async function createTaskWithDependenciesAction(
  eventId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    start_date?: string;
    due_date?: string;
    estimated_days?: number;
    prerequisiteTaskIds?: string[];
  }
): Promise<Result<{ taskId: string }>> {
  try {
    const event = repository.getEventById(eventId);
    if (!event) return err("Event not found");

    const existingDeps = repository.getDependenciesByEventId(eventId);

    const newTask = repository.createTask({
      event_id: eventId,
      title: data.title.trim(),
      description: data.description?.trim() || "",
      category: data.category,
      priority: data.priority,
      status: data.prerequisiteTaskIds && data.prerequisiteTaskIds.length > 0 ? "BLOCKED" : "READY",
      start_date: data.start_date || new Date().toISOString().split("T")[0],
      due_date: data.due_date || event.event_date,
      estimated_days: data.estimated_days || 1,
    });

    if (data.prerequisiteTaskIds) {
      for (const prereqId of data.prerequisiteTaskIds) {
        if (!wouldCreateCycle(newTask.id, prereqId, existingDeps)) {
          repository.createDependency(newTask.id, prereqId);
        }
      }
    }

    safeRevalidatePath(`/events/${eventId}/timeline`);
    safeRevalidatePath(`/events/${eventId}`);
    return ok({ taskId: newTask.id });
  } catch (error: any) {
    console.error("Failed to create task:", error);
    return err(error.message || "Failed to create task.");
  }
}

export async function applyScheduleRecoveryAction(
  eventId: string,
  adjustments: { taskId: string; proposedDueDate: string }[]
): Promise<Result<{ updatedCount: number }>> {
  try {
    let updatedCount = 0;
    for (const adj of adjustments) {
      const res = repository.updateTask(adj.taskId, { due_date: adj.proposedDueDate });
      if (res) updatedCount++;
    }

    safeRevalidatePath(`/events/${eventId}/timeline`);
    safeRevalidatePath(`/events/${eventId}`);
    safeRevalidatePath("/");

    return ok({ updatedCount });
  } catch (error: any) {
    console.error("Failed to apply schedule recovery:", error);
    return err(error.message || "Failed to apply schedule recovery.");
  }
}
