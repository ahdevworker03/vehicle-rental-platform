# User Flows

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Introduction](#introduction) |
| 2 | [Authentication](#authentication) |
| 3 | [Login](#login) |
| 4 | [Goal](#goal) |
| 5 | [Flow](#flow) |
| 6 | [Alternative Flows](#alternative-flows) |
| 7 | [Customer Management](#customer-management) |
| 8 | [Add Customer](#add-customer) |
| 9 | [Goal](#goal) |
| 10 | [Flow](#flow) |
| 11 | [Search Customer](#search-customer) |
| 12 | [Goal](#goal) |
| 13 | [Flow](#flow) |
| 14 | [Edit Customer](#edit-customer) |
| 15 | [Goal](#goal) |
| 16 | [Flow](#flow) |
| 17 | [Vehicle Management](#vehicle-management) |
| 18 | [Register Vehicle](#register-vehicle) |
| 19 | [Goal](#goal) |
| 20 | [Flow](#flow) |
| 21 | [Search Vehicle](#search-vehicle) |
| 22 | [Goal](#goal) |
| 23 | [Flow](#flow) |
| 24 | [Update Vehicle Status](#update-vehicle-status) |
| 25 | [Goal](#goal) |
| 26 | [Flow](#flow) |
| 27 | [Rental Management](#rental-management) |
| 28 | [Create Rental](#create-rental) |
| 29 | [Goal](#goal) |
| 30 | [Flow](#flow) |
| 31 | [Alternative Flows](#alternative-flows) |
| 32 | [Return Vehicle](#return-vehicle) |
| 33 | [Goal](#goal) |
| 34 | [Flow](#flow) |
| 35 | [Extend Rental](#extend-rental) |
| 36 | [Goal](#goal) |
| 37 | [Flow](#flow) |
| 38 | [Cancel Rental](#cancel-rental) |
| 39 | [Goal](#goal) |
| 40 | [Flow](#flow) |
| 41 | [Contract Management](#contract-management) |
| 42 | [Generate Rental Contract](#generate-rental-contract) |
| 43 | [Goal](#goal) |
| 44 | [Flow](#flow) |
| 45 | [Maintenance Management](#maintenance-management) |
| 46 | [Record Maintenance](#record-maintenance) |
| 47 | [Goal](#goal) |
| 48 | [Flow](#flow) |
| 49 | [Complete Maintenance](#complete-maintenance) |
| 50 | [Goal](#goal) |
| 51 | [Flow](#flow) |
| 52 | [Financial Management](#financial-management) |
| 53 | [Record Rental Payment](#record-rental-payment) |
| 54 | [Goal](#goal) |
| 55 | [Flow](#flow) |
| 56 | [Record Expense](#record-expense) |
| 57 | [Goal](#goal) |
| 58 | [Flow](#flow) |
| 59 | [Task Management](#task-management) |
| 60 | [Create Task](#create-task) |
| 61 | [Goal](#goal) |
| 62 | [Flow](#flow) |
| 63 | [Complete Task](#complete-task) |
| 64 | [Goal](#goal) |
| 65 | [Flow](#flow) |
| 66 | [Stop Task Recurrence](#stop-task-recurrence) |
| 67 | [Delete Task Occurrence](#delete-task-occurrence) |
| 68 | [Dashboard](#dashboard) |
| 69 | [Review Daily Operations](#review-daily-operations) |
| 70 | [Goal](#goal) |
| 71 | [Flow](#flow) |
| 72 | [Offline Workflow](#offline-workflow) |
| 73 | [Continue Working Without Internet](#continue-working-without-internet) |
| 74 | [Goal](#goal) |
| 75 | [Flow](#flow) |
| 76 | [Future Vehicle Sales](#future-vehicle-sales) |
| 77 | [Sell Fleet Vehicle](#sell-fleet-vehicle) |
| 78 | [Goal](#goal) |
| 79 | [Flow](#flow) |

## Introduction

This document describes the primary workflows supported by the Vehicle Rental Management Platform.

Each flow represents a business process performed by users during their daily operations. These flows are based on validated business requirements and will guide future UI design, backend implementation, database modeling, and API development.

---

# Authentication

## Login

### Goal

Allow authorized users to securely access their organization's workspace.

### Flow

1. User opens the application.
2. User enters their credentials.
3. System validates the credentials.
4. User is redirected to the dashboard.

### Alternative Flows

- Invalid credentials are rejected.
- Inactive users cannot log in.

---

# Customer Management

## Add Customer

### Goal

Create a customer profile before renting a vehicle.

### Flow

1. User opens Customer Management.
2. User selects **Add Customer**.
3. User enters customer information.
4. User enters driver's license information.
5. User saves the customer.
6. Customer profile becomes available for future rentals.

---

## Search Customer

### Goal

Find an existing customer quickly.

### Flow

1. User enters a search term.
2. System displays matching customers.
3. User selects a customer.
4. Customer details and rental history are displayed.

---

## Edit Customer

### Goal

Update customer information.

### Flow

1. User opens a customer profile.
2. User edits information.
3. User saves changes.
4. Updated information becomes immediately available.

---

# Vehicle Management

## Register Vehicle

### Goal

Add a vehicle to the business fleet.

### Flow

1. User opens Vehicle Management.
2. User selects **Add Vehicle**.
3. User enters vehicle information.
4. User uploads relevant documents and photos.
5. Vehicle is saved.
6. Vehicle becomes available for business operations.

---

## Search Vehicle

### Goal

Locate vehicles instantly.

### Flow

1. User searches by vehicle information.
2. System displays matching vehicles.
3. User selects a vehicle.
4. Vehicle details, status, and history are displayed.

---

## Update Vehicle Status

### Goal

Maintain accurate fleet availability.

### Flow

1. User opens a vehicle profile.
2. User changes vehicle status.
3. System updates availability.
4. Dashboard reflects the new status.

---

# Rental Management

## Create Rental

### Goal

Rent a vehicle to a customer.

### Flow

1. User starts a new rental.
2. User selects an existing customer or creates a new one.
3. User selects an available vehicle.
4. User enters rental details.
5. System validates vehicle availability.
6. Rental is created.
7. Vehicle status changes to **Rented**.
8. Contract becomes available for printing or PDF export.

### Alternative Flows

- Customer does not exist → Create Customer.
- Vehicle is unavailable → Select another vehicle.

---

## Return Vehicle

### Goal

Complete an active rental.

### Flow

1. User opens the active rental.
2. User records the return.
3. System updates rental status.
4. Vehicle becomes available or enters maintenance.
5. Rental is archived.

---

## Extend Rental

### Goal

Increase the rental period.

### Flow

1. User opens an active rental.
2. User updates the return date.
3. System verifies vehicle availability.
4. Rental is updated.

---

## Cancel Rental

### Goal

Cancel a rental before it begins.

### Flow

1. User opens the rental.
2. User selects **Cancel**.
3. System releases the reserved vehicle.
4. Rental is marked as cancelled.

---

# Contract Management

## Generate Rental Contract

### Goal

Produce a legal rental agreement.

### Flow

1. User opens an active rental.
2. User generates the contract.
3. System creates the contract.
4. User prints or exports the contract as PDF.

---

# Maintenance Management

## Record Maintenance

### Goal

Track maintenance performed on a vehicle.

### Flow

1. User selects a vehicle.
2. User creates a maintenance record.
3. User records repair details, replaced parts, vendor, date, notes, and cost.
4. Maintenance record is saved.
5. Vehicle history is updated.

---

## Complete Maintenance

### Goal

Return a maintained vehicle to service.

### Flow

1. User opens an active maintenance record.
2. User marks maintenance as completed.
3. Vehicle status changes to **Available**.
4. Dashboard is updated.

---

# Financial Management

## Record Rental Payment

### Goal

Track customer payments.

### Flow

1. User opens a rental.
2. User records a payment.
3. System updates the payment status.
4. Rental balance is recalculated.

---

## Record Expense

### Goal

Track operational costs.

### Flow

1. User creates an expense.
2. User associates it with a vehicle when applicable.
3. User saves the expense.
4. Dashboard and analytics update automatically.

---

# Task Management

## Create Task

### Goal

Manage operational reminders.

### Flow

1. User creates a task.
2. User enters a short title that identifies the task.
3. User sets a due date and may add supplementary notes.
4. User optionally selects no recurrence or an interval recurrence in days, weeks, or months.
5. For recurring tasks, user chooses whether recurrence never ends, ends on an inclusive date, or ends after a number of occurrences including the original task.
6. User may choose a daily, weekly, or monthly preset, or enter a custom interval and unit.
7. Task appears in upcoming reminders.

---

## Complete Task

### Goal

Track finished work.

### Flow

1. User opens a task.
2. User marks it as completed.
3. The current occurrence is marked `COMPLETED` and remains available as historical data.
4. If recurrence is active and its end condition has not been reached, the system creates exactly one next `PENDING` occurrence with the same title, notes, and recurrence configuration. The original task is occurrence 1; after 5 occurrences means at most four successors.
5. A next occurrence is allowed on the inclusive end date when its Beirut-local business date equals that date, but not after it.
6. No background scheduler creates occurrences.

---

## Stop Task Recurrence

### Goal

Stop future occurrences without deleting the current task or its history.

### Flow

1. User opens the current recurring occurrence.
2. User selects **Stop recurrence**.
3. The system preserves the current task and all previous occurrences.
4. The system prevents future occurrences from being created.

Stopping recurrence is separate from deleting a task. Historical occurrences remain available.

---

## Delete Task Occurrence

### Goal

Remove one task occurrence from normal business views while preserving its record.

### Flow

1. User opens the task occurrence.
2. User selects **Delete** and confirms the action.
3. The system soft-deletes only the selected occurrence by setting `deleted_at`.
4. The occurrence is hidden from normal business views but retained for audit and history.
5. If the deleted occurrence is the current pending occurrence, it cannot be completed and no next occurrence is generated.

---

# Dashboard

## Review Daily Operations

### Goal

Provide business owners with an overview of current operations.

### Flow

1. User opens the dashboard.
2. System displays:

   - Active rentals
   - Available vehicles
   - Vehicles under maintenance
   - Upcoming returns
   - Revenue summary
   - Expense summary
   - Pending tasks

3. User navigates directly to the relevant module.

---

# Offline Workflow

## Continue Working Without Internet

### Goal

Allow businesses to continue operating during connectivity interruptions.

### Flow

1. User opens the application without an internet connection.
2. Previously synchronized data is loaded locally.
3. User searches customers and vehicles.
4. User creates or edits records.
5. Changes are stored locally.
6. Internet connectivity returns.
7. System synchronizes local changes automatically.
8. User receives confirmation that synchronization completed successfully.

---

# Future Vehicle Sales

## Sell Fleet Vehicle

### Goal

Allow businesses to sell vehicles that are leaving the rental fleet.

### Flow

1. User selects a vehicle.
2. User changes the vehicle status to **Listed for Sale**.
3. User records buyer information.
4. User records sale details.
5. System generates a sales contract.
6. Vehicle status changes to **Sold**.
7. Vehicle remains accessible through historical records but is no longer available for rental.
