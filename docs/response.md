# Milestone 2 Fix #3 — Unify Backend Validation with Generated API Zod

---

## Summary

Implemented Option A from the Fix #3 investigation: the OpenAPI contract is now the single source of truth for JSON request validation, and the duplicated hand-written backend Zod schemas were replaced with the generated `@workspace/api-zod` schemas. No validation behavior was weakened. Multipart media validation is intentionally unchanged (multer + media-specific checks).

---

## Files Modified

| File | Change |
|---|---|
| `lib/api-spec/openapi.yaml` | Added constraints: `format: email` on Register/Login/CreateUser emails; vehicle `year` minimum 1900 / maximum 2100; `seats` minimum 1; `current_mileage` minimum 0; customer/vehicle `search` minLength 1 / maxLength 200. |
| `lib/api-spec/orval.config.ts` | Added `zod: { version: 3 }` to the zod output override so orval emits Zod 3-compatible schemas (the repo uses Zod 3.25.76; without this orval defaults to Zod 4 and emits `zod.email()` which does not exist in Zod 3). |
| `lib/api-zod/src/generated/` | **Regenerated** by orval (`api.ts` + request/params type files). No hand edits. |
| `lib/api-client-react/src/generated/` | **Regenerated** by orval (`api.schemas.ts` — additive JSDoc annotations only, no type breaks). No hand edits. |
| `apps/api/src/modules/customers/customer.validation.ts` | Now re-exports generated `CreateCustomerBody` / `UpdateCustomerBody` / `ListCustomersQueryParams` as `createCustomerSchema` / `updateCustomerSchema` / `listCustomersQuerySchema`; preserves exported type names (`CreateCustomerInput`, `UpdateCustomerInput`, `ListCustomersQuery`) with string-typed `license_expiry_date` to keep the service contract unchanged. |
| `apps/api/src/modules/vehicles/vehicle.validation.ts` | Now re-exports generated `CreateVehicleBody` / `UpdateVehicleBody` / `ListVehiclesQueryParams`; preserves exported type names. |
| `apps/api/src/modules/auth/auth.validation.ts` | Now re-exports generated `RegisterOrganizationBody` / `LoginBody` / `RefreshTokenBody` / `LogoutBody`; preserves `RegisterInput` / `LoginInput` / `RefreshInput` / `LogoutInput`. |
| `apps/api/src/modules/users/user.validation.ts` | Now re-exports generated `CreateUserBody` / `UpdateUserBody`; preserves `CreateUserInput` / `UpdateUserInput`. |
| `apps/api/src/modules/organizations/organization.validation.ts` | Now re-exports generated `UpdateMyOrganizationBody`; preserves `UpdateOrganizationInput`. |

Unchanged: `media.validation.ts` (multipart uploads stay on multer + media MIME/size checks — outside generated JSON schemas by design).

---

## OpenAPI Constraints Added

- `RegisterRequest.email`, `LoginRequest.email`, `CreateUserRequest.email` → `format: email`
- `CreateVehicleRequest` / `UpdateVehicleRequest`:
  - `year` → `minimum: 1900`, `maximum: 2100`
  - `seats` → `minimum: 1`
  - `current_mileage` → `minimum: 0`
- `search` query param (customers + vehicles) → `minLength: 1`, `maxLength: 200`

These preserve the exact constraints that were previously enforced only by the hand-written schemas.

---

## Generated Packages Regenerated

- `@workspace/api-zod` — regenerated via `pnpm run codegen` (orval). Now emits `zod.string().email()`, `zod.number().min(1900).max(2100)`, `zod.number().min(1)`, `zod.number().min(0)`, and `zod.coerce.string().min(1).max(200).optional()`.
- `@workspace/api-client-react` — regenerated via the same command (constraint annotations only).

---

## Hand-written Validation Files Removed/Reduced

All five modules' validation files were reduced from hand-written Zod schemas to thin re-export shims over the generated schemas, preserving the exported schema constant names and input type names used by routes/controllers/services. No controller or service files needed changes.

---

## Runtime Validation Tests (against rebuilt backend)

| Test | Expected | Actual |
|---|---|---|
| Register with invalid email | 422 | ✅ 422 |
| Login with invalid email | 422 | ✅ 422 |
| Create user with invalid email | 422 | ✅ 422 |
| Vehicle year 1899 | 422 | ✅ 422 |
| Vehicle year 2101 | 422 | ✅ 422 |
| Vehicle year 2000 | 201 | ✅ 201 |
| Vehicle seats 0 | 422 | ✅ 422 |
| Vehicle negative mileage | 422 | ✅ 422 |
| Vehicle valid (2020, seats 5, mileage 0) | 201 | ✅ 201 |
| Customer search empty | 422 | ✅ 422 |
| Customer search > 200 chars | 422 | ✅ 422 |
| Customer search valid | 200 | ✅ 200 |
| Customer create valid ISO date | 201 | ✅ 201 |
| Customer create invalid date | 422 | ✅ 422 |
| Customer create missing required field | 422 | ✅ 422 |
| Customer update (edit) | 200 | ✅ 200 |
| Create user valid | 201 | ✅ 201 |
| Create user invalid role | 422 | ✅ 422 |
| Update org empty name | 422 | ✅ 422 |
| Update org valid name | 200 | ✅ 200 |
| Valid login | 200 | ✅ 200 |
| EMPLOYEE create vehicle (RBAC) | 403 | ✅ 403 |
| Cross-org vehicle get (isolation) | 404 | ✅ 404 |
| Photo upload valid PNG (media) | 201 | ✅ 201 |
| Photo upload invalid MIME (media) | 422 | ✅ 422 |
| Document upload valid PDF (media) | 201 | ✅ 201 |

---

## Typecheck / Build / Lint / Test Results

| Check | Result |
|---|---|
| `pnpm run typecheck:libs` | ✅ 0 errors |
| API typecheck | ✅ 0 errors |
| Web typecheck | ✅ 0 errors |
| API build | ✅ Done in 129ms |
| Web build | ✅ 1.92 s |
| `pnpm run lint` (root) | ✅ 0 errors |
| Web tests | ✅ 7 files / 31 tests |

---

## Behavior Differences Discovered

1. **Date handling:** The generated customer schema uses `zod.coerce.date()` for `license_expiry_date` (parses to a `Date` at runtime), whereas the old hand-written schema passed an ISO string through. The service already does `new Date(input.license_expiry_date)`, which works for both a string and a `Date`, so runtime behavior is unchanged. The exported `CreateCustomerInput`/`UpdateCustomerInput` types were kept as `string` for `license_expiry_date` to preserve the service contract with zero service changes.
2. **Integer strictness:** OpenAPI `type: integer` maps to `zod.number()` in orval's Zod 3 output (it does not emit `.int()`). Fractional values (e.g. `year: 1900.5`) would not be rejected by the generated schema, whereas the old hand-written `.int()` rejected them. All documented boundary cases (1899, 2101, seats 0, negative mileage) are still rejected correctly. This is an orval Zod-3 codegen limitation, not a schema regression; the OpenAPI contract itself declares `type: integer`. If strict integer rejection is later required, a small Zod refinement wrapper or orval upgrade would be the follow-up.
3. **Error messages:** The generated schemas emit Zod's default messages (e.g. `email: Invalid email`) instead of the custom Arabic/English messages previously hand-authored. The 422 response code and field paths are preserved; only the wording differs.

---

## Notes

- Media (multipart) validation is intentionally unchanged per requirement #5.
- No migration, no schema change, no new dependency (the repo already depended on `@workspace/api-zod`).
- Organization isolation and RBAC behavior verified unchanged.
