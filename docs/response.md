# Step 7.1 — Customer Model: Complete

---

## Files Created

| File | Purpose |
|---|---|
| `lib/db/prisma/migrations/20260812054816_add_customer_model/migration.sql` | Migration creating the Customer table |

## Files Modified

| File | Change |
|---|---|
| `lib/db/prisma/schema.prisma` | Added `Customer` model; added `customers Customer[]` relation to `Organization` |

---

## Database Design Summary

### Customer Model

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `UUID` | `@id`, `@default(uuid())` | Primary key |
| `organization_id` | `UUID` | FK → `Organization.id`, RESTRICT | Tenant isolation |
| `first_name` | `String` | Required, indexed | Identity (name part 1) |
| `last_name` | `String` | Required, indexed | Identity (name part 2) |
| `phone` | `String` | Required, indexed | Primary contact |
| `address` | `String` | Required | Contact address |
| `national_id` | `String` | Required, unique with org_id, indexed | National identification |
| `license_number` | `String` | Required, unique with org_id, indexed | Driver's license |
| `license_expiry_date` | `DateTime` | Required | Driver's license expiry |
| `created_at` | `DateTime` | `@default(now())` | Audit |
| `updated_at` | `DateTime` | `@updatedAt` | Audit |
| `deleted_at` | `DateTime?` | Nullable, indexed | Soft delete ("archive") |

### Relationships

- Belongs to one `Organization` (`organization Organization @relation(...)`)
- Organization has many `Customer` (`customers Customer[]`)

### Unique Constraints

- `@@unique([organization_id, national_id])` — national ID is unique per organization
- `@@unique([organization_id, license_number])` — license number is unique per organization

### Indexes

- `@@index([organization_id])` — FK index
- `@@index([deleted_at])` — soft delete filter
- `@@index([first_name])` — search
- `@@index([last_name])` — search
- `@@index([phone])` — search
- `@@index([national_id])` — search
- `@@index([license_number])` — search

### onDelete

- `organization_id` → `Organization.id` on delete RESTRICT

### Soft Delete

- `deleted_at` — used to archive inactive customers; excluded from active lists/searches

---

## Documentation Traceability

Every field, constraint, index, and architectural decision is traceable to `docs/architecture/11-domain-model-specification.md`, Customer section.

| Item | Spec Reference |
|---|---|
| `id` | Fields table (row 1) |
| `organization_id` | Fields table (row 2), Relationships, Foreign Keys |
| `first_name` | Fields table (row 3), Validation Rules |
| `last_name` | Fields table (row 4), Validation Rules |
| `phone` | Fields table (row 5), Validation Rules |
| `address` | Fields table (row 6), Validation Rules |
| `national_id` | Fields table (row 7), Unique Constraints (`@@unique([organization_id, national_id])`) |
| `license_number` | Fields table (row 8), Unique Constraints (`@@unique([organization_id, license_number])`) |
| `license_expiry_date` | Fields table (row 9) |
| `created_at` / `updated_at` | Shared Conventions (Audit Fields) |
| `deleted_at` | Fields table (row 10), Soft Delete Strategy |
| `@@unique([organization_id, national_id])` | Unique Constraints (item 1) |
| `@@unique([organization_id, license_number])` | Unique Constraints (item 2) |
| `@@index([organization_id])` | Indexes (item 1) |
| `@@index([deleted_at])` | Indexes (item 2) |
| `@@index([first_name])` | Indexes (item 3) |
| `@@index([last_name])` | Indexes (item 4) |
| `@@index([phone])` | Indexes (item 5) |
| `@@index([national_id])` | Indexes (item 6) |
| `@@index([license_number])` | Indexes (item 7) |
| onDelete RESTRICT | onDelete Behavior |

---

## Migration Summary

The migration creates the `Customer` table with:
- 12 columns (id, organization_id, first_name, last_name, phone, address, national_id, license_number, license_expiry_date, created_at, updated_at, deleted_at)
- 7 non-unique indexes (organization_id, deleted_at, first_name, last_name, phone, national_id, license_number)
- 2 composite unique indexes (organization_id + national_id, organization_id + license_number)
- 1 foreign key (organization_id → Organization.id, RESTRICT on delete)
- No existing tables or data are modified.

---

## Acceptance Criteria Checklist

| Criterion | Status | Verification |
|---|---|---|
| Model matches architecture | **PASS** | All 12 fields, 2 unique constraints, 7 indexes, 1 FK match `11-domain-model-specification.md` Customer section exactly |
| Migration succeeds | **PASS** | `pnpm db:migrate --name add_customer_model` — applied without errors |
| Organization isolation present | **PASS** | `organization_id` FK + `@@index([organization_id])`, plus org-scoped unique constraints |
| All constraints verified | **PASS** | 2 composite unique, RESTRICT on FK, non-null on 9 required fields |
| All indexes verified | **PASS** | 7 non-unique indexes, 2 unique indexes (all visible in migration SQL and schema) |
| Prisma Client generates | **PASS** | `pnpm db:generate` — generated in 97ms, no errors |
| TypeScript passes | **PASS** | `pnpm run typecheck` — 0 errors |
| Build passes | **PASS** | `pnpm run build` — 164ms, no errors |
| Lint passes | **PASS** | `pnpm run lint` — 0 errors |

---

## Manual Verification Commands

```bash
# Verify migration status (no pending migrations)
cd lib/db && pnpm db:migrate
# Expected: "Already in sync, no schema change or pending migration was found."

# Verify Prisma Client generation
cd lib/db && pnpm db:generate
# Expected: "Generated Prisma Client"

# Verify backend still builds
cd apps/api && pnpm run typecheck && pnpm run build && pnpm run lint

# Inspect the Customer table structure
cd lib/db && pnpm db:studio
# Navigate to Customer model to verify columns, indexes, and constraints

# Verify migration SQL created correctly
cat lib/db/prisma/migrations/20260812054816_add_customer_model/migration.sql
```
