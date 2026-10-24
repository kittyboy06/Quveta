"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  PieChart,
  PlusCircle,
  SlidersHorizontal,
  ArrowLeft,
  Trash2,
  Edit2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { Card, CardHeader } from "@/shared/design-system/Card";
import { Button } from "@/shared/design-system/Button";
import { Badge } from "@/shared/design-system/Badge";
import { Input } from "@/shared/design-system/Input";
import { Select } from "@/shared/design-system/Select";
import {
  getBudgetDetailsAction,
  createLineItemAction,
  deleteLineItemAction,
} from "@/modules/budget/server/budget.actions";
import { formatMoney, toMajorUnits, createMoney } from "@/shared/types/money";

export default function BudgetManagementPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Line Item Form
  const [newItemData, setNewItemData] = useState({
    title: "",
    category_id: "",
    planned_amount: 10000,
    cost_type: "FIXED" as "FIXED" | "VARIABLE" | "MIXED",
    status: "ESTIMATED" as "ESTIMATED" | "QUOTED" | "COMMITTED" | "PAID",
    per_guest_unit_cost: 0,
    notes: "",
  });

  const loadData = async () => {
    setLoading(true);
    const res = await getBudgetDetailsAction(eventId);
    setData(res);
    if (res && res.categories.length > 0 && !newItemData.category_id) {
      setNewItemData((prev) => ({ ...prev, category_id: res.categories[0].id }));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await createLineItemAction(eventId, newItemData.category_id, {
      title: newItemData.title,
      planned_amount_major: Number(newItemData.planned_amount),
      cost_type: newItemData.cost_type,
      status: newItemData.status,
      per_guest_unit_cost_major:
        newItemData.cost_type === "VARIABLE" ? Number(newItemData.per_guest_unit_cost) : null,
      notes: newItemData.notes,
    });

    if (result.success) {
      setIsAddModalOpen(false);
      setNewItemData({
        title: "",
        category_id: data.categories[0]?.id || "",
        planned_amount: 10000,
        cost_type: "FIXED",
        status: "ESTIMATED",
        per_guest_unit_cost: 0,
        notes: "",
      });
      await loadData();
    } else {
      setErrorMessage(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this line item?")) return;
    await deleteLineItemAction(eventId, itemId);
    await loadData();
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading authoritative budget ledger...</p>
        </div>
      </div>
    );
  }

  const { event, categories, lineItems, summary, categoryBreakdowns } = data;

  const filteredLineItems = lineItems.filter((item: any) =>
    selectedCategoryFilter === "ALL" ? true : item.category_id === selectedCategoryFilter
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Navigation & Simulator Shortcut */}
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
            <PieChart className="w-6 h-6 text-brand-700" />
            <span>Budget Management</span>
          </h1>
          <p className="text-xs text-slate-500">
            Authoritative expenditure ledger with fixed vs. variable categorization and quotation tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-brand-700" />
            <span>Add Line Item</span>
          </Button>

          <Link href={`/events/${eventId}/simulator`}>
            <Button size="sm" className="gap-1.5 shadow-sm bg-brand-800 text-white">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Open Simulator</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Target Budget
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatMoney(summary.targetBudget)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Authorized event ceiling</p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Total Planned Spend
          </p>
          <p className="text-2xl font-extrabold text-brand-900">
            {formatMoney(summary.totalPlanned)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Fixed: {formatMoney(summary.fixedTotal)} • Variable: {formatMoney(summary.variableTotal)}
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Committed / Paid
          </p>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatMoney(summary.totalCommitted)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Paid in cash: {formatMoney(summary.totalPaid)}
          </p>
        </Card>

        <Card className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Remaining Budget
          </p>
          <p
            className={`text-2xl font-extrabold ${
              summary.remainingBudget.amount >= 0 ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {formatMoney(summary.remainingBudget)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {summary.remainingBudget.amount >= 0 ? (
              <span className="text-emerald-700 font-medium">Safe buffer</span>
            ) : (
              <span className="text-red-700 font-medium">
                Over budget by {summary.variancePercentage}%
              </span>
            )}
          </p>
        </Card>
      </div>

      {/* Category Allocations Breakdown */}
      <Card className="space-y-4">
        <CardHeader
          title="Category Allocations & Spending Progress"
          subtitle="How your budget is distributed across major departments and priority tiers."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdowns.map((cat: any) => {
            const priorityBadgeVariant =
              cat.priority === "MUST_HAVE"
                ? "purple"
                : cat.priority === "HIGH"
                ? "warning"
                : cat.priority === "LOW"
                ? "neutral"
                : "info";

            return (
              <div
                key={cat.id}
                className="rounded-lg border border-slate-200/80 p-3.5 bg-slate-50/50 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cat.name}</h4>
                    <p className="text-[11px] text-slate-500">{cat.itemsCount} line items</p>
                  </div>
                  <Badge variant={priorityBadgeVariant as any} className="text-[10px]">
                    {cat.priority.replace("_", " ")}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Planned / Allocated:</span>
                    <span className="font-semibold text-slate-900">
                      {formatMoney(cat.plannedAmount)} / {formatMoney(cat.allocatedAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        cat.percentageUsed > 100
                          ? "bg-red-600"
                          : cat.percentageUsed > 85
                          ? "bg-amber-500"
                          : "bg-brand-700"
                      }`}
                      style={{ width: `${Math.min(cat.percentageUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Line Items Table */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">All Budget Line Items</h3>
            <p className="text-xs text-slate-500">
              Granular breakdown of expenses with verifiable statuses and unit costs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:ring-2 focus:ring-brand-600"
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories ({lineItems.length})</option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredLineItems.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-lg">
            <p className="text-xs text-slate-400 font-medium">No line items in this category yet.</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 gap-1.5 text-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add First Line Item</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Cost Type</th>
                  <th className="px-4 py-3">Verification Status</th>
                  <th className="px-4 py-3 text-right">Planned Amount</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredLineItems.map((item: any) => {
                  const cat = categories.find((c: any) => c.id === item.category_id);
                  const statusVariant =
                    item.status === "PAID"
                      ? "success"
                      : item.status === "COMMITTED"
                      ? "purple"
                      : item.status === "QUOTED"
                      ? "info"
                      : "neutral";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{item.title}</span>
                        {item.notes && <span className="text-[10px] text-slate-400 block">{item.notes}</span>}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{cat?.name || "General"}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                            item.cost_type === "VARIABLE"
                              ? "bg-amber-100 text-amber-900"
                              : item.cost_type === "FIXED"
                              ? "bg-blue-100 text-blue-900"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {item.cost_type}
                          {item.per_guest_unit_cost && (
                            <span className="ml-1 text-[9px] font-normal lowercase">
                              (₹{toMajorUnits(createMoney(item.per_guest_unit_cost, event.currency))}/guest)
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant as any} className="text-[10px]">
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {formatMoney(createMoney(item.planned_amount, event.currency))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          aria-label="Delete line item"
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Line Item Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Budget Line Item</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateItem} className="space-y-3.5">
              <Input
                label="Item Name / Service Title"
                placeholder="e.g. Wedding Cake & Dessert Table"
                required
                value={newItemData.title}
                onChange={(e) => setNewItemData({ ...newItemData, title: e.target.value })}
              />

              <Select
                label="Category"
                options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                value={newItemData.category_id}
                onChange={(e) => setNewItemData({ ...newItemData, category_id: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Planned Amount (₹)"
                  type="number"
                  min={0}
                  required
                  value={newItemData.planned_amount}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, planned_amount: Number(e.target.value) })
                  }
                />

                <Select
                  label="Cost Type"
                  options={[
                    { value: "FIXED", label: "Fixed Cost (Does not scale)" },
                    { value: "VARIABLE", label: "Variable Cost (Per Guest)" },
                    { value: "MIXED", label: "Mixed Cost" },
                  ]}
                  value={newItemData.cost_type}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, cost_type: e.target.value as any })
                  }
                />
              </div>

              {newItemData.cost_type === "VARIABLE" && (
                <Input
                  label="Per-Guest Unit Cost (₹)"
                  type="number"
                  min={0}
                  value={newItemData.per_guest_unit_cost}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, per_guest_unit_cost: Number(e.target.value) })
                  }
                  helperText="Used by Adaptive Simulator to scale when guest counts change"
                />
              )}

              <Select
                label="Verification Status"
                options={[
                  { value: "ESTIMATED", label: "Estimated (Initial projection)" },
                  { value: "QUOTED", label: "Quoted (Supplier quote received)" },
                  { value: "COMMITTED", label: "Committed (Contract signed)" },
                  { value: "PAID", label: "Paid (Payment executed)" },
                ]}
                value={newItemData.status}
                onChange={(e) => setNewItemData({ ...newItemData, status: e.target.value as any })}
              />

              <Input
                label="Notes / Vendor Info (Optional)"
                placeholder="e.g. 50% advance due on booking"
                value={newItemData.notes}
                onChange={(e) => setNewItemData({ ...newItemData, notes: e.target.value })}
              />

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Save Line Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
