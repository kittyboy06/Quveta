# QUVETA — MODULE 01: DASHBOARD & EVENT OVERVIEW

## High-Quality Implementation Specification

### 1. OBJECTIVE

Implement a production-quality dashboard for Quveta, an AI-powered event-planning web application.

The dashboard is the user's central workspace for understanding event progress, reviewing budgets, identifying urgent tasks, and continuing planning.

It must display real, persisted application data and provide working navigation to the relevant modules.

**Primary goals:**

- Give users an immediate understanding of their events.
- Surface important deadlines and planning risks.
- Show accurate budget summaries.
- Make the next useful action obvious.
- Provide a polished, accessible, responsive experience.
- Establish clean integration boundaries with the rest of the modular monolith.

Do not build a static mockup. Do not fabricate event data or show hardcoded statistics as though they came from the database.

### 2. SCOPE

Implement the following dashboard capabilities:

1. Dashboard overview and summary metrics.
2. Event list and event cards.
3. Event selection and navigation.
4. Budget summary for each event.
5. Task progress and upcoming deadlines.
6. Urgent tasks, overdue items, and blocked-task indicators.
7. Recent plan changes and planning activity, when real data is available.
8. Empty, loading, error, and partial-data states.
9. Event creation entry point.
10. Responsive layouts and accessible interactions.

Do not implement the internal functionality of the budget simulator, AI planner, timeline engine, vendor manager, or notification scheduler in this module. Consume their defined data and navigation interfaces instead.

### 3. DASHBOARD INFORMATION ARCHITECTURE

Use a clear visual hierarchy.

#### A. Application shell

- Quveta brand and application navigation.
- Dashboard navigation item with an active state.
- Access points to Events, Budget, Timeline, Vendors, and Settings where those routes exist.
- A responsive navigation layout for smaller screens.
- A consistent content container and spacing system.

Only link to implemented routes. If a module has not yet been built, do not create a dead link or pretend it is functional.

#### B. Welcome and primary action

- Show a concise dashboard heading.
- Provide a primary "Create Event" action.
- If user identity is available, display a contextual greeting without requiring authentication for the dashboard to render.
- Do not display invented names or personal details.

#### C. Summary metrics

Display useful metrics derived from persisted data:

- Total active events.
- Upcoming events.
- Total planned budget across eligible events.
- Outstanding tasks.
- Overdue tasks.

Define the aggregation rules explicitly. For example, exclude cancelled events from active-event counts and avoid summing unrelated currencies into a single misleading monetary total.

Each metric must have a clear label and a sensible empty state. Do not calculate a total across different currencies unless values are converted using a verified exchange-rate source and a clear conversion timestamp.

#### D. Event overview cards

Each event card should display, when available:

- Event name and type.
- Event date.
- Location.
- Guest count.
- Budget target.
- Committed or recorded costs, if the data model supports them.
- Remaining budget.
- Task completion progress.
- Next important deadline.
- Planning status or risk indicator.

Make each card actionable. Opening it should navigate to that event's overview or details page.

Do not present estimated expenditure as actual spending. Use explicit labels such as "Planned," "Quoted," "Paid," and "Estimated" where the underlying model supports those distinctions.

#### E. Upcoming tasks and deadlines

Display a concise list of the most relevant tasks across the user's accessible events.

Include:

- Task title.
- Associated event.
- Due date.
- Priority.
- Status.
- Dependency or blocked status when available.

Prioritize overdue tasks, blocked tasks, and upcoming high-priority deadlines using explicit rules.

Provide a link to the relevant task or event. Do not invent tasks when no task records exist.

#### F. Planning activity

If the application records plan revisions or relevant activity, show recent meaningful changes, such as:

- Budget revision approved.
- Event date changed.
- Task completed.
- Planning proposal accepted.

Each item must come from actual recorded activity. If the system has no activity history yet, omit this section or show a transparent empty state.

### 4. VISUAL AND INTERACTION QUALITY

Create a refined, modern SaaS dashboard consistent with Quveta's identity.

Requirements:

- Strong typography hierarchy.
- Consistent spacing, alignment, and component sizing.
- Clear distinction between primary and secondary actions.
- Restrained use of color for status and emphasis.
- Readable budget and task summaries.
- Reusable cards, badges, progress indicators, and loading skeletons.
- Responsive behavior across desktop, tablet, and mobile.
- Subtle interaction feedback without excessive animation.

Avoid excessive gradients, decorative charts, unnecessary glassmorphism, or visually noisy cards.

Do not rely on color alone to communicate urgency or status. Pair status colors with text or icons and accessible labels.

Charts are optional. If a chart is used, provide an accessible textual or tabular alternative and derive all displayed values from real data.

### 5. EXACT BEHAVIOR

#### Initial load

1. Load the current user's accessible events, or the appropriate development/demo scope if authentication is not implemented.
2. Fetch or derive the relevant task, budget, and activity summaries.
3. Show loading states while data is being retrieved.
4. Render the dashboard when data is available.
5. Display a useful error state if loading fails.
6. Allow the user to retry without reloading the entire application.

Avoid a waterfall of unnecessary requests. Prefer a dashboard summary endpoint when appropriate, while keeping domain calculations in their owning modules.

#### Create Event

- Navigate to the existing event creation flow.
- Do not create a fake event in the dashboard.
- Update the dashboard after event creation succeeds.

#### Open Event

- Navigate using the event's canonical ID.
- Preserve correct event context.
- Do not rely on array indexes or display names as identifiers.

#### Budget summary

- Read the budget target and budget-line data from the budgeting domain.
- Use the budgeting module's authoritative calculations or shared domain functions.
- Do not duplicate financial formulas in the dashboard.
- Display currency and monetary labels consistently.

#### Task summary

- Use the task module's authoritative statuses and deadlines.
- Calculate completion progress according to an explicit rule.
- Exclude deleted tasks and account for cancelled tasks according to the defined domain rules.
- Clearly distinguish overdue, due soon, blocked, and completed tasks.

#### Refresh and updates

- Refresh relevant data after event creation, plan approval, budget changes, or task updates using the application's existing data-fetching strategy.
- Do not require a full page reload for ordinary updates.
- If a refresh fails, preserve the last successfully loaded view where practical and indicate that the displayed data may be stale.

### 6. ARCHITECTURE AND MODULE BOUNDARIES

Follow the existing repository conventions. If no conventions exist, use a structure similar to:

- `features/dashboard/` — dashboard-specific UI and orchestration.
- `features/dashboard/components/` — event cards, metric cards, task lists, and activity feed.
- `features/dashboard/hooks/` — dashboard data and interaction hooks.
- `features/dashboard/types/` — dashboard view-model types.
- `features/dashboard/utils/` — pure presentation and sorting utilities only.
- `server/modules/dashboard/` — dashboard aggregation endpoint, if a backend module is appropriate.
- `shared/` — genuinely reusable UI primitives, schemas, and utilities.

Do not force this exact directory structure if the existing project has a sound alternative.

The dashboard may aggregate information from multiple domain modules, but it must not become the owner of their business rules.

**Ownership contracts:**

- Events module: event identity, name, type, date, location, guest count, and lifecycle status.
- Budget module: budget targets, budget lines, cost classifications, currency, and authoritative calculations.
- Task module: task status, due date, priority, dependencies, and completion rules.
- Timeline module: scheduling conflicts and affected-task information.
- Plan version module: approved revisions and recorded plan activity.
- Dashboard module: read-oriented aggregation, presentation, prioritization, and navigation.

Use typed service interfaces or API contracts. Avoid importing internal database implementation details from unrelated modules.

### 7. API AND DATA CONTRACTS

Inspect the existing API and database schema before defining new endpoints.

If no dashboard summary endpoint exists, introduce a minimal typed endpoint where it materially improves efficiency.

A suitable conceptual response may contain:

- `events`
- `summary`
- `upcomingTasks`
- `recentActivity`
- `generatedAt`

Define precise TypeScript types and validate external data at the appropriate boundaries.

Requirements:

- Return only data the requester is authorized to access.
- Use pagination or sensible limits where lists could grow.
- Use stable identifiers.
- Handle nullable optional fields.
- Use consistent API error responses.
- Avoid returning entire event histories when summaries suffice.
- Do not duplicate persisted values that can be derived reliably from authoritative domain data without a specific reason.

If an existing API already provides these capabilities, reuse it instead of introducing redundant endpoints.

### 8. DATA VALIDATION AND EDGE CASES

Handle these cases explicitly:

- No events have been created.
- An event has no budget yet.
- An event has no tasks.
- An event date is missing or invalid.
- An event is cancelled or completed.
- A budget uses a different currency.
- A task has no due date.
- A task is overdue.
- A task is blocked by a dependency.
- Some optional dashboard data fails to load.
- The database returns an empty result.
- A user lacks permission to access an event.
- A record is deleted while the dashboard is open.
- A request times out or the AI service is unavailable.

The dashboard should not depend on the AI provider to display existing saved data. If AI functionality is unavailable, normal event, budget, and task information must remain usable.

Never silently convert missing values into zero when that would imply a real financial amount or task count. Distinguish "not configured" from a genuine zero.

### 9. SECURITY AND PRIVACY

- Enforce resource authorization in the backend.
- Never trust an event ID supplied by the client without checking access.
- Do not expose secrets or sensitive internal errors.
- Avoid placing private event details in URLs unnecessarily.
- Do not log unnecessary personal information.
- Follow the existing database access policies.
- If authentication is not implemented, clearly respect the application's chosen development or demo access model rather than pretending user isolation exists.

The frontend is not a security boundary.

### 10. ACCESSIBILITY

Meet practical WCAG 2.2 AA-oriented expectations where applicable:

- Semantic headings and landmarks.
- Accessible labels for icon-only buttons.
- Keyboard access to navigation and cards.
- Visible focus states.
- Sufficient text and status contrast.
- No status communication through color alone.
- Screen-reader-friendly loading, error, and update announcements.
- Accessible progress indicators.
- Reduced-motion support if animations are used.
- No keyboard traps.

Prefer a real button or link for actions instead of making a generic container clickable without accessible interaction semantics.

### 11. PERFORMANCE AND EFFICIENCY

- Fetch only the information needed for the dashboard.
- Avoid N+1 request patterns.
- Use database aggregation for suitable large-scale summaries where it improves efficiency.
- Do not fetch every historical task merely to show the next few deadlines.
- Use stable component keys and avoid unnecessary re-renders.
- Avoid duplicate requests during normal navigation.
- Use pagination or limits for long event and activity lists.
- Provide appropriate caching or invalidation using the project's existing data-fetching architecture.
- Do not introduce a new state-management library solely for this module unless justified.

### 12. TESTING REQUIREMENTS

Write tests using the repository's existing testing framework. If none exists, establish a suitable minimal setup without introducing unnecessary tooling.

#### Unit tests

Test:

- Event counts and lifecycle filtering.
- Budget summary formatting and currency separation.
- Task completion percentages.
- Overdue and upcoming-task prioritization.
- Handling of missing dates and optional fields.
- Stable sorting of events and tasks.

#### Integration tests

Test:

- Dashboard summary retrieval.
- Database and service error handling.
- Authorization and event ownership.
- Empty database responses.
- Partial failure of optional summary data.
- Correct use of authoritative budget and task calculations.

#### End-to-end tests

Verify:

1. A user with no events sees the empty state.
2. The user can navigate to event creation.
3. A newly created event appears on the dashboard.
4. An event card opens the correct event.
5. Budget and task summaries reflect saved data.
6. An overdue task is visibly identified.
7. Unauthorized event data is not exposed.
8. A failed request produces a useful retry path.
9. The dashboard remains usable on mobile and keyboard navigation works.

Avoid brittle tests that depend on exact CSS class names or incidental implementation details.

### 13. ACCEPTANCE CRITERIA

The module is complete only when all applicable criteria are satisfied:

- [ ] Dashboard data comes from real persisted data or an explicitly labeled demo data source.
- [ ] Summary metrics follow documented aggregation rules.
- [ ] Multiple currencies are never summed misleadingly.
- [ ] Event cards show correct available details.
- [ ] Budget figures use authoritative domain calculations.
- [ ] Upcoming and overdue tasks are prioritized correctly.
- [ ] Navigation uses canonical identifiers and working routes.
- [ ] The create-event action leads to a functional workflow.
- [ ] Loading, empty, error, and retry states work.
- [ ] Partial data failures do not unnecessarily break the entire dashboard.
- [ ] Authorization is enforced by the backend.
- [ ] Keyboard navigation and accessible status communication work.
- [ ] The layout is responsive.
- [ ] Automated tests cover the core behavior and important edge cases.
- [ ] Existing functionality is not broken.
- [ ] The production build succeeds.
- [ ] No fake controls or misleading metrics remain.

### 14. IMPLEMENTATION WORKFLOW

Before writing code:

1. Inspect the current repository, routes, database schema, and existing modules.
2. Identify which domain modules already exist and which contracts are available.
3. Report any missing dependencies or decisions that block implementation.
4. Define the minimal dashboard data contract and acceptance checklist.

Then implement incrementally:

1. Dashboard route and application shell integration.
2. Typed data access and loading/error handling.
3. Summary metric components.
4. Event overview cards.
5. Upcoming tasks and activity, where supported.
6. Empty states and create-event navigation.
7. Responsive layout and accessibility.
8. Automated tests and production-build verification.

Do not rewrite unrelated modules or invent unavailable APIs. If another module is not yet implemented, define a clear typed interface and integrate it when that module becomes available. Do not represent missing functionality as completed.

### 15. FINAL REPORT

After implementation, report:

- Files created or modified.
- Dashboard functionality implemented.
- API and database contracts used.
- Integration dependencies.
- Tests executed and their actual results.
- Production build result.
- Accessibility and security checks performed.
- Known limitations and unresolved issues.

Do not claim successful execution of tests, builds, or deployment unless the corresponding command or workflow was actually run and verified.

**Final instruction:** Deliver a polished, reliable dashboard that gives users an accurate view of their events and helps them decide what to do next. Favor data correctness, maintainable code, and clear UX over decorative complexity.
