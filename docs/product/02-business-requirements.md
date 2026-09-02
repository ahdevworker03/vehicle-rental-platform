# Business Requirements

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [1. Introduction](#1-introduction) |
| 2 | [2. Organization Management](#2-organization-management) |
| 3 | [Requirements](#requirements) |
| 4 | [3. User Management](#3-user-management) |
| 5 | [Requirements](#requirements) |
| 6 | [4. Customer Management](#4-customer-management) |
| 7 | [Requirements](#requirements) |
| 8 | [5. Vehicle Management](#5-vehicle-management) |
| 9 | [Requirements](#requirements) |
| 10 | [6. Rental Management](#6-rental-management) |
| 11 | [Requirements](#requirements) |
| 12 | [7. Contract Management](#7-contract-management) |
| 13 | [Requirements](#requirements) |
| 14 | [8. Financial Management](#8-financial-management) |
| 15 | [Requirements](#requirements) |
| 16 | [9. Maintenance Management](#9-maintenance-management) |
| 17 | [Requirements](#requirements) |
| 18 | [10. Task Management](#10-task-management) |
| 19 | [Requirements](#requirements) |
| 20 | [11. Dashboard & Analytics](#11-dashboard--analytics) |
| 21 | [Requirements](#requirements) |
| 22 | [12. Search](#12-search) |
| 23 | [Requirements](#requirements) |
| 24 | [13. Notifications & Reminders](#13-notifications--reminders) |
| 25 | [Requirements](#requirements) |
| 26 | [14. Offline Capability](#14-offline-capability) |
| 27 | [Requirements](#requirements) |
| 28 | [15. Performance](#15-performance) |
| 29 | [Requirements](#requirements) |
| 30 | [16. Business Rules](#16-business-rules) |
| 31 | [17. Future Expansion](#17-future-expansion) |

## 1. Introduction

This document defines the functional business requirements for the Vehicle Rental Management Platform. The requirements are based on interviews and discussions with vehicle rental business owners, combined with additional analysis of common operational workflows.

The purpose of this document is to describe what the system must enable businesses to accomplish. It serves as the foundation for user flows, domain modeling, backend architecture, API design, and future product planning.

The primary focus of the platform is vehicle rental management. The architecture should also support future expansion into vehicle sales without changing the core business model.

---

# 2. Organization Management

The platform must support multiple independent businesses using the same SaaS application.

### Requirements

- Create and manage business accounts.
- Store company information.
- Support multiple users per organization.
- Isolate each organization's data.
- Allow businesses to customize basic company information for contracts and reports.

---

# 3. User Management

The system must allow organizations to manage employee access.

### Requirements

- Secure user authentication.
- Invite and manage users.
- Support different user roles and permissions.
- Allow password updates.
- Prevent unauthorized access to business data.

---

# 4. Customer Management

The system must maintain complete customer information required for rental operations.

### Requirements

- Create customer profiles.
- Edit customer information.
- Store national identification details.
- Store driver's license information.
- Store contact information.
- Search customers quickly.
- View complete rental history.
- Prevent duplicate customer records.
- Archive inactive customers.

---

# 5. Vehicle Management

The platform must manage every vehicle owned by the business throughout its lifecycle.

### Requirements

- Register vehicles.
- Edit vehicle information.
- Upload vehicle photos.
- Store registration and insurance documents.
- Track vehicle availability.
- Track current vehicle status.
- Record mileage.
- Archive retired vehicles.
- Maintain a complete vehicle history.

Vehicle statuses may include:

- Available
- Reserved
- Rented
- Under Maintenance
- Out of Service
- Archived

---

# 6. Rental Management

The system must support the complete rental workflow.

### Requirements

- Create rentals.
- Assign vehicles to customers.
- Record pick-up date and time.
- Record expected return date and time.
- Complete vehicle returns.
- Extend rentals.
- Cancel rentals.
- View rental history.
- Prevent double-booking of vehicles.
- Display vehicle availability.

---

# 7. Contract Management

Rental agreements must be generated and stored digitally.

### Requirements

- Generate rental contracts.
- Export contracts as PDF.
- Print contracts for customer signatures.
- Store contract history.
- Associate contracts with rentals.

---

# 8. Financial Management

The system must help businesses monitor financial activity related to rentals.

### Requirements

- Record rental payments.
- Support multiple payment methods.
- Record partial payments.
- Track outstanding balances.
- Record vehicle-related expenses.
- Record operational expenses.
- Associate expenses with vehicles when applicable.

---

# 9. Maintenance Management

The system must help businesses manage vehicle maintenance throughout the vehicle lifecycle.

### Requirements

- Record maintenance history.
- Create maintenance records.
- Store maintenance notes.
- Record replaced parts.
- Record part brands.
- Record repair shops or vendors.
- Record maintenance costs.
- Record maintenance dates.
- Schedule recurring maintenance.
- Track upcoming maintenance.

---

# 10. Task Management

The platform should assist businesses with operational reminders.

### Requirements

- Create tasks.
- Require a short task title as the primary human-readable task identity.
- Assign due dates.
- Keep optional task notes as supplementary description, separate from the title.
- Create tasks with no recurrence or an interval recurrence measured in days, weeks, or months.
- Support simple recurrence presets: daily (1 day), weekly (1 week), and monthly (1 month).
- Support custom recurrence intervals such as every 15 days, every 2 weeks, or every 4 months.
- End recurrence never, on a specific date, or after a specified number of occurrences.
- Count the original task as occurrence 1; for example, ending after 5 occurrences permits at most four successors.
- Track task completion.
- Stop recurrence as an explicit action without deleting the current task or its history.
- Soft-delete an individual task occurrence when authorized.
- Support maintenance reminders.
- Support administrative reminders.

---

# 11. Dashboard & Analytics

The platform must provide business insights that help owners understand the performance of their business.

### Requirements

- Dashboard overview.
- Active rentals.
- Available vehicles.
- Vehicles under maintenance.
- Total revenue.
- Total expenses.
- Net profit.
- Revenue per vehicle.
- Monthly maintenance cost per vehicle.
- Yearly maintenance cost per vehicle.
- Lifetime maintenance cost per vehicle.
- Vehicle profitability.
- Business performance trends.

---

# 12. Search

Searching information should be fast and accessible throughout the application.

### Requirements

- Search vehicles.
- Search customers.
- Search rentals.
- Instant search results.
- Offline search support.

---

# 13. Notifications & Reminders

The platform should help businesses avoid missing important events.

### Requirements

- Rental return reminders.
- Maintenance reminders.
- Task reminders.
- Vehicle document expiration reminders.
- Insurance expiration reminders.

---

# 14. Offline Capability

The application should remain operational during internet interruptions.

### Requirements

- Open the application without internet.
- View previously synchronized data.
- Search customers offline.
- Search vehicles offline.
- Create customers offline.
- Create rentals offline.
- Edit existing records offline.
- Queue local changes.
- Automatically synchronize changes when connectivity returns.
- Handle synchronization conflicts safely.

---

# 15. Performance

The platform must provide a responsive experience on both desktop and mobile devices.

### Requirements

- Fast application startup.
- Smooth navigation.
- Instant search.
- Responsive interface.
- Eliminate lag and freezing during normal operation.
- Reliable synchronization after reconnecting.

---

# 16. Business Rules

The following business rules must always be enforced.

- A vehicle cannot have more than one active rental at the same time.
- Every rental must be associated with one customer.
- Every maintenance record must belong to one vehicle.
- Archived vehicles cannot be rented.
- Only authorized users can access organization data.
- Organizations cannot access data belonging to other organizations.
- Every financial transaction must be associated with the appropriate business record.
- Offline changes must synchronize without creating duplicate records.
- The business timezone is `Asia/Beirut`; business date and time interpretation must use that timezone, including recurrence calculations.
- User-facing web dates use `dd/mm/yyyy`; date and time values use the same date format with Beirut-local time.

---

# 17. Future Expansion

The platform is intentionally designed to support future business growth.

Future capabilities may include:

- Vehicle sales management.
- Buyer management.
- Sales contracts.
- Vehicle lifecycle tracking from acquisition to sale.
- Customer self-service portal.
- Online reservations.
- Advanced reporting and analytics.
- Accounting system integrations.

Future additions should extend the existing vehicle management platform without changing its primary focus on vehicle rental businesses.
