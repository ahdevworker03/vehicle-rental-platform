# Domain Model

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Introduction](#introduction) |
| 2 | [Core Domain](#core-domain) |
| 3 | [Organization](#organization) |
| 4 | [Responsibilities](#responsibilities) |
| 5 | [Relationships](#relationships) |
| 6 | [User](#user) |
| 7 | [Responsibilities](#responsibilities) |
| 8 | [Relationships](#relationships) |
| 9 | [Customer](#customer) |
| 10 | [Responsibilities](#responsibilities) |
| 11 | [Relationships](#relationships) |
| 12 | [Vehicle](#vehicle) |
| 13 | [Responsibilities](#responsibilities) |
| 14 | [Lifecycle](#lifecycle) |
| 15 | [Relationships](#relationships) |
| 16 | [Rental](#rental) |
| 17 | [Responsibilities](#responsibilities) |
| 18 | [Relationships](#relationships) |
| 19 | [Contract](#contract) |
| 20 | [Responsibilities](#responsibilities) |
| 21 | [Relationships](#relationships) |
| 22 | [Payment](#payment) |
| 23 | [Responsibilities](#responsibilities) |
| 24 | [Relationships](#relationships) |
| 25 | [Notes](#notes) |
| 26 | [Expense](#expense) |
| 27 | [Responsibilities](#responsibilities) |
| 28 | [Relationships](#relationships) |
| 29 | [Maintenance](#maintenance) |
| 30 | [Responsibilities](#responsibilities) |
| 31 | [Relationships](#relationships) |
| 32 | [Task](#task) |
| 33 | [Responsibilities](#responsibilities) |
| 34 | [Relationships](#relationships) |
| 35 | [Notification](#notification) |
| 36 | [Relationships](#relationships) |
| 37 | [Business Rules](#business-rules) |
| 38 | [Future Domain Expansion](#future-domain-expansion) |
| 39 | [Ubiquitous Language](#ubiquitous-language) |

## Introduction

The Domain Model defines the core business entities of the Vehicle Rental Management Platform and the relationships between them.

This document represents the business itself rather than the database implementation. It provides a common language for product planning, frontend development, backend development, database design, and future system expansion.

The platform is centered around the **Vehicle**, which represents the primary business asset managed throughout its lifecycle.

---

# Core Domain

```
Organization
│
├── Users
├── Customers
├── Vehicles
├── Rentals
├── Contracts
├── Payments
├── Expenses
├── Maintenance
├── Tasks
└── Notifications
```

---

# Organization

Represents a business using the platform.

Each organization owns its own data and operates independently from every other organization.

### Responsibilities

- Business profile
- Company information
- Subscription
- Business settings
- Data ownership

### Relationships

- Has many Users
- Has many Customers
- Has many Vehicles
- Has many Rentals
- Has many Payments
- Has many Expenses
- Has many Tasks

---

# User

Represents an employee who can access the platform.

### Responsibilities

- Login
- Perform business operations
- Manage business data according to assigned permissions

### Relationships

- Belongs to one Organization

---

# Customer

Represents a person renting a vehicle.

### Responsibilities

- Identity information
- Driver's license information
- Contact information
- Rental history

### Relationships

- Belongs to one Organization
- Can have many Rentals

---

# Vehicle

Represents a business vehicle managed by the platform.

The vehicle is the central entity of the system.

### Responsibilities

- Vehicle information
- Current status
- Availability
- Mileage
- General notes
- Documents
- Photos
- Business history

### Lifecycle

```
Acquired
    ↓
Available
    ↓
Reserved
    ↓
Rented
    ↓
Maintenance
    ↓
Available
    ↓
Listed for Sale (Future)
    ↓
Sold (Future)
    ↓
Archived
```

### Relationships

- Belongs to one Organization
- Can have many Rentals
- Can have many Maintenance Records
- Can have many Expenses
- Can have many Documents

---

# Rental

Represents an agreement between a customer and the business for using a vehicle.

### Responsibilities

- Rental period
- Pickup
- Return
- Rental status
- Pricing
- Contract association

### Relationships

- Belongs to one Customer
- Belongs to one Vehicle
- Belongs to one Organization
- Has one Contract
- Can have many Payments

---

# Contract

Represents the legal agreement for a rental.

### Responsibilities

- Contract generation
- Printable version
- PDF export
- Signed contract storage

### Relationships

- Belongs to one Rental

---

# Payment

Represents money received for a rental.

### Responsibilities

- Payment amount
- Payment date
- Payment method

### Relationships

- Belongs to one Rental
- Belongs to one Organization

### Notes

- A rental can have multiple payments (partial payments).
- The outstanding balance is **derived**, not stored. It is calculated as the rental `total_amount` minus the valid recorded payments.

---

# Expense

Represents business costs.

### Responsibilities

- Expense amount
- Expense category
- Expense date
- Expense description

Examples include:

- Fuel
- Maintenance
- Insurance
- Registration
- Cleaning
- Other operational costs

### Relationships

- Belongs to one Organization
- May belong to one Vehicle

---

# Maintenance

Represents maintenance performed on a vehicle.

### Responsibilities

- Maintenance date
- Notes
- Replaced parts
- Vendor
- Cost
- Vehicle history

### Relationships

- Belongs to one Vehicle
- Belongs to one Organization

---

# Task

Represents operational reminders.

### Responsibilities

- Due date
- Interval recurrence in days, weeks, or months
- Recurrence end condition
- Completion status
- Explicit recurrence stop action
- Soft deletion of an occurrence

Examples:

- Oil change
- Insurance renewal
- Vehicle inspection
- Administrative reminders

### Relationships

- Belongs to one Organization
- A recurring occurrence may reference its immediate predecessor and have one next occurrence.

### Business Rules

- Task statuses are `PENDING` and `COMPLETED`; `ARCHIVED` and `CANCELLED` are not task statuses.
- A recurring task uses an interval and unit: day, week, or month. Simple presets map daily, weekly, and monthly to an interval of one.
- Recurrence may end never, on a specific date, or after a specified number of occurrences.
- Completing the current occurrence preserves it as `COMPLETED` history and creates exactly one next `PENDING` occurrence when recurrence remains active.
- Recurring occurrences are created by completion, not by a background scheduler.
- Stopping recurrence preserves the current task and all previous occurrences and prevents future occurrences.
- Normal user deletion is soft deletion of the selected occurrence. It sets `deleted_at`, hides the occurrence from normal business views, and preserves the record for audit and history.
- A soft-deleted pending occurrence cannot be completed and therefore cannot generate another occurrence.
- Business date and time interpretation uses `Asia/Beirut`. Persisted timestamps may remain UTC.

---

# Notification

Represents reminders generated by the system.

Examples:

- Rental due today
- Vehicle maintenance due
- Insurance expiration
- Registration expiration
- Task reminder

### Relationships

- Belongs to one Organization

---

# Business Rules

The domain follows these rules:

- Every Organization owns its own data.
- Every User belongs to one Organization.
- Every Customer belongs to one Organization.
- Every Vehicle belongs to one Organization.
- Every Rental belongs to one Customer.
- Every Rental uses one Vehicle.
- A Vehicle cannot have more than one active rental at the same time.
- Every Contract belongs to one Rental.
- Every Payment belongs to one Rental.
- Every Maintenance record belongs to one Vehicle.
- Expenses may optionally be associated with a specific Vehicle.
- Archived vehicles cannot participate in new rentals.

---

# Future Domain Expansion

The domain is intentionally designed to support future modules without changing the core model.

Potential future entities include:

- Vehicle Sale
- Buyer
- Sales Contract
- Reservation
- Branch
- Inventory
- Accounting Integration

These additions should extend the existing model while keeping the Vehicle as the central business asset.

---

# Ubiquitous Language

To maintain consistency across the project, the following terms should be used by developers, documentation, and business stakeholders.

| Business Term     | Meaning                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Organization      | A business using the SaaS platform                                                                         |
| User              | An employee with system access                                                                             |
| Customer          | A person renting a vehicle                                                                                 |
| Vehicle           | A business-owned vehicle                                                                                   |
| Rental            | A rental transaction                                                                                       |
| Contract          | A legal rental agreement                                                                                   |
| Payment           | Money received for a rental                                                                                |
| Expense           | Money spent by the business                                                                                |
| Maintenance       | Work performed on a vehicle                                                                                |
| Task              | An operational reminder                                                                                    |
| Notification      | A system-generated reminder                                                                                |
| Vehicle Lifecycle | The progression of a vehicle from acquisition through rental, maintenance, and eventual retirement or sale |
