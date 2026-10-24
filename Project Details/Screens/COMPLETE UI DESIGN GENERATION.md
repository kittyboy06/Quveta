# QUVETA × GOOGLE STITCH — COMPLETE UI DESIGN GENERATION PROMPT

## Role

Act as a senior UI/UX designer, design systems architect, and frontend implementation specialist working on **Quveta**, an AI-powered event-planning web application.

You have access to Google Stitch through MCP and potentially related installed skills. You MUST use the available Stitch skills and Stitch MCP tools to design the application.

Do not merely describe a design, generate a generic mockup, or jump directly into coding without using the available design tools.

Your task is to transform the attached Quveta reference image into a coherent, polished, multi-screen web application design that can subsequently be implemented in the existing project.

---

## PHASE 1 — DISCOVER AND INITIALIZE STITCH

Before generating anything:

1. Inspect the available skills relevant to Google Stitch, UI design, frontend implementation, and design-to-code workflows.
2. Read the relevant Stitch skill instructions in full before using their workflows.
3. Inspect the currently available MCP tools and identify the actual Google Stitch tools.
4. Determine which tools support:
   - Creating a design project.
   - Generating UI screens.
   - Editing or refining screens.
   - Reusing design references.
   - Maintaining consistent styles across screens.
   - Previewing, exporting, or retrieving generated designs.
   - Generating frontend code or design assets, if supported.
5. Use the actual tool names, schemas, and capabilities discovered from the installed environment.
6. If a Stitch project already exists for Quveta, inspect and reuse it where possible rather than creating duplicates.
7. If the generated reference image is available as an attachment, use it as the visual reference through the supported Stitch workflow.

**Mandatory tool usage:** Invoke the available Stitch MCP tools to perform the design work. Reading documentation or writing a design prompt alone does not satisfy this requirement.

Do not invent MCP tool names, claim to have used tools that are unavailable, or assume that an unsupported export capability exists.

If a required tool is unavailable, explain the limitation and continue with the closest supported Stitch workflow.

---

## PHASE 2 — PRODUCT CONTEXT

### Product name

Quveta

### Tagline

"Your events. Your vision. Intelligently planned."

### Product concept

Quveta is an AI-powered event-planning platform for weddings, birthdays, engagements, college events, corporate events, and community gatherings.

It helps users:

- Create and manage events.
- Generate personalized event plans.
- Manage budgets and expenses.
- Simulate budget changes and understand trade-offs.
- Track tasks, dependencies, and deadlines.
- Manage vendors and quotations.
- Coordinate event-day activities.
- Manage guests, RSVPs, and seating.
- Prepare invitations and communications.
- Receive AI-powered insights and notifications.
- Generate reports and export event documents.

### Signature differentiator

The most important feature is the **Adaptive Budget Simulator**.

Users should be able to change their budget or guest count, compare the original plan against a proposed alternative, understand the trade-offs, accept or reject individual recommendations, and approve the resulting changes.

The design must communicate that the AI recommends changes while the user remains in control.

Do not make Quveta look like a generic chatbot wrapped around a dashboard. It should feel like a complete, intelligent event-management workspace.

---

## PHASE 3 — DESIGN REFERENCE ANALYSIS

Study the attached Quveta reference image.

Extract and preserve its strongest visual characteristics:

- White and light lavender surfaces.
- Deep purple primary actions.
- Soft borders and subtle shadows.
- Rounded cards and controls.
- Clear left-side navigation.
- Compact top navigation with search and notifications.
- Clean typography and generous spacing.
- Structured cards, tables, forms, and progress indicators.
- Professional SaaS dashboard composition.

Use the reference as a design direction, not as a screenshot to reproduce pixel for pixel.

Improve visual consistency, spacing, typography, alignment, accessibility, information hierarchy, and responsiveness where necessary.

Do not put the reference image itself inside the final app as a substitute for real UI.

---

## PHASE 4 — CREATE A REUSABLE DESIGN SYSTEM IN STITCH

Use Stitch MCP to establish the foundational visual system before generating the full set of screens.

### Color direction

- Primary: deep purple.
- Secondary: light lavender.
- Background: white and very light neutral gray.
- Main text: dark charcoal.
- Secondary text: muted gray.
- Success: accessible green.
- Warning: accessible amber.
- Error: accessible red.
- Borders: subtle neutral gray.

Define actual color values using the supported Stitch design workflow.

Avoid excessive gradients, neon colors, decorative glassmorphism, and unnecessarily colorful cards.

### Typography

Use a modern, readable sans-serif typeface.

Establish consistent styles for:

- Page titles.
- Section headings.
- Card headings.
- Body text.
- Labels.
- Helper text.
- Table content.
- Financial figures.
- Status labels.

### Components

Create reusable design patterns for:

- Desktop sidebar.
- Mobile navigation.
- Top navigation bar.
- Search.
- Notification indicator.
- User profile menu.
- Buttons.
- Form fields.
- Select controls.
- Date and currency inputs.
- Tabs.
- Cards.
- Data tables.
- Status badges.
- Progress indicators.
- Budget summaries.
- Charts.
- Dialogs.
- Drawers.
- Confirmation prompts.
- Empty states.
- Loading states.
- Error states.
- Toast messages.

Use Stitch's actual reusable-style or component capabilities where available.

If a capability is not supported, document the intended shared component structure for frontend implementation.

---

## PHASE 5 — GENERATE THE FOLLOWING UI SCREENS

Use Stitch MCP to create the screens individually or in logical batches, according to the available tools.

Maintain a consistent design system across all screens.

### Screen 1 — Dashboard

Design a high-quality event-planning dashboard.

Include:

- Welcome message.
- Create Event button.
- Total events.
- Upcoming tasks.
- Budget alerts.
- Invitation or RSVP summary where data exists.
- Event cards with dates, locations, guest counts, and budget progress.
- Upcoming deadlines.
- Overdue tasks.
- Important planning alerts.

Use realistic demonstration data, clearly understood as sample data for the design.

The dashboard should be informative without becoming visually crowded.

### Screen 2 — Create Event

Create an intuitive event-creation wizard.

Include:

- Event name.
- Event type.
- Date and time.
- Timezone.
- Guest count.
- Budget and currency.
- Venue or location.
- Event style and theme.
- Indoor or outdoor preference.
- Must-have requirements.
- Flexible preferences.
- Accessibility and dietary requirements where relevant.

Use clear steps and a visible progress indicator.

Avoid overwhelming users with every preference on the first screen.

### Screen 3 — AI Planning Workspace

Design an event-specific AI planning page.

Include:

- Event summary.
- Plan overview.
- Proposed budget.
- Tasks and timeline.
- Vendor considerations.
- Milestones.
- Personalized recommendations.
- Assumptions and missing information.
- Regenerate or refine plan actions.

Visually distinguish proposed AI content from approved plan data.

Avoid making unsupported claims about vendor availability or verified prices.

### Screen 4 — Budget Management

Design a financial management workspace.

Include:

- Total budget.
- Planned expenditure.
- Actual paid amount where available.
- Remaining budget or overrun.
- Category breakdown.
- Budget line-item list.
- Financial statuses.
- Add and edit actions.
- Filters for categories and statuses.

Use clear number formatting and currency labels.

Do not represent estimated expenditure as money already paid.

### Screen 5 — Adaptive Budget Simulator

Treat this as the signature Quveta screen.

Create a highly polished, decision-focused interface.

Include:

- Current budget.
- Proposed budget.
- Current guest count.
- Proposed guest count.
- Current and revised cost per guest where calculable.
- Category-level comparison.
- Fixed versus variable cost distinctions where known.
- AI-generated recommendations.
- Estimated savings or additional costs.
- Explanations of the trade-offs.
- Individual Accept and Reject actions.
- An Apply Approved Changes action.
- A summary of what will change before confirmation.

The design should clearly communicate:

**Current Plan → Proposed Scenario → Review Trade-offs → Approve Changes**

Use accessible indicators for increases, decreases, warnings, and protected priorities.

Do not automatically apply suggestions in the UI concept.

Do not imply that estimates are confirmed quotations.

### Screen 6 — Tasks and Timeline

Include:

- Timeline view.
- Task list.
- Deadlines.
- Priority indicators.
- Completion status.
- Dependencies.
- Overdue and blocked tasks.
- Calendar or board view where useful.
- Add Task action.
- Delay impact and recovery suggestions.

Show relationships between dependent tasks without making the interface too complicated.

### Screen 7 — Vendor and Quotation Management

Include:

- Vendor directory.
- Vendor categories.
- Contact information where appropriate.
- Inquiry and booking statuses.
- Quotation comparison.
- Price and fee breakdowns.
- Deposit and payment terms when recorded.
- Missing information indicators.
- Follow-up actions.

Make it easy to compare quotations while clearly distinguishing quoted prices from confirmed bookings.

### Screen 8 — Event-Day Run Sheet

Create an operational event-day interface.

Include:

- Event details.
- Chronological schedule.
- Start and end times.
- Activity descriptions.
- Assigned staff or vendors.
- Task statuses.
- Critical milestones.
- Open incidents.
- Delay notifications.
- Approved schedule revisions.

Prioritize readability, fast scanning, and mobile usability.

### Screen 9 — Guest Management

Include:

- Guest list.
- Search and filters.
- Guest or household records.
- Invitation status.
- RSVP status.
- Confirmed attendance.
- Tentative responses.
- Declined responses.
- Unanswered invitations.
- Import and export actions.

Use synthetic sample data.

Do not display unnecessary personal information.

### Screen 10 — Seating Planner

Include:

- Tables or seating areas.
- Table capacities.
- Assigned guests.
- Unassigned guests.
- Occupancy indicators.
- Seating conflicts.
- Guest preferences where appropriate.

Use a visual seating layout if supported by Stitch. Otherwise, design a clear table-based alternative.

Do not sacrifice usability for decorative floor-plan graphics.

### Screen 11 — Invitations and Communications

Include:

- Invitation templates.
- Message editor.
- Personalization fields.
- Preview.
- Recipient selection.
- Draft and approval statuses.
- Delivery history.
- RSVP links where supported.

Clearly distinguish a prepared draft from a message that has actually been sent.

### Screen 12 — AI Insights and Decision Assistant

Design an event-specific assistant workspace.

Include:

- A question input.
- Suggested questions.
- Evidence-backed insights.
- Budget and schedule risks.
- Relevant source-record references.
- Proposed actions.
- Explicit confirmation before consequential changes.

The interface should make it clear when a statement is a recommendation rather than a verified fact.

### Screen 13 — Notifications and Automation

Include:

- Notification center.
- Read and unread notifications.
- Severity and categories.
- Relevant event links.
- Reminder rules.
- Notification preferences.
- Quiet hours.
- Automation status.
- Recent execution history where available.

Avoid creating an overwhelming stream of low-priority notifications.

### Screen 14 — Reports and Exports

Include:

- Event overview report.
- Budget report.
- Guest list.
- Task checklist.
- Vendor comparison.
- Seating plan.
- Event-day run sheet.
- Report preview.
- Format selection.
- Generate and download actions.

Design PDF, CSV, or spreadsheet options only where the implementation supports them.

### Screen 15 — Settings and Security

Include:

- Account preferences.
- Default currency.
- Timezone and date format.
- Notification preferences.
- Connected integrations where applicable.
- Privacy and security controls.
- Account management.
- Sign-out.

Do not display controls that cannot be implemented.

### Screen 16 — Authentication

Create coordinated sign-in and registration experiences.

Include:

- Quveta branding.
- Clear forms.
- Validation states.
- Password visibility control where applicable.
- Loading and error states.
- Forgot-password workflow if supported.
- Appropriate mobile layouts.

Do not invent authentication capabilities that the existing backend does not support.

---

## PHASE 6 — SCREEN-TO-SCREEN CONSISTENCY

Use Stitch MCP to review and refine the generated screens.

Verify:

- Identical sidebar structure.
- Consistent navigation labels.
- Consistent typography and spacing.
- Reusable buttons and input controls.
- Consistent card radii and borders.
- Consistent status colors.
- Consistent page-header placement.
- Consistent table and chart styles.
- Consistent responsive behavior.
- Clear hierarchy between event-level and application-level navigation.

Do not let each screen become a visually independent design.

Make the adaptive budget simulator stand out through its decision-making workflow, not through an unrelated color palette.

---

## PHASE 7 — RESPONSIVE DESIGN

Generate or refine desktop and mobile layouts using Stitch's supported capabilities.

### Desktop

- Persistent sidebar.
- Full-width working area.
- Multi-column dashboards where appropriate.
- Readable tables.
- Clear page-level actions.

### Tablet

- Reduced sidebar width or collapsible navigation.
- Reflowed card grids.
- Accessible forms.
- Tables that remain usable.

### Mobile

- Compact navigation.
- Single-column content where appropriate.
- Touch-friendly controls.
- Readable financial figures.
- Horizontally scrollable or card-based alternatives for dense tables.
- Accessible dialogs and confirmations.
- A practical mobile run sheet.

Do not simply shrink the desktop design.

---

## PHASE 8 — REVIEW AND REFINE USING STITCH MCP

After generating the first version:

1. Inspect the available previews or screen outputs.
2. Identify inconsistent components and layout problems.
3. Refine screens through the actual Stitch MCP editing workflow.
4. Fix visual hierarchy and spacing.
5. Ensure the budget simulator communicates the approval process.
6. Check the dashboard for information overload.
7. Ensure the guest-management and financial screens remain readable.
8. Refine mobile layouts where supported.
9. Confirm that the screens form a consistent application.
10. Save or retain the final design project using the supported Stitch capabilities.

Do not stop after generating the first screen.

Perform at least one actual refinement pass when the available tools support editing or regeneration.

---

## PHASE 9 — DESIGN HANDOFF

When the designs are complete, retrieve the available outputs through Stitch MCP.

Depending on actual tool support, provide:

- Stitch project identifier or project reference.
- Generated screen identifiers.
- Screen previews or links.
- Design tokens and styling conventions.
- Component inventory.
- Layout and responsive behavior notes.
- Exported assets.
- Frontend code or implementation references, if available.

Do not invent project IDs, URLs, export files, or code outputs.

If Stitch supports code generation, inspect the generated code before recommending that it be merged into the existing application.

If code generation is unavailable, provide an implementation-ready design specification based on the generated screens.

Do not overwrite the existing application or replace its working architecture merely to accommodate generated design output.

---

## PHASE 10 — FINAL REPORT

After completing the Stitch workflow, provide a concise report containing:

### A. Tool usage

- Stitch skills discovered and read.
- Stitch MCP tools actually invoked.
- Design creation and refinement operations completed.
- Any unavailable capabilities.

### B. Design deliverables

- Screens successfully generated.
- Screens refined.
- Shared design system created.
- Responsive layouts created.
- Actual project references or export locations returned by Stitch.

### C. Implementation readiness

- Existing components that can be reused.
- Components requiring implementation.
- Backend functionality needed by each screen.
- Important interaction and validation requirements.
- Known design or integration gaps.

### D. Next step

Recommend the smallest, safest sequence for implementing the approved designs in the existing Quveta codebase.

Do not claim a screen was generated, saved, exported, or implemented unless the corresponding operation actually succeeded.

---

## EXECUTION RULE

Begin by discovering the Stitch skills and MCP tools. Read the relevant instructions, then use Stitch MCP to create the Quveta design project and generate the screens.

**Do not stop at a written plan. Execute the available Stitch design workflow, inspect the outputs, refine them, and report the actual deliverables.**

The final result should be a consistent, modern, implementation-ready Quveta design system with special emphasis on the Adaptive Budget Simulator.
