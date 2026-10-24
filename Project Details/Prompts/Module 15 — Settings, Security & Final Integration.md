# Module 15 — Settings, Security & Final Integration
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Implement Quveta’s Settings, Security & Final Integration module.

Quveta is an AI-powered event-planning application with 15 planned modules. This module establishes consistent account settings, security controls, privacy protections, integration contracts, and cross-module behavior.

The outcome must be a cohesive, secure, testable application—not a collection of disconnected pages.

**Primary goals:**
- Provide account and application settings.
- Enforce authentication and authorization consistently.
- Protect private event, guest, financial, and vendor data.
- Centralize user preferences without duplicating module-owned data.
- Validate integrations across Modules 01–14.
- Handle failures, retries, and stale data safely.
- Verify the core user journeys from event creation through planning, adaptation, execution, and reporting.

Do not rewrite working modules unnecessarily. Inspect the current repository, identify actual gaps, and make the smallest reliable changes that achieve these goals.

### 2. Inspect the existing application before implementation

Before making changes:

1. Inspect the repository structure, frontend, backend, database, authentication, and deployment configuration.
2. Review the implementation status of Modules 01–14.
3. Identify the existing authentication provider and session model.
4. Review database ownership, event membership, and authorization rules.
5. Identify existing user preferences and settings.
6. Inspect API contracts, validation schemas, error handling, and background jobs.
7. Check current tests, lint rules, type checks, and build commands.
8. Identify incomplete, duplicated, or inconsistent cross-module integrations.

Create a concise implementation checklist based on the actual repository.

**Important:** Do not assume every earlier module is fully implemented simply because its prompt was submitted. Verify the code and database behavior.

Preserve the established stack and working features. Do not introduce a new authentication system, database, state-management framework, or deployment architecture unless there is a demonstrated need.

### 3. Settings workspace

Create a polished Settings page consistent with Quveta’s existing design.

Organize settings into clear sections.

**Account**
- Display name and other supported profile fields.
- Email address and verification status, where available.
- Account creation or account status information, if supported.
- Password or sign-in management through the existing authentication provider.
- Sign-out action.
- Account deletion workflow, if supported.

**Preferences**
- Preferred language, if localization is implemented.
- Default currency for new events.
- Preferred date and time display formats.
- Timezone preference.
- Notification preferences.
- Quiet hours and digest preferences where Module 13 supports them.
- Accessibility and display preferences where supported.

**Privacy and security**
- Available authentication and security settings.
- Connected integrations, if any.
- Privacy information and data-export controls where implemented.
- Account deletion and data-retention information.
- Session-management controls only if supported by the authentication provider.

**Application**
- Application version or build identifier when available.
- Links to implemented help or privacy pages.
- Clear explanations of supported integrations and limitations.

Do not display settings that cannot actually be changed or verified.

Settings must be saved persistently, loaded on subsequent visits, and validated on both the client and server where applicable.

### 4. Establish ownership boundaries

Avoid duplicate sources of truth.

- Account identity and authentication belong to the existing authentication system.
- User preferences belong to the settings or profile-preferences service.
- Event details belong to Module 02.
- Budget values and financial calculations belong to Module 04.
- Approved budget scenarios belong to Module 05.
- Tasks and dependencies belong to Module 06.
- Vendor and quotation records belong to Module 07.
- Event-day operations belong to Module 08.
- Guests and RSVP records belong to Module 09.
- Seating assignments belong to Module 10.
- Invitation campaigns belong to Module 11.
- AI event insights belong to Module 12.
- Notifications and automation belong to Module 13.
- Reports and exports belong to Module 14.

Settings may establish defaults for newly created records, but changing a preference must not silently overwrite existing event-specific values.

For example:
- Changing the default currency must not convert existing budgets.
- Changing the timezone preference must not silently change the actual event timezone.
- Disabling a notification category must not delete its history.
- Changing a display preference must not change persisted financial values.

### 5. Authentication and session security

Use the existing authentication provider and established session model.

Ensure that:
- Protected application pages require a valid session.
- Protected API routes independently verify authentication.
- Expired or invalid sessions are handled safely.
- Signing out clears relevant client-side authenticated state.
- Authentication failures do not expose sensitive implementation details.
- Redirects after sign-in use safe, validated destinations.
- Privileged actions require appropriate server-side verification.
- Password handling is delegated to the authentication provider rather than implemented with custom insecure storage.

Never store passwords in application tables or browser storage.

Never place private API keys, service-role database credentials, or AI provider secrets in frontend code.

If the current application has no working authentication, implement a minimal secure solution compatible with the existing stack. Do not pretend that a decorative sign-in screen provides real protection.

### 6. Authorization and event ownership

Enforce access controls consistently across all modules.

Every protected resource request must verify that the authenticated user is authorized to access the requested resource.

Cover:
- Events.
- Budgets and budget line items.
- Budget scenarios.
- Tasks and dependencies.
- Vendors and quotations.
- Run sheets and incidents.
- Guest lists and RSVP data.
- Seating arrangements.
- Invitations and campaign records.
- AI conversations and generated recommendations.
- Notifications.
- Reports and exported files.
- Uploaded documents and private storage objects, where supported.

Never rely solely on hiding UI controls or filtering data in the browser.

Prevent insecure direct object reference vulnerabilities: changing an event ID, task ID, guest ID, report ID, or file reference must not grant access to another user's data.

If Quveta supports collaborators or shared events, enforce the existing role and permission model. Do not invent a complicated role system if the application does not need one.

For database-backed deployments, implement or verify row-level security and appropriate server-side authorization policies where supported by the existing architecture.

### 7. Data privacy and protection

Apply data minimization across the application.

Protect:
- Guest contact information.
- Dietary and accessibility information.
- Vendor contact details.
- Financial records.
- Private event notes.
- AI conversation history.
- Exported files and generated documents.
- Authentication and integration credentials.

Requirements:
- Return only fields required by the requested operation.
- Avoid placing sensitive information in logs.
- Do not expose personal data in analytics or error messages unnecessarily.
- Use HTTPS in production.
- Use secure cookie settings when cookie-based sessions are used.
- Apply appropriate CSRF protections for cookie-authenticated state-changing requests.
- Configure CORS for the actual application origins.
- Validate user-controlled input on the server.
- Use parameterized database queries or the existing ORM safely.
- Apply appropriate rate limits to authentication, AI, export, and expensive operations.
- Use safe output encoding and avoid unsafe rendering of untrusted content.
- Apply secure cache policies to private reports and personal data.

Never send credentials, session tokens, or unnecessary guest information to the AI provider.

When AI requests need event context, provide only the relevant authorized information and treat user-supplied notes and uploaded content as untrusted data.

### 8. Input validation and API consistency

Review cross-module API behavior.

Use the project's established schema-validation library and typed request/response contracts.

Validate:
- IDs and resource ownership.
- Query parameters.
- Pagination and sorting.
- Date ranges and timezones.
- Currency codes and monetary amounts.
- Status transitions.
- Report formats and filters.
- Notification preferences.
- Uploaded file types and sizes where uploads exist.
- Any user-provided URL or integration configuration.

Use consistent error responses with safe, actionable messages.

Distinguish validation errors, authorization errors, missing resources, rate limits, conflicts, and temporary service failures.

Do not return stack traces, database internals, provider credentials, or raw sensitive model context to users.

Where the project already uses versioned schemas, preserve compatibility and validate data at module boundaries.

### 9. Reliable cross-module integration

Verify that all modules use consistent identifiers, event ownership, and persistence rules.

**Dashboard and event setup**
- Creating an event updates the dashboard from persisted data.
- Editing event details updates relevant views without deleting related records.
- Missing event fields remain explicitly missing rather than being silently invented.

**AI planning and budget**
- AI-generated proposals use validated event data.
- Financial arithmetic remains deterministic.
- The adaptive budget simulator does not mutate approved data before confirmation.
- Approved changes update the authoritative budget and related views.
- Concurrent edits are detected rather than silently overwriting newer changes.

**Tasks, vendors, and execution**
- Task dependencies remain valid.
- Vendor quotations connect to budget items without double-counting.
- Run sheets use the approved schedule.
- Delays identify impacted tasks without silently changing the entire plan.

**Guests, seating, and communications**
- RSVP changes update the appropriate counts.
- Seating assignments respect table capacities.
- Communication status reflects actual provider results.
- Guest privacy remains enforced across reports and exports.

**Insights and notifications**
- AI answers are grounded in authorized, current records.
- Suggested actions require explicit approval when consequential.
- Notifications correspond to real events and avoid duplicates.
- Background jobs remain safe across retries and restarts.

**Reports and exports**
- Report totals match the owning modules.
- Exported data respects user permissions.
- Private files cannot be downloaded by unauthorized users.

Do not create duplicate records when synchronizing data between modules.

### 10. Data integrity, transactions, and concurrency

Review high-impact write operations.

Use database transactions or equivalent safe persistence boundaries when multiple records must change together.

Important cases include:
- Applying an approved budget scenario.
- Updating a budget item and its linked records.
- Assigning guests to tables.
- Updating related event tasks.
- Approving a schedule revision.
- Recording an export or communication operation where multiple writes are involved.

Use the existing concurrency-control strategy, such as version columns or optimistic locking, where appropriate.

When data has changed since a user opened a form or preview:
- Detect stale state where practical.
- Explain that the data has changed.
- Refresh or request confirmation before overwriting.
- Preserve the user's work whenever possible.

Avoid automatic retries for non-idempotent operations unless the operation has an idempotency mechanism.

### 11. AI and integration failure handling

The application must remain useful when external services fail.

Handle:
- AI provider downtime.
- Rate limits.
- Malformed AI responses.
- Database timeouts.
- Email or messaging provider failures.
- File-generation failures.
- Background job interruptions.
- Network disconnections.
- Expired sessions.
- Partial failures when loading a multi-module page.

Use bounded retries and timeouts.

Do not retry indefinitely or duplicate side effects.

When AI is unavailable:
- Existing event data remains accessible.
- Saved plans remain intact.
- Budget calculations continue to work.
- Tasks and timelines remain usable.
- Standard reports and exports continue wherever their dependencies are available.

Clearly distinguish a temporary service failure from a successful operation.

Never show a success message before a consequential backend operation has actually succeeded.

### 12. Auditability and consequential actions

Preserve a useful history of important user-approved changes where supported by the current data model.

Examples:
- Budget scenario approval.
- Significant budget changes.
- Schedule revisions.
- Vendor booking-status changes.
- Guest or seating changes.
- Campaign approvals and sending attempts.
- Report generation and sensitive exports.
- Account security changes.

Record appropriate metadata such as actor, event, action, timestamp, and relevant record references.

Do not log secrets, full sensitive guest profiles, authentication tokens, or unnecessary personal information.

Audit history should help explain what changed without allowing ordinary users to alter historical records improperly.

For consequential operations, require explicit confirmation and show the meaningful effects before committing the change.

### 13. Account deletion and data export

If account deletion is supported, implement a safe, clearly explained workflow.

Requirements:
- Confirm the user's intent.
- Reauthenticate where appropriate.
- Explain the scope of deletion.
- Apply the existing retention and legal requirements.
- Remove or anonymize related data according to the actual product policy.
- Handle private stored files, background jobs, and connected integrations where applicable.
- Avoid leaving inaccessible orphaned records without a deliberate retention reason.

If deletion is not yet supported end to end, do not display a misleading destructive action. Document the gap and provide an honest user-facing explanation or a safe, supported account-management path.

If personal data export is supported, ensure it is authorized, complete within its documented scope, and securely delivered.

Do not claim deletion or export has completed until the backend confirms it.

### 14. Settings persistence and database changes

Reuse existing tables and profile models where appropriate.

Add migrations only when required.

If a preferences table is necessary, use a clear ownership model and validate values at the database or service boundary where practical.

Potential preferences include:
- Default currency.
- Preferred timezone.
- Date and time formats.
- Notification categories.
- Quiet hours.
- Digest preferences.
- Display preferences.

Use safe defaults and handle legacy records with missing settings.

Do not store calculated dashboard totals or duplicate event data in the preferences table.

Make migrations compatible with existing records and provide appropriate indexes for frequently queried fields.

Document migration and rollback considerations according to the project's conventions.

### 15. Accessibility and responsive behavior

Maintain a consistent, accessible application shell.

Verify:
- Keyboard navigation.
- Visible focus states.
- Form labels and validation.
- Accessible dialogs and confirmation flows.
- Screen-reader announcements for success and failure.
- Clear loading, empty, and error states.
- Responsive behavior on mobile, tablet, and desktop.
- Sufficient contrast and non-color status indicators.
- Accessible settings controls and notification preferences.

Aim for WCAG 2.2 AA-oriented behavior without claiming formal compliance unless an appropriate audit has actually been completed.

### 16. Cross-module automated testing

Use the existing testing tools and add integration coverage where missing.

**Security tests**
- Unauthenticated requests cannot access protected resources.
- User A cannot access User B's event or related records.
- Unauthorized exports and file downloads are rejected.
- Malicious IDs and invalid input are handled safely.
- Sensitive fields are omitted from responses where inappropriate.
- Rate limits and session expiration behave correctly.

**Integration tests**
- Event creation and dashboard refresh.
- Event edits preserve related records.
- AI proposals do not bypass approval.
- Budget scenarios update authoritative totals only after approval.
- Concurrent changes do not silently overwrite approved state.
- Task dependencies remain valid.
- Quotation and budget totals do not double-count.
- RSVP and seating counts remain consistent.
- Notifications are deduplicated.
- Report totals match source modules.
- Settings persist across sessions.
- AI failure does not destroy saved data.

**End-to-end tests**
1. Sign in and create an event.
2. Generate and save an AI planning proposal.
3. Review the proposed budget.
4. Add or edit budget line items.
5. Simulate a budget reduction and inspect trade-offs.
6. Reject one suggestion and accept another.
7. Verify the approved budget changes only after confirmation.
8. Review tasks affected by a scheduling change.
9. Add a vendor quotation and verify budget integration.
10. Add guests and verify RSVP and seating behavior.
11. Generate a run sheet and download a report.
12. Change user preferences and verify persistence.
13. Attempt unauthorized access to another event.
14. Simulate an AI provider failure.
15. Verify the event, budget, tasks, and reports remain available where expected.
16. Verify the core journey works on a mobile viewport and with keyboard navigation.

Use realistic test data. Never use production personal data in automated tests.

### 17. Performance and maintainability

Avoid unnecessary architecture expansion.

- Reuse existing services and components.
- Keep business logic out of UI components.
- Keep authentication and authorization checks centralized where practical, while ensuring each protected operation remains enforced.
- Avoid redundant database queries.
- Paginate large collections.
- Use database indexes for demonstrated query needs.
- Bound expensive report and AI operations.
- Avoid unnecessary dependencies.
- Keep TypeScript strict where the project supports it.
- Remove dead code only when it is safe to do so.
- Avoid broad refactors that obscure the changes or introduce unrelated regressions.

Document important architectural decisions and configuration requirements.

### 18. Final application navigation and experience

Verify that the main navigation reflects the implemented product.

Users should be able to find the supported features for:
- Dashboard.
- Events.
- AI planning.
- Budget and budget simulation.
- Tasks and timeline.
- Vendors.
- Event-day operations.
- Guests and seating.
- Invitations and communications.
- AI insights.
- Notifications.
- Reports and documents.
- Settings.

Only show links to implemented routes. Use clear unavailable or planned-feature messaging where necessary instead of fake screens.

Ensure the navigation, page titles, breadcrumbs where present, loading states, empty states, and error handling feel consistent.

### 19. Acceptance criteria

The module is complete when:

- User settings persist correctly.
- Authentication is enforced by the backend, not merely the UI.
- Cross-event and cross-user access is prevented.
- Private guest and financial information is protected.
- Existing module ownership boundaries are preserved.
- Budget, task, RSVP, seating, and report data remain consistent.
- Approved changes cannot be silently overwritten by proposals or stale forms.
- AI and provider failures are handled without data loss.
- Notifications and background operations are safe against duplicate side effects.
- Account management controls reflect actual supported behavior.
- Core end-to-end journeys work across the integrated application.
- Relevant security, integration, and regression tests pass.
- The app builds and runs using the documented project commands.
- Remaining limitations are documented honestly.

### 20. Required implementation report

At completion, provide:

1. Summary of settings and security features implemented.
2. Authentication and authorization mechanisms verified.
3. Database changes and migrations.
4. Cross-module integration fixes.
5. Privacy and data-protection safeguards.
6. Tests executed and their actual results.
7. Build, lint, and type-check results.
8. Known issues and unsupported capabilities.
9. Required environment variables and deployment configuration.
10. Recommended next steps for final QA and production deployment.

**Final principle:** Quveta must preserve user control, protect private event data, calculate deterministically, explain AI recommendations, and never represent an unverified action as completed.