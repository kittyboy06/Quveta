"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  SlidersHorizontal,
  X,
  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX,
  HelpCircle,
  Accessibility,
  Utensils,
} from "lucide-react";
import { SeedGuest, SeedHouseholdGroup, SeedEvent } from "@/shared/db/seed-data";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import {
  createGuestAction,
  updateGuestRsvpAction,
  importGuestsFromCsvAction,
  deleteGuestAction,
} from "@/modules/guests/server/guest.actions";
import { calculateGuestStatistics } from "@/modules/guests/domain/guest.stats";
import { exportGuestsToCsv } from "@/modules/guests/domain/csv.parser";
import { RsvpStatus, DietaryRestriction, AccessibilityNeed } from "@/modules/guests/domain/guest.schema";
import { formatMoney, createMoney } from "@/shared/types/money";

interface GuestsClientViewProps {
  event: SeedEvent;
  guests: SeedGuest[];
  householdGroups: SeedHouseholdGroup[];
}

const DIETARY_OPTIONS: { label: string; value: string; color: string }[] = [
  { label: "Vegetarian", value: "VEG", color: "bg-emerald-100 text-emerald-800" },
  { label: "Jain Prep", value: "JAIN", color: "bg-amber-100 text-amber-800" },
  { label: "Vegan", value: "VEGAN", color: "bg-green-100 text-green-800" },
  { label: "Gluten-Free", value: "GLUTEN_FREE", color: "bg-blue-100 text-blue-800" },
  { label: "Nut Allergy", value: "NUT_ALLERGY", color: "bg-red-100 text-red-800" },
  { label: "Halal", value: "HALAL", color: "bg-teal-100 text-teal-800" },
];

const ACCESSIBILITY_OPTIONS: { label: string; value: string }[] = [
  { label: "Wheelchair Ramp Required", value: "WHEELCHAIR" },
  { label: "Ground Floor / Step-Free", value: "GROUND_FLOOR" },
  { label: "Assistive Listening", value: "ASSISTIVE_LISTENING" },
];

export function GuestsClientView({ event, guests, householdGroups }: GuestsClientViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRsvp, setFilterRsvp] = useState<string>("ALL");
  const [filterDiet, setFilterDiet] = useState<string>("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for new guest
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [householdId, setHouseholdId] = useState("");
  const [plusOneAllowed, setPlusOneAllowed] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const householdMap = new Map(householdGroups.map((h) => [h.id, h]));

  // Calculate statistics
  const stats = calculateGuestStatistics(guests, event.guest_count, 140000); // 1,400 INR per head

  // Filtered guests
  const filteredGuests = guests.filter((g) => {
    const fullName = `${g.first_name} ${g.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || (g.email && g.email.toLowerCase().includes(query));
    const matchesRsvp = filterRsvp === "ALL" || g.rsvp_status === filterRsvp;
    const matchesDiet = filterDiet === "ALL" || (g.dietary_restrictions || []).includes(filterDiet);
    return matchesSearch && matchesRsvp && matchesDiet;
  });

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await createGuestAction(event.id, {
      first_name: firstName,
      last_name: lastName,
      email: email || undefined,
      phone: phone || undefined,
      household_group_id: householdId || undefined,
      invitation_status: "NOT_SENT",
      rsvp_status: "NO_RESPONSE",
      plus_one_allowed: plusOneAllowed,
      plus_one_name: plusOneName || undefined,
      dietary_restrictions: selectedDietary,
      accessibility_needs: selectedAccessibility,
      notes: notes || undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowAddModal(false);
      setStatusMessage({ type: "success", text: "Guest added successfully." });
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setSelectedDietary([]);
      setSelectedAccessibility([]);
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to add guest." });
    }
  };

  const handleRsvpChange = async (guestId: string, newRsvp: RsvpStatus) => {
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await updateGuestRsvpAction(event.id, guestId, newRsvp);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: `RSVP updated to ${newRsvp}.` });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to update RSVP." });
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to remove this guest? Any table seat assigned will be unseated.")) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await deleteGuestAction(event.id, guestId);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "Guest removed from event roster." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to delete guest." });
    }
  };

  const handleImportCsv = async () => {
    if (!csvInput.trim()) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await importGuestsFromCsvAction(event.id, csvInput);
    setIsSubmitting(false);
    if (res.success) {
      setShowImportModal(false);
      setCsvInput("");
      setStatusMessage({ type: "success", text: `Imported ${res.importedCount} guests successfully!` });
    } else {
      setStatusMessage({
        type: "error",
        text: res.errors?.join(", ") || "Failed to parse CSV file.",
      });
    }
  };

  const handleDownloadCsv = () => {
    const csvData = exportGuestsToCsv(guests);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${event.title.replace(/\s+/g, "_")}_Guests.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <Badge variant="purple">Module 09</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-brand-700" />
            <span>Guest Management & RSVP Tracking</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Authoritative attendance counts, household invitations, dietary restrictions, and variable catering synchronization.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            className="gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
            className="gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-600" />
            <span>Import CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Guest</span>
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

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Invited
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats.totalGuests}</span>
            <span className="text-xs text-slate-500">
              ({stats.totalInvitedWithPlusOnes} with +1s)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target baseline: {event.guest_count} attendees</p>
        </Card>

        <Card className="border-slate-200 bg-emerald-50/40 border-emerald-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-1">
            Confirmed Attending
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900">
              {stats.totalAttendingHeads}
            </span>
            <span className="text-xs text-emerald-700">
              ({stats.attendingCount} + {stats.attendingPlusOnes} plus-ones)
            </span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">Confirmed plates for caterer</p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Pending / Tentative
          </p>
          <p className="text-2xl font-extrabold text-amber-900">{stats.pendingCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.declinedCount} confirmed declined
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Response Rate
          </p>
          <p className="text-2xl font-extrabold text-brand-900">
            {stats.responseRatePercentage}%
          </p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-brand-700 h-1.5 rounded-full transition-all"
              style={{ width: `${stats.responseRatePercentage}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Relational Coupling Alert to Module 05: Simulator */}
      {stats.totalAttendingHeads > 0 && stats.totalAttendingHeads !== event.guest_count && (
        <div className="p-4 rounded-xl border border-brand-300 bg-brand-50/70 text-xs sm:text-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <SlidersHorizontal className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-brand-950">
                Attendance Delta Affects Variable Catering Budget
              </p>
              <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
                Confirmed guests ({stats.totalAttendingHeads}) differ from the initial planning target ({event.guest_count}).
                {stats.capacityVariance < 0 ? (
                  <span className="text-red-700 font-semibold ml-1">
                    Catering cost increases by approximately {formatMoney(createMoney(Math.abs(stats.cateringCostDeltaPaise), event.currency))}.
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold ml-1">
                    Buffer of {stats.capacityVariance} seats creates potential savings of {formatMoney(createMoney(Math.abs(stats.cateringCostDeltaPaise), event.currency))}.
                  </span>
                )}
              </p>
            </div>
          </div>

          <Link href={`/events/${event.id}/simulator`}>
            <Button size="sm" variant="primary" className="whitespace-nowrap text-xs gap-1.5">
              <span>Rebalance in Simulator</span>
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="p-4 border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by guest name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={filterRsvp}
              onChange={(e) => setFilterRsvp(e.target.value)}
              options={[
                { label: "All RSVPs", value: "ALL" },
                { label: "Attending", value: "ATTENDING" },
                { label: "Declined", value: "DECLINED" },
                { label: "Tentative", value: "TENTATIVE" },
                { label: "No Response", value: "NO_RESPONSE" },
              ]}
            />

            <Select
              value={filterDiet}
              onChange={(e) => setFilterDiet(e.target.value)}
              options={[
                { label: "All Dietary Needs", value: "ALL" },
                { label: "Vegetarian", value: "VEG" },
                { label: "Jain Prep", value: "JAIN" },
                { label: "Vegan", value: "VEGAN" },
                { label: "Gluten-Free", value: "GLUTEN_FREE" },
                { label: "Nut Allergy", value: "NUT_ALLERGY" },
                { label: "Halal", value: "HALAL" },
              ]}
            />
          </div>
        </div>

        {/* Dietary and Accessibility Summaries */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-[11px]">
          <span className="font-semibold text-slate-500">Dietary Badges:</span>
          {Object.entries(stats.dietarySummary).map(([diet, count]) => (
            <span
              key={diet}
              className="bg-brand-50 text-brand-900 border border-brand-200 px-2 py-0.5 rounded font-medium"
            >
              {diet}: {count}
            </span>
          ))}
          {Object.entries(stats.accessibilitySummary).map(([acc, count]) => (
            <span
              key={acc}
              className="bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-medium flex items-center gap-1"
            >
              <Accessibility className="w-3 h-3 text-blue-600" />
              <span>{acc}: {count}</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Guest Roster Table */}
      <Card className="p-0 overflow-hidden border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Household / Group</th>
                <th className="py-3 px-4">RSVP Status</th>
                <th className="py-3 px-4">Plus One</th>
                <th className="py-3 px-4">Dietary & Accessibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No guests match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredGuests.map((guest) => {
                  const household = guest.household_group_id
                    ? householdMap.get(guest.household_group_id)
                    : null;

                  return (
                    <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {guest.first_name} {guest.last_name}
                        </div>
                        {guest.email && <div className="text-[11px] text-slate-500">{guest.email}</div>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {household ? (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                            {household.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={guest.rsvp_status}
                          disabled={isSubmitting}
                          onChange={(e) => handleRsvpChange(guest.id, e.target.value as RsvpStatus)}
                          className={`text-xs font-semibold rounded-lg px-2 py-1 border focus:outline-none ${
                            guest.rsvp_status === "ATTENDING"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : guest.rsvp_status === "DECLINED"
                              ? "bg-red-50 text-red-800 border-red-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}
                        >
                          <option value="ATTENDING">Attending</option>
                          <option value="DECLINED">Declined</option>
                          <option value="TENTATIVE">Tentative</option>
                          <option value="NO_RESPONSE">No Response</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {guest.plus_one_allowed ? (
                          guest.plus_one_name ? (
                            <span className="font-medium text-emerald-800">
                              +1 ({guest.plus_one_name})
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">+1 Allowed (Pending)</span>
                          )
                        ) : (
                          <span className="text-slate-400">Single</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {(guest.dietary_restrictions || []).map((diet, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium"
                            >
                              {diet}
                            </span>
                          ))}
                          {(guest.accessibility_needs || []).map((acc, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5"
                            >
                              <Accessibility className="w-2.5 h-2.5 text-blue-600" />
                              <span>{acc}</span>
                            </span>
                          ))}
                          {(!guest.dietary_restrictions || guest.dietary_restrictions.length === 0) &&
                            (!guest.accessibility_needs || guest.accessibility_needs.length === 0) && (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          disabled={isSubmitting}
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded"
                          title="Delete Guest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Guest</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGuest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  placeholder="e.g. Ramesh"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  placeholder="e.g. Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Email (Optional)"
                  type="email"
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98450 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Select
                label="Household / Group (Optional)"
                value={householdId}
                onChange={(e) => setHouseholdId(e.target.value)}
                options={[
                  { label: "Individual (No Household)", value: "" },
                  ...householdGroups.map((h) => ({ label: h.name, value: h.id })),
                ]}
              />

              {/* Plus one checkbox */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={plusOneAllowed}
                    onChange={(e) => setPlusOneAllowed(e.target.checked)}
                    className="rounded text-brand-700"
                  />
                  <span>Allow Plus One (+1 Guest)</span>
                </label>
                {plusOneAllowed && (
                  <Input
                    label="Plus One Full Name"
                    placeholder="e.g. Sunita Sharma"
                    value={plusOneName}
                    onChange={(e) => setPlusOneName(e.target.value)}
                  />
                )}
              </div>

              {/* Dietary checkboxes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Dietary Restrictions
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DIETARY_OPTIONS.map((d) => (
                    <label
                      key={d.value}
                      className="flex items-center gap-1.5 text-xs text-slate-700 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDietary.includes(d.value)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDietary([...selectedDietary, d.value]);
                          else setSelectedDietary(selectedDietary.filter((v) => v !== d.value));
                        }}
                        className="rounded text-brand-700"
                      />
                      <span>{d.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Accessibility checkboxes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Accessibility Needs
                </label>
                <div className="space-y-1.5">
                  {ACCESSIBILITY_OPTIONS.map((a) => (
                    <label
                      key={a.value}
                      className="flex items-center gap-2 text-xs text-slate-700 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAccessibility.includes(a.value)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedAccessibility([...selectedAccessibility, a.value]);
                          else setSelectedAccessibility(selectedAccessibility.filter((v) => v !== a.value));
                        }}
                        className="rounded text-brand-700"
                      />
                      <span>{a.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Save Guest
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Batch Import Guests from CSV</h2>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Paste standard comma-delimited CSV text with headers: <br />
              <code className="bg-slate-100 px-1 py-0.5 rounded text-brand-900 font-mono text-[11px]">
                First Name, Last Name, Email, Phone, Dietary, Accessibility, Plus One, Plus One Name
              </code>
            </p>

            <textarea
              rows={8}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder={`First Name,Last Name,Email,Phone,Dietary,Accessibility,Plus One,Plus One Name\nVikram,Kapoor,vikram@kapoor.com,+91 99000 88776,"VEG; JAIN",WHEELCHAIR,yes,Ritu Kapoor\nNeha,Gupta,neha@gupta.com,+91 98000 11223,GLUTEN_FREE,,no,`}
              className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-700 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button variant="ghost" size="sm" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" disabled={isSubmitting} onClick={handleImportCsv}>
                Validate & Import Guests
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
