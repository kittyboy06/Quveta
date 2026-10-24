# Module 13 — Notifications, Reminders & Automation
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build a reliable Notifications, Reminders & Automation module for Quveta, an AI-powered event-planning application.

The module helps event organizers stay ahead of deadlines, unanswered invitations, quotation expirations, unresolved issues, and important event changes.

It should turn meaningful changes in the existing application into timely, actionable notifications without overwhelming users or silently making decisions on their behalf.

**Core user story:**

“I don't want to constantly check every module to find out what needs attention. Notify me when something important happens, explain why it matters, and help me take the next step.”

Example: A vendor quotation is approaching its expiry date, several guests have not responded to their invitations, and a critical task is overdue. Quveta should notify the appropriate organizer, explain each issue, and provide a link to the relevant record.

Notifications must be based on real application data. Never generate fake events, deadlines, delivery confirmations, or vendor availability.

### 2. Inspect the existing project first

Before implementation:

1. Inspect the repository, architecture, database schema, authentication, existing background jobs, and notification integrations.
2. Review Modules 01–12 and identify available event, task, quotation, RSVP, communication, and AI services.
3. Reuse the established architecture and design system.
4. Check whether the project already has email, push, SMS, or in-app notification infrastructure.
5. Integrate with existing services rather than creating duplicate business logic.
6. Keep the application runnable throughout implementation.

Do not add an external notification provider unless it is needed and can be configured securely.

### 3. Define module ownership

Respect the existing module boundaries:

- Module 02 owns event details and preferences.
- Module 03 owns shared AI orchestration.
- Module 04 owns authoritative budget records.
- Module 05 owns budget scenarios and approved budget changes.
- Module 06 owns tasks, deadlines, and dependencies.
- Module 07 owns vendors, quotations, and booking records.
- Module 08 owns run sheets, incidents, and operational progress.
- Module 09 owns guest records and RSVP responses.
- Module 10 owns seating plans and assignments.
- Module 11 owns communication drafts, campaigns, and delivery history.
- Module 12 owns cross-module insights and AI recommendations.
- Module 13 owns notification records, reminder scheduling, user notification preferences, and automation execution history.

Module 13 should consume authoritative events and service results from the other modules. It must not duplicate their business rules or become a second source of truth.

### 4. Implement an in-app notification center

Build a persistent notification center accessible from the main application navigation.

Include:
- Unread notification count.
- Notification list.
- Read and unread states.
- Mark as read.
- Mark all as read.
- Dismiss or archive a notification.
- Filters by category and read status.
- Sorting by newest and urgency.
- Links to the relevant event or record.
- Empty, loading, and error states.

Each notification should support:
- Notification ID.
- User or authorized recipient ID.
- Event ID, where relevant.
- Category.
- Title.
- Short message.
- Severity or priority.
- Related entity type and ID.
- Creation timestamp.
- Read timestamp.
- Dismissal or archive status.
- Optional expiry timestamp.
- Optional deduplication key.

Validate referenced records before displaying links. A notification must never allow a user to access an event or record they are not authorized to view.

Use clear labels and accessible status indicators. Do not rely on color alone to communicate urgency.

### 5. Create event-driven notification rules

Generate notifications from actual application events or validated scheduled checks.

Support relevant triggers such as:

**Tasks and timeline — Module 06**
- A task is approaching its deadline.
- A task becomes overdue.
- A critical dependency becomes blocked.
- A schedule change creates a new risk.
- A task remains blocked beyond a configured threshold.

**Vendors and quotations — Module 07**
- A quotation is approaching its recorded expiry date.
- A requested quotation has not received a response by its follow-up date.
- A vendor booking status changes.
- Important quotation information remains incomplete.

**Run sheet and incidents — Module 08**
- A high-priority incident is reported.
- A critical run-sheet activity is delayed.
- An unresolved incident needs attention.
- An approved schedule change affects important activities.

**Guests and RSVPs — Module 09**
- An RSVP deadline is approaching.
- Guests remain unanswered after a configured point.
- Confirmed attendance changes materially.
- A guest requirement needs follow-up.

**Seating — Module 10**
- Confirmed attendance exceeds available seating capacity.
- A required seating arrangement is unresolved.
- A guest response invalidates an existing assignment.

**Communications — Module 11**
- An approved campaign fails to send.
- A delivery failure requires attention.
- A communication draft contains outdated event details.
- A scheduled campaign requires review.

**Budget and planning — Modules 04, 05, and 12**
- The authoritative budget exceeds its target.
- A budget scenario requires user review.
- An important planning risk is detected.
- A proposal remains unapproved near a relevant deadline.

Do not create notifications for every minor edit. Trigger them only when the event is meaningful and the rule's conditions are satisfied.

### 6. Build configurable reminders

Allow authorized users to configure reminders for an event.

Examples:
- Remind me one week before a task deadline.
- Remind me one day before a quotation expires.
- Notify me about unanswered RSVPs before the response deadline.
- Remind me to review unresolved incidents.
- Send me a morning summary of upcoming tasks.
- Notify me when a critical dependency becomes blocked.

Provide configurable timing where useful, such as minutes, hours, or days before a deadline.

Requirements:
- Respect the event timezone or the user's explicitly selected timezone as appropriate.
- Handle date-only deadlines consistently.
- Prevent duplicate reminder delivery.
- Cancel or reschedule reminders when the underlying record changes.
- Avoid sending reminders for completed, cancelled, or otherwise ineligible records.
- Respect quiet hours and channel preferences.
- Recalculate scheduled reminders when relevant dates change.

Do not assume that every event needs every reminder type enabled.

Provide sensible defaults that users can customize.

### 7. Implement a reliable background scheduling system

Use the project's existing background-job or scheduler infrastructure if available.

If no scheduler exists, implement a minimal, reliable scheduled-processing mechanism that fits the current deployment environment.

Requirements:
- Store scheduled reminders persistently.
- Process due reminders in bounded batches.
- Handle retries for transient failures.
- Prevent concurrent workers from sending the same reminder multiple times.
- Use idempotency keys or an equivalent deduplication mechanism.
- Record processing status and failure reason.
- Apply retry limits and backoff.
- Avoid endless retry loops.
- Recover safely after a restart.
- Handle timezone and daylight-saving transitions where relevant.
- Ensure scheduled jobs do not rely on an in-memory timer that disappears when a serverless request ends.

Possible reminder states include:
- Scheduled.
- Processing.
- Delivered.
- Failed.
- Cancelled.
- Skipped because the condition no longer applies.

Use only the states appropriate to the chosen delivery architecture.

If deployment infrastructure cannot support background processing reliably, document that limitation and implement a safe supported alternative rather than claiming that scheduled reminders work when they do not.

### 8. Support notification channels responsibly

Support in-app notifications first.

Where a real provider is available, extend the system to support channels such as:
- Email.
- Web push.
- SMS.
- Other explicitly configured messaging channels.

Use a channel abstraction so the notification rules are separate from the provider-specific delivery implementation.

For each channel:
- Require appropriate configuration and authorization.
- Store credentials securely on the server.
- Handle rate limits.
- Apply bounded retries.
- Record provider message IDs where available.
- Distinguish queued, accepted, delivered, and failed states according to the provider's actual capabilities.
- Respect consent and opt-out requirements.
- Prevent duplicate sends.

Do not simulate external delivery.

If no provider is configured, keep in-app notifications functional and show that external channels are unavailable or not configured.

An in-app notification being created does not mean an email or SMS was sent.

### 9. Create an automation rules interface

Allow users to configure supported automation rules through a simple interface.

Each rule should include:
- Rule ID.
- Name.
- Event or workspace scope.
- Trigger.
- Conditions.
- Action.
- Enabled or disabled status.
- Applicable recipients.
- Delivery channel.
- Timing or scheduling configuration.
- Created and updated timestamps.
- Last execution status, where available.

Example rule:

**Trigger:** A task becomes overdue.

**Condition:** The task belongs to an active event and has not been completed or cancelled.

**Action:** Create an in-app notification for the authorized event organizer.

Another example:

**Trigger:** A quotation approaches its recorded expiry date.

**Condition:** The quotation is still relevant, and its status is not rejected, cancelled, or superseded.

**Action:** Notify the organizer and link to the quotation.

Start with a finite list of supported triggers and actions. Do not build an unrestricted workflow engine unless the existing architecture already supports one.

Validate every rule before saving it.

Prevent unsupported actions, invalid conditions, and rules that would create infinite loops.

### 10. Separate notifications from automatic actions

Notifications and automation must not bypass user approval.

Safe actions may include:
- Creating an in-app notification.
- Preparing a reminder draft.
- Linking to a task.
- Generating a summary.
- Marking a scheduled reminder as no longer applicable.

Potentially consequential actions must require explicit authorization and appropriate confirmation, including:
- Sending bulk messages.
- Changing an approved budget.
- Reassigning guests.
- Applying a schedule revision.
- Cancelling a booking.
- Altering a vendor commitment.

If an automation rule can perform an external action, show exactly what it does, the triggering conditions, and the configured recipients before enabling it.

Use an allowlist of supported actions. Never execute arbitrary code or unrestricted model-generated instructions.

### 11. Integrate with the AI Event Insights Assistant

Use Module 12 to explain and summarize notifications when helpful.

Examples:
- Explain why a task is considered urgent.
- Summarize the effect of a blocked dependency.
- Recommend what to review after a quotation expires.
- Summarize several related guest-response issues.
- Group related warnings into a useful event overview.

AI may help prioritize and explain evidence-backed issues.

Deterministic application code must determine:
- Whether a task is overdue.
- Whether a quotation has expired.
- Whether an RSVP deadline has passed.
- Whether a budget exceeds its target.
- Whether a seating configuration is invalid.
- Whether a notification should be deduplicated.
- Whether a reminder is still eligible to run.

Do not ask the AI model to invent deadlines or independently determine authoritative statuses.

When the AI provider fails, basic notification creation, scheduling, delivery tracking, and read-state management must continue working.

### 12. Prevent notification fatigue

Quveta should be helpful, not noisy.

Implement:
- Deduplication of equivalent notifications.
- Configurable reminder frequency.
- Per-category notification preferences.
- Quiet hours where appropriate.
- A way to mute noncritical categories.
- Grouping of related low-priority notifications.
- Suppression of reminders after the underlying issue is resolved.
- Limits on repeated reminders.
- Clear separation between critical alerts and routine reminders.

Do not suppress critical issues solely because the user has muted routine notifications, unless the user's configuration explicitly permits that behavior and it remains safe.

Define transparent severity rules.

For example:
- Critical: requires urgent attention.
- High: important issue with meaningful consequences.
- Normal: routine planning reminder.
- Informational: useful update without immediate action.

Use severity levels only when the underlying rule supports them.

### 13. Add a notification preference center

Allow users to configure:
- Enabled notification categories.
- Preferred channels.
- Quiet hours.
- Reminder lead times.
- Daily summary preferences.
- Event-specific overrides.
- Routine notification frequency.
- Optional email or push preferences where supported.

Use the existing user and workspace settings model.

Distinguish global defaults from event-specific preferences.

Validate timezone settings and configuration values.

Do not allow a user to change notification preferences for another user without the appropriate permissions.

If the application does not yet support multi-user collaboration, implement preferences for the current authenticated user and avoid inventing a separate account model.

### 14. Build notification summaries

Provide an optional daily or periodic summary that groups important updates.

A summary might contain:
- Upcoming deadlines.
- Overdue tasks.
- Vendor quotations requiring attention.
- Guests awaiting responses.
- Unresolved seating issues.
- Active incidents.
- Important changes since the previous summary.

Generate the summary from authoritative records and include links to the relevant modules.

Allow the user to configure whether summaries are in-app only or delivered through an available provider.

Avoid sending empty or repetitive summaries.

Do not describe an issue as unresolved if the underlying record has already been updated to resolve it.

### 15. Integrate across Modules 01–12

Use the existing services and records.

**Module 01 — Dashboard**
- Show unread notifications and important reminders.

**Module 02 — Event Setup**
- Use the authoritative event date and timezone.
- Reschedule relevant reminders when event details change.

**Module 03 — AI Planning Engine**
- Reuse existing AI orchestration only where needed.

**Module 04 — Budget Management**
- Use authoritative budget warning conditions.

**Module 05 — Adaptive Budget Simulator**
- Notify users when a scenario awaits review or becomes stale.

**Module 06 — Task & Timeline Management**
- Trigger reminders from real task states and deadlines.

**Module 07 — Vendor & Quotation Management**
- Track quotation expiry and follow-up dates.

**Module 08 — Event-Day Coordination**
- Surface important incidents and schedule deviations.

**Module 09 — Guest Management & RSVP Tracking**
- Trigger appropriate RSVP reminders using actual response data.

**Module 10 — Seating Planner**
- Notify users about unresolved seating conflicts.

**Module 11 — Invitations & Event Communications**
- Reflect actual campaign and delivery outcomes.

**Module 12 — AI Event Insights**
- Explain and group evidence-backed notifications.

Avoid duplicated rules and conflicting status calculations across modules.

### 16. Backend, persistence, and API requirements

Follow existing project conventions and introduce only the necessary database structures and endpoints.

Support capabilities equivalent to:
- Retrieve authorized notifications.
- Mark notifications as read.
- Archive notifications.
- Update notification preferences.
- Create and manage reminder rules.
- Schedule and cancel reminders.
- Process due reminders.
- Record delivery attempts.
- Retry eligible failures.
- Retrieve automation execution history.
- Generate event summaries.

Requirements:
- Typed request and response schemas.
- Server-side validation.
- User and event authorization.
- Persistent scheduled-job state.
- Atomic claim or locking behavior for workers.
- Idempotent delivery processing.
- Bounded retries and backoff.
- Rate limiting.
- Secure provider configuration.
- Consistent error handling.
- Appropriate indexes for due-job queries.
- Retention rules for old notification and execution records.

Do not trust client-supplied delivery status or execute actions solely because the AI recommends them.

### 17. Security, privacy, and accessibility

Implement:
- Authorization checks on notification and preference records.
- Protection against cross-event access.
- Secure provider credentials.
- Safe handling of user-generated notification content.
- Webhook signature verification where applicable.
- Minimal logging of personal information.
- Protection against malicious automation configuration.
- Clear error messages without secrets or stack traces.

Accessibility requirements:
- Keyboard-operable notification controls.
- Accessible unread and severity indicators.
- Screen-reader-friendly notification announcements.
- Visible focus indicators.
- Clear labels for preference controls.
- Responsive notification center.
- Accessible confirmation dialogs.
- Loading, empty, and error states.

Avoid repeatedly announcing every low-priority background update to screen readers.

### 18. Testing requirements

Use the existing testing framework.

**Unit tests**
- Notification eligibility.
- Deduplication.
- Reminder timing.
- Timezone and date handling.
- Quiet-hour rules.
- Retry and backoff logic.
- Preference resolution.
- Rule validation.
- Suppression after an issue is resolved.
- Severity classification.
- Idempotency behavior.

**Integration tests**
- Notification creation and retrieval.
- Read and archive actions.
- Authorization.
- Persistent job scheduling.
- Concurrent job processing.
- Provider failure and retry handling.
- Preference overrides.
- Reminder cancellation after task completion.
- RSVP reminder eligibility.
- Quotation expiry notifications.
- AI provider failure.
- Webhook validation where applicable.

**End-to-end tests**
1. Create a task with an upcoming deadline.
2. Verify the appropriate reminder is scheduled.
3. Complete the task and verify the reminder is cancelled or suppressed.
4. Create a quotation with an expiry date.
5. Verify the configured reminder is generated at the correct time.
6. Trigger an overdue-task notification and mark it as read.
7. Change notification preferences and verify the change takes effect.
8. Simulate a provider failure and verify retries do not create duplicate messages.
9. Verify resolved issues no longer trigger routine reminders.
10. Verify unauthorized users cannot access another user's notifications.
11. Confirm core in-app notification behavior works without an external provider.
12. Verify automation rules cannot execute unapproved consequential actions.

Run the relevant tests and report actual results. Do not claim unexecuted tests pass.

### 19. Acceptance criteria

The module is complete when:

- Notifications are created from real application records.
- The in-app notification center persists read and unread states.
- Users can configure relevant reminder preferences.
- Scheduled reminders survive server restarts when supported by the chosen architecture.
- Duplicate reminders and duplicate sends are prevented.
- Completed or cancelled records suppress ineligible reminders.
- External delivery statuses reflect actual provider results.
- Automation rules use a validated, supported action set.
- Consequential actions require appropriate confirmation.
- AI explanations are grounded in authoritative data.
- Module integrations use existing source-of-truth services.
- Privacy, security, accessibility, and error handling are implemented.
- Relevant automated tests pass.
- No fake message delivery or unexecuted automation is presented as successful.

### 20. Implementation workflow

Proceed in this order:

1. Inspect the project and Modules 01–12.
2. Identify existing notification, background-job, and provider capabilities.
3. Define notification, reminder, preference, and automation-rule contracts.
4. Implement persistence and authorization.
5. Build the in-app notification center.
6. Implement deterministic triggers and deduplication.
7. Implement persistent scheduling and retry behavior.
8. Add configurable rules and preferences.
9. Integrate available external channels where genuinely supported.
10. Add AI-assisted summaries through Module 12.
11. Integrate notification triggers with existing modules.
12. Add automated tests.
13. Run linting, type checks, builds, and relevant tests.
14. Fix regressions and verify the end-to-end workflow.

In the final implementation report, summarize:
- Features implemented.
- Files and migrations changed.
- Notification channels actually configured.
- Scheduling and retry architecture.
- Integrations completed.
- Tests executed and their actual results.
- Remaining limitations or unfinished work.

**Product principle:** Quveta should notify users when it genuinely helps them make a better decision or take timely action—not simply because another database field changed.