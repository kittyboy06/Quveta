# Module 07 — Vendor & Quotation Management
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build a complete Vendor & Quotation Management module for Quveta, an AI-powered event-planning application.

The module helps users organize vendor information, collect and compare quotations, evaluate offers, track booking decisions, and connect vendor costs to the existing budget and event timeline.

**Core user story:**

“I need to find and compare suppliers, understand the true cost of each option, decide which offer suits my event, and keep track of what has and has not been confirmed.”

Examples include venues, caterers, decorators, photographers, entertainers, transport providers, rental companies, and other event services.

This must be a functioning, data-driven module—not a static vendor directory with invented businesses, prices, ratings, or availability.

**Critical trust rule:** Never represent an estimated price as a verified quotation, an inquiry as a booking, or an unconfirmed supplier as available.

### 2. Inspect the existing project first

Before implementing:

1. Inspect the existing repository, architecture, database schema, authentication, UI components, API patterns, and testing framework.
2. Reuse the established stack, design system, and existing services.
3. Integrate with Modules 01–06 instead of creating duplicate event, budget, or task systems.
4. Identify whether external vendor discovery, email, messaging, or booking integrations already exist.
5. Build only the integrations supported by the actual project and available credentials.
6. Keep the application runnable throughout implementation.

Do not replace working infrastructure or add unnecessary dependencies.

### 3. Define module ownership and integration boundaries

Maintain the following responsibilities:

- **Module 02 — Event Setup:** owns event requirements, date, location, guest count, currency, and preferences.
- **Module 03 — AI Planning Engine:** provides shared AI orchestration and structured recommendation generation.
- **Module 04 — Budget Management:** owns authoritative budget records, financial calculations, and financial status.
- **Module 05 — Adaptive Budget Simulator:** owns budget scenarios and approved budget adjustments.
- **Module 06 — Task & Timeline Management:** owns tasks, deadlines, dependencies, and scheduling.
- **Module 07 — Vendor & Quotation Management:** owns vendor records, contact details, quotation records, comparisons, inquiry tracking, and vendor booking-status records.
- **Module 01 — Dashboard:** presents relevant vendor and booking summaries from authoritative records.

A quotation may inform a budget line item, but the vendor module must not maintain a conflicting independent budget total.

### 4. Implement vendor records

Allow users to create, view, edit, archive, and search vendors associated with an event. Where the existing architecture supports reusable vendors across events, design the data model to support that without leaking information between users.

Each vendor record should support:

- Vendor ID.
- Event association or authorized reusable vendor association.
- Business or supplier name.
- Service category.
- Contact person's name, where available.
- Email and telephone, where provided.
- Website or public profile URL, where provided.
- Business address or service area, where relevant.
- Description of services.
- Services and packages offered.
- User-entered notes.
- Source of the vendor information.
- Verification status.
- Date last verified, where applicable.
- Created and updated timestamps.

Suggested service categories include venue, catering, decoration, photography, video, entertainment, transport, accommodation, attire, invitations, rentals, staffing, and other.

Allow custom categories where practical.

Do not require every field. Users must be able to record a vendor even when they have only a name and partial contact information.

Support these verification states:

- Unverified.
- User-confirmed.
- Source-verified, when a genuine verification process exists.
- Verification stale.
- Archived.

Clearly explain what each status means. A user confirming a phone number is not the same as Quveta independently verifying a business.

Do not imply that a vendor has been background-checked, vetted, licensed, or endorsed unless a real process establishes that fact.

### 5. Build a useful vendor directory

Create a searchable vendor interface with:

- Vendor name and service category.
- Verification status.
- Contact information when available.
- Linked quotations.
- Latest known quoted amount, when available.
- Booking status for the relevant event.
- Last contact or update date, where recorded.

Provide filters for category, verification status, quotation status, and booking status.

Allow sorting by vendor name, category, latest quotation date, or other supported fields.

Do not rank vendors by fabricated ratings or invented popularity metrics.

If the application has no vendor records, show a useful empty state with actions to add a vendor or discover vendors through a supported integration.

Vendor discovery must use actual search results or a real provider integration. If no discovery integration is configured, offer manual entry rather than displaying fake suppliers.

### 6. Implement quotation management

Users must be able to create, view, edit, compare, and archive quotations associated with a vendor and event.

Each quotation should support:

- Quotation ID.
- Vendor ID.
- Event ID.
- Quotation title or package name.
- Description of included services.
- Quoted amount and currency.
- Tax amount or tax treatment, when known.
- Additional fees.
- Discounts, when documented.
- Delivery, transport, setup, or service charges where applicable.
- Quantity or per-person pricing when supplied.
- Included and excluded services.
- Deposit requirement.
- Payment schedule.
- Valid-until date, if provided.
- Quotation received date.
- Source document or reference, if supported.
- Source and verification status.
- User notes.
- Quotation status.
- Created and updated timestamps.

Suggested quotation statuses:

- Draft.
- Requested.
- Received.
- Under review.
- Accepted.
- Rejected.
- Expired.
- Superseded.
- Cancelled.

Keep quotation status separate from vendor booking status. An accepted quotation does not automatically prove a booking has been confirmed.

Allow users to record quotations manually even if no document-upload feature exists.

If file upload already exists, support securely attaching quotation documents. Validate file types and sizes, enforce authorization, and avoid exposing private documents through public URLs.

### 7. Handle pricing and quotation totals reliably

Use the existing financial conventions from Module 04.

Do not duplicate monetary arithmetic across frontend components.

Where the necessary inputs are known, calculate the quotation total using explicit, documented rules for:

- Base price.
- Quantity.
- Tax.
- Additional charges.
- Discounts.
- Deposit.
- Remaining balance.

Clearly distinguish a deposit from the total cost. A deposit is usually part of the quoted total, not an additional expense on top of it.

Do not assume taxes are included or excluded without evidence. Record the tax treatment as known, unknown, included, or excluded where appropriate.

Support fixed-price, per-person, hourly, package-based, and other pricing models when the source provides that information.

Handle:
- Different currencies.
- Missing prices.
- Unknown taxes.
- Unspecified additional fees.
- Expired quotations.
- Partial quotations.
- Rounding and currency precision.
- Revised or superseded quotations.

Use integer minor units or an appropriate decimal-money representation.

Never compare different currencies as though they were equivalent. If no verified exchange-rate service is available, group quotations by currency and explain that direct comparison is unavailable.

When important charges are unknown, show that the total is incomplete rather than presenting a misleading final price.

### 8. Build a side-by-side quotation comparison

Create a comparison interface that lets users select two or more quotations for the same service category or requirement.

Compare relevant fields such as:

- Vendor and package name.
- Quoted price and currency.
- Known total cost.
- Pricing model.
- Services included.
- Services excluded.
- Tax treatment.
- Additional fees.
- Deposit requirement.
- Payment schedule.
- Quotation validity.
- Cancellation and refund terms, when documented.
- Availability confirmation status.
- Relevant user-defined preferences.
- Outstanding questions.

Show price differences only when the quotations are comparable. Explain any limitations, such as missing fees or differing service scope.

Do not automatically declare the cheapest quotation the best option. A lower price may exclude important services or require additional spending.

Where useful, highlight:
- Lowest known comparable price.
- Most complete quotation.
- Missing information that prevents a fair comparison.
- Potential additional costs.
- Best fit for user-defined priorities, when supported by evidence.

Use neutral, explainable labels rather than unsupported ratings or quality scores.

### 9. Integrate AI-assisted quotation analysis

Use Module 03’s existing AI orchestration service.

AI may help users:
- Summarize quotation documents or descriptions.
- Extract proposed line items from uploaded quotations, if secure file processing is available.
- Identify differences between supplier offers.
- Highlight missing terms.
- Generate follow-up questions.
- Explain trade-offs against the event’s requirements.
- Identify potential scope mismatches.
- Summarize documented cancellation and payment conditions.

AI must distinguish explicitly between:

1. Information directly present in the source.
2. Information calculated by application code.
3. AI-generated interpretation.
4. Missing information.
5. Information that requires confirmation from the vendor.

For extracted values, retain a source reference where possible, such as a document page or text excerpt, so users can verify the result.

Do not invent missing quotation terms, taxes, availability, discounts, or supplier policies.

If extraction confidence is insufficient, mark the field for user review. Never silently convert an uncertain interpretation into a confirmed financial record.

Require user confirmation before saving extracted information as an authoritative quotation.

### 10. Support vendor inquiries and follow-up tracking

Allow users to track vendor communication without pretending that messages have been sent externally.

Support records such as:

- Inquiry created.
- Inquiry date.
- Questions to ask.
- Requested service or package.
- Expected response date.
- Follow-up date.
- Last contact date.
- Response received.
- Inquiry notes.
- Next action.
- Contact status.

Suggested inquiry states include:

- Not contacted.
- Inquiry prepared.
- Contacted.
- Awaiting response.
- Response received.
- Follow-up needed.
- Closed.

If a genuine email or messaging integration is configured, use its established authorization and sending flow. Make the actual send action explicit and report success only when confirmed by the provider.

Without an integration, let users copy an inquiry message or open the vendor’s actual contact channel where available.

A prepared email is not a sent email. An inquiry is not a booking.

### 11. Implement booking and contract-status tracking

Allow users to track the relationship between a vendor and an event.

Suggested states:

- Considering.
- Inquiry sent.
- Quotation received.
- Negotiating.
- Awaiting confirmation.
- Booked.
- Contract signed, when explicitly recorded.
- Deposit paid, when explicitly recorded.
- Completed.
- Cancelled.

Adapt these statuses to the existing project’s domain model.

Track relevant dates, notes, and confirmation references where available.

Do not assume that:
- Accepting a quotation books the vendor.
- Recording a deposit proves a payment was processed.
- A contract is signed because a vendor is marked booked.
- Availability remains valid indefinitely.

Only record external confirmations when supported by user-entered evidence or a real integration.

Where contract or payment information is stored, protect it with the same authorization and privacy controls as other event records.

### 12. Connect quotations to the budget module

Integrate with Module 04’s existing budget services.

Provide a workflow to create or update a budget line item from a selected quotation.

Before applying a quotation:
- Show the source quotation.
- Show the amount and currency.
- Show the destination budget category.
- Identify any existing related budget item.
- Explain whether the action will create or update a record.
- Let the user confirm the change.

Preserve distinctions between:
- Early planning estimates.
- Supplier quotations.
- Accepted quotations.
- Committed expenses.
- Actual paid amounts.

Do not count the same expense twice when an estimate is replaced by a quotation or when a quotation is later accepted.

Use source identifiers or explicit relationships to trace budget items back to their originating quotation.

When a quotation is revised, do not silently overwrite a historical quotation or previously approved financial record. Preserve the revision history according to the existing persistence model.

Changes must flow through Module 04’s authoritative calculations and appear correctly in Module 01’s dashboard.

### 13. Connect vendor bookings to tasks and timelines

Integrate with Module 06 to help users act on vendor decisions.

Examples:
- An inquiry may create a follow-up task.
- An approaching quotation expiry may warrant a review task.
- A confirmed booking may satisfy an explicitly linked planning prerequisite.
- A required deposit may create a payment task if the user approves it.
- A missing venue confirmation may flag dependent tasks for review.

Only create tasks when the user approves the action or when an established workflow explicitly permits automatic creation.

Prevent duplicate tasks when the same event or quotation is processed repeatedly.

Do not mark a task complete merely because a vendor record changes status unless the task’s completion criteria are genuinely satisfied.

If a booking is cancelled or delayed, identify relevant linked tasks and propose updates for review rather than automatically changing the entire timeline.

### 14. Implement vendor discovery responsibly

If an existing vendor-search provider or approved external search integration is available, implement vendor discovery using that integration.

Display source information and retrieval time when supported. Distinguish search-result information from information independently verified by the user or provider.

Where supported, allow filtering by:
- Service category.
- Event location or service area.
- Budget range.
- Relevant event date.
- Service requirements.

Do not claim real-time availability unless the provider actually returns reliable availability information for the requested date and service.

Do not fabricate:
- Businesses.
- Phone numbers.
- Websites.
- Ratings.
- Reviews.
- Prices.
- Discounts.
- Availability.
- Licenses or certifications.

If no provider is configured, clearly state that live vendor discovery is unavailable and provide the manual vendor-management workflow. Do not simulate a live search with fictional results.

### 15. Backend, persistence, and API requirements

Follow existing application conventions and add only necessary schema changes.

Implement capabilities equivalent to:
- Create and retrieve authorized vendor records.
- Update and archive vendors.
- Create and update quotations.
- Retrieve quotation history.
- Compare selected quotations.
- Record inquiry and follow-up information.
- Update booking-status records.
- Link a quotation to a budget item.
- Create approved vendor-related tasks.
- Retrieve vendor and quotation summaries for a specific event.

Requirements:
- Typed request and response schemas.
- Server-side validation.
- Database migrations where needed.
- Authorization on every vendor, quotation, and event operation.
- Ownership validation for related record identifiers.
- Safe handling of concurrent updates.
- Idempotent operations where repeated requests could create duplicate records.
- Clear error handling.
- Bounded queries and pagination where appropriate.
- Secure handling of uploaded documents and contact details.
- No provider secrets exposed to the frontend.

Never trust client-supplied totals, authorization claims, or quotation verification statuses without server-side validation.

### 16. Security, privacy, and accessibility

Implement:
- Event-level access control.
- Protection against cross-event identifier manipulation.
- Safe file handling if uploads exist.
- Secure external-link handling.
- Server-side validation of URLs and other user-supplied data.
- Protection against prompt injection in vendor descriptions and quotation documents.
- AI output validation before persistence.
- Minimal logging of personal contact details and sensitive documents.
- Error messages that do not reveal secrets or stack traces.

Accessibility requirements:
- Semantic forms and labels.
- Keyboard-operable vendor and quotation tables.
- Clear status labels that do not depend on color alone.
- Accessible comparison layouts on mobile.
- Visible focus indicators.
- Screen-reader-friendly validation messages.
- Loading, empty, error, and retry states.
- Responsive layouts across mobile and desktop.

### 17. Testing requirements

Use the existing test framework.

**Unit tests**
- Quotation total calculations.
- Tax and fee handling.
- Deposit versus total cost.
- Currency-aware comparisons.
- Missing-price and incomplete-quotation handling.
- Expired quotation indicators.
- Vendor and booking status transitions.
- Duplicate expense prevention.
- Quotation-to-budget mapping.
- AI extraction validation.

**Integration tests**
- Vendor CRUD and authorization.
- Quotation creation, revision, and retrieval.
- Cross-event access prevention.
- Quotation comparison with missing information.
- Budget item creation or update from a quotation.
- Preservation of historical quotation data.
- Duplicate-prevention behavior.
- Vendor-related task creation.
- AI provider failure.
- Secure document access, if uploads exist.

**End-to-end tests**
1. Open an existing event.
2. Add two vendors in the same service category.
3. Record a quotation for each vendor.
4. Compare their prices, terms, and included services.
5. Verify incomplete or uncertain fields are clearly identified.
6. Select a quotation and preview the budget impact.
7. Confirm the budget update.
8. Verify Module 04 and Module 01 reflect the authoritative values.
9. Create a vendor follow-up task and verify it appears in Module 06.
10. Update a quotation without destroying its history.
11. Verify unauthorized users cannot access vendor or quotation data.
12. Verify the module remains usable when AI or vendor discovery is unavailable.

Report only tests that were actually executed and their real results.

### 18. Acceptance criteria

This module is complete when:

- Users can create and manage real vendor records.
- Users can record and revise quotations.
- Pricing and fees are handled with currency-aware calculations.
- Incomplete or unverified information is clearly labelled.
- Users can compare quotations without misleading price comparisons.
- AI analysis is grounded in actual source information and validated.
- Inquiry tracking does not falsely claim external messages were sent.
- Booking and contract statuses accurately represent recorded evidence.
- Selected quotations can be linked to budget records without double-counting.
- Relevant vendor actions can connect to tasks and timelines.
- Historical information is preserved appropriately.
- Authorization and privacy controls are implemented.
- The UI is accessible and responsive.
- Relevant automated tests pass.
- No fake vendors, quotations, ratings, or confirmed availability are displayed as real data.

### 19. Implementation workflow

Work in this order:

1. Inspect the current project and Modules 01–06.
2. Identify existing vendor, budget, task, and integration capabilities.
3. Define vendor, quotation, inquiry, and booking contracts.
4. Implement persistence, validation, and authorization.
5. Build vendor directory and vendor detail views.
6. Implement quotation entry and comparison.
7. Add AI-assisted quotation analysis through Module 03.
8. Integrate budget updates through Module 04.
9. Integrate approved follow-up tasks through Module 06.
10. Add vendor discovery only if a real provider is configured.
11. Implement tests and verify end-to-end workflows.
12. Run available linting, type checks, builds, and tests.
13. Fix regressions and provide an implementation report.

The final report must describe what was implemented, files and migrations changed, integrations completed, tests actually run, and any limitations.

**Product principle:** Quveta should help users make informed vendor decisions with clear evidence, honest pricing, and traceable commitments—not just collect supplier names in a list.