# Vehicle Rental Platform — Manual QA Test Plan

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [1. Purpose and execution rules](#1-purpose-and-execution-rules) |
| 2 | [When manual testing happens](#when-manual-testing-happens) |
| 3 | [Implemented-scope guardrails](#implemented-scope-guardrails) |
| 4 | [Common expected UI standards](#common-expected-ui-standards) |
| 5 | [2. Test environment and controlled data](#2-test-environment-and-controlled-data) |
| 6 | [Required setup](#required-setup) |
| 7 | [Test accounts](#test-accounts) |
| 8 | [Minimum seed data](#minimum-seed-data) |
| 9 | [3. Sequential smoke tests](#3-sequential-smoke-tests) |
| 10 | [4. Authentication and authorization](#4-authentication-and-authorization) |
| 11 | [5. Dashboard](#5-dashboard) |
| 12 | [6. Customers](#6-customers) |
| 13 | [7. Vehicles](#7-vehicles) |
| 14 | [8. Rentals and contracts](#8-rentals-and-contracts) |
| 15 | [9. Payments (rental-contextual)](#9-payments-rental-contextual) |
| 16 | [10. Maintenance](#10-maintenance) |
| 17 | [11. Expenses](#11-expenses) |
| 18 | [12. Tasks](#12-tasks) |
| 19 | [13. Analytics](#13-analytics) |
| 20 | [14. Reports](#14-reports) |
| 21 | [15. Cross-module manual workflows](#15-cross-module-manual-workflows) |
| 22 | [16. Responsive and UI verification checklist](#16-responsive-and-ui-verification-checklist) |
| 23 | [17. Accessibility and keyboard checklist](#17-accessibility-and-keyboard-checklist) |
| 24 | [18. Browser console, network, and regression checklist](#18-browser-console-network-and-regression-checklist) |
| 25 | [19. Offline verification for Milestone 6](#19-offline-verification-for-milestone-6) |
| 26 | [20. Release blockers and final verification](#20-release-blockers-and-final-verification) |
| 27 | [21. Related testing documents](#21-related-testing-documents) |

## 1. Purpose and execution rules

Manual testing complements automated and E2E testing by validating complete product workflows and qualities that need human judgment or a real browser. These include usability, Arabic RTL presentation, responsive behavior, accessibility, browser differences, files, print/PDF output, exploratory testing, and production smoke verification. It is not a substitute for automated regression coverage.

Use the relevant parts of this plan rather than executing every case for every change. For a formal Milestone 6 or release pass, record the actual result, tester, date, environment, browser, viewport, and useful evidence such as screenshots, video, downloads, or network responses.

### When manual testing happens

- **Feature development:** run focused checks for the changed workflow, important user-visible states, and affected RTL/responsive behavior.
- **Bug fixes:** reproduce the problem manually when relevant, verify the fix, and check nearby behavior that may share the failure.
- **Milestone 6:** run the broader Version 2 workflow, responsive, accessibility, browser, security-state, file/print/PDF, offline, and deployment-readiness checks in this plan.
- **Before production:** perform the release regression and smoke pass after automated checks and the critical E2E suite are complete.
- **After production:** use focused verification for real defects, environment/browser-specific issues, and newly introduced workflows.

### Implemented-scope guardrails

Do not mark these as failures because they are not current frontend workflows: public self-registration, organization settings/user-management screens, task recurrence controls or task associations, offline synchronization, reservations/online booking, vehicle sales, notification delivery, a standalone payment-entry page, a platform-admin UI, or a PDF reporting service. Payments are recorded from Rental Detail. Rental contracts support printable HTML, PDF download, and signed-document handling. Offline checks are finalized and executed with the Milestone 6 implementation rather than assumed now.

### Common expected UI standards

- Arabic RTL interface, IBM Plex Sans Arabic, English/Western numerals, USD values, and `DD-MM-YYYY` dates; date-time is `DD-MM-YYYY — HH:MM AM/PM`.
- Vehicle names and plates remain English/Western. Vehicle badges: Available green, Rented/Reserved light blue, Maintenance amber, Out of Service red; text and color always appear together.
- Loading, unavailable, empty, zero, error, submitting, and permission-denied states must be truthful and understandable; unavailable data must not masquerade as zero.
- Deletion is owner-only and is soft deletion: the record should disappear from normal lists, not expose data from another organization.

## 2. Test environment and controlled data

### Required setup

| Item        | Requirement                                                                                                                                                                                                |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Environment | Development, test, staging, or designated release-test environment with disposable data; never use production data for destructive QA.                                                                     |
| Services    | Running API, web app, database, and configured file storage. Confirm `/healthz` before testing.                                                                                                            |
| Browsers    | Current Chrome/Chromium is primary. During production-readiness testing, repeat browser-sensitive critical paths in Firefox and Safari where those browsers are available and supported by the deployment. |
| Viewports   | Approved review widths: 375px, 768px, 1024px, 1440px, and 1920px. Test browser zoom at 100%.                                                                                                               |
| Tools       | Browser DevTools Network and Console; download folder; a valid small PDF/JPEG/PNG; an invalid file type; an over-10 MB test file.                                                                          |
| Data safety | Use realistic but non-sensitive customer, vehicle, payment, and file data. Never enter real credentials, identity documents, or customer information.                                                      |
| Reset       | Snapshot/reset disposable data before each cross-module workflow, or use the unique prefix `QA-M6-<date>-<tester>`. Clean created records and storage objects when complete.                               |

### Test accounts

Provision these accounts through supported environment setup/API seeding; public registration is not a current web route.

| Account      | Organization | Role       | Use                                                                       |
| ------------ | ------------ | ---------- | ------------------------------------------------------------------------- |
| `owner-a`    | QA Rental A  | `OWNER`    | Main business-owner workflow and permitted mutations.                     |
| `employee-a` | QA Rental A  | `EMPLOYEE` | Verify authenticated reads and absence/rejection of owner-only mutations. |
| `owner-b`    | QA Rental B  | `OWNER`    | Tenant-isolation checks using known IDs/URLs from Organization B.         |

### Minimum seed data

Prepare Organization A with the following, using unique names/plates. Keep IDs in the test run sheet.

| Data                  | Required state                                                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Customers             | One complete customer with a document, one customer with rental history, and one duplicate-ID/license candidate.                                    |
| Vehicles              | Available V1; Available V2; Reserved V3; Rented V4; Maintenance V5; Out of Service V6; one vehicle with photos/documents/history.                   |
| Rentals               | Reserved, Active, Returned, Cancelled, and a rental with no payment/one with partial payment. Ensure one future rental conflicts with an extension. |
| Maintenance           | Scheduled, In Progress, Completed; one with vendor, cost, notes, and replaced parts.                                                                |
| Expenses              | Vehicle-linked and organization-level expenses in current and prior report periods.                                                                 |
| Tasks                 | Pending future, pending overdue, and completed tasks.                                                                                               |
| Analytics/report data | Payments and expenses spanning at least two months/years, completed maintenance cost, and a vehicle profitability ranking.                          |
| Organization B        | At least one customer, vehicle, rental, maintenance record, expense, task, and payment.                                                             |

## 3. Sequential smoke tests

| Test ID | Feature                 | Preconditions       | Steps                                                                                     | Expected result                                                                                                                                |
| ------- | ----------------------- | ------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| SMK-01  | Service availability    | QA services running | Open `/healthz`; open the web URL.                                                        | Health response succeeds; application loads without a blank screen.                                                                            |
| SMK-02  | Owner sign-in and shell | `owner-a` available | Sign in; visit Dashboard.                                                                 | Dashboard loads in the authenticated app shell with no console error.                                                                          |
| SMK-03  | Primary navigation      | Signed in as owner  | Open every visible primary module from navigation.                                        | Dashboard, Vehicles, Customers, Rentals, Maintenance, Expenses, Tasks, Analytics, and Reports are reachable and show the correct active route. |
| SMK-04  | Core record drill-down  | Seed IDs available  | Open one record each from Vehicles, Customers, Rentals, Maintenance, Expenses, and Tasks. | Correct detail page opens; no unrelated record appears.                                                                                        |
| SMK-05  | Global failure safety   | Signed in           | In DevTools set Offline, then load one list; restore network and retry.                   | A readable error/retry state appears; no misleading data is written or shown as success.                                                       |

## 4. Authentication and authorization

| Test ID | Feature              | Preconditions               | Steps                                                                                                                            | Expected result                                                                                                           |
| ------- | -------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| AUTH-01 | Valid login          | `owner-a` credentials       | Open Login; enter valid credentials; submit.                                                                                     | Redirected to Dashboard; authenticated navigation is visible.                                                             |
| AUTH-02 | Login validation     | Login page                  | Submit once with missing or visibly invalid input.                                                                               | Clear field-level Arabic validation is visible; no request succeeds. Exhaustive validation combinations remain automated. |
| AUTH-03 | Invalid credentials  | Login page                  | Use a valid-looking unknown email/password.                                                                                      | Login is rejected with readable feedback; no session is created.                                                          |
| AUTH-04 | Session persistence  | Signed in as owner          | Refresh, open a new tab, and navigate to Dashboard.                                                                              | Session remains valid until logout/expiry; no login loop.                                                                 |
| AUTH-05 | Protected route      | Signed out                  | Directly open a protected route and a full-screen create route.                                                                  | Redirected to Login; protected content/data is not briefly exposed.                                                       |
| AUTH-06 | Logout               | Signed in                   | Use desktop logout and mobile-drawer logout. Then use Back/direct URL.                                                           | Returns to Login; protected routes remain inaccessible.                                                                   |
| AUTH-07 | Owner permissions    | Signed in as `owner-a`      | Verify representative create, edit, lifecycle, and delete controls across critical modules.                                      | Owner can use the supported operations and receives clear confirmation for consequential actions.                         |
| AUTH-08 | Employee permissions | `employee-a` provisioned    | Sign in; view supported records and attempt one representative owner-only UI operation.                                          | Supported reads work; owner-only controls are absent/disabled or the request is forbidden; no mutation occurs.            |
| AUTH-09 | Tenant isolation     | `owner-b` records/IDs known | While signed in as `owner-a`, open Organization B record URLs and use a B ID in any selectable relation only if safely testable. | Not-found/forbidden response; Organization B data never appears in A lists, details, analytics, or reports.               |

## 5. Dashboard

| Test ID | Feature              | Preconditions                                        | Steps                                                                                              | Expected result                                                                                                                                                        |
| ------- | -------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DASH-01 | Operational overview | Mixed seed data                                      | Open Dashboard.                                                                                    | Urgent returns/alerts, active rentals, fleet status, financial summary, outstanding balances, tasks, and recent activity/shortcuts render only when supported by data. |
| DASH-02 | Fleet counts         | Vehicles in each state                               | Compare Dashboard counts with Vehicles list.                                                       | Available, rented/reserved, maintenance, and out-of-service counts match visible source records.                                                                       |
| DASH-03 | Return urgency       | Active overdue/today/upcoming rentals                | Compare alert labels with rental dates.                                                            | Overdue/today/upcoming urgency is accurate and actionable links lead to the relevant rental/module.                                                                    |
| DASH-04 | Financial figures    | Payments and expenses in current period              | Compare revenue, expenses, net profit, and outstanding amounts with Analytics/Reports source data. | USD amounts and Western numerals are consistent; net profit is revenue minus Expenses only.                                                                            |
| DASH-05 | Dashboard updates    | Record baseline values                               | Create/complete a controlled task, record a payment, and refresh Dashboard.                        | Related counts/alerts/financial summaries update after query refresh; no stale or duplicate cards.                                                                     |
| DASH-06 | Data states          | Ability to use empty org and offline/network failure | Test initial load, an empty organization, and failed request.                                      | Skeleton/loading, useful empty, and retryable error states are distinct; no false zero KPI during load/error.                                                          |

## 6. Customers

| Test ID | Feature              | Preconditions                      | Steps                                                                                                           | Expected result                                                                                                                              |
| ------- | -------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| CUS-01  | List, search, detail | Multiple customers seeded          | Search by name, phone, national ID/license where displayed; open a result.                                      | Matching records only; clear no-results state; detail corresponds to selected customer.                                                      |
| CUS-02  | Create customer      | Owner; unique identity values      | Add customer with all required identity, contact, address, and license fields.                                  | Success feedback; customer appears in list and is selectable in New Rental.                                                                  |
| CUS-03  | Customer validation  | Owner on Add Customer              | Try representative missing/invalid input and one duplicate identity value.                                      | Field/API feedback is readable and no invalid or duplicate record is created. Exhaustive cases remain automated.                             |
| CUS-04  | Edit customer        | Existing customer                  | Change phone/address/license expiry; save; refresh/detail/list.                                                 | New values persist everywhere used; unrelated identity/rental history remains intact.                                                        |
| CUS-05  | Customer history     | Customer with rentals              | Open Rental History; search/filter if present; open a rental.                                                   | Only that customer’s rentals are shown; status, vehicle, dates, amounts, and navigation are correct.                                         |
| CUS-06  | Customer documents   | Disposable customer and test files | Upload valid document; open/download it; delete with confirmation. Test invalid type/oversize where UI permits. | Valid document is listed and retrievable; invalid upload shows error; deletion removes it from normal list without affecting another record. |
| CUS-07  | Customer states      | Empty organization/network failure | Test empty, loading, and request failure.                                                                       | Clear localized state and retry behavior; no fake customer data.                                                                             |

## 7. Vehicles

| Test ID | Feature            | Preconditions                             | Steps                                                                                                        | Expected result                                                                                                                     |
| ------- | ------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| VEH-01  | List/search/status | Vehicles in every status                  | Search make/model/plate; inspect badges; open detail.                                                        | Correct matches; English vehicle identity/plate and approved semantic status badge; no awkward truncation.                          |
| VEH-02  | Add vehicle        | Owner; unique plate                       | Add full vehicle data including make/model, plate, year, color, transmission, fuel, seats, mileage, status.  | Vehicle persists, has correct default/selected status, and is visible in fleet/list.                                                |
| VEH-03  | Vehicle validation | Owner on Add/Edit                         | Try representative missing/invalid input and a duplicate plate.                                              | Validation/error feedback is clear and no invalid or duplicate vehicle is saved.                                                    |
| VEH-04  | Edit/status        | Disposable Available vehicle              | Edit details and, where current form permits, status/mileage.                                                | Values persist; displayed status and fleet count update consistently.                                                               |
| VEH-05  | Detail/history     | Vehicle with rentals/maintenance/expenses | Inspect summary, rental history, maintenance history, expense/history sections and linked detail navigation. | Only selected vehicle’s associated data appears; amounts/dates/statuses are correct.                                                |
| VEH-06  | Media/documents    | Disposable vehicle/files                  | Upload/view/delete photo; upload/download/delete valid registration/insurance/other document.                | Media is correctly scoped to vehicle; controls report loading/error; deletion confirmation does not affect other files.             |
| VEH-07  | Rental eligibility | V5/V6/archived vehicle and date range     | Attempt to select each in New Rental/availability flow.                                                      | Maintenance, out-of-service, and archived vehicles are not rentable; available vehicle is offered only when dates have no conflict. |

## 8. Rentals and contracts

| Test ID | Feature                    | Preconditions                                         | Steps                                                                                                 | Expected result                                                                                                                              |
| ------- | -------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| REN-01  | List/search/filter         | Rentals in all statuses                               | Search customer/vehicle; use status filters; open a row/card.                                         | Results and status/balance/date fields are correct; desktop table/tablet hybrid/mobile card is usable.                                       |
| REN-02  | Create reserved rental     | Owner, available vehicle, customer                    | Create rental with valid pickup/return, daily rate, total, and deposit.                               | Rental is `RESERVED`; vehicle becomes `RESERVED`; detail/list/dashboard reflect it.                                                          |
| REN-03  | Create validation          | New Rental                                            | Try one missing required input and a return time that is not after pickup.                            | Clear validation is shown and no rental is created. Detailed validation combinations remain automated.                                       |
| REN-04  | Double-booking prevention  | Existing reserved/active rental on same vehicle       | Request overlapping dates for same vehicle.                                                           | Availability signals conflict and submission is rejected; existing rental unchanged.                                                         |
| REN-05  | Availability presentation  | Available and blocked vehicles                        | Change dates and inspect vehicle selection.                                                           | Only period-available operational vehicles are offered; controls, chevrons, mixed-direction vehicle values, and dates remain legible in RTL. |
| REN-06  | Pickup transition          | Reserved rental                                       | Use Pickup with an actual pickup time.                                                                | Rental becomes `ACTIVE`, actual pickup is shown, vehicle becomes `RENTED`, and pickup is no longer offered.                                  |
| REN-07  | Return transition          | Active rental                                         | Use Return with an actual return time.                                                                | Rental becomes `RETURNED`, actual return is shown, vehicle returns to `AVAILABLE` when no blocker remains, and return is no longer offered.  |
| REN-08  | Extend rental              | Reserved/active rental and conflicting future rental  | Extend to a later non-conflicting date, then try one conflicting date.                                | Valid extension persists; conflict is explained without changing the saved date. Detailed date boundaries remain automated.                  |
| REN-09  | Cancel rental              | Reserved rental                                       | Cancel after reading and accepting the confirmation.                                                  | Rental becomes `CANCELLED`, the vehicle is released when no blocker remains, and cancellation is no longer offered.                          |
| REN-10  | Rental detail composition  | Rental with payment/customer/vehicle                  | Inspect header, customer/vehicle context, dates, pricing, payment history, actions, related activity. | Statuses remain distinct; financial amounts appear in Pricing & Payments, not duplicated in action panel.                                    |
| REN-11  | Contract lifecycle         | Reserved or active rental                             | Generate contract; open printable action; download PDF; refresh; attempt generate again.              | One contract is generated; printable content opens, PDF downloads, duplicate generation is rejected/disabled.                                |
| REN-12  | Signed contract files      | Rental with generated contract                        | Upload valid PDF/JPEG/PNG; download; delete; try invalid type and >10 MB file.                        | Valid file is listed/downloadable; invalid uploads fail clearly; delete removes only selected signed document.                               |
| REN-13  | Contract eligibility/state | Returned/cancelled rental and rental without contract | Attempt contract action/print/PDF/signed-doc action where exposed.                                    | Unsupported status/missing contract is handled without broken UI or false success; expected missing-contract response is understandable.     |

## 9. Payments (rental-contextual)

| Test ID | Feature                      | Preconditions                         | Steps                                                            | Expected result                                                                                                                                          |
| ------- | ---------------------------- | ------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PAY-01  | First partial payment        | Rental total greater than payment     | In Rental Detail record a valid cash payment smaller than total. | Payment history adds amount/date/method; paid and outstanding balances recalculate accurately.                                                           |
| PAY-02  | Multiple methods/payments    | Rental with partial payment           | Add CARD, TRANSFER, and OTHER payments on different dates.       | Each row shows correct USD amount, Western date/time, and localized method; outstanding reflects sum of all valid payments.                              |
| PAY-03  | Payment validation           | Owner, rental detail                  | Try one missing field and one invalid amount.                    | Inline validation prevents the request; representative backend failure is shown without false success. Exhaustive financial edge cases remain automated. |
| PAY-04  | Paid state                   | Rental with a partial balance         | Record the remaining valid payment.                              | Paid/in-full state is clear and the visible outstanding balance reaches zero consistently.                                                               |
| PAY-05  | Payment authorization/states | Non-owner and offline/network failure | View payment section as non-owner; simulate failed load/create.  | Non-owner cannot record payment; loading/error/empty state is distinct and retryable; history remains rental-scoped.                                     |

## 10. Maintenance

| Test ID | Feature                     | Preconditions                           | Steps                                                                              | Expected result                                                                                                                          |
| ------- | --------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| MNT-01  | List/filter/detail          | Scheduled/In Progress/Completed records | Filter/search if present and open each record.                                     | Vehicle, type, date, status, vendor/cost, and derived overdue/upcoming label are accurate.                                               |
| MNT-02  | Create maintenance          | Owner and vehicle                       | Add maintenance with type, date, vendor, notes, optional cost, and replaced parts. | Created as `SCHEDULED`; vehicle history/list displays it.                                                                                |
| MNT-03  | Maintenance validation      | Add/edit form                           | Try representative missing input and one invalid cost or replaced-part value.      | Readable validation/API feedback appears and no invalid record is created.                                                               |
| MNT-04  | Update lifecycle            | Scheduled record                        | Update to `IN_PROGRESS` and inspect available actions.                             | The valid transition persists, vehicle availability reflects the workflow, and invalid lifecycle actions are not offered.                |
| MNT-05  | Complete maintenance        | Non-completed record                    | Complete with a final non-negative cost; refresh Vehicle Detail/Analytics/Reports. | Record becomes `COMPLETED`, completion timestamp/cost persists, resulting vehicle state is correct, and completion is no longer offered. |
| MNT-06  | Completed record protection | Completed record                        | Attempt edit/update/delete according to current owner UI.                          | UI follows role/allowed actions; completed record cannot be changed through update workflow.                                             |
| MNT-07  | Maintenance states          | Empty data/network failure              | Test list/detail loading, no records, and failed request.                          | Correct loading/empty/error feedback, without fake cost/status.                                                                          |

## 11. Expenses

| Test ID | Feature                  | Preconditions                           | Steps                                                                                                                       | Expected result                                                                                                                               |
| ------- | ------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| EXP-01  | List/search/filter       | Vehicle and organization expenses       | Search by description/vehicle/category; use category filter; open detail.                                                   | Correct filtered records; category label, USD amount, and date are clear.                                                                     |
| EXP-02  | Organization expense     | Owner                                   | Add an expense without vehicle association.                                                                                 | Expense saves and detail/list omit vehicle relationship cleanly.                                                                              |
| EXP-03  | Vehicle-linked expense   | Owner and vehicle                       | Add expense linked to vehicle; open related vehicle/detail.                                                                 | Association persists and related vehicle is identifiable/navigable where supported.                                                           |
| EXP-04  | Expense validation       | Add Expense                             | Try representative missing input and an invalid amount.                                                                     | Clear feedback appears and no invalid expense is created. Tenant relationship enforcement remains primarily an integration test plus AUTH-09. |
| EXP-05  | Edit/delete              | Disposable expense, owner               | Edit category/amount/date/description/vehicle association; remove association if UI supports it; delete after confirmation. | Changes persist; deletion removes from normal list and later summaries after refresh.                                                         |
| EXP-06  | Expense financial impact | Record baseline analytics/report values | Add dated expense in selected period, then refresh Analytics and Reports.                                                   | Expenses and net profit update; maintenance cost remains separate from Expenses.                                                              |
| EXP-07  | Expense states           | Empty/error conditions                  | Test loading, empty list/no-filter-result, and network error.                                                               | Distinct useful states; no misleading zero during loading/error.                                                                              |

## 12. Tasks

| Test ID | Feature                   | Preconditions                            | Steps                                                                                  | Expected result                                                                                                  |
| ------- | ------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| TSK-01  | List/search/status        | Pending future, overdue, completed tasks | Search notes; filter All/Pending/Completed; open detail.                               | Search and filters combine correctly; overdue/upcoming is presentation-only and not confused with stored status. |
| TSK-02  | Create task               | Owner                                    | Create with due date and optional notes.                                               | New task is `PENDING`, appears in list/Dashboard reminder context.                                               |
| TSK-03  | Task validation           | Add Task                                 | Submit without due date; test server/network error.                                    | Field message/error feedback; no false success.                                                                  |
| TSK-04  | Update task               | Pending task                             | Edit due date/notes through current detail action.                                     | Changes persist without changing status.                                                                         |
| TSK-05  | Complete task             | Pending task                             | Complete it; refresh list/detail/Dashboard.                                            | Status becomes `COMPLETED` and the completion action is no longer available.                                     |
| TSK-06  | Task authorization/delete | Non-owner and disposable owner task      | Verify non-owner cannot create/edit/complete/delete; owner deletes after confirmation. | Permissions enforced; deleted task disappears from normal results.                                               |
| TSK-07  | Task states               | Empty/error conditions                   | Test no tasks, no search matches, loading, and API error.                              | Appropriate state and retry; no generic or misleading output.                                                    |

## 13. Analytics

| Test ID | Feature               | Preconditions                              | Steps                                                                                       | Expected result                                                                                                                           |
| ------- | --------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| ANL-01  | Period controls       | Multi-period data                          | Change available year/period controls and return to original.                               | Control text/chevron is RTL-safe; data and labels update to selected period only.                                                         |
| ANL-02  | Financial definitions | Known seeded figures                       | Independently sum payment dates and expense dates for selected period.                      | Revenue uses payments; expenses use Expense records; net profit = revenue − expenses; maintenance cost is displayed separately.           |
| ANL-03  | Trends/charts         | Monthly data spanning selected year        | Inspect first/middle/last months at desktop and mobile.                                     | Chart values/labels are legible, edge labels are not clipped, and lines/points do not cover labels.                                       |
| ANL-04  | Vehicle insight       | Vehicle with revenue, expense, maintenance | Verify profitability name, secondary plate, revenue/expense/maintenance values and ranking. | Vehicle title does not concatenate raw IDs/plate; formula reflects payment revenue minus vehicle expenses and completed maintenance cost. |
| ANL-05  | Outstanding insight   | Multiple partial/unpaid rentals            | Compare customer/total outstanding with rental payment sections.                            | Positive balances and totals agree; summary total is visually connected to its list.                                                      |
| ANL-06  | Analytics states      | Empty year and failed request              | Choose no-activity period; simulate failure/loading.                                        | Empty/loading/error states are explicit; no fabricated trend/KPI zero while loading/error.                                                |

## 14. Reports

| Test ID | Feature             | Preconditions                    | Steps                                                                                                                                  | Expected result                                                                                                                                                  |
| ------- | ------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RPT-01  | Period selector     | Data across month/quarter/year   | Switch each supported type/value.                                                                                                      | Period label and all report cards/rows represent only that inclusive period convention.                                                                          |
| RPT-02  | Report calculations | Known seeded figures             | Independently compare selected report period: revenue, expenses, net profit, maintenance cost, rental/payment/maintenance/task counts. | Values use correct dates: payments by payment date, expenses by expense date, rentals by creation, maintenance by maintenance date, completed tasks by due date. |
| RPT-03  | Report content      | Non-empty period                 | Inspect summary, section rows and totals.                                                                                              | Hierarchy is readable; totals belong to the section they summarize; no mobile-cramped table.                                                                     |
| RPT-04  | CSV export          | Non-empty period/download folder | Select period; export CSV; open downloaded file.                                                                                       | Download succeeds; filename/contents match selected report and values/escaping are usable in spreadsheet software.                                               |
| RPT-05  | Printable report    | Popup allowed                    | Select period; use Print/Printable action; inspect print-preview/new tab.                                                              | Self-contained RTL report opens with content, selected period, and correct figures; browser print works.                                                         |
| RPT-06  | Reports states      | Empty period/loading/error       | Choose period without activity; simulate load failure.                                                                                 | Empty state is clear; loading/error does not present misleading figures; retry works where shown.                                                                |

## 15. Cross-module manual workflows

Use these workflows for release reconciliation and exploratory review. If the equivalent automated E2E scenario passes, do not repeat every mechanical step unnecessarily; manually inspect the cross-module, visual, and business effects that still require judgment.

| Test ID | Feature                            | Preconditions                              | Steps                                                                                                                                                                                                   | Expected result                                                                                                                                                                                    |
| ------- | ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FLOW-01 | Full rental lifecycle              | Owner; clean V1 and new customer values    | 1. Create customer. 2. Add V1 if needed. 3. Create a future rental. 4. Confirm reservation state. 5. Generate contract. 6. Pick up. 7. Record partial payment. 8. Extend if non-conflicting. 9. Return. | Customer/vehicle/rental histories link correctly; statuses progress `RESERVED` → `ACTIVE` → `RETURNED`; vehicle becomes available when no blocker remains; payment and contract remain associated. |
| FLOW-02 | Maintenance availability lifecycle | Owner; available disposable vehicle        | 1. Create maintenance. 2. Move to In Progress. 3. Confirm rental availability is blocked. 4. Complete with cost. 5. Inspect vehicle and Dashboard.                                                      | Maintenance history and cost persist; only allowed transitions appear; fleet and availability presentation reflect the final server state.                                                         |
| FLOW-03 | Expense to business insight        | Owner; baseline period metrics             | 1. Add a vehicle-linked expense dated in the selected period. 2. Refresh Dashboard, Analytics, Reports. 3. Open vehicle history.                                                                        | Expense appears in expense/vehicle views and reduces net profit; it does not become maintenance cost.                                                                                              |
| FLOW-04 | Partial payments/outstanding       | Reserved or active rental with known total | Record representative partial payments and compare Rental Detail, Dashboard, Analytics outstanding data, and Reports revenue for their payment dates.                                                   | Balance falls by each valid amount; revenue appears in the payment-date period; no duplicate payment or negative displayed balance appears.                                                        |
| FLOW-05 | Operational dashboard reaction     | Baseline values recorded                   | Perform representative rental, task, maintenance, payment, and expense changes; refresh Dashboard after each relevant group.                                                                            | Alerts, fleet counts, tasks, balances, and financial cards change coherently without unrelated metric changes.                                                                                     |
| FLOW-06 | Isolation workflow                 | Two organizations seeded                   | Compare representative list/detail/report results in A and B; try an A record URL while signed into B.                                                                                                  | Each organization sees only its own data, histories, financials, documents, and exports.                                                                                                           |

## 16. Responsive and UI verification checklist

Review the shared shell, navigation, and critical layouts at all five target widths. Use representative list, detail, form, dashboard, analytics, and report pages at relevant mobile, tablet, and desktop widths rather than repeating every workflow five times. When a layout changes, focus regression on the affected widths.

| Test ID | Feature                      | Preconditions                      | Steps                                                                                                                                                    | Expected result                                                                                                                                                                        |
| ------- | ---------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RWD-01  | 375 mobile                   | Signed in, populated data          | Review the shell, bottom navigation, More drawer, and representative critical list/detail/form pages.                                                    | No horizontal scroll; structured cards/forms stack; all modules/logout remain reachable; targets are usable.                                                                           |
| RWD-02  | 768 tablet                   | Signed in                          | Review rail/drawer state and dense lists.                                                                                                                | Tablet navigation is intentional; content does not resemble squeezed desktop/mobile; no overlapping controls.                                                                          |
| RWD-03  | 1024 small laptop            | Signed in                          | Review sidebar transition, tables, detail panels, forms, charts.                                                                                         | Desktop hierarchy begins cleanly; data remains readable without clipped actions.                                                                                                       |
| RWD-04  | 1440 desktop                 | Signed in                          | Review dashboard density, full sidebar, wide data lists, reports.                                                                                        | Available width is used effectively; not a stretched mobile card stack.                                                                                                                |
| RWD-05  | 1920 wide desktop            | Signed in                          | Repeat data-rich pages.                                                                                                                                  | Controlled content width, no excessive empty space, no document/main-content overflow.                                                                                                 |
| UI-01   | Arabic RTL and mixed content | Representative populated pages     | Inspect realistic long Arabic names/notes/addresses, navigation direction, directional icons, labels, plates, phone numbers, IDs, dates, and USD values. | Arabic renders naturally; logical start/end alignment and directional icons are correct; mixed Arabic/Latin values remain readable; long content does not overlap or break the layout. |
| UI-02   | States and actions           | Representative lists/forms/details | Trigger loading, empty, zero, unavailable, error, submitting, permission-denied, disabled, and destructive states where relevant and safe.               | The product distinguishes the states truthfully, provides understandable Arabic feedback and recovery, and prevents duplicate or accidental destructive actions.                       |

## 17. Accessibility and keyboard checklist

| Test ID | Feature                     | Preconditions                                       | Steps                                                                                                                                 | Expected result                                                                                                           |
| ------- | --------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A11Y-01 | Keyboard navigation         | Desktop and mobile emulation                        | Use the skip link, then Tab/Shift+Tab across login, navigation, filters, forms, dialogs/drawers, and critical rental/payment actions. | Skip link reaches main content; logical RTL focus order and visible focus remain; no keyboard trap occurs.                |
| A11Y-02 | Drawer/dialog focus         | Mobile More drawer and destructive confirmation     | Open by keyboard; use Escape; tab through controls.                                                                                   | Focus moves into overlay and returns to trigger on close; Escape closes supported overlay.                                |
| A11Y-03 | Form semantics              | Representative critical and changed forms           | Inspect labels, required markers, errors, and select controls with keyboard/accessibility tree.                                       | Every reviewed control has an accessible name; errors are associated and readable; required inputs are clear.             |
| A11Y-04 | Navigation semantics        | All shell modes                                     | Inspect active link and icon-only rail/bottom controls.                                                                               | Active route is visually and semantically identified; icon-only controls have accessible labels.                          |
| A11Y-05 | Contrast, touch, and motion | Badges, alerts, controls, charts, mobile navigation | Inspect normal/high-contrast behavior where available, touch-target usability, status cues, and reduced-motion preference.            | Text/focus remain legible; status is not color-only; targets are usable; essential information does not depend on motion. |

## 18. Browser console, network, and regression checklist

| Test ID | Feature                     | Preconditions                     | Steps                                                                                                                                                                                                      | Expected result                                                                                                                                                     |
| ------- | --------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REG-01  | Console health              | DevTools open                     | Execute smoke and E2E paths; review Console.                                                                                                                                                               | No new uncaught errors, React warnings, or failed resource errors. Document expected, understood logs separately.                                                   |
| REG-02  | Request health              | DevTools Network open             | Perform create/update/pickup/return/payment/export/file actions.                                                                                                                                           | Requests have expected success/error status; no duplicate mutation request; response errors surface in UI.                                                          |
| REG-03  | Contract 404 review         | Rental without generated contract | Open rental detail and contract area.                                                                                                                                                                      | A missing contract is handled as a visible supported state, not a broken page. Record any signed-contract/contract 404 with its user impact for Milestone 6 triage. |
| REG-04  | Refresh/back behavior       | Critical flows completed          | Refresh list/detail after mutation; use Back from detail/create flow.                                                                                                                                      | Saved state persists, no duplicate submission, route history remains understandable.                                                                                |
| REG-05  | Cross-browser critical flow | Primary Chromium pass complete    | In Firefox and Safari where supported/available, repeat critical auth/rental behavior and browser-sensitive navigation, forms, dialogs/sheets, files, print/PDF, and offline/storage behavior that exists. | Same business outcome and no browser-specific blocker; differences are recorded with browser/version and severity.                                                  |

## 19. Offline verification for Milestone 6

Offline synchronization is not currently an implemented frontend workflow. Finalize this checklist alongside its Milestone 6 architecture and supported operations; do not assume queue UI, writable entities, or conflict policy before implementation.

For each supported offline workflow, verify the implemented version of:

```text
authenticated online state
→ synchronize known data
→ disconnect
→ view/search or change supported data
→ observe truthful queued/offline feedback
→ reconnect and synchronize
→ verify final UI and server state
```

The focused checklist should cover previously synchronized data, supported offline search and create/edit actions, reconnect behavior, sync success/failure feedback, implemented conflict recovery, and prevention of duplicate records. Use two clients only if the final conflict policy requires it.

## 20. Release blockers and final verification

The following failures block release until fixed or explicitly resolved through the release decision:

- cross-tenant data or file exposure;
- broken authentication, protected access, or role authorization;
- incorrect rental or vehicle lifecycle state;
- incorrect payment, balance, revenue, expense, or profit values;
- data corruption, unintended loss, or duplicate financial/business mutations;
- a broken core customer-to-rental-to-return workflow;
- serious offline synchronization corruption once offline is implemented;
- a critical workflow that is inaccessible or unusable by keyboard or touch;
- production startup, deployment, health, or primary-navigation failure.

Visual polish, minor copy, and non-critical responsive issues are triaged by severity and business impact rather than automatically blocking release.

Use this release sequence:

```text
automated checks pass
→ critical E2E suite passes when available
→ focused manual workflow regression
→ responsive, RTL, accessibility, browser, file, and print/PDF checks
→ offline verification where implemented
→ deployment/staging smoke check
→ production smoke verification
```

Production smoke verification must be non-destructive unless an explicitly approved disposable production test account and cleanup process exist.

Release only when all applicable Critical workflow and smoke tests pass, and every failure has a documented disposition.

- [ ] QA environment, test accounts, seed data, and evidence are recorded.
- [ ] SMK, AUTH, DASH, CUS, VEH, REN, PAY, MNT, EXP, TSK, ANL, and RPT suites executed.
- [ ] Applicable FLOW-01 through FLOW-06 reconciliation checks completed from a clean/resettable dataset; mechanical steps already proven by E2E were not duplicated without reason.
- [ ] Shared navigation and critical layouts reviewed at all five widths; representative workflows pass at relevant mobile/tablet/desktop widths without overflow, clipped controls, unreachable actions, or excessive stretching.
- [ ] Accessibility keyboard/focus/labels/contrast/touch/reduced-motion checks pass or have approved remediation.
- [ ] CSV and printable Reports exports verified in a real browser; contract print/PDF and signed-document workflow verified.
- [ ] Representative photo/document upload, open/download, delete, and understandable missing-file behavior verified with controlled test storage.
- [ ] Console and Network reviewed; unexpected errors are fixed or accepted as documented Milestone 6 follow-up.
- [ ] Tenant isolation and non-owner authorization checks pass.
- [ ] Dashboard, Analytics, and Reports calculations reconcile with known seeded payment/expense/maintenance data.
- [ ] Offline workflow checks pass where implemented, including final synchronized state and duplicate prevention.
- [ ] Staging/deployment smoke passes; production health, login, shell, and primary navigation pass non-destructively.
- [ ] Regression evidence and final defect list are attached to the release decision.

## 21. Related testing documents

- [`testing-strategy.md`](./testing-strategy.md) defines the overall risk-based testing approach and sufficient confidence.
- [`automated-test-plan.md`](./automated-test-plan.md) defines lower-level automated coverage, environments, and commands.
- [`e2e-test-plan.md`](./e2e-test-plan.md) defines the small set of critical workflows intended for browser automation during Milestone 6.

This plan owns human product verification. It should reference rather than duplicate exhaustive automated edge cases or E2E implementation details.
