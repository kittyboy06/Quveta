# QUVETA — MODULE 02: EVENT SETUP & PREFERENCES
## High-Quality Antigravity Implementation Specification

### 1. OBJECTIVE

Build a complete, production-quality event creation and editing workflow for Quveta.

Users must be able to define an event, specify constraints and preferences, save it, reopen it, and update its details without losing existing planning data.

The module must provide validated, structured event data to the dashboard, AI planning engine, budget management, adaptive budget simulator, and timeline modules.

Do not build a static form that only updates frontend state. Persist valid data through the application's existing backend and database architecture.

### 2. SCOPE

Implement:
- Event creation.
- Event editing.
- Event detail retrieval.
- Event preferences and constraints.
- Input validation.
- Event lifecycle status.
- Draft handling if supported by the existing architecture.
- Persistence and error recovery.
- Navigation to the saved event.
- Integration contracts for downstream modules.

Do not implement the AI planning engine, budget simulator, or timeline engine within this module. Collect and store the data they require.

### 3. EVENT INFORMATION

Organize the form into clear sections.

#### A. Basic information

Required or conditionally required fields:
- Event name.
- Event type.
- Event date.
- Event location or region.
- Expected guest count.
- Total budget.
- Currency.

Support event types such as:
- Wedding.
- Birthday.
- Engagement.
- Community event.
- College event.
- Corporate event.
- Other.

Allow a custom event type when "Other" is selected.

Use INR as the initial default currency for the India-focused experience, but make the currency explicit and editable.

#### B. Event timing

Collect:
- Event date.
- Start time and end time when applicable.
- Time zone or reliable event-local time-zone handling.
- Setup and teardown durations if relevant.

Do not assume every event lasts a full day. Do not silently shift event dates because of UTC conversions.

Reject invalid date/time combinations and warn users when the selected date is in the past. Permit past events only if the application explicitly supports retrospective planning.

#### C. Style and preferences

Collect optional information such as:
- Theme or style.
- Indoor or outdoor preference.
- Formal or casual atmosphere.
- Cultural or event-specific preferences when supplied by the user.
- Catering preferences.
- Dietary requirements.
- Accessibility requirements.
- Additional notes.

Do not infer sensitive characteristics from names, locations, or event type. Only store information necessary for the user's stated preferences.

#### D. Budget and priorities

Collect:
- Total budget.
- Must-have categories or elements.
- Flexible categories or elements.
- Ranked priorities.
- Budget flexibility, if the user wants to specify it.
- Important restrictions.

Example priorities:
- Venue quality.
- Food.
- Photography.
- Guest experience.
- Decoration.
- Entertainment.

Allow users to define custom priorities.

Do not require the user to distribute the full budget across categories at event creation. Detailed allocations belong to the budget module.

#### E. Constraints and notes

Support user-provided constraints such as:
- Venue restrictions.
- Dietary requirements.
- Accessibility needs.
- Limited setup time.
- Outdoor weather concerns.
- Vendor or equipment restrictions.
- Other logistical requirements.

Store structured fields for information that downstream logic must evaluate. Keep free-text notes separate from structured constraints.

### 4. USER EXPERIENCE

Build a guided, responsive form with a clear visual hierarchy.

Requirements:
- Group related fields into logical sections.
- Clearly mark required and optional fields.
- Provide concise, actionable validation messages.
- Preserve valid user-entered data when validation fails.
- Show a summary of the entered event information before final submission where useful.
- Disable duplicate submissions while a save request is in progress.
- Show loading, success, and error states.
- Support keyboard navigation and screen readers.
- Avoid overwhelming users with optional fields at once.
- Use conditional fields only when relevant.
- Support editing without forcing users through unnecessary repeated steps.

Provide two primary actions:
- Save Event.
- Cancel or return.

If draft saving is implemented, distinguish a draft from a fully configured event and ensure downstream modules can recognize incomplete data.

### 5. VALIDATION RULES

Implement validation in both the frontend and backend.

#### Event name
- Trim whitespace.
- Reject empty or whitespace-only names.
- Enforce a documented maximum length.
- Handle ordinary punctuation and international characters safely.

#### Event type
- Require a valid supported type or a nonempty custom type when "Other" is selected.
- Reject arbitrary unsupported enum values on the server.

#### Date and time
- Validate actual calendar dates.
- Validate start and end times.
- Reject an end time that precedes the start time unless an explicitly supported overnight-event rule applies.
- Handle time zones consistently.
- Warn about past dates according to the chosen event lifecycle policy.

#### Guest count
- Must be a nonnegative integer.
- Require a positive count for event types that cannot reasonably have zero guests.
- Enforce a reasonable, documented upper bound.
- Do not silently round invalid values.

#### Budget
- Validate that the amount is finite and nonnegative.
- Use an appropriate precise monetary representation.
- Enforce supported currency codes.
- Prevent invalid strings, `NaN`, and infinity.
- Clearly represent an unset budget separately from a budget of zero.

#### Preferences and constraints
- Limit free-text lengths.
- Validate structured preference values.
- Prevent malformed arrays and invalid priority identifiers.
- Deduplicate repeated priorities.
- Do not silently discard unknown user-entered information.

Return structured validation errors that identify the affected field without exposing internal server details.

### 6. DATA MODEL AND PERSISTENCE

Inspect the existing schema before adding or modifying tables.

The event model should support, where appropriate:
- Stable event ID.
- Owner ID if authentication exists.
- Name.
- Event type.
- Custom event type.
- Event-local date and time.
- Time zone.
- Location.
- Guest count.
- Budget amount.
- Currency.
- Preferences.
- Must-have and flexible elements.
- Ranked priorities.
- Structured constraints.
- Free-text notes.
- Lifecycle status.
- Created timestamp.
- Updated timestamp.

Use normalized related tables where appropriate and JSON fields only when they make sense for flexible, well-defined preference structures.

Requirements:
- Use database migrations or the existing schema-management process.
- Preserve data when editing an event.
- Avoid accidental duplicate event creation.
- Use stable IDs, not array indexes.
- Implement optimistic concurrency or conflict detection if concurrent edits are supported.
- Enforce owner access through backend authorization and database policies.

Do not store the entire event as an opaque unvalidated blob.

### 7. CREATE AND EDIT BEHAVIOR

#### Create event
1. User enters the event information.
2. Client performs immediate usability validation.
3. Server validates the complete request.
4. Valid data is persisted.
5. The application receives the canonical event ID.
6. The user is navigated to the saved event or its planning workflow.
7. The dashboard refreshes to show the new event.

If persistence fails, retain the entered form values and show a retry option.

#### Edit event
1. Load the existing event from the backend.
2. Populate the form with saved values.
3. Track changes without mutating the original object directly.
4. Validate the modified values.
5. Save only valid changes.
6. Refresh relevant dashboard and event views after success.

Editing an event must not silently erase its budget items, tasks, plan versions, or vendor quotations.

#### Changes to important constraints

If the user changes the event date, guest count, budget, or priorities:
- Save the new event information.
- Identify which downstream modules may need to recalculate or review their plans.
- Mark affected plans as needing review when appropriate.
- Preserve the previously approved plan until the relevant update is reviewed.
- Do not run an expensive AI regeneration automatically for every keystroke.
- Use explicit integration events or service interfaces where appropriate.

The event module owns event data, not the downstream recalculation logic.

### 8. ARCHITECTURE AND INTEGRATION

Follow the repository's established structure.

If no conventions exist, use a structure similar to:

- `features/events/` — event form, edit page, detail view, and state handling.
- `features/events/components/` — reusable form sections and preference controls.
- `features/events/schemas/` — client-side validation schemas.
- `features/events/types/` — event domain and form types.
- `server/modules/events/` — event routes, service, validation, and persistence.
- `shared/contracts/` — shared API types where appropriate.

Keep responsibilities separated:
- UI components render and collect user input.
- Domain services enforce event-specific business rules.
- Persistence repositories handle database operations.
- API handlers enforce authorization and request validation.
- Other modules consume typed event contracts.

Avoid circular imports and direct access to another module's internal database implementation.

### 9. SECURITY AND PRIVACY

- Enforce event ownership on every read, update, and delete operation.
- Never trust an owner ID supplied by the browser.
- Derive ownership from the authenticated server context.
- Validate every incoming request.
- Apply database access policies where supported.
- Do not expose internal errors or credentials.
- Limit free-text lengths and handle untrusted content safely.
- Do not automatically pass arbitrary notes to an AI provider without appropriate context handling.
- Avoid collecting unnecessary personal information.
- Do not introduce authentication solely for this module if a coherent application-wide authentication decision has not been made.

If authentication is not yet implemented, follow the project's explicit development or demo access model and document the limitations.

### 10. ACCESSIBILITY AND RESPONSIVENESS

Meet practical WCAG 2.2 AA-oriented expectations where applicable.

- Use semantic form elements.
- Associate every field with a visible label.
- Connect validation messages to the corresponding input.
- Announce submission status and important errors accessibly.
- Ensure keyboard navigation works.
- Provide visible focus states.
- Maintain sufficient contrast.
- Do not rely on placeholders as the only labels.
- Support mobile, tablet, and desktop layouts.
- Make date and time inputs usable with keyboard and assistive technologies.

### 11. PERFORMANCE AND RELIABILITY

- Avoid unnecessary network requests.
- Prevent duplicate submissions.
- Do not save on every keystroke unless a deliberate autosave mechanism is implemented.
- Handle slow network requests and timeouts.
- Preserve form values when requests fail.
- Avoid loading unrelated event histories during editing.
- Use appropriate database indexes for event ownership and frequently queried fields.
- Ensure updates do not overwrite newer data silently.
- Avoid unnecessary dependencies.

### 12. TESTING REQUIREMENTS

Use the repository's existing testing framework.

#### Unit tests
Test:
- Event field validation.
- Custom event-type validation.
- Budget and guest-count boundaries.
- Date and time validation.
- Priority ordering and deduplication.
- Preference normalization.
- Missing versus zero-valued fields.

#### Integration tests
Test:
- Event creation.
- Event retrieval.
- Event editing.
- Persistence failures.
- Invalid requests.
- Unauthorized reads and updates.
- Duplicate submission handling.
- Preservation of related records after edits.

#### End-to-end tests
Verify:
1. A user can create a valid event.
2. Invalid data produces understandable field errors.
3. Correcting the fields allows submission.
4. The event persists after reload.
5. The user can reopen and edit the event.
6. Changing guest count or budget preserves unrelated fields.
7. A failed save does not erase entered information.
8. The created event appears on the dashboard.
9. The flow works on mobile and with keyboard navigation.

### 13. ACCEPTANCE CRITERIA

- [ ] Users can create events with validated information.
- [ ] Users can reopen and edit saved events.
- [ ] Event data persists through the backend and database.
- [ ] Custom event types work correctly.
- [ ] Budget, currency, guest count, and date values are validated.
- [ ] Missing values are distinguishable from actual zero values.
- [ ] Preferences and priorities are stored in a structured form.
- [ ] Validation errors preserve user input.
- [ ] Failed requests have a usable recovery path.
- [ ] Event ownership is enforced where authentication exists.
- [ ] Edits preserve related planning data.
- [ ] Important changes can be communicated to downstream modules.
- [ ] The dashboard reflects successful event changes.
- [ ] Keyboard accessibility and responsive behavior are verified.
- [ ] Automated tests pass.
- [ ] The production build succeeds.
- [ ] No fake persistence or nonfunctional controls remain.

### 14. IMPLEMENTATION WORKFLOW

Before coding:
1. Inspect the existing repository and Module 01 implementation.
2. Reuse existing routing, form components, validation tools, and API conventions.
3. Identify the existing event schema and migration strategy.
4. Document the event contract required by downstream modules.
5. Define acceptance tests before implementing the full flow.

Then implement:
1. Event domain model and validation.
2. Persistence and API operations.
3. Create-event form.
4. Edit-event workflow.
5. Preference and constraint collection.
6. Dashboard integration.
7. Accessibility and responsive states.
8. Unit, integration, and end-to-end tests.

Keep the application runnable. Do not rewrite unrelated modules. Report blockers instead of inventing unavailable infrastructure.

### 15. FINAL REPORT

After implementation, provide:
- Files created or modified.
- Event schema and API contracts.
- Validation rules implemented.
- Integration points with the dashboard and downstream modules.
- Tests executed and actual results.
- Production build status.
- Security and accessibility checks.
- Remaining limitations.

Never claim successful tests, persistence, or deployment without verification.

**Final directive:** Build an event setup workflow that collects accurate, structured information and serves as a reliable foundation for Quveta's adaptive AI planning system.