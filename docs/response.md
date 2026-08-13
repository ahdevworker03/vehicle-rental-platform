# Milestone 2 Fix #4 — Fix /auth/me OpenAPI Contract Mismatch

---

## Summary

Fixed the API contract mismatch for `GET /api/auth/me`. The OpenAPI `UserResponse` schema declared `{ id, email, role, createdAt, updatedAt }`, but the actual `/auth/me` response returns `{ id, email, role, organizationId, createdAt }`. The generated client contract did not accurately describe the response. The fix introduces a dedicated `CurrentUserResponse` schema for `/auth/me` and keeps `UserResponse` for the `/users` endpoints (which legitimately include `updatedAt`).

---

## Authoritative Response Shape

From `docs/architecture/06-api-design.md` §GET /api/auth/me:

```json
{
  "data": {
    "id": "...",
    "email": "owner@example.com",
    "role": "OWNER",
    "organizationId": "...",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

- Includes `organizationId` (the authenticated user's organization id).
- Does **not** include `updatedAt`.
- Returns `{ "data": null }` (HTTP 200) when no valid token is provided.

`07-authentication-and-authorization.md` and `10-authentication-policy.md` are consistent with this; none require `updatedAt` on `/auth/me`. The `/users` endpoints return `{ id, email, role, createdAt, updatedAt }` (from `user.service.ts`), so `UserResponse` correctly stays as-is for those.

---

## Files Modified

| File | Change |
|---|---|
| `lib/api-spec/openapi.yaml` | Added `CurrentUserResponse` and `CurrentUserResponseWrapper` schemas; changed the `getCurrentUser` operation to reference `CurrentUserResponseWrapper` instead of `UserResponseWrapper`. |
| `lib/api-client-react/src/generated/api.schemas.ts` | **Regenerated** — added `CurrentUserResponse` / `CurrentUserResponseWrapper` interfaces. |
| `lib/api-client-react/src/generated/api.ts` | **Regenerated** — `getCurrentUser` now returns the current-user response type. |
| `lib/api-zod/src/generated/api.ts` | **Regenerated** — `GetCurrentUserResponse` now models the current-user shape. |
| `lib/api-zod/src/generated/types/` | **Regenerated** — new `currentUserResponse.ts` / `currentUserResponseWrapper.ts` (index updated). |
| `apps/web/src/providers/AuthProvider.tsx` | Typed the auth context `user` as `CurrentUserResponse` (the actual `/auth/me` shape) instead of `UserResponse`. The frontend never reads `updatedAt` on the current user. |

No authentication behavior was changed. No unrelated endpoints were modified.

---

## OpenAPI Changes

- Added `CurrentUserResponse` (required: `id`, `email`, `role`, `organizationId`, `createdAt`) — matches the actual `/auth/me` payload.
- Added `CurrentUserResponseWrapper` (`data: CurrentUserResponse | null`).
- `getCurrentUser` (GET /auth/me) now references `CurrentUserResponseWrapper`.
- `UserResponse` / `UserResponseWrapper` / `UserListResponse` unchanged (used by `/users`).

---

## Generated Files Regenerated

Via `pnpm run codegen` (orval) — both `@workspace/api-client-react` and `@workspace/api-zod`. No generated files were hand-edited.

---

## Runtime Verification

| Test | Expected | Actual |
|---|---|---|
| GET /auth/me with valid token | `{ id, email, role, organizationId, createdAt }`, no `updatedAt` | ✅ exact match |
| GET /auth/me without token | `200 { "data": null }` | ✅ |
| GET /auth/me with invalid token | `200 { "data": null }` | ✅ |
| GET /users list | still includes `updatedAt` (UserResponse shape) | ✅ |
| POST /users create | still returns `updatedAt` (UserResponse shape) | ✅ |

---

## Typecheck / Build / Lint / Test Results

| Check | Result |
|---|---|
| `pnpm run typecheck:libs` | ✅ 0 errors |
| API typecheck | ✅ 0 errors |
| API build | ✅ 117ms |
| Web typecheck | ✅ 0 errors |
| Web build | ✅ 1.95s |
| `pnpm run lint` (root) | ✅ 0 errors |
| Web tests | ✅ 7 files / 31 tests |

---

## Remaining Limitations

None. The `/auth/me` contract now matches the implementation exactly, the `/users` contract is preserved, and the frontend auth context uses the accurate current-user type. The only consumer of the current-user response is `AuthProvider`, which was updated; no other frontend code references `UserResponse` for the current user.
