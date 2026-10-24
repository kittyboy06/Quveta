"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  CalendarDays,
  MapPin,
  Clock,
  AlertTriangle,
  History,
  Palette,
  Eye,
  X,
  MessageSquare,
} from "lucide-react";
import {
  SeedInvitationDesign,
  SeedCommunicationLog,
  SeedGuest,
  SeedEvent,
} from "@/shared/db/seed-data";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import {
  saveInvitationDesignAction,
  sendRsvpRemindersAction,
  generateAiInvitationDraftAction,
} from "@/modules/invitations/server/invitation.actions";
import { interpolateTemplate } from "@/modules/invitations/domain/template.interpolator";
import { TemplateId } from "@/modules/invitations/domain/invitation.schema";

interface InvitationsClientViewProps {
  event: SeedEvent;
  invitation: SeedInvitationDesign | null;
  guests: SeedGuest[];
  logs: SeedCommunicationLog[];
}

export function InvitationsClientView({
  event,
  invitation,
  guests,
  logs,
}: InvitationsClientViewProps) {
  // Form states
  const [templateId, setTemplateId] = useState<TemplateId>(
    invitation?.template_id || "ELEGANT_WEDDING"
  );
  const [headline, setHeadline] = useState(invitation?.headline || "Two Hearts, One Celebration");
  const [bodyText, setBodyText] = useState(
    invitation?.body_text ||
      `Together with their families, we joyfully invite you to celebrate the union and festivities of ${event.title}.`
  );
  const [dressCode, setDressCode] = useState(invitation?.dress_code || "Traditional Festive / Elegant Formal");
  const [venueName, setVenueName] = useState(invitation?.venue_name || event.location);
  const [venueAddress, setVenueAddress] = useState(invitation?.venue_address || event.location);
  const [dateTimeDisplay, setDateTimeDisplay] = useState(
    invitation?.date_time_display || `${event.event_date} at 10:00 AM IST`
  );
  const [rsvpDeadline, setRsvpDeadline] = useState(invitation?.rsvp_deadline || event.event_date);
  const [primaryColor, setPrimaryColor] = useState(invitation?.primary_color || "#5B21B6");
  const [accentColor, setAccentColor] = useState(invitation?.accent_color || "#F59E0B");

  // Reminder campaign states
  const [reminderMessage, setReminderMessage] = useState(
    "Namaste {{guest_name}}! We are eagerly looking forward to celebrating {{event_title}} with you. Kindly confirm your RSVP by clicking {{rsvp_link}}."
  );
  const [reminderChannel, setReminderChannel] = useState<"EMAIL" | "SMS" | "WHATSAPP_SIMULATED">("EMAIL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Filter pending guests
  const pendingGuests = guests.filter((g) => g.rsvp_status === "NO_RESPONSE");

  // Sample guest preview
  const sampleGuestName = guests[0] ? `${guests[0].first_name} ${guests[0].last_name}` : "Rajesh Sharma";
  const previewBody = interpolateTemplate(bodyText, {
    guest_name: sampleGuestName,
    event_title: event.title,
    venue: venueName,
    date: dateTimeDisplay,
    dress_code: dressCode,
  });

  const handleSaveDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await saveInvitationDesignAction(event.id, {
      title: `${event.title} Invitation`,
      template_id: templateId,
      headline,
      body_text: bodyText,
      dress_code: dressCode,
      venue_name: venueName,
      venue_address: venueAddress,
      date_time_display: dateTimeDisplay,
      rsvp_deadline: rsvpDeadline,
      primary_color: primaryColor,
      accent_color: accentColor,
    });

    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({ type: "success", text: "Invitation design saved successfully." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to save design." });
    }
  };

  const handleAiDraft = async () => {
    setIsSubmitting(true);
    const draft = await generateAiInvitationDraftAction(event.id, "warm");
    setHeadline(draft.headline);
    setBodyText(draft.body_text);
    setIsSubmitting(false);
    setStatusMessage({ type: "success", text: "AI generated new celebration copy!" });
  };

  const handleDispatchReminders = async () => {
    if (pendingGuests.length === 0) {
      alert("No guests currently have pending RSVP status.");
      return;
    }
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await sendRsvpRemindersAction(event.id, {
      target_filter: "NO_RESPONSE_ONLY",
      channel: reminderChannel,
      custom_message: reminderMessage,
    });

    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: `Successfully dispatched personalized reminders to ${res.sentCount} guests!`,
      });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to send reminders." });
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
            <Badge variant="purple">Module 11</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Mail className="w-6 h-6 text-brand-700" />
            <span>Invitations & Event Communications</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Interactive invitation card designer, live tokenized personalization, and targeted RSVP reminder campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={handleAiDraft}
            className="gap-1.5 border-brand-300 text-brand-900 hover:bg-brand-50"
          >
            <Sparkles className="w-4 h-4 text-brand-700" />
            <span>AI Draft Copy</span>
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

      {/* Main Workspace: Left = Controls, Right = Live Card Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Design Controls Form */}
        <Card className="p-6 border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-700" />
              <span>Invitation Design Controls</span>
            </h2>
            <Badge variant="purple" className="text-[10px]">
              WYSIWYG
            </Badge>
          </div>

          <form onSubmit={handleSaveDesign} className="space-y-4">
            <Select
              label="Design Preset Theme"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as TemplateId)}
              options={[
                { label: "Royal & Traditional Elegance (Wedding)", value: "ELEGANT_WEDDING" },
                { label: "Modern Cyber / Tech Innovator", value: "MODERN_TECH" },
                { label: "Festive Gala & Celebration", value: "FESTIVE_GALA" },
                { label: "Clean Minimalist Typography", value: "MINIMALIST" },
              ]}
            />

            <Input
              label="Celebration Headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Invitation Body (Supports tokens: &#123;&#123;guest_name&#125;&#125;, &#123;&#123;event_title&#125;&#125;)
                </label>
              </div>
              <textarea
                rows={4}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-700 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Dress Code / Attire"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
              />
              <Input
                label="RSVP Deadline"
                type="date"
                value={rsvpDeadline}
                onChange={(e) => setRsvpDeadline(e.target.value)}
              />
            </div>

            <Input
              label="Venue Name"
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
              required
            />

            <Input
              label="Venue Address / City"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              required
            />

            <Input
              label="Date & Time Display"
              value={dateTimeDisplay}
              onChange={(e) => setDateTimeDisplay(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-600">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Accent Gold/Light</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <span className="font-mono text-xs text-slate-600">{accentColor}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button variant="primary" size="md" type="submit" disabled={isSubmitting} className="w-full">
                Save Invitation Design
              </Button>
            </div>
          </form>
        </Card>

        {/* Right: Live Interactive Card Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-700" />
              <span>Live Card Preview</span>
            </h2>
            <span className="text-xs text-slate-500">Previewing for {sampleGuestName}</span>
          </div>

          <div
            className="rounded-3xl p-8 shadow-xl border text-center transition-all relative overflow-hidden"
            style={{
              backgroundColor: templateId === "MODERN_TECH" ? "#0F172A" : "#FFFFFF",
              borderColor: accentColor,
              color: templateId === "MODERN_TECH" ? "#F8FAFC" : "#1E293B",
            }}
          >
            {/* Background flourish */}
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
              style={{ backgroundColor: accentColor }}
            />

            <div className="relative space-y-6">
              <div className="space-y-2">
                <span
                  className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${accentColor}25`,
                    color: primaryColor,
                  }}
                >
                  Cordial Invitation
                </span>
                <h3
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: primaryColor }}
                >
                  {headline}
                </h3>
              </div>

              <div className="py-2 border-y border-slate-100/40">
                <p className="text-sm font-semibold italic text-slate-500">
                  Exclusively for {sampleGuestName}
                </p>
              </div>

              <p className="text-sm sm:text-base leading-relaxed px-4 text-slate-700 font-serif">
                "{previewBody}"
              </p>

              <div className="pt-4 space-y-2.5 text-xs sm:text-sm text-slate-600 border-t border-slate-100">
                <div className="flex items-center justify-center gap-2">
                  <CalendarDays className="w-4 h-4 text-brand-700" />
                  <span className="font-bold text-slate-800">{dateTimeDisplay}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-700" />
                  <span>{venueName} • {venueAddress}</span>
                </div>
                {dressCode && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Dress Code:</span> {dressCode}
                  </div>
                )}
                {rsvpDeadline && (
                  <div className="text-xs text-brand-800 font-semibold">
                    Please RSVP by {rsvpDeadline}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  size="md"
                  style={{ backgroundColor: primaryColor, color: "#FFFFFF" }}
                  className="shadow-lg hover:opacity-95 font-bold"
                >
                  Simulate Guest RSVP Response
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Reminder Campaign Dispatcher */}
      <Card className="p-6 border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Send className="w-4 h-4 text-brand-700" />
              <span>Targeted RSVP Reminder Dispatcher</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Send personalized follow-ups specifically to guests with unconfirmed responses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full">
              {pendingGuests.length} Pending Guests
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Reminder Message Template
            </label>
            <textarea
              rows={3}
              value={reminderMessage}
              onChange={(e) => setReminderMessage(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-brand-700 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            <Select
              label="Dispatch Channel"
              value={reminderChannel}
              onChange={(e) => setReminderChannel(e.target.value as any)}
              options={[
                { label: "Email (Simulated)", value: "EMAIL" },
                { label: "WhatsApp (Simulated)", value: "WHATSAPP_SIMULATED" },
                { label: "SMS (Simulated)", value: "SMS" },
              ]}
            />

            <Button
              variant="primary"
              size="md"
              disabled={isSubmitting || pendingGuests.length === 0}
              onClick={handleDispatchReminders}
              className="w-full text-xs font-bold gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Reminders ({pendingGuests.length})</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Communication History Log */}
      {logs.length > 0 && (
        <Card className="p-0 overflow-hidden border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-brand-700" />
              <span>Communication History & Message Logs</span>
            </h3>
            <span className="text-xs text-slate-500">{logs.length} messages dispatched</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Content Preview</th>
                  <th className="py-3 px-4">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.sent_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant="purple" className="text-[10px]">
                        {log.message_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {log.channel}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-md truncate">
                      {log.content_preview}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        <span>{log.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
