# Milestone 4 — Operations

**Goal**

Build the operations capabilities that allow businesses to manage operational activities, including vehicle maintenance, business expenses, rental payments, and operational tasks.

**Rule:** No step may be skipped. Every step must be:

1. Implemented.
2. Reviewed by the AI agent.
3. Manually reviewed.
4. Tested.
5. Committed.

Only after all acceptance criteria are satisfied may the next step begin.

Backend and database work must precede dependent frontend work. API contracts must be defined in `lib/api-spec/openapi.yaml` before backend or frontend implementation, and generated artifacts (`lib/api-client-react`, `lib/api-zod`) must be regenerated from the specification per `docs/rules/api-contracts.md`.

---

# Phase 14 — Maintenance

## Step 14.1 — Maintenance Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- 11-domain-model-specification.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Maintenance model.

Including:

- organization relationship
- vehicle relationship
- maintenance date
- maintenance type enum (approved — see `11-domain-model-specification.md` MaintenanceType)
- maintenance status enum (approved — see `11-domain-model-specification.md` MaintenanceStatus)
- cost (approved — nullable `Decimal(10,2)`, required at completion)
- vendor (approved — nullable free text)
- notes
- replaced parts (approved — nullable structured JSON)
- timestamps
- soft delete strategy
- constraints
- indexes

### Deliverables

- Prisma model
- Migration
- Relations
- Enum definitions
- Model updates to `11-domain-model-specification.md`

### Acceptance Criteria

- Migration succeeds.
- Model matches the approved architecture.
- Organization isolation field present.
- Relations verified.
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 14.2 — Maintenance Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the complete Maintenance module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation
- Maintenance history for a vehicle
- Create, read, update, complete, and delete maintenance records
- Organization-scoped queries

### Deliverables

- Maintenance repository
- Maintenance service
- Maintenance controller
- Maintenance routes
- Maintenance validation
- API contract updates in `lib/api-spec/openapi.yaml`
- Regenerated API client and Zod schemas

### Acceptance Criteria

- CRUD operations complete.
- Completion workflow works.
- Vehicle history returns matching records.
- Organization isolation enforced.
- Validation passes.
- Controllers remain thin.
- Services contain business logic.
- Repositories handle all Prisma access.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 14.3 — Maintenance Module (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Replace the in-memory maintenance prototype (`apps/web/src/data/maintenance.ts`) with an API-backed Maintenance module.

Including:

- Maintenance list view
- Maintenance creation form
- Maintenance detail view
- Maintenance completion flow
- Maintenance history on the vehicle detail view
- Search and filter within the maintenance list

### Deliverables

- Maintenance components
- Maintenance pages
- Maintenance forms
- Maintenance search UI
- API-backed feature hooks

### Acceptance Criteria

- Maintenance list renders from the API.
- Creation works from the UI.
- Completion works from the UI.
- History renders on the vehicle detail view.
- Forms validate input.
- Search and filters work.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

## Step 14.4 — Maintenance (Dashboard and Analytics Integration)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Integrate maintenance into the existing dashboard and analytics surfaces without building new reporting modules.

Including:

- Maintenance count and vehicles-under-maintenance stats driven by real vehicle status and maintenance data
- Maintenance cost figures per vehicle
- Navigation to the Maintenance view

### Deliverables

- Updated dashboard components
- Updated analytics selectors
- API-backed maintenance queries on dashboard/analytics pages

### Acceptance Criteria

- Dashboard reflects maintenance data from the API.
- Analytics reflects per-vehicle maintenance costs.
- Selectors are updated and unit-tested.
- Existing dashboard and analytics behavior preserved.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 15 — Expenses

## Step 15.1 — Expense Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- 11-domain-model-specification.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Expense model.

Including:

- organization relationship
- optional vehicle relationship
- expense date
- amount (approved — `Decimal(10,2)`, non-negative)
- category enum (approved — see `11-domain-model-specification.md` ExpenseCategory)
- description
- timestamps
- soft delete strategy
- constraints
- indexes

### Deliverables

- Prisma model
- Migration
- Relations
- Enum definitions
- Model updates to `11-domain-model-specification.md`

### Acceptance Criteria

- Migration succeeds.
- Model matches the approved architecture.
- Organization isolation field present.
- Relations verified.
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 15.2 — Expense Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md

### Objectives

Implement the complete Expense module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation
- Optional vehicle association (validated against the organization)
- Organization-scoped queries

### Deliverables

- Expense repository
- Expense service
- Expense controller
- Expense routes
- Expense validation
- API contract updates in `lib/api-spec/openapi.yaml`
- Regenerated API client and Zod schemas

### Acceptance Criteria

- CRUD operations complete.
- Vehicle association works when provided.
- Cross-organization vehicle association is rejected.
- Organization isolation enforced.
- Validation passes.
- Controllers remain thin.
- Services contain business logic.
- Repositories handle all Prisma access.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 15.3 — Expense Module (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the Expense module in the frontend.

Including:

- Expense list view
- Expense creation form
- Expense detail view
- Optional vehicle association in the form
- Search and filter within the expense list

### Deliverables

- Expense components
- Expense pages
- Expense forms
- Expense search UI
- API-backed feature hooks

### Acceptance Criteria

- Expense list renders from the API.
- Creation works from the UI.
- Vehicle association works from the UI.
- Forms validate input.
- Search and filters work.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

## Step 15.4 — Expenses (Dashboard and Analytics Integration)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md

### Objectives

Integrate expenses into the existing dashboard and analytics surfaces.

Including:

- Expense overview stats driven by real expense records
- Expense totals and per-vehicle expense figures
- Net profit figure derived from payments minus expenses

### Deliverables

- Updated dashboard components
- Updated analytics selectors
- API-backed expense queries on dashboard/analytics pages

### Acceptance Criteria

- Dashboard reflects expense data from the API.
- Analytics reflects expense totals and per-vehicle expense figures.
- Selectors are updated and unit-tested.
- Existing dashboard and analytics behavior preserved.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 16 — Payments

## Step 16.1 — Payment Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- 11-domain-model-specification.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Payment model.

Including:

- organization relationship
- rental relationship
- payment amount (approved — `Decimal(10,2)`, strictly greater than zero)
- payment date
- payment method enum (approved — see `11-domain-model-specification.md` PaymentMethod)
- timestamps
- soft delete strategy
- constraints
- indexes

### Deliverables

- Prisma model
- Migration
- Relations
- Enum definitions
- Model updates to `11-domain-model-specification.md`

### Acceptance Criteria

- Migration succeeds.
- Model matches the approved architecture.
- Organization isolation field present.
- Relations verified.
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 16.2 — Payment Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the complete Payment module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation
- Record a payment for a rental
- List payments for a rental
- List payments organization-wide
- Partial payment support
- Outstanding balance derived from rental `total_amount` minus recorded payments
- Organization isolation

### Deliverables

- Payment repository
- Payment service
- Payment controller
- Payment routes
- Payment validation
- API contract updates in `lib/api-spec/openapi.yaml`
- Regenerated API client and Zod schemas

### Acceptance Criteria

- Record payment works.
- Payments list scoped to a rental works.
- Partial payments supported.
- Outstanding balance derived correctly.
- Organization isolation enforced.
- Validation passes.
- Controllers remain thin.
- Services contain business logic.
- Repositories handle all Prisma access.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 16.3 — Payment Module (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the Payment module in the frontend.

Including:

- Payment list on the rental detail view
- Record payment form on the rental detail view
- Outstanding balance display
- Payment history
- Loading, empty, success, and error states

### Deliverables

- Payment components
- Payment forms
- Payment history UI
- API-backed payment hooks

### Acceptance Criteria

- Payments list renders from the API.
- Recording a payment works from the UI.
- Outstanding balance updates after recording.
- Partial payments supported from the UI.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

## Step 16.4 — Payments (Dashboard and Analytics Integration)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md

### Objectives

Integrate payments into the existing dashboard and analytics surfaces.

Including:

- Revenue overview driven by recorded payments
- Outstanding balance figures
- Net profit derived from payments minus expenses

### Deliverables

- Updated dashboard components
- Updated analytics selectors
- API-backed payment queries on dashboard/analytics pages

### Acceptance Criteria

- Revenue reflects payments from the API.
- Outstanding balance figures are correct.
- Net profit figure is correct.
- Selectors are updated and unit-tested.
- Existing dashboard and analytics behavior preserved.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 17 — Tasks

## Step 17.1 — Task Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- 11-domain-model-specification.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Task model.

Including:

- organization relationship
- due date
- completion status enum (per approved decision — see Ambiguities)
- optional notes
- timestamps
- soft delete strategy
- constraints
- indexes

Optional entity associations (vehicle, rental, maintenance, user) are **not** implemented in this step; they depend on the architectural decision described in the Ambiguities section.

### Deliverables

- Prisma model
- Migration
- Relations
- Enum definitions
- Model updates to `11-domain-model-specification.md`

### Acceptance Criteria

- Migration succeeds.
- Model matches the approved architecture.
- Organization isolation field present.
- Relations verified.
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 17.2 — Task Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the complete Task module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation
- List tasks organization-wide
- Create, update, complete, and delete tasks
- Organization isolation

### Deliverables

- Task repository
- Task service
- Task controller
- Task routes
- Task validation
- API contract updates in `lib/api-spec/openapi.yaml`
- Regenerated API client and Zod schemas

### Acceptance Criteria

- CRUD operations complete.
- Completion workflow works.
- Organization isolation enforced.
- Validation passes.
- Controllers remain thin.
- Services contain business logic.
- Repositories handle all Prisma access.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 17.3 — Task Module (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the Task module in the frontend.

Including:

- Task list view
- Task creation form
- Task detail view
- Task completion flow
- Filter and search within the task list

### Deliverables

- Task components
- Task pages
- Task forms
- Task search UI
- API-backed feature hooks

### Acceptance Criteria

- Task list renders from the API.
- Creation works from the UI.
- Completion works from the UI.
- Forms validate input.
- Search and filters work.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

## Step 17.4 — Tasks (Dashboard Integration)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/03-user-flows.md

### Objectives

Integrate tasks into the existing dashboard surface without building a notifications or reminders system.

Including:

- Pending task count on the dashboard
- Due and overdue task indicators
- Navigation to the Tasks view

### Deliverables

- Updated dashboard components
- API-backed task queries on the dashboard

### Acceptance Criteria

- Dashboard reflects pending and overdue tasks from the API.
- Navigation to Tasks works.
- Existing dashboard behavior preserved.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 18 — Operations Verification

## Step 18.1 — Cross-Entity Operational Integrity (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md

### Objectives

Verify and harden the operational integrity of the Maintenance, Expense, Payment, and Task modules as a cohesive operations layer.

Including:

- Transactions where operations touch multiple records
- Organization isolation re-verified across all new modules
- Soft-delete semantics verified across all new modules
- Business-rule validation (e.g., payment belongs to a rental in the same organization; expense vehicle belongs to the same organization)
- Referential integrity verified

### Deliverables

- Cross-module verification fixes
- Consolidated validation behavior
- API contract refinements (if any) in `lib/api-spec/openapi.yaml`

### Acceptance Criteria

- Operations spanning multiple records execute atomically.
- Organization isolation holds across all new modules.
- Soft-deleted records are excluded correctly.
- Cross-organization references are rejected.
- Build, typecheck, and lint pass.

---

## Step 18.2 — Operations Manual Testing & Verification

### Must Read

- docs/rules/testing.md
- docs/rules/development-workflow.md
- docs/rules/git.md

### Objectives

Perform manual and automated verification of the full operations layer across Maintenance, Expenses, Payments, and Tasks.

Including:

- Manual testing of every new flow in the frontend
- API testing of every new endpoint
- Organization isolation testing
- Role-based access verification
- Automated tests for new selectors and services
- Build, typecheck, and lint verification

### Deliverables

- Manual test results
- Automated test coverage for new operations logic
- Verified acceptance criteria for Phases 14–17

### Acceptance Criteria

- All new frontend flows verified manually.
- All new endpoints verified manually.
- Organization isolation verified.
- Role permissions verified.
- New tests pass.
- No TypeScript errors.
- No ESLint errors.
- No build errors.

---

# Dependencies Between Steps

- **Step 14.1 → 14.2 → 14.3 → 14.4** — Maintenance model must exist before the backend module; the backend module must exist before the frontend module; the frontend module must exist before dashboard integration.
- **Step 15.1 → 15.2 → 15.3 → 15.4** — Same sequence for Expenses.
- **Step 16.1 → 16.2 → 16.3 → 16.4** — Same sequence for Payments. Payment frontend work depends on the existing Rental module (Milestone 3), which already renders the rental detail view where payments will appear.
- **Step 17.1 → 17.2 → 17.3 → 17.4** — Same sequence for Tasks.
- **Step 14.4, 15.4, 16.4, 17.4** all update the same dashboard/analytics surfaces and selectors; they are deliberately sequenced last within their phase so each integration lands on top of a verified module. Phase 18 depends on all previous steps being complete.
- **Cross-phase dependencies:** Expenses (15.4) and Payments (16.4) both feed the net profit figure on the analytics surface; the net profit selector must be implemented after both are live. Maintenance (14.4) and Tasks (17.4) both feed dashboard counters; no ordering constraint exists between them beyond their own phases.
- **Contract-first:** every backend step depends on its API contract being defined in `lib/api-spec/openapi.yaml` and on regenerating `lib/api-client-react` and `lib/api-zod` before implementation.

---

# Architectural and Product Ambiguities Requiring Approval

The following decisions are **not settled by existing documentation** and materially affect the Milestone 4 architecture. They must be approved before the corresponding step is implemented. They are listed here so they can be resolved rather than silently invented.

1. ~~**Maintenance type and status enums.**~~ **RESOLVED** — approved in `11-domain-model-specification.md`. `MaintenanceType` = `PREVENTIVE_SERVICE`, `INSPECTION`, `REPAIR`, `OTHER`; `MaintenanceStatus` = `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`; `UPCOMING`/`OVERDUE` are derived.

2. ~~**Expense category enum representation.**~~ **RESOLVED** — approved in `11-domain-model-specification.md`. `ExpenseCategory` = `FUEL`, `INSURANCE`, `REGISTRATION`, `CLEANING`, `OTHER`. `MAINTENANCE` is excluded; maintenance costs are represented by `Maintenance.cost`.

3. ~~**Expense associations.**~~ **RESOLVED** — approved in `11-domain-model-specification.md`. Expenses belong to one Organization and may belong to one Vehicle (optional). No `rental_id` or `maintenance_id` association.

4. ~~**Maintenance replaced-parts representation.**~~ **RESOLVED** — approved in `11-domain-model-specification.md`. `replaced_parts` is a nullable structured JSON value; no `ReplacedPart` / Parts / Inventory entity.

5. ~~**Task entity associations.**~~
   The domain model documents Task as belonging to one Organization with due date, recurring schedule, and completion status. It does **not** document associations with Vehicles, Rentals, Maintenance records, or Users. The business requirements say tasks should "support maintenance reminders" and "administrative reminders" but do not specify how they are linked. **RESOLVED** — approved and implemented in `11-domain-model-specification.md` (Milestone 4, Phase 17, Step 17.1). The base Task (organization, due date, status, notes) is implemented with **no entity associations**; associations are deferred.

6. ~~**Task recurring schedule.**~~
   `02-business-requirements.md` requires "create recurring tasks" and the domain model lists "recurring schedule" as a responsibility, but `11-domain-model-specification.md` marks the recurrence representation as "Requires Architectural Approval". **RESOLVED** — deferred (approved and recorded in `11-domain-model-specification.md`, Milestone 4, Phase 17, Step 17.1). No recurrence field is implemented; tasks are single-occurrence in Milestone 4, since recurrence generation logic would otherwise expand the milestone scope.

7. ~~**Payment method enum and balance tracking.**~~ **RESOLVED** — approved in `11-domain-model-specification.md`. `PaymentMethod` = `CASH`, `CARD`, `TRANSFER`, `OTHER`; outstanding balance is **derived** from `Rental.total_amount` minus recorded payments, never stored.

8. **Role permission matrix for operations.**
   `11-domain-model-specification.md` states the per-module role permission matrix for OWNER/MANAGER/EMPLOYEE is partially inferred and "Requires Architectural Approval". Milestone 2 and 3 followed the pattern: list/get for any authenticated user; create/update/delete restricted to `OWNER`. Proposal: apply the same pattern to all Milestone 4 modules (Maintenance, Expense, Payment, Task) unless a different matrix is approved.

9. ~~**Currency for expenses and payments.**~~ **RESOLVED** — approved in `11-domain-model-specification.md`. No currency field; amounts use the existing `Decimal(10,2)` monetary convention.

---

# Milestone 4 Completion Checklist

- [ ] Maintenance model implemented
- [ ] Maintenance module (backend) implemented
- [ ] Maintenance module (frontend) implemented
- [ ] Dashboard and analytics integration for maintenance implemented
- [ ] Expense model implemented
- [ ] Expense module (backend) implemented
- [ ] Expense module (frontend) implemented
- [ ] Dashboard and analytics integration for expenses implemented
- [ ] Payment model implemented
- [ ] Payment module (backend) implemented
- [ ] Payment module (frontend) implemented
- [ ] Dashboard and analytics integration for payments implemented
- [ ] Task model implemented
- [ ] Task module (backend) implemented
- [ ] Task module (frontend) implemented
- [ ] Dashboard integration for tasks implemented
- [ ] Cross-entity operational integrity verified
- [ ] Operations manual testing completed
- [ ] API contracts updated in `lib/api-spec/openapi.yaml`
- [ ] Generated API client and Zod schemas regenerated and synchronized
- [ ] Database migrations verified
- [ ] API validation verified
- [ ] Organization isolation verified for all new modules
- [ ] Authentication and authorization verified for all new modules
- [ ] Manual testing completed
- [ ] Automated testing completed
- [ ] AI code review completed
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No build errors
- [ ] Documentation updated
- [ ] Changes committed

---

## Milestone Status

**Status:** In Progress

Current Phase: Phase 14 — Maintenance

Current Step: Step 14.1 — Maintenance Model

Last Completed Step: Milestone 3, Step 13.3 — Rental History & Availability (Frontend)

Next Step: Step 14.1
