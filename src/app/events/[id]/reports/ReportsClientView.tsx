"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  Download,
  Printer,
  Sparkles,
  DollarSign,
  Users,
  CalendarDays,
  LayoutGrid,
  Building,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { SeedEvent } from "@/shared/db/seed-data";
import { ReportType, ReportSnapshot } from "@/modules/reports/domain/report.schema";
import { getReportSnapshotAction, exportReportCsvAction } from "@/modules/reports/server/report.actions";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";

interface ReportsClientViewProps {
  event: SeedEvent;
  initialSnapshot: ReportSnapshot;
}

export function ReportsClientView({ event, initialSnapshot }: ReportsClientViewProps) {
  const [currentType, setCurrentType] = useState<ReportType>(initialSnapshot.reportType);
  const [snapshot, setSnapshot] = useState<ReportSnapshot>(initialSnapshot);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const reportTabs: { id: ReportType; label: string; icon: React.ReactNode }[] = [
    { id: "EXECUTIVE_SUMMARY", label: "Executive Summary", icon: <FileText className="w-4 h-4" /> },
    { id: "BUDGET_AUDIT", label: "Budget Audit", icon: <DollarSign className="w-4 h-4" /> },
    { id: "GUEST_DIETARY_ROSTER", label: "Guest & Dietary Manifest", icon: <Users className="w-4 h-4" /> },
    { id: "SEATING_MANIFEST", label: "Seating Chart", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "RUN_SHEET_CUES", label: "Operational Run Sheet", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "VENDOR_DIRECTORY", label: "Vendor Directory", icon: <Building className="w-4 h-4" /> },
  ];

  const handleSelectTab = async (type: ReportType) => {
    if (type === currentType || isLoading) return;
    setCurrentType(type);
    setIsLoading(true);

    try {
      const snap = await getReportSnapshotAction(event.id, type);
      if (snap) {
        setSnapshot(snap);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    setIsExporting(true);
    try {
      const res = await exportReportCsvAction(event.id, currentType);
      if (res.success && res.csvString) {
        const blob = new Blob([res.csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", res.filename || "quveta_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Screen-Only Header & Controls */}
      <div className="print:hidden space-y-6">
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
                Reports, Exports & Documents
              </h1>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <FileText className="w-3 h-3 mr-1 inline" />
                Module 14
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Production-ready document generation, RFC-4180 CSV data exports, and high-fidelity print layouts.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCsv}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? "Exporting..." : "Download CSV"}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* Report Type Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {reportTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              disabled={isLoading}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
                currentType === tab.id
                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-10 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900">QUVETA</span>
              <span className="text-xs uppercase tracking-widest text-indigo-600 font-bold border-l border-slate-300 pl-2">
                Official Event Document
              </span>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Generated: {new Date(snapshot.generatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{snapshot.title}</h2>
            <p className="text-xs text-slate-600 mt-1">{snapshot.subtitle}</p>
          </div>
        </div>

        {/* Summary Stats Cards */}
        {snapshot.summaryStats && snapshot.summaryStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {snapshot.summaryStats.map((stat, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 print:border print:bg-white"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  {stat.label}
                </span>
                <span className="text-lg font-extrabold text-slate-900 block mt-1">
                  {stat.value}
                </span>
                {stat.subtext && (
                  <span className="text-[10px] text-slate-500 block mt-0.5">{stat.subtext}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tabular Data View */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            <span>Assembling authoritative cross-module records...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 bg-slate-50 print:bg-slate-100">
                  {snapshot.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="py-3 px-3.5 font-bold uppercase tracking-wider text-slate-700"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {snapshot.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={snapshot.columns.length}
                      className="py-8 text-center text-slate-400 italic"
                    >
                      No records found for this report.
                    </td>
                  </tr>
                ) : (
                  snapshot.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-slate-50/70 transition-colors print:hover:bg-transparent"
                    >
                      {row.map((cell, cIdx) => (
                        <td
                          key={cIdx}
                          className="py-3 px-3.5 text-slate-800 leading-relaxed break-words"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Document Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400">
          <span>Quveta Event Operating System — Authoritative Planning Record</span>
          <span className="font-mono">Document Hash: {snapshot.reportType}-{event.id}</span>
        </div>
      </div>
    </div>
  );
}
