"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  LayoutGrid,
  Send,
  Bot,
  User,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Info,
  RefreshCw,
} from "lucide-react";
import { SeedEvent } from "@/shared/db/seed-data";
import {
  ReadinessScore,
  EventInsight,
  ChatMessage,
} from "@/modules/insights/domain/insights.schema";
import { queryAiDecisionAssistantAction } from "@/modules/insights/server/insights.actions";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";

interface InsightsClientViewProps {
  event: SeedEvent;
  initialReadiness: ReadinessScore;
  initialInsights: EventInsight[];
}

export function InsightsClientView({
  event,
  initialReadiness,
  initialInsights,
}: InsightsClientViewProps) {
  const [readiness] = useState<ReadinessScore>(initialReadiness);
  const [insights] = useState<EventInsight[]>(initialInsights);
  const [inputQuery, setInputQuery] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      role: "assistant",
      content: `Hello! I am your **Quveta AI Strategy & Decision Copilot** for **${event.title}**.\n\nI continuously monitor your budget, tasks, vendor quotes, guest responses, and seating arrangements to keep your celebration seamless. How can I help you optimize your plan today?`,
      timestamp: new Date().toISOString(),
      citations: [
        {
          module: "Readiness",
          label: "Current Readiness",
          value: `${initialReadiness.overallScore}/100 (${initialReadiness.status})`,
        },
      ],
      suggestedActions: [
        {
          label: "Assess Budget Overrun Risk",
          actionType: "NAVIGATE",
          target: `/events/${event.id}/budget`,
        },
        {
          label: "Check Overdue Task Dependencies",
          actionType: "NAVIGATE",
          target: `/events/${event.id}/timeline`,
        },
      ],
    },
  ]);

  const promptSuggestions = [
    "What is our current financial risk?",
    "Which tasks are blocking our timeline?",
    "Summarize guest attendance and seating gaps",
    "How ready are we for event day?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isQuerying) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query.trim(),
      timestamp: new Date().toISOString(),
      citations: [],
      suggestedActions: [],
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsQuerying(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await queryAiDecisionAssistantAction(event.id, query, historyPayload);
      if (res.success && res.message) {
        setMessages((prev) => [...prev, res.message!]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `I encountered an issue processing your query: ${res.error || "Please try again."}`,
            timestamp: new Date().toISOString(),
            citations: [],
            suggestedActions: [],
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I couldn't reach the assistant service. Please check your connection.",
          timestamp: new Date().toISOString(),
          citations: [],
          suggestedActions: [],
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
      case "ON_TRACK":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "WARNING":
      case "ATTENTION_NEEDED":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-rose-700 bg-rose-50 border-rose-200";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Event Hub
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Event Insights & Decision Assistant
            </h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Module 12
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Holistic cross-module intelligence, predictive readiness scoring, and grounded AI advisory.
          </p>
        </div>
      </div>

      {/* 1. Readiness Radar Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Readiness Gauge Card */}
        <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Readiness Score
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusColor(
                  readiness.status
                )}`}
              >
                {readiness.status.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center gap-6 my-4">
              <div className="relative flex items-center justify-center w-28 h-28 rounded-full border-8 border-indigo-100 bg-indigo-50/50 shadow-inner">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-indigo-900">
                    {readiness.overallScore}
                  </span>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">
                    / 100
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-slate-800">Operational Integrity</p>
                <p className="text-xs text-slate-500">
                  Calculated deterministically from 5 planning pillars across all 15 modules.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            {readiness.breakdownNotes.slice(0, 2).map((note, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 5-Pillar Breakdown (Spans 2 cols on lg) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Budget Pillar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Budget (25%)
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  {readiness.pillars.budget.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${readiness.pillars.budget.score}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{readiness.pillars.budget.details}</p>
          </div>

          {/* Tasks Pillar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Tasks (25%)
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  {readiness.pillars.tasks.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${readiness.pillars.tasks.score}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{readiness.pillars.tasks.details}</p>
          </div>

          {/* Vendors Pillar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Users className="w-4 h-4 text-indigo-600" />
                  Vendors (20%)
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  {readiness.pillars.vendors.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all"
                  style={{ width: `${readiness.pillars.vendors.score}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{readiness.pillars.vendors.details}</p>
          </div>

          {/* RSVP Pillar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  RSVP (15%)
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  {readiness.pillars.rsvp.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all"
                  style={{ width: `${readiness.pillars.rsvp.score}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{readiness.pillars.rsvp.details}</p>
          </div>

          {/* Seating Pillar */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <LayoutGrid className="w-4 h-4 text-amber-600" />
                  Seating (15%)
                </div>
                <span className="text-xs font-extrabold text-slate-900">
                  {readiness.pillars.seating.score}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all"
                  style={{ width: `${readiness.pillars.seating.score}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 truncate">{readiness.pillars.seating.details}</p>
          </div>

          {/* Link to Simulator */}
          <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-900">Need to adapt?</span>
              <p className="text-[11px] text-indigo-700 mt-1">
                Stress-test attendance drops and budget cuts before event day.
              </p>
            </div>
            <Link
              href={`/events/${event.id}/simulator`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2"
            >
              Open Simulator <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Proactive Risk & Recommendation Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            Proactive Risk & Action Feed
          </h2>
          <span className="text-xs text-slate-500">
            {insights.length} active recommendation{insights.length !== 1 ? "s" : ""}
          </span>
        </div>

        {insights.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 bg-slate-50 border-dashed">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">All Systems Harmonized</p>
            <p className="text-xs mt-1">
              No critical bottlenecks, overdue tasks, or unassigned seats detected.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins) => (
              <Card
                key={ins.id}
                className={`p-5 transition-shadow hover:shadow-md border-l-4 ${
                  ins.severity === "CRITICAL"
                    ? "border-l-rose-500"
                    : ins.severity === "WARNING"
                    ? "border-l-amber-500"
                    : "border-l-indigo-500"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {ins.severity === "CRITICAL" ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    ) : ins.severity === "WARNING" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    )}
                    <span className="font-bold text-sm text-slate-900">{ins.title}</span>
                  </div>
                  <Badge
                    variant={ins.severity === "CRITICAL" ? "destructive" : "secondary"}
                    className="text-[10px]"
                  >
                    {ins.severity}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 mb-3">{ins.description}</p>

                {ins.recommended_action && (
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-xs flex items-center justify-between gap-2 mt-2">
                    <span className="text-slate-700 font-medium">{ins.recommended_action}</span>
                    {ins.action_href && (
                      <Link
                        href={ins.action_href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                      >
                        {ins.action_label || "Resolve"} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 3. Interactive Event Decision Copilot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600" />
              Interactive Event Strategy Copilot
            </h2>
            <p className="text-xs text-slate-500">
              Ask any question about your event. The copilot pulls authoritative data from all 15 modules.
            </p>
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap gap-2">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-full transition-all text-slate-700"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <Card className="flex flex-col h-[520px] bg-slate-50/60 border-slate-200 overflow-hidden shadow-sm">
          {/* Scrollable Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === "user" ? "ml-auto justify-end" : "mr-auto"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-2xl p-4 shadow-sm text-sm space-y-2 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</div>

                  {/* Grounded Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block w-full">
                        Data Citations:
                      </span>
                      {msg.citations.map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          <span className="font-semibold text-slate-900">{c.label}:</span>
                          <span>{c.value}</span>
                          {c.href && (
                            <Link href={c.href} className="text-indigo-600 hover:underline">
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Suggested Next Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, i) => (
                        <Link
                          key={i}
                          href={act.target}
                          className="text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1"
                        >
                          {act.label} <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isQuerying && (
              <div className="flex gap-3 items-center text-slate-500 text-xs">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <span>Analyzing cross-module dependencies and consulting Gemini 2.5 Flash...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask anything about budget, tasks, vendors, RSVPs, or seating..."
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              disabled={isQuerying}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isQuerying || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 h-auto flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
