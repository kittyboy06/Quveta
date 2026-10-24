"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  ListTodo,
} from "lucide-react";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Button } from "@/shared/design-system/Button";
import { Badge } from "@/shared/design-system/Badge";
import { generatePlanAction, commitPlanToEventAction } from "@/modules/ai-engine/server/ai.actions";
import { getEventAction } from "@/modules/events/server/event.actions";
import { EventPlan } from "@/modules/ai-engine/domain/plan.schema";

export default function AIPlanningPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [provider, setProvider] = useState<string>("");
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const evt = await getEventAction(eventId);
      setEvent(evt);
      setLoading(false);
    }
    load();
  }, [eventId]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setCommitSuccess(false);

    const result = await generatePlanAction(eventId);
    if (result.success) {
      setPlan(result.data.plan);
      setProvider(result.data.provider);
    } else {
      setError(result.error);
    }
    setGenerating(false);
  };

  const handleCommit = async () => {
    if (!plan) return;
    setCommitting(true);
    setError(null);

    const result = await commitPlanToEventAction(eventId, plan);
    if (result.success) {
      setCommitSuccess(true);
    } else {
      setError(result.error);
    }
    setCommitting(false);
  };

  if (loading || !event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <Sparkles className="w-6 h-6 text-brand-700" />
            <span>AI Event Planning Engine</span>
          </h1>
          <p className="text-xs text-slate-500">
            Generate personalized, constraint-aware execution plans validated against strict domain schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleGenerate}
            isLoading={generating}
            className="gap-2 shadow-sm bg-brand-800 text-white"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{plan ? "Regenerate Plan" : "Generate AI Plan"}</span>
          </Button>

          {plan && !commitSuccess && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCommit}
              isLoading={committing}
              className="gap-2 bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Commit Plan to Event</span>
            </Button>
          )}
        </div>
      </div>

      {commitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Plan successfully committed! Tasks and dependency relationships are now live.</span>
          </div>
          <Link href={`/events/${eventId}/timeline`}>
            <Button size="sm" variant="outline" className="text-xs gap-1 border-emerald-300">
              <span>View Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* When no plan is generated yet */}
      {!plan && !generating && (
        <Card className="text-center py-12 space-y-4 border-dashed border-slate-300 bg-slate-50/50">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-slate-900">
              Synthesize Personalized Plan for {event.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quveta will analyze your {event.guest_count} guest count, ₹{(event.target_budget / 100).toLocaleString("en-IN")} budget, protected must-haves, and event timeline to produce a structured roadmap.
            </p>
          </div>
          <Button onClick={handleGenerate} className="gap-2 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Generate Plan Proposal</span>
          </Button>
        </Card>
      )}

      {/* Generated Plan Workspace */}
      {plan && (
        <div className="space-y-6">
          {/* Engine Metadata Badge */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-brand-50/70 border border-brand-200 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-700" />
              <span className="font-semibold text-brand-950">Engine Provider:</span>
              <span className="text-brand-800 capitalize">
                {provider === "gemini" ? "Google Gemini 2.5 Flash (Strict JSON Schema)" : "Deterministic Domain Rule Engine (Zero-Downtime Fallback)"}
              </span>
            </div>
            <Badge variant="purple" className="text-[10px]">Schema Validated</Badge>
          </div>

          {/* Executive Summary */}
          <Card className="space-y-4">
            <CardHeader
              title="Executive Summary & Planning Strategy"
              subtitle="Holistic strategic direction tailored to your constraints."
            />
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-lg border border-slate-200">
              {plan.summary}
            </p>

            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Planning Assumptions & Lead-Time Baseline
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                {plan.assumptions.map((assump, i) => (
                  <li key={i}>{assump}</li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Milestones Breakdown */}
          <Card className="space-y-4">
            <CardHeader
              title="Critical Milestones"
              subtitle="Major anchor gates backward-scheduled from event day."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {plan.milestones.map((m, i) => (
                <div key={i} className="p-3.5 rounded-lg border border-slate-200 bg-white space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{m.title}</span>
                    <Badge variant="info" className="text-[10px]">
                      T-{m.daysBeforeEvent} Days
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{m.description}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Proposed Tasks & Dependencies */}
          <Card className="space-y-4">
            <CardHeader
              title="Proposed Tasks & Dependency Sequence"
              subtitle="Work items with priority rankings and prerequisite links."
            />
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Task Title</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Lead Time</th>
                    <th className="px-4 py-3">Prerequisites</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {plan.proposedTasks.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">{t.title}</td>
                      <td className="px-4 py-3 text-slate-600">{t.category}</td>
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
                      <td className="px-4 py-3 text-slate-600">T-{t.daysBeforeEvent} days</td>
                      <td className="px-4 py-3 text-[11px] text-slate-500">
                        {t.prerequisiteTitles && t.prerequisiteTitles.length > 0 ? (
                          t.prerequisiteTitles.join(", ")
                        ) : (
                          <span className="text-slate-400 italic">None (Ready)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Risk Analysis & Mitigations */}
          <Card className="space-y-4">
            <CardHeader
              title="Risk Assessment & Proactive Mitigations"
              subtitle="Operational vulnerabilities and recommended contingencies."
            />
            <div className="space-y-2.5">
              {plan.riskAnalysis.map((r, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-900">{r.risk}</span>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">
                      <strong className="text-slate-800">Mitigation:</strong> {r.mitigation}
                    </p>
                  </div>
                  <Badge variant={r.severity === "HIGH" ? "danger" : "warning"} className="text-[10px] flex-shrink-0">
                    {r.severity} Severity
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
