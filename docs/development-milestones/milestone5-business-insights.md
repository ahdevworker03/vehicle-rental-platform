# Milestone 5 — Business Insights

**Goal**

Give business owners visibility into business performance through a richer Dashboard, Reports, and expanded Analytics.

**Rule:** No step may be skipped. Every step must be:

1. Implemented.
2. Reviewed by the AI agent.
3. Manually reviewed.
4. Tested.
5. Committed.

Only after all acceptance criteria are satisfied may the next step begin.

Backend and database work must precede dependent frontend work. API contracts must be defined in `lib/api-spec/openapi.yaml` before backend or frontend implementation, and generated artifacts (`lib/api-client-react`, `lib/api-zod`) must be regenerated from the specification per `docs/rules/api-contracts.md`.

---

# Phase 19 — Reports

## Step 19.1 — Reports Selectors & Data Layer (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md
- docs/architecture/11-domain-model-specification.md

### Objectives

Build the pure, focused selectors and data layer that power the Reports surface, following the established frontend-selector pattern used across Maintenance, Expenses, Payments, and Tasks.

Including:

- period semantics (month / quarter / year) reusing the existing `payment_date` and `expense_date` conventions
- revenue for a period from recorded Payments
- expenses for a period from recorded Expenses
- net profit for a period (revenue − expenses)
- maintenance cost for a period from `Maintenance.cost`
- counts (rentals, maintenance records, payments, completed tasks) for a period
- printable / CSV export formatting helpers (no PDF backend)

Do not:

- add new backend aggregate endpoints
- redesign the Task, Payment, Expense, or Maintenance models
- introduce a currency field

### Deliverables

- Report selector module (e.g. `features/reports/selectors.ts`)
- Report date-range helpers and export formatting helpers
- Unit tests for the report selectors and formatting

### Acceptance Criteria

- Selectors are pure and perform no API calls.
- Revenue uses `payment_date`; expenses use `expense_date`.
- Period boundaries follow the existing Dashboard/Analytics month conventions.
- Export helpers produce printable HTML and CSV strings.
- Selector tests pass.
- No TypeScript errors, no ESLint errors.

---

## Step 19.2 — Reports (Frontend)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Implement the Reports surface using the existing API-backed hooks and the Step 19.1 selectors, following the established list/detail page patterns.

Including:

- Reports page/route
- period selector (month / quarter / year)
- revenue, expense, net profit, and maintenance-cost summaries for the selected period
- counts (rentals, maintenance, payments, completed tasks)
- printable HTML view
- CSV export
- loading / empty / error / success states

Do not:

- add new backend endpoints
- introduce a global state store for derived metrics
- build a PDF-generation service

### Deliverables

- Reports page component
- Report cards/tables
- Period selector control
- Printable + CSV export UI
- Feature hooks wiring the generated data hooks
- Frontend tests for the Reports page

### Acceptance Criteria

- Reports render API-backed data for the selected period.
- Period changes re-compute summaries without refetching unrelated data.
- Printable view and CSV export work.
- Loading/empty/error/success states behave correctly.
- No mock data; no misleading zeros while loading/on error.
- Frontend builds successfully, no TypeScript/ESLint errors.

---

# Phase 20 — Analytics & Insights

## Step 20.1 — Analytics Expansion (Frontend Selectors)

### Must Read

- 03-frontend-architecture.md
- 06-api-design.md
- docs/product/02-business-requirements.md
- docs/architecture/11-domain-model-specification.md

### Objectives

Extend the existing analytics selectors to cover the product requirements not yet surfaced, using the existing loaded API data.

Including:

- yearly maintenance cost per vehicle
- lifetime maintenance cost per vehicle
- vehicle profitability (vehicle revenue − vehicle costs) aligned with the approved financial definitions
- business performance trends across periods (revenue, expenses, net profit per period) computed client-side from loaded data

Do not:

- add new backend aggregate endpoints
- change the financial definitions approved in Milestone 4 (revenue from `payment_date`, expenses from `Expense.amount`, net profit = revenue − expenses)
- count `Maintenance.cost` as an Expense

### Deliverables

- New/extended analytics selectors in the payments/expenses/maintenance/reports feature modules
- Unit tests for the new selectors (yearly/lifetime cost, vehicle profitability, trends)

### Acceptance Criteria

- Selectors are pure and perform no API calls.
- Vehicle profitability uses approved revenue/cost definitions.
- Trends produce a per-period series (e.g. monthly revenue/expense/net-profit).
- Zero-data and single-vehicle cases handled.
- Selector tests pass.
- No TypeScript errors, no ESLint errors.

---

## Step 20.2 — Analytics & Dashboard Insights (Frontend)

### Must Read

- docs/architecture/03-frontend-architecture.md
- docs/architecture/06-api-design.md
- docs/product/02-business-requirements.md
- docs/product/03-user-flows.md

### Objectives

Integrate the Step 20.1 selectors into the existing Analytics and Dashboard surfaces while preserving current behavior.

Including:

- yearly / lifetime maintenance cost per vehicle in Analytics
- vehicle profitability ranking in Analytics
- business performance trend (period-over-period) on the Analytics revenue surface
- Dashboard indicator(s) that surface insights (e.g. a trend or period summary) without disturbing existing cards

Do not:

- redesign the Dashboard or Analytics
- add new backend endpoints
- remove or break existing dashboard/analytics sections

### Deliverables

- Updated Analytics components
- Updated Dashboard component(s)
- Frontend tests covering the new insight surfaces and preservation of existing sections

### Acceptance Criteria

- Analytics renders yearly/lifetime maintenance cost and vehicle profitability from API data.
- Trends render and update with the selected period.
- Dashboard insight indicator renders and preserves existing behavior.
- Loading/empty/error states correct; no misleading zeros.
- Frontend builds successfully, no TypeScript/ESLint errors.

---

# Phase 21 — Insights Verification

## Step 21.1 — Manual & Automated Verification

### Objectives

Verify the full Business Insights layer.

Including:

- Manual testing of the Reports and Analytics/Dashboard flows in the frontend
- API verification of the underlying data flows (revenue, expenses, maintenance cost)
- Organization isolation re-verified for the data feeding Reports/Analytics
- Automated tests for the new selectors and components
- Build, typecheck, and lint verification

### Deliverables

- Manual test results
- Automated test coverage for the new insights logic
- Verified acceptance criteria for Milestone 5

### Acceptance Criteria

- Reports and Analytics/Dashboard flows verified manually.
- Underlying data is organization-scoped.
- New tests pass.
- No TypeScript errors, no ESLint errors, no build errors.
- Completion checklist marked complete.

---

# Architectural and Product Ambiguities Requiring Approval

The following decisions are **not settled by existing documentation** and materially affect the Milestone 5 architecture. They must be approved before the corresponding step is implemented. They are listed here so they can be resolved rather than silently invented.

1. **Reports export format.**
   `02-business-requirements.md` requires reporting but does not define an export format. Proposal: printable HTML and CSV export (client-side), no PDF service, for Milestone 5.

2. **Trends representation and period semantics.**
   `02-business-requirements.md` requires "business performance trends" but does not define the aggregation source. Proposal: trends are computed client-side from loaded organization data using the existing period conventions; no backend aggregate endpoints are added.

3. **Vehicle profitability definition.**
   `02-business-requirements.md` requires "vehicle profitability" but does not define the exact revenue/cost basis. Proposal: vehicle profitability = vehicle revenue (payments mapped to the vehicle via its rentals, per the Milestone 4 convention) minus vehicle expenses and maintenance cost attributed to that vehicle. Costs are reported separately from the Expense module to avoid double-counting.

---

# Milestone 5 Completion Checklist

- [x] Report selectors implemented
- [x] Report export helpers implemented
- [x] Reports surface implemented
- [ ] Reports manual testing completed
- [ ] Analytics expansion selectors implemented
- [ ] Vehicle profitability implemented
- [ ] Business performance trends implemented
- [ ] Analytics and Dashboard insights integrated
- [ ] Manual testing completed
- [ ] Automated testing completed
- [ ] Organization isolation verified for underlying data
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No build errors
- [ ] Documentation updated
- [ ] Changes committed

---

## Milestone Status

**Status:** In Progress

Current Phase: Phase 20 — Analytics & Insights

Current Step: Step 20.1 — Analytics Expansion (Frontend Selectors)

Last Completed Step: Step 19.2 — Reports (Frontend)

Next Step: Step 20.1
