# Module 12 — AI Event Insights & Decision Assistant
## Quveta | Antigravity Implementation Prompt

### 1. Objective

Build Quveta's cross-module AI Event Insights & Decision Assistant.

This module gives event organizers one place to ask questions about their event, understand its current state, identify risks, explore options, and receive actionable recommendations based on their actual saved data.

The assistant must understand the context of an event across Modules 01–11, including:
- Event details and preferences.
- AI-generated and approved plans.
- Budget records and financial scenarios.
- Tasks, deadlines, and dependencies.
- Vendors, quotations, and booking statuses.
- Event-day run sheets and incidents.
- Guest records and RSVP counts.
- Seating arrangements.
- Invitations and communication history.

**Core user story:**

“I want to ask Quveta a question about my event and receive an accurate, useful answer grounded in my current plan—with clear explanations, relevant evidence, and next steps I can choose to take.”

Example questions:
- “What are the three most urgent things I need to do this week?”
- “Are we currently over budget, and why?”
- “Which tasks could be delayed if the venue confirmation slips?”
- “How many guests have confirmed, and how many still need to respond?”
- “Which quotations are incomplete or need follow-up?”
- “What should I review if the guest count increases by 30?”
- “Are there any unresolved seating requirements?”
- “What could go wrong with the current schedule?”
- “Summarize the decisions I still need to make.”

The assistant must answer from the application's authoritative records, identify missing information, and distinguish facts from estimates and recommendations.

This must be a working AI feature—not a generic chatbot that responds without consulting the event data.

### 2. Inspect the existing project first

Before implementation:

1. Inspect the repository, current architecture, database schema, authentication, AI integration, and testing framework.
2. Review Modules 01–11 and identify their existing service interfaces and authoritative data sources.
3. Reuse Module 03's AI orchestration service instead of creating a separate AI provider integration.
4. Reuse existing authentication, validation, persistence, and UI conventions.
5. Identify which cross-module summaries and operations already exist.
6. Implement incrementally without replacing working functionality.

Do not build duplicate budget calculations, task engines, RSVP logic, vendor records, or scheduling services.

### 3. Define the assistant's responsibilities

The assistant owns:
- Natural-language question handling.
- Retrieval and organization of relevant event context.
- Cross-module analysis.
- Evidence-grounded explanations.
- Risk and inconsistency summaries.
- Structured recommendations.
- Suggested next actions.
- Conversation history where appropriate.
- User-reviewed action proposals.

The assistant does **not** own authoritative event, budget, task, guest, vendor, or seating records.

Use the existing modules as sources of truth:

- Module 02 owns event details.
- Module 03 owns shared AI orchestration.
- Module 04 owns financial records and calculations.
- Module 05 owns budget scenarios and approved budget changes.
- Module 06 owns task scheduling and dependency logic.
- Module 07 owns vendor and quotation records.
- Module 08 owns operational run sheets and incident records.
- Module 09 owns guest and RSVP data.
- Module 10 owns seating plans and assignments.
- Module 11 owns communication drafts and delivery history.
- Module 01 provides dashboard-level summaries.

Where a module already exposes a reliable calculation or query service, call that service instead of independently reconstructing its logic.

### 4. Build the AI assistant interface

Create a dedicated assistant interface accessible from an event detail page and, where appropriate, the main application navigation.

Include:
- A clear conversation area.
- A message input.
- A send action.
- Loading and processing states.
- Error and retry states.
- Suggested questions.
- Context indicating which event the assistant is discussing.
- Evidence references for relevant claims.
- Action cards for useful next steps.
- A clear way to start a new conversation or switch events.

Provide useful suggested questions based on available event data rather than showing irrelevant generic prompts.

For example:
- If tasks are overdue, suggest reviewing urgent tasks.
- If quotations are awaiting responses, suggest vendor follow-up.
- If many guests have not responded, suggest an RSVP review.
- If the budget exceeds its target, suggest reviewing spending options.

Suggestions must reflect actual records and must not expose information the user is not authorized to access.

Support mobile and desktop layouts, keyboard navigation, accessible message announcements, and clear error recovery.

### 5. Implement event-context retrieval

Before generating an answer, retrieve only the relevant authorized information from the selected event.

Create a context-assembly service that can obtain information such as:
- Event name, date, location, timezone, and preferences.
- Budget target, planned expenditure, paid amounts, and remaining budget.
- Active budget scenarios and their approval status.
- Overdue tasks, upcoming deadlines, blockers, and dependencies.
- Vendor records, quotation status, and recorded booking information.
- Run-sheet items, schedule conflicts, and unresolved incidents.
- Confirmed attendance, unanswered RSVPs, and guest requirements.
- Seating assignments and validation warnings.
- Communication campaigns and actual delivery statuses.

Use existing services and query functions wherever possible.

Do not load the entire database into the model for every question. Retrieve the smallest useful context needed to answer accurately.

Apply authorization before data enters the AI context. Never rely on the model itself to enforce access control.

If a relevant module is unavailable or a query fails, explain the limitation rather than silently substituting invented information.

### 6. Ground answers in evidence

Every substantive answer about an event must be based on retrieved application data, explicitly identified user-provided information, or a clearly labelled inference.

Where practical, provide evidence references such as:
- Budget summary.
- Specific budget item.
- Task title and due date.
- Vendor quotation record.
- RSVP summary.
- Seating validation result.
- Run-sheet activity.
- Incident record.
- Communication delivery record.

References should link to the relevant record or module when the existing routing and authorization model supports it.

Each answer should distinguish between:

**Verified application facts**
Information directly retrieved from authoritative saved records.

**Calculated results**
Values produced by deterministic application services, such as outstanding task counts or budget totals.

**Estimates**
Values based on incomplete information or explicit assumptions.

**Recommendations**
Actions the assistant suggests but that have not yet been approved or completed.

**Unknown information**
Facts that are missing, unavailable, stale, or not independently confirmed.

Do not claim that a vendor has confirmed availability merely because a quotation exists. Do not claim that an invitation was delivered merely because a draft exists.

When a question cannot be answered reliably, say what is missing and ask a focused clarification question.

### 7. Build cross-module insights and risk detection

Create a structured insights service that identifies actionable issues across modules.

Examples include:

**Budget risks**
- Planned spending exceeds the target.
- Important quotations are incomplete.
- Significant costs remain estimates.
- A proposed budget scenario has not been approved.
- A budget item may be counted twice or lacks a clear source relationship.

**Timeline risks**
- Critical tasks are overdue.
- A prerequisite is incomplete.
- A deadline conflicts with a dependency.
- An event date change may make a task infeasible.
- A run-sheet activity has insufficient preparation time.

**Vendor risks**
- A required vendor confirmation is missing.
- A quotation has expired.
- Important fees or service inclusions are unknown.
- A booking status is still awaiting confirmation.

**Guest risks**
- Many invitations remain unanswered.
- Confirmed attendance differs materially from the planned guest count.
- Important dietary or accessibility requirements remain unresolved.
- Seating capacity is insufficient for confirmed attendees.

**Communication risks**
- A required message remains a draft.
- A campaign has delivery failures.
- Event details changed after an invitation was prepared.
- An RSVP deadline is approaching.

Do not present every warning as equally important.

Prioritize insights using transparent rules that consider urgency, impact, deadlines, dependencies, and confidence in the underlying evidence.

Do not invent a numerical risk score without a documented calculation and clear interpretation.

Where information is incomplete, label the insight as a potential risk rather than a confirmed problem.

### 8. Create an explainable recommendation engine

Recommendations should identify:
- What needs attention.
- Why it matters.
- Which saved records support the recommendation.
- The likely consequence of inaction.
- The suggested next step.
- Any assumptions or uncertainties.
- Whether the action is reversible.
- Which module should handle the action.

Example:

**Recommendation:** Follow up on the venue quotation.

**Reason:** The event is approaching, but the venue record still shows that confirmation is pending.

**Potential impact:** Several venue-dependent tasks may remain unresolved.

**Next step:** Review the quotation and prepare a follow-up message.

**Evidence:** The actual vendor record and dependent tasks.

This is a recommendation, not proof that the venue will be unavailable.

Avoid generic recommendations such as “plan ahead” when a specific, evidence-backed action is possible.

Do not overwhelm the user with dozens of low-value suggestions. Prioritize a small set of meaningful actions and let the user request more detail.

### 9. Implement natural-language question answering

Allow users to ask free-form questions about their event.

The assistant should:
1. Identify the selected event and the user's question.
2. Determine which records or services are relevant.
3. Retrieve authorized context.
4. Calculate any required metrics using application code.
5. Ask the AI to synthesize the retrieved evidence.
6. Validate any structured references or action proposals.
7. Return a clear answer with relevant evidence and next steps.

Support follow-up questions that refer to the existing conversation, while refreshing relevant application data before answering questions about current state.

For example:

User: “Are we over budget?”

Assistant: Provides the current authoritative budget summary.

User: “What if we add 30 guests?”

Assistant: Explains which costs may change based on documented variable-cost assumptions and offers to open a budget scenario.

The assistant must not treat a previous response as permanently current when the underlying event records may have changed.

### 10. Keep arithmetic and business rules deterministic

Never delegate authoritative calculations to the language model.

Use existing application services for:
- Budget totals and remaining amounts.
- Cost per guest.
- Confirmed attendance.
- Outstanding RSVP counts.
- Task progress.
- Overdue task counts.
- Dependency analysis.
- Date and timezone calculations.
- Table capacity.
- Quotation totals.
- Communication delivery summaries.
- Schedule conflicts.

The AI may explain these results in natural language but must not invent or silently recalculate them.

For financial comparisons, respect currency and monetary precision. Do not combine currencies without a verified conversion policy.

For date-sensitive questions, use the correct event timezone and current time supplied by a trusted application service.

If a calculation cannot be performed because required information is missing, return the limitation clearly.

### 11. Support user-controlled actions

The assistant should help users move from insight to action without becoming an uncontrolled automation agent.

Support action proposals such as:
- Open a budget scenario.
- Review overdue tasks.
- Prepare a vendor follow-up.
- Draft an RSVP reminder.
- Review unresolved seating conflicts.
- Prepare an event-update message.
- Create a proposed schedule adjustment.
- Open the relevant quotation or guest record.

Where supported, provide a direct link to the appropriate module or an explicit action card.

For actions that modify data:
1. Build a structured proposal.
2. Validate the proposal server-side.
3. Show the intended changes.
4. Let the user edit or reject the proposal.
5. Require explicit confirmation.
6. Execute the action through the owning module's service.
7. Report the actual result.

Never let the model directly execute arbitrary database writes or bypass module authorization.

Do not send messages, apply budget changes, reassign guests, modify schedules, or change bookings merely because the user asked a broad informational question.

### 12. Implement a structured action contract

Use the existing schema-validation approach, such as Zod if already installed.

Define a typed action proposal contract with fields equivalent to:
- Action ID.
- Event ID.
- Action type.
- Short title.
- Explanation.
- Referenced records.
- Proposed changes.
- Relevant assumptions.
- Validation results.
- Required confirmation.
- Owning module.
- Proposal status.

Supported action types must be explicitly allowlisted.

Validate all referenced IDs against the current event and the current user's authorization.

Reject:
- Unknown action types.
- Invalid record references.
- Unauthorized records.
- Unsupported state transitions.
- Invalid amounts or dates.
- Changes that violate hard business constraints.
- Requests that bypass confirmation.

The model must not be allowed to choose arbitrary internal function names or supply unrestricted execution instructions.

### 13. Preserve conversation context responsibly

Where useful, support conversation history scoped to an event.

Store:
- Conversation ID.
- Authorized user or workspace ID.
- Event ID, when applicable.
- Messages or appropriate conversation summaries.
- Timestamps.
- Relevant references to retrieved records.
- AI model and prompt version where the existing system supports this.

Avoid storing unnecessary sensitive guest details in conversation history.

Do not treat old assistant messages as authoritative facts. Re-query the source records when answering questions about current budget, task status, RSVPs, vendor confirmations, or schedule state.

When a user switches events, prevent information from the previous event from leaking into the new conversation context.

Provide appropriate history deletion or retention behavior consistent with the application's existing privacy model.

### 14. Add freshness and uncertainty handling

The assistant must recognize when data may be stale or incomplete.

For relevant results, track or display:
- When the source record was last updated, where useful.
- Whether the source is an authoritative application record.
- Whether an external provider confirmed the information.
- Whether the value is estimated.
- Whether the underlying data could not be retrieved.

If a query fails, do not quietly reuse an old value as though it were current.

If two records disagree, identify the inconsistency and direct the user to the authoritative owner module.

Examples:
- A quotation amount differs from its linked budget item.
- The event guest target differs from confirmed RSVP attendance.
- A run-sheet time conflicts with an approved task deadline.
- A draft invitation contains an outdated event date.

Prefer surfacing the discrepancy over silently deciding which record is correct.

### 15. Protect against hallucinations and prompt injection

Treat all user-entered content and retrieved text as untrusted input, including:
- Event notes.
- Guest notes.
- Vendor descriptions.
- Quotation documents.
- Task descriptions.
- Imported content.
- Communication messages.

Requirements:
- Keep system instructions separate from retrieved content.
- Do not interpret retrieved content as authorization to execute actions.
- Restrict the model to explicitly supported capabilities.
- Validate all outputs and referenced records.
- Apply authorization before retrieval and again before any write operation.
- Never expose secrets, internal credentials, or unauthorized event data.
- Avoid including sensitive personal information unless necessary and authorized.

If the model produces unsupported claims or invalid action proposals, reject them or request a safer response.

### 16. Backend architecture and performance

Integrate with Module 03's existing AI orchestration layer.

Implement:
- A context-assembly service.
- A cross-module insight service.
- A question-answering workflow.
- A structured recommendation contract.
- A validated action-proposal workflow.
- Conversation persistence where appropriate.
- Bounded retrieval and pagination.
- Timeouts and bounded retries.
- Rate limiting.
- Provider error handling.
- Logging and monitoring that minimize sensitive data.

Use the existing architecture and dependency-injection conventions.

Avoid a single oversized function that directly queries every table, calls the AI model, calculates totals, and performs writes.

Keep data retrieval, deterministic calculations, AI reasoning, validation, and approved execution in separate layers.

Cache only where safe. Revalidate freshness and authorization before using cached data for sensitive or consequential actions.

If the AI provider is unavailable, relevant existing module pages and deterministic summaries must continue to work.

### 17. Integrate across Modules 01–11

The assistant should connect the modules through their established services.

**Module 01 — Dashboard**
Use authoritative summary data to answer questions about event progress.

**Module 02 — Event Setup**
Use saved event facts and preferences.

**Module 03 — AI Planning Engine**
Reuse the shared AI orchestration, prompt configuration, and validation patterns.

**Module 04 — Budget Management**
Use authoritative financial summaries and line items.

**Module 05 — Adaptive Budget Simulator**
Offer a path to create a scenario when users explore budget trade-offs.

**Module 06 — Task & Timeline Management**
Use real task states, deadlines, and dependencies.

**Module 07 — Vendor & Quotation Management**
Use actual quotation records and booking states.

**Module 08 — Event-Day Coordination**
Use current run-sheet information and unresolved incidents.

**Module 09 — Guest Management & RSVP Tracking**
Use authoritative attendance calculations and response states.

**Module 10 — Seating Planner**
Use seating validation results and unresolved assignment conflicts.

**Module 11 — Invitations & Event Communications**
Use real campaign and delivery states, distinguishing drafts from sent messages.

Do not duplicate module calculations or create a second source of truth for any of these domains.

### 18. Testing requirements

Use the project's existing testing framework.

**Unit tests**
- Context assembly and data-source selection.
- Authorization filtering.
- Deterministic summary calculations.
- Risk prioritization rules.
- Evidence reference validation.
- Structured AI output validation.
- Unsupported action rejection.
- Stale-data handling.
- Currency and timezone handling.
- Prompt-injection resistance.

**Integration tests**
- Event-specific question answering.
- Cross-module retrieval.
- Unauthorized event access prevention.
- Missing source data handling.
- Conflicting record detection.
- AI provider failure and retry.
- Action proposal validation.
- Explicit confirmation before writes.
- Re-querying changed source records.
- Conversation isolation between events.
- Conversation history authorization.
- Sensitive data minimization.

**End-to-end tests**
1. Open an event with existing budget, tasks, vendors, and guest records.
2. Ask whether the event is over budget.
3. Verify the answer matches the authoritative budget service.
4. Ask which tasks are most urgent and verify the listed deadlines.
5. Ask about an unconfirmed vendor and verify the actual booking state is reported.
6. Ask how an increased guest count might affect the plan.
7. Verify the assistant offers a scenario rather than silently changing the budget.
8. Ask it to prepare a vendor follow-up and verify a draft is created without being sent.
9. Change a source record and ask a related follow-up question.
10. Verify the assistant retrieves fresh information.
11. Attempt to reference a record from another event and verify access is denied.
12. Simulate an AI provider failure and verify existing module functionality remains available.

Run tests and report actual results. Do not claim unexecuted tests pass.

### 19. Acceptance criteria

The module is complete when:

- Users can ask natural-language questions about their saved events.
- Answers use relevant, authorized, current application data.
- Financial and scheduling calculations come from deterministic services.
- Important claims include useful evidence references where supported.
- Facts, estimates, assumptions, and recommendations are distinguishable.
- Cross-module inconsistencies and actionable risks can be identified.
- Suggested actions are specific and explainable.
- Consequential changes require explicit approval.
- The assistant cannot bypass existing module authorization.
- Conversations remain isolated to the correct event and user.
- Sensitive data is handled appropriately.
- Provider failures do not disable ordinary event management.
- Relevant automated tests pass.
- No unsupported external actions or fabricated facts are presented as confirmed.

### 20. Implementation workflow

Proceed in this order:

1. Inspect the project and Modules 01–11.
2. Identify authoritative data services and available AI orchestration.
3. Define context, evidence, insight, conversation, and action-proposal contracts.
4. Implement authorized context retrieval.
5. Integrate deterministic summary and risk-analysis services.
6. Build the assistant interface and conversation workflow.
7. Implement evidence-grounded answer generation.
8. Add validated action proposals and user confirmation.
9. Implement conversation isolation and history controls.
10. Integrate the assistant with existing modules.
11. Add automated tests.
12. Run linting, type checks, builds, and relevant tests.
13. Fix regressions and verify the end-to-end workflow.

In the final implementation report, summarize:
- Features implemented.
- Files and migrations changed.
- Cross-module integrations completed.
- How data grounding and authorization work.
- Tests actually run and their results.
- Remaining limitations or unfinished work.

**Product principle:** Quveta's intelligence must come from understanding the user's actual event, not merely sounding intelligent. Every important recommendation should be grounded in evidence, every uncertainty should be visible, and every consequential action should remain under the user's control.