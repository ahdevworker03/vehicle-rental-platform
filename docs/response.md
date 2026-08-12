# Step 1 — Milestone 2 Audit: Customer Frontend Module (Complete)

---

## Summary

Completed the Customer frontend module per Milestone 2 audit Step 1. The Customer backend was already complete; the frontend still used mock data for detail/create flows. All Customer list/detail/create/edit/delete flows are now API-backed using the existing generated `@workspace/api-client-react` hooks + React Query. No backend changes were required. Rental/dashboard mock functionality was left untouched (out of scope).

---

## 1. Files Created / Modified

| File | Change |
|---|---|
| `apps/web/src/pages/EditCustomerPage.tsx` | **New.** API-backed edit form (`useGetCustomer` + `useUpdateCustomer`) with client-side validation. |
| `apps/web/src/pages/AddCustomerPage.tsx` | **Rewritten.** Mock prototype → API-backed create form (`useCreateCustomer`) with client-side validation, loading/error states. |
| `apps/web/src/pages/CustomerDetailPage.tsx` | **Rewritten.** Mock-backed → API-backed (`useGetCustomer`), OWNER-only edit action + OWNER-only delete with confirm, customer documents retained, loading/error/empty states. |
| `apps/web/src/pages/CustomersPage.tsx` | Replaced inline card markup with the shared `CustomerCard` component (list was already API-backed with debounced search). |
| `apps/web/src/components/ui/CustomerCard.tsx` | **Rewritten.** Mock `Customer` shape (`name`/`location`) → API `CustomerResponse` (`firstName`/`lastName`/`phone`/`address`). Dropped mock-only `activeRentalCount`/`remainingBalance` props. |
| `apps/web/src/App.tsx` | Added `/customers/:id/edit` route → `EditCustomerPage`. |

No backend changes. No new dependencies. No second API client.

---

## 2. What Was Changed

### Customer list (`CustomersPage`)
- Already API-backed (`useListCustomers({ search })` with `useDebouncedValue`). Swapped the inline list-item markup for the shared `CustomerCard`, matching the Vehicle module pattern.

### CustomerCard
- Now accepts `CustomerResponse`, renders `firstName + lastName`, `phone · address`, avatar initials. Removed mock rental-stats props (no longer available from the API).

### AddCustomerPage (create)
- `useCreateCustomer` mutation; on success invalidates `getListCustomersQueryKey()` and navigates to `/customers`.
- Fields use the real API contract: `first_name`, `last_name`, `phone`, `address`, `national_id`, `license_number`, `license_expiry_date` (date input → ISO string).
- Client-side validation: all fields required, valid date check; per-field Arabic error messages via `FormField`.
- Loading (`Spinner`), error banner via `getApiErrorMessage`, disabled save until form filled.

### EditCustomerPage (new)
- `useGetCustomer(id)` pre-fills the form (date converted to `yyyy-mm-dd` for the date input); `useUpdateCustomer` submits.
- Same validation, loading (`Spinner`), empty/error state (`EmptyState`) when the customer isn't found, error banner on failure.
- On success invalidates the list key and navigates to `/customers/:id`.

### CustomerDetailPage
- `useGetCustomer(id)`; loading spinner; `EmptyState` on 404/error.
- Header card: avatar, full name, address, tel link.
- Info card: phone, address; Identity & License card: national ID, license number, license expiry (`formatDateAr`).
- Customer documents section retained (already API-backed via `useCustomerDocuments`).
- **OWNER-only**: edit button (`/customers/:id/edit`) and delete (confirm dialog → `useDeleteCustomer`, invalidates list, navigates to `/customers`). Non-OWNER users see no mutation controls.
- Added `IdCard` icon section header; removed mock rental-history sections that depended on mock customer IDs.

### Routing
- `/customers/:id/edit` added before `/customers/:id` so wouter matches the edit route correctly.

---

## 3. Verification Performed

### Static checks
| Check | Command | Result |
|---|---|---|
| TypeScript (web) | `pnpm run typecheck` | ✅ 0 errors |
| Build (web) | `pnpm run build` | ✅ 1.81s |
| Tests (web) | `pnpm test` | ✅ 7 files / 31 tests |
| Lint (changed files) | `pnpm exec eslint <files>` | ✅ clean |
| Lint (all web) | `pnpm exec eslint apps/web/src` | ⚠️ only pre-existing `use-toast.ts` error (unrelated, M1) |
| TypeScript (api) | `pnpm run typecheck` (apps/api) | ✅ 0 errors |

### Runtime (against running backend, fresh org)
| Flow | Result |
|---|---|
| Create with exact UI payload | ✅ 201, correct fields returned |
| Get detail (`useGetCustomer`) | ✅ 200, all fields |
| Update with exact UI payload | ✅ 200, `address`/`licenseExpiryDate` changed |
| Search by name (Arabic) | ✅ 1 match |
| Search by phone | ✅ 1 match |
| Validation (missing required field) | ✅ 422 |
| Soft delete → get | ✅ 204 → 404 |
| EMPLOYEE: list (read) | ✅ 200 |
| EMPLOYEE: create / delete | ✅ 403 (backend-enforced) |

Browser-based click-through could not be executed (Playwright MCP requires a system Chrome install that needs sudo, unavailable in this environment); the full request/response contract the UI relies on was verified at the API level with the exact payloads/shapes the new pages send, plus typecheck/build/lint coverage.

---

## 4. Issues Discovered & Fixed

1. **Unused imports** in `CustomerCard.tsx` (`User`) and `CustomerDetailPage.tsx` (`CreditCard`) — flagged by ESLint, removed.
2. **Old `CustomerCard` contract** (`activeRentalCount`/`remainingBalance`) had no consumers and used the mock `Customer` shape — rewritten to the API shape so the list page and module are consistent.
3. **`/customers/:id/edit` route ordering** — added before `/customers/:id` in the wouter `Switch` to avoid the dynamic route capturing the edit path.

---

## 5. Remaining Customer-Module Limitations

1. **Rental history on the customer detail page** — previously rendered from mock rentals keyed to mock customer IDs. Now that the page is API-backed, those sections were removed. Rental data is a separate (unbuilt) backend module; wiring real rental history requires the Rental module, which is explicitly out of scope here.
2. **`features/customers/hooks.ts`** still exports mock hooks (`useCustomers`, `useCustomer`) consumed by the rental/dashboard pages (`NewRentalPage`, `RentalsPage`, `DashboardPage`, `RentalDetailPage`, `AnalyticsPage`). These are out of scope (rental/dashboard mock functionality) and were intentionally left intact.
3. **Pre-existing ESLint error** in `apps/web/src/hooks/use-toast.ts` (Milestone 1 debt) remains — not introduced by this change.
4. **In-browser E2E** not executed due to unavailable Chrome install in the environment; verification was API-level + static.
