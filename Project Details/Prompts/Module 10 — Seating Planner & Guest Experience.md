# Module 10 — Seating Planner & Guest Experience
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build a functional Seating Planner & Guest Experience module for Quveta, an AI-powered event-planning application.

The module helps event organizers design seating layouts, assign guests to tables or seating areas, manage capacity, respect guest preferences and accessibility requirements, and identify conflicts before the event.

**Core user story:**

“I know who's attending, but I need to decide where everyone should sit, accommodate their needs, and make sure the venue layout actually works.”

Example: A wedding has 120 confirmed attendees, 12 tables, and a maximum of 10 seats per table. Some guests want to sit with family, one guest needs wheelchair-accessible seating, and another group should be seated near the stage. Quveta should help create a feasible arrangement, explain any conflicts, and let the organizer approve or adjust the result.

All numbers are illustrative. The application must use the actual event and venue configuration.

This must be a persisted, interactive feature—not a static floor-plan image or an AI-generated seating list that cannot be edited.

### 2. Inspect the existing project

Before implementing:

1. Inspect the repository, architecture, database schema, authentication, UI components, and test framework.
2. Review Modules 01–09 and identify reusable event, guest, RSVP, task, vendor, and AI services.
3. Reuse existing design patterns, validation libraries, and data models.
4. Preserve existing guest records, RSVP responses, approved event plans, and budget records.
5. Implement incrementally and keep the application runnable.

Do not duplicate guest management or create a second source of truth for attendance.

### 3. Establish module ownership

Maintain these boundaries:

- **Module 02 — Event Setup:** owns event details, location, event date, and planning preferences.
- **Module 03 — AI Planning Engine:** owns shared AI orchestration and structured recommendations.
- **Module 04 — Budget Management:** owns authoritative financial records.
- **Module 05 — Adaptive Budget Simulator:** owns budget scenarios and approved budget changes.
- **Module 06 — Task & Timeline Management:** owns tasks, deadlines, and dependencies.
- **Module 07 — Vendor & Quotation Management:** owns vendor records, quotations, and recorded booking status.
- **Module 08 — Event-Day Coordination:** owns the run sheet, operational progress, and incident tracking.
- **Module 09 — Guest Management & RSVP Tracking:** owns guest records, invitation states, RSVP responses, and authoritative attendance calculations.
- **Module 10 — Seating Planner:** owns venue seating configurations, table definitions, seating assignments, seating preferences used for planning, and layout validation.
- **Module 01 — Dashboard:** displays relevant seating and guest-readiness summaries.

Use Module 09’s authoritative guest and attendance data. Do not independently redefine who is attending.

### 4. Build venue and seating configuration

Allow authorized users to create and manage seating configurations for an event.

Support venue layouts containing:
- Seating areas or zones.
- Tables or seating groups.
- Table names or numbers.
- Table shapes, where relevant.
- Seating capacity.
- Location within the venue.
- Accessibility characteristics.
- Proximity or placement notes.
- Restrictions or reserved seating.
- Active or inactive status.

Examples of seating areas include the main hall, outdoor area, VIP section, family area, and accessible seating zone.

Each table should support:
- Unique table ID.
- Event ID.
- Table name or number.
- Seating area.
- Maximum capacity.
- Optional shape.
- Optional position and dimensions for a visual layout.
- Optional seat numbering.
- Optional accessibility attributes.
- Optional notes.
- Creation and update timestamps.

Allow organizers to create, edit, duplicate, and remove tables where safe.

Do not allow a table to be removed if it has active assignments without warning and an explicit reassignment or removal decision.

If the venue's actual capacity is unknown, label the configuration as user-defined or unverified. Do not imply that Quveta has independently inspected the venue.

### 5. Build the seating assignment interface

Create an interface that lets users assign confirmed guests to tables.

Include:

**Guest panel**
- Guest name or display name.
- RSVP status.
- Household or group.
- Current table assignment.
- Relevant seating preferences.
- Outstanding seating requirements.

**Table panel**
- Table name.
- Seating area.
- Maximum capacity.
- Current assigned count.
- Remaining capacity.
- Assigned guests.
- Capacity warnings.

**Assignment actions**
- Assign a guest to a table.
- Move a guest between tables.
- Remove an assignment.
- Assign selected guests together.
- Search and filter guests.
- Search and filter tables.
- Review unassigned guests.
- Undo a recent change where supported.

Support keyboard-accessible assignment controls. If drag-and-drop is implemented, provide equivalent non-drag alternatives.

Persist changes and immediately recalculate table occupancy.

### 6. Enforce capacity and assignment rules

Implement deterministic validation in application code.

Core rules:
- A guest must belong to the correct event.
- An active guest assignment must reference a valid table belonging to the same event.
- A guest must not be assigned to multiple active seats for the same seating plan unless a supported model explicitly represents multiple event sessions.
- A table must not exceed its configured capacity.
- Removing or deactivating a table must not silently discard active assignments.
- Repeated assignment requests must not create duplicate assignments.
- Capacity changes must trigger revalidation.
- Only authorized users may modify seating records.

Use the correct attendance unit. If a guest record represents multiple confirmed attendees, the seating model must represent each individual attendee or explicitly track a group assignment with a validated seat count.

Do not treat a household as one seat merely because it has one RSVP record.

If a party's confirmed size changes, identify the affected assignments and request resolution when the existing seating configuration is no longer valid.

### 7. Support guest groups and seating preferences

Integrate with Module 09 to access existing guest groups and household relationships.

Allow authorized organizers to record seating preferences such as:
- Keep a household together.
- Seat a group of friends together.
- Place a guest near a specified group.
- Seat guests near the stage or speaker area.
- Keep a guest away from another guest, where the organizer explicitly requests it.
- Reserve seating for designated participants.
- Prioritize proximity to accessible entrances or facilities.
- Keep children with their responsible adult when explicitly specified.

Treat preferences as explicit constraints or soft preferences according to the organizer's settings.

Provide a way to distinguish:
- Required constraints.
- Preferred arrangements.
- Optional suggestions.

Do not infer relationship conflicts, family dynamics, disabilities, or social preferences from names or demographic characteristics.

Do not automatically infer sensitive attributes about guests.

When a required constraint conflicts with another requirement, explain the conflict and ask the organizer to resolve it.

### 8. Implement accessible seating support

Allow organizers to record the seating accommodations needed for an event using the information they are authorized to access from Module 09.

Examples may include:
- Wheelchair-accessible seating.
- Step-free access requirements.
- Companion seating.
- Seating near an accessible route.
- Proximity to an accessible restroom or entrance where venue information is available.
- Other organizer-defined requirements.

Requirements:
- Use only the minimum relevant information needed for seating.
- Restrict access to sensitive guest details.
- Avoid exposing private accessibility notes in general seating exports.
- Do not assume a table is accessible because its name contains “accessible.”
- Let organizers define and verify the characteristics of seating areas.
- Flag unresolved requirements instead of silently assigning unsuitable seating.

The system must distinguish between a guest requirement recorded in the application and an independently verified venue accommodation.

### 9. Create an interactive visual floor plan

Where feasible with the existing frontend stack, implement a simple interactive floor-plan editor.

Allow users to:
- Add tables to a seating area.
- Move tables within the layout.
- Rename tables.
- Change table shapes where supported.
- Configure table capacity.
- View assigned guests or occupancy.
- Zoom or pan when necessary.
- Save and reopen the layout.

Use a sensible two-dimensional representation with accessible labels and controls.

Do not require a complex architectural CAD editor. Focus on a clear, useful layout for event organizers.

Persist positions and layout metadata. Avoid storing the entire layout solely in frontend state.

If a visual editor is too large for the existing scope, deliver a complete table-based seating planner first and document the visual editor as a remaining limitation. Do not present a static illustration as an interactive editor.

### 10. Build seating validation and conflict detection

Create a deterministic validation service that checks the current seating plan.

Detect:
- Unassigned confirmed attendees.
- Tables exceeding capacity.
- Duplicate assignments.
- Invalid guest or table references.
- Required groups split across tables.
- Required separation constraints violated.
- Accessibility requirements not yet accommodated.
- Missing or inactive seating areas.
- Table capacity changes that invalidate assignments.
- RSVP changes that affect seating.
- Unresolved seating requirements.

Distinguish between hard errors and review warnings.

Examples:
- **Error:** A table has 12 assigned seats but a configured capacity of 10.
- **Warning:** A preferred family group is split across two tables.
- **Needs review:** A guest's RSVP changed, and the previous seating assignment may no longer be valid.

Do not treat every preference as a hard constraint. Users should be able to configure the importance of soft preferences.

Show a useful conflict summary with affected guests or tables, the reason for the conflict, and possible corrective actions.

### 11. Add AI-assisted seating recommendations

Use Module 03's existing AI orchestration service when recommendations would help.

AI may suggest:
- Groupings based on explicitly supplied preferences.
- Alternative arrangements that satisfy capacity constraints.
- Seating options that keep selected groups together.
- Placement near designated areas.
- Ways to resolve conflicting preferences.
- Explanations of the trade-offs between candidate layouts.

The AI must not independently determine whether a layout is valid.

**Application code must perform:**
- Capacity validation.
- Assignment uniqueness checks.
- Event and table ownership validation.
- Constraint evaluation.
- Guest-count reconciliation.
- Accessibility-rule checks based on recorded configuration.
- Final feasibility validation.

Use schema-validated structured output.

AI recommendations must reference existing guest and table IDs. Reject fabricated or unauthorized IDs.

Do not allow the AI to invent attendees, infer sensitive characteristics, or silently assign guests based on stereotypes.

If preferences are insufficient, ask the organizer a focused clarification question or generate a proposal using clearly stated assumptions.

### 12. Implement a review-and-apply workflow

AI-generated seating arrangements must initially be proposals, not saved final assignments.

Provide a workflow to:
1. Select the guests and seating plan to optimize.
2. Configure required constraints and soft preferences.
3. Generate a candidate arrangement.
4. Validate the arrangement deterministically.
5. Display proposed assignments and any unresolved conflicts.
6. Compare the proposal with the current seating plan.
7. Allow the organizer to accept, reject, or manually edit assignments.
8. Revalidate the edited result.
9. Confirm and save the approved assignments.

Do not overwrite the existing plan when generating a proposal.

If the current seating plan changes while a proposal is open, mark the proposal stale and require recalculation or explicit resolution before applying it.

When applying a proposal, use an atomic persistence strategy so the database cannot be left with partially applied assignments.

### 13. Support seating-plan versions

Allow users to maintain a useful history of seating-plan changes.

Track relevant information such as:
- Seating plan identifier.
- Event identifier.
- Plan version.
- Table configuration.
- Guest assignments.
- Layout positions.
- Validation results.
- Source of the changes.
- Creation and update timestamps.
- Approval status.

Preserve previously approved arrangements when a new layout is proposed.

Where the existing architecture supports audit history, reuse it.

Provide a way to restore a previous version when appropriate, but revalidate restored assignments against the current guest list, RSVP records, and table capacities before applying them.

Do not silently overwrite historical versions.

### 14. Handle RSVP changes and attendance updates

Integrate with Module 09.

When a guest:
- Confirms attendance.
- Declines.
- Changes party size.
- Withdraws a response.
- Is archived or removed.

Identify the affected seating assignments.

Examples:
- A newly confirmed guest may need a seat.
- A guest who declines may leave an unused seat.
- A household's confirmed party size may increase.
- A table may become over capacity after an RSVP correction.

Do not silently invent a new assignment or remove an existing guest from a table.

Show the organizer what changed and provide a clear review action.

Preserve existing valid assignments whenever possible.

### 15. Connect seating to budget, vendor, and event-day modules

**Module 04 — Budget Management**
- Surface configured seating-related expenses where relevant.
- Do not modify financial records automatically.

**Module 05 — Adaptive Budget Simulator**
- Allow the seating configuration to inform scenario assumptions when table or rental costs are recorded.
- Do not invent a cost per table or chair.

**Module 06 — Task & Timeline Management**
- Support approved follow-up tasks for unresolved seating requirements.
- Prevent duplicate tasks.

**Module 07 — Vendor & Quotation Management**
- Reference actual venue, furniture rental, and catering vendor records when available.
- Highlight relevant capacity or layout details only when documented.

**Module 08 — Event-Day Coordination**
- Make the approved seating plan available to authorized coordinators.
- Surface unresolved assignments and seating requirements.
- Preserve the distinction between an approved plan and a draft proposal.

**Module 09 — Guest Management**
- Use authoritative RSVP and party-size information.
- Keep sensitive guest details appropriately restricted.

### 16. Backend, persistence, and API requirements

Follow the existing backend and database conventions.

Implement capabilities equivalent to:
- Create and retrieve seating plans.
- Create, update, and deactivate tables.
- Configure seating areas.
- Create and update guest assignments.
- Retrieve table occupancy.
- Validate the current seating plan.
- Generate seating proposals.
- Review and apply approved proposals.
- Retrieve seating-plan history.
- Revalidate assignments after relevant RSVP changes.

Requirements:
- Typed request and response schemas.
- Server-side validation.
- Authorization on every event, guest, table, and assignment operation.
- Database migrations where required.
- Event-scoped relationship validation.
- Transactional updates for bulk assignments.
- Safe concurrent-update handling.
- Idempotency where repeated requests could create duplicate assignments.
- Clear error responses.
- Bounded queries for large guest lists.
- No client-side calculation treated as authoritative.

Reuse Module 09's guest identifiers and Module 03's AI integration.

### 17. Security, privacy, and accessibility

Implement:
- Event-level authorization.
- Protection against cross-event identifier manipulation.
- Access controls for sensitive guest information.
- Validation of AI-generated assignments.
- Safe handling of user-entered seating preferences.
- Clear errors without stack traces or secrets.
- Secure storage of seating-plan and guest records.

Accessibility requirements:
- Keyboard-operable guest and table assignment.
- Accessible alternatives to drag-and-drop.
- Semantic labels for tables and seating areas.
- Screen-reader-friendly capacity and conflict messages.
- Visible focus indicators.
- Status information that does not rely on color alone.
- Responsive layouts.
- Clear loading, empty, validation, and error states.

The seating planner must itself be accessible, even when it is used to organize accessible seating for an event.

### 18. Testing requirements

Use the existing test framework.

**Unit tests**
- Table capacity validation.
- Guest assignment uniqueness.
- Household party-size handling.
- Required group constraints.
- Separation constraints.
- Seating preference evaluation.
- Accessibility requirement validation.
- RSVP-change impact analysis.
- Duplicate assignment prevention.
- Seating proposal schema validation.
- Stale proposal detection.

**Integration tests**
- Seating-plan CRUD.
- Table and seating-area CRUD.
- Assignment persistence.
- Cross-event authorization.
- Atomic bulk assignment updates.
- Capacity changes with existing assignments.
- RSVP updates affecting seating.
- Proposal approval and version history.
- Invalid AI-generated guest or table IDs.
- AI provider failure.

**End-to-end tests**
1. Open an event with confirmed guests.
2. Create tables with different capacities.
3. Assign guests and verify occupancy counts.
4. Attempt to exceed table capacity and verify that the action is rejected or clearly blocked.
5. Record a seating preference and generate a proposal.
6. Review and edit the proposed assignments.
7. Apply the approved arrangement.
8. Change an RSVP and verify the affected seating is flagged.
9. Verify accessibility-related requirements are surfaced.
10. Confirm the previous approved seating plan remains recoverable.
11. Verify unauthorized users cannot access or modify seating data.
12. Test assignment controls using a keyboard and a mobile layout.

Run the relevant checks and report actual results. Do not claim tests pass unless they have been executed.

### 19. Acceptance criteria

The module is complete when:

- Users can configure seating areas, tables, and capacities.
- Users can assign guests to tables and persist the assignments.
- Guest and household attendance is represented correctly.
- Table capacity and assignment uniqueness are enforced.
- Seating preferences and required constraints are validated.
- Accessibility requirements are handled without unsupported assumptions.
- RSVP changes trigger relevant seating reviews.
- AI proposals are structured, validated, and reviewable.
- No proposed seating plan overwrites approved assignments without confirmation.
- Seating history is preserved.
- The approved layout is available to authorized event coordinators.
- Security, privacy, and accessibility requirements are implemented.
- Relevant automated tests pass.
- No fictional guests, venue capacities, or unsupported accessibility claims are presented as facts.

### 20. Implementation workflow

Proceed in this order:

1. Inspect the project and Modules 01–09.
2. Identify existing guest, RSVP, event, and persistence models.
3. Define seating-plan, table, assignment, and preference contracts.
4. Implement storage, authorization, and deterministic validation.
5. Build the guest assignment and table-management interfaces.
6. Implement capacity and conflict detection.
7. Add a visual floor-plan editor if feasible.
8. Integrate AI-assisted seating proposals through Module 03.
9. Implement review, approval, and version history.
10. Integrate RSVP updates and event-day coordination.
11. Add automated tests.
12. Run linting, type checks, builds, and relevant tests.
13. Fix regressions and verify the end-to-end workflow.

In your final implementation report, summarize:
- Features implemented.
- Files and migrations changed.
- Integration with Modules 01–09.
- Seating constraints and validation rules.
- Tests executed and actual results.
- Remaining limitations or unfinished work.

**Product principle:** Quveta should make seating decisions easier without pretending every social preference has a perfect mathematical solution. It should surface constraints, respect guest needs, explain trade-offs, and leave the final arrangement in the organizer's hands.