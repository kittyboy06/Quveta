# Quveta — Master Implementation Plan (Modules 01–06 Core Gate)

> **Execution Directive**: This document defines the step-by-step technical implementation roadmap for Quveta, optimized for PromptWars Virtual Challenge 5. Each phase includes exact tasks, architecture patterns, file structures, and the authoritative prompt specifications extracted directly from the design artifacts.

---

## Architecture & Directory Foundation

```
src/
├── app/                                # Next.js 15 App Router
│   ├── layout.tsx                      # Root layout with Quveta brand theme & font
│   ├── (dashboard)/page.tsx            # Phase 6: Module 01 Dashboard
│   ├── events/
│   │   ├── new/page.tsx                # Phase 1: Module 02 Event Setup Wizard
│   │   └── [id]/
│   │       ├── page.tsx                # Event overview & navigation hub
│   │       ├── plan/page.tsx           # Phase 3: Module 03 AI Planning Workspace
│   │       ├── budget/page.tsx         # Phase 2: Module 04 Budget Management
│   │       ├── simulator/page.tsx      # Phase 4: Module 05 Adaptive Budget Simulator
│   │       └── timeline/page.tsx       # Phase 5: Module 06 Task DAG & Timeline
│   └── api/
│       ├── events/route.ts
│       ├── ai/plan/route.ts
│       ├── simulator/route.ts
│       └── tasks/route.ts
├── modules/
│   ├── events/                         # Module 02
│   │   ├── domain/                     # Entities, schemas, validation
│   │   ├── infrastructure/             # Supabase queries & persistence
│   │   └── server/                     # Server actions
│   ├── budget/                         # Module 04
│   │   ├── domain/                     # Deterministic financial math (paise/cents)
│   │   ├── infrastructure/             # Line items & category persistence
│   │   └── server/                     # Server actions
│   ├── ai-engine/                      # Module 03
│   │   ├── domain/                     # Zod plan schemas & prompt templates
│   │   ├── fallback/                   # Deterministic domain rule engine
│   │   └── infrastructure/             # Gemini 2.5 Flash SDK client
│   ├── simulator/                      # Module 05 (Signature Differentiator)
│   │   ├── domain/                     # Scenario diffing, trade-off evaluation
│   │   ├── infrastructure/             # Scenario snapshots & audit logs
│   │   └── server/                     # Selective approval & atomic commit
│   ├── tasks/                          # Module 06
│   │   ├── domain/                     # DAG graph, cycle detection, date shifts
│   │   ├── infrastructure/             # Task & dependency persistence
│   │   └── server/                     # Reschedule approval actions
│   └── dashboard/                      # Module 01
│       └── domain/                     # Aggregated financial & deadline metrics
└── shared/
    ├── db/                             # Supabase client, migrations & seed scripts
    ├── design-system/                  # Deep purple (#5B21B6) & lavender UI components
    └── types/                          # Money, Result, Currency primitives
```

---

## Phase 0: Scaffolding, Shared Infrastructure & Design System

### 1. Objectives & Setup
* Initialize Next.js 15 (App Router) with TypeScript, Tailwind CSS, and Lucide icons.
* Establish design tokens matching the project guidelines:
  * Primary Deep Purple: `#5B21B6` / `#7C3AED`
  * Lavender Surfaces: `#F5F3FF` / `#EDE9FE`
  * Neutral Dark: `#1E293B`
  * Semantic Accents: Green `#15803D`, Amber `#B45309`, Red `#B91C1C`
* Implement atomic primitives in `src/shared/types/money.ts`:
  * All amounts represented in integer minor units (`bigint` or integer paise/cents).
  * Safe mathematical utilities (`formatCurrency`, `toMinorUnits`, `fromMinorUnits`, `add`, `subtract`, `multiplyByRatio`).
* Initialize Supabase client (`src/shared/db/supabase.ts`) supporting local SQLite/PostgreSQL connection fallbacks for offline testing.

---

## Phase 1: Module 02 — Event Setup & Preferences

### 1. Exact Implementation Steps
1. Create `src/modules/events/domain/event.schema.ts` defining strict Zod validation for event authoring:
   * Title, Event Type (Wedding, Birthday, Corporate, Community, College, Engagement, Other).
   * Event Date & Times (reject invalid/past dates with proper warnings).
   * Guest Count ($\ge 0$), Target Budget ($\ge 0$), Currency (`INR` default).
   * Structured Preferences: Theme, must-have requirements, flexible categories, dietary needs, accessibility requirements.
2. Build `src/modules/events/infrastructure/event.repository.ts` for database CRUD.
3. Build the responsive multi-step wizard UI at `src/app/events/new/page.tsx` with progress indicators, visible focus states, and zero dead buttons.
4. Add guest-session persistence so evaluators can create an event immediately without mandatory login barriers.

### 2. Embedded Module 02 Prompt Specification
```markdown
# QUVETA — MODULE 02: EVENT SETUP & PREFERENCES
### OBJECTIVE
Build a complete, production-quality event creation and editing workflow for Quveta.
Users must be able to define an event, specify constraints and preferences, save it, reopen it, and update its details without losing existing planning data.
The module must provide validated, structured event data to the dashboard, AI planning engine, budget management, adaptive budget simulator, and timeline modules.
Do not build a static form that only updates frontend state. Persist valid data through the application's existing backend and database architecture.

### EVENT INFORMATION
- Basic information: Event name, Event type, Event date, Event location, Expected guest count, Total budget, Currency (INR default).
- Event timing: Start/end times, timezone handling. Do not silently shift event dates because of UTC conversions.
- Style & preferences: Theme, indoor/outdoor, formal/casual, cultural preferences, catering, dietary, accessibility requirements.
- Constraints & priorities: Explicit must-haves, protected categories, flexible spending areas.
- Validation: Server-side validation with meaningful error messages.
```

---

## Phase 2: Module 04 — Budget Management Core Engine

### 1. Exact Implementation Steps
1. Implement `src/modules/budget/domain/budget.calculator.ts`:
   * Deterministic formulas for planned spending, remaining balance, deficit/surplus, and per-guest cost.
   * Distinction between cost types: `FIXED`, `VARIABLE` (scales with guests), and `MIXED`.
   * Distinction between financial statuses: `ESTIMATED`, `QUOTED`, `COMMITTED`, `PAID`.
2. Implement `src/modules/budget/domain/category.defaults.ts`:
   * Default category templates tailored to event types (e.g. Wedding: Venue, Catering, Decor, Photography, Attire, Logistics, Contingency; Corporate: Venue, A/V, Catering, Speaker Honorariums, Collateral).
3. Build `src/modules/budget/infrastructure/budget.repository.ts` with SQL queries ensuring cascading deletes and atomic item updates.
4. Build `src/app/events/[id]/budget/page.tsx`:
   * Summary KPI cards (Target, Planned, Committed, Remaining/Overrun).
   * Visual category breakdown with accessible data tables (WCAG compliant).
   * Line-item management modal (Add, Edit, Delete) with live recalculation.

### 2. Embedded Module 04 Prompt Specification
```markdown
# QUVETA — MODULE 04: BUDGET MANAGEMENT
### OBJECTIVE
Build a reliable, maintainable budget-management module for Quveta.
Users must be able to create, inspect, edit, categorize, and track the planned costs of an event.
The module must treat financial correctness as a core invariant. AI-generated amounts are proposals or estimates, not authoritative financial calculations.

### PRIMARY GOALS
- Maintain accurate event budgets.
- Track planned allocations and cost items.
- Identify over-budget and under-budget conditions.
- Distinguish estimates, quotations, commitments, and actual payments.
- Preserve data integrity when costs change.
- Never rely on an LLM for authoritative financial arithmetic.
- Use integer minor currency units or an appropriate decimal representation.
```

---

## Phase 3: Module 03 — AI Event Planning Engine

### 1. Exact Implementation Steps
1. Build `src/modules/ai-engine/domain/plan.schema.ts`:
   * Strict Zod schema for structured output: `milestones`, `proposedCategories`, `proposedTasks`, `assumptions`, `riskAnalysis`.
2. Implement `src/modules/ai-engine/infrastructure/gemini.client.ts`:
   * Integration with `@google/genai` or `@google/generative-ai` using `gemini-2.5-flash`.
   * Structured prompt engineering injecting event constraints, budget, guest count, and must-haves.
   * Anti-hallucination prompt directives prohibiting fabricated vendor prices.
3. Build `src/modules/ai-engine/fallback/deterministic.planner.ts`:
   * Curated domain knowledge engine generating realistic category splits and chronological task breakdowns when API keys are absent or rate-limited.
4. Build `src/app/events/[id]/plan/page.tsx`:
   * Visual planning workspace displaying generated milestones, budget proposals, and assumptions.
   * User review actions: "Commit Plan to Budget & Timeline", "Regenerate with Adjustments".

### 2. Embedded Module 03 Prompt Specification
```markdown
# QUVETA — MODULE 03: AI EVENT PLANNING ENGINE
### OBJECTIVE
Build a reliable AI Event Planning Engine that converts a user's validated event details into a personalized, actionable, editable event plan.
Quveta must do more than generate a generic list of ideas. Its AI engine must understand event constraints, identify missing information, recommend practical actions, explain assumptions, and produce structured output that downstream modules can use.

### WORKFLOW
1. Load validated event details and existing constraints.
2. Prepare minimal, structured AI context.
3. Call configured AI provider through backend with strict JSON schema.
4. Validate response via domain-level consistency checks.
5. Provide deterministic fallback if AI provider fails or is unconfigured.
6. Return structured proposal for user inspection before saving.
```

---

## Phase 4: Module 05 — Adaptive Budget Simulator (Signature Feature)

### 1. Exact Implementation Steps
1. Build `src/modules/simulator/domain/simulator.engine.ts`:
   * Accepts current event budget + proposed inputs ($\Delta$ budget, $\Delta$ guest count, revised priorities).
   * Computes mathematical gap: $\text{Current Planned} - \text{Proposed Target}$.
   * Automatically scales variable expenses based on guest count delta.
   * Protects `MUST_HAVE`, `FIXED`, and `PAID` items from automated cuts.
2. Build `src/modules/simulator/domain/tradeoff.service.ts`:
   * Combines deterministic calculations with Gemini AI to generate specific, explainable trade-off cards (e.g., "Simplify floral arrangements from ₹80,000 to ₹65,000 to save ₹15,000. Feasibility assumption only; confirm with decorator.").
3. Build `src/app/events/[id]/simulator/page.tsx`:
   * Interactive input panel (budget slider/input, guest count slider/input, category priority selectors).
   * Side-by-side comparison table (Current Plan vs. Proposed Scenario).
   * Trade-off cards with independent `[Accept]` and `[Reject]` controls.
   * Real-time deterministic net impact recalculation when recommendations are toggled.
   * "Apply Approved Changes" modal showing exact before/after diff with atomic database commit.

### 2. Embedded Module 05 Prompt Specification
```markdown
# MODULE 05 — ADAPTIVE BUDGET SIMULATOR
### OBJECTIVE
Build Quveta's Adaptive Budget Simulator, the product's primary differentiating feature.
The simulator must help event organizers adapt an existing event plan when their budget, guest count, priorities, or constraints change. It should calculate the financial impact, recommend realistic trade-offs, compare the current plan with proposed alternatives, and allow users to approve or reject individual changes.
This must be a functioning, stateful application feature integrated with the existing Quveta codebase—not a static dashboard or generic AI chat interface.

### SIMULATOR INVARIANTS
- Financial calculations must be performed by application code, not delegated to the AI model.
- Distinguish fixed, variable, and uncertain costs.
- Do not silently overwrite the existing plan.
- Allow users to selectively accept, reject, or adjust individual recommendations.
- Recalculate combined scenario deterministically after selection changes.
- Apply database updates only after explicit user confirmation.
```

---

## Phase 5: Module 06 — Task & Timeline Management (DAG & Schedule Recovery)

### 1. Exact Implementation Steps
1. Build `src/modules/tasks/domain/dag.engine.ts`:
   * Directed Acyclic Graph data structure for task dependencies.
   * Cycle-detection algorithm (Depth-First Search) rejecting circular prerequisites.
   * Topological sorting for timeline ordering.
   * Dynamic status derivation: `READY` (prereqs completed), `BLOCKED` (prereq incomplete), `OVERDUE` (due date passed), `AT_RISK` (prereq delayed).
2. Build `src/modules/tasks/domain/schedule.recovery.ts`:
   * When an event date is changed in Module 02, traverses downstream tasks.
   * Identifies deadlines exceeding event date or violating minimum lead-time duration.
   * Generates a non-destructive Schedule Recovery Proposal for user review and approval.
3. Build `src/app/events/[id]/timeline/page.tsx`:
   * Chronological timeline view with dependency arrows/indicators.
   * Task management modal (create, edit, mark complete, set prerequisites).
   * Filter controls (Status, Priority, Category).
   * Schedule impact review drawer when date shifts occur.

### 2. Embedded Module 06 Prompt Specification
```markdown
# MODULE 06 — TASK & TIMELINE MANAGEMENT
### OBJECTIVE
Build a fully functional Task & Timeline Management module for Quveta.
The module transforms an event plan into an actionable, time-aware workflow. Users must be able to see upcoming work, manage deadlines, track progress, identify dependencies and blockers, and understand the consequences when a task is delayed or an event date changes.

### SCHEDULE-IMPACT & RECOVERY WORKFLOW
1. Record proposed event date change or reported delay.
2. Identify direct dependents and relevant downstream tasks.
3. Determine which deadlines may now be infeasible or at risk.
4. Present proposed recovery plan with side-by-side date comparison.
5. Allow user to review and approve rescheduling before updating tasks in database.
6. Use application code—not AI—for date arithmetic and dependency validation.
```

---

## Phase 6: Module 01 — Central Dashboard & Event Overview

### 1. Exact Implementation Steps
1. Build `src/modules/dashboard/domain/dashboard.metrics.ts`:
   * Aggregates active events, total committed/planned budget, overdue tasks count, and approaching deadlines.
2. Build `src/app/(dashboard)/page.tsx`:
   * Clean Quveta top bar and responsive sidebar navigation.
   * KPI Summary cards (Active Events, Planned Spend, Urgent Tasks, Approaching Milestones).
   * Actionable Event Cards showing dates, locations, guest counts, and budget progress bars.
   * "Create New Event" primary action button linking directly to the Module 02 Wizard.
   * Overdue and high-priority task preview with direct links to the relevant event timeline.

### 2. Embedded Module 01 Prompt Specification
```markdown
# QUVETA — MODULE 01: DASHBOARD & EVENT OVERVIEW
### OBJECTIVE
Implement a production-quality dashboard for Quveta.
The dashboard is the user's central workspace for understanding event progress, reviewing budgets, identifying urgent tasks, and continuing planning.
It must display real, persisted application data and provide working navigation to the relevant modules.

### DASHBOARD INFORMATION ARCHITECTURE
- Primary metrics derived from persisted data: Total active events, Upcoming events, Total planned budget, Outstanding tasks, Overdue tasks.
- Event overview cards: Event title, type, date, location, guest count, budget target, progress indicator.
- Upcoming deadlines: Most urgent tasks across events with direct navigation.
- No dead buttons or placeholder data.
```

---

## Phase 7: Real Relational Seeding & Frictionless Guest Access

### 1. Exact Implementation Steps
1. Create `src/shared/db/seeds/initial_events.sql` containing two rich, realistic persisted events:
   * **Event A: "Aarav & Meera's Wedding"**
     * Date: 4 months from current date, Location: Bangalore.
     * Guests: 200, Target Budget: ₹8,00,000.
     * Realistic budget line items: Venue (Fixed, Committed), Catering (Variable, ₹1,400/guest), Photography (Fixed, Quoted), Floral Decor (Flexible), DJ & Music (Flexible).
     * Tasks with DAG dependencies: Venue Booking $\rightarrow$ Floor Plan $\rightarrow$ Decor Setup; Caterer Shortlist $\rightarrow$ Tasting $\rightarrow$ Final Headcount.
   * **Event B: "TechInnovate Annual Hackathon"**
     * Date: 2 months from current date, Location: Hyderabad.
     * Guests: 150, Target Budget: ₹3,50,000.
2. Implement seamless session initialization so evaluators can inspect and modify these seeded events immediately without login barriers.

---

## Phase 8: Automated Test Suite & The Mandatory Acceptance Gate

### 1. Exact Implementation Steps
1. Set up **Vitest** test runner for unit tests:
   * `budget.calculator.test.ts`: Verify decimal arithmetic, per-guest scaling, fixed cost protection.
   * `simulator.engine.test.ts`: Verify deficit calculation, priority enforcement, selective accept/reject sum recomputation.
   * `dag.engine.test.ts`: Verify cycle detection rejection, status derivation (`READY`, `BLOCKED`, `OVERDUE`).
   * `schedule.recovery.test.ts`: Verify date shift impact calculations.
2. Set up **Playwright** for the **Non-Negotiable Acceptance Test**:
   * Test Script: `tests/e2e/mandatory-gate.spec.ts`
   * Flow:
     1. Create new event with guest count 100, budget ₹5,00,000.
     2. Generate AI plan and commit to database.
     3. Open Adaptive Budget Simulator, decrease budget to ₹4,00,000 and increase guests to 120.
     4. Verify mathematically accurate gap and trade-off cards.
     5. Accept one trade-off and reject another; verify net projected spend recalculates accurately.
     6. Commit approved changes.
     7. Shift event date 14 days earlier in Event Setup.
     8. Navigate to Timeline, verify schedule conflict drawer flags affected downstream tasks.
     9. Reload page; verify all changes, budget numbers, and task dates remain accurately persisted.

---

## Verification & Execution Checkpoint

With this plan established:
1. Every module prompt is directly integrated.
2. The core mandatory flow is prioritized to satisfy competition criteria.
3. Math and date logic remain strictly deterministic.
4. Evaluator resilience is secured via database seeding and AI fallback.
