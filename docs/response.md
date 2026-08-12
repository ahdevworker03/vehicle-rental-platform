# Step 10.1 — Customer Search (Backend): Complete

---

## Summary

Implemented customer search in the existing Customer module via `GET /api/customers?search=<term>`, matching the documented API structure (`06-api-design.md` + `11-domain-model-specification.md`: "Planned: `/api/customers` ... + `/api/customers?search=...`"). Search covers name (first/last), national ID, driver's license number, and phone. Always org-scoped, excludes soft-deleted customers, reuses existing validation/response conventions.

---

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/modules/customers/customer.validation.ts` | Added `listCustomersQuerySchema` (optional `search`, trimmed, min 1 / max 200) + `ListCustomersQuery` type |
| `apps/api/src/modules/customers/customer.repository.ts` | Added `searchByOrg(orgId, term)` — org-scoped `contains` (case-insensitive) across first/last name, national_id, license_number, phone; excludes `deleted_at` |
| `apps/api/src/modules/customers/customer.service.ts` | `listCustomers(orgId, search?)` — uses `searchByOrg` when a search term is present, else `findByOrg` |
| `apps/api/src/modules/customers/customer.controller.ts` | `list` reads `req.query.search` and passes to the service |
| `apps/api/src/modules/customers/customer.routes.ts` | Added `validateQuery(listCustomersQuerySchema)` to `GET /customers` |
| `apps/api/src/middleware/validation.ts` | **Bug fix:** `validateQuery`/`validateParams` no longer reassign `req.query`/`req.params` (Express 5 makes them getter-only) |
| `lib/api-spec/openapi.yaml` | Added `search` query parameter to `/customers` GET + `422` response |
| `lib/api-client-react/src/generated/*` | Regenerated (listCustomers now accepts `ListCustomersParams` with `search`) |
| `lib/api-zod/src/generated/*` | Regenerated |

No generated files were hand-edited. No separate search architecture was introduced.

---

## Endpoint / Query Behavior

| Method | URL | Auth | Behavior |
|---|---|---|---|
| GET | `/api/customers` | Any authenticated | Returns all org customers (no search) |
| GET | `/api/customers?search=<term>` | Any authenticated | Returns customers matching name / national ID / license / phone |

- `search` is optional; if omitted, the existing list behavior is preserved.
- Empty `search` → 422 `VALIDATION_ERROR`.
- Case-insensitive partial matching (`contains`).
- Always scoped to `req.user.org`; `organization_id` never accepted from the client.
- `deleted_at` customers excluded.

---

## Organization Isolation

- `searchByOrg` and `findByOrg` both filter `where: { organization_id: orgId, deleted_at: null }`.
- `orgId` comes exclusively from `req.user.org` (authenticated JWT).
- Verified at runtime: Org B's search for "Ahmed" returns its own "Ahmed Foreign", never Org A's "Ahmed Hassan".

---

## Runtime Verification (13/13 PASS)

| # | Test | Expected | Actual |
|---|---|---|---|
| 1 | Search by first name (Ahmed) | 1 (Ahmed Hassan) | ✅ |
| 2 | Search by last name (Sleiman) | 1 (Ali Sleiman) | ✅ |
| 3 | Search by national ID (NID-AS-02) | 1 | ✅ |
| 4 | Search by license (LIC-AH-01) | 1 | ✅ |
| 5 | Search by phone (03222222) | 1 | ✅ |
| 6 | Partial name (Ah) | 1 (Ahmed Hassan) | ✅ |
| 7 | Partial national ID (NID-AS) | 1 (Ali Sleiman) | ✅ |
| 8 | Cross-org (Org B searches "Ahmed") | returns only Org B's Ahmed Foreign | ✅ |
| 9 | No search param | all Org A customers (5) | ✅ |
| 10 | Empty search | 422 VALIDATION_ERROR | ✅ |
| 11 | Unauthenticated | 401 | ✅ |
| 12 | Soft-deleted name search (Sleiman after delete) | 0 | ✅ |
| 13 | Soft-deleted national ID search (NID-AS-02 after delete) | 0 | ✅ |

---

## Issue Discovered & Resolved

**`validateQuery` middleware crashed on Express 5**: reassigning `req.query = result.data` throws `TypeError: Cannot set property query of #<IncomingMessage> which has only a getter`. Express 5 makes `req.query`/`req.params` getter-only. This pre-existing bug (Step 3.2) was never exercised until a route used `validateQuery`.

**Fix:** `validateQuery`/`validateParams` now only validate and forward errors; they no longer reassign `req.query`/`req.params` (the parsed query is read directly by the controller). Verified: search requests now succeed; empty search still returns 422.

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Name search returns matching customers | ✅ |
| National ID search works | ✅ |
| License number search works | ✅ |
| Phone search works | ✅ |
| Partial search works | ✅ |
| Cross-org customers never returned | ✅ |
| Soft-deleted customers excluded | ✅ |
| Empty/invalid search handled per validation conventions | ✅ (422) |
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

- The search index strategy is unchanged (existing `first_name`, `last_name`, `phone`, `national_id` indexes already cover these queries); no new migration was required.
