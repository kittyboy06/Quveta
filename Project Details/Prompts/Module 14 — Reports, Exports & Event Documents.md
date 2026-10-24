# Module 14 — Reports, Exports & Event Documents
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Implement a complete Reports, Exports & Event Documents module for Quveta, an AI-powered event-planning application.

The goal is to let event organizers transform their existing, saved event information into accurate, well-formatted, downloadable, and printable documents.

Users should be able to generate documents such as:
- Event overview reports.
- Budget summaries and expense breakdowns.
- Task lists and planning timelines.
- Vendor and quotation comparison reports.
- Guest lists and RSVP summaries.
- Seating plans and table assignments.
- Event-day run sheets.
- Invitation and communication summaries.
- Planning progress and outstanding-issues reports.

**Core user story:**

“I have planned my event in Quveta. Now I need reliable documents that I can download, print, or share with the people helping me organize it.”

A generated document must reflect actual saved application data at a clearly identifiable point in time. Never fabricate financial figures, guest responses, vendor quotations, bookings, task statuses, or completed actions.

### 2. Inspect the existing project first

Before coding:

1. Inspect the repository, framework, architecture, existing UI, and database schema.
2. Review Modules 01–13 and identify the authoritative services and data models available.
3. Check for existing export libraries, document-generation utilities, charting tools, and storage services.
4. Reuse existing components, authentication, authorization, design tokens, and API conventions.
5. Preserve the project's existing stack and avoid introducing unnecessary dependencies.
6. Identify which report formats can be generated reliably within the current deployment environment.
7. Keep the existing application functional throughout implementation.

Do not recreate data models or calculation logic that already belong to another module.

### 3. Establish source-of-truth rules

Reports must consume authoritative data from the existing modules.

- **Module 01:** Dashboard summaries and event-level overview.
- **Module 02:** Event details, preferences, dates, location, and planning targets.
- **Module 03:** AI-generated plan content, subject to validation and approval status.
- **Module 04:** Budget targets, line items, amounts, and financial statuses.
- **Module 05:** Approved budget changes and explicitly selected scenario comparisons.
- **Module 06:** Tasks, priorities, deadlines, dependencies, and completion states.
- **Module 07:** Vendor details, quotations, and booking records.
- **Module 08:** Event-day run sheet, incidents, and operational status.
- **Module 09:** Guest records, invitations or RSVP data where authoritative, and attendance counts.
- **Module 10:** Seating arrangements, table capacities, and assignments.
- **Module 11:** Communication drafts, campaign records, and actual delivery statuses.
- **Module 12:** Evidence-backed insights and recommendations, clearly identified as AI-generated where applicable.
- **Module 13:** Relevant notification history and unresolved reminders.

The reporting module formats and exports data. It must not silently recalculate financial totals differently from Module 04 or redefine task and booking statuses.

Where a value is unavailable, show “Not provided,” “Not recorded,” or an equivalent clear label. Do not replace missing information with invented values.

### 4. Build a reports and exports workspace

Create a dedicated Reports & Documents page accessible from the main navigation and individual event pages.

Include:
- Event selector when multiple events exist.
- Report category selector.
- Available document formats.
- Relevant filters and date ranges.
- Preview before downloading.
- Generate and download actions.
- Print-friendly layouts.
- Previously generated documents, where persistence is supported.
- Generation status and useful error messages.

Organize report types into categories such as:

**Planning**
- Event overview.
- Master checklist.
- Task timeline.
- Planning progress.

**Financial**
- Budget summary.
- Category-wise budget breakdown.
- Expense and payment status.
- Budget variance.
- Approved budget scenario comparison.

**People and vendors**
- Guest list.
- RSVP and attendance summary.
- Seating chart or assignment list.
- Vendor directory.
- Quotation comparison.

**Event execution**
- Event-day run sheet.
- Outstanding tasks.
- Open incidents.
- Communication and delivery summary.

Only show report types supported by the available modules and saved data.

Do not display functional-looking download buttons for formats or reports that have not been implemented.

### 5. Implement an event overview report

Generate a concise report containing:
- Event name and type.
- Date, time, and timezone where available.
- Location.
- Expected guest count.
- Planning budget and currency.
- Current planned costs, using Module 04 calculations.
- Outstanding budget amount or overrun.
- Task completion summary.
- Upcoming deadlines.
- Important vendor or quotation statuses.
- Key unresolved planning issues.
- Report generation timestamp.

Show the event's actual planning status rather than assuming the event is ready.

Include an explicit distinction between planned figures, estimates, quotations, committed costs, and amounts paid whenever the selected data supports those distinctions.

If multiple currencies exist, keep them separate unless a verified conversion mechanism is already available.

### 6. Implement financial reports

Create reliable financial documents based on Module 04 and approved changes from Module 05.

Include:
- Budget target.
- Planned expenditure.
- Actual paid amounts, where recorded.
- Remaining budget or overrun.
- Category-wise allocations.
- Individual line items.
- Financial status of each item.
- Recorded vendor quotations and commitments.
- Cost per guest when the guest count is greater than zero.
- Contingency allocation when present.
- Differences between a selected original and revised budget.

Use the authoritative budget service for every financial summary.

Financial rules:
- Never sum amounts across currencies without verified conversion rates.
- Distinguish estimates from confirmed quotations and actual payments.
- Prevent double-counting between quotation, commitment, and payment records.
- Use the existing money representation and currency precision.
- Display negative remaining balances correctly when the budget is exceeded.
- Never imply that a quoted amount has been paid.
- Identify whether the report uses current data or a historical snapshot.

For budget scenario comparisons, include only valid saved scenarios and clearly identify whether they are drafts or approved revisions.

### 7. Implement task and timeline reports

Generate a practical planning checklist and timeline from Module 06.

Include:
- Task name and description.
- Owner or assignee, where supported.
- Priority.
- Status.
- Due date and timezone where relevant.
- Dependencies.
- Overdue status.
- Blocked tasks.
- Completion information, where recorded.

Provide useful filters:
- All tasks.
- Outstanding tasks.
- Overdue tasks.
- Critical and high-priority tasks.
- Completed tasks.
- Tasks due within a selected date range.

Preserve dependency relationships when exporting tasks.

For printable checklists, provide readable spacing and room for manual notes where appropriate.

For timeline reports, distinguish the planned date from any actual completion date that is recorded.

Do not claim that a task has been completed merely because a recommendation or reminder was generated.

### 8. Implement vendor and quotation reports

Generate vendor directories and quotation comparison documents using Module 07.

A vendor report may include:
- Vendor name and service category.
- Contact details, subject to authorization.
- Inquiry or booking status.
- Relevant notes.
- Recorded quotation details.

A quotation comparison may include:
- Vendor and quotation identifiers.
- Quoted amount and currency.
- Taxes, fees, and additional charges when recorded.
- Deposit and payment terms when recorded.
- Expiry date.
- Included and excluded services.
- Recorded cancellation terms.
- Current quotation or booking status.
- Important differences and missing information.

Never invent missing prices, terms, contact details, or vendor availability.

Clearly label incomplete quotation data. Do not present a vendor inquiry or accepted quotation as a confirmed booking unless the source record confirms that status.

If AI-generated comparison commentary is included, keep it separate from the recorded facts and label it as AI-generated analysis.

### 9. Implement guest and seating exports

Generate guest and seating documents using Modules 09 and 10.

Support:
- Guest list.
- RSVP status summary.
- Attendance summary.
- Dietary and accessibility requirements, when authorized.
- Table assignments.
- Unassigned guests.
- Table capacities and occupancy.
- Seating conflict summary.

Guest-count rules:
- Use the authoritative RSVP and attendance rules from Module 09.
- Do not equate invitation delivery with an RSVP.
- Do not equate a household invitation with a single attendee if multiple guests are represented.
- Distinguish expected attendance from confirmed attendance.
- Exclude or identify cancelled responses according to existing business rules.

Privacy rules:
- Export only fields needed for the selected report.
- Warn users when an export contains personal or sensitive guest information.
- Require appropriate authorization.
- Do not expose dietary or accessibility details in a general event summary unnecessarily.
- Do not create public download links for private guest data.
- Ensure exported files are not accessible across unauthorized events or accounts.

Provide a compact print layout for authorized event staff where appropriate.

### 10. Implement the event-day run sheet

Generate an operational document using Module 08 and its authoritative task and timeline data from Module 06.

Include:
- Event name, date, timezone, and venue.
- Chronological schedule.
- Activity and task descriptions.
- Start and end times where recorded.
- Assigned person or vendor where supported.
- Dependencies or prerequisites.
- Critical activities.
- Current status.
- Relevant contact details, subject to authorization.
- Important operational notes.
- Open incidents and their current statuses.

Make the document practical for printing and quick reference on a phone.

Do not invent activity times or assume missing contacts are available.

Clearly distinguish the approved run sheet from proposed schedule revisions.

If a schedule change has been suggested but not approved, do not silently incorporate it into the official run sheet.

### 11. Implement communication and planning-status reports

Where useful, provide reports covering:
- Invitation campaign status.
- Actual send attempts and delivery outcomes.
- Failed communications requiring attention.
- Unresolved planning reminders.
- Open incidents.
- Outstanding decisions.
- AI-generated recommendations awaiting review.

Use the real records from Modules 11, 12, and 13.

Distinguish:
- Drafted.
- Approved.
- Queued.
- Accepted by a provider.
- Delivered, when confirmed by the provider.
- Failed.

Use only statuses supported by the underlying integration.

Do not include full message contents or personal contact information unless needed and authorized.

### 12. Support useful export formats

Implement formats that suit the selected report and existing project capabilities.

**PDF**
- Preferred for printable reports, run sheets, seating plans, and shareable summaries.
- Include clear headings, pagination, and appropriate page breaks.
- Avoid splitting important table rows where practical.
- Add event identity and report-generation time.
- Include page numbers where supported.

**CSV**
- Suitable for tabular data such as guest lists, tasks, budget items, and vendor records.
- Use stable column names.
- Escape delimiters, quotes, and line breaks correctly.
- Use consistent date and numeric formats.
- Protect against spreadsheet formula injection by safely handling untrusted values beginning with formula-triggering characters.
- Clearly document the encoding and export scope where necessary.

**Excel-compatible spreadsheet**
- Implement XLSX only if a suitable library is available or can be safely added.
- Use appropriate data types, column headers, readable widths, and sensible number formats.
- Keep currency values and dates interpretable.
- Do not create misleading formulas or untrusted spreadsheet expressions.

**Print**
- Provide a dedicated print stylesheet or print-friendly view.
- Hide navigation, buttons, dialogs, and unrelated interface elements when printing.
- Preserve headings, table readability, and page breaks.

Do not implement fake file formats. If XLSX is not supported, provide a working CSV alternative and document the limitation.

### 13. Create a report preview and generation workflow

Use the following flow:

1. User selects an event.
2. User selects a report type.
3. User configures supported filters and date ranges.
4. The backend checks access and retrieves authoritative data.
5. The system validates the report data.
6. The user sees a preview or report summary.
7. The user generates or downloads the selected format.
8. The application records generation metadata when supported.

The preview and downloaded document must use the same validated dataset or snapshot.

Avoid a race condition where the preview shows one version of the data and the generated file silently contains another.

For reports requiring multiple modules, define a clear data snapshot boundary or record the generation time and source revision identifiers where available.

Do not require an AI call to produce ordinary reports, calculations, CSV files, or print layouts.

### 14. Add optional AI-assisted summaries

Reuse Module 03 for orchestration and Module 12 for evidence-backed insight generation.

AI may help:
- Summarize planning progress.
- Explain significant budget differences.
- Highlight unresolved risks.
- Summarize quotation differences.
- Turn recorded issues into a concise executive summary.
- Explain outstanding decisions in plain language.

AI must not:
- Invent missing report data.
- Recalculate authoritative financial totals.
- fabricate vendor information or quotations.
- Claim an action has occurred when it has not.
- Hide important risks because they make the report look better.
- silently change approved plans.

Separate factual data tables from AI-generated commentary.

Where possible, retain links or references to the underlying records that support each important recommendation.

If the AI provider is unavailable, ordinary report generation and downloads must still work.

### 15. Report history and document management

If the existing architecture supports document storage, maintain a report history containing:
- Document ID.
- Event ID.
- Report type.
- File format.
- Creation timestamp.
- Creator.
- Relevant filters.
- Source snapshot or revision metadata.
- Generation status.
- File reference, where stored.

Provide actions to regenerate or download a report, subject to authorization and file availability.

Do not store sensitive exports indefinitely without a clear need and retention policy.

If files are stored externally:
- Use private storage by default.
- Validate access permissions.
- Use short-lived signed download URLs when appropriate.
- Apply retention and deletion rules.
- Prevent unauthorized cross-event access.

If persistent file storage is unavailable, support secure on-demand generation rather than pretending that files have been saved permanently.

### 16. Backend and architecture requirements

Follow the established architecture and existing module boundaries.

Implement only the necessary:
- Report-generation service.
- Typed report data contracts.
- Format-specific renderers.
- Export endpoints.
- Authorization checks.
- Validation schemas.
- Optional report-history persistence.
- Optional private file-storage integration.

Keep data retrieval separate from rendering.

Use reusable report templates where practical rather than duplicating calculations and formatting rules.

Requirements:
- Server-side authorization.
- Validated report parameters.
- Bounded date ranges and export sizes.
- Pagination or streaming for large datasets where appropriate.
- Safe file naming.
- Correct content types.
- Secure download handling.
- Consistent error responses.
- Timezone-aware formatting.
- No exposed server credentials.
- No arbitrary filesystem paths supplied by the user.

Avoid loading unlimited guest or task records into memory for large exports.

### 17. Accessibility and design requirements

Maintain Quveta's existing visual design and component system.

The reports workspace should be:
- Responsive.
- Keyboard accessible.
- Screen-reader friendly.
- Easy to scan.
- Suitable for organizers who are not technically experienced.

Include:
- Clear report descriptions.
- Accessible filters.
- Visible focus states.
- Proper table headers.
- Descriptive download labels.
- Meaningful error messages.
- Loading and empty states.
- Clear distinction between previewing and downloading.

Ensure exported PDFs and printable reports use readable typography, sufficient contrast, and meaningful document structure where supported.

Do not rely on color alone to indicate budget overruns, task priorities, or RSVP status.

### 18. Testing requirements

Use the existing testing framework.

**Unit tests**
- Report data transformation.
- Financial summary consistency with Module 04.
- Currency separation.
- Missing-data handling.
- RSVP and guest-count logic.
- Task filtering and sorting.
- Date and timezone formatting.
- CSV escaping.
- Spreadsheet formula-injection protection.
- File naming and MIME types.
- Report filter validation.

**Integration tests**
- Authorization for report requests.
- Multi-module report assembly.
- PDF generation.
- CSV generation and parsing.
- XLSX generation if implemented.
- Download permissions.
- Report snapshot consistency.
- Private storage access, if supported.
- Handling missing or unavailable module data.
- AI summary failure without breaking ordinary exports.

**End-to-end tests**
1. Create an event and generate an overview report.
2. Add budget items and verify financial totals match the budget module.
3. Generate an outstanding-task checklist.
4. Generate a vendor quotation comparison from actual quotation records.
5. Export a guest list and verify unauthorized fields are excluded.
6. Generate a seating report and verify table capacity.
7. Generate a printable run sheet.
8. Verify a proposed but unapproved schedule change does not replace the approved run sheet.
9. Download CSV and verify special characters are escaped correctly.
10. Attempt unauthorized access to another event's export.
11. Verify missing information is clearly identified rather than invented.
12. Verify reports still work when the AI provider is unavailable.

Run the relevant checks and report the actual results. Never claim a test passed if it was not executed.

### 19. Acceptance criteria

The module is complete when:

- Users can select an event and generate supported reports.
- Reports use real, authorized, persisted application data.
- Financial totals match Module 04.
- Guest counts and RSVP statuses match Module 09.
- Seating data matches Module 10.
- The event-day run sheet reflects the approved schedule.
- PDF and CSV exports work for the report types that advertise them.
- XLSX is available only if genuinely implemented.
- Reports handle missing and incomplete information honestly.
- Private guest and vendor information is protected.
- Exported files cannot be accessed by unauthorized users.
- AI-generated commentary is distinguishable from recorded facts.
- The system remains useful without an AI provider.
- Relevant automated tests pass.
- No fake downloads, invented report contents, or misleading delivery claims remain.

### 20. Implementation workflow

Proceed in this order:

1. Inspect the project and Modules 01–13.
2. Identify authoritative services, schemas, and available export libraries.
3. Define report types and validated data contracts.
4. Implement the report data assembly layer.
5. Implement the reports workspace and preview.
6. Implement PDF generation and print layouts.
7. Implement CSV exports with safe escaping.
8. Implement XLSX only if justified and supported.
9. Add budget, task, vendor, guest, seating, and run-sheet reports.
10. Add optional AI summaries using existing AI services.
11. Implement report history and secure storage if supported.
12. Add authorization and privacy safeguards.
13. Write and run automated tests.
14. Run linting, type checks, builds, and relevant end-to-end tests.
15. Fix regressions and verify actual downloads.

At completion, provide an implementation report listing:
- Features completed.
- Files and database migrations changed.
- Supported report types and formats.
- Security and privacy safeguards.
- Integrations completed.
- Tests actually executed and their results.
- Known limitations and remaining work.

**Product principle:** Every Quveta report should be accurate enough to act on, clear enough to share, and honest about what is known, estimated, missing, or still awaiting approval.