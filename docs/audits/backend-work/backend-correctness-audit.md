# Milestone 5.6.1 — Cross-Backend Correctness Audit

**Audit date:** 2026-08-24
**Production target:** `apps/api` (Node.js, Express, Prisma/PostgreSQL)
**Reference:** `docs/audits/backend-work/backend-reference/CarRentalAPI` (.NET/EF Core)
**Scope:** documentation-only audit; no production, contract, schema, generated, or frontend changes were made.

## 1. Executive summary and readiness

The current backend has a sound foundation: authenticated routes, organization-scoped repository reads, soft-delete fields, Prisma uniqueness constraints, API-body validation, consistent `AppError` responses, and serializable transactions for rental creation and lifecycle transitions. Nullable rental actual-date mapping is correct, and payment balances use `Decimal` arithmetic before serialization.

Seven verified correctness findings remain: one critical and six high. `GET /api/customers` is confirmed to return HTTP 500 when a persisted customer has a non-serializable licence-expiry value; this blocks the customer list and must be diagnosed and repaired before customer manual QA. The critical issue lets an owner update a rental into an invalid or overlapping period after creation. Until both are fixed and regression-tested, the backend is **not ready for normal customer or reservation-amendment workflows**. Maintenance availability, rental deletion, contract regeneration, document reliability, and tenant provisioning also require remediation before Milestone 6 release sign-off.

This report distinguishes verified defects from absent or intentionally different reference features. The .NET code is a correctness reference, not a migration target.

## 2. Scope, method, and evidence limits

Reviewed current implementation: Express route assembly and middleware; all module routes/controllers/services/repositories/validation; Prisma schema, migrations, and seed; OpenAPI and generated type boundaries; API tests; and frontend API consumers where they expose customer-visible backend effects. Reviewed the reference entities, EF migrations/configuration, mappings, repositories, services, DTO behavior, and exception paths.

The comparison concerns business behavior and integrity controls, not framework or project-layout differences. “Reference behavior” below is evidence only; a reference-only capability is not a defect by itself.

Static evidence is current as of the audit date. `pnpm --filter @workspace/api-server typecheck` passed. The database-backed test command could not establish a local PostgreSQL connection (see section 9), so no dynamic business-flow claim is based on a passing test run.

## 3. Current Node/Prisma evidence matrix

| Area | Verified current behavior | Key evidence |
| --- | --- | --- |
| App/auth/error boundary | `/api` route assembly, bearer authentication verifies the token and rejects deleted users; standardized `AppError` responses | `apps/api/src/app.ts:29-36`; `middleware/auth.ts:6-69`; `middleware/error-handler.ts:13-38` |
| Tenant isolation | Module reads normally include `organization_id`; route handlers derive it from the authenticated JWT | `middleware/auth.ts:32-56`; `modules/rentals/rental.repository.ts:25-67`; `modules/payments/payment.repository.ts:17-40` |
| Customers/users/orgs | CRUD is soft-delete based; customer identifiers are unique within organization; `GET /customers` is confirmed to fail with HTTP 500 when `license_expiry_date` cannot be serialized; user self-delete is blocked | `lib/db/prisma/schema.prisma:132-159`; `modules/customers/customer.service.ts:10-43`; `modules/users/user.service.ts:78-97` |
| Vehicles/rentals | Creation checks period, tenant-owned customer/vehicle, availability overlap, then sets `RESERVED` in a serializable transaction; pickup/return/cancel synchronize vehicle state | `modules/rentals/rental.service.ts:87-220`, `258-457`; `rental.repository.ts:143-181` |
| Payments | Positive amounts and known payment methods are checked; balances are aggregated using Prisma `Decimal` | `modules/payments/payment.service.ts:31-106` |
| Maintenance/expenses/tasks | Maintenance has a constrained record lifecycle; expenses and tasks are tenant scoped and soft deleted | `modules/maintenance/maintenance.service.ts:37-58`, `121-281`; `modules/expenses/expense.repository.ts:7-70`; `modules/tasks/task.service.ts:21-95` |
| Contracts/media | Contracts snapshot rental data; media validates MIME type and maximum size; documents/photos are tenant scoped | `modules/contracts/contract.service.ts:102-185`, `218-338`; `modules/media/media.service.ts:297-442` |
| Data model | UUID tenant ownership, soft-delete columns, index support, decimal money, and rental status enums are present | `lib/db/prisma/schema.prisma:9-29`, `132-159`, `196-240`, `291-341` |

## 4. Reference-backend evidence matrix

| Area | Reference integrity behavior | Key evidence |
| --- | --- | --- |
| Rental creation/update | Validates complete period and monetary values; update checks availability excluding itself | `CarRental/Application/Services/Rentals/RentalService.cs:29-55`, `115-118` |
| Rental transitions | Requires reserved-to-active and active-to-returned; reference additionally records mileage | `RentalService.cs:58-84` |
| Maintenance | Entering `IN_PROGRESS` marks vehicle `MAINTENANCE`; completion returns a maintenance-marked vehicle to operational state | `CarRental/Application/Services/Maintenance/MaintenanceService.cs:11-12` |
| Tenant enforcement | User-scoped service entry points obtain the owned entity before action | `RentalService.cs:98-110`; `Customers/CustomerService.cs:27-42`, `121-123` |
| Media faults | Validates uploads and turns missing stored files into a domain `FILE_NOT_FOUND` error; compensates storage on failed metadata persistence | `Media/MediaService.cs:81-106` |
| Payments | Allows multiple positive payments and returns `total - paid`; it does **not** demonstrate an overpayment cap | `Payments/PaymentService.cs:28-63` |

## 5. Verified findings

### BDA-001 — Critical — Rentals: PATCH bypasses period, amount, and overlap invariants

**Current behavior:** `updateRental` loads an owned rental then directly writes supplied dates and monetary fields. It does not call `assertValidPeriod`, check overlap, use a transaction, or enforce lifecycle eligibility. A reservation can therefore be patched to overlap another non-deleted reservation, end before it starts, or contain invalid commercial totals.

**Reference behavior:** The reference derives complete values, validates the period and amounts, and rejects a conflicting period before persistence.

**Evidence:** Current `apps/api/src/modules/rentals/rental.service.ts:224-255`; current overlap implementation `apps/api/src/modules/rentals/rental.repository.ts:143-181`; reference `CarRental/Application/Services/Rentals/RentalService.cs:45-55`, `115-118`.

**Fix direction:** Move PATCH through the same Node/Prisma domain invariant path as create/extend: compute effective fields, validate dates and amounts, allow only approved statuses, query conflicts excluding the rental, and persist with a serializable transaction. Do not copy the .NET structure; reuse the current repository transaction abstraction.

**Affected files:** `apps/api/src/modules/rentals/rental.service.ts`, `rental.repository.ts`, `rental.service.test.ts`, `rental.routes.test.ts`, and, if error outcomes change, `lib/api-spec/openapi.yaml` followed by generation.

**Required tests:** valid amendment; reverse/equal period; overlap after amendment; amendment of `RETURNED`/`CANCELLED`; invalid amounts; concurrent conflicting amendment.
**QA/Milestone 6 gate:** An owner cannot make two live reservations for the same vehicle and overlapping dates through any rental mutation endpoint.

### BDA-002 — High — Rentals: soft deletion leaves the vehicle lifecycle state stale

**Current behavior:** `deleteRental` soft-deletes only the rental. It does not release a `RESERVED` vehicle or resolve the policy for deleting an `ACTIVE` rental. The vehicle can remain unavailable forever in the vehicle list/availability query although its reservation is hidden.

**Reference behavior:** The reference also soft-deletes rentals, so it is not a reference divergence. The defect is established by the current backend’s own status synchronization on create/pickup/return/cancel but its omission on delete.

**Evidence:** Current `apps/api/src/modules/rentals/rental.service.ts:200-204`, `288-289`, `332-338`, `446-451`, and `460-468`; availability rejects non-operational vehicle states at `97-108` and `485-505`.

**Fix direction:** Define deletion policy explicitly. Safest: reject deletion of `ACTIVE` rentals; for `RESERVED`, soft-delete and release the vehicle atomically only when no other active/reserved rental requires its state. Keep cancellation as the normal customer-facing release flow.

**Affected files:** `rental.service.ts`, `rental.repository.ts`, rental service/route tests, OpenAPI if a new `409` response is exposed.
**Required tests:** delete reserved rental releases vehicle; deleting active rental rejects; soft-deleted rental does not block overlap; deletion is tenant scoped.
**QA/Milestone 6 gate:** A deleted reservation cannot strand a vehicle as `RESERVED`, and active rentals cannot be silently removed.

### BDA-003 — High — Maintenance: lifecycle does not affect availability

**Current behavior:** `updateMaintenance` can move a record to `IN_PROGRESS`, and `completeMaintenance` marks it `COMPLETED`, but neither reads nor updates vehicle status. A vehicle with active work remains rentable because rental creation/availability only reject a vehicle whose status is already `MAINTENANCE`, `OUT_OF_SERVICE`, or `ARCHIVED`.

**Reference behavior:** Moving maintenance to `IN_PROGRESS` sets `VehicleStatus.MAINTENANCE`; completion restores a vehicle that was maintenance-marked.

**Evidence:** Current `apps/api/src/modules/maintenance/maintenance.service.ts:153-250`; current rental availability `apps/api/src/modules/rentals/rental.service.ts:97-108`, `485-505`; reference `CarRental/Application/Services/Maintenance/MaintenanceService.cs:11-12`.

**Fix direction:** Use one serializable transaction to change maintenance and vehicle state. On start, set `MAINTENANCE` only when consistent with rental policy; on completion/deletion, restore availability only if no other in-progress maintenance or live rental blocks it. Do not force a status transition over an active rental—return a business conflict instead.

**Affected files:** maintenance service/repository/tests, rental availability tests, possibly vehicle status policy tests.
**Required tests:** start blocks new reservation; complete restores an otherwise free vehicle; simultaneous live rental conflicts; two maintenance records do not restore too early; cross-tenant behavior.
**QA/Milestone 6 gate:** A vehicle in in-progress maintenance never appears in availability and is restored only when operationally eligible.

### BDA-004 — High — Contracts: a soft-deleted contract permanently blocks regeneration

**Current behavior:** `generateContract` rejects whenever `findByRental` returns a record. That repository lookup includes soft-deleted contracts, while deletion only sets `deleted_at`. A deleted contract therefore makes subsequent generation return `CONTRACT_EXISTS` indefinitely.

**Reference behavior:** No equivalent deleted-contract regeneration path was demonstrated in the inspected reference; this finding follows the current soft-delete contract semantics, not a missing reference feature.

**Evidence:** Current `apps/api/src/modules/contracts/contract.service.ts:119-131`, `174-185`; `apps/api/src/modules/contracts/contract.repository.ts:8-15`, `105-109`; schema contract soft-delete field `lib/db/prisma/schema.prisma:360-389`.

**Fix direction:** Make the active-contract lookup explicitly filter `deleted_at: null`; preserve historical rows by either allowing a new contract after soft delete (requires a schema-compatible uniqueness decision) or restoring/replacing the old row under a documented audit policy.

**Affected files:** contract service/repository/tests; Prisma migration and OpenAPI only if the selected lifecycle policy needs them.
**Required tests:** generate, delete, regenerate; deleted contract returns 404 from read endpoints; tenant isolation; concurrent generate attempts.
**QA/Milestone 6 gate:** An owner can correct a deleted draft contract without losing the ability to generate a usable replacement.

### BDA-005 — High — Media and signed contracts: missing storage objects return 500 and upload persistence is not compensated

**Current behavior:** both media and signed-contract uploads store the file before creating its database row, with no cleanup if metadata creation fails. Downloads call `storageProvider.retrieve` without converting filesystem `ENOENT`/access failures to an application 404, so the global handler returns `500 INTERNAL_ERROR`.

**Severity rationale:** This is High rather than Medium because a database record can represent an unavailable vehicle/customer document or signed contract, and a customer-facing document retrieval failure is indistinguishable from an internal server failure. The two stores no longer describe the same business record; a retry does not reliably repair that state.

**Reference behavior:** The reference deletes the stored object when metadata persistence fails and maps absent stored files to `FILE_NOT_FOUND`.

**Evidence:** Current `apps/api/src/modules/media/media.service.ts:354-367`, `396-415`, `418-441`; `apps/api/src/modules/contracts/contract.service.ts:255-269`, `291-319`; `apps/api/src/storage/local-filesystem-provider.ts:40-44`; `middleware/error-handler.ts:29-38`; reference `CarRental/Application/Services/Media/MediaService.cs:81-106`.

**Fix direction:** Wrap metadata create in `try/catch` and call provider `delete` on failure; map missing-object storage errors to a stable `404 FILE_NOT_FOUND` AppError without leaking filesystem details. Preserve the current path-containment protection.

**Affected files:** media/contract services, storage error boundary, module route/service tests, API spec error responses if the code is contractual.
**Required tests:** missing blob returns 404; DB-create failure calls storage delete; contract and both vehicle/customer document variants; an unexpected storage failure remains 500.
**QA/Milestone 6 gate:** A missing uploaded file is a recoverable not-found response, and failed uploads do not leave inaccessible orphan files.

### BDA-006 — High — Registration: organization and owner creation are not atomic

**Current behavior:** registration checks email, creates an organization, then creates its owner in separate Prisma calls. If the second write fails (for example, a concurrent same-email registration or transient database error), an ownerless organization remains.

**Severity rationale:** This is High rather than Medium. Tenant and owner creation is a single production consistency boundary: an orphaned tenant has no administrator and cannot complete the basic SaaS lifecycle. The risk exists whenever the second write fails; it is not conditional on high registration volume.

**Reference behavior:** No directly comparable atomic-provisioning implementation was demonstrated in the inspected reference. This is a current persistence-integrity finding.

**Evidence:** `apps/api/src/modules/auth/auth.service.ts:13-48`; schema makes `User.email` globally unique at `lib/db/prisma/schema.prisma:104-118`.

**Fix direction:** Create organization and owner in a Prisma transaction, translate unique conflicts consistently, and issue tokens only after commit.

**Affected files:** `auth.service.ts`, auth tests, database transaction helper if needed.
**Required tests:** duplicate/concurrent registration leaves no extra organization; owner and organization both persist on success; token issue failure cannot leave ambiguous state.
**QA/Milestone 6 gate:** Failed registration cannot create a tenant that nobody can administer.

### BDA-007 — High — Customers: an invalid persisted licence-expiry date crashes the list endpoint

**Confirmed runtime behavior:** `GET /api/customers` has been reproduced as HTTP 500 with `RangeError: Invalid time value` at `Date.toISOString`, `apps/api/src/modules/customers/customer.service.ts:30`, during `Array.map` in `listCustomers`. One affected active customer prevents the entire tenant customer list from being returned.

**Confirmed code behavior:** Line 30 serializes `record.license_expiry_date` as `licenseExpiryDate` with `record.license_expiry_date.toISOString()`. The OpenAPI response requires this field as a `date-time`, and the generated input/output schemas coerce it to a JavaScript `Date`. The mapper therefore assumes every persisted value is within the JavaScript `Date` serializable range.

**Static root-cause assessment:** The failing field is proven: `Customer.license_expiry_date` / API `licenseExpiryDate`. The precise persisted value and insertion path are **not** statically provable. The Prisma model and original migration require `DateTime` / `TIMESTAMP(3) NOT NULL`, but do not constrain the database value to the JavaScript date range. PostgreSQL can contain timestamp values outside that range (and special timestamp values through direct database writes), whereas the normal API route validates/coerces incoming values before create/update. `lib/db/src/seed.ts` creates no customers, and no migration modifies this field after its creation. Plausible sources are pre-existing, imported, or direct-SQL data; none may be asserted as the root cause without inspecting the affected database row.

**Evidence:** Runtime stack supplied for this audit; current mapper `apps/api/src/modules/customers/customer.service.ts:10-43`; request writes `:59-122`; schema `lib/db/prisma/schema.prisma:132-145`; initial migration `lib/db/prisma/migrations/20260812054816_add_customer_model/migration.sql:2-14`; empty seed `lib/db/src/seed.ts:1-15`; OpenAPI `lib/api-spec/openapi.yaml:3465-3501`, `3521-3585`; generated schemas `lib/api-zod/src/generated/customers/customers.ts:22-35`, `48-56`, `110-118`.

**Fix direction:** First inspect and repair/quarantine the offending production row(s), preserving an auditable correction path. Then enforce a supported date-range invariant at the database/application boundary and make the mapper return a deliberate domain/data-integrity failure for any remaining invalid persisted date. Do not silently omit, null, substitute, or swallow the licence-expiry value: the contract requires it and rentals depend on reliable licence data. Select the exact database constraint/data-repair migration only after the live value and legitimate business date range are known.

**Affected files:** customer service/repository/tests; data-repair migration or operational script after DB inspection; schema/OpenAPI/generated packages only if the approved invariant changes the public contract.
**Required tests:** list and get customers with a valid date; create/update boundary dates; a deliberately invalid persisted value produces the chosen explicit data-integrity outcome without hiding the record; the repaired row is returned with the required `licenseExpiryDate`; tenant isolation.
**QA/Milestone 6 gate:** `GET /api/customers` and customer detail return successfully for every active customer in the QA tenant, and database inspection confirms no active row has a licence-expiry value outside the supported range.

## 6. Cross-cutting controls and items not demonstrated as defects

**Tenant scoping:** No cross-tenant data-access defect was verified. The audited module repositories scope their reads by `organization_id`, services establish ownership before unscoped primary-key updates, and authentication supplies the organization claim. Retain tenant-isolation regression tests because the write pattern relies on that service precondition.

**Soft delete:** Current list queries generally filter `deleted_at: null`; individual getters intentionally fetch then return 404 for deleted rows. This is consistent, except for BDA-002 and BDA-004 lifecycle consequences.

**Date mapping:** Rental actual dates are nullable in Prisma and are guarded before `toISOString()` at `rental.service.ts:51-84`. Customer `license_expiry_date` is required, but its mapper crash is a verified issue (BDA-007), not a nullability issue. The actual invalid database value and insertion path still require database inspection.

**Payments/overpayment:** Current code returns a negative outstanding balance if payments exceed the rental total (`payment.service.ts:70-81`), and the reference behaves equivalently (`PaymentService.cs:28-63`). No approved product rule establishing a cap, credit balance, refund flow, or zero clamp was found. Treat this as a **Milestone 6 product-policy decision**, not a verified defect; add tests once policy is chosen.

**Financial reporting:** Reporting is frontend-derived from recorded payments by `paymentDate` and `Expense.amount` by `expenseDate`; net profit excludes `Maintenance.cost` (`apps/web/src/features/reports/selectors.ts:93-120`). This matches the current model’s separate `Maintenance.cost` and `Expense.amount` fields. A server reporting module is not required by the current contract, so its absence is **reject/not applicable** for this audit.

## 7. Contract, generated-type, and frontend-consumer impact

`lib/api-spec/openapi.yaml` is the contract source and `lib/api-zod` / `lib/api-client-react` are derived. The current contract exposes lifecycle endpoints and soft rental deletion (`openapi.yaml:1776-2030`). Fixes that only strengthen server invariants can preserve response schemas; new documented `409`/`404` outcomes should update the OpenAPI source and regenerate clients.

Frontend inspection was limited to validating customer-visible assumptions. `PaymentSection` treats only zero outstanding balance as paid and styles any negative balance as positive (`apps/web/src/components/ui/PaymentSection.tsx:103-151`), reinforcing the need to decide rather than silently clamp overpayments. Reports compute payment revenue, rather than invoiced rental totals, from API payment data. No frontend changes are recommended in this milestone.

## 8. Disposition, implementation order, and release gates

| Disposition | Items |
| --- | --- |
| **Milestone 6 blockers** | BDA-007 customer date data integrity; BDA-001 rental PATCH; BDA-003 maintenance availability; BDA-002 deletion lifecycle; BDA-004 contract regeneration; BDA-005 document reliability; BDA-006 atomic registration |
| **Manual-QA gates** | Customer-list/detail smoke after data inspection and repair; amendment overlap; deletion/cancellation status release; maintenance start/complete availability; contract delete/regenerate; missing-file downloads; failed registration leaves no tenant; two-tenant access checks |
| **Reject / not applicable** | Porting .NET paging/admin architecture; adding backend reports solely for parity; overpayment cap before product policy exists |

Recommended fix order: BDA-007 (inspect and repair the customer data before code changes), BDA-001, BDA-003, BDA-002, BDA-006, BDA-005, then BDA-004. The first item restores customer operability without concealing corrupt data; the next three protect the normal reservation-to-return workflow; tenant provisioning and document consistency follow; the final item protects contract correction.

## 9. Verification performed and test gaps

| Check | Result | Audit interpretation |
| --- | --- | --- |
| `pnpm --filter @workspace/api-server typecheck` | Passed | Current TypeScript project compiles without type errors. |
| `pnpm --filter @workspace/api-server test` | Blocked: 8 test files / 120 tests fail before assertions | Every affected test fails in `src/test/helpers.ts:12` during database cleanup because Prisma cannot connect to `127.0.0.1:5432` (`connect EPERM`). This is an environment/database-availability limitation, not evidence that the 120 named behaviors regress. |
| Static route/service/repository/schema/contract review | Completed | Basis for findings and non-findings in this report. |

Coverage is notably absent for the customer date failure, the audited rental module’s high-risk update/delete behavior, and contract/media lifecycle failures. After database connectivity is available, inspect the affected customer data, add the required tests in section 5, and rerun the whole backend suite.

## 10. Final judgment

The backend’s tenant-scoped CRUD foundation is credible, but normal customer workflows are **not** release-ready: `GET /api/customers` is confirmed to return HTTP 500 for at least one persisted customer, and the underlying data value must be inspected and repaired rather than hidden. Rental PATCH can also create invalid double bookings. Resolve all seven Milestone 6 blockers, execute database-backed regression tests, and complete the listed manual-QA gates before declaring backend correctness ready. No current evidence supports a tenant-isolation breach, a rental nullable-date mapping defect, a payment Decimal arithmetic defect, or a need to port reference-only architecture.
