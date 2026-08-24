# Vehicle Rental Platform — Manual QA Test Plan

## 1. Purpose and execution rules

This plan is the pre-Milestone 6 manual acceptance test for the implemented Arabic-first Vehicle Rental Platform. Execute it in order with a disposable, isolated QA environment. It is written for a rental-business owner: verify the result that is visible in the application as well as the business effect in the related module.

Record the actual result, tester, date, browser, viewport, and evidence (screenshot/video/network response) beside every test. A failed **Critical workflow** test blocks release; a failed visual, accessibility, or responsive test is triaged by severity before release.

### Implemented-scope guardrails

Do not mark these as failures because they are not current frontend workflows: public self-registration, settings/user-management screens, task recurrence or task associations, offline synchronization, reservations/online booking, vehicle sales, notification delivery, a standalone payment-entry page, or a PDF reporting service. Payments are recorded from Rental Detail. Rental contracts support printable HTML, PDF download, and signed-document handling.

### Common expected UI standards

- Arabic RTL interface, IBM Plex Sans Arabic, English/Western numerals, USD values, and `DD-MM-YYYY` dates; date-time is `DD-MM-YYYY — HH:MM AM/PM`.
- Vehicle names and plates remain English/Western. Vehicle badges: Available green, Rented/Reserved light blue, Maintenance amber, Out of Service red; text and color always appear together.
- Loading must not masquerade as zero data. Empty/error states must explain the state and expose retry where supported.
- Deletion is owner-only and is soft deletion: the record should disappear from normal lists, not expose data from another organization.

## 2. Test environment and controlled data

### Required setup

| Item | Requirement |
| --- | --- |
| Environment | Dedicated QA database and storage bucket/provider; never use production data. |
| Services | Running API, web app, database, and configured file storage. Confirm `/healthz` before testing. |
| Browsers | Latest Chrome/Chromium (primary), Firefox, and Safari where available. Repeat critical flows in one mobile browser/device. |
| Viewports | 375×812, 768×1024, 1024×768, 1440×900, and 1920×1080. Test browser zoom at 100%. |
| Tools | Browser DevTools Network and Console; download folder; a valid small PDF/JPEG/PNG; an invalid file type; an over-10 MB test file. |
| Reset | Snapshot/reset QA data before each end-to-end workflow, or use the unique prefix `QA-M6-<date>-<tester>`. |

### Test accounts

Provision these accounts through supported environment setup/API seeding; public registration is not a current web route.

| Account | Organization | Role | Use |
| --- | --- | --- | --- |
| `owner-a` | QA Rental A | OWNER | Main business-owner workflow and permitted mutations. |
| `manager-a` | QA Rental A | MANAGER | Verify owner-only controls/mutations are unavailable or forbidden. |
| `employee-a` | QA Rental A | EMPLOYEE | Verify least-privilege behavior if provisioned. |
| `owner-b` | QA Rental B | OWNER | Tenant-isolation checks using known IDs/URLs from Organization B. |

### Minimum seed data

Prepare Organization A with the following, using unique names/plates. Keep IDs in the test run sheet.

| Data | Required state |
| --- | --- |
| Customers | One complete customer with a document, one customer with rental history, and one duplicate-ID/license candidate. |
| Vehicles | Available V1; Available V2; Reserved V3; Rented V4; Maintenance V5; Out of Service V6; one vehicle with photos/documents/history. |
| Rentals | Reserved, Active, Returned, Cancelled, and a rental with no payment/one with partial payment. Ensure one future rental conflicts with an extension. |
| Maintenance | Scheduled, In Progress, Completed; one with vendor, cost, notes, and replaced parts. |
| Expenses | Vehicle-linked and organization-level expenses in current and prior report periods. |
| Tasks | Pending future, pending overdue, and completed tasks. |
| Analytics/report data | Payments and expenses spanning at least two months/years, completed maintenance cost, and a vehicle profitability ranking. |
| Organization B | At least one customer, vehicle, rental, maintenance record, expense, task, and payment. |

## 3. Sequential smoke tests

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| SMK-01 | Service availability | QA services running | Open `/healthz`; open the web URL. | Health response succeeds; application loads without a blank screen. |
| SMK-02 | Owner sign-in and shell | `owner-a` available | Sign in; visit Dashboard. | Dashboard loads in the authenticated app shell with no console error. |
| SMK-03 | Primary navigation | Signed in as owner | Open every visible primary module from navigation. | Dashboard, Vehicles, Customers, Rentals, Maintenance, Expenses, Tasks, Analytics, and Reports are reachable and show the correct active route. |
| SMK-04 | Core record drill-down | Seed IDs available | Open one record each from Vehicles, Customers, Rentals, Maintenance, Expenses, and Tasks. | Correct detail page opens; no unrelated record appears. |
| SMK-05 | Global failure safety | Signed in | In DevTools set Offline, then load one list; restore network and retry. | A readable error/retry state appears; no misleading data is written or shown as success. |

## 4. Authentication and authorization

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| AUTH-01 | Valid login | `owner-a` credentials | Open Login; enter valid credentials; submit. | Redirected to Dashboard; authenticated navigation is visible. |
| AUTH-02 | Required login fields | Login page | Submit blank form, then omit one field at a time. | Field-level Arabic validation is visible; no request succeeds. |
| AUTH-03 | Invalid credentials | Login page | Use a valid-looking unknown email/password. | Login is rejected with readable feedback; no session is created. |
| AUTH-04 | Session persistence | Signed in as owner | Refresh, open a new tab, and navigate to Dashboard. | Session remains valid until logout/expiry; no login loop. |
| AUTH-05 | Protected route | Signed out | Directly open a protected route and a full-screen create route. | Redirected to Login; protected content/data is not briefly exposed. |
| AUTH-06 | Logout | Signed in | Use desktop logout and mobile-drawer logout. Then use Back/direct URL. | Returns to Login; protected routes remain inaccessible. |
| AUTH-07 | Owner permissions | Signed in as `owner-a` | Verify create/edit/complete/delete controls in each implemented module. | Owner can use supported operations. |
| AUTH-08 | Non-owner permissions | `manager-a` and/or `employee-a` provisioned | Sign in; attempt an owner-only UI operation and, if safe, direct API/browser request. | Owner-only controls are hidden/disabled or the request is forbidden; no mutation occurs. |
| AUTH-09 | Tenant isolation | `owner-b` records/IDs known | While signed in as `owner-a`, open Organization B record URLs and use a B ID in any selectable relation only if safely testable. | Not-found/forbidden response; Organization B data never appears in A lists, details, analytics, or reports. |

## 5. Dashboard

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| DASH-01 | Operational overview | Mixed seed data | Open Dashboard. | Urgent returns/alerts, active rentals, fleet status, financial summary, outstanding balances, tasks, and recent activity/shortcuts render only when supported by data. |
| DASH-02 | Fleet counts | Vehicles in each state | Compare Dashboard counts with Vehicles list. | Available, rented/reserved, maintenance, and out-of-service counts match visible source records. |
| DASH-03 | Return urgency | Active overdue/today/upcoming rentals | Compare alert labels with rental dates. | Overdue/today/upcoming urgency is accurate and actionable links lead to the relevant rental/module. |
| DASH-04 | Financial figures | Payments and expenses in current period | Compare revenue, expenses, net profit, and outstanding amounts with Analytics/Reports source data. | USD amounts and Western numerals are consistent; net profit is revenue minus Expenses only. |
| DASH-05 | Dashboard updates | Record baseline values | Create/complete a controlled task, record a payment, and refresh Dashboard. | Related counts/alerts/financial summaries update after query refresh; no stale or duplicate cards. |
| DASH-06 | Data states | Ability to use empty org and offline/network failure | Test initial load, an empty organization, and failed request. | Skeleton/loading, useful empty, and retryable error states are distinct; no false zero KPI during load/error. |

## 6. Customers

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| CUS-01 | List, search, detail | Multiple customers seeded | Search by name, phone, national ID/license where displayed; open a result. | Matching records only; clear no-results state; detail corresponds to selected customer. |
| CUS-02 | Create customer | Owner; unique identity values | Add customer with all required identity, contact, address, and license fields. | Success feedback; customer appears in list and is selectable in New Rental. |
| CUS-03 | Customer validation | Owner on Add Customer | Submit empty; use malformed/missing required data; then duplicate national ID and duplicate license number. | Field feedback is readable; duplicates are rejected; no duplicate record is created. |
| CUS-04 | Edit customer | Existing customer | Change phone/address/license expiry; save; refresh/detail/list. | New values persist everywhere used; unrelated identity/rental history remains intact. |
| CUS-05 | Customer history | Customer with rentals | Open Rental History; search/filter if present; open a rental. | Only that customer’s rentals are shown; status, vehicle, dates, amounts, and navigation are correct. |
| CUS-06 | Customer documents | Disposable customer and test files | Upload valid document; open/download it; delete with confirmation. Test invalid type/oversize where UI permits. | Valid document is listed and retrievable; invalid upload shows error; deletion removes it from normal list without affecting another record. |
| CUS-07 | Customer states | Empty organization/network failure | Test empty, loading, and request failure. | Clear localized state and retry behavior; no fake customer data. |

## 7. Vehicles

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| VEH-01 | List/search/status | Vehicles in every status | Search make/model/plate; inspect badges; open detail. | Correct matches; English vehicle identity/plate and approved semantic status badge; no awkward truncation. |
| VEH-02 | Add vehicle | Owner; unique plate | Add full vehicle data including make/model, plate, year, color, transmission, fuel, seats, mileage, status. | Vehicle persists, has correct default/selected status, and is visible in fleet/list. |
| VEH-03 | Vehicle validation | Owner on Add/Edit | Submit missing required fields; duplicate plate; invalid numeric/select values. | Validation/error is clear; duplicate plate is rejected; no invalid vehicle is saved. |
| VEH-04 | Edit/status | Disposable Available vehicle | Edit details and, where current form permits, status/mileage. | Values persist; displayed status and fleet count update consistently. |
| VEH-05 | Detail/history | Vehicle with rentals/maintenance/expenses | Inspect summary, rental history, maintenance history, expense/history sections and linked detail navigation. | Only selected vehicle’s associated data appears; amounts/dates/statuses are correct. |
| VEH-06 | Media/documents | Disposable vehicle/files | Upload/view/delete photo; upload/download/delete valid registration/insurance/other document. | Media is correctly scoped to vehicle; controls report loading/error; deletion confirmation does not affect other files. |
| VEH-07 | Rental eligibility | V5/V6/archived vehicle and date range | Attempt to select each in New Rental/availability flow. | Maintenance, out-of-service, and archived vehicles are not rentable; available vehicle is offered only when dates have no conflict. |

## 8. Rentals and contracts

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| REN-01 | List/search/filter | Rentals in all statuses | Search customer/vehicle; use status filters; open a row/card. | Results and status/balance/date fields are correct; desktop table/tablet hybrid/mobile card is usable. |
| REN-02 | Create reserved rental | Owner, available vehicle, customer | Create rental with valid pickup/return, daily rate, total, and deposit. | Rental is `RESERVED`; vehicle becomes `RESERVED`; detail/list/dashboard reflect it. |
| REN-03 | Create validation | New Rental | Submit missing customer/vehicle/dates/pricing; set return at/before pickup. | Clear validation; no rental is created. |
| REN-04 | Double-booking prevention | Existing reserved/active rental on same vehicle | Request overlapping dates for same vehicle. | Availability signals conflict and submission is rejected; existing rental unchanged. |
| REN-05 | Availability edge cases | Two available vehicles plus blocked states | Change dates and vehicle selection, including boundary dates around an existing rental. | Only period-available operational vehicles are selectable; dropdown text/chevron and dates remain legible in RTL. |
| REN-06 | Pickup transition | Reserved rental | Use Pickup action with actual pickup time. | Rental becomes `ACTIVE`, actual pickup is shown, vehicle becomes `RENTED`; a second pickup is rejected. |
| REN-07 | Return transition | Active rental | Use Return action with actual return time. | Rental becomes `RETURNED`, actual return is shown, vehicle returns to `AVAILABLE` when still rented; second return is rejected. |
| REN-08 | Extend rental | Reserved/active rental and conflicting future rental | Extend to later non-conflicting date; then choose same/earlier date and conflicting date. | Valid extension persists; invalid/non-increasing/conflicting extension is rejected without changing original date. |
| REN-09 | Cancel rental | Reserved rental | Cancel after confirmation; repeat/cancel an active rental. | Reserved rental becomes `CANCELLED` and vehicle returns available; cancellation of non-reserved rental is rejected. |
| REN-10 | Rental detail composition | Rental with payment/customer/vehicle | Inspect header, customer/vehicle context, dates, pricing, payment history, actions, related activity. | Statuses remain distinct; financial amounts appear in Pricing & Payments, not duplicated in action panel. |
| REN-11 | Contract lifecycle | Reserved or active rental | Generate contract; open printable action; download PDF; refresh; attempt generate again. | One contract is generated; printable content opens, PDF downloads, duplicate generation is rejected/disabled. |
| REN-12 | Signed contract files | Rental with generated contract | Upload valid PDF/JPEG/PNG; download; delete; try invalid type and >10 MB file. | Valid file is listed/downloadable; invalid uploads fail clearly; delete removes only selected signed document. |
| REN-13 | Contract eligibility/state | Returned/cancelled rental and rental without contract | Attempt contract action/print/PDF/signed-doc action where exposed. | Unsupported status/missing contract is handled without broken UI or false success; expected missing-contract response is understandable. |

## 9. Payments (rental-contextual)

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| PAY-01 | First partial payment | Rental total greater than payment | In Rental Detail record a valid cash payment smaller than total. | Payment history adds amount/date/method; paid and outstanding balances recalculate accurately. |
| PAY-02 | Multiple methods/payments | Rental with partial payment | Add CARD, TRANSFER, and OTHER payments on different dates. | Each row shows correct USD amount, Western date/time, and localized method; outstanding reflects sum of all valid payments. |
| PAY-03 | Payment validation | Owner, rental detail | Submit empty, zero, negative, nonnumeric amount, missing date, and missing method. | Inline validation prevents request; backend failure is shown without false success. |
| PAY-04 | Outstanding edge cases | Rental with total/payment values | Record payments up to total and, if permitted by implementation, above total. | Paid/in-full state is clear; UI outstanding balance never displays below zero even if API data is overpaid. |
| PAY-05 | Payment authorization/states | Non-owner and offline/network failure | View payment section as non-owner; simulate failed load/create. | Non-owner cannot record payment; loading/error/empty state is distinct and retryable; history remains rental-scoped. |

## 10. Maintenance

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| MNT-01 | List/filter/detail | Scheduled/In Progress/Completed records | Filter/search if present and open each record. | Vehicle, type, date, status, vendor/cost, and derived overdue/upcoming label are accurate. |
| MNT-02 | Create maintenance | Owner and vehicle | Add maintenance with type, date, vendor, notes, optional cost, and replaced parts. | Created as `SCHEDULED`; vehicle history/list displays it. |
| MNT-03 | Maintenance validation | Add/edit form | Omit required vehicle/type/date; submit negative cost; invalid/empty replaced-part name, nonpositive quantity, negative unit cost. | Readable validation/API error; no invalid record. |
| MNT-04 | Update lifecycle | Scheduled record | Update to `IN_PROGRESS`; attempt invalid backward/skip completion update. | Only valid lifecycle transitions persist; completed status cannot be set through ordinary update. |
| MNT-05 | Complete maintenance | Non-completed record | Complete with final non-negative cost; refresh Vehicle Detail/Analytics/Reports. | Record becomes `COMPLETED`, completion timestamp/cost persists; a second complete action fails safely. |
| MNT-06 | Completed record protection | Completed record | Attempt edit/update/delete according to current owner UI. | UI follows role/allowed actions; completed record cannot be changed through update workflow. |
| MNT-07 | Maintenance states | Empty data/network failure | Test list/detail loading, no records, and failed request. | Correct loading/empty/error feedback, without fake cost/status. |

## 11. Expenses

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| EXP-01 | List/search/filter | Vehicle and organization expenses | Search by description/vehicle/category; use category filter; open detail. | Correct filtered records; category label, USD amount, and date are clear. |
| EXP-02 | Organization expense | Owner | Add an expense without vehicle association. | Expense saves and detail/list omit vehicle relationship cleanly. |
| EXP-03 | Vehicle-linked expense | Owner and vehicle | Add expense linked to vehicle; open related vehicle/detail. | Association persists and related vehicle is identifiable/navigable where supported. |
| EXP-04 | Expense validation | Add Expense | Submit missing fields, invalid category, negative amount, and invalid/cross-tenant vehicle ID where safely testable. | Error shown; no invalid or cross-tenant association persists. Zero amount behavior is recorded as accepted if the current form/API accepts it. |
| EXP-05 | Edit/delete | Disposable expense, owner | Edit category/amount/date/description/vehicle association; remove association if UI supports it; delete after confirmation. | Changes persist; deletion removes from normal list and later summaries after refresh. |
| EXP-06 | Expense financial impact | Record baseline analytics/report values | Add dated expense in selected period, then refresh Analytics and Reports. | Expenses and net profit update; maintenance cost remains separate from Expenses. |
| EXP-07 | Expense states | Empty/error conditions | Test loading, empty list/no-filter-result, and network error. | Distinct useful states; no misleading zero during loading/error. |

## 12. Tasks

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| TSK-01 | List/search/status | Pending future, overdue, completed tasks | Search notes; filter All/Pending/Completed; open detail. | Search and filters combine correctly; overdue/upcoming is presentation-only and not confused with stored status. |
| TSK-02 | Create task | Owner | Create with due date and optional notes. | New task is `PENDING`, appears in list/Dashboard reminder context. |
| TSK-03 | Task validation | Add Task | Submit without due date; test server/network error. | Field message/error feedback; no false success. |
| TSK-04 | Update task | Pending task | Edit due date/notes through current detail action. | Changes persist without changing status. |
| TSK-05 | Complete task | Pending task | Complete it; refresh list/detail/Dashboard; repeat completion. | Status becomes `COMPLETED`; completion action no longer active; repeated completion is safely rejected. |
| TSK-06 | Task authorization/delete | Non-owner and disposable owner task | Verify non-owner cannot create/edit/complete/delete; owner deletes after confirmation. | Permissions enforced; deleted task disappears from normal results. |
| TSK-07 | Task states | Empty/error conditions | Test no tasks, no search matches, loading, and API error. | Appropriate state and retry; no generic or misleading output. |

## 13. Analytics

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| ANL-01 | Period controls | Multi-period data | Change available year/period controls and return to original. | Control text/chevron is RTL-safe; data and labels update to selected period only. |
| ANL-02 | Financial definitions | Known seeded figures | Independently sum payment dates and expense dates for selected period. | Revenue uses payments; expenses use Expense records; net profit = revenue − expenses; maintenance cost is displayed separately. |
| ANL-03 | Trends/charts | Monthly data spanning selected year | Inspect first/middle/last months at desktop and mobile. | Chart values/labels are legible, edge labels are not clipped, and lines/points do not cover labels. |
| ANL-04 | Vehicle insight | Vehicle with revenue, expense, maintenance | Verify profitability name, secondary plate, revenue/expense/maintenance values and ranking. | Vehicle title does not concatenate raw IDs/plate; formula reflects payment revenue minus vehicle expenses and completed maintenance cost. |
| ANL-05 | Outstanding insight | Multiple partial/unpaid rentals | Compare customer/total outstanding with rental payment sections. | Positive balances and totals agree; summary total is visually connected to its list. |
| ANL-06 | Analytics states | Empty year and failed request | Choose no-activity period; simulate failure/loading. | Empty/loading/error states are explicit; no fabricated trend/KPI zero while loading/error. |

## 14. Reports

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| RPT-01 | Period selector | Data across month/quarter/year | Switch each supported type/value. | Period label and all report cards/rows represent only that inclusive period convention. |
| RPT-02 | Report calculations | Known seeded figures | Independently compare selected report period: revenue, expenses, net profit, maintenance cost, rental/payment/maintenance/task counts. | Values use correct dates: payments by payment date, expenses by expense date, rentals by creation, maintenance by maintenance date, completed tasks by due date. |
| RPT-03 | Report content | Non-empty period | Inspect summary, section rows and totals. | Hierarchy is readable; totals belong to the section they summarize; no mobile-cramped table. |
| RPT-04 | CSV export | Non-empty period/download folder | Select period; export CSV; open downloaded file. | Download succeeds; filename/contents match selected report and values/escaping are usable in spreadsheet software. |
| RPT-05 | Printable report | Popup allowed | Select period; use Print/Printable action; inspect print-preview/new tab. | Self-contained RTL report opens with content, selected period, and correct figures; browser print works. |
| RPT-06 | Reports states | Empty period/loading/error | Choose period without activity; simulate load failure. | Empty state is clear; loading/error does not present misleading figures; retry works where shown. |

## 15. End-to-end business workflows

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| E2E-01 | Full rental lifecycle | Owner; clean V1 and new customer values | 1. Create customer. 2. Add V1 if needed. 3. Create future rental. 4. Generate contract. 5. Pick up. 6. Record partial payment. 7. Extend if no conflict. 8. Record remaining payment. 9. Return. | Customer/vehicle/rental histories link correctly; statuses progress Reserved → Active → Returned; vehicle becomes Available; balance reaches zero; contract remains associated. |
| E2E-02 | Maintenance availability lifecycle | Owner; available disposable vehicle | 1. Create maintenance. 2. Move to In Progress where UI supports it. 3. Complete with cost. 4. Inspect vehicle and Dashboard. 5. Attempt rental during blocked state if status is set accordingly. | Maintenance history and cost persist; only allowed transitions work; fleet/availability presentation is accurate. Note actual completion service records completion; tester should not assume it mutates vehicle status unless the UI/API shows it. |
| E2E-03 | Expense to business insight | Owner; baseline period metrics | 1. Add a vehicle-linked expense dated in selected period. 2. Refresh Dashboard, Analytics, Reports. 3. Open vehicle history. | Expense appears in expense/vehicle views and reduces net profit; it does not become maintenance cost. |
| E2E-04 | Partial payments/outstanding | Reserved or active rental with known total | 1. Record three partial payments using different methods. 2. Compare rental, Dashboard, Analytics outstanding widget, and Reports revenue for payment dates. | Balance falls by each valid amount; revenue appears in payment-date period; no duplicate payment or negative displayed balance. |
| E2E-05 | Operational dashboard reaction | Baseline screenshots/values | Create a pending overdue task (or use seeded), reserve/pick up/return a rental, complete task/maintenance, add payment and expense; refresh Dashboard after each. | Relevant alerts, fleet counts, tasks, balances, and financial cards change coherently without unrelated metric changes. |
| E2E-06 | Isolation workflow | Two organizations seeded | Run equivalent search/detail/report checks in A then B; try A direct URLs while signed into B. | Each organization sees only its own data, histories, financials, documents, and exports. |

## 16. Responsive and UI verification checklist

Run the following on every major page: Login, Dashboard, all list/detail/create routes, Analytics, and Reports. Use the five required viewports.

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| RWD-01 | 375 mobile | Signed in, populated data | Review each route at 375px; open bottom navigation and More drawer. | No horizontal scroll; structured cards/forms stack; all modules/logout remain reachable; targets are usable. |
| RWD-02 | 768 tablet | Signed in | Review rail/drawer state and dense lists. | Tablet navigation is intentional; content does not resemble squeezed desktop/mobile; no overlapping controls. |
| RWD-03 | 1024 small laptop | Signed in | Review sidebar transition, tables, detail panels, forms, charts. | Desktop hierarchy begins cleanly; data remains readable without clipped actions. |
| RWD-04 | 1440 desktop | Signed in | Review dashboard density, full sidebar, wide data lists, reports. | Available width is used effectively; not a stretched mobile card stack. |
| RWD-05 | 1920 wide desktop | Signed in | Repeat data-rich pages. | Controlled content width, no excessive empty space, no document/main-content overflow. |
| UI-01 | Typography/RTL/formatting | All pages | Inspect Arabic copy, alignment, placeholders, controls, USD/date/numeric output. | RTL start/end alignment is correct; labels do not collide with chevrons/calendar icons; formatting is consistent. |
| UI-02 | States and actions | Lists/forms/details | Trigger loading, empty, search-no-result, validation, mutation pending, success, and failure where safe. | Button labels/actions are clear; disabled/pending state prevents duplicate submissions; feedback is visible and truthful. |

## 17. Accessibility and keyboard checklist

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| A11Y-01 | Keyboard navigation | Desktop and mobile emulation | Use Tab/Shift+Tab across login, navigation, filters, forms, dialogs/drawers. | Logical RTL focus order; visible focus indicator; no keyboard trap. |
| A11Y-02 | Drawer/dialog focus | Mobile More drawer and destructive confirmation | Open by keyboard; use Escape; tab through controls. | Focus moves into overlay and returns to trigger on close; Escape closes supported overlay. |
| A11Y-03 | Form semantics | Every create/edit/payment form | Inspect labels, required markers, errors, select controls with keyboard/screen-reader tree. | Every control has an associated accessible name; errors are tied/readable; required inputs are clear. |
| A11Y-04 | Navigation semantics | All shell modes | Inspect active link and icon-only rail/bottom controls. | Active route is visually and semantically identified; icon-only controls have accessible labels. |
| A11Y-05 | Contrast and non-color cues | Badges, alerts, disabled controls, charts | Inspect in normal and high-contrast browser setting where available. | Text remains legible; status is not conveyed by color alone; chart/alert meaning has text. |

## 18. Browser console, network, and regression checklist

| Test ID | Feature | Preconditions | Steps | Expected result |
| --- | --- | --- | --- | --- |
| REG-01 | Console health | DevTools open | Execute smoke and E2E paths; review Console. | No new uncaught errors, React warnings, or failed resource errors. Document expected, understood logs separately. |
| REG-02 | Request health | DevTools Network open | Perform create/update/pickup/return/payment/export/file actions. | Requests have expected success/error status; no duplicate mutation request; response errors surface in UI. |
| REG-03 | Contract 404 review | Rental without generated contract | Open rental detail and contract area. | A missing contract is handled as a visible supported state, not a broken page. Record any signed-contract/contract 404 with its user impact for Milestone 6 triage. |
| REG-04 | Refresh/back behavior | Critical flows completed | Refresh list/detail after mutation; use Back from detail/create flow. | Saved state persists, no duplicate submission, route history remains understandable. |
| REG-05 | Cross-browser critical flow | Chrome, Firefox, Safari/mobile browser | Repeat AUTH-01, REN-02/06/07, PAY-01, RPT-04/05. | Same business outcome and no browser-specific broken layout/download/print behavior. |

## 19. Final release checklist

Release only when all applicable Critical workflow and smoke tests pass, and every failure has a documented disposition.

- [ ] QA environment, test accounts, seed data, and evidence are recorded.
- [ ] SMK, AUTH, DASH, CUS, VEH, REN, PAY, MNT, EXP, TSK, ANL, and RPT suites executed.
- [ ] E2E-01 through E2E-06 executed from a clean/resettable dataset.
- [ ] All five responsive viewports tested; no horizontal overflow, clipped controls, or overlap.
- [ ] Accessibility keyboard/focus/labels/contrast checks pass or have approved remediation.
- [ ] CSV and printable Reports exports verified in a real browser; contract print/PDF and signed-document workflow verified.
- [ ] Console and Network reviewed; unexpected errors are fixed or accepted as documented Milestone 6 follow-up.
- [ ] Tenant isolation and non-owner authorization checks pass.
- [ ] Dashboard, Analytics, and Reports calculations reconcile with known seeded payment/expense/maintenance data.
- [ ] Regression evidence and final defect list are attached to the release decision.
