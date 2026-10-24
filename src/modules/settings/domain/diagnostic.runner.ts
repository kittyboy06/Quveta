import { DiagnosticReport } from "./settings.schema";
import {
  SeedEvent,
  SeedBudgetCategory,
  SeedBudgetLineItem,
  SeedTask,
  SeedVendor,
  SeedVendorQuotation,
  SeedGuest,
  SeedSeatingTable,
  SeedSeatingAssignment,
  SeedRunSheetItem,
  SeedNotification,
} from "@/shared/db/seed-data";

export interface DiagnosticInput {
  event: SeedEvent;
  categories: SeedBudgetCategory[];
  lineItems: SeedBudgetLineItem[];
  tasks: SeedTask[];
  vendors: SeedVendor[];
  quotations: SeedVendorQuotation[];
  guests: SeedGuest[];
  tables: SeedSeatingTable[];
  assignments: SeedSeatingAssignment[];
  runSheetItems: SeedRunSheetItem[];
  notifications: SeedNotification[];
  isGeminiConfigured: boolean;
  latencyMs?: number;
}

export function runDiagnosticChecks(input: DiagnosticInput): DiagnosticReport {
  const {
    event,
    categories,
    lineItems,
    tasks,
    vendors,
    quotations,
    guests,
    tables,
    assignments,
    runSheetItems,
    notifications,
    isGeminiConfigured,
    latencyMs = 1.2,
  } = input;

  const issues: string[] = [];
  let orphanedCount = 0;

  // 1. Line item category & vendor checks
  const catIds = new Set(categories.map((c) => c.id));
  const catNames = new Set(categories.map((c) => c.name));
  for (const item of lineItems as any[]) {
    const hasCat =
      (item.category_id && catIds.has(item.category_id)) ||
      (item.category && (catNames.has(item.category) || catIds.has(item.category)));
    if (!hasCat) {
      issues.push(`Budget line item "${item.title || item.name}" references unlisted category "${item.category_id || item.category}"`);
      orphanedCount++;
    }
  }

  // 2. Quotation vendor checks
  const vendorIds = new Set(vendors.map((v) => v.id));
  for (const q of quotations) {
    if (!vendorIds.has(q.vendor_id)) {
      issues.push(`Quotation "${q.id}" references non-existent vendor "${q.vendor_id}"`);
      orphanedCount++;
    }
  }

  // 3. Seating assignment checks
  const guestIds = new Set(guests.map((g) => g.id));
  const tableIds = new Set(tables.map((t) => t.id));
  for (const asg of assignments) {
    if (!guestIds.has(asg.guest_id)) {
      issues.push(`Seating assignment references unknown guest "${asg.guest_id}"`);
      orphanedCount++;
    }
    if (!tableIds.has(asg.table_id)) {
      issues.push(`Seating assignment references unknown table "${asg.table_id}"`);
      orphanedCount++;
    }
  }

  const passed = issues.length === 0;
  const overallStatus = passed ? "HEALTHY" : issues.length > 3 ? "FAILED" : "DEGRADED";

  return {
    overallStatus,
    checkedAt: new Date().toISOString(),
    storageLatencyMs: latencyMs,
    relationalIntegrity: {
      passed,
      orphanedRecordsCount: orphanedCount,
      issues,
    },
    geminiApiStatus: isGeminiConfigured ? "CONFIGURED" : "FALLBACK_READY",
    recordCounts: {
      budgetCategories: categories.length,
      budgetLineItems: lineItems.length,
      tasks: tasks.length,
      vendors: vendors.length,
      quotations: quotations.length,
      guests: guests.length,
      seatingTables: tables.length,
      seatingAssignments: assignments.length,
      runSheetItems: runSheetItems.length,
      notifications: notifications.length,
    },
  };
}
