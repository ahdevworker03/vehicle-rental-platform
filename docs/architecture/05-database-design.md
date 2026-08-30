# Database Design

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Purpose](#purpose) |
| 2 | [Design Goals](#design-goals) |
| 3 | [Database Philosophy](#database-philosophy) |
| 4 | [Source of Truth](#source-of-truth) |
| 5 | [Multi-Tenant Strategy](#multi-tenant-strategy) |
| 6 | [Entity Overview](#entity-overview) |
| 7 | [Organization Lifecycle and Profile](#organization-lifecycle-and-profile) |
| 8 | [Relationships](#relationships) |
| 9 | [Primary Keys](#primary-keys) |
| 10 | [Foreign Keys](#foreign-keys) |
| 11 | [Audit Fields](#audit-fields) |
| 12 | [Platform and Security Audit Log](#platform-and-security-audit-log) |
| 13 | [Employee Invitations](#employee-invitations) |
| 14 | [Password Reset Tokens](#password-reset-tokens) |
| 15 | [Task Recurrence](#task-recurrence) |
| 16 | [Maintenance Schedules](#maintenance-schedules) |
| 17 | [Soft Deletes](#soft-deletes) |
| 18 | [Transactions](#transactions) |
| 19 | [Indexing Strategy](#indexing-strategy) |
| 20 | [Data Integrity](#data-integrity) |
| 21 | [Offline Synchronization](#offline-synchronization) |
| 22 | [Naming Conventions](#naming-conventions) |
| 23 | [Future Expansion](#future-expansion) |
| 24 | [Guiding Principle](#guiding-principle) |

## Purpose

This document defines how business data is stored and managed within the Vehicle Rental Management Platform.

Its purpose is to establish a consistent, reliable, and scalable database design before implementation begins.

The database design is derived from the domain model and business requirements rather than application code.

This document focuses on database architecture and design principles. SQL migrations and implementation details are documented separately.

---

# Design Goals

The database should be:

- Simple to understand.
- Easy to maintain.
- Highly reliable.
- Consistent.
- Optimized for relational data.
- Designed for multi-tenancy.
- Compatible with offline synchronization.
- Scalable as the product grows.

The database is designed to preserve data integrity while supporting future business expansion.

---

# Database Philosophy

The database represents the business.

Tables, relationships, and constraints should model real business concepts rather than application implementation.

Every table should exist because it represents something meaningful within the vehicle rental domain.

---

# Source of Truth

PostgreSQL is the system of record.

Although clients may temporarily store data locally for offline operation, PostgreSQL always represents the authoritative version of business data after synchronization.

---

# Multi-Tenant Strategy

The application uses a shared database with logical tenant isolation.

Every business record belongs to exactly one organization.

Examples include:

- Customers
- Vehicles
- Rentals
- Payments
- Maintenance Records
- Users

Tenant isolation must be enforced throughout the application.

No organization should ever access another organization's data.

---

# Entity Overview

The primary business entities include:

- Organizations
- Users
- Customers
- Vehicles
- Rentals
- Payments
- Maintenance Records

Vehicles may store optional general notes. These notes are not indexed and do not replace structured vehicle identity or operational fields.

Additional entities may be introduced as the platform evolves.

Examples include:

- Reservations
- Vehicle Sales
- Notifications
- Documents

## Organization Lifecycle and Profile

`Organization` has a lifecycle status of `TRIAL`, `ACTIVE`, `SUSPENDED`, or
`CANCELLED`. New tenant registrations begin in `TRIAL`; existing tenants were
backfilled to `ACTIVE` when lifecycle support was introduced.

Organizations also store nullable business identity fields used by contracts
and reports: legal name, phone, email, address, and contract footer text. SaaS
pricing, subscriptions, and billing data are deliberately not part of this
model.

---

# Relationships

Relationships between entities are based on the business domain.

Examples include:

- An organization owns many users.
- An organization owns many customers.
- An organization owns many vehicles.
- A customer can have many rentals.
- A vehicle can have many rentals.
- A rental may include multiple payments.
- A vehicle can have multiple maintenance records.

Relationship implementation is performed through foreign keys while maintaining referential integrity.

---

# Primary Keys

Every table uses a universally unique identifier (UUID) as its primary key.

Reasons include:

- Global uniqueness.
- Offline record creation.
- Safe synchronization.
- Reduced risk of identifier collisions.
- Easier future integrations.

Primary keys should never contain business meaning.

---

# Foreign Keys

Relationships between tables are enforced using foreign keys.

Foreign keys maintain consistency between related records and prevent invalid references.

Database relationships should always reflect real business relationships.

---

# Audit Fields

Every business table should include common audit information.

Typical fields include:

- id
- created_at
- updated_at
- created_by
- updated_by

These fields improve traceability and simplify auditing.

## Platform and Security Audit Log

`AuditLog` is an append-only record for sensitive platform and security events,
not an event-sourcing system. It stores an optional organization and actor,
action, target type/identifier, non-sensitive structured metadata, and its
creation timestamp. It is indexed for organization, actor, and target lookup.

Lifecycle-status changes are written in the same transaction as the status
update. Invitation, password-reset, and account-administration workflows will
use the same mechanism as they are introduced. Audit records are retained and
are not soft-deleted through normal application operations.

## Employee Invitations

`EmployeeInvitation` stores organization-scoped, `EMPLOYEE`-only onboarding
records. It contains the invited email, a unique token hash, expiry, acceptance
timestamp, creator, accepted user, and timestamps. A unique organization/email
key gives each tenant at most one invitation record per email; resend replaces
the previous token hash and expiry. The token is never stored in plaintext.

Invitation acceptance creates the user and marks the invitation accepted in one
serializable transaction, preserving the global user-email uniqueness rule and
preventing replay or concurrent double acceptance.

## Password Reset Tokens

`PasswordResetToken` stores an opaque token hash, its user, expiry timestamp,
optional consumption timestamp, and creation timestamp. Token hashes are
unique; indexes support active-token lookup by user and expiry cleanup. The
plaintext token is never persisted.

Password-reset confirmation consumes the token, replaces the user's password
hash, revokes every refresh token for that user, and records the completion
audit event in one serializable transaction. A new reset request invalidates
any previously unused token for the same user.

## Task Recurrence

`Task.recurrence_type` is `NONE`, `DAILY`, `WEEKLY`, or `MONTHLY`. A nullable
unique `predecessor_id` self-reference forms a series of occurrences and
ensures that a completed task has at most one direct successor. Completion and
creation of a recurring successor occur in one serializable transaction.

The successor copies the recurring task's notes and recurrence type and derives
its due date from the completed occurrence's due date. Monthly recurrence uses
UTC calendar-month arithmetic and clamps to the target month's last valid day.
The model deliberately does not include scheduling, notification, timezone, or
arbitrary domain-association fields.

## Maintenance Schedules

`MaintenanceSchedule` represents a future servicing rule for one vehicle; it
is distinct from a `Maintenance` record, which represents work that was
actually planned or performed. A schedule belongs to one organization and one
vehicle, and supports `DATE`, `MILEAGE`, or `DATE_OR_MILEAGE` bases.

Date schedules store a positive `date_interval_days` and a `next_due_date` as
a PostgreSQL `DATE` business date. Mileage schedules store a positive
`mileage_interval` and a non-negative `next_due_mileage`. The database check
constraint requires exactly the values applicable to the selected basis, so a
date-only schedule cannot retain mileage values and vice versa.

Schedules are soft-deletable and can be activated or deactivated without
changing the vehicle's operational status. This model deliberately does not
create maintenance records, change availability, send reminders, or run a
background scheduler; those workflows are deferred.

---

# Soft Deletes

Business records should generally use soft deletion instead of permanent deletion.

Deleted records remain available for:

- Historical reporting.
- Audit purposes.
- Data recovery.
- Business traceability.

Soft deletion should only be avoided where permanent removal is legally or technically required.

---

# Transactions

Operations that modify multiple related records should execute within database transactions.

Examples include:

- Creating a rental.
- Recording payments.
- Completing synchronization.
- Vehicle returns.

Transactions ensure business operations remain consistent even if failures occur.

---

# Indexing Strategy

Indexes should be added to improve query performance without unnecessary duplication.

Indexes will primarily support:

- Primary keys.
- Foreign keys.
- Frequently searched fields.
- Common filtering operations.
- Sorting.
- Synchronization queries.

Indexes should be introduced based on application usage rather than assumptions.

---

# Data Integrity

Data integrity is enforced at multiple levels.

The database is responsible for:

- Primary keys.
- Foreign keys.
- Constraints.
- Unique values.
- Transactions.

Application validation complements—but does not replace—database integrity rules.

---

# Offline Synchronization

The database is designed to support offline-first operation.

Design considerations include:

- UUID-based identifiers.
- Record version tracking.
- Conflict detection.
- Synchronization timestamps.
- Safe data merging.

Offline synchronization requirements influence the database design from the beginning.

---

# Naming Conventions

Database objects should follow consistent naming conventions.

General guidelines include:

- Use singular table names.
- Use lowercase snake_case.
- Name foreign keys consistently.
- Use descriptive column names.
- Avoid abbreviations unless widely understood.

Consistency improves readability and maintainability.

---

# Future Expansion

The database should evolve without requiring major redesign.

Future modules—including vehicle sales, reservations, reporting, and integrations—should integrate naturally into the existing relational model.

Scalability should be achieved through good design rather than unnecessary complexity.

---

# Guiding Principle

Every database design decision should answer one question:

> **Does this model the business accurately while preserving data integrity, maintainability, and long-term scalability?**

If the answer is yes, the design is aligned with the goals of this project.
