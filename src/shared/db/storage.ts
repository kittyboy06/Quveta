import fs from "fs";
import path from "path";
import { env } from "../config/env";
import {
  INITIAL_SEEDED_EVENTS,
  INITIAL_SEEDED_CATEGORIES,
  INITIAL_SEEDED_LINE_ITEMS,
  INITIAL_SEEDED_TASKS,
  INITIAL_SEEDED_DEPENDENCIES,
  INITIAL_SEEDED_VENDORS,
  INITIAL_SEEDED_QUOTATIONS,
  INITIAL_SEEDED_RUN_SHEET_ITEMS,
  INITIAL_SEEDED_INCIDENTS,
  INITIAL_SEEDED_HOUSEHOLD_GROUPS,
  INITIAL_SEEDED_GUESTS,
  INITIAL_SEEDED_SEATING_TABLES,
  INITIAL_SEEDED_SEATING_ASSIGNMENTS,
  INITIAL_SEEDED_INVITATIONS,
  INITIAL_SEEDED_COMMUNICATION_LOGS,
  INITIAL_SEEDED_INSIGHTS,
  INITIAL_SEEDED_NOTIFICATIONS,
  INITIAL_SEEDED_SETTINGS,
  INITIAL_SEEDED_AUDIT_LOGS,
  SeedEvent,
  SeedCategory,
  SeedLineItem,
  SeedTask,
  SeedDependency,
  SeedVendor,
  SeedQuotation,
  SeedRunSheetItem,
  SeedRunSheetIncident,
  SeedHouseholdGroup,
  SeedGuest,
  SeedSeatingTable,
  SeedSeatingAssignment,
  SeedInvitationDesign,
  SeedCommunicationLog,
  SeedEventInsight,
  SeedNotification,
  SeedEventSettings,
  SeedAuditLog,
} from "./seed-data";

export interface ScenarioRecord {
  id: string;
  event_id: string;
  proposed_budget: number;
  proposed_guest_count: number;
  summary: string;
  status: "DRAFT" | "APPLIED" | "REJECTED";
  created_at: string;
}

export interface ScenarioRecommendationRecord {
  id: string;
  scenario_id: string;
  category_id?: string;
  action: string;
  current_amount: number;
  proposed_amount: number;
  diff_amount: number;
  trade_off_explanation: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
}

export interface DatabaseState {
  events: SeedEvent[];
  categories: SeedCategory[];
  lineItems: SeedLineItem[];
  tasks: SeedTask[];
  dependencies: SeedDependency[];
  scenarios: ScenarioRecord[];
  recommendations: ScenarioRecommendationRecord[];
  vendors: SeedVendor[];
  quotations: SeedQuotation[];
  runSheetItems: SeedRunSheetItem[];
  runSheetIncidents: SeedRunSheetIncident[];
  householdGroups: SeedHouseholdGroup[];
  guests: SeedGuest[];
  seatingTables: SeedSeatingTable[];
  seatingAssignments: SeedSeatingAssignment[];
  invitationDesigns: SeedInvitationDesign[];
  communicationLogs: SeedCommunicationLog[];
  eventInsights: SeedEventInsight[];
  notifications: SeedNotification[];
  eventSettings: SeedEventSettings[];
  auditLogs: SeedAuditLog[];
}

const DB_FILE = path.isAbsolute(env.DATABASE_STORAGE_PATH)
  ? env.DATABASE_STORAGE_PATH
  : path.resolve(process.cwd(), env.DATABASE_STORAGE_PATH);
const DATA_DIR = path.dirname(DB_FILE);

function getInitialState(): DatabaseState {
  return {
    events: INITIAL_SEEDED_EVENTS,
    categories: INITIAL_SEEDED_CATEGORIES,
    lineItems: INITIAL_SEEDED_LINE_ITEMS,
    tasks: INITIAL_SEEDED_TASKS,
    dependencies: INITIAL_SEEDED_DEPENDENCIES,
    scenarios: [],
    recommendations: [],
    vendors: INITIAL_SEEDED_VENDORS,
    quotations: INITIAL_SEEDED_QUOTATIONS,
    runSheetItems: INITIAL_SEEDED_RUN_SHEET_ITEMS,
    runSheetIncidents: INITIAL_SEEDED_INCIDENTS,
    householdGroups: INITIAL_SEEDED_HOUSEHOLD_GROUPS,
    guests: INITIAL_SEEDED_GUESTS,
    seatingTables: INITIAL_SEEDED_SEATING_TABLES,
    seatingAssignments: INITIAL_SEEDED_SEATING_ASSIGNMENTS,
    invitationDesigns: INITIAL_SEEDED_INVITATIONS,
    communicationLogs: INITIAL_SEEDED_COMMUNICATION_LOGS,
    eventInsights: INITIAL_SEEDED_INSIGHTS,
    notifications: INITIAL_SEEDED_NOTIFICATIONS,
    eventSettings: INITIAL_SEEDED_SETTINGS,
    auditLogs: INITIAL_SEEDED_AUDIT_LOGS,
  };
}

let memoryCache: DatabaseState | null = null;

function ensureDbFile(): DatabaseState {
  if (memoryCache) {
    return memoryCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialState();
      saveDb(initial);
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    if (!raw || raw.trim().length === 0) {
      const initial = getInitialState();
      saveDb(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);

    // Backfill any missing arrays from initial state
    let modified = false;
    const initial = getInitialState();
    const state: DatabaseState = {
      events: parsed.events || initial.events,
      categories: parsed.categories || initial.categories,
      lineItems: parsed.lineItems || initial.lineItems,
      tasks: parsed.tasks || initial.tasks,
      dependencies: parsed.dependencies || initial.dependencies,
      scenarios: parsed.scenarios || [],
      recommendations: parsed.recommendations || [],
      vendors: parsed.vendors || initial.vendors,
      quotations: parsed.quotations || initial.quotations,
      runSheetItems: parsed.runSheetItems || initial.runSheetItems,
      runSheetIncidents: parsed.runSheetIncidents || initial.runSheetIncidents,
      householdGroups: parsed.householdGroups || initial.householdGroups,
      guests: parsed.guests || initial.guests,
      seatingTables: parsed.seatingTables || initial.seatingTables,
      seatingAssignments: parsed.seatingAssignments || initial.seatingAssignments,
      invitationDesigns: parsed.invitationDesigns || initial.invitationDesigns,
      communicationLogs: parsed.communicationLogs || initial.communicationLogs,
      eventInsights: parsed.eventInsights || initial.eventInsights,
      notifications: parsed.notifications || initial.notifications,
      eventSettings: parsed.eventSettings || initial.eventSettings,
      auditLogs: parsed.auditLogs || initial.auditLogs,
    };

    if (!parsed.vendors || !parsed.guests || !parsed.runSheetItems) {
      modified = true;
    }

    memoryCache = state;
    if (modified) {
      saveDb(state);
    }
    return state;
  } catch (err) {
    console.error("Database initialization error:", err);
    const fallback = getInitialState();
    memoryCache = fallback;
    return fallback;
  }
}

function saveDb(state: DatabaseState): void {
  memoryCache = state;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database:", err);
  }
}

export const db = {
  // ==========================================
  // MODULE 02: EVENTS
  // ==========================================
  getEvents: (): SeedEvent[] => {
    return ensureDbFile().events.filter((e) => e.status !== "cancelled");
  },

  getEventById: (id: string): SeedEvent | null => {
    const state = ensureDbFile();
    return state.events.find((e) => e.id === id) || null;
  },

  createEvent: (event: Omit<SeedEvent, "id" | "created_at" | "updated_at">): SeedEvent => {
    const state = ensureDbFile();
    const newEvent: SeedEvent = {
      ...event,
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.events.unshift(newEvent);

    // Initialize default settings for the event
    state.eventSettings.push({
      event_id: newEvent.id,
      currency: newEvent.currency || "INR",
      timezone: "Asia/Kolkata",
      default_catering_budget_per_guest: 150000,
      notifications_enabled: true,
      ai_features_enabled: true,
      privacy_mode: false,
      updated_at: new Date().toISOString(),
    });

    saveDb(state);
    return newEvent;
  },

  updateEvent: (id: string, updates: Partial<Omit<SeedEvent, "id" | "created_at">>): SeedEvent | null => {
    const state = ensureDbFile();
    const idx = state.events.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    state.events[idx] = {
      ...state.events[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDb(state);
    return state.events[idx];
  },

  // ==========================================
  // MODULE 04: BUDGET CATEGORIES & LINE ITEMS
  // ==========================================
  getCategoriesByEventId: (eventId: string): SeedCategory[] => {
    return ensureDbFile().categories.filter((c) => c.event_id === eventId);
  },

  createCategory: (category: Omit<SeedCategory, "id">): SeedCategory => {
    const state = ensureDbFile();
    const newCategory: SeedCategory = {
      ...category,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    state.categories.push(newCategory);
    saveDb(state);
    return newCategory;
  },

  getBudgetLineItemsByEventId: (eventId: string): SeedLineItem[] => {
    return ensureDbFile().lineItems.filter((li) => li.event_id === eventId);
  },

  getBudgetCategoriesByEventId: (eventId: string): SeedCategory[] => {
    return ensureDbFile().categories.filter((c) => c.event_id === eventId);
  },

  getLineItemsByEventId: (eventId: string): SeedLineItem[] => {
    return ensureDbFile().lineItems.filter((li) => li.event_id === eventId);
  },

  createLineItem: (item: Omit<SeedLineItem, "id">): SeedLineItem => {
    const state = ensureDbFile();
    const newItem: SeedLineItem = {
      ...item,
      id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    state.lineItems.push(newItem);
    saveDb(state);
    return newItem;
  },

  updateLineItem: (id: string, updates: Partial<Omit<SeedLineItem, "id" | "event_id">>): SeedLineItem | null => {
    const state = ensureDbFile();
    const idx = state.lineItems.findIndex((li) => li.id === id);
    if (idx === -1) return null;
    state.lineItems[idx] = { ...state.lineItems[idx], ...updates };
    saveDb(state);
    return state.lineItems[idx];
  },

  deleteLineItem: (id: string): boolean => {
    const state = ensureDbFile();
    const lenBefore = state.lineItems.length;
    state.lineItems = state.lineItems.filter((li) => li.id !== id);
    if (state.lineItems.length !== lenBefore) {
      saveDb(state);
      return true;
    }
    return false;
  },

  // ==========================================
  // MODULE 05: ADAPTIVE SIMULATOR
  // ==========================================
  getScenariosByEventId: (eventId: string): ScenarioRecord[] => {
    return ensureDbFile().scenarios.filter((s) => s.event_id === eventId);
  },

  getScenarioById: (id: string): { scenario: ScenarioRecord; recommendations: ScenarioRecommendationRecord[] } | null => {
    const state = ensureDbFile();
    const scenario = state.scenarios.find((s) => s.id === id);
    if (!scenario) return null;
    const recommendations = state.recommendations.filter((r) => r.scenario_id === id);
    return { scenario, recommendations };
  },

  createScenario: (
    scenario: Omit<ScenarioRecord, "id" | "created_at">,
    recs: Omit<ScenarioRecommendationRecord, "id" | "scenario_id">[]
  ): { scenario: ScenarioRecord; recommendations: ScenarioRecommendationRecord[] } => {
    const state = ensureDbFile();
    const scenarioId = `scen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newScenario: ScenarioRecord = {
      ...scenario,
      id: scenarioId,
      created_at: new Date().toISOString(),
    };
    state.scenarios.unshift(newScenario);

    const newRecs: ScenarioRecommendationRecord[] = recs.map((r, i) => ({
      ...r,
      id: `rec-${Date.now()}-${i}`,
      scenario_id: scenarioId,
    }));
    state.recommendations.push(...newRecs);

    saveDb(state);
    return { scenario: newScenario, recommendations: newRecs };
  },

  updateRecommendationStatus: (id: string, status: "ACCEPTED" | "REJECTED" | "PENDING"): boolean => {
    const state = ensureDbFile();
    const rec = state.recommendations.find((r) => r.id === id);
    if (!rec) return false;
    rec.status = status;
    saveDb(state);
    return true;
  },

  applyApprovedScenario: (scenarioId: string): boolean => {
    const state = ensureDbFile();
    const scenario = state.scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return false;

    const acceptedRecs = state.recommendations.filter(
      (r) => r.scenario_id === scenarioId && r.status === "ACCEPTED"
    );

    for (const rec of acceptedRecs) {
      if (rec.category_id) {
        const cat = state.categories.find((c) => c.id === rec.category_id);
        if (cat) {
          cat.allocated_amount = rec.proposed_amount;
        }
      }
    }

    const event = state.events.find((e) => e.id === scenario.event_id);
    if (event) {
      event.target_budget = scenario.proposed_budget;
      event.guest_count = scenario.proposed_guest_count;
      event.updated_at = new Date().toISOString();
    }

    scenario.status = "APPLIED";
    saveDb(state);
    return true;
  },

  // ==========================================
  // MODULE 06: TASKS & DAG TIMELINE
  // ==========================================
  getTasksByEventId: (eventId: string): SeedTask[] => {
    return ensureDbFile().tasks.filter((t) => t.event_id === eventId);
  },

  getTaskById: (id: string): SeedTask | null => {
    const state = ensureDbFile();
    return state.tasks.find((t) => t.id === id) || null;
  },

  createTask: (task: Omit<SeedTask, "id">): SeedTask => {
    const state = ensureDbFile();
    const newTask: SeedTask = {
      ...task,
      id: `tsk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    state.tasks.push(newTask);
    saveDb(state);
    return newTask;
  },

  updateTask: (id: string, updates: Partial<Omit<SeedTask, "id" | "event_id">>): SeedTask | null => {
    const state = ensureDbFile();
    const idx = state.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    state.tasks[idx] = { ...state.tasks[idx], ...updates };
    saveDb(state);
    return state.tasks[idx];
  },

  deleteTask: (id: string): boolean => {
    const state = ensureDbFile();
    state.tasks = state.tasks.filter((t) => t.id !== id);
    state.dependencies = state.dependencies.filter((d) => d.task_id !== id && d.prerequisite_task_id !== id);
    saveDb(state);
    return true;
  },

  getDependenciesByEventId: (eventId: string): SeedDependency[] => {
    const state = ensureDbFile();
    const eventTaskIds = new Set(state.tasks.filter((t) => t.event_id === eventId).map((t) => t.id));
    return state.dependencies.filter(
      (d) => eventTaskIds.has(d.task_id) && eventTaskIds.has(d.prerequisite_task_id)
    );
  },

  createDependency: (taskId: string, prerequisiteTaskId: string): SeedDependency | null => {
    const state = ensureDbFile();
    if (taskId === prerequisiteTaskId) return null;
    const exists = state.dependencies.some(
      (d) => d.task_id === taskId && d.prerequisite_task_id === prerequisiteTaskId
    );
    if (exists) return null;

    const newDep: SeedDependency = {
      id: `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      task_id: taskId,
      prerequisite_task_id: prerequisiteTaskId,
    };
    state.dependencies.push(newDep);
    saveDb(state);
    return newDep;
  },

  // ==========================================
  // MODULE 07: VENDORS & QUOTATIONS
  // ==========================================
  getVendorsByEventId: (eventId: string): SeedVendor[] => {
    return ensureDbFile().vendors.filter((v) => v.event_id === eventId);
  },

  getVendorById: (id: string): SeedVendor | null => {
    const state = ensureDbFile();
    return state.vendors.find((v) => v.id === id) || null;
  },

  createVendor: (vendor: Omit<SeedVendor, "id" | "created_at" | "updated_at">): SeedVendor => {
    const state = ensureDbFile();
    const newVendor: SeedVendor = {
      ...vendor,
      id: `ven-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    state.vendors.push(newVendor);
    saveDb(state);
    return newVendor;
  },

  updateVendor: (id: string, updates: Partial<Omit<SeedVendor, "id" | "event_id" | "created_at">>): SeedVendor | null => {
    const state = ensureDbFile();
    const idx = state.vendors.findIndex((v) => v.id === id);
    if (idx === -1) return null;
    state.vendors[idx] = {
      ...state.vendors[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    saveDb(state);
    return state.vendors[idx];
  },

  deleteVendor: (id: string): boolean => {
    const state = ensureDbFile();
    state.vendors = state.vendors.filter((v) => v.id !== id);
    state.quotations = state.quotations.filter((q) => q.vendor_id !== id);
    state.runSheetItems.forEach((rs) => {
      if (rs.vendor_id === id) rs.vendor_id = undefined;
    });
    saveDb(state);
    return true;
  },

  getQuotationsByEventId: (eventId: string): SeedQuotation[] => {
    return ensureDbFile().quotations.filter((q) => q.event_id === eventId);
  },

  getQuotationsByVendorId: (vendorId: string): SeedQuotation[] => {
    return ensureDbFile().quotations.filter((q) => q.vendor_id === vendorId);
  },

  getQuotationById: (id: string): SeedQuotation | null => {
    const state = ensureDbFile();
    return state.quotations.find((q) => q.id === id) || null;
  },

  createQuotation: (quote: Omit<SeedQuotation, "id" | "created_at">): SeedQuotation => {
    const state = ensureDbFile();
    const newQuote: SeedQuotation = {
      ...quote,
      id: `qt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    state.quotations.push(newQuote);
    saveDb(state);
    return newQuote;
  },

  acceptQuotation: (quotationId: string): { success: boolean; lineItemId?: string } => {
    const state = ensureDbFile();
    const quote = state.quotations.find((q) => q.id === quotationId);
    if (!quote) return { success: false };

    // Set quote status to ACCEPTED
    quote.status = "ACCEPTED";

    // Set vendor status to BOOKED
    const vendor = state.vendors.find((v) => v.id === quote.vendor_id);
    if (vendor) {
      vendor.status = "BOOKED";
      vendor.updated_at = new Date().toISOString();
    }

    // RELATIONAL COUPLING TO MODULE 04 (BUDGET):
    // If a linked line item already exists, commit to it.
    // Otherwise find a matching line item in the category or create a new committed line item.
    let targetLineItem: SeedLineItem | undefined;
    if (quote.linked_budget_line_item_id) {
      targetLineItem = state.lineItems.find((li) => li.id === quote.linked_budget_line_item_id);
    }

    if (!targetLineItem && vendor) {
      // Find category matching vendor category
      const cat = state.categories.find(
        (c) => c.event_id === quote.event_id && c.name.toLowerCase().includes(vendor.category.toLowerCase().slice(0, 4))
      ) || state.categories.find((c) => c.event_id === quote.event_id);

      if (cat) {
        targetLineItem = state.lineItems.find((li) => li.category_id === cat.id);
        if (!targetLineItem) {
          targetLineItem = {
            id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            event_id: quote.event_id,
            category_id: cat.id,
            title: `${vendor.name} Contract`,
            planned_amount: quote.amount_minor,
            cost_type: "FIXED",
            status: "COMMITTED",
            per_guest_unit_cost: null,
            notes: `Committed via accepted quote ${quote.quote_reference}`,
          };
          state.lineItems.push(targetLineItem);
        }
      }
    }

    if (targetLineItem) {
      targetLineItem.planned_amount = quote.amount_minor;
      targetLineItem.status = "COMMITTED";
      targetLineItem.notes = `Vendor: ${vendor?.name || "Booked Vendor"} (Ref: ${quote.quote_reference})`;
      quote.linked_budget_line_item_id = targetLineItem.id;
    }

    // Record audit log
    state.auditLogs.push({
      id: `aud-${Date.now()}`,
      event_id: quote.event_id,
      action: "VENDOR_QUOTE_ACCEPTED",
      entity_type: "QUOTATION",
      entity_id: quote.id,
      actor: "Event Organizer",
      details: { amount: quote.amount_minor, vendor: vendor?.name, line_item: targetLineItem?.id },
      timestamp: new Date().toISOString(),
    });

    saveDb(state);
    return { success: true, lineItemId: targetLineItem?.id };
  },

  // ==========================================
  // MODULE 08: RUN SHEET & INCIDENTS
  // ==========================================
  getRunSheetItemsByEventId: (eventId: string): SeedRunSheetItem[] => {
    return ensureDbFile().runSheetItems
      .filter((rs) => rs.event_id === eventId)
      .sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0) || (a.scheduled_start_time || "").localeCompare(b.scheduled_start_time || ""));
  },

  createRunSheetItem: (item: Omit<SeedRunSheetItem, "id" | "created_at">): SeedRunSheetItem => {
    const state = ensureDbFile();
    const newItem: SeedRunSheetItem = {
      ...item,
      id: `rs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    state.runSheetItems.push(newItem);
    saveDb(state);
    return newItem;
  },

  updateRunSheetItem: (id: string, updates: Partial<Omit<SeedRunSheetItem, "id" | "event_id" | "created_at">>): SeedRunSheetItem | null => {
    const state = ensureDbFile();
    const idx = state.runSheetItems.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    state.runSheetItems[idx] = { ...state.runSheetItems[idx], ...updates };
    saveDb(state);
    return state.runSheetItems[idx];
  },

  deleteRunSheetItem: (id: string): boolean => {
    const state = ensureDbFile();
    state.runSheetItems = state.runSheetItems.filter((r) => r.id !== id);
    state.runSheetIncidents = state.runSheetIncidents.filter((inc) => inc.run_sheet_item_id !== id);
    saveDb(state);
    return true;
  },

  getRunSheetIncidentsByEventId: (eventId: string): SeedRunSheetIncident[] => {
    return ensureDbFile().runSheetIncidents.filter((inc) => inc.event_id === eventId);
  },

  getIncidentsByEventId: (eventId: string): SeedRunSheetIncident[] => {
    return ensureDbFile().runSheetIncidents.filter((inc) => inc.event_id === eventId);
  },

  createIncident: (incident: Omit<SeedRunSheetIncident, "id" | "reported_time">): SeedRunSheetIncident => {
    const state = ensureDbFile();
    const newInc: SeedRunSheetIncident = {
      ...incident,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reported_time: new Date().toISOString(),
    };
    state.runSheetIncidents.unshift(newInc);
    saveDb(state);
    return newInc;
  },

  resolveIncident: (id: string, resolutionNotes: string): boolean => {
    const state = ensureDbFile();
    const inc = state.runSheetIncidents.find((i) => i.id === id);
    if (!inc) return false;
    inc.resolved_time = new Date().toISOString();
    inc.resolution_notes = resolutionNotes;
    saveDb(state);
    return true;
  },

  // ==========================================
  // MODULE 09: GUESTS & HOUSEHOLDS
  // ==========================================
  getGuestsByEventId: (eventId: string): SeedGuest[] => {
    return ensureDbFile().guests.filter((g) => g.event_id === eventId);
  },

  getGuestById: (id: string): SeedGuest | null => {
    const state = ensureDbFile();
    return state.guests.find((g) => g.id === id) || null;
  },

  createGuest: (guest: Omit<SeedGuest, "id" | "created_at">): SeedGuest => {
    const state = ensureDbFile();
    const newGuest: SeedGuest = {
      ...guest,
      id: `gst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    state.guests.push(newGuest);
    saveDb(state);
    return newGuest;
  },

  updateGuest: (id: string, updates: Partial<Omit<SeedGuest, "id" | "event_id" | "created_at">>): SeedGuest | null => {
    const state = ensureDbFile();
    const idx = state.guests.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    state.guests[idx] = { ...state.guests[idx], ...updates };
    saveDb(state);
    return state.guests[idx];
  },

  deleteGuest: (id: string): boolean => {
    const state = ensureDbFile();
    state.guests = state.guests.filter((g) => g.id !== id);
    // Cascade remove from seating assignments
    state.seatingAssignments = state.seatingAssignments.filter((sa) => sa.guest_id !== id);
    saveDb(state);
    return true;
  },

  getHouseholdGroupsByEventId: (eventId: string): SeedHouseholdGroup[] => {
    return ensureDbFile().householdGroups.filter((h) => h.event_id === eventId);
  },

  createHouseholdGroup: (group: Omit<SeedHouseholdGroup, "id">): SeedHouseholdGroup => {
    const state = ensureDbFile();
    const newGroup: SeedHouseholdGroup = {
      ...group,
      id: `hh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    state.householdGroups.push(newGroup);
    saveDb(state);
    return newGroup;
  },

  batchImportGuests: (eventId: string, newGuests: Omit<SeedGuest, "id" | "event_id" | "created_at">[]): number => {
    const state = ensureDbFile();
    let imported = 0;
    for (const g of newGuests) {
      state.guests.push({
        ...g,
        id: `gst-${Date.now()}-${imported}-${Math.random().toString(36).substring(2, 5)}`,
        event_id: eventId,
        created_at: new Date().toISOString(),
      });
      imported++;
    }
    saveDb(state);
    return imported;
  },

  // ==========================================
  // MODULE 10: SEATING PLANNER
  // ==========================================
  getSeatingTablesByEventId: (eventId: string): SeedSeatingTable[] => {
    return ensureDbFile().seatingTables.filter((t) => t.event_id === eventId);
  },

  createSeatingTable: (table: Omit<SeedSeatingTable, "id">): SeedSeatingTable => {
    const state = ensureDbFile();
    const newTable: SeedSeatingTable = {
      ...table,
      id: `tbl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    state.seatingTables.push(newTable);
    saveDb(state);
    return newTable;
  },

  updateSeatingTable: (id: string, updates: Partial<Omit<SeedSeatingTable, "id" | "event_id">>): SeedSeatingTable | null => {
    const state = ensureDbFile();
    const idx = state.seatingTables.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    state.seatingTables[idx] = { ...state.seatingTables[idx], ...updates };
    saveDb(state);
    return state.seatingTables[idx];
  },

  deleteSeatingTable: (id: string): boolean => {
    const state = ensureDbFile();
    state.seatingTables = state.seatingTables.filter((t) => t.id !== id);
    state.seatingAssignments = state.seatingAssignments.filter((sa) => sa.table_id !== id);
    saveDb(state);
    return true;
  },

  getSeatingAssignmentsByEventId: (eventId: string): SeedSeatingAssignment[] => {
    const state = ensureDbFile();
    const eventTableIds = new Set(state.seatingTables.filter((t) => t.event_id === eventId).map((t) => t.id));
    return state.seatingAssignments.filter((sa) => eventTableIds.has(sa.table_id));
  },

  assignGuestToTable: (tableId: string, guestId: string, seatNumber?: number): { success: boolean; error?: string } => {
    const state = ensureDbFile();
    const table = state.seatingTables.find((t) => t.id === tableId);
    if (!table) return { success: false, error: "Table not found." };

    // Check capacity
    const currentAssignments = state.seatingAssignments.filter((sa) => sa.table_id === tableId);
    if (currentAssignments.length >= table.capacity) {
      return { success: false, error: `Table is already at maximum capacity (${table.capacity} seats).` };
    }

    // Unique seat constraint: remove prior seat if any
    state.seatingAssignments = state.seatingAssignments.filter((sa) => sa.guest_id !== guestId);

    state.seatingAssignments.push({
      id: `sa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      table_id: tableId,
      guest_id: guestId,
      seat_number: seatNumber || currentAssignments.length + 1,
      assigned_at: new Date().toISOString(),
    });

    saveDb(state);
    return { success: true };
  },

  unassignGuest: (guestId: string): boolean => {
    const state = ensureDbFile();
    const lenBefore = state.seatingAssignments.length;
    state.seatingAssignments = state.seatingAssignments.filter((sa) => sa.guest_id !== guestId);
    if (state.seatingAssignments.length !== lenBefore) {
      saveDb(state);
      return true;
    }
    return false;
  },

  // ==========================================
  // MODULE 11: INVITATIONS & COMMUNICATIONS
  // ==========================================
  getInvitationDesignByEventId: (eventId: string): SeedInvitationDesign | null => {
    const state = ensureDbFile();
    return state.invitationDesigns.find((inv) => inv.event_id === eventId) || null;
  },

  saveInvitationDesign: (design: Omit<SeedInvitationDesign, "id" | "updated_at">): SeedInvitationDesign => {
    const state = ensureDbFile();
    const idx = state.invitationDesigns.findIndex((inv) => inv.event_id === design.event_id);
    if (idx !== -1) {
      state.invitationDesigns[idx] = {
        ...state.invitationDesigns[idx],
        ...design,
        updated_at: new Date().toISOString(),
      };
      saveDb(state);
      return state.invitationDesigns[idx];
    } else {
      const newDesign: SeedInvitationDesign = {
        ...design,
        id: `inv-${Date.now()}`,
        updated_at: new Date().toISOString(),
      };
      state.invitationDesigns.push(newDesign);
      saveDb(state);
      return newDesign;
    }
  },

  getCommunicationLogsByEventId: (eventId: string): SeedCommunicationLog[] => {
    return ensureDbFile().communicationLogs
      .filter((cl) => cl.event_id === eventId)
      .sort((a, b) => b.sent_at.localeCompare(a.sent_at));
  },

  createCommunicationLog: (log: Omit<SeedCommunicationLog, "id" | "sent_at">): SeedCommunicationLog => {
    const state = ensureDbFile();
    const newLog: SeedCommunicationLog = {
      ...log,
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sent_at: new Date().toISOString(),
    };
    state.communicationLogs.unshift(newLog);
    saveDb(state);
    return newLog;
  },

  // ==========================================
  // MODULE 12: EVENT INSIGHTS
  // ==========================================
  getEventInsightsByEventId: (eventId: string): SeedEventInsight[] => {
    return ensureDbFile().eventInsights.filter((ins) => ins.event_id === eventId);
  },

  getInsightsByEventId: (eventId: string): SeedEventInsight[] => {
    return ensureDbFile().eventInsights.filter((ins) => ins.event_id === eventId);
  },

  createInsight: (insight: Omit<SeedEventInsight, "id" | "created_at">): SeedEventInsight => {
    const state = ensureDbFile();
    const newInsight: SeedEventInsight = {
      ...insight,
      id: `ins-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    state.eventInsights.unshift(newInsight);
    saveDb(state);
    return newInsight;
  },

  // ==========================================
  // MODULE 13: NOTIFICATIONS
  // ==========================================
  getNotificationsByEventId: (eventId: string): SeedNotification[] => {
    return ensureDbFile().notifications
      .filter((n) => n.event_id === eventId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createNotification: (notification: Omit<SeedNotification, "id" | "created_at">): SeedNotification => {
    const state = ensureDbFile();
    const newNotif: SeedNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    state.notifications.unshift(newNotif);
    saveDb(state);
    return newNotif;
  },

  markNotificationRead: (id: string): boolean => {
    const state = ensureDbFile();
    const notif = state.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    saveDb(state);
    return true;
  },

  dismissAllNotifications: (eventId: string): boolean => {
    const state = ensureDbFile();
    state.notifications.forEach((n) => {
      if (n.event_id === eventId) n.read = true;
    });
    saveDb(state);
    return true;
  },

  // ==========================================
  // MODULE 15: SETTINGS & AUDIT LOGS
  // ==========================================
  getEventSettings: (eventId: string): SeedEventSettings | null => {
    const state = ensureDbFile();
    return state.eventSettings.find((s) => s.event_id === eventId) || null;
  },

  saveEventSettings: (settings: SeedEventSettings): SeedEventSettings => {
    const state = ensureDbFile();
    const idx = state.eventSettings.findIndex((s) => s.event_id === settings.event_id);
    if (idx !== -1) {
      state.eventSettings[idx] = { ...settings, updated_at: new Date().toISOString() };
    } else {
      state.eventSettings.push({ ...settings, updated_at: new Date().toISOString() });
    }
    saveDb(state);
    return settings;
  },

  getAuditLogsByEventId: (eventId: string): SeedAuditLog[] => {
    return ensureDbFile().auditLogs
      .filter((a) => a.event_id === eventId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  createAuditLog: (log: Omit<SeedAuditLog, "id" | "timestamp">): SeedAuditLog => {
    const state = ensureDbFile();
    const newLog: SeedAuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };
    state.auditLogs.unshift(newLog);
    saveDb(state);
    return newLog;
  },

  resetEventToSeed: (eventId: string): boolean => {
    const state = ensureDbFile();
    const initial = getInitialState();

    // Reset event record
    const initEvt = initial.events.find((e) => e.id === eventId);
    if (initEvt) {
      const idx = state.events.findIndex((e) => e.id === eventId);
      if (idx !== -1) state.events[idx] = { ...initEvt };
    }

    // Reset categories
    state.categories = state.categories.filter((c) => c.event_id !== eventId)
      .concat(initial.categories.filter((c) => c.event_id === eventId));

    // Reset line items
    state.lineItems = state.lineItems.filter((li) => li.event_id !== eventId)
      .concat(initial.lineItems.filter((li) => li.event_id === eventId));

    // Reset tasks & dependencies
    state.tasks = state.tasks.filter((t) => t.event_id !== eventId)
      .concat(initial.tasks.filter((t) => t.event_id === eventId));

    // Reset vendors & quotations
    state.vendors = state.vendors.filter((v) => v.event_id !== eventId)
      .concat(initial.vendors.filter((v) => v.event_id === eventId));
    state.quotations = state.quotations.filter((q) => q.event_id !== eventId)
      .concat(initial.quotations.filter((q) => q.event_id === eventId));

    // Reset run sheet
    state.runSheetItems = state.runSheetItems.filter((rs) => rs.event_id !== eventId)
      .concat(initial.runSheetItems.filter((rs) => rs.event_id === eventId));
    state.runSheetIncidents = state.runSheetIncidents.filter((inc) => inc.event_id !== eventId)
      .concat(initial.runSheetIncidents.filter((inc) => inc.event_id === eventId));

    // Reset guests & seating
    state.householdGroups = state.householdGroups.filter((hh) => hh.event_id !== eventId)
      .concat(initial.householdGroups.filter((hh) => hh.event_id === eventId));
    state.guests = state.guests.filter((g) => g.event_id !== eventId)
      .concat(initial.guests.filter((g) => g.event_id === eventId));
    state.seatingTables = state.seatingTables.filter((t) => t.event_id !== eventId)
      .concat(initial.seatingTables.filter((t) => t.event_id === eventId));
    state.seatingAssignments = state.seatingAssignments.filter((sa) => {
      const table = initial.seatingTables.find((t) => t.id === sa.table_id);
      return !table || table.event_id !== eventId;
    }).concat(initial.seatingAssignments.filter((sa) => {
      const table = initial.seatingTables.find((t) => t.id === sa.table_id);
      return table && table.event_id === eventId;
    }));

    // Reset invitations
    state.invitationDesigns = state.invitationDesigns.filter((inv) => inv.event_id !== eventId)
      .concat(initial.invitationDesigns.filter((inv) => inv.event_id === eventId));
    state.communicationLogs = state.communicationLogs.filter((cl) => cl.event_id !== eventId)
      .concat(initial.communicationLogs.filter((cl) => cl.event_id === eventId));

    // Reset insights, notifications, settings, audit
    state.eventInsights = state.eventInsights.filter((ins) => ins.event_id !== eventId)
      .concat(initial.eventInsights.filter((ins) => ins.event_id === eventId));
    state.notifications = state.notifications.filter((n) => n.event_id !== eventId)
      .concat(initial.notifications.filter((n) => n.event_id === eventId));
    state.eventSettings = state.eventSettings.filter((s) => s.event_id !== eventId)
      .concat(initial.eventSettings.filter((s) => s.event_id === eventId));
    state.auditLogs = state.auditLogs.filter((a) => a.event_id !== eventId)
      .concat(initial.auditLogs.filter((a) => a.event_id === eventId));

    saveDb(state);
    return true;
  },
};
