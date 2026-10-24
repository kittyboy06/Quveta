# Module 06 — Task & Timeline Management
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build a fully functional Task & Timeline Management module for Quveta, an AI-powered event-planning application.

The module transforms an event plan into an actionable, time-aware workflow. Users must be able to see upcoming work, manage deadlines, track progress, identify dependencies and blockers, and understand the consequences when a task is delayed or an event date changes.

**Core user story:**

“I have an event coming up. Tell me what needs to happen, what I should do first, what is at risk, and how to recover if something gets delayed.”

For example, if a venue booking is delayed, Quveta should identify dependent tasks—such as finalizing the floor plan, confirming catering logistics, and arranging venue-specific decoration—and explain which deadlines may need attention.

These dependencies must come from stored task relationships or explicitly validated planning assumptions, not invented certainty.

This module must work with real persisted event and task data. Do not build a static timeline, nonfunctional task board, or decorative calendar.

### 2. Inspect and integrate with the existing codebase

Before making changes:

1. Inspect the repository, existing modules, database schema, API patterns, authentication, UI components, and test setup.
2. Reuse the current technology stack and established project conventions.
3. Integrate with Modules 01–05 instead of duplicating their responsibilities.
4. Reuse the AI orchestration service from Module 03 when AI reasoning is needed.
5. Preserve existing event details, budget records, approved plans, and scenario history.
6. Implement incrementally, keeping the application runnable.

Do not replace working infrastructure or introduce unnecessary dependencies.

### 3. Define module ownership

Maintain clear boundaries:

- **Module 02 — Event Setup:** owns event details, event date, timezone, and preferences.
- **Module 03 — AI Planning Engine:** generates and refines structured planning proposals.
- **Module 04 — Budget Management:** owns financial records and authoritative calculations.
- **Module 05 — Adaptive Budget Simulator:** owns budget scenarios and approved budget adjustments.
- **Module 06 — Task & Timeline Management:** owns tasks, assignments, statuses, dependencies, due dates, timeline calculations, and schedule-impact analysis.
- **Module 01 — Dashboard:** displays aggregated task progress, overdue items, and upcoming deadlines.

The task module may consume approved plans and budget information, but it must not independently modify the budget or overwrite approved event plans.

### 4. Implement a complete task management system

Users must be able to create, view, edit, complete, reopen, and cancel tasks associated with an event.

Each task should support fields equivalent to:

- Unique task ID.
- Event ID.
- Title.
- Description.
- Category.
- Status.
- Priority.
- Start date, when applicable.
- Due date and time, when applicable.
- Event timezone or a reliable reference to the event timezone.
- Estimated duration.
- Actual completion timestamp, where applicable.
- Assignee or responsible person, when supported.
- Dependency relationships.
- Source, such as user-created, approved AI plan, or imported plan.
- Notes.
- Creation and update timestamps.
- Optional completion criteria.
- Optional risk or blocker explanation.

Use typed models and the existing persistence conventions. Adapt field names to the codebase rather than creating duplicate models.

**Suggested task statuses:**
- Not started.
- In progress.
- Blocked.
- Completed.
- Cancelled.

**Suggested priority levels:**
- Critical.
- High.
- Medium.
- Low.

Use a consistent status model throughout the application.

Provide task creation and editing forms with appropriate validation. Preserve user-entered information when validation or network requests fail.

Completing a task must persist the change and update relevant task progress metrics.

### 5. Build task categories and event-specific workflows

Support useful categories such as:

- Venue and logistics.
- Catering.
- Decoration.
- Photography and video.
- Entertainment.
- Invitations and guest management.
- Accommodation and transport.
- Attire and preparation.
- Permits and documentation.
- Accessibility and guest requirements.
- Payments and confirmations.
- Event-day coordination.
- Cleanup and post-event activities.
- Other.

Allow custom categories where appropriate.

When Module 03 generates a plan, its proposed tasks should be validated and presented for review before being committed if the existing planning workflow requires approval.

Prevent duplicate tasks when the same approved plan is imported or refreshed.

Do not regenerate the entire task list whenever an event preference changes. Preserve existing user-created tasks, completed work, assignments, and approved decisions.

If a new plan introduces tasks that conflict with existing work, identify the conflict and ask for resolution rather than silently deleting or replacing tasks.

### 6. Implement task dependencies correctly

Tasks should support explicit prerequisite relationships.

Examples:

- Finalize the guest count before confirming final catering quantities.
- Confirm the venue before completing venue-specific layout arrangements.
- Confirm the ceremony schedule before finalizing the event-day run sheet.
- Complete the invitation design before distributing invitations.

These are examples, not universal rules. Dependencies must reflect the event type and actual plan.

Implement a directed dependency graph.

Requirements:

- A task can depend on multiple prerequisite tasks.
- A task can have multiple downstream dependents.
- Completing a prerequisite updates the dependent task’s readiness.
- An incomplete prerequisite must be visible when it blocks downstream work.
- Detect and reject dependency cycles.
- Prevent a task from depending on itself.
- Validate that dependency references belong to the same event unless cross-event dependencies are explicitly supported.
- Do not automatically mark a dependent task completed when its prerequisite is completed.
- Allow authorized users to edit or remove dependencies.

Distinguish between:

- **Blocked:** a prerequisite or external condition prevents progress.
- **At risk:** the task may miss its deadline because of limited time or a threatened dependency.
- **Ready:** prerequisites are satisfied and the task can proceed.
- **Overdue:** the task’s deadline has passed and the task is not completed or cancelled.

These states should be derived consistently from persisted task data and the current time. Where a task is manually marked blocked, preserve the user-provided blocker explanation.

### 7. Build the timeline and calendar views

Create useful views of the same underlying task data:

**A. Timeline view**
- Show tasks in chronological order.
- Display start and due dates where available.
- Show milestone dates.
- Make dependencies and critical deadlines easy to identify.
- Clearly distinguish overdue, blocked, completed, and upcoming work.
- Handle tasks without dates without inventing a date.

**B. Calendar view**
- Support an appropriate day, week, or month view based on the existing UI framework.
- Allow users to navigate dates.
- Show task titles and due times where applicable.
- Provide an accessible alternative to visual calendar interactions.
- Use the event timezone consistently.

**C. Task list**
- Search by title and description.
- Filter by status, priority, category, assignee, and date range where supported.
- Sort by due date, priority, status, or recently updated.
- Offer a useful default sort prioritizing overdue and critical upcoming tasks.

**D. Optional board view**
- If feasible within the current stack, provide a status-based board.
- Moving a task between columns must persist the change.
- Ensure keyboard and screen-reader users can perform the same operation without drag-and-drop.

All views must use the same underlying task records and authoritative status logic.

### 8. Implement deterministic deadline and scheduling logic

Use application code—not the AI model—for date arithmetic, dependency validation, deadline comparisons, and schedule calculations.

Account for:

- Event timezone.
- Date-only versus timed deadlines.
- Daylight-saving transitions where relevant to the selected timezone.
- Tasks without a start date.
- Tasks without a due date.
- Completed and cancelled tasks.
- Estimated task duration.
- Dependency relationships.
- Existing deadlines and user-approved constraints.

Do not assume every task needs a specific time of day.

Avoid comparing date strings or timestamps inconsistently. Use a reliable date/time library if the project already has one or a justified dependency is required.

Clearly distinguish:
- A user-defined deadline.
- An AI-suggested target date.
- A calculated scheduling recommendation.
- A confirmed external appointment or booking.

Do not imply that Quveta has reserved a vendor, booked a venue, sent an invitation, or completed an external action unless a real integration confirms it.

### 9. Create a schedule-impact and recovery workflow

This is an important differentiator.

When a user changes a task’s due date, changes the event date, or reports a delay, Quveta should identify potential consequences instead of merely changing the displayed date.

The workflow should:

1. Record the proposed change.
2. Identify direct dependents and relevant downstream tasks.
3. Determine which deadlines may now be infeasible or at risk.
4. Check dependency order and available scheduling information.
5. Identify milestones affected by the change.
6. Present a proposed recovery plan.
7. Allow the user to review and approve any suggested rescheduling.
8. Persist approved changes without silently overwriting unrelated tasks.

For example, if venue confirmation is delayed, the system might flag venue-specific layout planning as blocked and warn that decoration setup has less available lead time.

It should distinguish a confirmed dependency from a possible operational impact. If the task graph lacks sufficient information, ask a clarification question or label the relationship as a suggested dependency.

**Never automatically move every downstream task without user review.**

Provide a schedule-impact summary that includes:
- The original deadline.
- The proposed deadline.
- Directly affected tasks.
- Downstream tasks at risk.
- Conflicting dependencies.
- Milestones that may be affected.
- Recommended next actions.
- Assumptions and unresolved questions.

### 10. Use AI for reasoning, not authoritative scheduling

Use Module 03’s existing AI orchestration service for context-aware recommendations when appropriate.

AI may:
- Suggest missing tasks based on event type and preferences.
- Explain why a task matters.
- Recommend task priorities.
- Suggest dependencies for user review.
- Propose a recovery plan after a delay.
- Identify potentially overlooked operational requirements.
- Explain the trade-offs of different scheduling options.

Deterministic application logic must:
- Validate task identifiers.
- Validate dependencies and prevent cycles.
- Perform date arithmetic.
- Calculate deadline and lateness states.
- Determine whether prerequisites are satisfied.
- Check hard constraints.
- Persist approved task changes.
- Enforce permissions.

AI recommendations must use structured, schema-validated output. Reject malformed or unauthorized task references.

The model must not invent confirmed vendor bookings, regulatory approvals, venue availability, supplier response times, or guaranteed task durations.

When lead-time information is unavailable, label it as an assumption and let the user review it.

If the AI provider fails, task CRUD, completion, filtering, and existing timeline views must continue working.

### 11. Add event-date change handling

When a user changes an event date in Module 02:

- Identify tasks and milestones whose schedules may be affected.
- Highlight deadlines that now fall after the event date where that ordering is inappropriate.
- Flag potentially infeasible lead times.
- Preserve completed tasks and historical records.
- Generate a schedule-review proposal instead of silently rescheduling everything.
- Let the user review and approve recommended date changes.
- Clearly show tasks that remain unchanged and why.

Do not assume all tasks must be scheduled relative to the event date. Some may depend on vendor availability, legal deadlines, or user-selected fixed dates.

If the event date is removed or unknown, retain valid task dates and clearly indicate that event-relative scheduling cannot be fully evaluated.

### 12. Support responsible assignments and collaboration

If Quveta already supports users, teams, or event collaborators, integrate with the existing authorization and membership model.

Where supported, allow:
- Assigning a task to an authorized collaborator.
- Viewing tasks assigned to the current user.
- Displaying the responsible person.
- Filtering by assignee.
- Recording assignment changes.

If collaboration infrastructure does not exist, keep assignments optional and avoid implementing a separate authentication system just for this module.

Never expose tasks or event information to unauthorized users.

### 13. Integrate with the dashboard and existing modules

After task changes are saved, update the relevant dashboard summaries and event detail views.

Integrations should include:

- Module 01: outstanding tasks, overdue tasks, upcoming deadlines, task progress.
- Module 02: event date, timezone, and event-specific constraints.
- Module 03: approved task proposals and AI-generated schedule recommendations.
- Module 04: relevant payment deadlines or financial task references where available.
- Module 05: approved budget changes that may require task or deadline review.

For example, a budget adjustment that changes the planned scope of an event may warrant a task review. Do not automatically change unrelated task records.

Use the existing event and task identifiers. Avoid duplicating task state across modules.

### 14. Backend, persistence, and API requirements

Follow existing API conventions and add only the required schema changes.

Support capabilities equivalent to:
- Retrieve tasks for an authorized event.
- Create, update, complete, reopen, or cancel a task.
- Manage task dependencies.
- Retrieve task timelines and calendar data.
- Generate a schedule-impact proposal.
- Review and apply approved rescheduling changes.
- Retrieve relevant task history where supported.

Implement:
- Request and response validation.
- Database migrations.
- Authorization checks on every event and task operation.
- Transactional updates for changes involving multiple dependent tasks.
- Consistent error responses.
- Pagination or bounded retrieval where appropriate.
- Safe concurrent-update handling.
- Idempotency where repeated requests could duplicate operations.
- Clear separation of database access and business logic.

Do not trust client-computed dependency states or deadline classifications as authoritative.

### 15. Security, accessibility, and reliability

Ensure:
- Users can access only events and tasks they are authorized to access.
- Task and dependency identifiers are validated server-side.
- AI-generated content is treated as untrusted until validated.
- User-entered descriptions cannot trigger unauthorized tool actions.
- Provider secrets are never exposed to the frontend.
- Errors do not reveal stack traces or secrets.
- Existing tasks remain available when AI features fail.

Accessibility requirements:
- Semantic form labels and headings.
- Keyboard-operable task actions.
- Visible focus indicators.
- Screen-reader-friendly status and priority labels.
- Accessible alternatives to drag-and-drop.
- Sufficient contrast and no reliance on color alone.
- Responsive task lists, timelines, and calendar views.
- Clear loading, empty, validation, and error states.

### 16. Testing requirements

Add tests using the existing testing framework.

**Unit tests**
- Task status derivation.
- Overdue detection and timezone handling.
- Dependency readiness.
- Dependency cycle rejection.
- Self-dependency rejection.
- Multiple prerequisite handling.
- Completed and cancelled task behavior.
- Event-date change analysis.
- Schedule-impact calculations.
- Missing dates and unknown durations.
- Priority-based sorting.
- AI output validation.

**Integration tests**
- Task creation, update, completion, reopening, and cancellation.
- Dependency creation and deletion.
- Authorization for event and task operations.
- Atomic updates involving multiple tasks.
- Stale concurrent updates.
- Schedule-impact proposal creation and approval.
- AI provider failure.
- Dashboard metrics reflecting task changes.
- Prevention of duplicate tasks during plan refresh.

**End-to-end tests**
1. Open an existing event.
2. Create a task with a due date.
3. Add a prerequisite task.
4. Verify the dependent task shows its readiness or blocker.
5. Complete the prerequisite and verify the dependent task becomes eligible to proceed.
6. Delay the prerequisite and inspect the impact summary.
7. Review and approve a proposed recovery plan.
8. Verify only approved changes are persisted.
9. Change the event date and review affected deadlines.
10. Confirm dashboard progress and overdue counts update correctly.
11. Verify unauthorized users cannot view or modify tasks.
12. Confirm task management still works when the AI provider is unavailable.

Run the relevant tests and report actual results. Do not claim unexecuted tests pass.

### 17. Acceptance criteria

The module is complete when:

- Users can create, edit, complete, reopen, and cancel persisted tasks.
- Tasks can be viewed in useful list and timeline interfaces.
- Due dates, priorities, statuses, and dependencies are consistently validated.
- Dependency cycles are prevented.
- Blocked, at-risk, and overdue states are distinguishable.
- Event-date changes identify potentially affected tasks.
- Delays produce an understandable impact analysis.
- Recovery recommendations are reviewable and never silently applied.
- AI-generated tasks and dependencies are validated.
- The dashboard reflects authoritative task data.
- Existing approved plans and completed work are preserved.
- Authorization, error handling, and accessibility are implemented.
- Relevant automated tests pass.
- No external booking or action is falsely represented as completed.

### 18. Implementation workflow

Proceed in this order:

1. Inspect the existing project and Modules 01–05.
2. Report the existing task model, integration points, and gaps.
3. Define typed task, dependency, and schedule-impact contracts.
4. Implement task persistence and CRUD operations.
5. Implement deterministic dependency and deadline logic.
6. Build the task list, timeline, and calendar interfaces.
7. Integrate AI-assisted task and recovery recommendations through Module 03.
8. Implement review and approval of schedule changes.
9. Integrate dashboard metrics and event-date changes.
10. Add automated tests.
11. Run linting, type checks, builds, and relevant test suites.
12. Fix regressions and verify the end-to-end workflow.

In your final implementation report, summarize:
- Features implemented.
- Files and migrations changed.
- Integration with Modules 01–05.
- Scheduling and dependency rules.
- Tests executed and their actual results.
- Remaining limitations or unfinished work.

**Product principle:** Quveta should not merely tell users what tasks exist. It should help them understand what matters now, what is blocked, what could go wrong next, and how to recover—while leaving important decisions in their hands.