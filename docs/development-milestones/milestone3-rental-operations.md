# Milestone 3 — Rental Operations

**Goal**

Build the rental operations capabilities that allow businesses to manage daily rental operations, including the rental workflow, contracts, vehicle availability, and rental history.

**Rule:** No step may be skipped. Every step must be:

1. Implemented.
2. Reviewed by the AI agent.
3. Manually reviewed.
4. Tested.
5. Committed.

Only after all acceptance criteria are satisfied may the next step begin.

---

# Phase 11 — Rental Management

## Step 11.1 — Rental Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Rental model.

Including:

- rental period fields
- pickup fields
- return fields
- rental status field
- pricing fields
- customer relationship
- vehicle relationship
- organization relationship
- timestamps
- soft delete strategy
- constraints
- indexes

### Deliverables

- Prisma model
- Migration
- Relations

### Acceptance Criteria

- Migration succeeds.
- Model matches architecture.
- Organization isolation field present.
- Relations verified.
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 11.2 — Contract Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Contract model.

Including:

- rental relationship
- contract content fields
- timestamps
- soft delete strategy
- constraints
- indexes

### Deliverables

- Prisma model
- Migration
- Relations

### Acceptance Criteria

- Migration succeeds.
- Model matches architecture.
- Relations verified.
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 11.3 — Rental Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md

### Objectives

Implement the complete Rental module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation

### Deliverables

- Rental repository
- Rental service
- Rental controller
- Rental routes
- Rental validation

### Acceptance Criteria

- CRUD operations complete.
- Organization isolation enforced.
- Validation passes.
- Controllers remain thin.
- Services contain business logic.
- Repositories handle all Prisma access.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 11.4 — Rental Workflow (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the rental workflow operations.

Including:

- create rental
- assign vehicle to customer
- record pickup date and time
- record expected return date and time
- complete vehicle return
- extend rental
- cancel rental
- prevent double-booking of vehicles
- display vehicle availability

### Deliverables

- Rental workflow service functions
- Vehicle availability checks
- Rental status transitions

### Acceptance Criteria

- Create rental works.
- Return rental works.
- Extend rental works.
- Cancel rental works.
- Double-booking prevented.
- Vehicle availability reflected correctly.
- Organization isolation enforced.
- Build, typecheck, and lint pass.

---

## Step 11.5 — Rental Module (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the Rental module in the frontend.

Including:

- Rental list view
- Rental detail view
- New rental flow
- Rental return flow
- Rental extension flow
- Rental cancellation flow
- Vehicle availability display

### Deliverables

- Rental components
- Rental pages
- Rental forms
- Rental workflow UI

### Acceptance Criteria

- Rental list renders.
- New rental works from the UI.
- Return works from the UI.
- Extend works from the UI.
- Cancel works from the UI.
- Forms validate input.
- Availability displays correctly.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 12 — Contracts

## Step 12.1 — Contract Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Contract module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation

### Deliverables

- Contract repository
- Contract service
- Contract controller
- Contract routes
- Contract validation

### Acceptance Criteria

- Contract generation works.
- Organization isolation enforced.
- Validation passes.
- Controllers remain thin.
- Services contain business logic.
- Repositories handle all Prisma access.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 12.2 — Contract Generation

### Must Read

- 04-backend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement contract generation.

Including:

- printable version
- PDF export
- signed contract storage
- association with rental

### Deliverables

- Contract generation service
- Printable contract
- PDF export
- Signed contract storage

### Acceptance Criteria

- Contract generated for a rental.
- Printable version renders.
- PDF export works.
- Signed contract stored.
- Contract associated with the correct rental.
- Organization isolation enforced.
- Build, typecheck, and lint pass.

---

## Step 12.3 — Contracts (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement contract viewing and export in the frontend.

Including:

- Contract view
- Printable version
- PDF download
- Signed contract upload

### Deliverables

- Contract components
- Contract pages
- PDF download integration

### Acceptance Criteria

- Contract renders.
- Printable version renders.
- PDF download works.
- Signed contract upload works.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 13 — Rental History & Availability

## Step 13.1 — Rental History (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- docs/product/02-business-requirements.md

### Objectives

Implement rental history retrieval.

Including:

- rental history for a customer
- rental history for a vehicle
- completed rentals
- active rentals
- organization-scoped queries

### Deliverables

- Rental history repository functions
- Rental history service functions
- Query validation

### Acceptance Criteria

- Rental history returns matching records.
- History is organization-scoped.
- Validation passes.
- Build, typecheck, and lint pass.

---

## Step 13.2 — Vehicle Availability (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- docs/product/02-business-requirements.md

### Objectives

Implement vehicle availability checking.

Including:

- availability check for a date range
- availability check for a vehicle
- available vehicle list
- conflicts with active rentals
- organization-scoped availability

### Deliverables

- Availability repository functions
- Availability service functions
- Query validation

### Acceptance Criteria

- Availability checks work.
- Double-booking prevented.
- Available vehicles returned correctly.
- Organization isolation enforced.
- Validation passes.
- Build, typecheck, and lint pass.

---

## Step 13.3 — Rental History & Availability (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement rental history and availability in the frontend.

Including:

- Customer rental history view
- Vehicle rental history view
- Available vehicles display
- Availability indicators

### Deliverables

- History components
- Availability components
- History and availability pages

### Acceptance Criteria

- Rental history renders.
- Availability displays correctly.
- Indicators reflect the backend.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Milestone 3 Completion Checklist

- [x] Rental model implemented
- [x] Contract model implemented
- [x] Rental module implemented
- [x] Rental workflow implemented
- [x] Rental module (frontend) implemented
- [x] Contract module implemented
- [x] Contract generation implemented
- [x] Contracts (frontend) implemented
- [x] Rental history implemented
- [x] Vehicle availability implemented
- [x] Rental history & availability (frontend) implemented
- [x] Database migrations verified
- [x] API validated
- [x] Manual testing completed
- [x] AI code review completed
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] No build errors
- [x] Documentation updated
- [x] Changes committed

---

## Milestone Status

**Status:** Complete

Current Phase: Milestone 3 — Rental Operations

Current Step: Completed

Last Completed Step: Step 13.3 — Rental History & Availability (Frontend)

Next Step: Milestone 4
