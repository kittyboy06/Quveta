# Module 05 — Adaptive Budget Simulator
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build Quveta’s **Adaptive Budget Simulator**, the product’s primary differentiating feature.

The simulator must help event organizers adapt an existing event plan when their budget, guest count, priorities, or constraints change. It should calculate the financial impact, recommend realistic trade-offs, compare the current plan with proposed alternatives, and allow users to approve or reject individual changes.

This must be a functioning, stateful application feature integrated with the existing Quveta codebase—not a static dashboard, mockup, or generic AI chat interface.

**Core user story:**

“I already have an event plan. Something has changed, and I need to understand my options without rebuilding everything from scratch.”

Example: A user plans a wedding for 200 guests with a budget of ₹8,00,000. Their budget drops to ₹6,50,000. Quveta should identify the ₹1,50,000 gap, examine flexible and protected spending, suggest specific adjustments, explain their consequences, and show a revised budget before anything is changed.

All figures in this example are illustrative, not vendor quotations.

### 2. Start by inspecting the existing project

Before implementing anything:

1. Inspect the repository, current application structure, existing modules, database schema, API conventions, authentication, and tests.
2. Reuse the existing architecture, styling system, components, validation libraries, and services wherever possible.
3. Integrate with Modules 01–04 rather than creating duplicate event, budget, or AI-planning systems.
4. Identify which required capabilities already exist and which need to be added.
5. Implement this module incrementally and keep the application runnable.

Do not replace working project infrastructure or introduce a second implementation of existing business logic.

### 3. Define the simulator’s responsibilities

The simulator is responsible for:

- Capturing proposed event changes.
- Creating isolated budget scenarios.
- Identifying the difference between the current state and a proposed state.
- Requesting and validating AI-generated trade-off recommendations.
- Calculating the financial consequences through deterministic application code.
- Presenting alternatives and their implications.
- Allowing users to accept, reject, or selectively apply recommendations.
- Saving approved changes through the existing budget and event services.
- Maintaining a clear history of scenario proposals and approved revisions.

**Module ownership rules:**

- Module 02 — Event Setup owns the authoritative event details.
- Module 03 — AI Planning Engine owns the shared AI orchestration and provider integration.
- Module 04 — Budget Management owns actual budget records, line items, financial calculations, and budget persistence.
- Module 05 — Adaptive Budget Simulator owns scenario creation, comparison, trade-off analysis, and the approval workflow.
- Module 01 — Dashboard reads the resulting authoritative data.

Do not create a parallel budget database or let the simulator independently redefine financial calculations.

### 4. Build the scenario input interface

Create an intuitive, accessible simulator interface reachable from an existing event’s detail page or budget page.

Allow users to simulate one or more changes:

**A. Total budget**
- Current budget target.
- Proposed budget target.
- Difference in currency and percentage.
- Whether the proposed budget is below current planned spending.

**B. Guest count**
- Current guest count.
- Proposed guest count.
- Increase or decrease in attendees.
- Estimated impact on variable expenses such as catering, seating, invitations, transport, and guest accommodation where applicable.
- Fixed expenses should not automatically scale with guest count.

**C. Category priorities**
- Must-have: protect this category from reductions unless the user explicitly permits otherwise.
- High priority: preserve as much value as reasonably possible.
- Flexible: consider reasonable reductions or alternatives.
- Low priority: consider reducing or removing this expense first.

Allow users to set or update these priorities for a scenario without silently changing the original event preferences.

**D. Additional constraints**

Include optional constraints such as:
- Preserve the selected venue.
- Do not reduce guest count.
- Keep catering quality above a user-defined minimum.
- Protect accessibility requirements.
- Preserve specific cultural, religious, family, or personal requirements when relevant to the event.
- Avoid changes to already-paid or contractually committed items unless the user explicitly requests an impact analysis.
- Avoid removing a named must-have.
- Consider a contingency reserve.

Treat these as constraints, not decorative form fields. Recommendations must respect them or clearly identify when the requested outcome is infeasible.

**E. Free-text explanation**

Allow the user to explain what changed, for example:

“The venue is more expensive than expected, but photography and catering are important to us. We would prefer to simplify the decorations rather than reduce the guest list.”

Pass this text to the AI as untrusted user input. Never interpret it as permission to bypass security, validation, or financial rules.

Provide clear validation, useful defaults based on the selected event, and a visible way to cancel or reset a simulation without changing the existing plan.

### 5. Build the deterministic financial analysis engine

Financial calculations must be performed by application code, not delegated to the AI model.

Use the existing Module 04 financial calculation service as the authoritative source. Reuse it rather than duplicating formulas.

Calculate and display:

- Current budget target.
- Current planned spending.
- Current remaining budget or overrun.
- Proposed budget target.
- Proposed planned spending.
- Proposed remaining budget or overrun.
- Amount that must be saved or the additional funding required.
- Current and proposed cost per guest when guest count is greater than zero.
- Current and proposed category totals.
- Absolute and percentage changes by category.
- Fixed, variable, mixed, and unknown cost components where data supports the distinction.
- Protected, flexible, and potentially adjustable spending.
- Contingency allocation when configured.
- Any unresolved or unavailable cost information.

For each category, show the current amount, proposed amount, absolute difference, and percentage difference when mathematically valid.

Handle edge cases explicitly:

- Zero or missing budget.
- Zero or missing guest count.
- Empty budget.
- Existing budget overrun.
- Missing cost classification.
- Mixed currencies.
- Missing or stale quotations.
- Cancelled line items.
- Paid and committed items.
- Rounding and currency precision.
- Proposed changes that cannot meet the requested target.

Use integer minor currency units or an appropriate decimal-money representation. Never rely on imprecise floating-point arithmetic for authoritative monetary totals.

Do not combine different currencies unless a verified exchange-rate service and an explicit conversion policy already exist. Otherwise, show separate totals and explain the limitation.

**Important:** Changing a budget target does not automatically reduce spending. A lower target creates a gap that the simulator must address through explicit, proposed adjustments.

### 6. Distinguish fixed, variable, and uncertain costs

The simulator must not assume every expense scales equally.

Examples:

- Catering may scale with guest count.
- Venue rental may be fixed within the existing booking terms.
- Seating and tableware may scale with attendance.
- Photography may be a fixed package or depend on hours and deliverables.
- Decoration may be fixed, partially variable, or dependent on the venue.
- Transport may depend on guest count, distance, and vehicle capacity.

Use the actual line-item classifications and available quantities from Module 04.

When classification is unknown, ask the user or mark the impact as uncertain. Do not silently invent a pricing formula.

For every proposed cost change, record the basis of the calculation:

- Existing line-item amount.
- User-supplied assumption.
- Existing quotation.
- Known quantity and unit cost.
- Explicitly labelled estimate.
- Unresolved assumption.

Never present an AI-generated guess as a confirmed saving.

### 7. Generate actionable trade-off recommendations

Use Module 03’s existing AI orchestration service to recommend adjustments based on:

- Current event details.
- Current budget and line items.
- Proposed budget and guest count.
- Category priorities.
- User-defined constraints.
- Previous approved decisions.
- Current cost classifications and quotation status.
- Any relevant task or schedule dependencies already available through existing modules.

The AI should propose **specific, explainable actions**, not generic advice.

Weak recommendation:
“Spend less on decoration.”

Useful recommendation:
“Explore a simpler decoration package. The amount currently allocated to decoration is ₹80,000. A proposed reduction of ₹15,000 would bring this allocation to ₹65,000. This is a scenario assumption, not a verified supplier offer. Confirm feasibility with the decorator before committing.”

Another example:
“Catering may be a significant variable cost because the guest count increased. Before reducing food quality, compare per-person package options and verify the updated quotation.”

The model must distinguish between:
- A calculated financial result.
- A recommendation.
- An assumed saving.
- A verified quotation.
- An unresolved question.

Where data is insufficient, return a clarification request or a clearly labelled scenario assumption rather than fabricating a precise result.

### 8. Require structured, validated AI output

Use the existing project’s schema-validation approach, such as Zod if already installed.

Define a typed scenario recommendation contract containing fields equivalent to:

- `scenarioId`
- `summary`
- `assumptions`
- `unresolvedQuestions`
- `recommendations`
- `affectedBudgetItems`
- `estimatedSavings`
- `priorityImpact`
- `constraintImpact`
- `risks`
- `confidenceExplanation`
- `requiresUserConfirmation`

Each recommendation should include:

- A stable recommendation identifier.
- The proposed action.
- The affected category or line-item identifier, when known.
- Current value and proposed value where applicable.
- The expected financial effect.
- The evidence or assumptions behind the estimate.
- The reason for the recommendation.
- Its impact on must-haves and priorities.
- Any operational or quality trade-off.
- Whether additional verification is required.
- Whether the change is feasible under current constraints.

Adapt field names to the existing codebase rather than creating incompatible duplicate contracts.

Validate all AI output server-side before displaying or applying it. Reject malformed identifiers, invalid amounts, impossible operations, unauthorized references, violated constraints, and unsupported financial claims.

The AI must never directly write budget changes to the database.

### 9. Create a scenario comparison experience

After the user submits a simulation, show a clear comparison between the current plan and the proposed scenario.

Include:

**Scenario overview**
- What changed.
- Why the user requested the change.
- Whether the proposed plan meets the new budget.
- Any remaining shortfall or available surplus.
- Major assumptions and unresolved questions.

**Budget comparison**
- Current versus proposed spending.
- Current versus proposed target.
- Category-level changes.
- Cost per guest where applicable.
- Protected versus adjustable expenses.
- Estimated versus quoted versus committed versus paid amounts.

**Trade-off cards**
For each recommendation, display:
- Suggested action.
- Expected financial impact.
- Reason for the suggestion.
- Quality, guest-experience, or operational consequences.
- Confidence explanation and evidence basis.
- Any verification required.

**Visual design**
- Reuse Quveta’s existing design system.
- Make the financial comparison easy to scan.
- Use accessible labels and text in addition to colors.
- Avoid charts that hide uncertainty or imply unverified precision.
- Provide loading, empty, error, and retry states.
- Ensure the interface works on mobile and desktop.

Do not display a success state until the scenario has actually been calculated or saved as appropriate.

### 10. Allow selective approval and rejection

The user must remain in control of all meaningful changes.

Provide actions to:
- Accept an individual recommendation.
- Reject an individual recommendation.
- Select multiple recommendations.
- Review the combined effect of selected recommendations.
- Apply the selected changes.
- Cancel the scenario.
- Return to the current plan without changing it.

Recalculate the combined scenario deterministically after selection changes. Individual savings must not simply be added together when recommendations overlap or affect the same item.

Before applying changes, show a final confirmation summarizing:
- Items that will change.
- Old and new values.
- Total planned spending before and after.
- The remaining budget or overrun.
- Any unresolved constraint or verification warning.

Only approved changes may be persisted.

For changes to paid or contractually committed expenses, require explicit confirmation and clearly explain that the simulator cannot reverse an external payment or contract. Do not represent an in-app edit as a real cancellation or supplier agreement.

### 11. Preserve the original plan and support versioning

Every simulation must be isolated from the currently approved plan until the user confirms changes.

Implement or extend scenario/version history using existing persistence patterns.

Track, as appropriate:
- Scenario identifier.
- Event identifier and authorization context.
- Base plan or budget revision identifier.
- Proposed input changes.
- Recommendation results.
- Selected, accepted, and rejected recommendations.
- Assumptions and estimated amounts.
- Creation and update timestamps.
- Approval status.
- Applied revision identifier.
- Relevant AI model and prompt version if already tracked by Module 03.

Support statuses such as:
- Draft.
- Generating.
- Ready for review.
- Partially selected.
- Approved and applied.
- Rejected.
- Failed.
- Stale.

If the underlying budget changes after a scenario was generated, mark the scenario stale and require recalculation or explicit resolution before applying it.

Use transactions or the project’s equivalent atomic update strategy so a partially applied scenario cannot leave the budget inconsistent.

Preserve auditability. Do not silently overwrite previous approved versions or discard unrelated budget items.

### 12. API and persistence requirements

Follow existing backend conventions and authentication patterns. Add only the endpoints and database structures the project actually needs.

Possible API capabilities include:

- Create a scenario from an authorized event.
- Retrieve a scenario and its recommendations.
- Recalculate a scenario after selection changes.
- Approve and apply selected changes.
- Reject or cancel a scenario.
- Retrieve scenario history.

Use the project’s established naming conventions; the list above describes capabilities, not mandatory endpoint names.

Requirements:
- Validate request and response schemas.
- Enforce event ownership or equivalent authorization on every operation.
- Prevent cross-event identifier manipulation.
- Prevent duplicate application through idempotency or equivalent safeguards.
- Handle concurrent budget changes.
- Apply database migrations when needed.
- Keep provider secrets on the server.
- Add bounded AI calls, timeouts, sensible retry rules, and rate limiting using existing infrastructure.
- Do not log sensitive user notes or secrets unnecessarily.
- Never trust client-calculated totals as authoritative.

### 13. Security, reliability, and accessibility

Implement:
- Server-side validation and authorization.
- Safe handling of untrusted AI prompts and user notes.
- Protection against prompt injection and unauthorized tool or database actions.
- Output validation before rendering or persistence.
- Clear error messages without exposing internal stack traces or secrets.
- Loading, retry, empty, stale-scenario, and provider-failure states.
- Keyboard-accessible controls and visible focus indicators.
- Semantic labels for forms, tables, status messages, and interactive elements.
- Accessible chart alternatives and non-color indicators.
- Responsive layouts and reasonable performance for events with many line items.

If the AI provider fails, preserve the existing plan and scenario inputs. Explain the failure and offer a retry. Where possible, continue to show deterministic financial calculations without AI recommendations.

### 14. Testing requirements

Add tests consistent with the existing test stack.

**Unit tests**
- Budget target changes create a shortfall without silently changing line items.
- Fixed expenses do not automatically scale with guest count.
- Variable expense changes follow explicit, validated assumptions.
- Unknown costs remain unknown rather than being fabricated.
- Currency precision and rounding remain correct.
- Zero budget and zero guest count are handled safely.
- Priority and must-have constraints are respected.
- Overlapping recommendations are recalculated without double-counting.
- Rejected recommendations do not affect the approved plan.
- Selected recommendations produce the correct combined totals.

**Integration tests**
- Scenario creation and retrieval.
- AI output schema validation.
- Provider failure and retry behavior.
- Unauthorized event access is denied.
- Stale scenarios cannot be silently applied.
- Concurrent changes are detected.
- Approval updates the correct budget records atomically.
- Applying the same approval twice does not duplicate changes.
- Version history remains consistent.

**End-to-end tests**
1. Create or open an existing event with a populated budget.
2. Reduce its target budget.
3. Generate a scenario.
4. Review the proposed trade-offs and assumptions.
5. Reject one recommendation and accept another.
6. Confirm the combined revised totals.
7. Apply the selected changes.
8. Verify the budget page and dashboard show the updated authoritative values.
9. Verify the previous plan remains recoverable through the supported history mechanism.
10. Simulate an AI failure and verify the existing plan remains unchanged.

Include mobile and keyboard-navigation coverage for the main scenario workflow.

Do not claim tests pass unless they have actually been run.

### 15. Acceptance criteria

This module is complete only when:

- A user can simulate changes to an existing event without modifying the approved plan.
- The simulator uses real event and budget records.
- Budget and guest-count changes produce a deterministic financial analysis.
- Fixed and variable costs are handled according to available evidence.
- Recommendations are specific, explainable, and constrained by user priorities.
- Estimates are clearly distinguished from verified quotations.
- The user can compare the current and proposed plans.
- The user can selectively accept or reject recommendations.
- Combined totals are recalculated correctly.
- Changes are applied only after explicit approval.
- Applying a scenario updates Module 04 and flows through to Module 01.
- Scenario history and stale-state handling work.
- Authentication, validation, and error handling are implemented.
- Relevant automated tests pass.
- No fake vendor data, fabricated availability, or unsupported savings claims are presented as facts.

### 16. Implementation workflow

Work in this order:

1. Inspect the current project and Modules 01–04.
2. Report the existing architecture and identify required integration points.
3. Define scenario types, validation schemas, and state transitions.
4. Implement deterministic scenario calculations using Module 04’s services.
5. Implement backend scenario persistence and authorization.
6. Integrate structured AI recommendations through Module 03.
7. Build the scenario comparison and recommendation-selection UI.
8. Implement approval, atomic application, and version history.
9. Add unit, integration, and end-to-end tests.
10. Run available linting, type checks, builds, and tests.
11. Fix regressions and verify the complete workflow.
12. Provide a concise implementation report.

In your final report, state:
- What was implemented.
- Which files and database migrations were added or changed.
- How the simulator integrates with Modules 01–04.
- How financial calculations and AI recommendations are separated.
- Which tests were run and their actual results.
- Any limitations, assumptions, or unfinished work.

**Final product principle:** Quveta should not simply tell users to cut costs. It should help them understand their options, protect what matters most, see the consequences of each decision, and confidently choose how their event plan evolves.