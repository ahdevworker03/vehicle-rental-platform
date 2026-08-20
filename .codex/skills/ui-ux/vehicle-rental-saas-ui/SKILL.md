---
name: vehicle-rental-saas-ui
description: Designs UI and UX specifically for vehicle rental management SaaS products. Focuses on fleet status, rentals, customers, payments, maintenance, tasks, analytics, operational alerts, and business-owner workflows.
---

# Vehicle Rental SaaS UI Skill

## How This Works

When applied to a vehicle rental SaaS interface, follow this sequence:

1. **Map the business workflow** — Identify whether the screen supports vehicles, customers, rentals, payments, expenses, maintenance, tasks, analytics, or reporting.
2. **Prioritize operational needs** — Put urgent and high-value business information first.
3. **Use domain language** — Use vehicle-rental terminology clearly and consistently.
4. **Design for daily use** — Rental owners and employees should complete common tasks quickly.
5. **Preserve domain behavior** — Do not change business rules, statuses, calculations, or API behavior unless explicitly instructed.

## Product Context

This product is for vehicle rental businesses.

The interface should help users manage:

- Vehicles
- Customers
- Rentals
- Contracts
- Payments
- Expenses
- Maintenance
- Tasks
- Dashboard
- Analytics
- Reports

The UI should feel like business operations software, not a marketing website, portfolio, or generic admin template.

## Dashboard Priorities

The dashboard should show business owners what matters now.

Priority sections:

1. Current rental activity
2. Fleet availability
3. Operational alerts
4. Financial summary
5. Outstanding balances
6. Upcoming returns
7. Maintenance status
8. Tasks due soon
9. Recent payments and expenses
10. Vehicle profitability and performance trends

### Dashboard KPI Examples

Use metrics such as:

- Active rentals
- Available vehicles
- Reserved vehicles
- Rented vehicles
- Vehicles under maintenance
- Overdue returns
- Upcoming returns
- Total revenue
- Total expenses
- Net profit
- Outstanding balance
- Maintenance cost
- Pending tasks

Do not display decorative KPIs without business meaning.

## Vehicle Screens

Vehicle list pages should help users answer:

- Which vehicles are available?
- Which vehicles are rented?
- Which vehicles are under maintenance?
- Which vehicles need attention?
- Which vehicle am I looking for?

Vehicle list should support:

- Search by plate number, make, model, or status
- Status filtering
- Clear availability state
- Useful summary data
- Fast access to vehicle details

Vehicle detail pages should prioritize:

1. Current status
2. Plate number and identity
3. Availability/rental state
4. Current rental if any
5. Maintenance history
6. Expenses
7. Documents/photos
8. Vehicle metadata

Avoid making vehicle details look like a generic profile page.

## Customer Screens

Customer list pages should help users quickly find renters.

Prioritize:

- Name
- Phone
- National ID
- License number
- Current rental status
- Rental history access

Customer detail pages should prioritize:

1. Contact information
2. Identity information
3. Driver license information
4. Current rental if any
5. Rental history
6. Documents

Avoid unnecessary decorative profile sections.

## Rental Screens

Rental screens are core business workflows.

Rental list pages should make it easy to see:

- Active rentals
- Reserved rentals
- Returned rentals
- Cancelled rentals
- Upcoming returns
- Overdue returns
- Customer
- Vehicle
- Rental dates
- Payment state

Rental detail pages should prioritize:

1. Rental status
2. Customer
3. Vehicle
4. Pickup and return dates
5. Payment summary
6. Outstanding balance
7. Contract actions
8. Workflow actions

Workflow actions should be obvious:

- Pick up
- Return
- Extend
- Cancel
- Record payment
- Generate/print contract

Do not bury workflow actions inside unrelated menus unless the screen is crowded.

## Payment and Financial Screens

Payment UI should make balances obvious.

Show:

- Rental total
- Paid amount
- Outstanding balance
- Payment history
- Payment method
- Payment date

Financial UI should distinguish:

- Revenue
- Expenses
- Maintenance costs
- Net profit
- Outstanding balances

Avoid mixing payment revenue with expenses in a way that hides meaning.

## Maintenance Screens

Maintenance screens should show operational status clearly.

Prioritize:

- Vehicle
- Maintenance type
- Status
- Due date
- Completion date
- Vendor
- Cost
- Replaced parts
- Notes

Derived states:

- Upcoming
- Overdue

These should be visual presentation states, not new persisted statuses unless the backend already supports them.

## Task Screens

Task screens should help users avoid missing operational reminders.

Prioritize:

- Due date
- Status
- Notes
- Overdue state
- Completion action

Keep task UI simple.

Do not create complex project-management behavior unless required.

## Analytics and Reports

Analytics should explain business performance.

Use sections for:

- Revenue
- Expenses
- Net profit
- Vehicle profitability
- Maintenance costs
- Monthly trends
- Payment collection
- Fleet utilization

Every report should answer a business question.

Examples:

- Which vehicles generate the most revenue?
- Which vehicles cost the most to maintain?
- How much money is outstanding?
- Is monthly performance improving or declining?

Avoid charts without decisions attached to them.

## Status Design

Status indicators must be clear and consistent.

Use status colors carefully:

- Available: green
- Reserved: blue or indigo
- Rented/active: strong blue
- Maintenance: amber
- Overdue/danger: red
- Completed/returned: neutral or green depending on context
- Cancelled/archived: muted gray

Do not use too many colors on one screen.

## Arabic UI Rules

Use clear business Arabic.

Prefer short module labels:

- المركبات
- العملاء
- الإيجارات
- الصيانة
- المصاريف
- المدفوعات
- المهام
- التقارير
- التحليلات

Avoid marketing phrases inside operational screens.

Use practical language:

- حفظ
- إلغاء
- إضافة مركبة
- تسجيل دفعة
- إكمال الصيانة
- إرجاع المركبة
- تمديد الإيجار

## Vehicle Rental UX Checklist

Before accepting a screen, verify:

- Does the screen match the vehicle-rental workflow?
- Are urgent operational issues visible?
- Are rental statuses clear?
- Are vehicle statuses clear?
- Are payments and outstanding balances obvious?
- Are maintenance due/overdue states easy to see?
- Are primary workflow actions easy to find?
- Does the UI use business language instead of generic SaaS copy?
- Does the screen help a real rental office work faster?

## Rules

- Do not invent new business statuses.
- Do not change financial calculations.
- Do not change rental workflow behavior.
- Do not create future modules such as sales, reservations, or customer portals unless explicitly requested.
- Keep the UI focused on vehicle rental operations.
