# Step 7.2 — Final Implementation Review

---

## 1. PATCH Semantics: Full-Resource Update

**Verdict: ✅ Correct — no correction required.**

### Execution path

```
PATCH /api/customers/:id
  → validateBody(updateCustomerSchema)
      → requires all 7 fields (first_name, last_name, phone, address,
        national_id, license_number, license_expiry_date)
  → controller.update
  → service.updateCustomer → passes all 7 fields to repo.update
  → repo.update → prisma.customer.update({ where: { id }, data: { all 7 fields } })
```

### Analysis

- `06-api-design.md` (HTTP Methods) documents `PATCH | Update existing resources` but does **not** specify partial vs full update semantics.
- The existing codebase treats PATCH as a full update of the updateable fields:
  - **Organization**: `updateOrganizationSchema` requires `name` (full update)
  - **User**: `updateUserSchema` requires `role` (full update)
- The Customer module follows the same convention: all 7 updateable fields are required.
- The `UpdateCustomerInput` type in `customer.types.ts` and the service both pass all fields through.

This is consistent with the existing codebase pattern. If partial updates are desired in the future, the schema could be changed to `.partial()`, but that would be a new decision, not a correction of a bug.

---

## 2. Duplicate Detection Scope

**Verdict: ✅ Correct — duplicate detection only fires on actual unique-constraint violations.**

### Execution path

```
createCustomer / updateCustomer (service)
  → try { repo.create(...) / repo.update(...) }
  → catch (err)
      → if (isUniqueConstraintError(err))  // PrismaClientKnownRequestError, code === "P2002"
          → throw AppError(409, "DUPLICATE_CUSTOMER", ...)
      → throw err  // all other errors re-thrown unchanged
```

### Analysis

- `isUniqueConstraintError` checks `error instanceof PrismaClientKnownRequestError && error.code === "P2002"`.
- P2002 is specifically "Unique constraint failed on the fields" — it fires only when a unique constraint is actually violated.
- The Customer model has exactly two unique constraints:
  - `@@unique([organization_id, national_id])`
  - `@@unique([organization_id, license_number])`
- An **update that keeps a customer's own values** does NOT fire P2002 (updating a row to its own current values does not collide with another row).
- Only a genuine collision with a **different** customer's `national_id` or `license_number` within the same org triggers P2002 → 409.
- **Unrelated errors** (connection failures, DB errors, validation) are re-thrown as-is — they are never converted to a 409.

Verified at runtime: duplicate national_id in same org → `409 DUPLICATE_CUSTOMER`. No false positives.

---

## 3. `license_expiry_date` Flow

**Verdict: ⚠️ One real issue found and corrected — date validity was not enforced.**

### Full execution path

| Stage | Code | Input Type | Notes |
|---|---|---|---|
| **Validation** | `customer.validation.ts` — `license_expiry_date: z.string().min(1, ...)` | `string` | **Before fix:** only checked non-empty. **After fix:** `refine((v) => !isNaN(new Date(v).getTime()))` rejects invalid dates |
| **Service conversion** | `customer.service.ts:60,93` — `new Date(input.license_expiry_date)` | `string → Date` | Converts ISO string to Date |
| **Repository input** | `customer.repository.ts:24,41` — `license_expiry_date: Date` | `Date` | Typed as `Date` |
| **Prisma write** | `prisma.customer.create/update({ data: { license_expiry_date } })` | `Date → timestamp` | Prisma maps Date to PostgreSQL TIMESTAMP(3) |

### Issue found

Before the fix, the validation `z.string().min(1)` accepted any non-empty string (e.g., `"not-a-date"`). Then `new Date("not-a-date")` produced `Invalid Date`, which would fail at the Prisma write or store an invalid timestamp. This violated the documented validation rule:

> `11-domain-model-specification.md` (Customer, Validation Rules): "`license_expiry_date` is required, must be a valid date."

### Fix applied

Added a shared `validDate` refine to both create and update schemas:

```ts
const validDate = z.string().refine(
  (value) => !isNaN(new Date(value).getTime()),
  { message: "License expiry date must be a valid date" },
);
```

### Post-fix runtime verification

| Test | Input | Result |
|---|---|---|
| Invalid date | `"not-a-date"` | **422** `VALIDATION_ERROR: license_expiry_date: License expiry date must be a valid date` |
| Valid date | `"2028-12-31T00:00:00.000Z"` | **201** created, expiry stored correctly |
| Duplicate detection | same `national_id` | **409** `DUPLICATE_CUSTOMER` (unchanged) |

---

## Summary of Findings

| Item | Status |
|---|---|
| 1. PATCH full-resource update | ✅ Consistent with codebase pattern; no correction required |
| 2. Duplicate detection scope | ✅ Only P2002 → 409; unrelated errors re-thrown |
| 3. license_expiry_date flow | ⚠️ Issue found (invalid dates accepted) and **corrected** with `validDate` refine |

## Files Modified (review fix)

| File | Change |
|---|---|
| `apps/api/src/modules/customers/customer.validation.ts` | Added `validDate` refine to enforce valid date format on create and update |

## Verification After Fix

| Check | Result |
|---|---|
| Typecheck | ✅ 0 errors |
| Build | ✅ 106ms |
| Lint | ✅ 0 errors |
| Invalid date → 422 | ✅ |
| Valid date → 201 | ✅ |
| Duplicate → 409 | ✅ |
