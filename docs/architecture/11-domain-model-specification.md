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

## RentalStatus

**Source:** `04-domain-model.md` lists rental responsibilities but no status enum.

| Value          | Status                              |
| -------------- | ----------------------------------- |
| (undetermined) | **Requires Architectural Approval** |

Notes: Rental status values (e.g., active, returned, extended, cancelled) are not documented.

## PaymentStatus

**Source:** not documented.

| Value          | Status                              |
| -------------- | ----------------------------------- |
| (undetermined) | **Requires Architectural Approval** |

## PaymentMethod

**Source:** not documented.

| Value          | Status                              |
| -------------- | ----------------------------------- |
| (undetermined) | **Requires Architectural Approval** |

## ExpenseCategory

**Source:** `04-domain-model.md` lists examples: Fuel, Maintenance, Insurance, Registration, Cleaning, Other.

| Value          | Status                            |
| -------------- | --------------------------------- |
| `FUEL`         | Documented (domain model example) |
| `MAINTENANCE`  | Documented (domain model example) |
| `INSURANCE`    | Documented (domain model example) |
| `REGISTRATION` | Documented (domain model example) |
| `CLEANING`     | Documented (domain model example) |
| `OTHER`        | Documented (domain model example) |

Notes: Exact enum representation and whether additional categories exist **Requires Architectural Approval**.

## MaintenanceStatus

**Source:** not documented.

| Value          | Status                              |
| -------------- | ----------------------------------- |
| (undetermined) | **Requires Architectural Approval** |

## TaskStatus

**Source:** `04-domain-model.md` mentions "completion status" but no enum.

| Value          | Status                              |
| -------------- | ----------------------------------- |
| (undetermined) | **Requires Architectural Approval** |

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
- Per-module role permissions (OWNER/MANAGER/EMPLOYEE) are partially inferred; exact permission matrix **Requires Architectural Approval**.

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

Money received from customers for rentals.

### Relationships

- Belongs to one `Rental`
- Belongs to one `Organization`

### Fields

| Field           | Column          | Type          | Required | Default    | Notes                                           |
| --------------- | --------------- | ------------- | -------- | ---------- | ----------------------------------------------- |
| id              | id              | UUID          | ✅       | uuid()     | PK                                              |
| organization_id | organization_id | UUID          | ✅       | —          | FK → Organization.id                            |
| rental_id       | rental_id       | UUID          | ✅       | —          | FK → Rental.id                                  |
| amount          | amount          | Decimal       | ✅       | —          | **Requires Architectural Approval** (precision) |
| payment date    | (undetermined)  | DateTime      | ✅       | —          | Documented as "payment date"                    |
| method          | method          | PaymentMethod | ✅       | —          | **Requires Architectural Approval**             |
| created_at      | created_at      | DateTime      | ✅       | now()      | Audit                                           |
| updated_at      | updated_at      | DateTime      | ✅       | @updatedAt | Audit                                           |
| deleted_at      | deleted_at      | DateTime?     | ❌       | null       | Soft delete                                     |

### Constraints

- FKs: `organization_id`, `rental_id`.

### Unique Constraints

- None documented.

### Indexes

- `@@index([organization_id])`
- `@@index([rental_id])`
- `@@index([deleted_at])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `rental_id` → `Rental.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT.

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- Every payment belongs to one rental.
- Outstanding balance tracking (stored vs derived) **Requires Architectural Approval**.

### Validation Rules

- **Requires Architectural Approval**.

### API Notes

- Planned: record payments, partial payments, outstanding balances.

---

## Expense

### Purpose

Business costs.

### Relationships

- Belongs to one `Organization`
- May belong to one `Vehicle` (optional)

### Fields

| Field           | Column          | Type            | Required | Default    | Notes                               |
| --------------- | --------------- | --------------- | -------- | ---------- | ----------------------------------- |
| id              | id              | UUID            | ✅       | uuid()     | PK                                  |
| organization_id | organization_id | UUID            | ✅       | —          | FK → Organization.id                |
| vehicle_id      | vehicle_id      | UUID?           | ❌       | null       | FK → Vehicle.id (optional)          |
| amount          | amount          | Decimal         | ✅       | —          | **Requires Architectural Approval** |
| category        | category        | ExpenseCategory | ✅       | —          | Documented examples                 |
| expense date    | (undetermined)  | DateTime        | ✅       | —          | Documented as "expense date"        |
| description     | description     | String?         | ❌       | —          | Documented as "expense description" |
| created_at      | created_at      | DateTime        | ✅       | now()      | Audit                               |
| updated_at      | updated_at      | DateTime        | ✅       | @updatedAt | Audit                               |
| deleted_at      | deleted_at      | DateTime?       | ❌       | null       | Soft delete                         |

### Constraints

- FKs: `organization_id`, optional `vehicle_id`.

### Unique Constraints

- None documented.

### Indexes

- `@@index([organization_id])`
- `@@index([vehicle_id])`
- `@@index([category])`
- `@@index([deleted_at])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `vehicle_id` → `Vehicle.id`, onDelete RESTRICT (optional relation).

### onDelete Behavior

- RESTRICT.

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- Expenses may optionally be associated with a vehicle.
- Examples: Fuel, Maintenance, Insurance, Registration, Cleaning, Other.

### Validation Rules

- **Requires Architectural Approval**.

### API Notes

- Planned: record expenses, associate with vehicles when applicable.

---

## Maintenance

### Purpose

Work performed on a vehicle.

### Relationships

- Belongs to one `Vehicle`
- Belongs to one `Organization`

### Fields

| Field            | Column          | Type      | Required | Default    | Notes                               |
| ---------------- | --------------- | --------- | -------- | ---------- | ----------------------------------- |
| id               | id              | UUID      | ✅       | uuid()     | PK                                  |
| organization_id  | organization_id | UUID      | ✅       | —          | FK → Organization.id                |
| vehicle_id       | vehicle_id      | UUID      | ✅       | —          | FK → Vehicle.id                     |
| maintenance date | (undetermined)  | DateTime  | ✅       | —          | Documented as "maintenance date"    |
| notes            | notes           | String?   | ❌       | —          | Documented as "notes"               |
| replaced parts   | (undetermined)  | —         | —        | —          | **Requires Architectural Approval** |
| vendor           | (undetermined)  | —         | —        | —          | **Requires Architectural Approval** |
| cost             | cost            | Decimal   | ✅       | —          | **Requires Architectural Approval** |
| created_at       | created_at      | DateTime  | ✅       | now()      | Audit                               |
| updated_at       | updated_at      | DateTime  | ✅       | @updatedAt | Audit                               |
| deleted_at       | deleted_at      | DateTime? | ❌       | null       | Soft delete                         |

### Constraints

- FKs: `organization_id`, `vehicle_id`.

### Unique Constraints

- None documented.

### Indexes

- `@@index([organization_id])`
- `@@index([vehicle_id])`
- `@@index([deleted_at])`

### Foreign Keys

- `organization_id` → `Organization.id`, onDelete RESTRICT.
- `vehicle_id` → `Vehicle.id`, onDelete RESTRICT.

### onDelete Behavior

- RESTRICT.

### Soft Delete Strategy

- `deleted_at`.

### Business Rules

- Every maintenance record belongs to one vehicle.

### Validation Rules

- **Requires Architectural Approval**.

### API Notes

- Planned: maintenance history, records, parts, vendors, costs.

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
| due date           | (undetermined)  | DateTime   | ✅       | —          | Documented as "due date"            |
| recurring schedule | (undetermined)  | —          | —        | —          | **Requires Architectural Approval** |
| completion status  | (undetermined)  | TaskStatus | —        | —          | **Requires Architectural Approval** |
| created_at         | created_at      | DateTime   | ✅       | now()      | Audit                               |
| updated_at         | updated_at      | DateTime   | ✅       | @updatedAt | Audit                               |
| deleted_at         | deleted_at      | DateTime?  | ❌       | null       | Soft delete                         |

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

- Examples: oil change, insurance renewal, vehicle inspection, administrative reminders.

### Validation Rules

- **Requires Architectural Approval**.

### API Notes

- Planned: standard tasks, recurring tasks, due dates.

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

Vehicles have documents and photos. Customers may have documents.

## Open Decisions (Requires Architectural Approval)

- Whether `Document` and `Photo` are separate models or one shared media/attachment model.
- Storage mechanism (local filesystem, object storage, database BLOB, external service).
- File metadata fields (name, mime type, size, URL/path, checksum).
- Whether photos are a single image or a collection per vehicle.
- Organization scoping of media records.

---

# Open Decisions Summary (Requires Architectural Approval)

1. **Rental field set and status enum** — period structure, pricing, status values.
3. **Contract representation** — content vs file reference vs template.
4. **Payment field set** — method enum, amount precision, balance stored vs derived.
5. **Expense field set** — amount precision, currency, category enum representation.
6. **Maintenance field set** — parts representation, vendor representation, cost format.
7. **Task field set** — recurrence representation, completion status enum.
8. **Notification field set** — type enum, read state, stored vs generated.
9. **Media model design** — separate vs shared models, storage mechanism, metadata fields.
10. **Role permission matrix** — exact per-module permissions for OWNER/MANAGER/EMPLOYEE.

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
