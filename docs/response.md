# Customer Specification — Applied Approved Decisions

---

## Summary

Updated only the Customer section of `docs/architecture/11-domain-model-specification.md` to apply the three approved required-field decisions and the revised duplicate prevention strategy. No other model was modified.

---

## Files Modified

| File | Change |
|---|---|
| `docs/architecture/11-domain-model-specification.md` | Customer section updated (national_id/license_number/license_expiry_date required; duplicate prevention replaced) |
| `docs/response.md` | Replaced with this report |

---

## Changes Applied

### 1. `national_id` made required

| Section | Before | After |
|---|---|---|
| Fields table | `❌ \| null` | `✅ \| —` |
| Constraints | not mentioned | `national_id` must be non-empty |
| Validation rules | optional | required, non-empty |

### 2. `license_number` made required

| Section | Before | After |
|---|---|---|
| Fields table | `❌ \| null` | `✅ \| —` |
| Constraints | not mentioned | `license_number` must be non-empty |
| Validation rules | optional | required, non-empty |
| Indexes | — | added `@@index([license_number])` |

### 3. `license_expiry_date` made required

| Section | Before | After |
|---|---|---|
| Fields table | `DateTime? \| ❌ \| null` | `DateTime \| ✅ \| —` |
| Constraints | "when present, must be a valid date" | "must be a valid date" |
| Validation rules | "when present" | required, must be a valid date |

### 4. Duplicate prevention strategy replaced

**Removed:** `@@unique([organization_id, first_name, last_name, phone])`

**Added:**
- `@@unique([organization_id, national_id])` — national ID unique within an organization
- `@@unique([organization_id, license_number])` — license number unique within an organization

Updated sections:
- **Unique Constraints** — replaced composite rule with the two new rules
- **Indexes** — noted the implicit composite indexes created by the new unique constraints; added `@@index([license_number])`
- **Business Rules** — duplicate prevention wording updated
- **Constraints** — non-empty constraint list updated
- **Validation Rules** — required-field rules updated
- **API Notes** — response example already contains all fields (no field name changes required)

---

## Final Customer Fields

| Field | Column | Type | Required | Default |
|---|---|---|---|---|
| id | id | UUID | ✅ | uuid() |
| organization_id | organization_id | UUID | ✅ | — |
| first_name | first_name | String | ✅ | — |
| last_name | last_name | String | ✅ | — |
| phone | phone | String | ✅ | — |
| address | address | String | ✅ | — |
| national_id | national_id | String | ✅ | — |
| license_number | license_number | String | ✅ | — |
| license_expiry_date | license_expiry_date | DateTime | ✅ | — |
| created_at | created_at | DateTime | ✅ | now() |
| updated_at | updated_at | DateTime | ✅ | @updatedAt |
| deleted_at | deleted_at | DateTime? | ❌ | null |

---

## Consistency Verification

| Section | Status |
|---|---|
| Fields table — 3 fields required | ✅ |
| Constraints — non-empty strings + valid date | ✅ |
| Unique Constraints — two org-scoped unique rules | ✅ |
| Indexes — license_number index + implicit unique indexes noted | ✅ |
| Business Rules — duplicate prevention wording updated | ✅ |
| Validation Rules — 3 fields required | ✅ |
| API Notes — consistent | ✅ |
| No other model modified | ✅ |
| No unrelated architecture decision changed | ✅ |
