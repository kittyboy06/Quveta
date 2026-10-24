"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ListOrdered,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  PlayCircle,
  AlertTriangle,
  RotateCcw,
  Printer,
  X,
  Phone,
  User,
  MapPin,
  Sparkles,
} from "lucide-react";
import {
  SeedRunSheetItem,
  SeedRunSheetIncident,
  SeedVendor,
  SeedEvent,
} from "@/shared/db/seed-data";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import {
  createRunSheetItemAction,
  updateRunSheetStatusAction,
  logIncidentAction,
  resolveIncidentAction,
  applyScheduleRecoveryAction,
} from "@/modules/run-sheet/server/run-sheet.actions";
import {
  analyzeScheduleDelay,
  ScheduleImpactAnalysis,
} from "@/modules/run-sheet/domain/delay.engine";
import {
  RunSheetCategory,
  RunSheetStatus,
  IncidentSeverity,
} from "@/modules/run-sheet/domain/run-sheet.schema";

interface RunSheetClientViewProps {
  event: SeedEvent;
  items: SeedRunSheetItem[];
  incidents: SeedRunSheetIncident[];
  vendors: SeedVendor[];
}

export function RunSheetClientView({ event, items, incidents, vendors }: RunSheetClientViewProps) {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedItemForIncident, setSelectedItemForIncident] = useState<string>("");
  const [delaySimulationOpen, setDelaySimulationOpen] = useState(false);
  const [simulatedDelayedItemId, setSimulatedDelayedItemId] = useState<string>(items[1]?.id || "");
  const [simulatedDelayMinutes, setSimulatedDelayMinutes] = useState<number>(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for new item
  const [newTitle, setNewTitle] = useState("");
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [newCategory, setNewCategory] = useState<RunSheetCategory>("CEREMONY");
  const [newLocation, setNewLocation] = useState("");
  const [newResponsible, setNewResponsible] = useState("");
  const [newVendorId, setNewVendorId] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Form states for incident
  const [incidentSeverity, setIncidentSeverity] = useState<IncidentSeverity>("MEDIUM");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [incidentReporter, setIncidentReporter] = useState("Stage Coordinator");

  const vendorMap = new Map(vendors.map((v) => [v.id, v]));

  // Find active cue
  const activeItem = items.find((i) => i.status === "IN_PROGRESS") || items.find((i) => i.status === "SCHEDULED");
  const completedCount = items.filter((i) => i.status === "COMPLETED").length;
  const delayedCount = items.filter((i) => i.status === "DELAYED").length;

  // Run delay analysis
  const delayImpact: ScheduleImpactAnalysis | null =
    simulatedDelayedItemId && simulatedDelayMinutes > 0
      ? analyzeScheduleDelay(items, simulatedDelayedItemId, simulatedDelayMinutes, "23:00")
      : null;

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await createRunSheetItemAction(event.id, {
      title: newTitle,
      scheduled_start_time: newStart,
      scheduled_end_time: newEnd,
      category: newCategory,
      location: newLocation || undefined,
      responsible_person: newResponsible || undefined,
      vendor_id: newVendorId || undefined,
      status: "SCHEDULED",
      notes: newNotes || undefined,
      sequence_order: items.length + 1,
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowAddItemModal(false);
      setStatusMessage({ type: "success", text: "Run sheet item added." });
      setNewTitle("");
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to add item." });
    }
  };

  const handleStatusChange = async (itemId: string, status: RunSheetStatus) => {
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await updateRunSheetStatusAction(event.id, itemId, status);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: `Status updated to ${status}.` });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to update status." });
    }
  };

  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await logIncidentAction(event.id, {
      run_sheet_item_id: selectedItemForIncident || undefined,
      severity: incidentSeverity,
      description: incidentDesc,
      reported_by: incidentReporter,
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowIncidentModal(false);
      setIncidentDesc("");
      setStatusMessage({ type: "success", text: "Incident logged successfully." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to log incident." });
    }
  };

  const handleApplyRecovery = async () => {
    if (!simulatedDelayedItemId || simulatedDelayMinutes <= 0) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await applyScheduleRecoveryAction(event.id, simulatedDelayedItemId, simulatedDelayMinutes);
    setIsSubmitting(false);
    if (res.success) {
      setDelaySimulationOpen(false);
      setStatusMessage({ type: "success", text: "Schedule recovery applied across timeline!" });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to apply recovery." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/events/${event.id}`}
              className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Event Hub</span>
            </Link>
            <span className="text-slate-300">•</span>
            <Badge variant="purple">Module 08</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ListOrdered className="w-6 h-6 text-brand-700" />
            <span>Event-Day Run Sheet & Live Coordination</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time stage cues, responsible vendor dispatch, incident logs, and non-destructive delay recovery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDelaySimulationOpen(!delaySimulationOpen)}
            className="gap-1.5 border-amber-300 text-amber-900 hover:bg-amber-50"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            <span>Delay Simulation</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedItemForIncident(activeItem?.id || "");
              setShowIncidentModal(true);
            }}
            className="gap-1.5 border-rose-300 text-rose-900 hover:bg-rose-50"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Report Incident</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Cue Sheet</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddItemModal(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Cue</span>
          </Button>
        </div>
      </div>

      {/* Status Toasts */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Currently Active Cue Banner */}
      {activeItem && (
        <div className="rounded-2xl bg-gradient-to-r from-brand-900 to-indigo-900 text-white p-6 shadow-md border border-brand-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                  {activeItem.status === "IN_PROGRESS" ? "Active Now on Ground" : "Next Upcoming Cue"}
                </span>
                <Badge variant="purple" className="text-[10px] bg-brand-800 text-brand-200 border-brand-700">
                  {activeItem.category}
                </Badge>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white">{activeItem.title}</h2>

              <div className="flex items-center gap-4 text-xs sm:text-sm text-brand-200 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>
                    {activeItem.scheduled_start_time} – {activeItem.scheduled_end_time}
                  </span>
                </div>
                {activeItem.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    <span>{activeItem.location}</span>
                  </div>
                )}
                {activeItem.responsible_person && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-brand-400" />
                    <span>{activeItem.responsible_person}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {activeItem.status !== "IN_PROGRESS" ? (
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleStatusChange(activeItem.id, "IN_PROGRESS")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Start Cue</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => handleStatusChange(activeItem.id, "COMPLETED")}
                  className="bg-emerald-400 hover:bg-emerald-500 text-brand-950 font-bold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Complete</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSimulatedDelayedItemId(activeItem.id);
                  setDelaySimulationOpen(true);
                }}
                className="bg-brand-800/60 border-brand-700 text-white hover:bg-brand-800 text-xs"
              >
                Log Delay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delay Simulation Panel */}
      {delaySimulationOpen && delayImpact && (
        <Card className="border-amber-300 bg-amber-50/50 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-amber-950 text-base">
                Simulate Schedule Ripple & Impact Analysis
              </h3>
            </div>
            <button onClick={() => setDelaySimulationOpen(false)} className="text-amber-700 hover:text-amber-950">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-amber-900 block mb-1">Delayed Activity</label>
              <Select
                value={simulatedDelayedItemId}
                onChange={(e) => setSimulatedDelayedItemId(e.target.value)}
                options={items.map((i) => ({ label: `${i.scheduled_start_time} - ${i.title}`, value: i.id }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-amber-900 block mb-1">
                Delay Duration: <span className="font-bold text-amber-950">{simulatedDelayMinutes} mins</span>
              </label>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={simulatedDelayMinutes}
                onChange={(e) => setSimulatedDelayMinutes(Number(e.target.value))}
                className="w-full accent-amber-700"
              />
            </div>
          </div>

          {/* Curfew warning */}
          {delayImpact.curfewWarning && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-900 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 flex-shrink-0" />
              <span>{delayImpact.curfewWarning}</span>
            </div>
          )}

          {/* Recovery Options */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Deterministic Recovery Recommendations
            </p>
            {delayImpact.recoveryOptions.map((opt, i) => (
              <div
                key={i}
                className="p-3 bg-white border border-amber-200 rounded-xl text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-bold text-slate-900">{opt.title}</p>
                  <p className="text-slate-600 mt-0.5">{opt.actionDescription}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded whitespace-nowrap">
                  +{opt.timeRecoveredMinutes}m recovered
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-amber-200">
            <Button variant="ghost" size="sm" onClick={() => setDelaySimulationOpen(false)}>
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              onClick={handleApplyRecovery}
              className="bg-amber-800 hover:bg-amber-900 text-white"
            >
              Apply Non-Destructive Schedule Adjustment
            </Button>
          </div>
        </Card>
      )}

      {/* Run Sheet Cues Timeline Table */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Operational Schedule</h3>
            <p className="text-xs text-slate-500">
              {completedCount} of {items.length} cues executed • {delayedCount} delayed
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Activity Cue</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Lead Coordinator</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const vendor = item.vendor_id ? vendorMap.get(item.vendor_id) : null;
                const isItemActive = item.status === "IN_PROGRESS";
                const isItemCompleted = item.status === "COMPLETED";

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isItemActive ? "bg-brand-50/60 font-semibold" : isItemCompleted ? "opacity-75" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.scheduled_start_time} – {item.scheduled_end_time}
                      {item.actual_start_time && (
                        <div className="text-[10px] text-emerald-700 font-normal">
                          Act: {item.actual_start_time}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      {item.notes && <div className="text-[11px] text-slate-500">{item.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="purple" className="text-[10px]">
                        {item.category}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {item.location || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      <div>{item.responsible_person || "—"}</div>
                      {vendor && (
                        <div className="text-[10px] text-brand-700 font-medium">
                          {vendor.name} ({vendor.phone})
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge
                        variant={
                          isItemCompleted
                            ? "success"
                            : isItemActive
                            ? "purple"
                            : item.status === "DELAYED"
                            ? "danger"
                            : "neutral"
                        }
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status !== "COMPLETED" && (
                          <button
                            onClick={() =>
                              handleStatusChange(
                                item.id,
                                item.status === "IN_PROGRESS" ? "COMPLETED" : "IN_PROGRESS"
                              )
                            }
                            className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium"
                          >
                            {item.status === "IN_PROGRESS" ? "Complete" : "Start"}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedItemForIncident(item.id);
                            setShowIncidentModal(true);
                          }}
                          className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-600 font-medium"
                        >
                          Incident
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Incidents Log Strip */}
      {incidents.length > 0 && (
        <Card className="border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Event-Day Incident & Log Trail</span>
            </h3>
            <span className="text-xs text-slate-500">{incidents.length} logged incidents</span>
          </div>

          <div className="space-y-2">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3 bg-slate-50"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant={
                        inc.severity === "CRITICAL"
                          ? "danger"
                          : inc.severity === "HIGH"
                          ? "danger"
                          : "neutral"
                      }
                      className="text-[10px]"
                    >
                      {inc.severity}
                    </Badge>
                    <span className="text-slate-400">
                      {new Date(inc.reported_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-slate-500 font-medium">• Reported by {inc.reported_by}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{inc.description}</p>
                  {inc.resolution_notes && (
                    <p className="text-emerald-700 mt-1 font-medium">
                      ✓ Resolution: {inc.resolution_notes}
                    </p>
                  )}
                </div>

                {!inc.resolved_time && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-7 whitespace-nowrap"
                    onClick={() => {
                      const notes = prompt("Enter incident resolution notes:");
                      if (notes) resolveIncidentAction(event.id, inc.id, notes);
                    }}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Cue Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Operational Cue</h2>
              <button onClick={() => setShowAddItemModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <Input
                label="Activity Cue Title"
                placeholder="e.g. Baraat Welcome & Milni Ceremony"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Start Time (HH:mm)"
                  placeholder="09:00"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  required
                />
                <Input
                  label="End Time (HH:mm)"
                  placeholder="10:00"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as RunSheetCategory)}
                  options={[
                    { label: "Ceremony", value: "CEREMONY" },
                    { label: "Reception", value: "RECEPTION" },
                    { label: "Catering", value: "CATERING" },
                    { label: "Logistics", value: "LOGISTICS" },
                    { label: "Entertainment", value: "ENTERTAINMENT" },
                    { label: "Speech", value: "SPEECH" },
                    { label: "Photography", value: "PHOTO" },
                  ]}
                />

                <Select
                  label="Linked Supplier"
                  value={newVendorId}
                  onChange={(e) => setNewVendorId(e.target.value)}
                  options={[
                    { label: "None / Self Managed", value: "" },
                    ...vendors.map((v) => ({ label: v.name, value: v.id })),
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Location / Stage"
                  placeholder="e.g. Main Mandap Hall"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
                <Input
                  label="Lead Person"
                  placeholder="e.g. Rajesh (Coordinator)"
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                />
              </div>

              <Input
                label="Operational Notes"
                placeholder="e.g. Rose petal baskets ready at entrance arch"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddItemModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Save Cue
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Incident Log Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Report Stage Incident</h2>
              <button onClick={() => setShowIncidentModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogIncident} className="space-y-4">
              <Select
                label="Severity"
                value={incidentSeverity}
                onChange={(e) => setIncidentSeverity(e.target.value as IncidentSeverity)}
                options={[
                  { label: "Low (Minor delay, cosmetic)", value: "LOW" },
                  { label: "Medium (Schedule ripple under 15m)", value: "MEDIUM" },
                  { label: "High (Significant delay, missing equipment)", value: "HIGH" },
                  { label: "Critical (Safety risk, curfew breach)", value: "CRITICAL" },
                ]}
              />

              <Input
                label="Description"
                placeholder="What occurred on ground?"
                value={incidentDesc}
                onChange={(e) => setIncidentDesc(e.target.value)}
                required
              />

              <Input
                label="Reported By"
                value={incidentReporter}
                onChange={(e) => setIncidentReporter(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowIncidentModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Log Incident
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
