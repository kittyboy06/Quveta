"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Activity,
  Download,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Database,
  Lock,
  History,
  Save,
} from "lucide-react";
import { SeedEvent, SeedEventSettings, SeedAuditLog } from "@/shared/db/seed-data";
import { DiagnosticReport, EventSettingsFormData } from "@/modules/settings/domain/settings.schema";
import {
  updateEventSettingsAction,
  resetSampleEventAction,
  runSystemDiagnosticAction,
  exportEventBackupAction,
} from "@/modules/settings/server/settings.actions";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";

interface SettingsClientViewProps {
  event: SeedEvent;
  initialSettings: SeedEventSettings | null;
  initialDiagnostic: DiagnosticReport | null;
  auditLogs: SeedAuditLog[];
}

export function SettingsClientView({
  event,
  initialSettings,
  initialDiagnostic,
  auditLogs,
}: SettingsClientViewProps) {
  const [formData, setFormData] = useState<EventSettingsFormData>({
    currency: (initialSettings?.currency as any) || (event.currency as any) || "INR",
    timezone: initialSettings?.timezone || "Asia/Kolkata",
    notifications_enabled: initialSettings?.notifications_enabled ?? true,
    ai_features_enabled: initialSettings?.ai_features_enabled ?? true,
    privacy_mode: initialSettings?.privacy_mode ?? false,
  });

  const [diagnostic, setDiagnostic] = useState<DiagnosticReport | null>(initialDiagnostic);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await updateEventSettingsAction(event.id, formData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetBenchmark = async () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all 15 modules back to the pristine competition seed benchmark? This will restore original budgets, tasks, vendors, guests, and run sheets."
      )
    ) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetSampleEventAction(event.id);
      if (res.success) {
        window.location.reload();
      }
    } finally {
      setIsResetting(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      const rep = await runSystemDiagnosticAction(event.id);
      if (rep) {
        setDiagnostic(rep);
      }
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const res = await exportEventBackupAction(event.id);
      if (res.success && res.jsonString) {
        const blob = new Blob([res.jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", res.filename || "quveta_backup.json");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Settings & Administration
            </h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <Settings className="w-3 h-3 mr-1 inline" />
              Module 15
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Global configuration, evaluator demo tools, live system diagnostics, and audit logs.
          </p>
        </div>

        {/* JSON Backup Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadBackup}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs text-slate-700 bg-white"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? "Exporting..." : "Download JSON Backup"}
          </Button>
        </div>
      </div>

      {/* 1. Evaluator Demo Toolkit Card */}
      <Card className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Evaluator Demo Toolkit</h2>
              <Badge className="bg-indigo-600 text-white text-[10px] font-bold">1-Click Reset</Badge>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Testing simulated delays, accepted quotes, or guest dietary adjustments? Restore the entire 15-module system back to the official competition benchmark seed in 1 click.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={handleResetBenchmark}
              disabled={isResetting}
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs flex items-center gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin" : ""}`} />
              {isResetting ? "Resetting State..." : "Reset to Pristine Benchmark"}
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. Grid: General Preferences & System Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: General Settings Form */}
        <Card className="p-6 bg-white border-slate-200">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Settings className="w-4 h-4 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Event Preferences</h2>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST - UTC+5:30)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST / EDT)</option>
                <option value="Europe/London">Europe/London (GMT / BST)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span>Enable Real-time Automation Alerts</span>
                <input
                  type="checkbox"
                  checked={formData.notifications_enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, notifications_enabled: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span>Enable AI Strategy Copilot (Gemini 2.5 Flash)</span>
                <input
                  type="checkbox"
                  checked={formData.ai_features_enabled}
                  onChange={(e) =>
                    setFormData({ ...formData, ai_features_enabled: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs font-medium text-slate-700 cursor-pointer">
                <span>Privacy Mode (Mask guest phone numbers & emails)</span>
                <input
                  type="checkbox"
                  checked={formData.privacy_mode}
                  onChange={(e) =>
                    setFormData({ ...formData, privacy_mode: e.target.checked })
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Preferences Saved!
                </span>
              ) : (
                <span />
              )}
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Right: Live System Diagnostic & Integrity Card */}
        <Card className="p-6 bg-white border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h2 className="text-base font-bold text-slate-900">System Self-Test & Diagnostics</h2>
              </div>
              <Badge
                variant={diagnostic?.overallStatus === "HEALTHY" ? "secondary" : "destructive"}
                className={
                  diagnostic?.overallStatus === "HEALTHY"
                    ? "bg-emerald-100 text-emerald-800 text-[10px]"
                    : "text-[10px]"
                }
              >
                {diagnostic?.overallStatus || "READY"}
              </Badge>
            </div>

            {diagnostic && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      Storage Latency
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-0.5 block">
                      {diagnostic.storageLatencyMs} ms
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">
                      AI Provider
                    </span>
                    <span className="text-xs font-bold text-indigo-700 mt-1 block">
                      {diagnostic.geminiApiStatus === "CONFIGURED"
                        ? "Gemini 2.5 Flash (Online)"
                        : "Deterministic Expert Fallback"}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">Relational FK Integrity:</span>
                    <span
                      className={`font-bold ${
                        diagnostic.relationalIntegrity.passed
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      {diagnostic.relationalIntegrity.passed ? "0 Orphaned Records" : "Integrity Issues"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Audited cross-module relations across line items, quotes, tasks, guests, and seating.
                  </p>
                </div>

                {/* Entity Counts Grid */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Active Entity Counts Across 15 Modules:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.budgetLineItems || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Budget Items</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.tasks || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Tasks</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.vendors || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Vendors</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.guests || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Guests</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.seatingTables || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Tables</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.runSheetItems || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Run Cues</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.notifications || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Alerts</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="font-extrabold text-slate-800 block">
                        {diagnostic.recordCounts.quotations || 0}
                      </span>
                      <span className="text-slate-400 text-[10px]">Quotes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunDiagnostic}
              disabled={isRunningDiagnostic}
              className="text-xs text-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningDiagnostic ? "animate-spin" : ""}`} />
              Run Self-Test Diagnostic
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. Audit Trail Table */}
      <Card className="p-6 bg-white border-slate-200">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Event Audit Trail & Activity Log</h2>
          </div>
          <span className="text-xs text-slate-400">{auditLogs.length} logged actions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity Type</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    No audit records logged yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{log.actor}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{log.entity_type}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-md truncate">
                      {log.details || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
