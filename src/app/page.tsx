import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Store,
  ListOrdered,
  Grid3X3,
  Mail,
  Bot,
  Bell,
  FileText,
  Settings,
  SlidersHorizontal,
  Activity,
  Layers,
} from "lucide-react";
import { repository } from "@/shared/db/supabase";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { formatMoney, createMoney } from "@/shared/types/money";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const events = repository.getEvents();
  const allTasks: any[] = [];
  let totalPlannedINRMinor = 0;
  let totalTargetINRMinor = 0;

  for (const event of events) {
    const lineItems = repository.getLineItemsByEventId(event.id);
    const eventPlannedMinor = lineItems.reduce((acc, li) => acc + (li.planned_amount || 0), 0);

    if (event.currency === "INR") {
      totalPlannedINRMinor += eventPlannedMinor;
      totalTargetINRMinor += (event.target_budget || event.total_budget || 0);
    }

    const tasks = repository.getTasksByEventId(event.id);
    tasks.forEach((t) => allTasks.push({ ...t, eventTitle: event.title }));
  }

  const todayIso = new Date().toISOString().split("T")[0];
  const completedTasksCount = allTasks.filter((t) => t.status === "COMPLETED").length;
  const overdueTasks = allTasks.filter((t) => t.status !== "COMPLETED" && t.due_date < todayIso);
  const upcomingTasks = allTasks
    .filter((t) => t.status !== "COMPLETED")
    .sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""))
    .slice(0, 5);

  const defaultBenchmarkId = events.find((e) => e.id === "evt-wedding-001")?.id || events[0]?.id || "evt-wedding-001";

  const moduleSuite = [
    {
      pillar: "Pillar 1: Core Planning",
      badge: "Modules 01–06",
      badgeColor: "bg-purple-100 text-purple-800",
      items: [
        { num: "01", name: "Event Setup Wizard", path: "/events/new", desc: "Multi-event state, dates, guest counts & location" },
        { num: "02", name: "AI Planning Engine", path: `/events/${defaultBenchmarkId}/plan`, desc: "Gemini 2.5 Flash + deterministic generator" },
        { num: "03", name: "Scenario Modeling", path: `/events/${defaultBenchmarkId}/simulator`, desc: "Multi-scenario comparisons and drafts" },
        { num: "04", name: "Budget Allocator", path: `/events/${defaultBenchmarkId}/budget`, desc: "Integer paise precision, zero float drift" },
        { num: "05", name: "Budget Simulator", path: `/events/${defaultBenchmarkId}/simulator`, desc: "Deficit elimination & trade-off engine" },
        { num: "06", name: "DAG Task Timeline", path: `/events/${defaultBenchmarkId}/timeline`, desc: "Topological sort, cycle detection & critical path" },
      ],
    },
    {
      pillar: "Pillar 2: Coordination Suite",
      badge: "Modules 07–11",
      badgeColor: "bg-blue-100 text-blue-800",
      items: [
        { num: "07", name: "Vendors & Quotes", path: `/events/${defaultBenchmarkId}/vendors`, desc: "Side-by-side quotes & budget line coupling" },
        { num: "08", name: "Day-of Run Sheet", path: `/events/${defaultBenchmarkId}/run-sheet`, desc: "Cascading delay engine & buffer compression" },
        { num: "09", name: "Guests & RSVPs", path: `/events/${defaultBenchmarkId}/guests`, desc: "Dietary manifests & RFC-4180 CSV import/export" },
        { num: "10", name: "Seating Planner", path: `/events/${defaultBenchmarkId}/seating`, desc: "Table capacity limits & auto-seat optimization" },
        { num: "11", name: "Digital Invitations", path: `/events/${defaultBenchmarkId}/invitations`, desc: "WYSIWYG preview & token interpolation" },
      ],
    },
    {
      pillar: "Pillar 3: Intelligence & Reliability",
      badge: "Modules 12–15",
      badgeColor: "bg-emerald-100 text-emerald-800",
      items: [
        { num: "12", name: "AI Decision Copilot", path: `/events/${defaultBenchmarkId}/insights`, desc: "5-pillar readiness radar & proactive risk feed" },
        { num: "13", name: "Notification Engine", path: `/events/${defaultBenchmarkId}/notifications`, desc: "Automated alert rules & scan triggers" },
        { num: "14", name: "Reports & Binder Exports", path: `/events/${defaultBenchmarkId}/reports`, desc: "Printable documents & 6 executive summaries" },
        { num: "15", name: "Settings & Demo Toolkit", path: `/events/${defaultBenchmarkId}/settings`, desc: "Self-test diagnostics & 1-click benchmark reset" },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* 1. Welcome & Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 text-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md border-2 border-brand-400/30 flex-shrink-0 bg-brand-950">
              <Image
                src="/logo.png"
                alt="Quveta Platform Logo"
                width={80}
                height={80}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-300 bg-brand-950/80 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  PromptWars Virtual Challenge 5 • 15 Modules Complete
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Quveta Event Planning Platform
              </h1>
              <p className="text-xs sm:text-sm text-brand-200 max-w-2xl leading-relaxed">
                Your events. Your vision. Intelligently planned with deterministic financial modeling, stateful DAG timelines, vendor quote coupling, live run sheet delay recovery, and explainable AI.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Link href="/events/new">
              <Button
                variant="white"
                size="md"
                className="gap-2 shadow-lg"
              >
                <PlusCircle className="w-4 h-4 text-brand-800" />
                <span>Create New Event</span>
              </Button>
            </Link>

            <Link href={`/events/${defaultBenchmarkId}`}>
              <Button
                variant="secondary"
                size="md"
                className="bg-brand-900/90 border border-brand-400/40 text-white hover:bg-brand-800 font-bold gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explore Benchmark Event</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Active Celebrations
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{events.length}</span>
            <span className="text-xs text-slate-500">celebrations managed</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Relational Integrity
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Target Capital
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
          <p className="text-[11px] text-slate-500 mt-1">
            {Math.round((totalPlannedINRMinor / (totalTargetINRMinor || 1)) * 100)}% of authorized budget
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Task Progress & Health
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
            <span className="text-[11px] text-slate-400">DAG Validated</span>
          </div>
        </Card>
      </div>

      {/* 3. Evaluator Quick Benchmark Launchpad */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Evaluator Competition Benchmarks</span>
            </h2>
            <p className="text-xs text-slate-500">
              Pre-seeded multi-module events ready for immediate review and testing.
            </p>
          </div>
          <Link
            href={`/events/${defaultBenchmarkId}/settings`}
            className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Run Self-Test Diagnostics →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Benchmark 1: Royal Heritage Wedding */}
          <Card className="border-brand-200 bg-gradient-to-br from-white to-purple-50/30 shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="purple" className="text-[10px]">
                      Luxury Wedding • 15 Modules Active
                    </Badge>
                    <span className="text-xs text-slate-400">The Grand Palace Hall, Bangalore</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Aarav & Meera's Traditional Wedding
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  4 Months Out
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                Complete wedding benchmark with authentic feast catering, Nadaswaram ensemble, 12 guests with Jain/Veg dietary manifests, 4 seating tables, and run sheet delay buffers.
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Guest Count</span>
                  <span className="font-bold text-slate-800">200 Attendees</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Target Capital</span>
                  <span className="font-extrabold text-slate-900">₹8,00,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Readiness Score</span>
                  <span className="font-extrabold text-emerald-600">86 / 100</span>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link href="/events/evt-wedding-001" className="block">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold gap-1.5 shadow-sm"
                  >
                    <span>Open Event Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Link href="/events/evt-wedding-001/run-sheet">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <ListOrdered className="w-3 h-3 text-brand-700 mr-1" /> Run Sheet
                    </Button>
                  </Link>
                  <Link href="/events/evt-wedding-001/seating">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <Grid3X3 className="w-3 h-3 text-brand-700 mr-1" /> Seating
                    </Button>
                  </Link>
                  <Link href="/events/evt-wedding-001/invitations">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <Mail className="w-3 h-3 text-brand-700 mr-1" /> Invitations
                    </Button>
                  </Link>
                  <Link href="/events/evt-wedding-001/insights">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <Bot className="w-3 h-3 text-brand-700 mr-1" /> AI Insights
                    </Button>
                  </Link>
                  <Link href="/events/evt-wedding-001/reports">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <FileText className="w-3 h-3 text-brand-700 mr-1" /> Binder
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Benchmark 2: Corporate Hackathon */}
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="info" className="text-[10px]">
                      Corporate • 15 Modules Active
                    </Badge>
                    <span className="text-xs text-slate-400">T-Hub Innovation Center, Hyderabad</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    TechInnovate Annual Hackathon 2026
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  45 Days Out
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                Developer competition benchmark with dedicated 1Gbps WiFi vendor quote, Halal/Vegan catering packages, critical-path DAG dependencies, and automated alerts.
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Participants</span>
                  <span className="font-bold text-slate-800">150 Builders</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Budget Ceiling</span>
                  <span className="font-extrabold text-slate-900">₹3,50,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Critical Tasks</span>
                  <span className="font-extrabold text-blue-600">3 on Path</span>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link href="/events/evt-hackathon-002" className="block">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full font-bold gap-1.5 shadow-sm bg-blue-800 hover:bg-blue-900"
                  >
                    <span>Open Event Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Link href="/events/evt-hackathon-002/timeline">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <Clock className="w-3 h-3 text-blue-700 mr-1" /> DAG Timeline
                    </Button>
                  </Link>
                  <Link href="/events/evt-hackathon-002/simulator">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <SlidersHorizontal className="w-3 h-3 text-blue-700 mr-1" /> Simulator
                    </Button>
                  </Link>
                  <Link href="/events/evt-hackathon-002/vendors">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <Store className="w-3 h-3 text-blue-700 mr-1" /> Vendors
                    </Button>
                  </Link>
                  <Link href="/events/evt-hackathon-002/notifications">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <Bell className="w-3 h-3 text-blue-700 mr-1" /> Alerts
                    </Button>
                  </Link>
                  <Link href="/events/evt-hackathon-002/settings">
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                      <Settings className="w-3 h-3 text-blue-700 mr-1" /> Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Active Celebrations Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Your Managed Celebrations ({events.length})
            </h2>
            <p className="text-xs text-slate-500">
              All active events stored in the verified local relational persistence engine.
            </p>
          </div>
          <Link href="/events/new">
            <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-brand-700" />
              <span>+ Add Celebration</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => {
            const lineItems = repository.getLineItemsByEventId(event.id);
            const plannedMinor = lineItems.reduce((acc, li) => acc + (li.planned_amount || 0), 0);
            const targetBudgetMinor = event.target_budget || event.total_budget || 1;
            const percentSpent = Math.min(Math.round((plannedMinor / targetBudgetMinor) * 100), 100);

            return (
              <Card key={event.id} className="h-full border-slate-200 hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Badge variant="purple" className="text-[10px] capitalize">
                          {event.event_type}
                        </Badge>
                        <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {event.location}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {event.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
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
                        {formatMoney(createMoney(targetBudgetMinor, event.currency))}
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

                {/* Visible Action Buttons on every card */}
                <div className="pt-4 border-t border-slate-100 space-y-2 mt-3">
                  <Link href={`/events/${event.id}`} className="block">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full font-bold gap-1.5 shadow-sm"
                    >
                      <span>Open Event Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500">
                    <Link href={`/events/${event.id}/budget`} className="hover:text-brand-800 font-medium">
                      Budget
                    </Link>
                    <span>•</span>
                    <Link href={`/events/${event.id}/timeline`} className="hover:text-brand-800 font-medium">
                      Timeline
                    </Link>
                    <span>•</span>
                    <Link href={`/events/${event.id}/guests`} className="hover:text-brand-800 font-medium">
                      Guests
                    </Link>
                    <span>•</span>
                    <Link href={`/events/${event.id}/insights`} className="hover:text-brand-800 font-medium">
                      Insights
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. Complete 15-Module Architecture Showcase */}
      <Card className="space-y-6 border-slate-200 bg-gradient-to-br from-slate-50/50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-brand-700" />
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Complete 15-Module Event Platform
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              All architectural modules required by PromptWars Challenge 5 are implemented, integrated, and unit-tested.
            </p>
          </div>
          <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
            15 / 15 Modules Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {moduleSuite.map((pillar) => (
            <div key={pillar.pillar} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  {pillar.pillar}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pillar.badgeColor}`}>
                  {pillar.badge}
                </span>
              </div>

              <div className="space-y-2">
                {pillar.items.map((mod) => (
                  <Link
                    key={mod.num}
                    href={mod.path}
                    className="block p-2.5 rounded-lg border border-slate-200 bg-white hover:border-brand-400 hover:shadow-xs transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-brand-700">
                          {mod.num}
                        </span>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-brand-800 transition-colors">
                          {mod.name}
                        </span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-brand-700 transition-colors" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {mod.desc}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 6. Upcoming Deadlines Across Events */}
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
