# Module 11 — Invitations & Event Communications
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build a complete, functional Invitations & Event Communications module for Quveta, an AI-powered event-planning application.

The module helps event organizers create invitations, personalize messages, manage communication campaigns, track delivery where integrations support it, send RSVP reminders, and communicate event changes to the appropriate guests.

**Core user story:**

“I have an event to organize. I want to create beautiful, accurate invitations, reach the right guests, track their responses, and communicate updates without manually managing everything across disconnected tools.”

Example: An organizer creates a wedding invitation, prepares a guest list, previews personalized messages, and sends invitations through a configured email provider. Quveta tracks the provider's delivery results, connects guest responses to Module 09, and helps prepare reminders for guests who have not responded.

If no sending integration is configured, the app must still support drafting, previewing, copying, and exporting messages. It must not pretend messages were sent.

This must be a working, persisted feature integrated with the existing Quveta modules—not a static invitation-design page or a mock email campaign.

### 2. Inspect the existing project first

Before implementing:

1. Inspect the repository, current architecture, database schema, authentication, UI components, and test framework.
2. Review Modules 01–10 and identify reusable event, guest, RSVP, seating, vendor, and task services.
3. Reuse existing design patterns, validation schemas, and AI orchestration.
4. Determine whether a real email, SMS, messaging, or invitation-delivery integration is configured.
5. Preserve existing guest records, invitation history, RSVP responses, and approved event plans.
6. Implement incrementally and keep the application runnable.

Do not replace working infrastructure or build a duplicate guest-management system.

### 3. Define module ownership

Maintain these boundaries:

- **Module 02 — Event Setup:** owns event details, dates, location, timezone, and preferences.
- **Module 03 — AI Planning Engine:** owns shared AI orchestration and structured output validation.
- **Module 06 — Task & Timeline Management:** owns tasks, deadlines, and follow-up scheduling.
- **Module 07 — Vendor & Quotation Management:** owns vendor communication records and vendor booking information.
- **Module 08 — Event-Day Coordination:** owns operational updates and run-sheet information.
- **Module 09 — Guest Management & RSVP Tracking:** owns guest records, authoritative invitation records where established, and RSVP responses.
- **Module 10 — Seating Planner:** owns seating plans and seating assignments.
- **Module 11 — Invitations & Event Communications:** owns communication drafts, templates, campaigns, recipient selection, delivery attempts, provider results, and communication history.
- **Module 01 — Dashboard:** displays relevant communication summaries.

If Module 09 already contains invitation status fields, extend and integrate that model instead of creating conflicting invitation records. Module 11 may own delivery attempts and campaign state while Module 09 remains the source of truth for guest RSVP responses.

### 4. Build invitation creation and editing

Allow users to create, save, edit, duplicate, preview, archive, and reuse invitation drafts.

Support fields such as:
- Invitation title.
- Event ID.
- Communication purpose.
- Subject line, where applicable.
- Main message.
- Greeting and sign-off.
- Event name.
- Event date and time.
- Event timezone.
- Venue and address.
- RSVP deadline.
- RSVP instructions or link.
- Optional dress code.
- Optional agenda or event details.
- Visual theme or template.
- Language.
- Intended recipients.
- Created and updated timestamps.

Use event data from Module 02 rather than requiring organizers to enter the same details repeatedly.

Provide editable templates appropriate for different events, such as:
- Weddings and engagements.
- Birthdays.
- Community gatherings.
- College events.
- Corporate functions.
- Other user-defined events.

Templates should be starting points, not rigid forms. Let organizers customize tone, wording, visual presentation, and optional sections.

Validate required information before allowing the user to send a communication.

If event details change after an invitation draft is created, flag potentially outdated content and let the organizer review it. Do not silently rewrite or resend previously approved messages.

### 5. Build an invitation design and preview experience

Create a polished invitation editor with a live preview.

Support:
- Clear typography and readable layouts.
- Event-specific visual themes.
- Optional cover image or decorative artwork where supported.
- Editable invitation text.
- Date, time, venue, and RSVP details.
- Mobile-friendly previews.
- Email-friendly formatting when email delivery is supported.
- A plain-text alternative.
- Accessible color contrast and meaningful text alternatives for informative images.

If image uploads exist, validate file type, size, and access permissions. If image generation is available through an existing integration, use it only through that real integration.

Do not display broken image placeholders or rely on decorative images to communicate essential event details.

Allow users to preview the invitation before saving or sending.

### 6. Implement reusable communication templates

Provide a template library for common event communications:

**Invitation messages**
- Initial invitation.
- Formal invitation.
- Casual invitation.
- Family or group invitation.
- Corporate or community invitation.

**Follow-up messages**
- RSVP reminder.
- RSVP deadline reminder.
- Confirmation of attendance.
- Event details reminder.
- Venue or timing update.
- Schedule change.
- Cancellation or postponement notice.
- Post-event thank-you message.

Templates must be editable and should use the existing event and guest data.

Clearly distinguish a reusable template from a personalized message prepared for a specific recipient.

Do not include unsupported claims, invented details, or unverified venue information.

### 7. Add AI-assisted message drafting

Use Module 03's existing AI orchestration service.

Allow the organizer to request drafts based on:
- Event type.
- Event name and verified event details.
- Desired tone, such as formal, warm, celebratory, concise, or professional.
- Communication purpose.
- Preferred language.
- Selected template.
- User-provided instructions.
- Relevant RSVP or schedule context, when authorized and necessary.

AI may:
- Draft invitation wording.
- Suggest alternative subject lines.
- Rewrite messages for a different tone.
- Create concise reminders.
- Translate or adapt messages when supported.
- Summarize event changes for recipients.
- Personalize greetings using verified guest fields.

AI must not invent dates, locations, RSVP deadlines, contact details, prices, or event commitments.

Treat guest names, event notes, and user instructions as untrusted input. Do not let embedded instructions override system behavior, privacy restrictions, or authorization.

Use structured output validation where appropriate.

**Human approval is required:** AI-generated content must remain an editable draft until an authorized user approves it. Never send a generated message automatically just because the model returned a result.

### 8. Implement safe message personalization

Support approved placeholders such as:
- Guest display name.
- Event name.
- Event date.
- Event time.
- Venue name.
- Venue address.
- RSVP deadline.
- RSVP link, where securely generated.
- Organizer display name, where available.

Validate placeholders before previewing or sending.

Provide:
- A preview for an individual guest.
- A preview for a household invitation, where supported.
- A preview of fallback text for missing values.
- A warning for unresolved placeholders.
- A recipient count before sending.

Do not expose one guest's private details to another guest.

For group or household invitations, use the recipient relationship and consent model from Module 09. Do not assume that one recipient is authorized to receive every household member's private information.

Escape user-controlled content appropriately to prevent HTML injection or unsafe message rendering.

### 9. Implement recipient selection and campaign management

Allow users to prepare communication campaigns for authorized recipients associated with a particular event.

Support recipient filters such as:
- All eligible guests.
- Guests awaiting an RSVP.
- Guests who have confirmed attendance.
- Guests who have declined, where appropriate for the message.
- Guests in a selected group.
- Guests with a specific invitation status.
- Selected individual recipients.

Show the exact recipient count and selection criteria before sending.

Exclude archived guests and invalid contact records from sendable recipients unless a specific supported workflow permits otherwise.

Provide a recipient review screen showing the destination and relevant personalization preview without exposing unnecessary sensitive information.

Allow organizers to:
- Save a campaign as a draft.
- Edit campaign content.
- Preview the message.
- Review recipient selection.
- Schedule a send if the configured provider supports scheduling.
- Send immediately after confirmation if a real provider is configured.
- Cancel an unsent campaign.
- Review delivery results.

Do not create duplicate campaigns or accidentally resend a message when a user refreshes the page or retries a failed request.

### 10. Integrate real delivery providers responsibly

Inspect the project for an existing authorized email, SMS, or messaging integration.

If a provider is available:
- Use the server-side integration.
- Keep API keys and secrets out of the frontend.
- Validate recipient addresses or phone numbers.
- Respect provider rate limits.
- Support bounded retries for transient failures.
- Use idempotency or equivalent safeguards to prevent accidental duplicate sends.
- Record provider message identifiers and delivery events where available.
- Verify webhook signatures if webhooks are used.
- Handle provider outages and partial campaign failures.
- Provide an explicit final confirmation before sending.

If no provider is configured:
- Allow users to create and edit drafts.
- Support preview and copy actions.
- Allow export in an appropriate format where implemented.
- Provide a clear setup message explaining that live delivery is not configured.
- Never simulate a successful send.

Keep these states distinct:
- Draft.
- Ready for review.
- Approved.
- Queued.
- Sending.
- Sent to provider.
- Delivery confirmed.
- Delivery failed.
- Bounced.
- Cancelled.

Use only statuses that the actual provider and application workflow can support. “Sent to provider” does not necessarily mean “delivered to the recipient.”

### 11. Integrate RSVP tracking securely

Integrate with Module 09 to create or use secure guest-facing RSVP links where supported.

Requirements:
- Use unguessable, revocable tokens or the application's established secure authentication model.
- Scope each link to the intended event and permitted guest or household.
- Do not expose the complete guest list.
- Do not include sensitive personal information in URLs.
- Avoid logging raw RSVP tokens.
- Support expiry and revocation where appropriate.
- Validate the permitted party size.
- Prevent unauthorized RSVP modification.
- Avoid duplicate response processing.
- Handle invalid, expired, or revoked links gracefully.

When a guest submits an RSVP, Module 09 remains authoritative for the response.

Update the associated communication history with the response event when appropriate, without duplicating the RSVP record.

Do not claim that a guest opened or read a message unless the provider genuinely supports that signal. Even when available, explain that tracking signals may be incomplete.

### 12. Build an RSVP reminder workflow

Provide a reminder workflow for guests who have not responded.

Allow the organizer to:
1. Review the guests awaiting a response.
2. Select eligible recipients.
3. Choose or generate a reminder template.
4. Preview personalized messages.
5. Confirm the RSVP deadline and event details.
6. Review the final recipient list.
7. Send through an available provider or prepare messages for manual delivery.
8. Review the actual outcome.

Prevent accidental repeated reminders by showing prior communication history and warning about recent messages.

If automated scheduling is supported, allow the organizer to configure the schedule and opt-out rules.

Do not automatically send repeated reminders without explicit configuration and an appropriate consent policy.

A reminder being drafted is not a reminder being sent.

### 13. Implement event updates and cancellation notices

When event details change, help the organizer identify whether previously prepared or sent communications may be outdated.

Relevant changes may include:
- Event date or time.
- Venue or address.
- Schedule.
- RSVP deadline.
- Event cancellation or postponement.
- Other organizer-defined details.

Provide a review workflow:
1. Detect the changed event fields.
2. Identify affected drafts and relevant recipient groups.
3. Prepare a proposed update message.
4. Show exactly what changed.
5. Let the organizer edit and approve the message.
6. Confirm recipients.
7. Send through a real configured provider or prepare it for manual delivery.
8. Record actual delivery outcomes.

Do not automatically resend invitations when an event changes.

Do not claim that recipients have been notified until the sending workflow confirms the appropriate status.

### 14. Add communication history and campaign analytics

Create a communication history for each event.

Where supported, record:
- Campaign ID.
- Event ID.
- Template or draft reference.
- Message version.
- Intended recipient.
- Delivery channel.
- Creation and approval timestamps.
- Send attempt timestamp.
- Provider message identifier.
- Delivery status.
- Failure reason, safely redacted.
- Relevant RSVP response association.
- Retry history.

Provide useful summaries such as:
- Drafts awaiting review.
- Campaigns queued or in progress.
- Messages accepted by the provider.
- Confirmed deliveries, when available.
- Failed or bounced messages.
- Guests still awaiting an RSVP.

Do not fabricate open rates, read receipts, delivery rates, or engagement metrics. Display a metric only when the underlying data exists and its meaning is clear.

Preserve message versions so edits do not silently rewrite the history of a message already sent.

### 15. Integrate with other Quveta modules

**Module 01 — Dashboard**
- Show relevant communication summaries, such as drafts needing review and RSVP follow-ups.
- Use actual persisted records.

**Module 02 — Event Setup**
- Read authoritative event details.
- Flag potentially outdated drafts when those details change.

**Module 03 — AI Planning Engine**
- Use shared AI orchestration and output validation.

**Module 06 — Task & Timeline Management**
- Support approved follow-up tasks for RSVP deadlines and communication actions.
- Avoid duplicate tasks.

**Module 07 — Vendor & Quotation Management**
- Keep vendor communications separate from guest campaigns while reusing shared delivery infrastructure where appropriate.

**Module 08 — Event-Day Coordination**
- Help prepare operational updates when schedule changes are approved.
- Never imply that a message has been delivered unless the communication workflow confirms it.

**Module 09 — Guest Management & RSVP Tracking**
- Use authoritative guest contact information, invitation records, and RSVP states.
- Keep communication delivery status separate from RSVP status.

**Module 10 — Seating Planner**
- Use guest information only when necessary and authorized.
- Help prepare relevant seating updates if guest responses affect arrangements, without automatically disclosing seating details.

### 16. Backend, persistence, and API requirements

Follow the existing backend conventions and add only the necessary models, migrations, and endpoints.

Support capabilities equivalent to:
- Create and edit invitation drafts.
- Retrieve and manage templates.
- Preview personalized messages.
- Create and update communication campaigns.
- Select eligible recipients.
- Validate recipient and message data.
- Queue or send through a configured provider.
- Record provider delivery events.
- Cancel unsent campaigns.
- Retrieve campaign and recipient history.
- Generate RSVP reminder drafts.
- Prepare event-update messages.
- Manage secure RSVP links through the appropriate existing service.

Requirements:
- Typed request and response schemas.
- Server-side validation.
- Event-level authorization.
- Secure secret management.
- Rate limiting where appropriate.
- Safe handling of retries and concurrent requests.
- Idempotency for send operations.
- Provider webhook verification where applicable.
- Clear error handling.
- Protection against unauthorized bulk messaging.
- Safe storage of contact information and communication history.

Never trust client-side claims that a message was sent or delivered.

### 17. Privacy, consent, and accessibility

Implement:
- Authorization for guest contact details and campaign records.
- Appropriate consent and opt-out handling for supported communication channels.
- A clear review step before bulk sending.
- Prevention of accidental disclosure between recipients.
- Safe HTML rendering and output encoding.
- Protection against prompt injection in user-supplied content.
- Minimal logging of sensitive message content and contact information.
- Appropriate retention and deletion behavior.
- Clear errors without secrets or stack traces.

Accessibility requirements:
- Semantic forms and headings.
- Keyboard-operable editor and recipient selection.
- Visible focus indicators.
- Accessible message previews.
- Clear recipient counts and send confirmations.
- Status labels that do not rely on color alone.
- Responsive layouts.
- Loading, empty, failure, and retry states.

### 18. Testing requirements

Use the existing testing framework.

**Unit tests**
- Placeholder rendering and fallback behavior.
- Missing event details.
- Message content validation.
- Recipient eligibility.
- RSVP reminder selection.
- Campaign status transitions.
- Idempotent send behavior.
- Opt-out handling.
- HTML escaping.
- AI output validation.
- Outdated draft detection.

**Integration tests**
- Draft creation and editing.
- Campaign creation and recipient selection.
- Event-level authorization.
- Secure RSVP-link creation and validation.
- Provider failure and retry handling.
- Duplicate-send prevention.
- Webhook signature verification, if used.
- RSVP synchronization with Module 09.
- Communication history preservation.
- Partial campaign failure.
- AI provider failure.

**End-to-end tests**
1. Open an existing event.
2. Create and save an invitation draft.
3. Preview personalized messages for selected guests.
4. Verify unresolved placeholders are detected.
5. Prepare a campaign for eligible guests.
6. Confirm the recipient count and review the message.
7. Verify that no message is sent before explicit approval.
8. Test delivery using a provider sandbox or test adapter where available.
9. Verify that provider results are recorded accurately.
10. Prepare an RSVP reminder for guests who have not responded.
11. Record an RSVP and verify the guest status updates through Module 09.
12. Change an event detail and verify affected drafts are flagged.
13. Verify provider failure does not produce a false success state.
14. Verify unauthorized users cannot access campaign or guest information.

Report actual test results. Do not claim tests pass unless they have been executed.

### 19. Acceptance criteria

The module is complete when:

- Users can create, edit, preview, and save invitations.
- Reusable templates are available and editable.
- AI drafts are accurate, structured, and subject to user approval.
- Personalized placeholders use validated data.
- Recipient selection uses real guest records.
- RSVP links are secure when supported.
- Delivery status reflects actual provider results.
- Drafting and sending are clearly distinguished.
- RSVP reminders can be prepared and reviewed.
- Event changes flag potentially outdated messages.
- Communication history is persisted.
- Duplicate sends and unauthorized bulk messages are prevented.
- Integration with Module 09 preserves authoritative RSVP records.
- Security, privacy, and accessibility requirements are implemented.
- Relevant automated tests pass.
- No message is falsely represented as sent or delivered.

### 20. Implementation workflow

Proceed in this order:

1. Inspect the project and Modules 01–10.
2. Identify existing guest, invitation, RSVP, AI, and provider integration capabilities.
3. Define invitation, template, campaign, recipient, and delivery-state contracts.
4. Implement draft persistence and validation.
5. Build the invitation editor and live preview.
6. Add personalization and recipient selection.
7. Integrate AI-assisted drafting through Module 03.
8. Integrate secure RSVP handling through Module 09.
9. Add provider-backed sending only if a real integration is configured.
10. Implement reminders, event updates, and communication history.
11. Add automated tests.
12. Run linting, type checks, builds, and relevant tests.
13. Fix regressions and verify the end-to-end workflow.

In your final implementation report, summarize:
- Features implemented.
- Files and migrations changed.
- Integrations with Modules 01–10.
- Whether real delivery is configured.
- Tests actually run and their results.
- Remaining limitations or unfinished work.

**Product principle:** Quveta should make every invitation and update feel thoughtful, accurate, and easy to manage. It must always be clear what has been drafted, what has been approved, and what has genuinely reached a recipient.