# Module 08 — Event-Day Run Sheet & Coordination
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build a fully functional Event-Day Run Sheet & Coordination module for Quveta, an AI-powered event-planning application.

The module turns the approved event plan into a chronological, operational schedule that organizers can use before and during an event.

It should answer five questions quickly:

1. What is happening now?
2. What happens next?
3. Who is responsible?
4. What is delayed, blocked, or at risk?
5. What should we do when something changes?

**Core user story:**

“On the day of my event, I need one reliable place to see the schedule, coordinate people, track progress, and respond to unexpected changes without losing control of the plan.”

Example: A wedding ceremony is scheduled for 5:00 PM. The photographer is delayed, decoration setup is running late, and guests are arriving early. Quveta should show the affected schedule items, highlight potential conflicts, suggest recovery options, and let the organizer decide which changes to apply.

Do not assume the photographer’s delay automatically requires moving the ceremony. Show the consequences and let the user choose.

This must be a working, persisted feature integrated with the existing modules—not a static itinerary or an AI-generated schedule that cannot be edited.

### 2. Inspect the existing project

Before implementing:

1. Inspect the repository, architecture, database schema, authentication, UI system, and test framework.
2. Review Modules 01–07 and identify reusable event, task, vendor, budget, and AI services.
3. Reuse existing components, models, validation, and API conventions.
4. Preserve existing event plans, completed tasks, vendor records, and approved budget decisions.
5. Implement incrementally and keep the application runnable.

Do not introduce a second task management system or duplicate existing business logic.

### 3. Establish module boundaries

Respect these ownership rules:

- Module 02 — Event Setup owns event details, date, timezone, location, and preferences.
- Module 03 — AI Planning Engine owns shared AI orchestration and structured AI recommendations.
- Module 04 — Budget Management owns authoritative financial records and calculations.
- Module 05 — Adaptive Budget Simulator owns budget scenarios and approved budget adjustments.
- Module 06 — Task & Timeline Management owns tasks, dependencies, deadlines, and scheduling.
- Module 07 — Vendor & Quotation Management owns vendor records, quotations, and recorded booking statuses.
- Module 08 — Event-Day Coordination owns the operational run sheet, event-day coordination state, live progress tracking, incident records, and proposed event-day adjustments.
- Module 01 — Dashboard presents relevant event and operational summaries.

Reuse Module 06’s task and dependency engine. A run-sheet item may reference an existing task, but must not create duplicate tasks unnecessarily.

### 4. Build the operational run sheet

Create an event-specific run sheet using persisted event data.

Each run-sheet item should support:

- Unique item ID.
- Event ID.
- Title.
- Description or instructions.
- Scheduled start time.
- Scheduled end time or duration.
- Event timezone.
- Item category.
- Priority.
- Status.
- Responsible person or team, where supported.
- Related task ID, where applicable.
- Related vendor ID, where applicable.
- Dependencies.
- Location or venue area.
- Preparation notes.
- Completion criteria.
- Actual start time, where recorded.
- Actual completion time, where recorded.
- Delay or deviation notes.
- Source, such as user-created, approved plan, or imported task.
- Created and updated timestamps.

Suggested categories:

- Setup and preparation.
- Vendor arrival.
- Decoration and staging.
- Technical checks.
- Guest arrival.
- Ceremony.
- Food and beverage service.
- Speeches and presentations.
- Entertainment.
- Photography.
- Transitions.
- Cleanup and closing.
- Other.

Allow users to customize categories when appropriate.

Support run-sheet items created manually or generated from approved tasks and event plans.

When importing tasks, preserve the original task identity and status. Do not duplicate the same work simply because it appears in both the task list and run sheet.

### 5. Create the run-sheet interface

Build a clean, operational interface optimized for quick scanning.

**A. Chronological schedule**

Display:
- Time.
- Activity.
- Duration.
- Responsible person or team.
- Location.
- Status.
- Dependencies or warnings.
- Related vendor or task, where applicable.

Sort items chronologically using the event timezone.

Clearly distinguish completed, in-progress, upcoming, delayed, blocked, and cancelled items.

Do not invent a start time for an item that has no scheduled time.

**B. Event-day overview**

Display:
- Event name, date, and location.
- Current event status.
- Total run-sheet items.
- Completed and outstanding items.
- Delayed or blocked items.
- Next scheduled activity.
- Important upcoming milestones.

Use real persisted data and consistent calculations.

**C. Timeline view**

Show the schedule across the event day, including durations and overlapping activities.

Make conflicts visible, particularly when:
- A person is assigned to overlapping activities.
- A prerequisite is incomplete.
- A setup activity runs into the next scheduled activity.
- A task duration exceeds the available time.
- A critical milestone is at risk.

Do not flag legitimate parallel activities as conflicts unless the relevant resource or dependency is actually constrained.

**D. Now and Next view**

Provide a simplified operational view showing:
- The current or most relevant activity.
- The next scheduled activity.
- Outstanding actions.
- Active incidents.
- Critical alerts.

The current activity must be derived from the current time in the event timezone and the stored schedule. If the current time is outside the event schedule, show the nearest upcoming or most recently relevant activity rather than falsely claiming an event is in progress.

### 6. Implement run-sheet editing and progress tracking

Users must be able to:

- Add run-sheet items.
- Edit titles, instructions, times, durations, locations, and assignments.
- Reorder activities.
- Mark an item as in progress.
- Mark an item completed.
- Mark an item delayed or blocked.
- Cancel an item.
- Record actual start and completion times.
- Add operational notes.
- Restore or reopen an item when authorized and appropriate.

Persist all meaningful changes.

When changing an item’s time, recalculate relevant conflicts and dependent activities.

Do not silently move other activities to accommodate a change.

If a proposed change creates a scheduling conflict, explain the conflict and offer alternatives.

Preserve an auditable distinction between the original scheduled time and actual execution time where operationally useful.

Use explicit user actions for important status transitions. Do not mark activities completed simply because their scheduled end time has passed.

### 7. Support responsible people and team coordination

If the project already supports users, teams, or event collaborators, integrate with that authorization model.

Allow users to assign run-sheet items to authorized people or teams and display their responsibilities clearly.

Where supported, provide:
- Assigned activities.
- Contact details that the current user is authorized to see.
- Assignment status.
- Responsibility changes.
- Notes relevant to the assigned activity.

Do not expose personal information to unauthorized users.

If team collaboration infrastructure does not exist, implement a lightweight assignment model only if it fits the existing architecture. Do not create a separate authentication system for this module.

Do not imply that a person has received a notification unless an actual notification integration confirms delivery.

### 8. Implement live progress tracking

Provide a practical way for organizers to record what is happening during the event.

Support:
- Activity started.
- Activity completed.
- Activity delayed.
- Activity blocked.
- Activity cancelled.
- Unexpected issue reported.
- Schedule adjustment proposed.
- Schedule adjustment approved.

Capture the actor and timestamp when supported by the existing authentication system.

When a user records a delay, allow them to enter:
- Reason for delay.
- Estimated revised start time, if known.
- Expected duration, if known.
- Related vendor, task, or activity.
- Immediate operational concern.

Keep unknown values explicitly unknown.

Do not assume that a delay duration is exact merely because a user enters an estimate.

### 9. Build an incident and issue log

Create an event-day incident log for operational problems.

Examples:
- A vendor has not arrived.
- Decoration setup is incomplete.
- Audio equipment has failed.
- A scheduled speaker is unavailable.
- Weather conditions require an outdoor-to-indoor transition.
- Catering service is delayed.
- A guest accessibility requirement needs attention.

Each incident should support:

- Incident ID.
- Event ID.
- Title and description.
- Category.
- Severity.
- Status.
- Reported timestamp.
- Reporter, where supported.
- Related run-sheet items.
- Related tasks or vendors.
- Assigned responder, where supported.
- Proposed resolution.
- Resolution notes.
- Resolved timestamp, where applicable.

Suggested severity levels:
- Low.
- Moderate.
- High.
- Critical.

Suggested statuses:
- Open.
- Investigating.
- Action required.
- Resolved.
- Closed.

Provide filters and sorting so organizers can focus on unresolved and high-severity issues.

Do not label an issue as resolved merely because a suggested resolution exists. Resolution must be explicitly recorded.

For critical issues, make the interface emphasize immediate attention while avoiding unsupported claims about emergency services or external response.

### 10. Implement schedule-impact analysis

This is one of the module’s most important capabilities.

When a user reports a delay or changes an activity’s time, analyze the impact using Module 06’s task and dependency logic plus the run sheet’s own scheduling data.

The analysis should identify:

- Directly affected activities.
- Downstream activities that may be affected.
- Overlapping or resource conflicts.
- Tasks whose prerequisites are no longer satisfied.
- Important milestones at risk.
- Activities with insufficient time to complete.
- Possible recovery options.
- Unresolved assumptions.

For example, if a decoration setup finishes later than expected, the application might identify a scheduled photography session that depends on the completed setup.

It should not automatically move the photography session or shorten the ceremony. Instead, it should present feasible options for review.

Distinguish between:
- Confirmed dependency.
- Resource conflict supported by assignment data.
- Potential timing conflict.
- AI-suggested relationship requiring confirmation.

If insufficient information exists, ask a question or explain the uncertainty.

### 11. Generate recovery options without taking control away from users

Use deterministic scheduling logic for time arithmetic, dependency validation, overlap detection, and hard constraints.

Use Module 03’s AI service to explain consequences and propose operational alternatives.

Potential options include:
- Delay a flexible activity.
- Reorder activities where dependencies permit.
- Shorten an activity when the organizer confirms it is flexible.
- Reassign an activity to an available, authorized person.
- Move a nonessential activity to a later slot.
- Notify the organizer that the schedule cannot be reconciled without a decision.

Every option must include:
- Proposed change.
- Affected activities.
- Original and proposed times.
- Reason for the change.
- Relevant dependencies.
- Trade-offs or risks.
- Assumptions.
- Whether additional confirmation is needed.

Do not shorten ceremonies, meals, accessibility arrangements, or other important activities without explicit user approval.

Do not assume an individual or vendor is available for reassignment without evidence.

If no feasible recovery option exists, state that clearly instead of fabricating a workable schedule.

### 12. Add a controlled schedule-change workflow

Schedule changes must follow a review-and-approval process.

1. Record the reported issue or proposed change.
2. Calculate the current schedule state.
3. Generate potential adjustments.
4. Validate each option against dependencies and constraints.
5. Show the proposed changes and their consequences.
6. Allow the user to select, reject, or edit an option.
7. Recalculate the complete affected schedule.
8. Show any remaining conflicts.
9. Request confirmation before applying the changes.
10. Persist the approved changes atomically.

Preserve the original schedule where historical comparison is useful.

If the underlying schedule changes while a proposal is awaiting approval, mark the proposal stale and require recalculation or explicit resolution.

Never silently apply AI-generated changes.

### 13. Use AI responsibly

Use Module 03’s shared AI orchestration service.

AI may:
- Summarize the operational status.
- Explain schedule conflicts.
- Suggest recovery alternatives.
- Draft instructions for event staff.
- Suggest questions to ask a delayed vendor.
- Identify potential omissions based on the event context.
- Summarize active incidents and outstanding decisions.

Application code must:
- Perform time calculations.
- Validate dependencies.
- Detect scheduling conflicts.
- Enforce authorization.
- Validate assignments.
- Validate structured AI output.
- Determine what changes are approved.
- Persist approved changes.

Use schema-validated structured output, such as the existing project’s Zod schemas.

Treat event notes, vendor messages, and user-entered incident descriptions as untrusted input.

Do not fabricate real-time vendor locations, arrival times, responses, availability, or external confirmations.

If the AI provider is unavailable, core run-sheet operations, progress tracking, and incident logging must continue to function.

### 14. Build an event-day communication support workflow

Where useful, let users prepare operational messages related to schedule changes.

Examples:
- Inform the catering coordinator that guest service may begin later.
- Ask the photographer to confirm their revised arrival estimate.
- Share an updated setup time with authorized event staff.

Messages should include only information the user chooses to share.

If an actual messaging integration exists, follow its authentication, consent, and delivery-confirmation process.

Otherwise, allow the user to preview and copy the message or open a supported contact channel.

Clearly distinguish:
- Drafted.
- Ready to copy.
- Sent through a real integration.
- Delivery confirmed, only if the provider supports that confirmation.

Never claim that an external message was sent or received when the app only generated text.

### 15. Add an operational history

Maintain a useful history of significant schedule and incident changes.

Record relevant information such as:
- Original schedule values.
- Approved revised values.
- Status transitions.
- Delay reports.
- Incident creation and resolution.
- Who made a change, where supported.
- Timestamps.
- The reason for a change.
- Related approved proposal IDs.

Use the existing project’s history or audit mechanism if available.

Do not create unnecessary duplicate audit systems.

Keep a clear distinction between an original planned time, a revised approved time, and the actual time an activity started or finished.

Historical records must not be silently overwritten by routine edits.

### 16. Integrate with existing modules

**Module 01 — Dashboard**
- Reflect event-day progress, unresolved incidents, and relevant upcoming activities where appropriate.
- Use authoritative stored records.

**Module 02 — Event Setup**
- Use the event date, timezone, location, and event preferences.
- Re-evaluate the schedule when event details change.

**Module 03 — AI Planning Engine**
- Use the shared AI orchestration and structured output validation.

**Module 04 — Budget Management**
- Reference relevant budget information when it affects an operational decision.
- Do not independently change financial records.

**Module 05 — Adaptive Budget Simulator**
- Reflect approved plan changes when they require event-day schedule review.
- Do not treat a draft budget scenario as an approved operational change.

**Module 06 — Task & Timeline Management**
- Reuse task records and dependency logic.
- Keep task completion and run-sheet execution status consistent where the two represent the same activity.
- Avoid duplicate tasks and conflicting status sources.

**Module 07 — Vendor & Quotation Management**
- Reference actual vendor records and recorded booking statuses.
- Surface relevant confirmed information and outstanding confirmations.
- Do not imply that a booking is confirmed merely because a vendor appears in the run sheet.

### 17. Backend and persistence requirements

Follow the existing API conventions and implement only the necessary new entities and endpoints.

Support capabilities equivalent to:
- Retrieve an event run sheet.
- Create, edit, reorder, and cancel run-sheet items.
- Record activity progress.
- Create and update incidents.
- Retrieve unresolved incidents.
- Generate schedule-impact analyses.
- Create and review recovery proposals.
- Apply approved schedule changes.
- Retrieve operational history.

Requirements:
- Typed request and response schemas.
- Server-side validation.
- Database migrations where required.
- Authorization on every event and run-sheet operation.
- Validation of task, vendor, and activity references.
- Atomic updates when multiple activities change together.
- Safe concurrent-update handling.
- Idempotency for repeated actions where necessary.
- Clear error responses.
- Bounded queries for larger events.

Never trust client-calculated schedule status or AI-provided identifiers as authoritative.

### 18. Security, accessibility, and reliability

Implement:
- Event-level access control.
- Protection against cross-event record manipulation.
- Safe handling of user-entered instructions and vendor messages.
- Server-side validation of AI-generated proposals.
- Secure storage of operational notes and contact information.
- Clear error handling without exposing secrets or stack traces.

Accessibility requirements:
- Semantic headings and form labels.
- Keyboard-operable schedule and incident controls.
- Visible focus indicators.
- Status indicators that do not rely on color alone.
- Accessible alternatives to drag-and-drop reordering.
- Screen-reader-friendly timeline and alert summaries.
- Responsive layouts for phones, tablets, and desktops.
- Clear loading, empty, stale-proposal, and error states.

Optimize the primary event-day interface for quick scanning and minimal interaction overhead.

### 19. Testing requirements

Use the project's existing test framework.

**Unit tests**
- Timezone-aware schedule calculations.
- Activity duration calculations.
- Overlap detection.
- Dependency validation.
- Delay-impact analysis.
- Critical and high-priority warning rules.
- Status transitions.
- Schedule proposal validation.
- Stale proposal detection.
- Preservation of original and actual times.

**Integration tests**
- Run-sheet CRUD operations.
- Authorization and cross-event access prevention.
- Incident creation and resolution.
- Atomic multi-activity updates.
- Schedule proposal generation and approval.
- Concurrency conflicts.
- AI provider failure.
- Task/run-sheet synchronization.
- Operational history preservation.

**End-to-end tests**
1. Open an existing event with scheduled tasks.
2. Generate or create a run sheet from approved event data.
3. Mark an activity in progress and then complete it.
4. Report a delay affecting a dependent activity.
5. Review the impact analysis.
6. Compare recovery options.
7. Approve a proposed schedule change.
8. Verify the updated run sheet and preserved history.
9. Create and resolve an incident.
10. Confirm unauthorized users cannot access operational records.
11. Verify core functionality remains usable when the AI provider is unavailable.
12. Test the operational interface on mobile and with keyboard navigation.

Run the relevant checks and report actual results. Do not claim tests pass unless they have been executed.

### 20. Acceptance criteria

The module is complete when:

- Users can create and manage a persisted event-day run sheet.
- Activities display in the correct event timezone.
- Progress and incident states update reliably.
- Existing tasks can be referenced without unnecessary duplication.
- Delays trigger a useful schedule-impact analysis.
- Recovery options are validated and reviewable.
- AI-generated changes require explicit user approval.
- Conflicting or infeasible schedules are clearly identified.
- Original, revised, and actual activity times are distinguishable.
- Vendor and task references reflect real application data.
- Operational history is preserved.
- Dashboard integration works correctly.
- Authorization, error handling, and accessibility are implemented.
- Automated tests cover the critical workflows.
- No external action is falsely represented as completed.

### 21. Implementation workflow

Proceed in this order:

1. Inspect the project and Modules 01–07.
2. Identify existing task, timeline, vendor, and event models.
3. Define run-sheet, incident, and schedule-proposal contracts.
4. Implement persistence and authorization.
5. Build the chronological run sheet and Now & Next views.
6. Implement progress tracking and incident management.
7. Add deterministic schedule-impact analysis.
8. Integrate AI-assisted recovery suggestions through Module 03.
9. Implement review, approval, and schedule history.
10. Integrate with the dashboard and existing task records.
11. Add automated tests.
12. Run linting, type checks, builds, and relevant tests.
13. Fix regressions and verify the complete workflow.

Provide a final implementation report containing:
- Features implemented.
- Files and migrations changed.
- Integration with Modules 01–07.
- Scheduling and incident-handling behavior.
- Tests executed and actual results.
- Remaining limitations or unfinished work.

**Final product principle:** On event day, Quveta should be a calm, trustworthy coordination assistant—not another source of confusion. It should make the next action clear, explain the impact of unexpected changes, and help the organizer stay in control.