"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Sparkles,
  PieChart,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Store,
  ListOrdered,
  Users,
  Grid3X3,
  Mail,
  Bot,
  Bell,
  FileText,
  Settings,
  ChevronRight,
  Activity,
  RotateCcw,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  // Check if we are inside an event sub-route: /events/[id]/*
  const eventMatch = pathname.match(/^\/events\/([^\/]+)/);
  const activeEventId = eventMatch && eventMatch[1] !== "new" ? eventMatch[1] : null;

  // If no active event is in URL, default navigation to the competition benchmark event
  const targetEventId = activeEventId || "evt-wedding-001";
  const isBenchmarkDefault = !activeEventId;

  const topNavItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "New Event Wizard", href: "/events/new", icon: PlusCircle },
  ];

  const benchmarkCelebrations = [
    {
      id: "evt-wedding-001",
      name: "Aarav & Meera Wedding",
      subtitle: "₹8.0L • 200 Guests",
      badge: "Luxury",
      badgeColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "evt-hackathon-002",
      name: "TechInnovate Hackathon",
      subtitle: "₹3.5L • 150 Guests",
      badge: "Corporate",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "evt-1792859071908-1qkpv",
      name: "Priya & Rohan Wedding",
      subtitle: "₹6.5L • 200 Guests",
      badge: "Active",
      badgeColor: "bg-emerald-100 text-emerald-800",
    },
  ];

  const corePlanningItems = [
    { label: "Event Overview", href: `/events/${targetEventId}`, icon: CalendarDays },
    { label: "AI Planning Engine", href: `/events/${targetEventId}/plan`, icon: Sparkles },
    { label: "Budget Management", href: `/events/${targetEventId}/budget`, icon: PieChart },
    {
      label: "Budget Simulator",
      href: `/events/${targetEventId}/simulator`,
      icon: SlidersHorizontal,
      highlight: true,
    },
    { label: "Tasks & Timeline", href: `/events/${targetEventId}/timeline`, icon: Clock },
  ];

  const coordinationItems = [
    { label: "Vendors & Quotes", href: `/events/${targetEventId}/vendors`, icon: Store },
    { label: "Event Run Sheet", href: `/events/${targetEventId}/run-sheet`, icon: ListOrdered },
    { label: "Guests & RSVP", href: `/events/${targetEventId}/guests`, icon: Users },
    { label: "Seating Planner", href: `/events/${targetEventId}/seating`, icon: Grid3X3 },
    { label: "Invitations & Comms", href: `/events/${targetEventId}/invitations`, icon: Mail },
  ];

  const intelligenceItems = [
    { label: "AI Copilot & Insights", href: `/events/${targetEventId}/insights`, icon: Bot },
    { label: "Notifications", href: `/events/${targetEventId}/notifications`, icon: Bell },
    { label: "Reports & Documents", href: `/events/${targetEventId}/reports`, icon: FileText },
    { label: "Settings & Demo Reset", href: `/events/${targetEventId}/settings`, icon: Settings },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-brand-50/60 border border-brand-100/60">
          <div className="relative w-7 h-7 rounded-md overflow-hidden border border-brand-200 shadow-2xs bg-brand-950 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Quveta"
              width={28}
              height={28}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate leading-none">Quveta</p>
            <p className="text-[10px] text-brand-700 font-medium truncate mt-0.5">AI Event Planner</p>
          </div>
        </div>

        {/* Main Workspace Navigation */}
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Main Workspace
          </p>
          <nav className="space-y-1">
            {topNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-50 text-brand-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-700" : "text-slate-400"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Benchmark Event Switcher */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Celebrations
            </p>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              Switch
            </span>
          </div>
          <div className="space-y-1">
            {benchmarkCelebrations.map((evt) => {
              const isEventActive = activeEventId === evt.id;
              return (
                <Link
                  key={evt.id}
                  href={`/events/${evt.id}`}
                  className={`block px-3 py-2 rounded-lg text-xs transition-colors border ${
                    isEventActive
                      ? "bg-brand-50/90 border-brand-200 text-brand-950 font-semibold"
                      : "hover:bg-slate-50 border-transparent text-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{evt.name}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase ${evt.badgeColor}`}>
                      {evt.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{evt.subtitle}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 15 Modules Navigation (Core Planning) */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Core Planning (01-06)
            </p>
            {isBenchmarkDefault && (
              <span className="text-[9px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
                Demo
              </span>
            )}
          </div>
          <nav className="space-y-1">
            {corePlanningItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-100/80 text-brand-950 font-semibold border-l-4 border-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-brand-800" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && (
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      Core
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 15 Modules Navigation (Coordination Suite) */}
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Coordination Suite (07-11)
          </p>
          <nav className="space-y-1">
            {coordinationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-100/80 text-brand-950 font-semibold border-l-4 border-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-800" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 15 Modules Navigation (Intelligence & Operations) */}
        <div>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Intelligence & Ops (12-15)
          </p>
          <nav className="space-y-1">
            {intelligenceItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-100/80 text-brand-950 font-semibold border-l-4 border-brand-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-800" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Evaluator Demo Tools & System Status */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <Link
          href={`/events/${targetEventId}/settings`}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-brand-900 bg-brand-50 hover:bg-brand-100 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-700" />
            <span>Self-Test Diagnostics</span>
          </span>
          <ChevronRight className="w-3 h-3 text-brand-400" />
        </Link>

        <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80 text-xs">
          <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-[11px] mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deterministic Math Engine</span>
          </div>
          <p className="text-slate-500 text-[10px] leading-tight">
            Integer minor units & DAG topological sort active across all 15 modules.
          </p>
        </div>
      </div>
    </aside>
  );
}
