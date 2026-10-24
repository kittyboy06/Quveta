import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Users,
  MapPin,
  Sparkles,
  PieChart,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { repository } from "@/shared/db/supabase";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { formatMoney, createMoney } from "@/shared/types/money";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const event = repository.getEventById(id);

  if (!event) {
    notFound();
  }

  const categories = repository.getCategoriesByEventId(id);
  const lineItems = repository.getLineItemsByEventId(id);
  const tasks = repository.getTasksByEventId(id);

  const totalPlannedMinor = lineItems.reduce((acc, li) => acc + li.planned_amount, 0);
  const targetBudgetMoney = createMoney(event.target_budget, event.currency);
  const plannedBudgetMoney = createMoney(totalPlannedMinor, event.currency);
  const remainingBudgetMoney = createMoney(event.target_budget - totalPlannedMinor, event.currency);

  const todayIso = new Date().toISOString().split("T")[0];
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.due_date < todayIso).length;

  // Calculate days remaining
  const eventDateObj = new Date(event.event_date);
  const today = new Date();
  const diffTime = eventDateObj.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-8">
      {/* Event Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="purple" className="bg-brand-800 text-brand-200 border-brand-700 capitalize">
                {event.event_type}
              </Badge>
              <span className="text-xs text-brand-300">
                Created on {new Date(event.created_at).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {event.title}
            </h1>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-brand-200 flex-wrap">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-brand-400" />
                <span>{event.event_date} ({daysRemaining > 0 ? `${daysRemaining} days away` : "Event Day"})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-brand-400" />
                <span>{event.guest_count} attendees</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/events/${id}/simulator`}>
              <Button size="md" className="bg-white text-brand-950 hover:bg-brand-50 shadow-md font-semibold gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-700" />
                <span>Open Budget Simulator</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Financial & Task Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Target Budget
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatMoney(targetBudgetMoney)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Authoritative expenditure limit</p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Current Planned Spend
          </p>
          <p className="text-2xl font-extrabold text-brand-900">
            {formatMoney(plannedBudgetMoney)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {lineItems.length} line items in {categories.length} categories
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Remaining Budget
          </p>
          <p
            className={`text-2xl font-extrabold ${
              remainingBudgetMoney.amount >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {formatMoney(remainingBudgetMoney)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {remainingBudgetMoney.amount >= 0 ? "Safe buffer available" : "Deficit requires simulator action"}
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Task Execution
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {completedTasks}/{tasks.length}
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {overdueTasks > 0 ? (
              <Badge variant="danger" className="text-[10px]">
                {overdueTasks} Overdue
              </Badge>
            ) : (
              <Badge variant="success" className="text-[10px]">
                On Schedule
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Primary Module Hub Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Core Planning Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. AI Planning Engine */}
          <Link href={`/events/${id}/plan`} className="group block">
            <Card className="h-full hover:border-brand-400 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-800">
                  <Sparkles className="w-5 h-5" />
                </div>
                <Badge variant="purple">Module 03</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                AI Event Planning Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Generate structured, personalized event proposals including milestones, risk assessments, and missing information checks powered by Google Gemini.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-brand-700 group-hover:translate-x-1 transition-transform">
                <span>Open Planning Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>
          </Link>

          {/* 2. Budget Management */}
          <Link href={`/events/${id}/budget`} className="group block">
            <Card className="h-full hover:border-brand-400 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <PieChart className="w-5 h-5" />
                </div>
                <Badge variant="neutral">Module 04</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Budget Management
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Authoritative financial records distinguishing fixed vs. variable costs, paid deposits, and verified quotations with integer minor-unit precision.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
                <span>Manage Line Items & Categories</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>
          </Link>

          {/* 3. Adaptive Budget Simulator */}
          <Link href={`/events/${id}/simulator`} className="group block">
            <Card className="h-full border-brand-300 bg-brand-50/50 hover:border-brand-500 hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-700 text-white text-[9px] uppercase font-extrabold px-3 py-1 rounded-bl-lg tracking-wider">
                Signature Feature
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-800 flex items-center justify-center text-white shadow-sm">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <Badge variant="purple" className="mr-14">Module 05</Badge>
              </div>
              <h3 className="text-base font-bold text-brand-950 group-hover:text-brand-700 transition-colors">
                Adaptive Budget Simulator
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Simulate budget contractions or guest surges. Inspect mathematically exact trade-offs, selectively accept or reject suggestions, and commit approved adjustments.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-brand-800 group-hover:translate-x-1 transition-transform">
                <span>Run Interactive Simulation</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>
          </Link>

          {/* 4. Task & Timeline Management */}
          <Link href={`/events/${id}/timeline`} className="group block">
            <Card className="h-full hover:border-brand-400 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                  <Clock className="w-5 h-5" />
                </div>
                <Badge variant="neutral">Module 06</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Tasks & Timeline (DAG Engine)
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Directed Acyclic Graph dependency management with cycle prevention, blocked-state tracking, and automated schedule recovery when dates move.
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">
                <span>View Timeline & Dependencies</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
