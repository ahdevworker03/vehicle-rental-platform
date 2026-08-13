# Milestone 2 — Core Business Data

**Goal**

Build the core business data capabilities that allow businesses to manage their customers and vehicles.

**Rule:** No step may be skipped. Every step must be:

1. Implemented.
2. Reviewed by the AI agent.
3. Manually reviewed.
4. Tested.
5. Committed.

Only after all acceptance criteria are satisfied may the next step begin.

---

# Phase 7 — Customer Management

## Step 7.1 — Customer Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Customer model.

Including:

- identity fields
- contact fields
- national ID fields
- driver's license fields
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
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 7.2 — Customer Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md

### Objectives

Implement the complete Customer module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation

### Deliverables

- Customer repository
- Customer service
- Customer controller
- Customer routes
- Customer validation

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

## Step 7.3 — Frontend Infrastructure

## Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md

### Objectives

Transform the frontend from a mock-data prototype into an API-backed application.

Including:

- API client
- Authentication context
- Protected routes
- Token management
- API error handling
- Shared API utilities

## Deliverables

- Shared API client
- Authentication provider
- Protected route component
- API utilities
- Authentication hooks

## Acceptance Criteria

- API client communicates with backend.
- Authorization header attached automatically.
- Authentication state persists.
- Protected routes work.
- API errors handled consistently.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

## Step 7.4 — Customer Module (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the Customer module in the frontend.

Including:

- Customer list view
- Customer detail view
- Customer creation form
- Customer edit form
- Search within customer list
- Client-side validation

### Deliverables

- Customer components
- Customer pages
- Customer forms
- Customer search UI

### Acceptance Criteria

- Customer list renders.
- Customer CRUD works from the UI.
- Forms validate input.
- Search filters customers.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 8 — Vehicle Management

## Step 8.1 — Vehicle Model

### Must Read

- 05-database-design.md
- 04-backend-architecture.md
- docs/product/04-domain-model.md
- docs/product/02-business-requirements.md

### Objectives

Implement the Vehicle model.

Including:

- vehicle information fields
- status field
- availability field
- mileage fields
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
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 8.2 — Vehicle Module (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 07-authentication-and-authorization.md
- 10-authentication-policy.md
- docs/product/02-business-requirements.md

### Objectives

Implement the complete Vehicle module.

Including:

- Repository
- Service
- Controller
- Routes
- Validation

### Deliverables

- Vehicle repository
- Vehicle service
- Vehicle controller
- Vehicle routes
- Vehicle validation

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

## Step 8.3 — Vehicle Module (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the Vehicle module in the frontend.

Including:

- Vehicle list view
- Vehicle detail view
- Vehicle creation form
- Vehicle edit form
- Status and availability display
- Search within vehicle list

### Deliverables

- Vehicle components
- Vehicle pages
- Vehicle forms
- Vehicle search UI

### Acceptance Criteria

- Vehicle list renders.
- Vehicle CRUD works from the UI.
- Forms validate input.
- Status and availability display correctly.
- Search filters vehicles.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 9 — Documents & Photos

## Step 9.1 — Media Infrastructure

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 08-offline-first.md
- docs/product/02-business-requirements.md

### Objectives

Implement shared media infrastructure for photos and documents.

Including:

- storage abstraction
- document model
- photo model
- organization relationship
- file metadata fields
- timestamps
- soft delete strategy
- constraints
- indexes

### Deliverables

- Media storage abstraction
- Document model
- Photo model
- Migration

### Acceptance Criteria

- Migration succeeds.
- Models match architecture.
- Organization isolation fields present.
- Storage abstraction is reusable.
- Constraints verified.
- Indexes verified.
- Prisma Client updated.

---

## Step 9.2 — Vehicle Photos & Documents (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 08-offline-first.md
- docs/product/02-business-requirements.md

### Objectives

Implement photo and document endpoints for vehicles.

Including:

- Upload photo
- List photos
- Delete photo
- Upload document
- List documents
- Delete document

### Deliverables

- Media routes
- Media controller
- Media service
- Media validation

### Acceptance Criteria

- Upload works.
- List works.
- Delete works.
- Organization isolation enforced.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 9.3 — Customer Documents (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- 08-offline-first.md
- docs/product/02-business-requirements.md

### Objectives

Implement document endpoints for customers.

Including:

- Upload document
- List documents
- Delete document

### Deliverables

- Customer document routes
- Customer document controller
- Customer document service
- Customer document validation

### Acceptance Criteria

- Upload works.
- List works.
- Delete works.
- Organization isolation enforced.
- API responses follow the documented format.
- Build, typecheck, and lint pass.

---

## Step 9.4 — Photos & Documents (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- 08-offline-first.md
- docs/product/03-user-flows.md

### Objectives

Implement photo and document management in the frontend.

Including:

- Vehicle photo upload
- Vehicle photo gallery
- Vehicle document list
- Customer document list
- Document download links

### Deliverables

- Media upload components
- Photo gallery components
- Document list components

### Acceptance Criteria

- Upload works from the UI.
- Gallery renders.
- Document lists render.
- Downloads work.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Phase 10 — Search

## Step 10.1 — Customer Search (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- docs/product/02-business-requirements.md

### Objectives

Implement customer search in the backend.

Including:

- search by name
- search by national ID
- search by driver's license
- search by phone
- organization-scoped search

### Deliverables

- Search repository function
- Search service function
- Search query validation

### Acceptance Criteria

- Search returns matching customers.
- Search is organization-scoped.
- Search is fast.
- Validation passes.
- Build, typecheck, and lint pass.

---

## Step 10.2 — Vehicle Search (Backend)

### Must Read

- 04-backend-architecture.md
- 05-database-design.md
- 06-api-design.md
- docs/product/02-business-requirements.md

### Objectives

Implement vehicle search in the backend.

Including:

- search by plate number
- search by make
- search by model
- search by year
- organization-scoped search

### Deliverables

- Search repository function
- Search service function
- Search query validation

### Acceptance Criteria

- Search returns matching vehicles.
- Search is organization-scoped.
- Search is fast.
- Validation passes.
- Build, typecheck, and lint pass.

---

## Step 10.3 — Search (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement instant search in the frontend.

Including:

- Search bar in customer list
- Search bar in vehicle list
- Debounced search input
- Loading states
- Empty state handling

### Deliverables

- Search components
- Debounced search hook
- Search integration with API

### Acceptance Criteria

- Search returns results instantly.
- Loading states render.
- Empty state handles no results.
- Frontend builds successfully.
- No TypeScript errors.
- No new lint errors.

---

# Milestone 2 Completion Checklist

- [x] Customer model implemented
- [x] Customer module implemented
- [x] Vehicle model implemented
- [x] Vehicle module implemented
- [x] Media infrastructure implemented
- [x] Vehicle photos implemented
- [x] Vehicle documents implemented
- [x] Customer documents implemented
- [x] Customer search implemented
- [x] Vehicle search implemented
- [x] Search UI implemented
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

Current Phase: Milestone 2 — Core Business Data

Current Step: Completed

Last Completed Step: Fix #5 — Prevent Self-Deletion

Next Step: Milestone 3
