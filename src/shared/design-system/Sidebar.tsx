"use client";

import React from "react";
import Link from "next/link";
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
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  // Check if we are inside an event sub-route: /events/[id]/*
  const eventMatch = pathname.match(/^\/events\/([^\/]+)/);
  const activeEventId = eventMatch && eventMatch[1] !== "new" ? eventMatch[1] : null;

  const topNavItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "New Event Wizard", href: "/events/new", icon: PlusCircle },
  ];

  const corePlanningItems = activeEventId
    ? [
        { label: "Event Overview", href: `/events/${activeEventId}`, icon: CalendarDays },
        { label: "AI Planning Engine", href: `/events/${activeEventId}/plan`, icon: Sparkles },
        { label: "Budget Management", href: `/events/${activeEventId}/budget`, icon: PieChart },
        {
          label: "Budget Simulator",
          href: `/events/${activeEventId}/simulator`,
          icon: SlidersHorizontal,
          highlight: true,
        },
        { label: "Tasks & Timeline", href: `/events/${activeEventId}/timeline`, icon: Clock },
      ]
    : [];

  const coordinationItems = activeEventId
    ? [
        { label: "Vendors & Quotes", href: `/events/${activeEventId}/vendors`, icon: Store },
        { label: "Event Run Sheet", href: `/events/${activeEventId}/run-sheet`, icon: ListOrdered },
        { label: "Guests & RSVP", href: `/events/${activeEventId}/guests`, icon: Users },
        { label: "Seating Planner", href: `/events/${activeEventId}/seating`, icon: Grid3X3 },
        { label: "Invitations & Comms", href: `/events/${activeEventId}/invitations`, icon: Mail },
      ]
    : [];

  const intelligenceItems = activeEventId
    ? [
        { label: "AI Copilot & Insights", href: `/events/${activeEventId}/insights`, icon: Bot },
        { label: "Notifications", href: `/events/${activeEventId}/notifications`, icon: Bell },
        { label: "Reports & Documents", href: `/events/${activeEventId}/reports`, icon: FileText },
        { label: "Settings & Demo Reset", href: `/events/${activeEventId}/settings`, icon: Settings },
      ]
    : [];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1">
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

        {activeEventId && (
          <>
            <div>
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Core Planning
                </p>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
                  Live
                </span>
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

            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Coordination Suite
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

            <div>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Intelligence & Operations
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
          </>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <div className="rounded-lg bg-brand-50/80 p-3 border border-brand-100 text-xs">
          <div className="flex items-center gap-1.5 text-brand-900 font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-700" />
            <span>Deterministic Engine</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            All financial totals & DAG dates run on verified application math.
          </p>
        </div>
      </div>
    </aside>
  );
}
