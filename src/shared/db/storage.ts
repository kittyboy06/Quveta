import fs from "fs";
import path from "path";
import {
  INITIAL_SEEDED_EVENTS,
  INITIAL_SEEDED_CATEGORIES,
  INITIAL_SEEDED_LINE_ITEMS,
  INITIAL_SEEDED_TASKS,
  INITIAL_SEEDED_DEPENDENCIES,
  SeedEvent,
  SeedCategory,
  SeedLineItem,
  SeedTask,
  SeedDependency,
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
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.resolve(DATA_DIR, "quveta.db.json");

function ensureDbFile(): DatabaseState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseState = {
        events: INITIAL_SEEDED_EVENTS,
        categories: INITIAL_SEEDED_CATEGORIES,
        lineItems: INITIAL_SEEDED_LINE_ITEMS,
        tasks: INITIAL_SEEDED_TASKS,
        dependencies: INITIAL_SEEDED_DEPENDENCIES,
        scenarios: [],
        recommendations: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Database initialization error:", err);
    return {
      events: INITIAL_SEEDED_EVENTS,
      categories: INITIAL_SEEDED_CATEGORIES,
      lineItems: INITIAL_SEEDED_LINE_ITEMS,
      tasks: INITIAL_SEEDED_TASKS,
      dependencies: INITIAL_SEEDED_DEPENDENCIES,
      scenarios: [],
      recommendations: [],
    };
  }
}

function saveDb(state: DatabaseState): void {
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
  // Events
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

  // Categories
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

  // Line Items
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

  // Simulator Scenarios
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

    // Apply category allocation adjustments
    for (const rec of acceptedRecs) {
      if (rec.category_id) {
        const cat = state.categories.find((c) => c.id === rec.category_id);
        if (cat) {
          cat.allocated_amount = rec.proposed_amount;
        }
      }
    }

    // Update target budget and guest count on event
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

  // Tasks & Dependencies
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

  getDependenciesByEventId: (eventId: string): SeedDependency[] => {
    const state = ensureDbFile();
    const eventTaskIds = new Set(state.tasks.filter((t) => t.event_id === eventId).map((t) => t.id));
    return state.dependencies.filter(
      (d) => eventTaskIds.has(d.task_id) && eventTaskIds.has(d.prerequisite_task_id)
    );
  },

  createDependency: (taskId: string, prerequisiteTaskId: string): SeedDependency | null => {
    const state = ensureDbFile();
    // Prevent self-dependency
    if (taskId === prerequisiteTaskId) return null;

    // Check duplicate
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
};
