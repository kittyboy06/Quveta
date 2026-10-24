import { SeedTask, SeedDependency } from "@/shared/db/seed-data";

export interface DerivedTaskState {
  task: SeedTask;
  derivedStatus: "READY" | "BLOCKED" | "OVERDUE" | "COMPLETED" | "IN_PROGRESS";
  blockedBy: string[]; // titles of incomplete prerequisites
  prerequisitesCount: number;
}

/**
 * Checks whether adding a dependency (taskId depends on prerequisiteTaskId) creates a cycle in the DAG.
 * Returns true if a cycle would be created.
 */
export function wouldCreateCycle(
  taskId: string,
  prerequisiteTaskId: string,
  existingDependencies: SeedDependency[]
): boolean {
  if (taskId === prerequisiteTaskId) return true;

  // Build adjacency list: node -> prerequisites
  const adj = new Map<string, string[]>();
  for (const dep of existingDependencies) {
    if (!adj.has(dep.task_id)) adj.set(dep.task_id, []);
    adj.get(dep.task_id)!.push(dep.prerequisite_task_id);
  }

  // Add proposed edge: taskId -> prerequisiteTaskId
  if (!adj.has(taskId)) adj.set(taskId, []);
  adj.get(taskId)!.push(prerequisiteTaskId);

  // DFS to detect cycle starting from prerequisiteTaskId reaching taskId
  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(curr: string): boolean {
    visited.add(curr);
    inStack.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (inStack.has(neighbor)) {
        return true;
      }
    }

    inStack.delete(curr);
    return false;
  }

  return dfs(taskId);
}

/**
 * Derives accurate operational statuses for tasks based on prerequisite completion and current date.
 */
export function deriveTaskStates(
  tasks: SeedTask[],
  dependencies: SeedDependency[],
  referenceDate: string = new Date().toISOString().split("T")[0]
): DerivedTaskState[] {
  const taskMap = new Map<string, SeedTask>();
  tasks.forEach((t) => taskMap.set(t.id, t));

  // Map: task_id -> array of prerequisite SeedTasks
  const prereqMap = new Map<string, SeedTask[]>();
  for (const dep of dependencies) {
    const parentTask = taskMap.get(dep.prerequisite_task_id);
    if (parentTask) {
      if (!prereqMap.has(dep.task_id)) prereqMap.set(dep.task_id, []);
      prereqMap.get(dep.task_id)!.push(parentTask);
    }
  }

  return tasks.map((task) => {
    if (task.status === "COMPLETED") {
      return {
        task,
        derivedStatus: "COMPLETED",
        blockedBy: [],
        prerequisitesCount: prereqMap.get(task.id)?.length || 0,
      };
    }

    const prereqs = prereqMap.get(task.id) || [];
    const incompletePrereqs = prereqs.filter((p) => p.status !== "COMPLETED");

    if (incompletePrereqs.length > 0) {
      return {
        task,
        derivedStatus: "BLOCKED",
        blockedBy: incompletePrereqs.map((p) => p.title),
        prerequisitesCount: prereqs.length,
      };
    }

    // All prerequisites completed: check if overdue
    if (task.due_date && task.due_date < referenceDate) {
      return {
        task,
        derivedStatus: "OVERDUE",
        blockedBy: [],
        prerequisitesCount: prereqs.length,
      };
    }

    if (task.status === "IN_PROGRESS") {
      return {
        task,
        derivedStatus: "IN_PROGRESS",
        blockedBy: [],
        prerequisitesCount: prereqs.length,
      };
    }

    return {
      task,
      derivedStatus: "READY",
      blockedBy: [],
      prerequisitesCount: prereqs.length,
    };
  });
}
