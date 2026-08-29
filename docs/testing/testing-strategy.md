# Testing Strategy

## 1. Purpose

Testing provides enough evidence that the Vehicle Rental Management Platform is correct, secure, reliable, and usable by real rental businesses. The platform stores operational and financial data in a shared multi-tenant system, so failures can expose another organization's data, corrupt business records, misstate money, or prevent daily rental work.

The strategy therefore prioritizes confidence in:

- tenant isolation, authentication, and authorization;
- rental lifecycles and vehicle availability;
- maintenance and vehicle state;
- payments, balances, and financial calculations;
- database constraints, transactions, and data integrity;
- API and frontend integration;
- offline synchronization when it is implemented;
- critical user workflows across desktop and mobile.

Testing does not attempt to prove every line of code correct. It combines automated and manual evidence according to the risk of each change.

## 2. Testing Principles

1. Test observable business behavior and contracts, not private implementation structure.
2. Use the lowest practical test level that provides meaningful confidence and clear failures.
3. Prefer backend integration/API coverage when correctness depends on PostgreSQL, Prisma, transactions, authorization, or tenant scoping.
4. Use E2E tests selectively for critical workflows that must work across browser, API, and database boundaries.
5. Keep manual testing for UX, Arabic RTL presentation, responsiveness, accessibility, browser behavior, downloads, print/PDF output, and other behavior automation cannot fully judge.
6. Add regression coverage for bug fixes when practical, at the level where the defect can be reproduced reliably.
7. Match testing effort to business and technical risk. Not every change needs every test layer.
8. Do not use arbitrary coverage percentages or write low-value tests only to improve metrics.

## 3. Testing Layers

The layers complement one another. Confidence comes from using the appropriate combination, not from maximizing the number of tests.

### Unit Testing

Unit tests give fast feedback for isolated, deterministic logic such as calculations, selectors, date rules, and derived state. They are the preferred level when the rule can be verified without infrastructure or broad application setup.

### Backend Integration and API Testing

Backend integration/API tests provide the strongest protection for database-backed business behavior. They verify public API behavior together with validation, service rules, persistence, transactions, authorization, and tenant isolation. This is a central layer because PostgreSQL is the system of record and the backend owns security and cross-record rules.

### Frontend Unit and Component Testing

Frontend tests verify UI logic and user-visible behavior in controlled conditions. They protect forms, important states, interactions, permissions, and the interface's response to API outcomes without trying to prove server or database correctness again.

### End-to-End Testing

E2E tests exercise a small set of critical browser-to-database workflows. They verify that separately tested parts work together, but remain selective because they are slower and more complex than lower-level tests. Detailed workflow selection belongs in [`e2e-test-plan.md`](./e2e-test-plan.md) once that plan is created.

### Manual Testing

Manual testing provides product and human judgment where automation is insufficient. It validates complete workflows, visual quality, responsive and RTL behavior, accessibility, browser differences, files, exports, printing, and unexpected usability problems. It complements rather than replaces automated regression coverage.

## 4. Risk-Based Testing

The required depth depends on the possible impact and likelihood of failure. These categories guide judgment rather than impose rigid rules.

### High Risk

High-risk changes affect tenant isolation, authentication or sessions, authorization, financial values, rental or maintenance lifecycles, transactions and concurrency, deletion and data integrity, or synchronization.

These changes generally require strong automated regression coverage at the owning backend or logic boundary, broader affected-suite execution, and relevant manual verification. Critical cross-system behavior may also justify E2E coverage.

### Medium Risk

Medium-risk changes include normal CRUD workflows, forms, filtering, API-backed pages, and important user interactions.

These normally require focused automated tests for changed behavior, affected package regression tests, and manual verification where user experience or integration risk remains.

### Low Risk

Low-risk changes include pure presentation adjustments, documentation, or small refactors that do not change behavior or contracts.

These may need only relevant typecheck, lint, and build checks plus focused visual or manual review. New automated tests are unnecessary when there is no meaningful new behavior to protect.

Risk can change with context. A small code change in authorization or a financial selector is high risk even if the diff is short.

## 5. When Testing Happens

### During Feature Development

Testing happens alongside implementation, not as a separate phase deferred until Milestone 6.

```text
Understand behavior
-> implement or change behavior
-> add or update focused automated tests
-> run affected tests
-> perform relevant manual verification
-> review
```

Tests should be added incrementally as meaningful backend rules, API contracts, frontend states, and interactions are introduced.

### During Bug Fixes

Reproduce the defect, add a regression test when practical, implement the correction, and verify nearby behavior that could share the same failure mode. If automation cannot reproduce the defect reliably, document and perform the appropriate manual verification instead of adding a brittle test.

### During Milestone 6: Production Readiness

Milestone 6 broadens system-level confidence; it is not the first testing phase. It should:

- close production-critical regression gaps;
- add critical E2E coverage;
- test offline synchronization as that capability is implemented;
- strengthen security verification;
- verify performance against real production-readiness needs;
- execute full manual regression and release testing;
- verify deployment and production smoke behavior.

### After Production

Testing should evolve from real defects, support findings, usage patterns, performance data, and new product capabilities. Recurring production failures should become regression tests at the lowest reliable level. Specialized strategies should be added only when the corresponding requirement exists.

## 6. Responsibilities by Change Type

| Change                                 | Expected verification                                   |
| -------------------------------------- | ------------------------------------------------------- |
| Pure business calculation              | Unit tests                                              |
| Database-backed business rule          | Backend integration/API tests                           |
| API authorization or tenant behavior   | Backend integration/API tests                           |
| Frontend form or state behavior        | Frontend component/page tests                           |
| Critical complete workflow             | E2E test where justified                                |
| Responsive, RTL, visual, or browser UX | Manual verification                                     |
| Bug fix                                | Regression test at the appropriate level when practical |

This mapping identifies the primary layer. Additional verification is added when the change crosses boundaries or has higher risk.

## 7. Critical Product Areas

Regression protection matters most around:

- authentication, sessions, and role authorization;
- organization isolation across data and files;
- rental lifecycle and vehicle availability;
- payments, balances, and financial reporting;
- maintenance lifecycle and vehicle state;
- transactions, concurrency, deletion, and database integrity;
- API contract and frontend integration;
- offline synchronization and conflict handling once implemented.

Failures in these areas can expose data, block operations, or produce incorrect business records and therefore receive deeper verification than low-impact presentation changes.

## 8. Definition of Testing Complete

A feature or change is sufficiently tested when, in proportion to its risk:

- relevant automated tests pass;
- new meaningful behavior has appropriate regression coverage;
- affected existing behavior has been checked for regressions;
- required manual verification is complete;
- applicable typecheck, lint, and build checks pass;
- no known release-blocking correctness, security, tenant-isolation, or data-integrity issue remains.

Testing complete does not mean every possible test layer was used. The selected evidence must be enough to support the change safely.

## 9. Release Strategy

Release confidence builds from narrow, fast feedback to broader product verification:

```text
Focused development tests
-> affected package regression tests
-> repository quality checks
-> critical E2E tests when available
-> manual release verification
-> production smoke verification
```

The scope of each step follows release risk. High-risk failures must be resolved or explicitly reviewed before release. Milestone 6 should establish the production-ready, repeatable form of this process without turning this strategy into CI/CD configuration.

## 10. Deferred Testing Needs

Specialized testing should arrive with the capability or scale requirement it protects. Do not design infrastructure now for:

- background jobs or queues;
- Redis or other cache behavior;
- notification delivery;
- large-scale load, stress, or soak testing without defined capacity targets;
- future payment gateways or external integrations.

## 11. Related Testing Documents

- [`automated-test-plan.md`](./automated-test-plan.md): automated test levels, current setup, environments, commands, and implementation timing.
- [`manual-test-plan.md`](./manual-test-plan.md): manual product, browser, workflow, and release verification.
- [`e2e-test-plan.md`](./e2e-test-plan.md): critical full-system browser workflows, once created.
