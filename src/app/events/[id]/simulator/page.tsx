"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Check,
  RefreshCw,
  Info,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Button } from "@/shared/design-system/Button";
import { Badge } from "@/shared/design-system/Badge";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import { getBudgetDetailsAction } from "@/modules/budget/server/budget.actions";
import {
  runSimulationAction,
  getScenarioDetailsAction,
  updateRecommendationStatusAction,
  applyApprovedScenarioAction,
} from "@/modules/simulator/server/simulator.actions";
import { formatMoney, toMajorUnits, fromMajorUnits, createMoney } from "@/shared/types/money";

export default function AdaptiveBudgetSimulatorPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [scenarioDetails, setScenarioDetails] = useState<any>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulation Parameters Form
  const [proposedBudgetMajor, setProposedBudgetMajor] = useState<number>(0);
  const [proposedGuestCount, setProposedGuestCount] = useState<number>(0);
  const [revisedPriorities, setRevisedPriorities] = useState<Record<string, any>>({});
  const [customNotes, setCustomNotes] = useState<string>("");

  useEffect(() => {
    async function init() {
      setLoading(true);
      const res = await getBudgetDetailsAction(eventId);
      if (res) {
        setEventData(res);
        setProposedBudgetMajor(toMajorUnits(createMoney(res.event.target_budget, res.event.currency)));
        setProposedGuestCount(res.event.guest_count);

        const pMap: Record<string, any> = {};
        res.categories.forEach((c: any) => {
          pMap[c.id] = c.priority;
        });
        setRevisedPriorities(pMap);
      }
      setLoading(false);
    }
    init();
  }, [eventId]);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setErrorMessage(null);
    setApplySuccess(false);

    const result = await runSimulationAction(eventId, {
      proposedBudgetMajor: Number(proposedBudgetMajor),
      proposedGuestCount: Number(proposedGuestCount),
      revisedPriorities,
      customNotes: customNotes.trim() || undefined,
    });

    if (result.success) {
      setActiveScenarioId(result.data.scenarioId);
      const details = await getScenarioDetailsAction(result.data.scenarioId);
      setScenarioDetails(details);
    } else {
      setErrorMessage(result.error);
    }
    setIsSimulating(false);
  };

  const handleToggleRecommendation = async (recId: string, currentStatus: string) => {
    if (!activeScenarioId) return;
    const newStatus = currentStatus === "ACCEPTED" ? "REJECTED" : "ACCEPTED";

    // Optimistically update UI
    setScenarioDetails((prev: any) => {
      if (!prev) return prev;
      const updatedRecs = prev.recommendations.map((r: any) =>
        r.id === recId ? { ...r, status: newStatus } : r
      );

      // Recalculate impact deterministically in state
      let netSavings = 0;
      for (const r of updatedRecs) {
        if (r.status === "ACCEPTED") {
          netSavings += -r.diff_amount;
        }
      }
      const baselineDeficit = updatedRecs.reduce((acc: number, r: any) => {
        return r.diff_amount < 0 ? acc + Math.abs(r.diff_amount) : acc;
      }, 0);

      const remDeficit = baselineDeficit - netSavings;

      return {
        ...prev,
        recommendations: updatedRecs,
        impact: {
          netSavings: createMoney(Math.max(0, netSavings), prev.currency),
          remainingDeficit: createMoney(remDeficit, prev.currency),
          isBudgetBalanced: remDeficit <= 0,
          projectedSpend: createMoney(prev.scenario.proposed_budget + remDeficit, prev.currency),
        },
      };
    });

    await updateRecommendationStatusAction(activeScenarioId, recId, newStatus as any);
  };

  const handleApplyChanges = async () => {
    if (!activeScenarioId) return;
    setIsApplying(true);
    setErrorMessage(null);

    const result = await applyApprovedScenarioAction(activeScenarioId);
    if (result.success) {
      setApplySuccess(true);
      // Reload underlying event data
      const refreshed = await getBudgetDetailsAction(eventId);
      setEventData(refreshed);
    } else {
      setErrorMessage(result.error);
    }
    setIsApplying(false);
  };

  if (loading || !eventData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Initializing Adaptive Simulator...</p>
        </div>
      </div>
    );
  }

  const { event, categories, lineItems, summary } = eventData;
  const currentBudgetMajor = toMajorUnits(createMoney(event.target_budget, event.currency));
  const budgetDeltaMajor = proposedBudgetMajor - currentBudgetMajor;
  const guestDelta = proposedGuestCount - event.guest_count;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
              <SlidersHorizontal className="w-6 h-6 text-brand-700" />
              <span>Adaptive Budget Simulator</span>
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              Signature Feature
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Simulate constraint shifts, inspect mathematically grounded trade-offs, and approve selective adjustments.
          </p>
        </div>

        {scenarioDetails && !applySuccess && (
          <Button
            size="sm"
            onClick={handleApplyChanges}
            isLoading={isApplying}
            className="gap-2 shadow-md bg-gradient-to-r from-emerald-700 to-emerald-600 text-white font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Approved Changes</span>
          </Button>
        )}
      </div>

      {applySuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-sm flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Approved changes committed!</strong> Budget targets, guest headcounts, and category allocations have been updated in the database.
            </span>
          </div>
          <Link href={`/events/${eventId}/budget`}>
            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-emerald-300">
              <span>View Updated Budget</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-sm flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Simulator Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Simulation Parameters Card */}
        <Card className="lg:col-span-1 space-y-5 border-brand-200 bg-white">
          <CardHeader
            title="Scenario Parameters"
            subtitle="Adjust constraints to see instant consequences."
          />

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Target Budget (₹)</label>
                <span
                  className={`text-[11px] font-bold ${
                    budgetDeltaMajor < 0 ? "text-red-600" : budgetDeltaMajor > 0 ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {budgetDeltaMajor !== 0 && (budgetDeltaMajor > 0 ? `+₹${budgetDeltaMajor.toLocaleString("en-IN")}` : `-₹${Math.abs(budgetDeltaMajor).toLocaleString("en-IN")}`)}
                </span>
              </div>
              <input
                type="range"
                min={Math.round(currentBudgetMajor * 0.5)}
                max={Math.round(currentBudgetMajor * 1.5)}
                step={10000}
                value={proposedBudgetMajor}
                onChange={(e) => setProposedBudgetMajor(Number(e.target.value))}
                className="w-full accent-brand-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <Input
                type="number"
                step={5000}
                value={proposedBudgetMajor}
                onChange={(e) => setProposedBudgetMajor(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Guest Headcount</label>
                <span
                  className={`text-[11px] font-bold ${
                    guestDelta > 0 ? "text-amber-600" : guestDelta < 0 ? "text-blue-600" : "text-slate-400"
                  }`}
                >
                  {guestDelta !== 0 && (guestDelta > 0 ? `+${guestDelta} guests` : `${guestDelta} guests`)}
                </span>
              </div>
              <input
                type="range"
                min={20}
                max={Math.round(event.guest_count * 2)}
                step={5}
                value={proposedGuestCount}
                onChange={(e) => setProposedGuestCount(Number(e.target.value))}
                className="w-full accent-brand-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <Input
                type="number"
                value={proposedGuestCount}
                onChange={(e) => setProposedGuestCount(Number(e.target.value))}
                className="mt-1.5"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700 block mb-2">
                Protected Priorities
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="flex items-center justify-between text-xs">
                    <span className="truncate max-w-[130px] text-slate-700 font-medium">{cat.name}</span>
                    <select
                      className="text-[11px] rounded border border-slate-300 px-2 py-1 bg-white font-semibold"
                      value={revisedPriorities[cat.id] || cat.priority}
                      onChange={(e) =>
                        setRevisedPriorities({
                          ...revisedPriorities,
                          [cat.id]: e.target.value,
                        })
                      }
                    >
                      <option value="MUST_HAVE">MUST HAVE</option>
                      <option value="HIGH">HIGH</option>
                      <option value="FLEXIBLE">FLEXIBLE</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Input
                label="Organizer Context / Trade-off Notes"
                placeholder="e.g. Venue is non-negotiable; prefer cutting decor instead of food."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
              />
            </div>

            <Button
              onClick={handleRunSimulation}
              isLoading={isSimulating}
              className="w-full gap-2 shadow-sm bg-brand-800 text-white font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simulate Scenario Impact</span>
            </Button>
          </div>
        </Card>

        {/* Right Column: Comparative Analysis & Trade-Off Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Side-by-Side Comparison Header */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200 bg-white">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Plan</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatMoney(createMoney(event.target_budget, event.currency))}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{event.guest_count} guests</p>
              <p className="text-[11px] text-slate-400 mt-2">
                Cost per attendee: ₹{Math.round(toMajorUnits(createMoney(event.target_budget, event.currency)) / event.guest_count).toLocaleString("en-IN")}
              </p>
            </Card>

            <Card className="border-brand-300 bg-brand-50/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Proposed Scenario</p>
              <p className="text-xl font-extrabold text-brand-950 mt-1">
                {formatMoney(createMoney(fromMajorUnits(proposedBudgetMajor, event.currency).amount, event.currency))}
              </p>
              <p className="text-xs text-brand-800 mt-0.5">{proposedGuestCount} guests</p>
              <p className="text-[11px] text-brand-700 mt-2">
                Cost per attendee: ₹{proposedGuestCount > 0 ? Math.round(proposedBudgetMajor / proposedGuestCount).toLocaleString("en-IN") : 0}
              </p>
            </Card>
          </div>

          {/* When a simulation has been generated */}
          {scenarioDetails ? (
            <div className="space-y-5">
              {/* Scenario Resolution Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  scenarioDetails.impact.isBudgetBalanced
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : "bg-amber-50 border-amber-200 text-amber-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {scenarioDetails.impact.isBudgetBalanced ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-sm block">
                      {scenarioDetails.impact.isBudgetBalanced
                        ? "Scenario Fully Balanced"
                        : "Unresolved Deficit Remaining"}
                    </span>
                    <span className="text-slate-600">
                      Net savings accepted: {formatMoney(scenarioDetails.impact.netSavings)} • Projected Spend: {formatMoney(scenarioDetails.impact.projectedSpend)}
                    </span>
                  </div>
                </div>

                {!scenarioDetails.impact.isBudgetBalanced && (
                  <Badge variant="danger" className="text-xs font-bold">
                    Shortfall: {formatMoney(scenarioDetails.impact.remainingDeficit)}
                  </Badge>
                )}
              </div>

              {/* Trade-Off Recommendation Cards List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>Proposed Trade-off Recommendations ({scenarioDetails.recommendations.length})</span>
                    <Badge variant="neutral" className="text-[10px]">Deterministic Math + AI</Badge>
                  </h3>
                  <span className="text-[11px] text-slate-500">Toggle Accept/Reject to re-balance</span>
                </div>

                {scenarioDetails.recommendations.map((rec: any) => {
                  const isAccepted = rec.status === "ACCEPTED";
                  const isSaving = rec.diff_amount < 0;

                  return (
                    <div
                      key={rec.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isAccepted
                          ? "bg-white border-brand-300 shadow-sm"
                          : "bg-slate-50/70 border-slate-200 opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{rec.action}</span>
                            <Badge
                              variant={isSaving ? "success" : "warning"}
                              className="text-[10px] font-bold"
                            >
                              {isSaving ? (
                                <span className="flex items-center gap-1">
                                  <TrendingDown className="w-3 h-3" />
                                  Save {formatMoney(createMoney(Math.abs(rec.diff_amount), scenarioDetails.currency))}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Add {formatMoney(createMoney(rec.diff_amount, scenarioDetails.currency))}
                                </span>
                              )}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {rec.trade_off_explanation}
                          </p>

                          <div className="text-[10px] text-slate-400 flex items-center gap-3 pt-1">
                            <span>
                              Current: {formatMoney(createMoney(rec.current_amount, scenarioDetails.currency))}
                            </span>
                            <span>→</span>
                            <span className="font-semibold text-slate-700">
                              Proposed: {formatMoney(createMoney(rec.proposed_amount, scenarioDetails.currency))}
                            </span>
                          </div>
                        </div>

                        {/* Accept / Reject Toggle Button */}
                        <div className="flex-shrink-0">
                          <Button
                            size="sm"
                            variant={isAccepted ? "primary" : "outline"}
                            onClick={() => handleToggleRecommendation(rec.id, rec.status)}
                            className={`text-xs gap-1.5 ${
                              isAccepted
                                ? "bg-emerald-700 hover:bg-emerald-800 text-white"
                                : "text-slate-600"
                            }`}
                          >
                            {isAccepted ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Accepted</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Rejected</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Apply Action Bar */}
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <h4 className="text-sm font-bold">Ready to commit approved changes?</h4>
                  <p className="text-xs text-slate-400">
                    Applying updates live budget records, guest count, and category allocations atomically.
                  </p>
                </div>

                <Button
                  size="md"
                  onClick={handleApplyChanges}
                  isLoading={isApplying}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 flex-shrink-0 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit Approved Scenario</span>
                </Button>
              </div>
            </div>
          ) : (
            <Card className="text-center py-12 border-dashed border-slate-300 bg-slate-50/50 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-800 flex items-center justify-center mx-auto">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Run Simulation to Generate Trade-Off Recommendations
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Modify the budget slider or guest count on the left, then click Simulate to evaluate options without modifying the saved plan.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
