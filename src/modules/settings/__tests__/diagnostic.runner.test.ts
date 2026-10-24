import { describe, it, expect } from "vitest";
import { runDiagnosticChecks } from "../domain/diagnostic.runner";
import {
  SeedEvent,
  SeedBudgetCategory,
  SeedBudgetLineItem,
  SeedVendor,
  SeedVendorQuotation,
  SeedGuest,
  SeedSeatingTable,
  SeedSeatingAssignment,
} from "@/shared/db/seed-data";

describe("Module 15: System Diagnostic & Relational Integrity Runner", () => {
  const baseEvent: SeedEvent = {
    id: "evt-test-1",
    user_id: "usr-1",
    title: "Test Event",
    event_type: "WEDDING",
    event_date: "2026-12-01",
    location: "Grand Ballroom, Mumbai",
    start_date: "2026-12-01",
    end_date: "2026-12-02",
    guest_count: 50,
    target_budget: 10000000,
    total_budget: 10000000,
    currency: "INR",
    preferences: {
      theme: "Classic",
      mustHaves: [],
      priorities: {},
      dietary: [],
      accessibility: [],
    },
    status: "planning",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };

  const sampleCat: SeedBudgetCategory = {
    id: "cat-1",
    event_id: "evt-test-1",
    name: "VENUE",
    priority: "MUST_HAVE",
    target_ratio: 0.5,
    allocated_amount: 5000000,
  };

  const sampleItem: SeedBudgetLineItem = {
    id: "li-1",
    event_id: "evt-test-1",
    category_id: "cat-1",
    title: "Ballroom",
    planned_amount: 5000000,
    cost_type: "FIXED",
    status: "COMMITTED",
    per_guest_unit_cost: null,
    category: "VENUE",
    name: "Ballroom",
    estimated_amount: 5000000,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };

  it("passes cleanly with HEALTHY status when relational integrity is maintained", () => {
    const report = runDiagnosticChecks({
      event: baseEvent,
      categories: [sampleCat],
      lineItems: [sampleItem],
      tasks: [],
      vendors: [],
      quotations: [],
      guests: [],
      tables: [],
      assignments: [],
      runSheetItems: [],
      notifications: [],
      isGeminiConfigured: true,
      latencyMs: 1.5,
    });

    expect(report.overallStatus).toBe("HEALTHY");
    expect(report.relationalIntegrity.passed).toBe(true);
    expect(report.relationalIntegrity.orphanedRecordsCount).toBe(0);
    expect(report.recordCounts.budgetLineItems).toBe(1);
  });

  it("flags orphaned foreign keys in seating assignments", () => {
    const invalidAsg: SeedSeatingAssignment = {
      id: "asg-broken",
      event_id: "evt-test-1",
      table_id: "tbl-nonexistent",
      guest_id: "g-nonexistent",
      assigned_at: "2026-01-01",
    };

    const report = runDiagnosticChecks({
      event: baseEvent,
      categories: [sampleCat],
      lineItems: [sampleItem],
      tasks: [],
      vendors: [],
      quotations: [],
      guests: [],
      tables: [],
      assignments: [invalidAsg],
      runSheetItems: [],
      notifications: [],
      isGeminiConfigured: false,
    });

    expect(report.overallStatus).toBe("DEGRADED");
    expect(report.relationalIntegrity.passed).toBe(false);
    expect(report.relationalIntegrity.orphanedRecordsCount).toBe(2); // guest & table both missing
    expect(report.geminiApiStatus).toBe("FALLBACK_READY");
  });
});
