# QUVETA — MODULE 04: BUDGET MANAGEMENT
## High-Quality Antigravity Implementation Specification

### 1. OBJECTIVE

Build a reliable, maintainable budget-management module for Quveta, an AI-powered event-planning web application.

Users must be able to create, inspect, edit, categorize, and track the planned costs of an event. The module must provide accurate financial summaries and expose stable interfaces to the dashboard, AI planning engine, and Adaptive Budget Simulator.

The module must treat financial correctness as a core invariant. AI-generated amounts are proposals or estimates, not authoritative financial calculations.

**Primary goals:**
- Maintain accurate event budgets.
- Track planned allocations and cost items.
- Identify over-budget and under-budget conditions.
- Distinguish estimates, quotations, commitments, and actual payments.
- Preserve data integrity when costs change.
- Support transparent, explainable financial decisions.

Do not build a static chart or frontend-only calculator. All persistent changes must go through validated application services and the database.

### 2. SCOPE

Implement:
- Budget overview for an event.
- Budget category management.
- Budget line-item creation, editing, and deletion.
- Total budget configuration.
- Cost classification and status tracking.
- Accurate financial summaries.
- Remaining-budget and budget-variance calculations.
- Per-guest cost calculations where meaningful.
- Budget validation and warnings.
- Persistence and audit-friendly updates.
- Integration contracts for the dashboard, AI planner, and Adaptive Budget Simulator.
- Automated tests.

Do not implement adaptive budget recommendations or AI-driven trade-off generation in this module. Those belong to Module 05. This module supplies the reliable financial data and calculation rules that Module 05 must use.

### 3. BUDGET DATA MODEL

Inspect the existing database schema before creating or changing tables.

A budget should be associated with one event and contain:

#### A. Budget configuration
- Stable budget ID.
- Event ID.
- Budget target amount.
- Currency code.
- Optional contingency allocation.
- Created timestamp.
- Updated timestamp.

Use one authoritative budget configuration per event unless the existing architecture explicitly supports multiple budgets or budget versions.

#### B. Budget categories
Suggested default categories include:
- Venue.
- Catering and beverages.
- Decoration.
- Photography and videography.
- Entertainment.
- Clothing and styling.
- Transportation.
- Invitations and stationery.
- Accommodation.
- Equipment and rentals.
- Staffing.
- Miscellaneous.
- Contingency.

Allow users to add custom categories.

Do not force every event to use the same categories. Wedding-specific categories should not be required for birthdays or community events.

Each category should have:
- Stable ID.
- Name.
- Optional description.
- Optional display order.
- Active or archived status.

#### C. Budget line items

Each line item should support:
- Stable ID.
- Event and category references.
- Item name.
- Description.
- Amount.
- Currency consistent with the event budget.
- Cost classification.
- Financial status.
- Optional quantity.
- Optional unit cost.
- Optional vendor or quotation reference.
- Optional notes.
- Created and updated timestamps.

Suggested cost classifications:
- Fixed.
- Variable.
- Mixed.
- Unknown.

Suggested financial statuses:
- Estimated.
- Quoted.
- Committed.
- Paid.
- Cancelled.

Define these statuses precisely. For example, a quotation is not a confirmed commitment, and an estimated amount is not actual expenditure.

If a richer accounting or payment model already exists, reuse it instead of duplicating financial state.

### 4. FINANCIAL CORRECTNESS RULES

Implement all financial arithmetic in deterministic application code.

Never rely on an LLM to calculate authoritative totals.

#### A. Monetary representation

Use integer minor units where practical, or a suitable precise database decimal type with explicit rounding rules.

Avoid JavaScript floating-point arithmetic for financial totals.

Do not assume every currency uses two decimal places. Use a currency-aware formatting and precision strategy.

Validate:
- Amounts are finite.
- Amounts are nonnegative unless a specifically supported adjustment or refund model permits otherwise.
- Currency codes are supported.
- Values remain within documented application and database limits.

#### B. Budget target

Let:

- \(B\) = configured budget target.
- \(E\) = sum of eligible budget line items.
- \(R\) = remaining planned budget.

Then:

\[
R = B - E
\]

A positive \(R\) indicates remaining budget. A negative \(R\) indicates a planned overrun.

Label this metric clearly as **remaining planned budget**, not remaining cash, unless the application also tracks real payments and cash flows.

#### C. Budget utilization

Calculate utilization using a documented rule:

\[
U = \frac{E}{B} \times 100
\]

Only calculate this ratio when \(B > 0\). Handle an unset or zero budget explicitly rather than returning infinity or `NaN`.

Do not silently clamp utilization to 100% when the plan exceeds its budget. Over-budget states must remain visible.

#### D. Cost per guest

When guest count \(G > 0\):

\[
C_g = \frac{E}{G}
\]

Label this as estimated or planned cost per guest according to the source amounts.

Do not calculate the metric if the guest count is missing or zero.

#### E. Cost totals and statuses

Define which line-item statuses contribute to each metric.

At minimum:
- Planned cost should represent the relevant current plan.
- Quoted cost should represent valid quotation amounts.
- Committed cost should represent confirmed obligations.
- Paid cost should represent recorded payments.

Do not blindly add all statuses into one number if that would double-count the same underlying expense.

If the application cannot yet distinguish these totals reliably, display only the supported metrics and clearly label them.

### 5. BUDGET USER INTERFACE

Create a polished, responsive budget workspace.

#### A. Budget summary

Display:
- Total budget target.
- Total planned cost.
- Remaining planned budget or overrun.
- Budget utilization.
- Per-guest cost where applicable.
- Category-level allocation breakdown.

Use clear labels, consistent currency formatting, and accessible status indicators.

#### B. Category breakdown

For each category, show:
- Category name.
- Planned allocation.
- Percentage of total planned cost, where meaningful.
- Amount remaining within an explicitly defined category allocation, if category-level targets exist.
- Status or over-budget indicator where applicable.

Do not infer a category allocation limit from its current cost.

If no category-level target exists, label the displayed value as planned cost rather than allocation remaining.

#### C. Line-item table or list

Provide:
- Item name.
- Category.
- Amount.
- Classification.
- Status.
- Optional quantity and unit price.
- Edit and delete actions.

Support useful sorting and filtering without making the interface unnecessarily complex.

#### D. Create and edit actions

Users must be able to:
- Add a category.
- Add a line item.
- Edit a line item.
- Change a category.
- Archive or remove a category when permitted.
- Edit the overall budget target.
- Delete a line item with appropriate confirmation when deletion is consequential.

Prevent accidental deletion of items referenced by other records. Use archival or explicit reassignment when necessary.

#### E. Visualizations

Charts are optional.

If used:
- Derive values from actual budget records.
- Include a textual or tabular alternative.
- Show currency and units clearly.
- Make over-budget conditions understandable without relying only on color.

Avoid decorative charts that provide no additional decision-making value.

### 6. USER INTERACTION BEHAVIOR

#### Initial load
1. Load the selected event and verify access.
2. Retrieve its budget configuration and line items.
3. Derive authoritative summary values.
4. Display loading states.
5. Display an empty state if no budget exists.
6. Provide a useful retry path if retrieval fails.

#### Add a budget line item
1. Collect and validate the item details.
2. Validate category and event references.
3. Submit the change to the backend.
4. Persist the item.
5. Refresh or update the budget summary from authoritative data.
6. Display success or a recoverable error.

#### Edit an item
- Preserve existing values while the form is open.
- Prevent duplicate submissions.
- Validate the changed amount and references.
- Avoid overwriting concurrent changes silently.
- Recalculate all affected summaries after success.

#### Change the overall budget
- Persist the new target.
- Recalculate remaining planned budget and utilization.
- Display a clear warning if the plan exceeds the new target.
- Do not automatically delete or reduce existing items.
- Make the updated target available to Module 05 for a separate recommendation workflow.

#### Delete or archive an item
- Require confirmation for consequential deletion.
- Ensure referenced quotation or payment records are not orphaned.
- Recalculate summaries after the operation succeeds.
- Do not show success before persistence is confirmed.

### 7. ARCHITECTURE AND MODULE BOUNDARIES

Follow existing repository conventions. If none exist, use a structure similar to:

- `features/budget/` — budget workspace and UI orchestration.
- `features/budget/components/` — summary cards, category breakdown, line-item forms, and lists.
- `features/budget/hooks/` — budget data and mutation hooks.
- `features/budget/types/` — typed budget contracts.
- `features/budget/utils/` — currency formatting and pure presentation helpers.
- `server/modules/budget/` — routes, services, validation, and persistence.
- `shared/domain/money/` — reusable monetary types and calculations, if multiple modules need them.

Keep UI, business logic, and persistence separate.

The budget module owns:
- Budget targets.
- Categories.
- Line items.
- Financial classifications and statuses.
- Authoritative calculations.

Other modules must use public typed service interfaces rather than accessing the budget module's private database implementation.

### 8. INTEGRATION CONTRACTS

#### With the Events module
- Read event ID, guest count, and currency.
- Verify that the event exists and the requester has access.
- Follow the event's currency rules.
- Recalculate per-guest metrics when guest count changes.

#### With the Dashboard module
Expose authoritative summary information such as:
- Budget target.
- Planned cost.
- Remaining planned budget.
- Currency.
- Relevant warning status.

Do not force the dashboard to duplicate budget formulas.

#### With the AI Planning Engine
Accept validated budget proposals from the planning engine through a defined contract.

Before applying a proposal:
- Validate its schema.
- Validate its currency.
- Validate amounts.
- Identify whether it is a new proposal or a modification.
- Calculate authoritative totals.
- Preserve the distinction between estimates and quotations.

Do not automatically commit an AI-generated budget proposal without the appropriate review workflow.

#### With the Adaptive Budget Simulator
Provide:
- Current budget target.
- Current category and line-item data.
- Cost classifications.
- Existing statuses.
- Guest count and relevant event context.
- Deterministic calculation utilities or service interfaces.

Module 05 must not create a competing source of truth for budget calculations.

A simulation must not mutate the current budget until the user accepts the proposed changes through the application's approval workflow.

#### With Vendor & Quotation Management
Where integrated:
- Store references to quotation records.
- Do not copy quotation values without maintaining provenance.
- Distinguish a quotation from a commitment or payment.
- Handle quotation revisions and cancellations according to the domain rules.

### 9. API AND PERSISTENCE REQUIREMENTS

Inspect existing endpoints and schema before creating new ones.

If required, expose typed operations for:
- Retrieving an event budget.
- Creating or updating the budget target.
- Listing categories and line items.
- Creating, editing, and deleting line items.
- Creating or archiving categories.
- Retrieving authoritative summary metrics.

Requirements:
- Validate every request on the server.
- Verify event ownership and resource authorization.
- Use stable IDs.
- Use consistent error responses.
- Use database transactions where multiple related records must change atomically.
- Prevent duplicate operations where retrying a request could create duplicate financial records.
- Use appropriate database indexes and foreign-key constraints.
- Maintain a reproducible migration strategy.

Do not introduce redundant endpoints when existing services already support the necessary operations.

### 10. SECURITY AND DATA INTEGRITY

- Enforce authorization on every read and write.
- Do not trust client-supplied event ownership.
- Validate all amounts and currency codes.
- Prevent invalid references and orphaned records.
- Avoid silent overwrites.
- Protect against duplicate submissions.
- Keep secrets out of frontend code.
- Avoid exposing database errors or stack traces.
- Preserve records referenced by quotations, commitments, or payments.
- Do not let AI-generated output bypass financial validation.

Financial mutations must be persisted successfully before the UI reports success.

### 11. PERFORMANCE AND EFFICIENCY

- Fetch only the data needed for the current event.
- Avoid N+1 queries.
- Use efficient aggregate queries when appropriate.
- Do not retrieve every event's full financial history just to render one summary.
- Reuse existing data-fetching and cache-invalidation conventions.
- Avoid recalculating expensive summaries unnecessarily.
- Keep the module dependency footprint small.

Do not add complex financial infrastructure or accounting features beyond the application's requirements.

### 12. ACCESSIBILITY

Meet practical WCAG 2.2 AA-oriented expectations where applicable.

- Use semantic form controls and tables where appropriate.
- Label every input.
- Make currency inputs keyboard-accessible.
- Associate validation messages with their fields.
- Provide visible focus indicators.
- Ensure sufficient contrast.
- Communicate over-budget states through text and icons, not color alone.
- Announce success and error states accessibly.
- Provide text alternatives for charts.
- Support mobile and desktop layouts.

### 13. TESTING REQUIREMENTS

Use the repository's existing test framework.

#### Unit tests
Test:
- Money arithmetic.
- Currency formatting and precision.
- Remaining-budget calculations.
- Utilization calculations.
- Per-guest costs.
- Classification and status rules.
- Budget boundary conditions.
- Missing versus zero-valued budgets.
- Over-budget behavior.
- Rounding rules.

#### Integration tests
Test:
- Budget creation and retrieval.
- Category and line-item CRUD operations.
- Authorization and ownership.
- Invalid currency and amount rejection.
- Database transaction behavior.
- Duplicate submission protection.
- Budget summary consistency after mutations.
- Protection of referenced financial records.

#### End-to-end tests
Verify:
1. Create or open an event.
2. Configure its budget target.
3. Add several budget items.
4. Verify totals and remaining budget.
5. Edit a line item and verify the updated totals.
6. Reduce the overall budget and verify that an overrun is reported.
7. Change the event's guest count and verify per-guest metrics.
8. Reload and verify persistence.
9. Attempt an invalid amount and verify that it is rejected.
10. Verify that unauthorized access is blocked.

Use deterministic fixtures for financial tests. Do not depend on live AI calls to verify arithmetic.

### 14. ACCEPTANCE CRITERIA

- [ ] Budget configuration is persisted.
- [ ] Users can create, edit, and remove valid budget line items.
- [ ] Categories can be managed without corrupting existing records.
- [ ] Financial calculations are deterministic and tested.
- [ ] Currency and monetary precision are handled correctly.
- [ ] Estimates, quotations, commitments, and payments are not misleadingly conflated.
- [ ] Over-budget states are visible.
- [ ] Changing the budget does not silently alter existing items.
- [ ] Dashboard summaries use authoritative budget data.
- [ ] Module 05 can access a stable budget contract.
- [ ] AI-generated proposals cannot bypass validation.
- [ ] Authorization is enforced.
- [ ] Error and retry states work.
- [ ] Accessibility and responsive behavior are verified.
- [ ] Automated tests pass.
- [ ] The production build succeeds.
- [ ] No fake financial data is presented as real user data.

### 15. IMPLEMENTATION WORKFLOW

Before coding:
1. Inspect the existing project and Modules 01–03.
2. Review the event schema, database setup, and financial data model.
3. Identify existing money utilities and avoid duplicating them.
4. Define the financial invariants and acceptance tests.
5. Define the service contracts required by Modules 01 and 05.

Implement incrementally:
1. Financial types and deterministic calculation functions.
2. Budget schema and persistence.
3. Backend validation and authorization.
4. Budget summary API.
5. Category and line-item operations.
6. Budget workspace UI.
7. Dashboard and AI-planning integration.
8. Automated tests and production-build verification.

Do not rewrite unrelated modules. Keep the application runnable and report missing dependencies explicitly.

### 16. FINAL IMPLEMENTATION REPORT

Report:
- Files created or modified.
- Budget schema and API contracts.
- Financial invariants and rounding strategy.
- Integration points with other modules.
- Tests actually executed and their results.
- Production build status.
- Security and accessibility checks.
- Known limitations.

Do not claim that financial calculations, persistence, or tests work without verifying them.

## FINAL DIRECTIVE

Build a trustworthy financial foundation for Quveta.

**Accuracy comes before appearance.** Every displayed amount must have a clear meaning, every financial calculation must be deterministic, and every persistent change must preserve data integrity.

This module must make it possible for the Adaptive Budget Simulator to propose realistic trade-offs without compromising financial correctness.