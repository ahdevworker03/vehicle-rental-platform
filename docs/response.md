# Temporary Logout UI — Implementation Report

---

## Summary

Added a minimal, temporary logout button to verify the authentication infrastructure before the full application UI is implemented. The button reuses the existing `AuthProvider.logout()` and redirects the user to `/login`.

---

## Files Created

| File | Purpose |
|---|---|
| `apps/web/src/components/layout/LogoutButton.tsx` | Temporary logout button: calls `logout()`, redirects to `/login` |

## Files Modified

| File | Change |
|---|---|
| `apps/web/src/components/layout/AppShell.tsx` | Rendered `<LogoutButton />` in an always-visible fixed position (top-right corner) |

No new dependencies were introduced. No layout or navigation redesign. No new authentication logic.

---

## Implementation

### `LogoutButton.tsx`

- Uses `useAuth()` from the existing `AuthProvider` — reuses its `logout()` implementation. No new auth logic.
- Uses `useLocation()` from wouter to navigate.
- On click:
  1. Calls `await logout()` — which calls `apiLogout({ refreshToken })`, then `clearTokens()`, then `setUser(null)`.
  2. Calls `setLocation("/login", { replace: true })`.
- Disables the button and shows a spinner while submitting to prevent double-clicks.
- Reuses the existing `Button` (ghost variant) and `Spinner` components, plus the `LogOut` lucide icon (already a dependency).
- Arabic label "خروج" consistent with the Arabic-first/RTL app.

### `AppShell.tsx`

- Added a fixed-position wrapper at the top-right corner (`absolute top-3 right-3 z-50`) rendering the `LogoutButton`.
- The AppShell container is `relative`, so the button is always visible across all protected pages without affecting layout flow.
- The `<main>` scrollable area and `<BottomNavigation>` are unchanged.

---

## Verification

### 1. Login succeeds

Backend test: `POST /api/auth/register` → 201; `POST /api/auth/login` → 200 with access + refresh tokens.

### 2. Backend logout endpoint is called

Backend test: `POST /api/auth/logout` with the refresh token → **HTTP 204**. The refresh token is revoked server-side (verified: a subsequent refresh with the same token returns `401 INVALID_REFRESH_TOKEN`).

The `AuthProvider.logout()` implementation calls `apiLogout({ refreshToken })` before clearing local state — confirmed in `AuthProvider.tsx:72-85`.

### 3. Local tokens are removed

`AuthProvider.logout()` calls `clearTokens()` which removes both `vrap.accessToken` and `vrap.refreshToken` from `localStorage` (`auth-token.ts`). Confirmed in code.

### 4. User is redirected to `/login`

`LogoutButton` calls `setLocation("/login", { replace: true })` after `logout()` resolves. `ProtectedRoute` also redirects unauthenticated users to `/login`, so both paths converge.

### 5. Refresh keeps the user logged out

After logout, tokens are cleared from `localStorage`. On page refresh, `AuthProvider`'s session restoration finds no token and leaves the user unauthenticated — the app stays on `/login`.

### 6. Commands

| Check | Command | Result |
|---|---|---|
| TypeScript | `pnpm run typecheck` (apps/web) | ✅ 0 errors |
| Lint | `pnpm exec eslint apps/web/src` | ✅ No new errors (only pre-existing `use-toast.ts` error in an unmodified file) |
| Build | `pnpm run build` (apps/web) | ✅ 1.80s, no errors |

---

## Notes

- The access token is a stateless JWT valid for 15 minutes, so `GET /api/auth/me` with a still-valid access token returns 200 even after logout. This is documented JWT behavior; logout revokes the refresh token server-side and clears local tokens, preventing session continuation.
- The button is intentionally minimal and temporary; it will be replaced by a proper user-menu in the full application UI.
