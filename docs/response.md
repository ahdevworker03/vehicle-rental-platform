# Step 10.2 — Vehicle Search (Backend): Complete

---

## Summary

Implemented vehicle search in the existing Vehicle module via `GET /api/vehicles?search=<term>`, matching the documented API structure (`11-domain-model-specification.md`: "Planned: `/api/vehicles` ... + `/api/vehicles?search=...`"). Search covers plate number, make, model, and year. Always org-scoped, excludes soft-deleted vehicles, reuses existing validation/response conventions. Followed the exact Step 10.1 (Customer Search) pattern.

---

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/modules/vehicles/vehicle.validation.ts` | Added `listVehiclesQuerySchema` (optional `search`, trimmed, min 1 / max 200) + `ListVehiclesQuery` type |
| `apps/api/src/modules/vehicles/vehicle.repository.ts` | Added `searchByOrg(orgId, term)` — org-scoped search across plate_number, make, model (contains, case-insensitive) + year (exact when term is an integer); excludes `deleted_at` |
| `apps/api/src/modules/vehicles/vehicle.service.ts` | `listVehicles(orgId, search?)` — uses `searchByOrg` when a search term is present, else `findByOrg` |
| `apps/api/src/modules/vehicles/vehicle.controller.ts` | `list` reads `req.query.search` and passes to the service |
| `apps/api/src/modules/vehicles/vehicle.routes.ts` | Added `validateQuery(listVehiclesQuerySchema)` to `GET /vehicles` |
| `lib/api-spec/openapi.yaml` | Added `search` query parameter to `/vehicles` GET + `422` response |
| `lib/api-client-react/src/generated/*` | Regenerated (`listVehicles` now accepts `ListVehiclesParams` with `search`) |
| `lib/api-zod/src/generated/*` | Regenerated |

No generated files were hand-edited. No separate search architecture, new migrations, or indexes were introduced (existing `plate_number`, `make`, `model` indexes already cover these queries).

---

## Search Behavior

| Field | Match type |
|---|---|
| plate_number | contains, case-insensitive |
| make | contains, case-insensitive |
| model | contains, case-insensitive |
| year | exact when the term parses as an integer |

- Single free-text `search` term (consistent with Customer search / documented `?search=...` convention).
- If no search term → existing list behavior preserved.
- Empty `search` → 422 `VALIDATION_ERROR`.
- Always `where: { organization_id: req.user.org, deleted_at: null }`.

---

## Organization Isolation

- `searchByOrg`/`findByOrg` both filter `{ organization_id: orgId, deleted_at: null }`.
- `orgId` comes exclusively from `req.user.org` (authenticated JWT).
- Verified at runtime: Org B's "Toyota" search returns only its own LandCruiser, never Org A's Corolla.

---

## Runtime Verification

### Clean-org verification (fresh org, 2 vehicles)

| Test | Expected | Actual |
|---|---|---|
| Make search (Toyota) | 1 (Toyota Corolla) | ✅ |
| Model search (Civic) | 1 (Honda Civic) | ✅ |
| Year search (2023) | 1 (2023) | ✅ |
| No search | all 2 | ✅ |
| Soft-delete Civic → model search | 0 | ✅ |
| Soft-delete Civic → year 2023 search | 0 | ✅ |

### Full test matrix (reused org, higher baseline counts from prior steps — not a bug)

| # | Test | Result |
|---|---|---|
| 1 | Search by plate (AAA111) | ✅ 1 result |
| 2 | Search by make (Toyota) | ✅ returns Toyota vehicles only |
| 3 | Search by model (Civic) | ✅ 1 result |
| 4 | Search by year (2023) | ✅ returns 2023 vehicles only |
| 5 | Partial make (Toy) | ✅ |
| 6 | Partial model (Civ) | ✅ |
| 7 | Partial plate (AAA) | ✅ |
| 8 | Cross-org (Org B searches Toyota → only its own) | ✅ |
| 9 | No search → all Org A vehicles | ✅ |
| 10 | Empty search → 422 | ✅ |
| 11 | Unauthenticated → 401 | ✅ |

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Search by plate number works | ✅ |
| Search by make works | ✅ |
| Search by model works | ✅ |
| Search by year works | ✅ |
| Partial text search works | ✅ |
| Organization isolation enforced | ✅ |
| Soft-deleted vehicles excluded | ✅ |
| Empty/invalid search input handled | ✅ (422) |
| Existing list behavior without search still works | ✅ |
| Typecheck passes | ✅ |
| Build passes | ✅ |
| Lint passes | ✅ |
| Prisma access in repository | ✅ |
| Business logic in service | ✅ |
| Controllers/routes thin | ✅ |
| No separate search architecture | ✅ |
| API contract updated + regenerated (not hand-edited) | ✅ |

---

## Notes

- No new migrations or indexes: the existing `plate_number`, `make`, `model` indexes (and PK/index on `organization_id`) already support the search queries. The `year` exact-match uses the existing table scan (year is not indexed, but matching a numeric term is bounded and consistent with the architecture's "indexes based on usage" principle).
