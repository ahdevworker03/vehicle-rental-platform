# Automated Test Plan

## 1. Purpose

Automated testing in this project means executable checks that verify product behavior repeatedly as the code changes. It protects the business rules and public contracts of the Vehicle Rental Management Platform rather than attempting to test every function or component.

The main goals are to:

- prevent regressions in daily rental operations;
- protect tenant isolation, authentication, and authorization;
- protect financial calculations and database integrity;
- make refactoring safer;
- provide repeatable evidence for production readiness.

Tests should assert observable behavior and contracts. Trivial implementation details should not be tested only to increase coverage.

## 2. Testing Levels

### Unit Tests

Unit tests cover isolated, deterministic behavior without requiring the complete application flow. Appropriate subjects include:

- selectors and derived UI state;
- payment, balance, revenue, expense, and profitability calculations;
- date, formatting, and recurrence logic;
- validation and business helpers;
- transaction retry and error-mapping helpers.

Use unit tests when they provide a fast, clear explanation of a rule or edge case. Do not test simple pass-through code, framework behavior, or private structure that can change without changing the product.

### Backend Integration and API Tests

This is a major testing layer because PostgreSQL is the system of record and the backend owns authorization, transactions, lifecycle rules, and tenant boundaries.

Backend tests use Vitest. API tests use Supertest against the Express application and Prisma against the PostgreSQL test database. Depending on the behavior, a test may exercise:

```text
HTTP request -> route/controller/service/repository -> Prisma -> PostgreSQL
```

This layer is responsible for verifying:

- request validation, status codes, and response/error contracts;
- authentication, role authorization, and organization scoping;
- cross-tenant relationship rejection and tenant-safe not-found behavior;
- Prisma/PostgreSQL constraints and persistence behavior;
- transaction atomicity and concurrency-sensitive workflows;
- soft-delete filtering and historical preservation;
- rental availability, overlap checks, and lifecycle transitions;
- maintenance effects on vehicle availability;
- payments, outstanding balances, and other financial rules;
- recurring-task completion and successor creation.

Service-level integration tests are also appropriate when they verify meaningful business behavior against the real test database without adding HTTP assertions that provide no additional value.

### Frontend Unit and Component Tests

Frontend tests use Vitest, jsdom, React Testing Library, and `@testing-library/jest-dom`. They should verify behavior from the user's perspective, including:

- selectors, calculations, formatting, and derived states;
- form validation, submission payloads, success, and failure feedback;
- loading, error, empty, and permission states;
- important interactions, navigation, keyboard behavior, and status presentation;
- API-backed page behavior with controlled hook or generated-client boundaries;
- reusable shared behavior whose regression would affect multiple screens.

These tests do not replace backend tests. Mocked frontend API boundaries verify how the interface responds to known server states; backend integration tests verify that the server and database produce correct states.

### End-to-End Tests

E2E tests verify a small number of critical workflows in a real browser across the web application, API, and database. They are mainly a Milestone 6 production-readiness responsibility and will be specified separately in [`e2e-test-plan.md`](./e2e-test-plan.md).

There is currently no Playwright configuration or executable E2E suite in the repository. E2E tests should remain focused on high-value workflows rather than duplicate every backend and component edge case.

## 3. Current Automated Coverage

Automated testing already exists and should be extended rather than replaced:

- The backend has Vitest unit, service, and Supertest route tests for authentication, password reset, invitations, users, organizations, customers, rentals, contracts, media, maintenance and schedules, expenses, payments, tasks, storage failures, and serializable transaction retries.
- Existing backend tests cover examples of validation, role enforcement, tenant isolation, soft deletion, database constraints, lifecycle transitions, recurrence, financial balances, storage reliability, and concurrent/transactional behavior.
- The frontend has Vitest and Testing Library tests for selectors, formatting and dates, shared UI behavior, forms, permissions, loading/error/empty states, payment behavior, and API-backed dashboard, analytics, reports, task, vehicle, expense, and maintenance interfaces.
- No automated browser-level E2E capability is currently configured.

Existing coverage is meaningful but does not imply that every endpoint, page, state, or cross-module workflow is complete. New work must close relevant gaps as behavior changes.

## 4. High-Risk Regression Areas

The following areas deserve automated regression coverage whenever they are implemented or changed:

- access-token, refresh-token, logout, password-reset, and session behavior;
- role authorization and organization lifecycle restrictions;
- organization isolation on reads, writes, relationships, files, reports, and financial summaries;
- customer and vehicle ownership, uniqueness, eligibility, and soft deletion;
- rental availability, overlap prevention, pickup, return, extension, cancellation, and vehicle status consistency;
- maintenance lifecycle rules and their effect on rental availability;
- payment recording, partial payments, outstanding balances, and period-based revenue;
- expense, maintenance-cost, profit, and reporting calculations without double-counting;
- transaction atomicity and concurrency-sensitive invitation, reset, contract, rental, payment, and recurring-task operations;
- recurring-task date calculation and single-successor behavior;
- API contract-sensitive request, response, error, and generated-client behavior;
- offline data synchronization, conflict handling, and reconciliation once implemented.

## 5. When Tests Are Implemented

### During Normal Feature Development

Testing is continuous and must not be postponed entirely until Milestone 6. When a feature or bug fix introduces or changes meaningful behavior:

- add or update focused unit tests where isolated logic benefits from them;
- add or update backend integration/API tests for server, database, security, or business-rule behavior;
- add or update frontend component/page tests for user-visible states and interactions;
- add a regression test that demonstrates a corrected bug when practical.

The test level should match the owner of the behavior. A database-backed business rule normally requires backend coverage even when the frontend also presents it.

### During Milestone 6: Production Readiness

Milestone 6 should identify and close production-critical gaps, especially:

- critical browser-level E2E workflows;
- offline synchronization, retry, conflict, and reconnect behavior as it is implemented;
- security regressions around sessions, authorization, tenant isolation, uploads, and production error handling;
- production-facing integration risks such as generated API contracts, storage, contract export, and deployment-specific behavior;
- regression hardening for defects found during manual QA and release verification.

### Later or Only When Justified

Do not create elaborate test infrastructure before the corresponding product or operational requirement exists. Defer:

- Redis or cache integration tests until caching exists;
- background-job and queue tests until workers or queues exist;
- notification-delivery tests until delivery is implemented;
- large-scale load, stress, and soak testing until capacity targets and representative environments exist;
- advanced offline, reservation, payment-gateway, or accounting scenarios beyond approved implemented scope.

## 6. Test Ownership During Development

The expected workflow is:

```text
Implement or change behavior
-> add or update the appropriate automated tests
-> run focused tests during development
-> run broader regression checks when the change can affect other modules
-> perform manual verification where automation cannot fully validate the result
```

A feature is not complete merely because its implementation compiles. Tests should describe business outcomes, visible states, API contracts, and data effects without coupling to internal function structure.

## 7. Test Environment and Data

### Backend

- `apps/api/vitest.config.ts` runs tests in the Node environment with file parallelism disabled.
- Tests use the dedicated local PostgreSQL URL `postgresql://postgres:postgres@localhost:5432/vehicle_rental_test?schema=public`, not the development database.
- `apps/api/src/test/setup.ts` connects Prisma before the suite and disconnects it afterward. It does not create the database or apply migrations, so the test database must already exist with the current schema.
- `apps/api/src/test/helpers.ts` provides `cleanup()` and a small `seed()` helper. `cleanup()` hard-deletes test records in dependency-safe order; many database-backed suites call it in `beforeEach` and then create controlled records.
- There is no general factory library. Tests use the shared seed helper where suitable and otherwise construct feature-specific records inline.

Because cleanup removes all rows from the configured database, backend tests must run only against the dedicated disposable test database. Automated tests must never connect to, depend on, or mutate production data.

### Frontend

- `apps/web/vitest.config.ts` runs colocated `src/**/*.test.{ts,tsx}` files in jsdom.
- `apps/web/src/test/setup.ts` installs the Testing Library DOM matchers.
- Component and page tests render controlled UI states and commonly mock feature hooks or generated-client boundaries; they do not require a live API or database.

Test data should remain deterministic, isolated, and explicit enough for the behavior under test. Tests must not depend on execution order or shared development data.

## 8. Verification Commands

Run commands from the repository root:

```sh
# Backend Vitest suite (requires the prepared test PostgreSQL database)
pnpm --filter @workspace/api-server test

# Frontend Vitest/Testing Library suite
pnpm --filter @workspace/web test

# All workspace test scripts
pnpm test

# Repository TypeScript checks
pnpm typecheck

# Repository lint
pnpm lint

# Typecheck followed by all available workspace builds
pnpm build
```

Focused Vitest files or name filters may be used during development, but the affected package suite and broader checks should run before release according to the change's risk.

## 9. Release Verification

Automated tests are one part of release confidence. Before a production release:

- run the relevant package suites and the repository typecheck, lint, and build commands;
- run the critical E2E suite once it exists;
- execute the manual QA plan for browser, responsive, accessibility, download, print, and other behavior not fully covered by automation;
- treat failures in tenant isolation, authorization, rental lifecycle, transactions, or financial correctness as release-blocking until resolved or explicitly reviewed.

## 10. Boundaries

This document does not duplicate:

- manual acceptance and exploratory testing: [`manual-test-plan.md`](./manual-test-plan.md);
- detailed browser workflow coverage: [`e2e-test-plan.md`](./e2e-test-plan.md).

It is not a CI/CD architecture, performance-testing manual, security-testing manual, Playwright tutorial, or Testing Library tutorial. Those subjects should receive separate plans only when the project has a concrete need.
