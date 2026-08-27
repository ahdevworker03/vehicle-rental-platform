# Database Design

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
