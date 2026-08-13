# Milestone 2 Fix #2 — Block Media Access for Soft-Deleted Owners

---

## Summary

Fixed the AI review finding that media (photos/documents) belonging to soft-deleted vehicles or customers remained accessible. The owner lookups used by media operations (`findVehicle` / `findCustomer` in `media.repository.ts`) previously matched by `id + organization_id` only, so after a vehicle/customer was soft-deleted its photos and documents could still be listed, retrieved, or downloaded. Both lookups now also require `deleted_at: null`.

---

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/modules/media/media.repository.ts` | Added `deleted_at: null` to the `findVehicle` and `findCustomer` `where` clauses. |

No schema changes, no migrations, no new dependencies, no changes to other modules. The service layer already delegates to these repo functions via `ensureVehicleInOrg` / `ensureCustomerInOrg`, so business logic stays in the service and Prisma access stays in the repository.

---

## Exact Behavior Changed

Before: `findVehicle` / `findCustomer` matched `{ id, organization_id }` regardless of `deleted_at`. After: they also require `deleted_at: null`.

Consequence — for a **soft-deleted** vehicle or customer:
- Vehicle photo list → 404
- Vehicle photo get → 404
- Vehicle photo serve → 404
- Vehicle document list → 404
- Vehicle document get → 404
- Vehicle document download → 404
- Customer document list → 404
- Customer document get → 404
- Customer document download → 404

Active owners are unaffected (their `deleted_at` is null). Soft-delete behavior itself is unchanged; organization isolation is preserved (the org scope is still in every query).

---

## Runtime Tests Performed

Setup: two fresh organizations (A, B); vehicle + customer + photo + vehicle document + customer document created in org A.

| Test | Expected | Actual |
|---|---|---|
| Active vehicle photo list | 200 | ✅ 200 |
| Active vehicle photo serve | 200 | ✅ 200 |
| Active vehicle document list | 200 | ✅ 200 |
| Active vehicle document download | 200 | ✅ 200 |
| Active customer document list | 200 | ✅ 200 |
| Active customer document download | 200 | ✅ 200 |
| Soft-delete vehicle → photo list | 404 | ✅ 404 |
| Soft-delete vehicle → photo get | 404 | ✅ 404 |
| Soft-delete vehicle → photo serve | 404 | ✅ 404 |
| Soft-delete vehicle → doc list | 404 | ✅ 404 |
| Soft-delete vehicle → doc get | 404 | ✅ 404 |
| Soft-delete vehicle → doc download | 404 | ✅ 404 |
| Soft-delete customer → doc list | 404 | ✅ 404 |
| Soft-delete customer → doc get | 404 | ✅ 404 |
| Soft-delete customer → doc download | 404 | ✅ 404 |
| Cross-org (B) → A's soft-deleted vehicle photo list/serve | 404 | ✅ 404 |
| Cross-org (B) → A's soft-deleted customer doc list/download | 404 | ✅ 404 |
| Fresh active owner (org B) photo list/serve | 200 | ✅ 200 |
| Org A → org B vehicle photo list (cross-org active) | 404 | ✅ 404 |

---

## Typecheck / Build / Lint Results

| Check | Result |
|---|---|
| API TypeScript (`apps/api`) | ✅ 0 errors |
| Web TypeScript (`apps/web`) | ✅ 0 errors |
| API build | ✅ Done in 137ms |
| API lint (`pnpm run lint`) | ✅ clean |
| Root lint (`pnpm run lint`) | ✅ 0 errors |
| Web tests | ✅ 7 files / 31 tests |

---

## Remaining Limitations

None introduced by this change. Note: a soft-deleted owner's media rows still exist in the database (by design — soft delete preserves records for audit/recovery) but are no longer reachable through any media endpoint. Physical storage files are not deleted on soft delete (unchanged, per the domain spec).
