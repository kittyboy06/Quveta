# Quveta — Complete System Architecture & Design Specification (Modules 01–15)

> [!IMPORTANT]
> **Authoritative Architecture Specification**: Single source of truth for the complete 15-module suite of Quveta, optimized for PromptWars Virtual Challenge 5.

---

## 1. Project Overview & Understanding Summary
* **Product:** Quveta — An AI-powered celebration and event-planning web application (*"Your events. Your vision. Intelligently planned."*).
* **Context:** Built for PromptWars Virtual Challenge 5 (Celebration & Event Planner).
* **Target Users:** Individuals, families, and community organizers planning weddings, birthdays, community celebrations, and corporate events.
* **Full-Suite Scope (Modules 01–15):**
  * **Core Planning:** Module 01 (Dashboard), Module 02 (Event Setup), Module 03 (AI Planning Engine), Module 04 (Budget Management), Module 05 (Adaptive Budget Simulator), Module 06 (Tasks & Timeline DAG).
  * **Guest & Coordination Suite (Sprint A):** Module 07 (Vendors & Quotations), Module 08 (Event-Day Run Sheet), Module 09 (Guest Management & RSVP Tracking), Module 10 (Seating Planner & Guest Experience), Module 11 (Invitations & Communications).
  * **Intelligence, Exports & Platform Suite (Sprint B):** Module 12 (AI Event Insights Assistant), Module 13 (Notifications & Automation), Module 14 (Reports & Document Exports), Module 15 (Settings, Security & Integration).
* **Signature Differentiator:** The **Adaptive Budget Simulator** (Module 05) with deterministic financial calculations, explainable AI trade-offs, and user-controlled selective approval.
* **Core Integration Invariant:** **Deep Relational Coupling** — Accepted vendor quotes link directly to budget line items; confirmed guest RSVPs sync to simulator variable costs; seating tables map directly to guests with dietary flags; and run sheet items link to timeline milestones.

---

## 2. Documented Assumptions & Operational Risk Mitigations
1. **Financial Integrity:** All currencies are stored and computed using integer minor units (paise/cents) in pure TypeScript domain logic, avoiding floating-point imprecision.
2. **Relational Continuity:** PostgreSQL schema via Supabase (and local persistent store) handles all 15 modules with cascading deletes and foreign keys.
3. **Frictionless Evaluator Experience:** Pre-seeded realistic benchmarks (Indian Wedding & Tech Hackathon) allow evaluators to immediately explore, simulate, and export without login friction.
4. **Resilient AI Pipeline:** Server-side Google Gemini 2.5 Flash with Zod schema validation, backed by an autonomous **Deterministic Rule Engine** fallback to ensure 100% evaluator uptime even during quota exhaustion.
5. **Grounded AI Insights:** Module 12 answers questions by injecting real database records (budget totals, task statuses, guest counts), preventing hallucinated numbers.
6. **No Fake Controls:** Every button, export link, status toggle, and filter performs its genuine advertised action against persisted database records.

---

## 3. Decision Log

| Decision Area | Chosen Approach | Alternatives Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Execution Phasing** | Two Focused Sprints (Sprint A: 07–11; Sprint B: 12–15) | Monolithic 9-module simultaneous build | Ensures manageable, verified milestones with incremental testing. |
| **Framework Stack** | Next.js 15 (App Router) + TS + Tailwind + Supabase | Vite + Standalone Express; Local SQLite | Unified TypeScript codebase, Server Actions for low-latency mutations, seamless cloud deployment. |
| **Architectural Pattern** | Domain-Driven Modular Monolith | Layered MVC; Hexagonal Ports/Adapters | Strict boundary isolation between pure business math and UI/DB infrastructure without over-engineering. |
| **Cross-Module Integration** | Deep Relational Coupling | Independent decoupled feature hubs | Creates authentic, cohesive application where quotes update budgets and RSVPs update simulator math. |
| **AI Reliability** | Server Gemini + Zod + Rule Fallback | Live-only Gemini API; Multi-provider client | Guarantees evaluators never experience broken views or API credit failures during grading. |
| **Data & Seeding** | Seeded DB + Frictionless Guest Session | Hardcoded frontend fixtures; Mandatory Auth | Satisfies strict "no fake data" rule while allowing judges instant 1-click testability. |

---

## 4. Architectural Directory Structure

```
src/
├── app/                                # Next.js 15 App Router Views
│   ├── (dashboard)/page.tsx            # Module 01: Central Dashboard
│   ├── events/
│   │   ├── new/page.tsx                # Module 02: Event Setup Wizard
│   │   └── [id]/
│   │       ├── page.tsx                # Event Hub / Navigation Center
│   │       ├── plan/page.tsx           # Module 03: AI Planning Engine
│   │       ├── budget/page.tsx         # Module 04: Budget Management
│   │       ├── simulator/page.tsx      # Module 05: Adaptive Budget Simulator (Signature)
│   │       ├── timeline/page.tsx       # Module 06: Tasks & Timeline DAG
│   │       ├── vendors/page.tsx        # Module 07: Vendor & Quotation Management
│   │       ├── run-sheet/page.tsx      # Module 08: Event-Day Run Sheet & Coordination
│   │       ├── guests/page.tsx         # Module 09: Guest Management & RSVP Tracking
│   │       ├── seating/page.tsx        # Module 10: Seating Planner & Layout
│   │       ├── invitations/page.tsx    # Module 11: Invitations & Communications
│   │       ├── insights/page.tsx       # Module 12: AI Event Insights Assistant
│   │       ├── notifications/page.tsx  # Module 13: Notifications & Reminders
│   │       ├── reports/page.tsx        # Module 14: Reports, Exports & Event Documents
│   │       └── settings/page.tsx       # Module 15: Settings, Security & Integration
├── modules/
│   ├── events/                         # Module 02
│   ├── ai-engine/                      # Module 03
│   ├── budget/                         # Module 04
│   ├── simulator/                      # Module 05
│   ├── tasks/                          # Module 06
│   ├── vendors/                        # Module 07
│   ├── run-sheet/                      # Module 08
│   ├── guests/                         # Module 09
│   ├── seating/                        # Module 10
│   ├── invitations/                    # Module 11
│   ├── insights/                       # Module 12
│   ├── notifications/                  # Module 13
│   ├── reports/                        # Module 14
│   └── settings/                       # Module 15
└── shared/
    ├── db/                             # Supabase client & relational storage engine
    ├── design-system/                  # Deep purple & lavender accessible design tokens
    └── types/                          # Money, Result, and Currency primitives
```

---

## 5. Relational Data Schema (PostgreSQL)

```sql
-- 1. Events & Preferences (Module 02)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count >= 0),
  target_budget BIGINT NOT NULL CHECK (target_budget >= 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'planning',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Budget Structure & Line Items (Module 04)
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'FLEXIBLE',
  allocated_amount BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  planned_amount BIGINT NOT NULL DEFAULT 0,
  cost_type TEXT NOT NULL DEFAULT 'FIXED',
  status TEXT NOT NULL DEFAULT 'ESTIMATED',
  per_guest_unit_cost BIGINT DEFAULT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Adaptive Simulator Scenarios (Module 05)
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  proposed_budget BIGINT NOT NULL,
  proposed_guest_count INTEGER NOT NULL,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE scenario_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  action TEXT NOT NULL,
  current_amount BIGINT NOT NULL,
  proposed_amount BIGINT NOT NULL,
  diff_amount BIGINT NOT NULL,
  trade_off_explanation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
);

-- 4. Tasks & DAG Dependencies (Module 06)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  status TEXT NOT NULL DEFAULT 'NOT_STARTED',
  start_date DATE,
  due_date DATE,
  estimated_days INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  prerequisite_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE(task_id, prerequisite_task_id)
);

-- 5. Vendors & Quotations (Module 07)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  status TEXT NOT NULL DEFAULT 'INQUIRY'
);

CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  scope_description TEXT NOT NULL,
  valid_until DATE,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  budget_line_item_id UUID REFERENCES budget_line_items(id) ON DELETE SET NULL
);

-- 6. Event-Day Run Sheet (Module 08)
CREATE TABLE run_sheet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  activity_title TEXT NOT NULL,
  location_area TEXT NOT NULL,
  person_responsible TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED',
  incident_notes TEXT
);

-- 7. Guests & Seating Layout (Modules 09 & 10)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  rsvp_status TEXT NOT NULL DEFAULT 'PENDING',
  dietary_requirements TEXT[],
  accessibility_needs TEXT[],
  household_group TEXT
);

CREATE TABLE seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  zone TEXT NOT NULL DEFAULT 'Main Hall'
);

CREATE TABLE seating_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES seating_tables(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL UNIQUE REFERENCES guests(id) ON DELETE CASCADE
);

-- 8. Invitations (Module 11)
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL,
  headline TEXT NOT NULL,
  custom_message TEXT NOT NULL,
  rsvp_deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
);

-- 9. In-App Notifications (Module 13)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'INFO',
  category TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 6. Full-Suite Automated Testing Strategy
* **Unit Tests (Vitest):** Core financial math (14 existing tests preserved), DAG cycle prevention, vendor quote status transitions, run sheet delay propagation, and table overcapacity checks.
* **Integration Tests:** Cross-module bridges: Quote $\rightarrow$ Budget commitment; RSVP $\rightarrow$ Simulator headcount; Guest $\rightarrow$ Table dietary badges.
* **Production Build Gate:** `npm run build` static compilation passing with **0 errors**.
