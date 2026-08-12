# Step 8.2 — Vehicle Module (Backend): Complete

---

## Files Created

| File | Purpose |
|---|---|
| `apps/api/src/modules/vehicles/vehicle.types.ts` | `VehicleRecord`, `VehicleResponse`, `CreateVehicleInput`, `UpdateVehicleInput` |
| `apps/api/src/modules/vehicles/vehicle.validation.ts` | `createVehicleSchema`, `updateVehicleSchema` (Zod) |
| `apps/api/src/modules/vehicles/vehicle.repository.ts` | `findByOrg`, `findById`, `create`, `update`, `softDelete` — org-scoped Prisma queries |
| `apps/api/src/modules/vehicles/vehicle.service.ts` | `listVehicles`, `getVehicle`, `createVehicle`, `updateVehicle`, `deleteVehicle` |
| `apps/api/src/modules/vehicles/vehicle.controller.ts` | `list`, `get`, `create`, `update`, `remove` — thin HTTP handlers |
| `apps/api/src/modules/vehicles/vehicle.routes.ts` | Route definitions with `authenticate` + `requireRole("OWNER")` |
| `apps/api/src/modules/vehicles/index.ts` | Barrel export |

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/routes/index.ts` | Added `vehiclesRouter` |

---

## Endpoint Summary

| Method | URL | Middleware | Role | Response |
|---|---|---|---|---|
| GET | `/api/vehicles` | `authenticate` | Any auth | 200 `{ data: VehicleResponse[] }` |
| GET | `/api/vehicles/:id` | `authenticate` | Any auth | 200 `{ data: VehicleResponse }` |
| POST | `/api/vehicles` | `authenticate` + `requireRole("OWNER")` + `validateBody(createVehicleSchema)` | OWNER | 201 `{ data: VehicleResponse }` |
| PATCH | `/api/vehicles/:id` | `authenticate` + `requireRole("OWNER")` + `validateBody(updateVehicleSchema)` | OWNER | 200 `{ data: VehicleResponse }` |
| DELETE | `/api/vehicles/:id` | `authenticate` + `requireRole("OWNER")` | OWNER | 204 No Content |

---

## Repository (`vehicle.repository.ts`)

| Function | Prisma Operation | Organization Scope |
|---|---|---|
| `findByOrg(orgId)` | `vehicle.findMany({ where: { organization_id, deleted_at: null } })` | Yes |
| `findById(vehicleId, orgId)` | `vehicle.findFirst({ where: { id, organization_id } })` | Yes |
| `create(data, orgId)` | `vehicle.create({ data: { ...data, organization_id } })` | Yes |
| `update(vehicleId, data)` | `vehicle.update({ where: { id }, data })` | Via prior org check |
| `softDelete(vehicleId)` | `vehicle.update({ where: { id }, data: { deleted_at } })` | Via prior org check |

---

## Service (`vehicle.service.ts`)

| Function | Business Logic |
|---|---|
| `listVehicles(orgId)` | Returns all non-deleted vehicles in org |
| `getVehicle(vehicleId, orgId)` | Org-scoped lookup → 404 if null/deleted |
| `createVehicle(orgId, input)` | Creates vehicle → catches P2002 → 409 `DUPLICATE_PLATE` |
| `updateVehicle(vehicleId, orgId, input)` | Org-scoped lookup → validates exists → updates → catches P2002 → 409 |
| `deleteVehicle(vehicleId, orgId)` | Org-scoped lookup → validates exists → soft delete |

---

## Validation

All fields validated per the authoritative spec:
- `make`, `model`, `plate_number`, `color` — required, non-empty strings
- `year` — required, integer, 1900–2100 range
- `vin`, `engine_number` — optional strings
- `transmission`, `fuel_type`, `status` — required, valid enum values
- `seats` — required, positive integer
- `current_mileage` — required, non-negative integer

Both schemas require all fields (full-resource update convention, consistent with Customer/Organization/User modules).

---

## Organization Isolation

- `findByOrg` filters: `{ organization_id: orgId, deleted_at: null }`
- `findById` uses: `findFirst({ where: { id, organization_id } })` — both must match
- `create` sets `organization_id` from `req.user!.org`
- `update`/`softDelete` only called after org-scoped `findById` succeeds
- All org IDs originate from `req.user!.org`, never from client input

---

## Duplicate Plate Handling

- DB-level: `@@unique([organization_id, plate_number])`
- App-level: Service catches `P2002` → `AppError(409, "DUPLICATE_PLATE")`
- Same plate in different orgs: allowed by unique constraint scope
- Both create and update protected

---

## Soft Delete

- `DELETE /api/vehicles/:id` sets `deleted_at`, returns 204
- After deletion: GET by ID → 404, LIST excludes deleted vehicles

---

## Manual Test Results (19/19 PASS)

| # | Test | Expected | Actual |
|---|---|---|---|
| 1 | Create vehicle | 201 | 201 ✅ |
| 2 | List vehicles | 200, count=1 | 200, count=1 ✅ |
| 3 | Get vehicle | 200 | 200 ✅ |
| 4 | Update vehicle | 200 | 200 ✅ |
| 5 | Duplicate plate same org | 409 | 409 `DUPLICATE_PLATE` ✅ |
| 6 | Same plate other org | 201 allowed | 201 ✅ |
| 7 | Cross-org GET | 404 | 404 ✅ |
| 8 | Cross-org PATCH | 404 | 404 ✅ |
| 9 | Cross-org DELETE | 404 | 404 ✅ |
| 10 | Missing fields | 422 | 422 ✅ |
| 11 | Invalid enum | 422 | 422 ✅ |
| 12 | Invalid year | 422 | 422 ✅ |
| 13 | Negative mileage | 422 | 422 ✅ |
| 14 | Invalid seats | 422 | 422 ✅ |
| 15 | DELETE vehicle | 204 | 204 ✅ |
| 16 | GET deleted | 404 | 404 ✅ |
| 17 | Deleted excluded | Count=0 | Count=0 ✅ |
| 18 | Unauthenticated GET | 401 | 401 ✅ |
| 19 | MANAGER creates vehicle | 403 | 403 ✅ |

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| CRUD operations complete | ✅ |
| Organization isolation enforced | ✅ |
| Validation passes | ✅ |
| Duplicate prevention verified | ✅ |
| Soft delete verified | ✅ |
| Controllers remain thin | ✅ |
| Services contain business logic only | ✅ |
| Repositories contain all Prisma access | ✅ |
| API responses follow documented format | ✅ |
| Authorization follows documented architecture | ✅ |
| TypeScript passes | ✅ |
| Build passes | ✅ |
| Lint passes | ✅ |
| Manual verification completed | ✅ 19/19 |

---

# Step 8.2 Final Review

## 1. Soft-Delete / Plate-Number Reuse Finding

**Actual behavior:** A soft-deleted vehicle **continues to reserve its plate number**.

- The unique constraint `@@unique([organization_id, plate_number])` applies to **all rows**, including soft-deleted ones (`deleted_at` set, row never physically removed).
- Empirically verified: create `PLT1` → 201; DELETE → 204; create `PLT1` again → **409 `DUPLICATE_PLATE`**.

**Correction to prior report:** The earlier claim "Deleted vehicles can reuse plate numbers" was **incorrect**. The correct statement is: "A soft-deleted vehicle still occupies the unique-constraint slot, so its plate number **cannot** be reused within the same organization." The second statement in the prior report ("deleted row still occupies the unique constraint slot") was correct.

**Spec consistency:** The authoritative specification is **silent** on whether soft-deleted vehicles release their plate number. It documents only:
- `@@unique([organization_id, plate_number])` (applies to all rows)
- Soft delete via `deleted_at`

The actual behavior (plate stays reserved after soft delete) is the **natural consequence** of the documented design. No spec provision authorizes plate reuse after deletion, and the specification does not define partial-unique-index behavior. This is **consistent with the spec** — the spec is not violated, it is simply silent on reuse, and the implemented behavior follows from the documented unique constraint + soft-delete design.

## 2. Vehicle Status / Default Finding

**Actual behavior:** `status` is **required** in `POST /api/vehicles` and `PATCH /api/vehicles/:id`.

- Empirically verified: creating a vehicle **without** `status` → **422 VALIDATION_ERROR** ("Status must be a valid vehicle status").
- The database default `AVAILABLE` is **not exercised** by the API because validation rejects requests that omit `status`. It remains a DB-level safety net.

**Spec consistency:** The specification's Fields table marks `status` as **required (✅)** with a DB default of `AVAILABLE`. The spec's Validation Rules section does not list `status` explicitly — a minor internal inconsistency in the spec (Fields table says required; Validation Rules omit it). 

**Codebase convention:** This matches the **User module** pattern exactly:
- User model: `role Role @default(OWNER)` — DB default exists.
- User create schema: `role` is **required** (an enum, restricted to MANAGER/EMPLOYEE).
- The DB default `OWNER` is never exercised by the API either.

The Vehicle implementation (requiring `status`, a valid enum) is therefore **consistent with the established codebase convention** and the spec's Fields table. **No change required.**

**Conclusion on Point 2:** The implementation is correct. `status` required in POST is intentional and consistent with the existing API conventions (mirrors `role` in the User module). The DB default `AVAILABLE` is a safety net, not a substitute for client validation.

## 3. Code Changes Required

**None.** Both behaviors verified as correct and consistent with the authoritative specification and existing codebase conventions. No code was modified during this review.

## 4. Verification Results

| Check | Result |
|---|---|
| Focused runtime test: create without `status` | 422 VALIDATION_ERROR (status required) |
| Focused runtime test: plate reuse after soft delete | 409 DUPLICATE_PLATE (plate stays reserved) |
| TypeScript | ✅ `pnpm run typecheck` — 0 errors |
| Build | ✅ `pnpm run build` — 134ms |
| Lint | ✅ `pnpm run lint` — 0 errors |

## Final Verdict

**Step 8.2 is fully verified.** Both review points were inspected in the actual code (schema, migration, validation, service, repository) and confirmed with runtime tests. No corrections were required.
