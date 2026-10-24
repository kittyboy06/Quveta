# QUVETA — BASE PROJECT INSTRUCTIONS

## 1. Project Identity

Project name: Quveta  
Product: AI-powered event-planning web application  
Tagline: Your events. Your vision. Intelligently planned.

Quveta helps users plan and manage weddings, birthdays, community celebrations, and other events through personalized AI planning, accurate budget management, dependency-aware timelines, and explainable recommendations.

The primary differentiator is an **Adaptive Planning System** that intelligently responds when budgets, guest counts, event dates, or user priorities change.

## 2. Competition Objective

Build a high-quality submission for PromptWars Virtual Challenge 5: Celebration & Event Planner.

Prioritize:
1. Code quality.
2. Problem-statement alignment.
3. Security.
4. Efficiency.
5. Testing.
6. Accessibility.

Do not invent competition scoring percentages or claim that the project guarantees a particular score.

Build a working application, not merely a visual prototype or generic chatbot.

## 3. Architecture

Use a **Modular Monolith**.

Preferred stack:
- Frontend: React + TypeScript.
- Backend: Node.js + Express + TypeScript.
- Database: PostgreSQL through Supabase.
- AI: A suitable model provider accessed exclusively through the backend.
- Validation: Strict schemas for external inputs and AI outputs.
- Testing: Unit, integration, and end-to-end tests.

Before implementing, inspect the existing repository and environment. Preserve an existing working stack if changing it would introduce unnecessary risk.

Organize the code into well-defined product modules with explicit boundaries. Do not introduce microservices or unnecessary infrastructure.

## 4. Engineering Quality Standards

- Enable strict TypeScript checks where practical.
- Use meaningful names, small cohesive functions, and reusable components.
- Separate UI, business logic, persistence, and AI orchestration.
- Avoid duplicated logic, oversized components, excessive dependencies, and unexplained abstractions.
- Never use `any` as an easy escape from type safety.
- Validate data on the server, even when frontend validation exists.
- Handle errors explicitly and provide useful user-facing messages.
- Keep secrets out of client bundles and source control.
- Use database migrations or another reproducible schema-management process.
- Do not leave dead buttons, fake functionality, or unfinished critical workflows.
- Do not claim tests or integrations passed without running them.

## 5. AI Reliability

Use AI for language understanding, personalized recommendations, event ideas, and explanations.

Use deterministic application logic for financial calculations, date arithmetic, constraint validation, and dependency checks.

- Validate model responses against schemas.
- Treat model output as untrusted input.
- Do not let AI bypass authorization, business rules, or user approval.
- Never invent verified vendor information.
- Clearly distinguish assumptions, estimates, user-provided data, and verified facts.
- Preserve the user's existing plan when proposing changes.
- Ask focused follow-up questions when required information is missing.

## 6. User Experience

Build a responsive, accessible, professional interface.

- Use consistent design tokens, typography, spacing, and components.
- Support keyboard navigation and visible focus indicators.
- Use semantic HTML and accessible form labels.
- Maintain sufficient color contrast.
- Include loading, empty, error, and success states.
- Make financial totals, schedule conflicts, and proposed changes easy to understand.
- Ensure every visible control performs its intended action.
- Test desktop and mobile browser layouts.

Avoid unnecessary animations and decorative complexity that interferes with usability.

## 7. Data Integrity and Security

- Enforce authorization on the server for user-owned resources.
- Configure database access policies appropriately.
- Validate and sanitize inputs.
- Keep AI provider credentials server-side.
- Use safe error responses and production-appropriate configuration.
- Avoid unnecessary personal data collection.
- Preserve approved plan versions and prevent accidental data loss.
- Use precise monetary representations rather than relying on floating-point arithmetic for financial totals.

## 8. Testing Requirements

Every module must include appropriate tests for its business logic, failure paths, and integration points.

Test:
- Valid and invalid inputs.
- Normal operation and boundary conditions.
- External service failures.
- Persistence and data consistency.
- Security and authorization where applicable.
- Keyboard accessibility and responsive behavior where relevant.

Run relevant tests and the production build after meaningful changes. Fix critical failures before continuing.

## 9. Implementation Workflow

For each module:

1. Inspect the current repository and related modules.
2. Identify dependencies and integration points.
3. Define the module's responsibilities and acceptance criteria.
4. Implement the smallest complete working version.
5. Integrate it with existing modules using clear interfaces.
6. Add automated tests.
7. Run the relevant tests and production build.
8. Review security, accessibility, performance, and maintainability.
9. Report changed files, test results, known limitations, and remaining work.

Do not rewrite unrelated parts of the application while implementing a module.

Do not proceed on the assumption that a feature is complete merely because its UI exists.

## 10. Definition of Done

A module is complete only when:
- Its required functionality works end to end.
- It integrates correctly with existing modules.
- Its important business rules are tested.
- Invalid data and failure cases are handled.
- Security and accessibility requirements are addressed.
- The implementation is documented where necessary.
- No critical regression is introduced.
- Its acceptance criteria have been verified.

## 11. Scope Discipline

Implement the core event-planning experience before optional features.

Prioritize:
1. Event creation and preferences.
2. AI-generated personalized planning.
3. Budget management.
4. Adaptive budget simulation.
5. Task management and dependency-aware timelines.
6. Plan comparison, approval, and versioning.
7. Dashboard and supporting features.
8. Vendor integrations and exports where feasible.

The Adaptive Budget Simulator is Quveta's signature feature. It must use accurate calculations, explain trade-offs, preserve user priorities, and require user approval before committing proposed changes.

Do not sacrifice correctness, code quality, or problem alignment to increase the feature count.

## 12. Final Directive

Act as a senior engineer building a reliable competition submission.

Inspect before changing. Implement incrementally. Test before declaring success. Preserve working functionality. Make architectural decisions explicit. Never fabricate data, test results, or deployment status.

Build Quveta as an adaptive event-planning system that helps users make informed decisions—not as a generic AI text generator.