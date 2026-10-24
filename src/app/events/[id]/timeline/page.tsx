"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  PlusCircle,
  Calendar,
  Lock,
  Unlock,
  Check,
  RefreshCw,
  GitBranch,
  Filter,
} from "lucide-react";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Button } from "@/shared/design-system/Button";
import { Badge } from "@/shared/design-system/Badge";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import {
  getTimelineDataAction,
  toggleTaskCompletionAction,
  createTaskWithDependenciesAction,
  applyScheduleRecoveryAction,
} from "@/modules/tasks/server/task.actions";

export default function TimelineManagementPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryApplied, setRecoveryApplied] = useState(false);
  const [isApplyingRecovery, setIsApplyingRecovery] = useState(false);

  // New Task Form
  const [newTask, setNewTask] = useState({
    title: "",
    category: "Venue",
    priority: "HIGH" as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    due_date: "",
    prerequisiteTaskIds: [] as string[],
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getTimelineDataAction(eventId);
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const isCompleted = currentStatus === "COMPLETED";
    // Optimistic toggle
    setData((prev: any) => {
      if (!prev) return prev;
      const updatedRaw = prev.rawTasks.map((t: any) =>
        t.id === taskId ? { ...t, status: isCompleted ? "NOT_STARTED" : "COMPLETED" } : t
      );
      return { ...prev, rawTasks: updatedRaw };
    });

    await toggleTaskCompletionAction(eventId, taskId, !isCompleted);
    await loadData();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createTaskWithDependenciesAction(eventId, {
      title: newTask.title,
      category: newTask.category,
      priority: newTask.priority,
      due_date: newTask.due_date || data.event.event_date,
      prerequisiteTaskIds: newTask.prerequisiteTaskIds,
    });

    if (result.success) {
      setIsAddModalOpen(false);
      setNewTask({
        title: "",
        category: "Venue",
        priority: "HIGH",
        due_date: "",
        prerequisiteTaskIds: [],
      });
      await loadData();
    }
    setIsSubmitting(false);
  };

  const handleApplyRecovery = async () => {
    if (!data?.scheduleImpact?.proposedAdjustments) return;
    setIsApplyingRecovery(true);

    const adjustments = data.scheduleImpact.proposedAdjustments.map((a: any) => ({
      taskId: a.taskId,
      proposedDueDate: a.proposedDueDate,
    }));

    const result = await applyScheduleRecoveryAction(eventId, adjustments);
    if (result.success) {
      setRecoveryApplied(true);
      await loadData();
    }
    setIsApplyingRecovery(false);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { event, tasks, scheduleImpact, rawTasks } = data;

  const filteredTasks = tasks.filter((item: any) => {
    if (filterStatus === "ALL") return true;
    return item.derivedStatus === filterStatus;
  });

  const conflictsCount = scheduleImpact.conflictsDetected.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/events/${eventId}`}
              className="text-xs text-brand-700 hover:text-brand-900 font-medium flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {event.title}</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-brand-700" />
            <span>Task & Timeline Management (DAG)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Dependency-aware scheduling with cycle detection, blocked status propagation, and date-shift recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 shadow-sm bg-brand-800 text-white"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Schedule Conflicts Banner if Event Date Shifted */}
      {conflictsCount > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm block">
                  {conflictsCount} Schedule Conflict{conflictsCount > 1 ? "s" : ""} Detected
                </span>
                <span className="text-slate-600">
                  Deadlines fall after the event date ({event.event_date}). Review the recovery plan before updating dates.
                </span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleApplyRecovery}
              isLoading={isApplyingRecovery}
              className="bg-amber-700 hover:bg-amber-800 text-white text-xs gap-1.5 font-semibold flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Apply Recommended Reschedule</span>
            </Button>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-amber-200/60">
            {scheduleImpact.conflictsDetected.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-[11px] text-amber-900">
                <span>• <strong>{c.taskTitle}:</strong> {c.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recoveryApplied && (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Schedule recovery applied! All task deadlines adjusted to respect event milestones.</span>
        </div>
      )}

      {/* Filter Strip */}
      <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Filter Status:</span>
          {["ALL", "READY", "BLOCKED", "OVERDUE", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                filterStatus === st
                  ? "bg-brand-700 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <span className="text-slate-400 font-medium">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </span>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium">No tasks found matching this filter.</p>
          </div>
        ) : (
          filteredTasks.map(({ task, derivedStatus, blockedBy, prerequisitesCount }: any) => {
            const isCompleted = derivedStatus === "COMPLETED";

            const badgeMap: Record<string, { variant: "success" | "warning" | "danger" | "neutral" | "info"; label: string; icon: any }> = {
              READY: { variant: "success", label: "Ready to Start", icon: Unlock },
              BLOCKED: { variant: "warning", label: "Blocked by Prerequisite", icon: Lock },
              OVERDUE: { variant: "danger", label: "Overdue", icon: AlertCircle },
              COMPLETED: { variant: "neutral", label: "Completed", icon: Check },
              IN_PROGRESS: { variant: "info", label: "In Progress", icon: Clock },
            };

            const currentBadge = badgeMap[derivedStatus] || { variant: "neutral", label: derivedStatus, icon: Clock };
            const StatusIcon = currentBadge.icon;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? "bg-slate-50/80 border-slate-200 opacity-60"
                    : derivedStatus === "BLOCKED"
                    ? "bg-amber-50/30 border-amber-200"
                    : "bg-white border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Completion Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 hover:border-brand-600 bg-white"
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${
                            isCompleted ? "line-through text-slate-400" : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </span>
                        <Badge variant="purple" className="text-[10px]">
                          {task.category}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={currentBadge.variant} className="text-[10px]">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          <span>{currentBadge.label}</span>
                        </Badge>
                        <span className="text-xs text-slate-500 font-semibold">
                          Due: {task.due_date}
                        </span>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
                    )}

                    {/* Blocked Alert Explanation */}
                    {derivedStatus === "BLOCKED" && blockedBy.length > 0 && (
                      <div className="text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-md flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>
                          <strong>Waiting on:</strong> {blockedBy.join(", ")}. Complete prerequisite task(s) to unblock.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Task & Define Prerequisites</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5">
              <Input
                label="Task Title"
                placeholder="e.g. Confirm Flower Vendor Deposit"
                required
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Category"
                  options={[
                    { value: "Venue", label: "Venue & Logistics" },
                    { value: "Catering", label: "Catering & Food" },
                    { value: "Decoration", label: "Decoration" },
                    { value: "Photography", label: "Photography & Video" },
                    { value: "Invitations", label: "Invitations" },
                    { value: "Coordination", label: "Event Coordination" },
                  ]}
                  value={newTask.category}
                  onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                />

                <Select
                  label="Priority"
                  options={[
                    { value: "CRITICAL", label: "Critical" },
                    { value: "HIGH", label: "High" },
                    { value: "MEDIUM", label: "Medium" },
                    { value: "LOW", label: "Low" },
                  ]}
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                />
              </div>

              <Input
                label="Due Date"
                type="date"
                required
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />

              {rawTasks.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Prerequisite Tasks (Must complete before this task can start)
                  </label>
                  <select
                    multiple
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white h-24 focus:ring-2 focus:ring-brand-600"
                    value={newTask.prerequisiteTaskIds}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
                      setNewTask({ ...newTask, prerequisiteTaskIds: selected });
                    }}
                  >
                    {rawTasks.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.category})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple prerequisites. Cycle detection active.</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
