import React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  Users,
  MapPin,
  Clock,
  PlusCircle,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  PieChart,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { repository } from "@/shared/db/supabase";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { formatMoney, createMoney, toMajorUnits } from "@/shared/types/money";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const events = repository.getEvents();
  const allTasks: any[] = [];
  let totalPlannedINRMinor = 0;
  let totalTargetINRMinor = 0;

  for (const event of events) {
    const lineItems = repository.getLineItemsByEventId(event.id);
    const eventPlannedMinor = lineItems.reduce((acc, li) => acc + li.planned_amount, 0);

    if (event.currency === "INR") {
      totalPlannedINRMinor += eventPlannedMinor;
      totalTargetINRMinor += event.target_budget;
    }

    const tasks = repository.getTasksByEventId(event.id);
    tasks.forEach((t) => allTasks.push({ ...t, eventTitle: event.title }));
  }

  const todayIso = new Date().toISOString().split("T")[0];
  const completedTasksCount = allTasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasks = allTasks.filter((t) => t.status !== "COMPLETED" && t.due_date < todayIso);
  const upcomingTasks = allTasks
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, 5);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-300 bg-brand-800/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Quveta AI Platform
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Event Planning Workspace
            </h1>
            <p className="text-xs sm:text-sm text-brand-200 max-w-xl leading-relaxed">
              Your events. Your vision. Intelligently planned with deterministic financial modeling, stateful DAG timelines, and explainable AI.
            </p>
          </div>

          <Link href="/events/new">
            <Button size="md" className="bg-white text-brand-950 hover:bg-brand-50 shadow-md font-bold gap-2">
              <PlusCircle className="w-4 h-4 text-brand-700" />
              <span>Create New Event</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Events
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{events.length}</span>
            <span className="text-xs text-slate-500">celebrations managed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Real database records</p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Target Budget
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatMoney(createMoney(totalTargetINRMinor, "INR"))}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Authorized planned capital</p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Planned Spend
          </p>
          <p className="text-2xl font-extrabold text-brand-900">
            {formatMoney(createMoney(totalPlannedINRMinor, "INR"))}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {Math.round((totalPlannedINRMinor / (totalTargetINRMinor || 1)) * 100)}% of ceiling utilized
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Task Progress
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {completedTasksCount}/{allTasks.length}
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {overdueTasks.length > 0 ? (
              <Badge variant="danger" className="text-[10px]">
                {overdueTasks.length} Overdue
              </Badge>
            ) : (
              <Badge variant="success" className="text-[10px]">
                Schedule On Track
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Your Active Celebrations ({events.length})
          </h2>
          <Link
            href="/events/new"
            className="text-xs text-brand-700 hover:text-brand-900 font-semibold flex items-center gap-1"
          >
            <span>+ New Event</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((event) => {
            const lineItems = repository.getLineItemsByEventId(event.id);
            const plannedMinor = lineItems.reduce((acc, li) => acc + li.planned_amount, 0);
            const percentSpent = Math.min(Math.round((plannedMinor / event.target_budget) * 100), 100);

            return (
              <Link key={event.id} href={`/events/${event.id}`} className="group block">
                <Card className="h-full hover:border-brand-400 hover:shadow-md transition-all">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="purple" className="text-[10px] capitalize">
                            {event.event_type}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {event.location}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                          {event.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {event.event_date}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Attendees</span>
                        <span className="font-semibold text-slate-800">{event.guest_count} guests</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Target Budget</span>
                        <span className="font-bold text-slate-900">
                          {formatMoney(createMoney(event.target_budget, event.currency))}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Budget Allocated</span>
                        <span className="font-bold text-slate-800">{percentSpent}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand-700 h-full"
                          style={{ width: `${percentSpent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Upcoming Tasks Table */}
      <Card className="space-y-4">
        <CardHeader
          title="Upcoming Deadlines Across Events"
          subtitle="Top scheduled priorities and dependencies requiring attention."
        />

        {upcomingTasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No upcoming tasks pending.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Task Title</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {upcomingTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{t.title}</td>
                    <td className="px-4 py-3 text-slate-500">{t.eventTitle}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          t.priority === "CRITICAL"
                            ? "danger"
                            : t.priority === "HIGH"
                            ? "warning"
                            : "neutral"
                        }
                        className="text-[10px]"
                      >
                        {t.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{t.due_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
