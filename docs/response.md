# Step 10.3 — Search (Frontend): Complete

---

## Summary

Implemented debounced backend search in the Customer and Vehicle list pages. Both pages now drive the Step 10.1/10.2 backend `?search=` endpoints through the existing generated API client + React Query, instead of filtering client-side against the full list.

---

## Files Changed

| File | Change |
|---|---|
| `apps/web/src/hooks/useDebouncedValue.ts` | **New.** Reusable `useDebouncedValue(value, delayMs = 300)` hook. |
| `apps/web/src/pages/VehiclesPage.tsx` | Pass `{ search: debouncedSearch }` to `useListVehicles`; debounced 300 ms. Kept status `FilterChips` (client-side filter layered on backend search results). |
| `apps/web/src/pages/CustomersPage.tsx` | Converted from mock prototype to API-backed `useListCustomers({ search: debouncedSearch })`; debounced 300 ms. Renders `CustomerResponse` rows. Add button gated to OWNER (matches VehiclesPage pattern). |

No backend changes. No new dependencies. No changes to the shared mock hooks (`features/customers/hooks`, `features/rentals/hooks`) or the mock `CustomerCard` — those are still used by the (still-mock) customer detail / new-rental pages and were left untouched.

---

## Implementation Notes

- **Debounce**: new `useDebouncedValue` hook delays the `search` value by 300 ms. The trimmed search is passed to the query only when non-empty; empty → `undefined` → backend returns the full org list (existing list behavior preserved).
- **Data shape**: `CustomerResponse` uses `firstName`/`lastName`/`phone`/`address` (full name concatenated for display); `VehicleResponse` uses `make`/`model`/`plateNumber`. Verified at runtime.
- **States**: initial load spinner, error state via `getApiErrorMessage`, "no results" state when a search/filter yields nothing, empty-org state with OWNER-only add CTA.
- **Status filter (vehicles)**: kept as a client-side layer on the backend search results — the search endpoint is text-based; the status chips remain a distinct, local concern.
- **Auth**: both pages gate the add action to `OWNER`. List data is scoped by the backend to the authenticated org (unchanged).

---

## Verification

| Check | Command | Result |
|---|---|---|
| TypeScript | `pnpm run typecheck` (apps/web) | ✅ 0 errors |
| Lint (changed files) | `pnpm exec eslint <files>` | ✅ clean |
| Build | `pnpm run build` (apps/web) | ✅ 1.97 s |

### Runtime (against running backend, fresh registered org)

| Endpoint | Input | Result |
|---|---|---|
| `GET /api/customers` | (no search) | all org customers returned |
| `GET /api/customers?search=Ahmed` | name | 1 match (`Ahmed Mansour`, 0551234567) |
| `GET /api/customers?search=zzzz` | no match | 0 results |
| `GET /api/vehicles` | (no search) | all org vehicles returned |
| `GET /api/vehicles?search=Toyota` | make | 1 match (`Toyota Camry`, ABC-1234) |
| `GET /api/vehicles?search=ABC-1234` | plate | 1 match |
| `GET /api/vehicles?search=2022` | year | 1 match |
| `GET /api/vehicles?search=zzzz` | no match | 0 results |

Response shapes match the UI contract: `CustomerResponse` (`id`, `firstName`, `lastName`, `phone`, `address`, …) and `VehicleResponse` (`id`, `make`, `model`, `plateNumber`, `status`, …).

> Note: customer search is by name / national ID / license / phone (address is not a customer search field per the API spec). Vehicle search is by plate / make / model / year.

The web dev server was started with `VITE_API_URL=http://localhost:3000` and `configureApiClient()` (called in `main.tsx`) applies that origin, so the browser app issues exactly the verified requests above. Full in-browser click-through was blocked by unavailable browser tooling in this environment (Playwright requires a Chrome install that needs sudo); the request/response contract the UI relies on is covered by the API-level verification above plus typecheck/build.

---

## Acceptance Criteria

| Criterion | Status |
|---|---|
| Customer search works (backend endpoint) | ✅ |
| Vehicle search works (backend endpoint) | ✅ |
| Debounced input (no request-per-keystroke) | ✅ (300 ms) |
| Existing list behavior preserved when search is empty | ✅ |
| Loading / error / empty / no-results states | ✅ |
| Reuses existing generated client + React Query | ✅ |
| No duplicate search logic, no second client | ✅ |
| Org isolation & auth backend-handled (unchanged) | ✅ |
| No unrelated UI redesign | ✅ |
| No new dependencies | ✅ |
| Typecheck / lint / build pass | ✅ |
