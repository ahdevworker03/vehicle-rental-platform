# Domain Model Specification

## Purpose

This document is the authoritative implementation specification for every business entity in the Vehicle Rental Management Platform.

It defines the database-level implementation of each entity from the domain model, consistent with the Database Design and Backend architecture. It does not change any existing architecture decisions — it fills in implementation details required for the Prisma schema, migrations, repositories, services, validations, APIs, and tests.

Where a decision cannot be derived from the existing architecture or product documentation, it is explicitly marked as **Requires Architectural Approval** and must not be implemented until approved.

The source of truth for concepts and relationships is `docs/product/04-domain-model.md`. The source of truth for database principles is `docs/architecture/05-database-design.md`. The source of truth for business requirements is `docs/product/02-business-requirements.md`. The source of truth for API conventions is `docs/architecture/06-api-design.md`.

---

# Shared Conventions

These conventions apply to every model unless explicitly overridden.

## Primary Key

- Field: `id`
- Column: `id`
- Type: `UUID`
- Default: generated UUID (`@default(uuid())`)
- Prisma: `@id @default(uuid()) @db.Uuid`

Rationale: documented in `05-database-design.md` "Primary Keys" — global uniqueness, offline record creation, safe synchronization.

## Audit Fields

- `created_at`: `DateTime`, `@default(now())`
- `updated_at`: `DateTime`, `@updatedAt`

Rationale: documented in `05-database-design.md` "Audit Fields".

## Soft Delete

- `deleted_at`: `DateTime?`, nullable

Rationale: documented in `05-database-design.md` "Soft Deletes". Business records use soft deletion for historical reporting, audit, recovery, and traceability.

## Multi-Tenancy

Every business record belongs to exactly one organization.

- Field: `organization_id`
- Column: `organization_id`
- Type: `UUID` (`@db.Uuid`)
- FK: → `Organization.id`
- Index: `@@index([organization_id])`
- onDelete: RESTRICT

Rationale: documented in `05-database-design.md` "Multi-Tenant Strategy" and `10-authentication-policy.md` "Organization Isolation".

## Naming Conventions

- Table names: singular, lowercase, snake_case
- Column names: lowercase snake_case
- Foreign keys: `<entity>_id`
- Enum values: UPPER_SNAKE_CASE
- Abbreviations avoided

Rationale: documented in `05-database-design.md` "Naming Conventions".

## Indexes

- Every foreign key is indexed.
- `deleted_at` is indexed on every soft-deletable table.
- Additional indexes are added for frequently searched/filtered fields.

Rationale: documented in `05-database-design.md` "Indexing Strategy".

## Indexing Rule

Any model that belongs to an organization and is frequently queried by searchable fields should prefer composite indexes beginning with organization_id over global indexes whenever queries are expected to be organization-scoped.

## onDelete Behavior

- Business records reference each other with `ON DELETE RESTRICT` (default).
- Infrastructure records (e.g., refresh tokens) may use `ON DELETE CASCADE`.
- Any deviation must be explicitly justified in the model's notes.

## API Conventions

- Resources use plural lowercase names (e.g., `/api/customers`).
- Success: `{ "data": ... }`.
- Error: `{ "error": { "code": "...", "message": "..." } }`.
- HTTP status codes follow `06-api-design.md`.

---

# Shared Enums

Enum values are defined in UPPER_SNAKE_CASE and map to the Prisma enum definition.

## UserRole

| Value      | Purpose                         | Status                                                  |
| ---------- | ------------------------------- | ------------------------------------------------------- |
| `OWNER`    | Organization owner, full access | Implemented (approved in `10-authentication-policy.md`) |
| `MANAGER`  | Management access               | Implemented (defined in Prisma schema)                  |
| `EMPLOYEE` | Employee access                 | Implemented (defined in Prisma schema)                  |

Notes: The `User.role` field defaults to `OWNER`. Permissions per role for specific modules are not fully documented — see model notes.

## VehicleStatus

**Source:** `02-business-requirements.md` §5 lists: Available, Reserved, Rented, Under Maintenance, Out of Service, Archived.

| Value            | Status                                                 |
| ---------------- | ------------------------------------------------------ |
| `AVAILABLE`      | Documented (business requirement)                      |
| `RESERVED`       | Documented (business requirement)                      |
| `RENTED`         | Documented (business requirement)                      |
| `MAINTENANCE`    | Documented (business requirement: "Under Maintenance") |
| `OUT_OF_SERVICE` | Documented (business requirement)                      |
| `ARCHIVED`       | Documented (business requirement)                      |

Notes: Default value is `AVAILABLE`. Availability is derived from `status` and active rental records, not stored as a separate field. The domain lifecycle uses "Available → Reserved → Rented → Maintenance".

## Transmission

**Source:** approved architecture decision for Vehicle model.

| Value | Status |
|---|---|
| `MANUAL` | Approved |
| `AUTOMATIC` | Approved |

## FuelType

**Source:** approved architecture decision for Vehicle model.

| Value | Status |
|---|---|
| `PETROL` | Approved |
| `DIESEL` | Approved |
| `ELECTRIC` | Approved |
| `HYBRID` | Approved |

## DocumentCategory

**Source:** approved architecture decision for Media (Documents & Photos).

| Value | Status |
|---|---|
| `REGISTRATION` | Approved |
| `INSURANCE` | Approved |
| `OTHER` | Approved |

## RentalStatus

**Source:** `04-domain-model.md` lists rental responsibilities but no status enum.

| Value          | Status                              |
| -------------- | ----------------------------------- |
| (undetermined) | **Requires Architectural Approval** |

Notes: Rental status values (e.g., active, returned, extended, cancelled) are not documented.

## PaymentStatus

**Source:** not applicable.

No `PaymentStatus` enum exists. A recorded payment is a completed payment; there is no status field on the Payment model (approved architecture decision, Milestone 4, Phase 16, Step 16.1). Reversals are handled by soft deletion.

## PaymentMethod

**Source:** approved architecture decision (Milestone 4, Phase 16, Step 16.1).

| Value      | Purpose                                 | Status   |
| ---------- | --------------------------------------- | -------- |
| `CASH`     | Cash payment                           | Approved |
| `CARD`     | Card payment                           | Approved |
| `TRANSFER` | Bank transfer                          | Approved |
| `OTHER`    | Unlisted payment methods               | Approved |

## ExpenseCategory

**Source:** approved architecture decision (Milestone 4, Phase 15, Step 15.1).

| Value         | Purpose                                                  | Status   |
| ------------- | -------------------------------------------------------- | -------- |
| `FUEL`        | Fuel for a vehicle or fleet                              | Approved |
| `INSURANCE`   | Insurance premiums                                       | Approved |
| `REGISTRATION`| Registration fees                                        | Approved |
| `CLEANING`    | Vehicle / facility cleaning costs                        | Approved |
| `OTHER`       | Unclassified operational costs                           | Approved |

Notes:

- `MAINTENANCE` is **not** an `ExpenseCategory`. Maintenance costs are represented by `Maintenance.cost`, the single authoritative maintenance cost, to prevent financial double-counting with the Expenses module (Phase 15 boundary).

## MaintenanceType

**Source:** approved architecture decision (Milestone 4, Phase 14, Step 14.1).

| Value              | Purpose                                                            | Status     |
| ------------------ | ------------------------------------------------------------------ | ---------- |
| `PREVENTIVE_SERVICE` | Scheduled servicing, including oil changes and general preventive work | Approved |
| `INSPECTION`         | Mechanical inspection                                              | Approved |
| `REPAIR`             | Corrective repair of a fault                                       | Approved |
| `OTHER`              | Fallback for unlisted maintenance work                             | Approved |

Notes:

- `OIL_CHANGE` is **not** a top-level `MaintenanceType`. Oil changes are represented by `PREVENTIVE_SERVICE`.
- `INSURANCE` and `REGISTRATION` are **not** `MaintenanceType` values. They belong to the Documents / Tasks semantics:
  - insurance and registration documents remain represented by the existing `Document` model;
  - insurance/registration renewals and reminders belong to operational `Task` records.

## MaintenanceStatus

**Source:** approved architecture decision (Milestone 4, Phase 14, Step 14.1).

| Value        | Purpose                                    | Status   | Default    |
| ------------ | ------------------------------------------ | -------- | ---------- |
| `SCHEDULED`  | Maintenance is planned for a due date      | Approved | ✅ `SCHEDULED` |
| `IN_PROGRESS`| Work has started                           | Approved |            |
| `COMPLETED`  | Work has finished                          | Approved |            |

Notes:

- `UPCOMING` and `OVERDUE` are **not** persisted statuses. They are derived presentation/query states computed from `maintenance_date` and the current date for non-completed records.
- `CANCELLED` is **not** a status. A maintenance record that is no longer needed uses the established soft-delete mechanism (`deleted_at`).

## TaskStatus

**Source:** `04-domain-model.md` mentions "completion status" but no enum. Approved architecture decision (Milestone 4, Phase 17, Step 17.1).

| Value       | Purpose                                                      | Status   | Default  |
| ----------- | ------------------------------------------------------------ | -------- | -------- |
| `PENDING`   | Task is created and not yet finished                         | Approved | ✅ `PENDING` |
| `COMPLETED` | Task is finished and removed from active reminders           | Approved |          |

Notes:

- `UPCOMING` and `OVERDUE` are **not** persisted statuses. They are derived presentation/query states computed from `due_date` and the current date for non-completed records, mirroring the `MaintenanceStatus` `UPCOMING`/`OVERDUE` convention.
- `CANCELLED` is **not** a status. A task that is no longer needed uses the established soft-delete mechanism (`deleted_at`).
- `TaskStatus` deliberately does **not** include `IN_PROGRESS`. Unlike maintenance (which has a documented scheduled → in-progress → completed workflow), no Task flow documents a started state; the product defines only create → complete. `MaintenanceStatus` cannot simply be copied because it models a multi-stage workshop process with a middle state, whereas Task models a binary completion lifecycle.
- Recurring tasks are **deferred** (see the Task model notes): the recurrence representation requires architectural approval and is not implemented in Milestone 4.

## NotificationType

**Source:** `04-domain-model.md` lists examples: rental due today, maintenance due, insurance expiration, registration expiration, task reminder.

| Value          | Status                              |
| -------------- | ----------------------------------- |
| (undetermined) | **Requires Architectural Approval** |

---

# Implemented Models

## Organization

### Purpose

Represents a business using the platform. Each organization owns its own data and operates independently.

### Relationships

- Has many `User` (`users User[]`)
- Has many `Customer`
- Has many `Vehicle`
- Has many `Rental`
- Has many `Payment`
- Has many `Expense`
- Has many `Maintenance` (`maintenance Maintenance[]`)
- Has many `Task`

### Fields

| Field      | Column     | Type      | Required | Default    | Notes         |
| ---------- | ---------- | --------- | -------- | ---------- | ------------- |
| id         | id         | UUID      | ✅       | uuid()     | PK            |
| name       | name       | String    | ✅       | —          | Business name |
| created_at | created_at | DateTime  | ✅       | now()      | Audit         |
| updated_at | updated_at | DateTime  | ✅       | @updatedAt | Audit         |
| deleted_at | deleted_at | DateTime? | ❌       | null       | Soft delete   |

### Constraints

- None beyond PK.

### Unique Constraints

- None. Multiple organizations may share a `name`.

### Indexes

- `@@index([deleted_at])`

### Foreign Keys

- None (root entity).

### onDelete Behavior

- N/A (root entity).

### Soft Delete Strategy

- `deleted_at` timestamp. Archived organizations are excluded from queries.

### Business Rules

- Every other business record belongs to exactly one organization.

### Validation Rules

- `name` is required, non-empty.
- `name` length **Requires Architectural Approval**.

### API Notes

- `/api/organizations/me` for the current organization.
- GET returns `{ data: { id, name, createdAt, updatedAt } }`.

---

## User

### Purpose

Represents an employee who can access the platform.

### Relationships

- Belongs to one `Organization`
- Has many `RefreshToken`

### Fields

| Field           | Column          | Type      | Required | Default    | Notes                  |
| --------------- | --------------- | --------- | -------- | ---------- | ---------------------- |
| id              | id              | UUID      | ✅       | uuid()     | PK                     |
| email           | email           | String    | ✅       | —          | Login identifier       |
| password_hash   | password_hash   | String    | ✅       | —          | Argon2id hash          |
| role            | role            | UserRole  | ✅       | OWNER      | OWNER/MANAGER/EMPLOYEE |
| organization_id | organization_id | UUID      | ✅       | —          | FK → Organization.id   |
| created_at      | created_at      | DateTime  | ✅       | now()      | Audit                  |
| updated_at      | updated_at      | DateTime  | ✅       | @updatedAt | Audit                  |
| deleted_at      | deleted_at      | DateTime? | ❌       | null       | Soft delete            |

### Constraints

- FK `organization_id` → `Organization.id`.
- `role` must be a valid `UserRole`.

### Unique Constraints

- `email` is globally unique (approved decision, Step 2.2).

### Indexes

- `@@index([organization_id])`
- `@@index([deleted_at])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.

### onDelete Behavior

- Organization deletion is RESTRICTed while users reference it.

### Soft Delete Strategy

- `deleted_at` timestamp. Deleted users cannot log in (verified in `authenticate` middleware).

### Business Rules

- Every user belongs to exactly one organization.
- Deleted users are rejected during authentication.
- Role permissions (approved, Milestone 4 Phases 14–17): list/get for any authenticated user; create/update/delete/complete restricted to `OWNER`. Applies to the User module and all operations modules (Maintenance, Expense, Payment, Task).

### Validation Rules

- `email` must be a valid email format.
- `password` must be at least 8 characters (for creation).
- `role` must be a valid `UserRole`.

### API Notes

- `/api/users` (list, create), `/api/users/:id` (get, patch, delete).
- Create/update/delete restricted to OWNER; list/get for any authenticated user (inferred; see Business Rules).

---

## RefreshToken

### Purpose

Stores a hashed refresh token for session continuation.

### Relationships

- Belongs to one `User`

### Fields

| Field      | Column     | Type     | Required | Default | Notes                         |
| ---------- | ---------- | -------- | -------- | ------- | ----------------------------- |
| id         | id         | UUID     | ✅       | uuid()  | PK                            |
| token      | token      | String   | ✅       | —       | SHA-256 hash of refresh token |
| user_id    | user_id    | UUID     | ✅       | —       | FK → User.id                  |
| expires_at | expires_at | DateTime | ✅       | —       | Expiry time                   |
| created_at | created_at | DateTime | ✅       | now()   | Audit                         |

### Constraints

- FK `user_id` → `User.id`.

### Unique Constraints

- `token` is unique.

### Indexes

- `@@index([user_id])`
- `@@index([expires_at])`

### Foreign Keys

- `user_id` → `User.id`, onDelete CASCADE.

### onDelete Behavior

- CASCADE — tokens deleted when the user is deleted.

### Soft Delete Strategy

- None. Tokens are deleted on use or expiry (`10-authentication-policy.md`).

### Business Rules

- Only the SHA-256 hash is stored; the raw token is returned to the client once.
- Rotation invalidates the previous token.

### Validation Rules

- `refreshToken` is required and non-empty.

### API Notes

- `/api/auth/refresh` and `/api/auth/logout`.

---

# Planned Models

## Customer

### Purpose

Represents a person renting a vehicle.

### Relationships

- Belongs to one `Organization`
- Can have many `Rental` (`rentals Rental[]`)
- Can have many `Document` (`documents Document[]`)

### Fields

| Field               | Column              | Type      | Required | Default    | Notes                                      |
| ------------------- | ------------------- | --------- | -------- | ---------- | ------------------------------------------ |
| id                  | id                  | UUID      | ✅       | uuid()     | PK                                         |
| organization_id     | organization_id     | UUID      | ✅       | —          | FK → Organization.id                       |
| first_name          | first_name          | String    | ✅       | —          | Identity (name part 1)                     |
| last_name           | last_name           | String    | ✅       | —          | Identity (name part 2)                     |
| phone               | phone               | String    | ✅       | —          | Primary contact                            |
| address             | address             | String    | ✅       | —          | Contact address                            |
| national_id         | national_id         | String    | ✅       | —          | National identification                    |
| license_number      | license_number      | String    | ✅       | —          | Driver's license                           |
| license_expiry_date | license_expiry_date | DateTime  | ✅       | —          | Driver's license expiry                    |
| created_at          | created_at          | DateTime  | ✅       | now()      | Audit                                      |
| updated_at          | updated_at          | DateTime  | ✅       | @updatedAt | Audit                                      |
| deleted_at          | deleted_at          | DateTime? | ❌       | null       | Soft delete ("archive inactive customers") |

### Constraints

- FK `organization_id` → `Organization.id`.
- `phone`, `address`, `national_id`, and `license_number` must be non-empty strings.
- `license_expiry_date` must be a valid date.

### Unique Constraints

- `@@unique([organization_id, national_id])` — a national ID is unique within an organization.
- `@@unique([organization_id, license_number])` — a driver's license number is unique within an organization.

These enforce "prevent duplicate customer records" (`02-business-requirements.md` §4) within an organization.

### Indexes

- `@@index([organization_id])`
- `@@index([deleted_at])`
- `@@index([first_name])`
- `@@index([last_name])`
- `@@index([phone])`
- `@@index([national_id])`
- `@@index([license_number])`

The unique constraints `@@unique([organization_id, national_id])` and `@@unique([organization_id, license_number])` create implicit composite indexes for duplicate-prevention lookups.

Search indexes support `02-business-requirements.md` §4 "Search customers quickly" (search by name, phone, national ID, license).

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT (business record). A customer referenced by a rental cannot be deleted while the rental exists.

### Soft Delete Strategy

- `deleted_at` — used to "archive inactive customers" (`02-business-requirements.md` §4). Archived customers are excluded from active lists and search but retained for historical reporting.

### Business Rules

- Customer belongs to exactly one organization (`04-domain-model.md`).
- Rental history is derived from `Rental` relations, not stored fields.
- A customer cannot be duplicated within the same organization. A customer's national ID and driver's license number are each unique within the organization.
- Archived customers cannot participate in new rentals.

### Validation Rules

- `first_name` and `last_name` are required, non-empty.
- `phone` is required, non-empty.
- `address` is required, non-empty.
- `national_id` is required, non-empty.
- `license_number` is required, non-empty.
- `license_expiry_date` is required, must be a valid date.

### API Notes

- Planned: `/api/customers` (list, create, get, patch, delete) + `/api/customers?search=...` for customer search.
- List/get accessible to any authenticated user in the organization; create/update/delete restricted to OWNER (consistent with User module RBAC).
- Response: `{ data: { id, firstName, lastName, phone, address, nationalId, licenseNumber, licenseExpiryDate, createdAt, updatedAt } }`.
- Soft-deleted (archived) customers return 404 on direct GET and are excluded from list/search.

---

## Vehicle

### Purpose

Represents a business vehicle managed by the platform. The central entity.

### Relationships

- Belongs to one `Organization`
- Can have many `Rental`
- Can have many `Maintenance` records
- Can have many `Expense`
- Can have many `Document`
- Can have many `Photo`

### Fields

| Field | Column | Type | Required | Default | Notes |
|---|---|---|---|---|---|
| id | id | UUID | ✅ | uuid() | PK |
| organization_id | organization_id | UUID | ✅ | — | FK → Organization.id |
| make | make | String | ✅ | — | Manufacturer (e.g., Toyota) |
| model | model | String | ✅ | — | Model name (e.g., Corolla) |
| plate_number | plate_number | String | ✅ | — | License plate, unique within org |
| year | year | Int | ✅ | — | Model year |
| color | color | String | ✅ | — | Exterior color |
| vin | vin | String | ❌ | null | Vehicle Identification Number (optional) |
| engine_number | engine_number | String | ❌ | null | Engine serial (optional) |
| transmission | transmission | Transmission | ✅ | — | MANUAL / AUTOMATIC |
| fuel_type | fuel_type | FuelType | ✅ | — | PETROL / DIESEL / ELECTRIC / HYBRID |
| seats | seats | Int | ✅ | — | Number of seats |
| current_mileage | current_mileage | Int | ✅ | 0 | Odometer reading in kilometers |
| status | status | VehicleStatus | ✅ | AVAILABLE | Current status |
| created_at | created_at | DateTime | ✅ | now() | Audit |
| updated_at | updated_at | DateTime | ✅ | @updatedAt | Audit |
| deleted_at | deleted_at | DateTime? | ❌ | null | Soft delete ("archive retired vehicles") |

### Constraints

- FK `organization_id` → `Organization.id`.
- `status` must be a valid `VehicleStatus`.
- `transmission` must be a valid `Transmission`.
- `fuel_type` must be a valid `FuelType`.
- `current_mileage` default is `0`.

### Unique Constraints

- `@@unique([organization_id, plate_number])` — a plate number is unique within an organization.

### Indexes

- `@@index([organization_id])`
- `@@index([deleted_at])`
- `@@index([status])`
- `@@index([make])`
- `@@index([model])`
- `@@index([plate_number])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT (business record). A vehicle referenced by a rental or maintenance record cannot be deleted.

### Soft Delete Strategy

- `deleted_at` — used to "archive retired vehicles" (`02-business-requirements.md` §5). Archived vehicles are excluded from active lists and search but retained for historical reporting.

### Business Rules

- A vehicle cannot have more than one active rental at the same time (`04-domain-model.md`).
- Archived vehicles cannot participate in new rentals.
- Lifecycle: Acquired → Available → Reserved → Rented → Maintenance → Available → Archived.
- Availability is derived from `status` and active rental records, not stored as a separate field.
- Mileage is measured in kilometers throughout the platform. No separate mileage unit field exists.

### Validation Rules

- `make` is required, non-empty.
- `model` is required, non-empty.
- `plate_number` is required, non-empty.
- `year` is required, must be a valid vehicle year.
- `color` is required, non-empty.
- `vin` is optional, but when provided must be non-empty.
- `engine_number` is optional, but when provided must be non-empty.
- `transmission` is required, must be a valid `Transmission` value.
- `fuel_type` is required, must be a valid `FuelType` value.
- `seats` is required, must be a positive integer.
- `current_mileage` is required, must be a non-negative integer.

### API Notes

- Planned: `/api/vehicles` (list, create, get, patch, delete) + `/api/vehicles?search=...` for vehicle search.
- List/get accessible to any authenticated user in the organization; create/update/delete restricted to OWNER (consistent with User module RBAC).
- Response: `{ data: { id, make, model, plateNumber, year, color, vin, engineNumber, transmission, fuelType, seats, currentMileage, status, createdAt, updatedAt } }`.
- Soft-deleted (archived) vehicles return 404 on direct GET and are excluded from list/search.

---

## Rental

### Purpose

Represents an agreement between a customer and the business for using a vehicle.

### Relationships

- Belongs to one `Customer`
- Belongs to one `Vehicle`
- Belongs to one `Organization`
- Has one `Contract`
- Can have many `Payment`

### Fields

| Field                | Column          | Type         | Required | Default    | Notes                               |
| -------------------- | --------------- | ------------ | -------- | ---------- | ----------------------------------- |
| id                   | id              | UUID         | ✅       | uuid()     | PK                                  |
| organization_id      | organization_id | UUID         | ✅       | —          | FK → Organization.id                |
| customer_id          | customer_id     | UUID         | ✅       | —          | FK → Customer.id                    |
| vehicle_id           | vehicle_id      | UUID         | ✅       | —          | FK → Vehicle.id                     |
| rental period fields | (undetermined)  | —            | —        | —          | **Requires Architectural Approval** |
| pickup/return fields | (undetermined)  | —            | —        | —          | **Requires Architectural Approval** |
| status               | status          | RentalStatus | ✅       | —          | **Requires Architectural Approval** |
| pricing fields       | (undetermined)  | —            | —        | —          | **Requires Architectural Approval** |
| created_at           | created_at      | DateTime     | ✅       | now()      | Audit                               |
| updated_at           | updated_at      | DateTime     | ✅       | @updatedAt | Audit                               |
| deleted_at           | deleted_at      | DateTime?    | ❌       | null       | Soft delete                         |

### Constraints

- FKs: `organization_id`, `customer_id`, `vehicle_id`.

### Unique Constraints

- **Requires Architectural Approval** (may be none).

### Indexes

- `@@index([organization_id])`
- `@@index([customer_id])`
- `@@index([vehicle_id])`
- `@@index([status])`
- `@@index([deleted_at])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `customer_id` → `Customer.id`, onDelete RESTRICT.
- `vehicle_id` → `Vehicle.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT for all references.

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- A vehicle cannot have more than one active rental at the same time.
- Every rental belongs to one customer and one vehicle.
- Archived vehicles cannot be rented.

### Validation Rules

- **Requires Architectural Approval** once fields are defined.

### API Notes

- Planned: `/api/rentals` (create, return, extend, cancel, history).

---

## Contract

### Purpose

The legal agreement for a rental.

### Relationships

- Belongs to one `Rental`

### Fields

| Field          | Column         | Type      | Required | Default    | Notes                               |
| -------------- | -------------- | --------- | -------- | ---------- | ----------------------------------- |
| id             | id             | UUID      | ✅       | uuid()     | PK                                  |
| rental_id      | rental_id      | UUID      | ✅       | —          | FK → Rental.id                      |
| content fields | (undetermined) | —         | —        | —          | **Requires Architectural Approval** |
| created_at     | created_at     | DateTime  | ✅       | now()      | Audit                               |
| updated_at     | updated_at     | DateTime  | ✅       | @updatedAt | Audit                               |
| deleted_at     | deleted_at     | DateTime? | ❌       | null       | Soft delete                         |

### Constraints

- FK `rental_id` → `Rental.id`.

### Unique Constraints

- **Requires Architectural Approval** (one contract per rental).

### Indexes

- `@@index([rental_id])`
- `@@index([deleted_at])`

### Foreign Keys

- `rental_id` → `Rental.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT.

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- Every contract belongs to one rental.

### Validation Rules

- **Requires Architectural Approval** once representation is defined.

### API Notes

- Planned: generation, printable version, PDF export.

---

## Payment

### Purpose

Money received by the rental business for a rental.

Payment records money received from a customer against a specific Rental. It is not an online payment-processing system: no payment gateways, webhooks, checkout flows, or payment-processing concepts are represented. Payment amounts are recorded individually; the outstanding rental balance is derived from the rental total and recorded payments and is never stored on Payment.

### Relationships

- Belongs to one `Rental`
- Belongs to one `Organization`
- An `Organization` can have many `Payment` records (`payments Payment[]`)
- A `Rental` can have many `Payment` records (`payments Payment[]`)

### Fields

| Field           | Column           | Type             | Required | Default    | Notes                                         |
| --------------- | ---------------- | ---------------- | -------- | ---------- | --------------------------------------------- |
| id              | id               | UUID             | ✅       | uuid()     | PK                                            |
| organization_id | organization_id  | UUID             | ✅       | —          | FK → Organization.id                          |
| rental_id       | rental_id        | UUID             | ✅       | —          | FK → Rental.id                                |
| amount          | amount           | Decimal          | ✅       | —          | `@db.Decimal(10, 2)`, strictly greater than zero |
| payment_date    | payment_date     | DateTime         | ✅       | —          | Date/time the payment was received            |
| method          | method           | PaymentMethod    | ✅       | —          | CASH / CARD / TRANSFER / OTHER                |
| created_at      | created_at       | DateTime         | ✅       | now()      | Audit                                         |
| updated_at      | updated_at       | DateTime         | ✅       | @updatedAt | Audit                                         |
| deleted_at      | deleted_at       | DateTime?        | ❌       | null       | Soft delete                                   |

### Constraints

- FKs: `organization_id`, `rental_id`.
- `method` must be a valid `PaymentMethod`.

### Unique Constraints

- None. A Rental may have multiple Payments (partial payments), so there is no unique constraint on `rental_id`.

### Indexes

- `@@index([organization_id])`
- `@@index([rental_id])`
- `@@index([deleted_at])`
- `@@index([payment_date])`

The `payment_date` index supports organization-scoped period-based revenue reporting, following the same standalone-date-index convention used by `Rental` and `Expense`.

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `rental_id` → `Rental.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT (business record).

### Soft Delete Strategy

- `deleted_at`. Deleted payments remain in the database and are excluded from normal queries and balance/revenue derivations in the service layer.

### Business Rules

- Every payment belongs to exactly one rental.
- A Rental can have multiple payments (partial payments supported).
- Outstanding balance is **derived** from `Rental.total_amount` minus recorded payments; it is never stored on Payment.
- `payment_date` is the date the payment was actually received.
- Payment represents money received by the business for a rental — it is not an online payment-processing system. No gateways, webhooks, or payment-processing concepts apply.

### Validation Rules

- `amount` is required, must be `Decimal(10, 2)`, and must be strictly greater than zero.
- `payment_date` is required and must be a valid date.
- `method` is required and must be a valid `PaymentMethod`.
- `rental_id` is required and must reference a Rental in the same organization (enforced by the service layer).

### API Notes

- Planned: record payments, list payments for a rental, partial payments, derived outstanding balances.

---

## Expense

### Purpose

Business costs.

Expense represents business costs paid by the organization. It is financially distinct from Maintenance: `Maintenance.cost` is the authoritative cost of maintenance work, while `Expense` records other business costs. A `MAINTENANCE` expense category is intentionally **not** used, and there is no `maintenance_id` relationship, to prevent financial double-counting (see the Maintenance section and Phase 15 boundary).

### Relationships

- Belongs to one `Organization`
- May belong to one `Vehicle` (optional)
- An `Organization` can have many `Expense` records (`expenses Expense[]`)
- A `Vehicle` can have many `Expense` records (`expenses Expense[]`)

### Fields

| Field            | Column           | Type             | Required | Default    | Notes                                         |
| ---------------- | ---------------- | ---------------- | -------- | ---------- | --------------------------------------------- |
| id               | id               | UUID             | ✅       | uuid()     | PK                                            |
| organization_id  | organization_id  | UUID             | ✅       | —          | FK → Organization.id                          |
| vehicle_id       | vehicle_id       | UUID?            | ❌       | null       | FK → Vehicle.id (optional)                    |
| expense_date     | expense_date     | DateTime         | ✅       | —          | Date the expense was incurred                 |
| amount           | amount           | Decimal          | ✅       | —          | `@db.Decimal(10, 2)`, non-negative            |
| category         | category         | ExpenseCategory  | ✅       | —          | FUEL / INSURANCE / REGISTRATION / CLEANING / OTHER |
| description      | description      | String?          | ❌       | null       | Optional description                          |
| created_at       | created_at       | DateTime         | ✅       | now()      | Audit                                         |
| updated_at       | updated_at       | DateTime         | ✅       | @updatedAt | Audit                                         |
| deleted_at       | deleted_at       | DateTime?        | ❌       | null       | Soft delete                                   |

### Constraints

- FKs: `organization_id`, optional `vehicle_id`.
- `category` must be a valid `ExpenseCategory`.

### Unique Constraints

- None.

### Indexes

- `@@index([organization_id])`
- `@@index([vehicle_id])`
- `@@index([category])`
- `@@index([deleted_at])`
- `@@index([expense_date])`

The `expense_date` index supports organization-scoped date-range expense queries (total expenses and net profit reporting).

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `vehicle_id` → `Vehicle.id`, onDelete RESTRICT (optional relation).

### onDelete Behavior

- RESTRICT (business record).

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- Expenses may optionally be associated with a vehicle.
- An expense is vehicle-specific when the cost is attributable to one vehicle; otherwise it is organization-level.
- When `vehicle_id` is supplied, the vehicle must belong to the same organization (enforced by the service layer; no additional schema constraint is encoded).
- There is no currency field; amounts follow the existing monetary convention (`Decimal(10,2)`), consistent with all other financial records.
- `MAINTENANCE` is **not** an `ExpenseCategory`. Maintenance costs are represented by `Maintenance.cost`, the single authoritative maintenance cost. For reporting, total cost is the sum of `Expense.amount` plus the sum of `Maintenance.cost` for completed maintenance; the model avoids double-counting by construction.

### Validation Rules

- `amount` is required, must be `Decimal(10, 2)`, and must be non-negative.
- `category` is required and must be a valid `ExpenseCategory`.
- `expense_date` is required and must be a valid date.
- `description` is optional; when present, must be a non-empty string.
- `vehicle_id` is optional; when present, the referenced vehicle must belong to the same organization.

### API Notes

- Planned: record expenses, associate with vehicles when applicable.

---

## Maintenance

### Purpose

Work performed on a vehicle.

Maintenance represents maintenance work and the vehicle's maintenance history. It is distinct from operational reminders (Tasks), documents (Documents), and business costs (Expenses, Phase 15).

### Relationships

- Belongs to one `Vehicle`
- Belongs to one `Organization`
- An `Organization` can have many `Maintenance` records (`maintenance Maintenance[]`)
- A `Vehicle` can have many `Maintenance` records (`maintenance Maintenance[]`)

### Fields

| Field            | Column           | Type             | Required | Default    | Notes                                         |
| ---------------- | ---------------- | ---------------- | -------- | ---------- | --------------------------------------------- |
| id               | id               | UUID             | ✅       | uuid()     | PK                                            |
| organization_id  | organization_id  | UUID             | ✅       | —          | FK → Organization.id                          |
| vehicle_id       | vehicle_id       | UUID             | ✅       | —          | FK → Vehicle.id                               |
| type             | type             | MaintenanceType  | ✅       | —          | PREVENTIVE_SERVICE / INSPECTION / REPAIR / OTHER |
| status           | status           | MaintenanceStatus| ✅       | SCHEDULED  | SCHEDULED / IN_PROGRESS / COMPLETED           |
| maintenance_date | maintenance_date | DateTime         | ✅       | —          | Scheduled/due business date                   |
| completed_at     | completed_at     | DateTime?        | ❌       | null       | Actual completion moment                      |
| cost             | cost             | Decimal?         | ❌       | null       | `@db.Decimal(10, 2)`; nullable until completed |
| vendor           | vendor           | String?          | ❌       | null       | Free-text repair shop / vendor                |
| notes            | notes            | String?          | ❌       | null       | Free-text notes                               |
| replaced_parts   | replaced_parts   | Json?            | ❌       | null       | Structured parts breakdown; null when empty   |
| created_at       | created_at       | DateTime         | ✅       | now()      | Audit                                         |
| updated_at       | updated_at       | DateTime         | ✅       | @updatedAt | Audit                                         |
| deleted_at       | deleted_at       | DateTime?        | ❌       | null       | Soft delete                                   |

#### Field Semantics

- `maintenance_date` is the **scheduled/due business date**. It is fixed at scheduling time and is the date used for history ordering and for deriving `UPCOMING`/`OVERDUE`. For backdated maintenance records created after the work has already occurred, `maintenance_date` may be set to the actual work date.
- `completed_at` is the nullable timestamp representing the **actual completion moment**. It is set when the status transitions to `COMPLETED`. There is no separate actual-start-date field; the current product requirements do not justify one.
- `cost` is the **authoritative financial amount** for the maintenance event. It is nullable while maintenance is not completed and is required once the record is `COMPLETED`.
- `vendor` is nullable free text representing the repair shop or vendor. There is no Vendor entity.
- `replaced_parts` is a nullable structured JSON value; an empty parts collection is represented as `null`.

#### Example

- Scheduled for August 20, actually completed August 23 → `maintenance_date = 2026-08-20`, `completed_at = 2026-08-23`, `status = COMPLETED`.

### Constraints

- FKs: `organization_id`, `vehicle_id`.
- `status` must be a valid `MaintenanceStatus`.
- `type` must be a valid `MaintenanceType`.

### Unique Constraints

- None.

### Indexes

- `@@index([organization_id])`
- `@@index([vehicle_id])`
- `@@index([deleted_at])`
- `@@index([status])`
- `@@index([maintenance_date])`

The `status` and `maintenance_date` indexes directly support operational maintenance queries such as tracking upcoming/overdue maintenance.

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `vehicle_id` → `Vehicle.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT (business record). A vehicle referenced by a maintenance record cannot be deleted while the record exists.

### Soft Delete Strategy

- `deleted_at`. A maintenance record that is no longer needed is soft-deleted rather than assigned a `CANCELLED` status.

### Business Rules

- Every maintenance record belongs to exactly one vehicle.
- `UPCOMING` and `OVERDUE` are derived presentation/query states computed from `maintenance_date` and the current date for non-completed records. They are not persisted.
- **Cost invariant:** a completed maintenance record must have a non-null `cost` and a non-null `completed_at`. A `SCHEDULED` or `IN_PROGRESS` record may have a null cost.
- `0.00` represents a real zero-cost maintenance event and must not be used as a placeholder for an unknown cost.
- `unitCost` within `replaced_parts` is informational breakdown data only and must not be independently aggregated into financial totals. `cost` is the single authoritative financial amount.
- Insurance and registration are not Maintenance types. Insurance/registration documents are represented by the `Document` model; insurance/registration renewals and reminders belong to `Task` records.
- The relationship between Maintenance and the future Expenses module is intentionally deferred to Phase 15 to prevent financial double-counting.
- Vehicle status transitions resulting from maintenance completion belong to the Maintenance service/workflow implementation, not the database model.

### Validation Rules

- `type` is required and must be a valid `MaintenanceType`.
- `status` is required and must be a valid `MaintenanceStatus` (default `SCHEDULED`).
- `maintenance_date` is required and must be a valid date.
- `cost`, when present, must be a non-negative `Decimal(10, 2)`. It is required when `status = COMPLETED`.
- `vendor` is optional; when present, must be a non-empty string.
- `notes` is optional; when present, must be a non-empty string.
- `replaced_parts`, when present, must be a JSON array where each entry has:
  - `name`: required, non-empty string
  - `brand`: optional string
  - `quantity`: optional positive integer, default `1`
  - `unitCost`: optional non-negative decimal
  - An empty collection is represented as `null`, not an empty array.

Note: the cost invariant and parts validation are business rules. Database enforcement may rely on application/service validation rather than a database constraint unless the database schema explicitly adds one.

### API Notes

- Planned: maintenance history for a vehicle, CRUD for maintenance records, completion workflow.

---

## Task

### Purpose

Operational reminders.

### Relationships

- Belongs to one `Organization`

### Fields

| Field              | Column          | Type       | Required | Default    | Notes                               |
| ------------------ | --------------- | ---------- | -------- | ---------- | ----------------------------------- |
| id                 | id              | UUID       | ✅       | uuid()     | PK                                  |
| organization_id    | organization_id | UUID       | ✅       | —          | FK → Organization.id                |
| due_date           | due_date        | DateTime   | ✅       | —          | Due/business date                   |
| status             | status          | TaskStatus | ✅       | PENDING    | PENDING / COMPLETED                 |
| notes              | notes           | String?    | ❌       | null       | Free-text notes                     |
| created_at         | created_at      | DateTime   | ✅       | now()      | Audit                               |
| updated_at         | updated_at      | DateTime   | ✅       | @updatedAt | Audit                               |
| deleted_at         | deleted_at      | DateTime?  | ❌       | null       | Soft delete                         |

Notes:

- `due_date` is the **due/business date** for the task. It is the date used for ordering and for deriving `UPCOMING`/`OVERDUE` presentation states.
- `status` default is `PENDING`; transition to `COMPLETED` marks the task finished and removes it from active reminders.
- Recurring schedule: **deferred** (approved architectural decision, Milestone 4, Phase 17, Step 17.1). No recurrence representation is defined in Milestone 4; tasks are single-occurrence. The product requirement to "create recurring tasks" and the domain responsibility "recurring schedule" remain open for a future approved decision.
- Entity associations (Vehicle, Rental, Maintenance, User): **deferred** (approved architectural decision, Milestone 4, Phase 17, Step 17.1). The base Task belongs only to its Organization.

### Constraints

- FK `organization_id` → `Organization.id`.

### Unique Constraints

- None documented.

### Indexes

- `@@index([organization_id])`
- `@@index([deleted_at])`
- `@@index([status])`
- `@@index([due_date])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT.

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- Examples: oil change, insurance renewal, vehicle inspection, administrative reminders.

### Validation Rules

- `due_date` is required and must be a valid date.
- `status` is required and must be a valid `TaskStatus` (default `PENDING`).
- `notes` is optional; when present, must be a non-empty string.

### API Notes

- Planned: standard tasks, due dates, completion workflow. Recurring tasks are deferred and not part of the planned Task API in Milestone 4.

---

## Notification

### Purpose

System-generated reminders.

### Relationships

- Belongs to one `Organization`

### Fields

| Field           | Column          | Type             | Required | Default    | Notes                               |
| --------------- | --------------- | ---------------- | -------- | ---------- | ----------------------------------- |
| id              | id              | UUID             | ✅       | uuid()     | PK                                  |
| organization_id | organization_id | UUID             | ✅       | —          | FK → Organization.id                |
| type            | type            | NotificationType | ✅       | —          | **Requires Architectural Approval** |
| read state      | (undetermined)  | Boolean?         | —        | —          | **Requires Architectural Approval** |
| created_at      | created_at      | DateTime         | ✅       | now()      | Audit                               |
| updated_at      | updated_at      | DateTime         | ✅       | @updatedAt | Audit                               |
| deleted_at      | deleted_at      | DateTime?        | ❌       | null       | Soft delete                         |

### Constraints

- FK `organization_id` → `Organization.id`.

### Unique Constraints

- None documented.

### Indexes

- `@@index([organization_id])`
- `@@index([deleted_at])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT.

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- Examples: rental due today, maintenance due, insurance expiration, registration expiration, task reminder.

### Validation Rules

- **Requires Architectural Approval**.

### API Notes

- Whether stored or generated on demand **Requires Architectural Approval**.

---

# Media (Documents & Photos)

## Purpose

Vehicles have documents and photos. Customers have documents. Photos are vehicle-only; documents belong to either a Vehicle or a Customer.

## Model Structure

Two separate models:

- `Document`
- `Photo`

A shared `Attachment` model is **not** used.

## Storage Abstraction

Media uses a **provider-independent storage abstraction**. Domain logic never depends on a specific storage provider.

Conceptual interface:

```ts
interface StorageProvider {
  store(key: string, data: Buffer, contentType: string): Promise<void>;
  getUrl(key: string): Promise<string>;
  retrieve(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
```

The first implementation will eventually use a local filesystem provider for development and testing. No cloud storage provider is selected.

Storage references use:

- `storage_key: String`
- generated server-side
- never supplied directly by the client
- globally unique
- opaque to the client

Conceptual key format:

```
<organization_id>/<entity>/<uuid>.<extension>
```

The extension is derived from the validated MIME type.

---

# Document

## Purpose

Represents a file attached to a Vehicle or a Customer (e.g., registration or insurance document).

## Relationships

- Belongs to one `Organization`
- Belongs to exactly one owner — either a `Vehicle` or a `Customer`

## Fields

| Field | Column | Type | Required | Default | Notes |
|---|---|---|---|---|---|
| id | id | UUID | ✅ | uuid() | PK |
| organization_id | organization_id | UUID | ✅ | — | FK → Organization.id |
| vehicle_id | vehicle_id | UUID | ❌ | null | FK → Vehicle.id (nullable; one owner must be set) |
| customer_id | customer_id | UUID | ❌ | null | FK → Customer.id (nullable; one owner must be set) |
| category | category | DocumentCategory | ✅ | OTHER | REGISTRATION / INSURANCE / OTHER |
| original_filename | original_filename | String | ✅ | — | Client filename (sanitized) |
| mime_type | mime_type | String | ✅ | — | Content type |
| file_size | file_size | Int | ✅ | — | Size in bytes |
| storage_key | storage_key | String | ✅ | — | Globally unique storage reference |
| created_at | created_at | DateTime | ✅ | now() | Audit |
| updated_at | updated_at | DateTime | ✅ | @updatedAt | Audit |
| deleted_at | deleted_at | DateTime? | ❌ | null | Soft delete |

## Constraints

- FK `organization_id` → `Organization.id`.
- FK `vehicle_id` → `Vehicle.id`.
- FK `customer_id` → `Customer.id`.
- Exactly one of `vehicle_id` or `customer_id` must be set (a document belongs to exactly one owner).
- `file_size` must be a non-negative integer.

## Unique Constraints

- `@@unique([storage_key])` — globally unique storage reference.

## Indexes

- `@@index([organization_id])`
- `@@index([vehicle_id])`
- `@@index([customer_id])`
- `@@index([category])`
- `@@index([deleted_at])`

## Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `vehicle_id` → `Vehicle.id`, onDelete RESTRICT.
- `customer_id` → `Customer.id`, onDelete RESTRICT.

## onDelete Behavior

- RESTRICT for all three FKs (business-record convention).

## Soft Delete Strategy

- `deleted_at` timestamp. Soft-deleted documents are excluded from normal list queries and return 404 on direct retrieval, but remain in the database for audit/recovery.
- Physical storage files are **not** deleted during soft delete. Physical cleanup may be handled by a future storage lifecycle process.

## Business Rules

- A document belongs to exactly one owner — either a Vehicle or a Customer.
- The document's organization must match the owning Vehicle's or Customer's organization.
- `category` identifies registration, insurance, or other document types.

## Validation Rules

- `original_filename` is required, non-empty, sanitized, with path separators removed.
- `mime_type` is required, must be in the supported MIME types.
- `file_size` is required, non-negative integer, maximum 10 MB.
- `category` is required, must be a valid `DocumentCategory`.
- `storage_key` is generated server-side (never client-supplied).

## API Notes

- `/api/vehicles/:id/documents` (upload, list, get, delete) and `/api/customers/:id/documents` (upload, list, get, delete).
- Both ownership paths support authenticated document download.

---

# Photo

## Purpose

Represents a photo attached to a Vehicle.

## Relationships

- Belongs to one `Organization`
- Belongs to one `Vehicle`

## Fields

| Field | Column | Type | Required | Default | Notes |
|---|---|---|---|---|---|
| id | id | UUID | ✅ | uuid() | PK |
| organization_id | organization_id | UUID | ✅ | — | FK → Organization.id |
| vehicle_id | vehicle_id | UUID | ✅ | — | FK → Vehicle.id |
| sort_order | sort_order | Int | ✅ | 0 | Display ordering within a vehicle |
| caption | caption | String? | ❌ | null | Optional description |
| original_filename | original_filename | String | ✅ | — | Client filename (sanitized) |
| mime_type | mime_type | String | ✅ | — | Content type |
| file_size | file_size | Int | ✅ | — | Size in bytes |
| storage_key | storage_key | String | ✅ | — | Globally unique storage reference |
| created_at | created_at | DateTime | ✅ | now() | Audit |
| updated_at | updated_at | DateTime | ✅ | @updatedAt | Audit |
| deleted_at | deleted_at | DateTime? | ❌ | null | Soft delete |

## Constraints

- FK `organization_id` → `Organization.id`.
- FK `vehicle_id` → `Vehicle.id`.
- `file_size` must be a non-negative integer.
- `sort_order` must be an integer.

## Unique Constraints

- `@@unique([storage_key])` — globally unique storage reference.

## Indexes

- `@@index([organization_id])`
- `@@index([vehicle_id])`
- `@@index([vehicle_id, sort_order])`
- `@@index([deleted_at])`

## Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `vehicle_id` → `Vehicle.id`, onDelete RESTRICT.

## onDelete Behavior

- RESTRICT for both FKs (business-record convention).

## Soft Delete Strategy

- `deleted_at` timestamp. Soft-deleted photos are excluded from normal list queries and return 404 on direct retrieval, but remain in the database for audit/recovery.
- Physical storage files are **not** deleted during soft delete. Physical cleanup may be handled by a future storage lifecycle process.

## Business Rules

- A photo belongs to exactly one Vehicle.
- The photo's organization must match the owning Vehicle's organization.
- Photos are ordered by ascending `sort_order`.
- The lowest `sort_order` is the primary / display-first photo.
- No `primary` boolean field is stored.

## Validation Rules

- `original_filename` is required, non-empty, sanitized, with path separators removed.
- `mime_type` is required, must be in the supported MIME types.
- `file_size` is required, non-negative integer, maximum 10 MB.
- `sort_order` is an integer, default 0.
- `caption` is optional; when present, must be a non-empty string.
- `storage_key` is generated server-side (never client-supplied).

## API Notes

- Planned: `/api/vehicles/:id/photos` (upload, list, get, delete) in a later step.
- Upload/download endpoints are **not** part of Step 9.1.

---

# Entity Ownership

The current models use **explicit foreign keys**:

- `Document.vehicle_id` → `Vehicle.id` (nullable; set when the document belongs to a Vehicle)
- `Document.customer_id` → `Customer.id` (nullable; set when the document belongs to a Customer)
- `Photo.vehicle_id` → `Vehicle.id`

Polymorphic `entity_type + entity_id` is **not** used. Exactly one owner FK (`vehicle_id` or `customer_id`) must be set on every `Document`; no other speculative owner columns (e.g., `contract_id`) are added.

The architecture is extensible: future entities (Contract documents) may receive explicit FK relationships through future migrations without redesign.

---

# Organization Isolation

- All media models (`Document`, `Photo`) contain a required `organization_id` FK → `Organization.id`.
- The organization must come from the authenticated server context, never client input.
- The service layer must verify `media.organization_id === owner.organization_id` before creating media, where the owner is the owning Vehicle **or** Customer.

---

# Supported MIME Types

Photos:

- `image/jpeg`
- `image/png`
- `image/webp`

Documents:

- `application/pdf`
- `image/jpeg`
- `image/png`

---

# Step 9.1 Scope

Step 9.1 provides:

- `Document` model
- `Photo` model
- `DocumentCategory` enum
- `StorageProvider` abstraction
- local filesystem provider architecture for development/testing
- migration

It does **not** implement:

- upload APIs
- download APIs
- media controllers
- frontend media UI
- cloud storage
- background cleanup jobs

Those belong to later steps.

---

# Open Decisions Summary (Requires Architectural Approval)

1. **Rental field set and status enum** — period structure, pricing, status values.
2. **Contract representation** — content vs file reference vs template.
3. **Task field set** — **RESOLVED** (approved in Milestone 4, Phase 17, Step 17.1). Fields: `due_date`, `status` (`TaskStatus` = `PENDING`/`COMPLETED`, default `PENDING`), `notes`. Recurrence representation is **deferred** (not implemented in Milestone 4); entity associations (Vehicle/Rental/Maintenance/User) are **deferred**.
4. **Notification field set** — type enum, read state, stored vs generated.
5. **Role permission matrix** — **RESOLVED** (approved in Milestone 4, Phases 14–17, verified in Step 18.2). For all Milestone 4 operations modules (Maintenance, Expense, Payment, Task): list/get for any authenticated user; create/update/delete/complete restricted to `OWNER`. Mirrors the Milestone 2/3 user-module pattern.

Each open decision must be resolved and approved before the corresponding model is implemented.

---

# Implementation Contract

This document is the **authoritative specification** for all domain models in the Vehicle Rental Management Platform.

All implementations must follow this specification without deviation:

- **Prisma schemas** — model definitions, fields, types, defaults, constraints, unique constraints, indexes, foreign keys, and onDelete behavior must match this document.
- **Migrations** — must reflect the schema defined here, with no undocumented fields or constraints.
- **Repositories** — must scope all tenant-owned queries to the organization and preserve soft-delete semantics as documented.
- **Services** — must enforce the business rules and validation rules documented for each model.
- **Validations** — must enforce the documented field requirements, formats, and enums.
- **APIs** — must follow the documented endpoint conventions, response format, and error format.
- **Tests** — must verify the documented business rules and constraints.

Where this document marks a decision as **Requires Architectural Approval**, that decision must be approved before the corresponding model is implemented. Approved decisions are incorporated into this document and become binding.

Any proposed change to an approved model definition, constraint, or business rule is an architectural change and must be explicitly approved before implementation.

---

# Guiding Principle

Every implementation detail in this specification must remain consistent with the Database Design architecture and accurately model the business concepts in the domain model.

> **Does this model the business accurately while preserving data integrity, maintainability, and long-term scalability?**
