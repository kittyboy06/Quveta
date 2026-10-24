"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Sparkles,
  Users,
  IndianRupee,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Shield,
  HeartHandshake,
} from "lucide-react";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Button } from "@/shared/design-system/Button";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import { Badge } from "@/shared/design-system/Badge";
import { createEventAction } from "@/modules/events/server/event.actions";

export default function NewEventPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    event_type: "wedding",
    event_date: "",
    start_time: "10:00",
    end_time: "22:00",
    location: "",
    guest_count: 100,
    target_budget: 500000,
    currency: "INR",
    theme: "",
    atmosphere: "Warm, traditional, and welcoming",
    mustHaves: [] as string[],
    dietary: [] as string[],
    accessibility: [] as string[],
  });

  const [mustHaveInput, setMustHaveInput] = useState("");
  const [dietaryInput, setDietaryInput] = useState("");
  const [accessibilityInput, setAccessibilityInput] = useState("");

  const eventTypeOptions = [
    { value: "wedding", label: "Wedding Celebration" },
    { value: "birthday", label: "Birthday Party" },
    { value: "corporate", label: "Corporate Conference / Hackathon" },
    { value: "community", label: "Community Gathering / Festival" },
    { value: "college", label: "College Fest / Cultural Day" },
    { value: "engagement", label: "Engagement Ceremony" },
    { value: "other", label: "Custom Celebration" },
  ];

  const handleAddMustHave = () => {
    if (mustHaveInput.trim() && !formData.mustHaves.includes(mustHaveInput.trim())) {
      setFormData({ ...formData, mustHaves: [...formData.mustHaves, mustHaveInput.trim()] });
      setMustHaveInput("");
    }
  };

  const handleAddDietary = (item: string) => {
    if (!formData.dietary.includes(item)) {
      setFormData({ ...formData, dietary: [...formData.dietary, item] });
    }
  };

  const handleAddAccessibility = (item: string) => {
    if (!formData.accessibility.includes(item)) {
      setFormData({ ...formData, accessibility: [...formData.accessibility, item] });
    }
  };

  const validateStep1 = () => {
    if (!formData.title.trim()) return "Please enter an event title.";
    if (!formData.event_date) return "Please choose a valid event date.";
    if (!formData.location.trim()) return "Please enter an event location.";
    if (formData.guest_count < 1) return "Guest count must be at least 1.";
    if (formData.target_budget < 1000) return "Target budget must be at least ₹1,000.";
    return null;
  };

  const handleNext = () => {
    setErrorMessage(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setErrorMessage(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const payload = {
        title: formData.title,
        event_type: formData.event_type as any,
        event_date: formData.event_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        location: formData.location,
        guest_count: Number(formData.guest_count),
        target_budget: Number(formData.target_budget),
        currency: formData.currency,
        preferences: {
          theme: formData.theme || undefined,
          atmosphere: formData.atmosphere,
          mustHaves: formData.mustHaves,
          priorities: {},
          dietary: formData.dietary,
          accessibility: formData.accessibility,
        },
      };

      const result = await createEventAction(payload);
      if (result.success) {
        router.push(`/events/${result.data.eventId}`);
      } else {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to create event.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header & Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create New Event
            </h1>
            <p className="text-sm text-slate-500">
              Set up your event parameters to initialize the AI Planning & Adaptive Budget Engine.
            </p>
          </div>
          <Badge variant="purple" icon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}>
            Step {step} of 4
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-700 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 flex items-start gap-2.5 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Core Details */}
      {step === 1 && (
        <Card className="space-y-5">
          <CardHeader
            title="Step 1: Event Fundamentals"
            subtitle="Define basic constraints including dates, attendees, and budget target."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Event Name / Title"
                placeholder="e.g. Aarav & Meera's Wedding or TechInnovate 2026"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <Select
              label="Event Type"
              options={eventTypeOptions}
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            />

            <Input
              label="Event Date"
              type="date"
              required
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
            />

            <Input
              label="Location / City / Venue"
              placeholder="e.g. Bangalore Palace Hall, Bangalore"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />

            <Input
              label="Expected Guests Count"
              type="number"
              min={1}
              required
              value={formData.guest_count}
              onChange={(e) => setFormData({ ...formData, guest_count: Number(e.target.value) })}
            />

            <Input
              label="Total Target Budget (₹)"
              type="number"
              min={1000}
              step={5000}
              required
              value={formData.target_budget}
              onChange={(e) => setFormData({ ...formData, target_budget: Number(e.target.value) })}
              helperText="Authoritative spending limit for adaptive planning"
            />

            <Select
              label="Currency"
              options={[
                { value: "INR", label: "Indian Rupee (₹ INR)" },
                { value: "USD", label: "US Dollar ($ USD)" },
                { value: "EUR", label: "Euro (€ EUR)" },
              ]}
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            />
          </div>
        </Card>
      )}

      {/* STEP 2: Priorities & Atmosphere */}
      {step === 2 && (
        <Card className="space-y-5">
          <CardHeader
            title="Step 2: Theme & Must-Have Priorities"
            subtitle="Tell Quveta what matters most so the simulator protects your core priorities."
          />

          <div className="space-y-4">
            <Input
              label="Visual Theme / Style Concept (Optional)"
              placeholder="e.g. Royal Traditional Marigold, Minimalist Nordic, High-tech Cyberpunk"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            />

            <Input
              label="Desired Atmosphere"
              placeholder="e.g. Warm, spiritual and family-focused"
              value={formData.atmosphere}
              onChange={(e) => setFormData({ ...formData, atmosphere: e.target.value })}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Absolute Must-Haves (Protected from Budget Cuts)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Live South Indian Feast counter, Candid Videographer"
                  className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
                  value={mustHaveInput}
                  onChange={(e) => setMustHaveInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddMustHave();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddMustHave}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.mustHaves.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No must-haves added yet. Type and press Add.</p>
                ) : (
                  formData.mustHaves.map((mh, idx) => (
                    <Badge key={idx} variant="purple">
                      {mh}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            mustHaves: formData.mustHaves.filter((_, i) => i !== idx),
                          })
                        }
                        className="ml-1 text-slate-400 hover:text-red-500 font-bold"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 3: Dietary & Accessibility Care */}
      {step === 3 && (
        <Card className="space-y-5">
          <CardHeader
            title="Step 3: Dietary & Accessibility Requirements"
            subtitle="Quveta incorporates genuine inclusive hospitality into vendor questions and layout planning."
          />

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Dietary Preferences & Constraints
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {["Strict Vegetarian Counter", "Jain Food Without Onion/Garlic", "Halal Certified", "Vegan Options", "Gluten-Free"].map(
                  (item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleAddDietary(item)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                        formData.dietary.includes(item)
                          ? "bg-brand-700 text-white border-brand-700 font-medium"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      + {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Accessibility Requirements
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {[
                  "Wheelchair Ramp Access",
                  "Ground Floor Seating for Elders",
                  "Audio Induction Loop / Clear Acoustics",
                  "Sign Language Interpreter / Captions",
                  "Accessible Restrooms Close to Main Hall",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleAddAccessibility(item)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      formData.accessibility.includes(item)
                        ? "bg-brand-700 text-white border-brand-700 font-medium"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* STEP 4: Review & Initialize */}
      {step === 4 && (
        <Card className="space-y-5 border-brand-300 bg-brand-50/40">
          <CardHeader
            title="Step 4: Review & Initialize Event"
            subtitle="Review your inputs. Clicking create will set up the event, budget categories, and planning engine."
          />

          <div className="rounded-lg bg-white p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{formData.title}</h3>
                <p className="text-xs text-slate-500 capitalize">{formData.event_type} • {formData.location}</p>
              </div>
              <Badge variant="success">Ready to Plan</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Target Date</span>
                <span className="font-semibold text-slate-800">{formData.event_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Guest Headcount</span>
                <span className="font-semibold text-slate-800">{formData.guest_count} attendees</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Total Target Budget</span>
                <span className="font-bold text-brand-900 text-sm">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: formData.currency, maximumFractionDigits: 0 }).format(
                    formData.target_budget
                  )}
                </span>
              </div>
            </div>

            {formData.mustHaves.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block font-medium text-xs mb-1">Protected Must-Haves:</span>
                <div className="flex flex-wrap gap-1.5">
                  {formData.mustHaves.map((mh, i) => (
                    <Badge key={i} variant="purple">{mh}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white/70 p-3 rounded-lg border border-slate-200">
            <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Real PostgreSQL persistence active. Default budget categories for <strong>{formData.event_type}</strong> will be automatically provisioned.
            </span>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        {step > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((step - 1) as any)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button type="button" onClick={handleNext} className="gap-2">
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="gap-2 shadow-md bg-gradient-to-r from-brand-800 to-brand-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Create Event & Initialize Engine</span>
          </Button>
        )}
      </div>
    </div>
  );
}
