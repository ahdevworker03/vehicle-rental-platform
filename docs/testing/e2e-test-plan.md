# End-to-End Test Plan

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [1. Purpose](#1-purpose) |
| 2 | [Current Capability](#current-capability) |
| 3 | [2. E2E Testing Principles](#2-e2e-testing-principles) |
| 4 | [3. Workflows That Deserve E2E Coverage](#3-workflows-that-deserve-e2e-coverage) |
| 5 | [Authentication and Access](#authentication-and-access) |
| 6 | [Customer and Vehicle Setup](#customer-and-vehicle-setup) |
| 7 | [Rental Critical Path](#rental-critical-path) |
| 8 | [Rental Availability Conflict](#rental-availability-conflict) |
| 9 | [Contracts](#contracts) |
| 10 | [Payments](#payments) |
| 11 | [Maintenance](#maintenance) |
| 12 | [Tasks](#tasks) |
| 13 | [Authorization and Tenant Access](#authorization-and-tenant-access) |
| 14 | [4. What Should Not Be E2E Tested](#4-what-should-not-be-e2e-tested) |
| 15 | [5. Priority Levels](#5-priority-levels) |
| 16 | [P0: Release Critical](#p0-release-critical) |
| 17 | [P1: Important](#p1-important) |
| 18 | [P2: Add Later If Valuable](#p2-add-later-if-valuable) |
| 19 | [6. When E2E Tests Are Implemented](#6-when-e2e-tests-are-implemented) |
| 20 | [Now](#now) |
| 21 | [Milestone 6: Production Readiness](#milestone-6-production-readiness) |
| 22 | [Later Versions](#later-versions) |
| 23 | [7. Offline E2E Testing](#7-offline-e2e-testing) |
| 24 | [8. Test Environment](#8-test-environment) |
| 25 | [9. Test Data and Isolation](#9-test-data-and-isolation) |
| 26 | [10. Execution Strategy](#10-execution-strategy) |
| 27 | [11. Failure Expectations](#11-failure-expectations) |
| 28 | [12. Relationship to Manual Testing](#12-relationship-to-manual-testing) |
| 29 | [13. Deferred E2E Areas](#13-deferred-e2e-areas) |
| 30 | [14. Initial Milestone 6 E2E Suite](#14-initial-milestone-6-e2e-suite) |

## 1. Purpose

End-to-end (E2E) testing verifies complete user workflows through the real application stack:

```text
Browser
-> React application
-> REST API
-> backend business logic
-> PostgreSQL
-> response
-> visible UI result
```

Its purpose is to confirm that independently tested frontend, API, business, and database layers actually work together for the workflows a rental business depends on.

E2E is not the project's main testing layer. Unit, backend integration/API, and frontend component tests provide faster and more precise coverage for most rules and edge cases. E2E adds focused confidence at cross-system boundaries.

### Current Capability

The repository does not currently contain an executable browser E2E suite: there is no project E2E runner dependency or script, E2E configuration, or E2E specification files. The configured Playwright MCP is developer/agent browser tooling and is not an application test suite. Executable E2E tooling belongs to Milestone 6 and is not introduced by this plan.

## 2. E2E Testing Principles

1. Automate critical business journeys, not every screen or button.
2. Prefer lower-level tests for cases that do not need the whole system.
3. Keep workflows independent, deterministic, and safe to rerun.
4. Interact through realistic user-visible behavior; do not use internal application APIs from the browser to perform the workflow under test.
5. Assert meaningful visible outcomes and essential persisted effects, not internal component or service structure.
6. Keep the suite small and stable because E2E tests are slower and more expensive to maintain.
7. Use E2E to address cross-system integration risk, not to increase code-coverage metrics.

Test setup may reset or seed data outside the browser. Once the workflow begins, its business actions should use the same interface a real user uses.

## 3. Workflows That Deserve E2E Coverage

### Authentication and Access

Browser coverage should prove that a user can log in, reach the protected application, restore an implemented session after reload, log out, and no longer access protected routes. One invalid-login check is valuable because it verifies that backend rejection reaches the UI correctly; detailed credential, token, refresh, and replay cases remain backend tests.

### Customer and Vehicle Setup

At least one workflow should prove that an `OWNER` can create the customer and vehicle records required for a rental and then select those records in the rental flow. This is stronger than separate E2E tests for every customer and vehicle CRUD action.

### Rental Critical Path

The rental path is the highest-value workflow. The implemented lifecycle is:

```text
create rental as RESERVED
-> vehicle becomes RESERVED
-> pick up rental as ACTIVE
-> vehicle becomes RENTED
-> return rental as RETURNED
-> vehicle becomes AVAILABLE when no other workflow blocks it
```

The test should verify the visible rental and vehicle states at the important transitions. Extension and cancellation remain candidates for later focused scenarios unless release risk or defects justify including them.

### Rental Availability Conflict

One browser scenario should demonstrate that an unavailable vehicle cannot be used for a conflicting rental. It should prove the user-facing availability behavior and failed outcome. The full overlap matrix, boundary dates, archived-vehicle rules, and concurrency cases remain backend integration tests.

### Contracts

The main rental workflow may verify that an eligible rental can generate a contract and expose its printable/PDF actions. Browser automation should prove that the feature is connected; legal layout, Arabic presentation, print preview, and PDF appearance remain manual checks.

### Payments

One scenario should record a partial payment from Rental Detail and verify that the visible payment history, paid amount, and outstanding balance update. Decimal precision, overpayment behavior, multiple methods, soft deletes, and reporting-period combinations remain lower-level tests.

### Maintenance

A browser scenario should verify the implemented maintenance lifecycle: create a record, move it into progress, observe the vehicle become unavailable for rental, complete it with a cost, and observe the final vehicle state when no rental or other in-progress maintenance blocks availability.

### Tasks

One scenario should verify that an owner can create a task, find it, complete it, and see the completed state. Recurrence arithmetic, monthly clamping, concurrency, and successor uniqueness remain backend tests.

### Authorization and Tenant Access

A small access scenario should compare the implemented `OWNER` and `EMPLOYEE` behavior: the employee can use supported authenticated read flows but cannot perform owner-only mutations. A direct attempt to open a known record from another seeded organization should not expose it. Backend integration tests remain the primary safety net for the complete authorization and tenant-isolation matrix.

## 4. What Should Not Be E2E Tested

E2E should not be used for exhaustive coverage of:

| Behavior                                                            | Primary owner                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------ |
| Validation combinations and API error codes                         | Backend integration/API and frontend component tests   |
| Database constraints, transactions, and concurrency cases           | Backend integration tests                              |
| Financial calculation combinations and Decimal edge cases           | Unit and backend integration tests                     |
| Selectors, formatting helpers, and recurrence arithmetic            | Unit tests                                             |
| Loading, empty, error, and permission-state variants                | Frontend component/page tests                          |
| Every CRUD permutation or lifecycle edge case                       | Backend integration/API tests                          |
| Every viewport, visual state, RTL detail, or accessibility judgment | Manual testing, supported by focused component tests   |
| Internal helpers and implementation structure                       | Unit tests only when meaningful behavior warrants them |

Moving these cases into E2E would make failures slower to diagnose and the suite less stable without adding useful integration confidence.

## 5. Priority Levels

### P0: Release Critical

P0 workflows must pass before Version 2 production release because their failure blocks secure daily rental operations:

- authentication and protected access;
- customer/vehicle-to-rental creation path;
- main rental pickup and return lifecycle;
- payment recording and visible balance update;
- rental availability conflict behavior;
- critical tenant access boundary.

### P1: Important

P1 workflows support important operations and should be added when they materially improve Milestone 6 confidence:

- maintenance lifecycle and vehicle availability;
- task creation and completion;
- key `OWNER` versus `EMPLOYEE` behavior;
- contract generation connection if it is not covered in a P0 rental flow.

### P2: Add Later If Valuable

P2 covers lower-frequency workflows or paths already strongly protected at lower levels, such as rental extension/cancellation, broader media handling, expense-to-report propagation, and additional contract actions. Add them only when release risk, usage, or defects justify the maintenance cost.

## 6. When E2E Tests Are Implemented

### Now

Maintain this plan while continuing to use backend integration/API tests, frontend component/page tests, and manual smoke testing. Do not introduce a large E2E suite while major frontend, backend, and offline behavior is still changing.

### Milestone 6: Production Readiness

Introduce the initial executable E2E capability and implement the P0 scenarios first. Add P1 scenarios where they close a material release-confidence gap. The goal is a small, deterministic production-readiness suite, not broad browser automation of the entire application.

### Later Versions

Expand the suite only when:

- a new critical user workflow is introduced;
- a production defect reveals missing cross-system regression protection;
- a feature has integration risk that lower-level tests cannot adequately cover.

More screens alone are not a reason to add more E2E tests.

## 7. Offline E2E Testing

Offline E2E tests should be designed alongside the actual Milestone 6 offline implementation and its final synchronization and conflict policies. A supported scenario may follow:

```text
online authenticated state
-> lose connectivity
-> perform a supported offline operation
-> restore connectivity
-> synchronize
-> verify final server and UI state
```

Depending on the implemented scope, selected scenarios may verify viewing synchronized data offline, creating supported records, queued mutation synchronization, reconnect behavior, and supported conflict or error recovery.

This plan does not assume which records are offline-writable, how the queue is stored, or how conflicts are resolved. Those details must come from the implemented offline architecture before executable scenarios are approved.

## 8. Test Environment

The future suite should run against:

- the real built or development-served React application;
- the real Express API;
- a dedicated, disposable PostgreSQL E2E/test database with the current schema;
- deterministic seeded accounts and business records;
- controlled test storage when a scenario includes documents, photos, signed contracts, or generated files.

The environment must be isolated from production. Tests must not depend on developer-local business records, production services, or production data. Additional container or orchestration infrastructure should be introduced only if the implementation phase demonstrates a concrete need.

## 9. Test Data and Isolation

- Each test starts from known data or creates the records it owns.
- Tests do not depend on execution order or another test's output.
- Seeded organizations contain distinct data so tenant boundaries can be verified safely.
- Test accounts use the implemented roles: `OWNER` and `EMPLOYEE`. `PLATFORM_OWNER` is excluded until its UI workflow exists.
- Dates, money, plates, customer identities, and expected balances are deterministic.
- Created records and storage objects are reset or cleaned through a safe test-only mechanism.
- No test may read or mutate production data.

A simple reset and seed approach is sufficient. A complex factory framework is not required by this plan.

## 10. Execution Strategy

During development, run the one focused workflow affected by the change:

```text
change or debug one workflow
-> prepare its test environment
-> run that focused E2E scenario
```

Before a production release, run the complete critical E2E suite after the frontend, API, database, and any controlled storage dependency are available:

```text
prepare isolated release-test environment
-> run complete P0 suite
-> run required P1 release scenarios
-> continue to manual release verification
```

The exact command and automation pipeline will be defined when the E2E runner is introduced. This plan does not define CI/CD configuration.

## 11. Failure Expectations

An E2E failure should identify a meaningful broken user journey. When one occurs:

1. Determine whether the defect belongs to the browser UI, API contract, backend rule, database, environment, or test itself.
2. Fix the underlying implementation or deterministic test setup.
3. Add or improve lower-level regression coverage when that level can describe the defect more precisely.
4. Keep the E2E assertion focused on the user-visible workflow instead of adding internal assertions.

Flaky tests must be diagnosed and corrected; retries must not be used to hide nondeterministic product behavior or unsafe test data.

## 12. Relationship to Manual Testing

E2E automation does not replace manual product verification. Human review remains necessary for Arabic RTL quality, responsive layout, visual hierarchy, accessibility, browser differences, PDF and print appearance, usability, and exploratory testing.

The required manual workflows and release evidence are defined in [`manual-test-plan.md`](./manual-test-plan.md). Automated and manual results together establish release confidence.

## 13. Deferred E2E Areas

Do not create E2E coverage until these capabilities become implemented critical workflows:

- Redis or cache behavior;
- background jobs and queues;
- notification delivery;
- future payment gateways;
- SaaS billing and subscriptions;
- platform-admin workflows before the UI exists;
- vehicle sales, online reservations, customer portals, accounting, or other future integrations.

## 14. Initial Milestone 6 E2E Suite

The proposed initial suite contains eight grouped scenarios. P0 is implemented first; P1 is added only where it is stable and materially improves release confidence.

| Scenario                            | Priority | What it proves                                                                                                                                                                         |
| ----------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authenticated access and session    | P0       | Valid login reaches the dashboard, invalid login is rejected visibly, reload restores the implemented session, protected routes reject signed-out access, and logout ends access.      |
| Core setup to reservation           | P0       | An owner creates a customer and available vehicle, uses both in New Rental, creates a `RESERVED` rental, sees the vehicle become `RESERVED`, and can generate the associated contract. |
| Pickup and return lifecycle         | P0       | A reserved rental can be picked up to become `ACTIVE` with a `RENTED` vehicle, then returned to become `RETURNED` with the vehicle available when no other blocker exists.             |
| Unavailable vehicle conflict        | P0       | A vehicle with a conflicting live rental is unavailable or rejected in the rental UI, and no second conflicting rental is created.                                                     |
| Partial payment and balance         | P0       | An owner records a payment from Rental Detail and sees the payment history, paid value, and outstanding balance update without a duplicate mutation.                                   |
| Tenant and employee access boundary | P0       | An employee cannot perform an owner-only mutation, and a user cannot view a known record belonging to another seeded organization.                                                     |
| Maintenance availability lifecycle  | P1       | Maintenance can move into progress, blocks vehicle rental availability, completes with a cost, and leaves the correct visible vehicle state.                                           |
| Task creation and completion        | P1       | An owner creates a task, finds it in the task workflow, completes it, and sees its completed state reflected without a second completion action.                                       |

Detailed edge cases for every scenario remain in the lower-level automated plans. Visual, responsive, accessibility, print/PDF, and exploratory acceptance remain in the manual plan.
