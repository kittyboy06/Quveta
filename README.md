# Quveta — AI-Powered Celebration & Event Planning Workspace

> *"Your events. Your vision. Intelligently planned."*  
> Built for **PromptWars Virtual Challenge 5: Celebration & Event Planner**.

Quveta is a stateful, adaptive celebration and event-planning web application. Unlike generic chatbots or one-shot prompt templates, Quveta provides a persistent workspace that manages real budgets, dependencies, and constraints—intelligently adapting when constraints change without starting over.

---

## 🌟 The Signature Differentiator: Adaptive Budget Simulator

The core highlight of Quveta is the **Adaptive Budget Simulator** ([Module 05](file:///d:/Projects/Hackathon/Quveta/src/modules/simulator)):
* **Deterministic Financial Arithmetic:** Totals, remaining buffers, per-guest costs, and deficit calculations run strictly in verified application code—never delegated to LLM hallucination.
* **Variable vs. Fixed Scaling:** When guest counts surge or contract, variable items (such as catering plates) scale mathematically, while fixed commitments (`COMMITTED`, `PAID`) remain locked.
* **Explainable AI Trade-offs:** AI recommends realistic adjustments prioritizing `LOW` and `FLEXIBLE` categories while protecting user-designated `MUST_HAVE` items.
* **Selective User Approval:** Side-by-side comparison (Current Plan vs. Proposed Scenario) with individual `[Accept]` and `[Reject]` controls, dynamically re-calculating the net projected budget in real time before atomic commitment.

---

## 🏛️ System Architecture

Quveta is built as a **Domain-Driven Modular Monolith** using Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL), and Google Gemini:

```
src/
├── app/                                # Next.js 15 App Router Views
│   ├── (dashboard)/page.tsx            # Module 01: Central Dashboard
│   ├── events/
│   │   ├── new/page.tsx                # Module 02: Event Setup Wizard
│   │   └── [id]/
│   │       ├── page.tsx                # Event Navigation Hub
│   │       ├── plan/page.tsx           # Module 03: AI Planning Engine
│   │       ├── budget/page.tsx         # Module 04: Budget Management
│   │       ├── simulator/page.tsx      # Module 05: Adaptive Budget Simulator
│   │       └── timeline/page.tsx       # Module 06: Tasks & Timeline DAG
├── modules/
│   ├── events/                         # Event lifecycle & constraints
│   ├── ai-engine/                      # Gemini 2.5 Flash + Deterministic Fallback
│   ├── budget/                         # Authoritative financial calculations (paise)
│   ├── simulator/                      # Scenario diffing & selective approval
│   └── tasks/                          # Directed Acyclic Graph (DAG) & schedule recovery
└── shared/
    ├── db/                             # Supabase client & relational storage engine
    ├── design-system/                  # Deep purple & lavender accessible design tokens
    └── types/                          # Money, Result, and Currency primitives
```

---

## 🚀 Key Modules Implemented (Core Gate)

| Module | Core Capabilities |
| :--- | :--- |
| **01. Dashboard** | Real-time aggregate KPIs (Active Events, Planned Spend, Task Progress) and actionable celebration cards. |
| **02. Event Setup** | 4-step wizard with strict Zod validation, must-have priority tagging, dietary care, and accessibility needs. |
| **03. AI Planning Engine** | Google Gemini 2.5 Flash with strict JSON schema validation and zero-downtime deterministic fallback engine. |
| **04. Budget Management** | Integer minor-unit precision, fixed vs. variable cost categorization, quotation verification statuses. |
| **05. Budget Simulator** | Signature scenario modeling, gap analysis, trade-off proposals, selective accept/reject, and atomic commits. |
| **06. Tasks & Timeline** | Directed Acyclic Graph (DAG) with cycle prevention, status propagation (`READY`, `BLOCKED`, `OVERDUE`), and date-shift recovery. |

---

## 🛡️ Robustness & Zero-Downtime Fallback

1. **Deterministic Financial Math:** Stored in integer minor units (paise/cents) using `@/shared/types/money.ts` to prevent floating-point calculation errors.
2. **DAG Cycle Prevention:** Depth-First Search cycle detection prevents circular task prerequisites.
3. **Resilient AI Pipeline:** If the `GEMINI_API_KEY` is unset or API quotas are exceeded during evaluation, the built-in **Deterministic Domain Rule Engine** activates automatically, ensuring evaluators experience zero crashes or blank states.
4. **Pre-Seeded Real Data:** Includes realistic relational benchmarks (`Aarav & Meera's Traditional Wedding` and `TechInnovate Annual Hackathon 2026`) with pre-linked budgets, line items, and DAG tasks.

---

## 🚦 Non-Negotiable Acceptance Test

Automated end-to-end verification confirms the mandatory workflow:
1. Create a realistic event with priorities and constraints.
2. Generate an AI plan and commit tasks to database.
3. Reduce budget in the Adaptive Simulator to create a deficit.
4. Inspect mathematically sound trade-offs.
5. Reject one recommendation and accept another; verify net projected spend recalculates in real-time.
6. Commit approved changes.
7. Move event date 14 days earlier.
8. Verify schedule conflict detection and apply recommended recovery dates.
9. Reload the application and confirm all changes remain accurately persisted.

Run the test suite:
```bash
npm test
```

---

## 🛠️ Quickstart & Setup

### Prerequisites
* Node.js v20+ (tested on Node.js v24)
* npm v10+

### Installation & Run
```bash
# 1. Install dependencies
npm install

# 2. Run unit & E2E tests
npm test

# 3. Build for production
npm run build

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

---

## 🔑 Environment Variables (Optional)

Create a `.env.local` file in the root directory:
```env
# Optional: Google Gemini API Key for live AI generation
# (If omitted, the autonomous deterministic domain engine handles all generation seamlessly)
GEMINI_API_KEY=your_gemini_api_key

# Optional: Supabase cloud credentials
# (If omitted, Quveta utilizes the persistent local relational store)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## ♿ Accessibility & Design System
* **WCAG 2.1 AA Compliance:** Minimum 4.5:1 color contrast on all text elements.
* **Visible Focus:** Global `focus-visible` styling (`focus-visible:ring-2 focus-visible:ring-brand-600`).
* **Semantic Signals:** Dual-indicator status badges (combining color, icons, and text) to ensure information is not conveyed solely by color.
