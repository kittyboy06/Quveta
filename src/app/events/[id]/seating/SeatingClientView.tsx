"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Grid3X3,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Accessibility,
  Utensils,
  UserCheck,
  UserX,
  Sparkles,
  Trash2,
  X,
  Users,
  Info,
} from "lucide-react";
import {
  SeedGuest,
  SeedSeatingTable,
  SeedSeatingAssignment,
  SeedEvent,
} from "@/shared/db/seed-data";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import {
  createTableAction,
  assignGuestToTableAction,
  unassignGuestAction,
  autoAssignGuestsAction,
  deleteTableAction,
} from "@/modules/seating/server/seating.actions";
import { analyzeSeatingPlan } from "@/modules/seating/domain/seating.engine";
import { TableShape, ZoneLocation } from "@/modules/seating/domain/seating.schema";

interface SeatingClientViewProps {
  event: SeedEvent;
  tables: SeedSeatingTable[];
  guests: SeedGuest[];
  assignments: SeedSeatingAssignment[];
}

export function SeatingClientView({ event, tables, guests, assignments }: SeatingClientViewProps) {
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showSeatGuestModal, setShowSeatGuestModal] = useState(false);
  const [targetTableForSeat, setTargetTableForSeat] = useState<string>("");
  const [selectedGuestToSeat, setSelectedGuestToSeat] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for new table
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState<number>(8);
  const [tableShape, setTableShape] = useState<TableShape>("ROUND");
  const [tableZone, setTableZone] = useState<ZoneLocation>("MAIN_FLOOR");
  const [isAccessible, setIsAccessible] = useState<boolean>(true);
  const [tableNotes, setTableNotes] = useState("");

  const analysis = analyzeSeatingPlan(tables, guests, assignments);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await createTableAction(event.id, {
      name: tableName,
      capacity: tableCapacity,
      shape: tableShape,
      location_zone: tableZone,
      accessibility_friendly: isAccessible,
      notes: tableNotes || undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowAddTableModal(false);
      setTableName("");
      setStatusMessage({ type: "success", text: "Table created successfully." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to create table." });
    }
  };

  const handleAssignGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTableForSeat || !selectedGuestToSeat) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await assignGuestToTableAction(event.id, targetTableForSeat, selectedGuestToSeat);
    setIsSubmitting(false);
    if (res.success) {
      setShowSeatGuestModal(false);
      setSelectedGuestToSeat("");
      setStatusMessage({ type: "success", text: "Guest seated successfully." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to seat guest." });
    }
  };

  const handleUnseat = async (guestId: string) => {
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await unassignGuestAction(event.id, guestId);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "Guest unseated." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to unseat guest." });
    }
  };

  const handleAutoAssign = async () => {
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await autoAssignGuestsAction(event.id);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: `Auto-assigned ${res.assignedCount} attending guests respecting accessibility preferences!`,
      });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Auto-assignment failed." });
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm("Are you sure you want to delete this table? Any seated guests will be unseated.")) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await deleteTableAction(event.id, tableId);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "Table deleted." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to delete table." });
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
            <Badge variant="purple">Module 10</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Grid3X3 className="w-6 h-6 text-brand-700" />
            <span>Interactive Seating Planner & Floor Layout</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enforce capacity limits, prevent multi-table seating conflicts, and aggregate table dietary summaries for caterers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {analysis.unseatedGuests.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={handleAutoAssign}
              className="gap-1.5 border-brand-300 text-brand-900 hover:bg-brand-50"
            >
              <Sparkles className="w-4 h-4 text-brand-700" />
              <span>Auto-Seat Remaining ({analysis.unseatedGuests.length})</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddTableModal(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Table</span>
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

      {/* Seating Conflict Alerts */}
      {analysis.seatingConflicts.length > 0 && (
        <div className="space-y-2">
          {analysis.seatingConflicts.map((c, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                c.severity === "HIGH"
                  ? "bg-red-50 border-red-300 text-red-900"
                  : "bg-amber-50 border-amber-300 text-amber-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{c.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Tables
          </p>
          <p className="text-2xl font-extrabold text-slate-900">{tables.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Configured in floor layout</p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Seating Capacity
          </p>
          <p className="text-2xl font-extrabold text-brand-900">
            {analysis.totalAssignedSeats} / {analysis.totalConfiguredCapacity}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {analysis.totalConfiguredCapacity - analysis.totalAssignedSeats} seats available
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Attending Guests Seated
          </p>
          <p className="text-2xl font-extrabold text-emerald-900">
            {analysis.totalAssignedSeats} / {analysis.totalAttendingGuests}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Confirmed RSVP attendees seated
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Unseated Attendees
          </p>
          <p
            className={`text-2xl font-extrabold ${
              analysis.unseatedGuests.length > 0 ? "text-amber-800" : "text-emerald-700"
            }`}
          >
            {analysis.unseatedGuests.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {analysis.unseatedGuests.length === 0 ? "All attendees seated" : "Awaiting table assignment"}
          </p>
        </Card>
      </div>

      {/* Main Workspace: Left = Table Cards, Right = Unseated Guests Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Cards Grid (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Seating Tables & Floor Plan</h2>
            <span className="text-xs text-slate-500">
              {tables.length} tables • Click '+ Seat Guest' to assign
            </span>
          </div>

          {tables.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-slate-300">
              <Grid3X3 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No tables configured</p>
              <p className="text-xs text-slate-500 mt-1 mb-3">Add round or rectangular banquet tables to get started.</p>
              <Button size="sm" onClick={() => setShowAddTableModal(true)}>
                Add Table
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.tablesWithGuests.map((item) => {
                const tbl = item.table;
                const isFull = item.occupancyCount >= tbl.capacity;

                return (
                  <Card
                    key={tbl.id}
                    className={`border transition-all ${
                      isFull ? "border-slate-300 bg-slate-50/40" : "border-slate-200 hover:border-brand-300"
                    }`}
                  >
                    {/* Table Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <Badge variant="purple" className="text-[10px]">
                            {tbl.location_zone}
                          </Badge>
                          <Badge variant="neutral" className="text-[10px]">
                            {tbl.shape}
                          </Badge>
                          {tbl.accessibility_friendly && (
                            <span
                              className="text-[10px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5"
                              title="Wheelchair accessible table"
                            >
                              <Accessibility className="w-3 h-3 text-blue-700" />
                              <span>Accessible</span>
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-base">{tbl.name}</h3>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setTargetTableForSeat(tbl.id);
                            setShowSeatGuestModal(true);
                          }}
                          disabled={isFull || analysis.unseatedGuests.length === 0}
                          className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-900 px-2 py-1 rounded font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Seat Guest"
                        >
                          + Seat
                        </button>
                        <button
                          onClick={() => handleDeleteTable(tbl.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded"
                          title="Delete Table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-500">Occupancy</span>
                        <span className={isFull ? "text-red-700" : "text-brand-900"}>
                          {item.occupancyCount} / {tbl.capacity} Seats
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            isFull ? "bg-red-500" : "bg-brand-700"
                          }`}
                          style={{ width: `${Math.min(100, (item.occupancyCount / tbl.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Dietary Manifest for Catering Staff */}
                    {Object.keys(item.dietarySummary).length > 0 && (
                      <div className="mb-3 p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[10px]">
                        <div className="flex items-center gap-1 font-bold text-emerald-900 mb-1">
                          <Utensils className="w-3 h-3 text-emerald-700" />
                          <span>Caterer Table Dietary Count:</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Object.entries(item.dietarySummary).map(([diet, count]) => (
                            <span
                              key={diet}
                              className="bg-white border border-emerald-300 text-emerald-900 px-1.5 py-0.2 rounded font-semibold"
                            >
                              {diet}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned Guest Pills */}
                    <div className="space-y-1.5">
                      {item.assignedGuests.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">
                          Table is empty.
                        </p>
                      ) : (
                        item.assignedGuests.map(({ guest }) => (
                          <div
                            key={guest.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/70 transition-colors"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">
                                {guest.first_name} {guest.last_name}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {(guest.dietary_restrictions || []).map((d, i) => (
                                  <span key={i} className="text-[9px] bg-slate-200 text-slate-700 px-1 py-0.2 rounded">
                                    {d}
                                  </span>
                                ))}
                                {guest.accessibility_needs?.includes("WHEELCHAIR") && (
                                  <span title="Wheelchair">
                                    <Accessibility className="w-3 h-3 text-blue-600" />
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              disabled={isSubmitting}
                              onClick={() => handleUnseat(guest.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded"
                              title="Unseat guest"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Pane: Unseated Attending Guests Drawer */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Unseated Attendees</h2>
            <Badge variant="purple" className="text-xs">
              {analysis.unseatedGuests.length}
            </Badge>
          </div>

          <Card className="p-4 border-slate-200 space-y-3">
            {analysis.unseatedGuests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">All Confirmed Attendees Seated!</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every guest with attending status has a designated seat.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  These confirmed guests do not have a table yet. Click 'Seat' on any card to place them.
                </p>
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-1">
                  {analysis.unseatedGuests.map((guest) => (
                    <div key={guest.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {guest.first_name} {guest.last_name}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {(guest.dietary_restrictions || []).map((d, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded">
                              {d}
                            </span>
                          ))}
                          {guest.accessibility_needs?.includes("WHEELCHAIR") && (
                            <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-semibold flex items-center gap-0.5">
                              <Accessibility className="w-2.5 h-2.5 text-blue-600" />
                              <span>Wheelchair</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedGuestToSeat(guest.id);
                          if (tables.length > 0) setTargetTableForSeat(tables[0].id);
                          setShowSeatGuestModal(true);
                        }}
                        className="text-xs bg-brand-50 hover:bg-brand-100 text-brand-900 font-semibold px-2 py-1 rounded"
                      >
                        Seat →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Banquet Table</h2>
              <button onClick={() => setShowAddTableModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTable} className="space-y-4">
              <Input
                label="Table Name / Identifier"
                placeholder="e.g. VIP Elders Table 1"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Capacity (Seats)"
                  type="number"
                  min="1"
                  max="30"
                  value={tableCapacity}
                  onChange={(e) => setTableCapacity(Number(e.target.value))}
                  required
                />
                <Select
                  label="Shape"
                  value={tableShape}
                  onChange={(e) => setTableShape(e.target.value as TableShape)}
                  options={[
                    { label: "Round Table", value: "ROUND" },
                    { label: "Rectangular", value: "RECTANGULAR" },
                    { label: "Head Table", value: "HEAD_TABLE" },
                  ]}
                />
              </div>

              <Select
                label="Location / Zone"
                value={tableZone}
                onChange={(e) => setTableZone(e.target.value as ZoneLocation)}
                options={[
                  { label: "Stage Front (VIP / Family)", value: "STAGE_FRONT" },
                  { label: "Main Floor", value: "MAIN_FLOOR" },
                  { label: "Balcony / Mezzanine", value: "BALCONY" },
                  { label: "Outdoor / Lawn", value: "OUTDOOR" },
                ]}
              />

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 p-3 bg-slate-50 border rounded-xl">
                <input
                  type="checkbox"
                  checked={isAccessible}
                  onChange={(e) => setIsAccessible(e.target.checked)}
                  className="rounded text-brand-700"
                />
                <span>Wheelchair Accessible / Step-Free Ramp Route</span>
              </label>

              <Input
                label="Notes (Optional)"
                placeholder="e.g. Close to entrance"
                value={tableNotes}
                onChange={(e) => setTableNotes(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddTableModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Save Table
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Guest Modal */}
      {showSeatGuestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Seat Guest at Table</h2>
              <button onClick={() => setShowSeatGuestModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignGuest} className="space-y-4">
              <Select
                label="Target Table"
                value={targetTableForSeat}
                onChange={(e) => setTargetTableForSeat(e.target.value)}
                options={tables.map((t) => ({ label: `${t.name} (${t.capacity} seats)`, value: t.id }))}
              />

              <Select
                label="Select Guest"
                value={selectedGuestToSeat}
                onChange={(e) => setSelectedGuestToSeat(e.target.value)}
                options={analysis.unseatedGuests.map((g) => ({
                  label: `${g.first_name} ${g.last_name}${
                    g.accessibility_needs?.includes("WHEELCHAIR") ? " (Wheelchair)" : ""
                  }`,
                  value: g.id,
                }))}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowSeatGuestModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Assign Seat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
