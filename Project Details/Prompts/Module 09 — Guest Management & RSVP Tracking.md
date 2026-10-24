# Module 09 — Guest Management & RSVP Tracking
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build a complete, functional Guest Management & RSVP Tracking module for Quveta, an AI-powered event-planning application.

The module helps event organizers maintain an accurate guest list, manage invitations and responses, record relevant guest requirements, track attendance, and understand how guest-count changes affect catering, seating, transport, and the event budget.

**Core user story:**

“I need to know who is invited, who is attending, how many people to plan for, what guests need, and what changes when someone responds or updates their RSVP.”

Example: An organizer plans an event for 200 guests. Several invitees decline, a family confirms additional attendees, and a guest reports an accessibility requirement. Quveta should update the relevant RSVP records, calculate the revised attendance count, identify affected planning assumptions, and help the organizer review any resulting changes.

Guest responses must be based on recorded information—not AI guesses.

This module must use persisted records and real application logic. Do not build a static guest table, simulated invitation delivery, or fabricated RSVP responses.

### 2. Inspect the existing project first

Before implementation:

1. Inspect the repository, architecture, database schema, authentication, UI components, API conventions, and test framework.
2. Review Modules 01–08 and identify reusable event, budget, task, vendor, and coordination services.
3. Reuse the existing design system, data models, validation, and authorization patterns.
4. Preserve existing event plans, budget records, task history, and approved changes.
5. Implement incrementally while keeping the application runnable.

Do not replace working infrastructure or introduce duplicate systems for event management, scheduling, or AI orchestration.

### 3. Define module ownership

Maintain clear module boundaries:

- **Module 02 — Event Setup:** owns event details, event date, guest-count planning assumptions, currency, location, and preferences.
- **Module 03 — AI Planning Engine:** provides shared AI orchestration and structured recommendations.
- **Module 04 — Budget Management:** owns authoritative budget records and financial calculations.
- **Module 05 — Adaptive Budget Simulator:** owns budget scenarios and approved budget changes.
- **Module 06 — Task & Timeline Management:** owns tasks, deadlines, dependencies, and schedule calculations.
- **Module 07 — Vendor & Quotation Management:** owns vendors, quotations, and recorded booking information.
- **Module 08 — Event-Day Coordination:** owns the run sheet, operational progress, and incident tracking.
- **Module 09 — Guest Management & RSVP Tracking:** owns guest records, invitation records, RSVP responses, guest-group relationships, and attendance calculations.
- **Module 01 — Dashboard:** displays relevant guest counts and planning summaries.

Guest Management must calculate actual attendance from guest and RSVP records. Module 02's guest count remains the event's planning target unless the existing application explicitly establishes a different ownership model.

Clearly distinguish the **planned guest count** from **invited guests**, **confirmed attendees**, **declined invitations**, and **unknown responses**.

### 4. Implement guest records

Allow authorized users to create, view, edit, search, archive, and restore guest records associated with an event.

Each guest record should support fields equivalent to:

- Guest ID.
- Event ID.
- First name.
- Last name, when available.
- Preferred display name.
- Email address, when provided.
- Phone number, when provided.
- Guest group or household association.
- Invitation status.
- RSVP status.
- Number of attendees represented by the record.
- Relationship or guest category, when useful.
- Meal preference.
- Dietary requirements.
- Accessibility requirements.
- Other organizer-defined requirements.
- Private organizer notes.
- Record source, such as manual entry or imported file.
- Created and updated timestamps.
- Archived status.

Allow incomplete contact details. A guest must not need an email address or phone number merely to be added to the guest list.

Support individual guests and household or group invitations. Model relationships explicitly rather than storing multiple unrelated people in a single name field.

Where one invitation covers several people, provide a clear way to track the primary invitee, associated guests, and attendance response for each person when the data is available.

Do not assume that a household invitation means every household member will attend.

### 5. Build the guest list interface

Create a responsive guest-management interface with:

**Guest list**
- Guest display name.
- Guest group, where applicable.
- Invitation status.
- RSVP status.
- Party size.
- Meal preference, where relevant.
- Outstanding requirements indicator.
- Relevant response or update date.

**Search and filters**
- Search by guest name.
- Filter by RSVP status.
- Filter by invitation status.
- Filter by household or group.
- Filter by meal preference where useful.
- Filter by guests with outstanding requirements.
- Sort by name, response date, or status.

**Guest details**
- Contact details when available.
- Invitation history.
- RSVP history.
- Associated household members.
- Dietary and accessibility information.
- Relevant notes.
- Edit and archive actions.

Provide clear empty states, loading states, validation errors, and retry behavior.

Use pagination or bounded retrieval when needed for larger events.

### 6. Implement invitation and RSVP states

Maintain separate invitation and response states.

Suggested invitation statuses:
- Not invited.
- Invitation prepared.
- Invitation sent.
- Delivery confirmed, only when supported by an actual provider.
- Invitation failed.
- Invitation cancelled.

Suggested RSVP statuses:
- Awaiting response.
- Attending.
- Declined.
- Maybe or tentative.
- Response withdrawn, if supported by the chosen data model.

Do not collapse invitation status and RSVP status into one field. A guest may have received an invitation but not responded.

Allow authorized organizers to record or correct a guest's response manually, preserving the appropriate audit history.

If an invitation has not been sent, the application must not imply that it has.

If an invitation delivery provider is unavailable, manual invitation tracking must still work.

### 7. Build RSVP response capture

Support a reliable workflow for recording guest responses.

At minimum, authorized organizers must be able to:
- Mark a guest as attending.
- Mark a guest as declining.
- Record a tentative response.
- Return a guest to awaiting response when appropriate.
- Record the response date and source.
- Update party size.
- Correct an erroneous response.

If the application supports guest-facing RSVP links, implement secure, event-specific response access.

For guest-facing responses:
- Use unguessable, revocable tokens or an appropriate secure authentication mechanism.
- Avoid exposing the full guest list.
- Allow only the intended invitee or authorized household contact to update their response.
- Validate party-size limits.
- Prevent unauthorized event or guest modification.
- Provide clear confirmation after a response is successfully saved.
- Handle expired, revoked, or already-used links according to the chosen token design.

Do not expose sensitive dietary, accessibility, or contact information through public RSVP links.

If secure guest-facing links cannot be implemented in the current scope, provide organizer-managed RSVP entry and clearly identify guest self-service as unimplemented.

### 8. Calculate attendance accurately

Create a deterministic attendance calculation service.

Show separate counts for:
- Total guest records.
- Total people invited.
- Confirmed attendees.
- Declined attendees.
- Tentative attendees.
- Awaiting response.
- Total confirmed party size.
- Attendance target from Module 02.
- Remaining responses needed.

Define and document the counting rules.

For example, a confirmed household invitation representing four people should count as four confirmed attendees only if all four are explicitly included in the confirmed party size.

Do not count a household as a single attendee merely because it has one invitation record.

Do not count declined or tentative guests as confirmed attendees.

Avoid double-counting guests associated with multiple invitation records.

Distinguish between:
- Number of invitation records.
- Number of individual people.
- Number of confirmed attendees.

When guest data is incomplete or party size is unknown, display the uncertainty instead of inventing a number.

Keep attendance calculations on the backend or in the existing authoritative business-logic layer. Do not trust client-computed totals.

### 9. Implement guest groups and household management

Allow guests to be organized into groups such as:
- Family.
- Friends.
- Colleagues.
- Wedding party.
- Community members.
- Other custom groups.

Where supported, allow users to create household or party relationships and manage the primary contact.

Support moving guests between groups without creating duplicate records.

When a group invitation changes, make the impact on individual guest responses explicit.

Do not automatically overwrite individual responses when a household or group record changes.

If a guest is invited to multiple events, keep event-specific invitation and RSVP records separate while respecting the existing guest ownership model.

### 10. Add dietary and accessibility requirements

Allow organizers to record relevant guest needs, including:
- Vegetarian or other meal preferences.
- Allergies and dietary restrictions.
- Accessibility requirements.
- Mobility-related arrangements.
- Other event-specific requests.

Allow users to mark a requirement as confirmed, unconfirmed, or needing follow-up where appropriate.

Treat this information as potentially sensitive personal data.

Requirements:
- Collect only information needed to plan the event.
- Restrict access to authorized event participants.
- Do not expose sensitive details in public guest lists or general dashboards.
- Avoid including private information in AI prompts unless necessary and explicitly permitted by the application's privacy design.
- Provide a way to correct inaccurate information.
- Avoid making medical assumptions from a dietary or accessibility note.

Where appropriate, provide aggregate planning summaries, such as the number of vegetarian meals required, without exposing individual identities to users who do not need that information.

Do not treat an unconfirmed requirement as a verified instruction to a vendor.

### 11. Implement CSV import and export

If consistent with the existing project stack, support guest-list import and export.

**Import workflow**
1. Upload or select a supported CSV file.
2. Preview the file and detected columns.
3. Allow column mapping.
4. Validate rows before committing.
5. Display valid rows, warnings, and errors.
6. Identify likely duplicates.
7. Let the organizer resolve conflicts.
8. Confirm the import.
9. Report the actual number of created, updated, skipped, and rejected records.

Requirements:
- Validate file type and size.
- Prevent spreadsheet formula injection in exported or re-imported content.
- Handle commas, quotes, Unicode, and international names correctly.
- Preserve the original file during preview.
- Never silently discard invalid rows.
- Never merge guests solely because they share a name.
- Do not create duplicate guests when an import is repeated.

**Export workflow**

Allow authorized users to export appropriate guest-list fields.

Provide clear warnings and sensible field selection for sensitive contact, dietary, and accessibility information.

Exports must be generated from authorized records only. Do not expose guest information through public or guessable download URLs.

If file import/export cannot be implemented safely within the existing architecture, prioritize correct manual guest management and document the limitation.

### 12. Integrate with the budget and adaptive simulator

Guest-count changes can affect catering, seating, transport, accommodation, and other variable costs.

Integrate with Module 04 and Module 05 without duplicating their financial logic.

When confirmed attendance changes materially:
- Compare confirmed attendance with the planning target.
- Show the difference.
- Identify budget items that may depend on guest count.
- Show existing unit-cost assumptions when they are available.
- Estimate potential cost changes only when there is a documented calculation basis.
- Label estimates clearly.
- Allow the organizer to review a budget scenario when an adjustment may be needed.

Do not automatically change the budget target or reduce line items because an RSVP changes.

For example, if the confirmed guest count rises, Quveta may flag that catering quantities need review. It must not invent a new per-person catering price or claim that a vendor has confirmed additional capacity.

Route proposed financial changes through Module 05 and approved changes through Module 04.

### 13. Integrate with vendor management

Use Module 07 to identify relevant vendor records and quotations.

Potential workflows include:
- Reviewing catering quantities after RSVP changes.
- Checking whether a quotation specifies a guest-count limit.
- Identifying an unresolved vendor question.
- Preparing a follow-up task when a confirmed guest count requires a revised quotation.

Do not assume a vendor's existing quotation automatically covers a new guest count.

Do not claim a vendor has accepted a revised quantity or confirmed availability unless the record or an actual integration establishes that fact.

### 14. Integrate with tasks and event-day coordination

Use Module 06 to manage approved follow-up tasks related to guest responses.

Examples:
- Follow up with guests who have not responded.
- Confirm dietary requirements.
- Finalize catering quantities.
- Prepare seating assignments.
- Confirm transport requirements.

Use Module 08 where guest information is needed for event-day coordination.

Examples:
- Display authorized aggregate meal counts.
- Identify unresolved accessibility arrangements.
- Provide an authorized guest attendance summary.
- Highlight outstanding guest-related preparation tasks.

Only create new tasks when the organizer approves the action or an existing workflow explicitly permits it.

Prevent duplicate tasks when the same guest or RSVP change is processed repeatedly.

Do not automatically mark a task complete merely because a related guest field changes.

### 15. Use AI for assistance, not guest-data invention

Use Module 03's shared AI orchestration service when AI genuinely improves the workflow.

AI may:
- Suggest follow-up messages for unanswered invitations.
- Summarize RSVP progress.
- Identify planning questions raised by changing attendance.
- Suggest appropriate guest-list cleanup actions.
- Summarize aggregate meal or accessibility planning needs.
- Recommend when the organizer should review related vendor or budget assumptions.

AI must not:
- Invent guest names or contact information.
- Guess an RSVP response.
- Infer attendance from message tone without a recorded response.
- Invent dietary requirements.
- Fabricate vendor capacity or prices.
- Automatically send invitations or messages without an authorized real integration and explicit action.
- Overwrite authoritative guest records without confirmation.

Use structured, schema-validated AI output where applicable.

Treat imported files, guest notes, and external messages as untrusted input.

If AI is unavailable, guest CRUD, RSVP tracking, attendance calculations, and import validation should continue to work.

### 16. Implement privacy, security, and authorization

Guest information can include personal contact details and sensitive dietary or accessibility notes. Apply appropriate privacy controls.

Requirements:
- Enforce event-level authorization on every guest and RSVP operation.
- Prevent cross-event record access.
- Validate invitation tokens server-side.
- Make tokens revocable and avoid logging them unnecessarily.
- Restrict exports and uploads to authorized users.
- Protect personal data in logs and error reports.
- Validate all imported fields.
- Protect against malicious file content and spreadsheet formula injection.
- Do not expose private data through public URLs.
- Define appropriate retention and deletion behavior consistent with the existing product model.
- Keep secrets and provider credentials on the server.

Do not assume that possessing a guest ID or invitation URL alone grants unrestricted access to an event.

### 17. Backend, persistence, and API requirements

Follow existing backend and database conventions. Introduce only the entities and migrations needed for this module.

Support capabilities equivalent to:
- Create and update guests.
- Retrieve an authorized event guest list.
- Archive and restore guest records.
- Manage guest groups and household relationships.
- Create and update invitation records.
- Record RSVP responses.
- Calculate attendance summaries.
- Import and export guest data.
- Retrieve guest requirement summaries.
- Generate approved follow-up task requests.
- Create and revoke secure RSVP links, if supported.

Use typed request and response schemas, server-side validation, authorization checks, safe concurrent updates, and consistent error handling.

Use transactions for operations that affect multiple related guest or invitation records.

Prevent duplicate RSVP submissions from creating duplicate responses or corrupting attendance totals.

Keep guest identities, event-specific invitations, and RSVP history conceptually separate where needed to avoid data duplication.

### 18. Accessibility and usability

Build a responsive, accessible interface.

Include:
- Semantic headings and form labels.
- Keyboard-operable guest lists and actions.
- Visible focus indicators.
- Accessible validation and error messages.
- Status labels that do not rely on color alone.
- Accessible alternatives to complex tables.
- Clear confirmation for destructive actions.
- Mobile-friendly editing and RSVP entry.
- Loading, empty, error, and retry states.

Ensure guest names and international characters display correctly.

Make it easy to complete common actions with minimal unnecessary navigation.

### 19. Testing requirements

Use the existing testing framework.

**Unit tests**
- Attendance totals and party-size counting.
- RSVP status transitions.
- Household and individual guest calculations.
- Duplicate detection.
- Missing party-size handling.
- Dietary summary aggregation.
- Import-row validation.
- Currency-independent guest counts.
- Invitation-token validation.
- Prevention of double-counting.

**Integration tests**
- Guest CRUD and authorization.
- RSVP creation and correction.
- Household guest updates.
- Cross-event access prevention.
- Import preview and commit.
- Duplicate import behavior.
- Export authorization.
- Guest requirement privacy.
- Task creation without duplication.
- Budget review triggers.
- AI failure handling.
- Secure invitation-link creation and revocation, if supported.

**End-to-end tests**
1. Open an existing event.
2. Add individual guests and a household invitation.
3. Record attending, declining, tentative, and unanswered responses.
4. Verify confirmed attendance and response counts.
5. Update a household party size and verify no double-counting occurs.
6. Record a dietary or accessibility requirement.
7. Verify authorized aggregate summaries update.
8. Import a CSV and review validation errors before committing.
9. Change an RSVP and verify the relevant planning warning appears.
10. Review a potential budget adjustment without automatically modifying the approved budget.
11. Verify unauthorized users cannot access guest information.
12. Verify core guest management works when the AI provider is unavailable.

Report actual test results. Do not claim that unexecuted tests pass.

### 20. Acceptance criteria

The module is complete when:

- Users can manage persisted guest records.
- Invitation and RSVP statuses remain separate.
- Individual guests and household invitations are counted correctly.
- Attendance summaries are deterministic and accurate.
- Dietary and accessibility information is appropriately protected.
- Guest imports are validated before committing.
- Exports respect authorization and privacy.
- Guest-count changes surface relevant planning consequences.
- Budget adjustments are proposed rather than silently applied.
- Vendor and task integrations use existing records.
- AI never fabricates guest responses or personal information.
- Security, accessibility, and error handling are implemented.
- Relevant automated tests pass.
- No invitations or external messages are falsely represented as sent.

### 21. Implementation workflow

Proceed in this order:

1. Inspect the project and Modules 01–08.
2. Identify existing guest-count, event, budget, task, and vendor integration points.
3. Define guest, household, invitation, and RSVP data contracts.
4. Implement persistence, validation, and authorization.
5. Build the guest list, details, and RSVP management interfaces.
6. Implement deterministic attendance calculations.
7. Add household and guest-group workflows.
8. Add secure import/export where feasible.
9. Integrate guest-count changes with Modules 04–08.
10. Add AI-assisted summaries and follow-up suggestions through Module 03.
11. Add automated tests.
12. Run linting, type checks, builds, and relevant tests.
13. Fix regressions and verify the end-to-end workflow.

In your final report, summarize the features implemented, files and migrations changed, module integrations, tests actually run, and any remaining limitations.

**Product principle:** Every guest response should make Quveta's plan more accurate. The app should turn real attendance information into useful next steps while protecting guest privacy and leaving important decisions to the organizer.