# Milestone 2 Fix #5 — Prevent Self-Deletion

---

## Summary

Prevented an authenticated user from deleting their own user account or their own organization. The existing OWNER-only deletion rules and the ability to delete other users/organizations are unchanged.

---

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/modules/users/user.service.ts` | `deleteUser` now accepts an `actorUserId` parameter and rejects deleting the caller's own account with `409 CANNOT_DELETE_SELF`. |
| `apps/api/src/modules/users/user.controller.ts` | Passes `req.user.sub` (the authenticated user id from the JWT) to `deleteUser`. |
| `apps/api/src/modules/organizations/organization.service.ts` | `deleteOrganization` now always rejects with `409 CANNOT_DELETE_ORGANIZATION`. |

No schema/migration changes. No unrelated modules touched. Controllers remain thin; business rules live in the service layer.

---

## Behavior

- **User self-deletion:** `DELETE /api/users/:id` where `:id` equals the authenticated user's own id → `409 CANNOT_DELETE_SELF`. Other users in the org can still be deleted by an OWNER.
- **Organization self-deletion:** `DELETE /api/organizations/me` operates on the caller's own org (org isolation; there is no cross-org deletion path), so any successful-authorization call is inherently a self-deletion attempt → `409 CANNOT_DELETE_ORGANIZATION`. The org remains accessible afterward.
- **OWNER-only rules unchanged:** the delete routes still require `requireRole("OWNER")`; MANAGER/EMPLOYEE deletions still return `403`.
- **Error conventions:** uses the existing `AppError` + `{ error: { code, message } }` format with HTTP `409` (business conflict), consistent with `06-api-design.md`.

---

## Runtime Verification

Setup: fresh org with an OWNER and an EMPLOYEE user.

| Test | Expected | Actual |
|---|---|---|
| OWNER deletes another user | 204 | ✅ 204 |
| Deleted user is no longer accessible | 404 | ✅ 404 |
| OWNER deletes themselves | 409 | ✅ 409 `CANNOT_DELETE_SELF` |
| OWNER still exists after self-delete attempt | 200 | ✅ 200 |
| OWNER deletes their own organization | 409 | ✅ 409 `CANNOT_DELETE_ORGANIZATION` |
| Organization still accessible after reject | 200 | ✅ 200 |
| Non-OWNER (EMPLOYEE) deletes a user | 403 | ✅ 403 |
| Non-OWNER (EMPLOYEE) deletes the org | 403 | ✅ 403 |
| OWNER deletes another employee (unchanged) | 204 | ✅ 204 |

---

## Typecheck / Build / Lint / Test Results

| Check | Result |
|---|---|
| `pnpm run typecheck:libs` | ✅ 0 errors |
| API typecheck | ✅ 0 errors |
| API lint | ✅ clean |
| API build | ✅ 132ms |
| Web typecheck | ✅ 0 errors |
| Web tests | ✅ 7 files / 31 tests |
| Root `pnpm run lint` | ✅ 0 errors |

---

## Remaining Limitations

None. The self-deletion guard is enforced in the service layer for the user path and as a hard rejection for the organization path (which is inherently the caller's own org). If multi-organization or impersonation flows are added later, the organization check may need to compare the target org against `req.user.org` rather than reject unconditionally, but under the current single-org-per-user model a hard reject is correct.
