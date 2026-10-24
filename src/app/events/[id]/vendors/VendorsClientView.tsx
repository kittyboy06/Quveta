"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Store,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Scale,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { SeedVendor, SeedQuotation, SeedEvent } from "@/shared/db/seed-data";
import { formatMoney, createMoney } from "@/shared/types/money";
import { Card } from "@/shared/design-system/Card";
import { Badge } from "@/shared/design-system/Badge";
import { Button } from "@/shared/design-system/Button";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import {
  createVendorAction,
  createQuotationAction,
  acceptQuotationAction,
  updateVendorStatusAction,
  deleteVendorAction,
} from "@/modules/vendors/server/vendor.actions";
import { compareQuotations, QuotationComparisonResult } from "@/modules/vendors/domain/quote.comparator";
import { VendorCategory, VendorStatus } from "@/modules/vendors/domain/vendor.schema";

interface VendorsClientViewProps {
  event: SeedEvent;
  vendors: SeedVendor[];
  quotations: SeedQuotation[];
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: "All Categories", value: "ALL" },
  { label: "Venue & Mandap", value: "VENUE" },
  { label: "Catering & Feast", value: "CATERING" },
  { label: "Photography & Film", value: "PHOTOGRAPHY" },
  { label: "Floral & Decor", value: "DECOR" },
  { label: "Music & Entertainment", value: "MUSIC_ENTERTAINMENT" },
  { label: "Transport & Logistics", value: "TRANSPORT" },
  { label: "Attire & Styling", value: "ATTIRE" },
  { label: "Other Services", value: "OTHER" },
];

export function VendorsClientView({ event, vendors, quotations }: VendorsClientViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showAddVendorModal, setShowAddVendorModal] = useState<boolean>(false);
  const [showAddQuoteModal, setShowAddQuoteModal] = useState<boolean>(false);
  const [selectedVendorForQuote, setSelectedVendorForQuote] = useState<string>("");
  const [comparisonModalOpen, setComparisonModalOpen] = useState<boolean>(false);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states for new vendor
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState<VendorCategory>("CATERING");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorEmail, setNewVendorEmail] = useState("");
  const [newVendorPhone, setNewVendorPhone] = useState("");
  const [newVendorWebsite, setNewVendorWebsite] = useState("");
  const [newVendorAddress, setNewVendorAddress] = useState("");
  const [newVendorNotes, setNewVendorNotes] = useState("");

  // Form states for new quote
  const [newQuoteRef, setNewQuoteRef] = useState("");
  const [newQuoteAmount, setNewQuoteAmount] = useState<number>(50000);
  const [newQuoteValidUntil, setNewQuoteValidUntil] = useState("2026-12-31");
  const [newQuoteDeposit, setNewQuoteDeposit] = useState<number>(15000);
  const [newQuoteInclusions, setNewQuoteInclusions] = useState("Complete Setup, Service Staff, Cutlery");
  const [newQuoteExclusions, setNewQuoteExclusions] = useState("Overtime Charges, Venue Generator");

  // Filter vendors
  const filteredVendors = vendors.filter((v) =>
    selectedCategory === "ALL" ? true : v.category === selectedCategory
  );

  // Aggregated KPIs
  const bookedCount = vendors.filter((v) => v.status === "BOOKED").length;
  const totalQuotedAmountMinor = quotations.reduce((sum, q) => sum + q.amount_minor, 0);
  const totalCommittedAmountMinor = quotations
    .filter((q) => q.status === "ACCEPTED")
    .reduce((sum, q) => sum + q.amount_minor, 0);

  // Comparison data
  const comparisonResult: QuotationComparisonResult | null =
    selectedQuoteIds.length > 0
      ? compareQuotations(
          quotations.filter((q) => selectedQuoteIds.includes(q.id)),
          vendors,
          event.guest_count
        )
      : null;

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await createVendorAction(event.id, {
      name: newVendorName,
      category: newVendorCategory,
      contact_person: newVendorContact,
      email: newVendorEmail,
      phone: newVendorPhone,
      website: newVendorWebsite || undefined,
      address: newVendorAddress || undefined,
      status: "RESEARCHING",
      notes: newVendorNotes || undefined,
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowAddVendorModal(false);
      setStatusMessage({ type: "success", text: "Vendor added successfully." });
      setNewVendorName("");
      setNewVendorContact("");
      setNewVendorEmail("");
      setNewVendorPhone("");
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to add vendor." });
    }
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForQuote) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    const inclusionsArr = newQuoteInclusions.split(",").map((s) => s.trim()).filter(Boolean);
    const exclusionsArr = newQuoteExclusions.split(",").map((s) => s.trim()).filter(Boolean);

    const res = await createQuotationAction(event.id, {
      vendor_id: selectedVendorForQuote,
      quote_reference: newQuoteRef || `QT-${Date.now().toString().slice(-4)}`,
      amount_minor: Math.round(newQuoteAmount * 100), // convert to paise
      currency: event.currency,
      valid_until: newQuoteValidUntil,
      line_items: [
        {
          description: "Primary Package Services",
          amount_minor: Math.round(newQuoteAmount * 100),
          is_mandatory: true,
        },
      ],
      inclusions: inclusionsArr,
      exclusions: exclusionsArr,
      deposit_required_minor: Math.round(newQuoteDeposit * 100),
      notes: "Submitted via quotation manager.",
    });

    setIsSubmitting(false);
    if (res.success) {
      setShowAddQuoteModal(false);
      setStatusMessage({ type: "success", text: "Quotation recorded successfully." });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to record quotation." });
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    setIsSubmitting(true);
    setStatusMessage(null);
    const res = await acceptQuotationAction(event.id, quoteId);
    setIsSubmitting(false);
    if (res.success) {
      setStatusMessage({
        type: "success",
        text: "Quotation accepted! Budget line item committed and vendor status marked as BOOKED.",
      });
      if (comparisonModalOpen) setComparisonModalOpen(false);
    } else {
      setStatusMessage({ type: "error", text: res.error || "Failed to accept quotation." });
    }
  };

  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuoteIds((prev) =>
      prev.includes(quoteId) ? prev.filter((id) => id !== quoteId) : [...prev, quoteId]
    );
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
            <Badge variant="purple">Module 07</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-brand-700" />
            <span>Vendor & Quotation Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluate proposals, compare inclusions side-by-side, and lock committed spend into your authoritative budget.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {quotations.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedQuoteIds.length === 0) {
                  // Default select first two quotes
                  setSelectedQuoteIds(quotations.slice(0, 2).map((q) => q.id));
                }
                setComparisonModalOpen(true);
              }}
              className="gap-1.5 border-brand-300 text-brand-800 hover:bg-brand-50"
            >
              <Scale className="w-4 h-4 text-brand-700" />
              <span>Compare Quotes ({selectedQuoteIds.length || 2})</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (vendors.length > 0) setSelectedVendorForQuote(vendors[0].id);
              setShowAddQuoteModal(true);
            }}
            className="gap-1.5"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>+ Record Quote</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddVendorModal(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
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
            Suppliers Engaged
          </p>
          <p className="text-2xl font-extrabold text-slate-900">{vendors.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">{bookedCount} officially booked</p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Quotations Collected
          </p>
          <p className="text-2xl font-extrabold text-brand-900">{quotations.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {quotations.filter((q) => q.status === "ACCEPTED").length} accepted & committed
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Quoted Value
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatMoney(createMoney(totalQuotedAmountMinor, event.currency))}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Across all recorded offers</p>
        </Card>

        <Card className="border-slate-200 bg-brand-50/40 border-brand-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700 mb-1">
            Committed to Budget
          </p>
          <p className="text-2xl font-extrabold text-brand-950">
            {formatMoney(createMoney(totalCommittedAmountMinor, event.currency))}
          </p>
          <p className="text-[11px] text-brand-800 mt-1">Locked in Module 04 line items</p>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          const count =
            cat.value === "ALL"
              ? vendors.length
              : vendors.filter((v) => v.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-brand-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-brand-800 text-brand-200" : "bg-slate-200 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vendors List & Quotations */}
      {filteredVendors.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-slate-300">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No vendors found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add your candidate venue, caterer, or decorator to start logging quotes.
          </p>
          <Button size="sm" onClick={() => setShowAddVendorModal(true)}>
            Add Supplier
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredVendors.map((vendor) => {
            const vendorQuotes = quotations.filter((q) => q.vendor_id === vendor.id);
            const isBooked = vendor.status === "BOOKED";

            return (
              <Card
                key={vendor.id}
                className={`transition-all ${
                  isBooked ? "border-emerald-300 ring-1 ring-emerald-300/40" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Vendor Card Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="purple" className="text-[10px] uppercase">
                        {vendor.category}
                      </Badge>
                      <Badge
                        variant={
                          isBooked
                            ? "success"
                            : vendor.status === "QUOTED"
                            ? "purple"
                            : "neutral"
                        }
                        className="text-[10px]"
                      >
                        {vendor.status}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{vendor.name}</h3>
                  </div>

                  {vendorQuotes.length > 0 && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
                      {vendorQuotes.length} {vendorQuotes.length === 1 ? "quote" : "quotes"}
                    </span>
                  )}
                </div>

                {/* Vendor Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{vendor.contact_person}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <a href={`mailto:${vendor.email}`} className="hover:text-brand-700 truncate">
                      {vendor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                  {vendor.address && (
                    <div className="flex items-center gap-1.5 text-slate-600 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{vendor.address}</span>
                    </div>
                  )}
                </div>

                {/* Quotations Accordion for this vendor */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Quotations
                    </h4>
                    <button
                      onClick={() => {
                        setSelectedVendorForQuote(vendor.id);
                        setShowAddQuoteModal(true);
                      }}
                      className="text-xs font-semibold text-brand-700 hover:text-brand-900"
                    >
                      + Add Quote
                    </button>
                  </div>

                  {vendorQuotes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No quotations recorded yet. Click '+ Add Quote' to record pricing.
                    </p>
                  ) : (
                    vendorQuotes.map((q) => {
                      const quoteMoney = createMoney(q.amount_minor, q.currency);
                      const depositMoney = createMoney(q.deposit_required_minor, q.currency);
                      const isAccepted = q.status === "ACCEPTED";
                      const isSelectedForComparison = selectedQuoteIds.includes(q.id);

                      return (
                        <div
                          key={q.id}
                          className={`p-3.5 rounded-xl border text-xs transition-all ${
                            isAccepted
                              ? "bg-emerald-50/60 border-emerald-200"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                  {formatMoney(quoteMoney)}
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  (Ref: {q.quote_reference})
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Valid until: {q.valid_until} • Deposit: {formatMoney(depositMoney)}
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={isSelectedForComparison}
                                  onChange={() => toggleQuoteSelection(q.id)}
                                  className="rounded text-brand-700 focus:ring-brand-500"
                                />
                                <span>Compare</span>
                              </label>

                              {isAccepted ? (
                                <span className="flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold text-[10px]">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>COMMITTED</span>
                                </span>
                              ) : (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={isSubmitting}
                                  onClick={() => handleAcceptQuote(q.id)}
                                  className="text-[11px] h-7 px-2.5 bg-brand-900 hover:bg-brand-950 font-semibold"
                                >
                                  Accept & Commit
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Inclusions */}
                          {q.inclusions.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-semibold text-slate-400">Includes:</span>
                              {q.inclusions.map((inc, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                                >
                                  ✓ {inc}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Quotation Comparison Modal */}
      {comparisonModalOpen && comparisonResult && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-brand-700" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Side-by-Side Quotation Analysis
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparing {comparisonResult.quotes.length} quotations for {event.title} ({event.guest_count} guests)
                </p>
              </div>
              <button
                onClick={() => setComparisonModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analysis Callouts */}
            {comparisonResult.analysisNotes.length > 0 && (
              <div className="space-y-2">
                {comparisonResult.analysisNotes.map((note, i) => (
                  <div
                    key={i}
                    className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-950 flex items-start gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Side-by-side comparison grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonResult.quotes.map((item) => {
                const isCheapest = item.quote.id === comparisonResult.cheapestQuoteId;
                const isAccepted = item.quote.status === "ACCEPTED";

                return (
                  <div
                    key={item.quote.id}
                    className={`rounded-xl border p-4 flex flex-col justify-between space-y-4 ${
                      isAccepted
                        ? "bg-emerald-50/40 border-emerald-300"
                        : isCheapest
                        ? "bg-brand-50/30 border-brand-300 ring-1 ring-brand-300"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="purple" className="text-[10px]">
                          {item.vendor?.category || "SERVICE"}
                        </Badge>
                        {isCheapest && (
                          <span className="text-[9px] bg-brand-800 text-white font-extrabold px-1.5 py-0.5 rounded">
                            BEST PRICE
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 text-base">{item.vendor?.name}</h3>
                      <p className="text-xs text-slate-500">Ref: {item.quote.quote_reference}</p>

                      <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Total Quote</p>
                          <p className="text-xl font-extrabold text-slate-900">{item.formattedPrice}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Cost Per Guest</p>
                          <p className="text-xs font-bold text-brand-900">{item.formattedPerGuest}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">Deposit Required</p>
                          <p className="text-xs text-slate-700">
                            {item.formattedDeposit} ({item.depositPercentage}%)
                          </p>
                        </div>
                      </div>

                      {/* Inclusions summary */}
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <p className="text-[10px] font-bold text-slate-700 mb-1.5 uppercase">Inclusions</p>
                        <ul className="space-y-1 text-xs text-slate-600">
                          {item.quote.inclusions.map((inc, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      {isAccepted ? (
                        <div className="text-center font-bold text-emerald-800 text-xs py-1.5 bg-emerald-100 rounded-lg">
                          ✓ ACCEPTED & COMMITTED
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isSubmitting}
                          onClick={() => handleAcceptQuote(item.quote.id)}
                          className="w-full text-xs"
                        >
                          Accept This Quote
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Event Supplier</h2>
              <button onClick={() => setShowAddVendorModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-4">
              <Input
                label="Business / Supplier Name"
                placeholder="e.g. Royal Palace Banquets"
                value={newVendorName}
                onChange={(e) => setNewVendorName(e.target.value)}
                required
              />

              <Select
                label="Service Category"
                value={newVendorCategory}
                onChange={(e) => setNewVendorCategory(e.target.value as VendorCategory)}
                options={[
                  { label: "Venue & Mandap", value: "VENUE" },
                  { label: "Catering & Feast", value: "CATERING" },
                  { label: "Photography & Film", value: "PHOTOGRAPHY" },
                  { label: "Floral & Decor", value: "DECOR" },
                  { label: "Music & Entertainment", value: "MUSIC_ENTERTAINMENT" },
                  { label: "Transport & Logistics", value: "TRANSPORT" },
                  { label: "Attire & Styling", value: "ATTIRE" },
                  { label: "Other Services", value: "OTHER" },
                ]}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Contact Person"
                  placeholder="e.g. Rajesh Kumar"
                  value={newVendorContact}
                  onChange={(e) => setNewVendorContact(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. +91 98450 11223"
                  value={newVendorPhone}
                  onChange={(e) => setNewVendorPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="e.g. contact@supplier.com"
                value={newVendorEmail}
                onChange={(e) => setNewVendorEmail(e.target.value)}
                required
              />

              <Input
                label="Website (Optional)"
                placeholder="https://..."
                value={newVendorWebsite}
                onChange={(e) => setNewVendorWebsite(e.target.value)}
              />

              <Input
                label="Address / Service Area (Optional)"
                placeholder="e.g. MG Road, Bangalore"
                value={newVendorAddress}
                onChange={(e) => setNewVendorAddress(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddVendorModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Save Supplier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Quotation Modal */}
      {showAddQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900">Record Vendor Quotation</h2>
              <button onClick={() => setShowAddQuoteModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4">
              <Select
                label="Select Supplier"
                value={selectedVendorForQuote}
                onChange={(e) => setSelectedVendorForQuote(e.target.value)}
                options={vendors.map((v) => ({ label: `${v.name} (${v.category})`, value: v.id }))}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Quote Reference"
                  placeholder="e.g. QT-2026-01"
                  value={newQuoteRef}
                  onChange={(e) => setNewQuoteRef(e.target.value)}
                  required
                />
                <Input
                  label="Valid Until"
                  type="date"
                  value={newQuoteValidUntil}
                  onChange={(e) => setNewQuoteValidUntil(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Total Amount (₹)"
                  type="number"
                  value={newQuoteAmount}
                  onChange={(e) => setNewQuoteAmount(Number(e.target.value))}
                  required
                />
                <Input
                  label="Deposit Required (₹)"
                  type="number"
                  value={newQuoteDeposit}
                  onChange={(e) => setNewQuoteDeposit(Number(e.target.value))}
                />
              </div>

              <Input
                label="Inclusions (Comma separated)"
                placeholder="e.g. Setup, Staff, Transportation"
                value={newQuoteInclusions}
                onChange={(e) => setNewQuoteInclusions(e.target.value)}
              />

              <Input
                label="Exclusions (Comma separated)"
                placeholder="e.g. Electricity, Overtime fees"
                value={newQuoteExclusions}
                onChange={(e) => setNewQuoteExclusions(e.target.value)}
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddQuoteModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Save Quotation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
