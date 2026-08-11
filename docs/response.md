# Step 6.1 — Final Implementation Verification

---

## 1. Cross-Organization Authorization

### Test: Org B PATCH Org A's user

```bash
curl -s -X PATCH "http://localhost:3000/api/users/3e36b99f-..." \
  -H "Authorization: Bearer $ACCESS_B" \
  -H "Content-Type: application/json" \
  -d '{"role":"EMPLOYEE"}'
```

**Result:** HTTP 404, `{"error":{"code":"USER_NOT_FOUND","message":"User not found."}}`

**Re-read by Org A:** HTTP 200, Role: `MANAGER` (unchanged)

### Test: Org B DELETE Org A's user

```bash
curl -s -X DELETE "http://localhost:3000/api/users/3e36b99f-..." \
  -H "Authorization: Bearer $ACCESS_B"
```

**Result:** HTTP 404

**Re-read by Org A:** HTTP 200 (user still exists, not deleted)

### Conclusion

Cross-organization modification is prevented. Org B's `req.user.org` does not match the target user's `organization_id`, so `repo.findById(userId, orgId)` returns `null`, and the service returns 404 `USER_NOT_FOUND`. The target user in Org A is not modified or deleted.

✅ **PASS**

---

## 2. Repository Safety

### Trace: PATCH /api/users/:id

```
Route (user.routes.ts:12)
  → authenticate middleware → sets req.user.org from JWT
  → requireRole("OWNER") middleware → checks req.user.role
  → validateBody(updateUserSchema) middleware → validates { role }
  → controller.update(req, res, next)
      → const id = req.params.id as string
      → updateUser(id, req.user!.org, input)   [orgId from validated JWT]
           → service.updateUser(userId, orgId, input)
                → const user = repo.findById(userId, orgId)  [org-scoped lookup]
                → if (!user || user.deleted_at) → 404
                → repo.update(userId, input)   [only reached after org check]
```

### Trace: DELETE /api/users/:id

```
Route (user.routes.ts:13)
  → authenticate middleware
  → requireRole("OWNER") middleware
  → controller.remove(req, res, next)
      → deleteUser(id, req.user!.org)
           → service.deleteUser(userId, orgId)
                → const user = repo.findById(userId, orgId)  [org-scoped lookup]
                → if (!user || user.deleted_at) → 404
                → repo.softDelete(userId)   [only reached after org check]
```

### Why organization isolation cannot be bypassed

1. `req.user.org` comes from the validated JWT `org` claim — the client cannot forge it.
2. The controller reads `req.user!.org` and passes it to the service — no path parameter or request body field overrides org context.
3. The service calls `repo.findById(userId, orgId)` which uses Prisma `findFirst({ where: { id, organization_id } })` — both the user ID and organization ID must match.
4. `repo.update()` and `repo.softDelete()` are only called after the org-scoped `findById` check passes.
5. There is no execution path where `update()` or `softDelete()` is called without first passing the org-scoped `findById` check.

✅ **PASS** — No bypass found.

---

## 3. Role Permissions

### Documented permissions

| Source | OWNER | MANAGER | EMPLOYEE |
|---|---|---|---|
| `10-authentication-policy.md` (Authorization) | "Current supported role" | "Future roles" | "Future roles" |
| `07-authentication-and-authorization.md` (Authorization Model) | "Permissions determined by assigned role" | Same | Same |

**Neither document defines specific CRUD permissions per role.** The architecture states only:
- "Permissions are determined by the user's assigned role."
- "The backend is responsible for enforcing all authorization rules."
- "Current supported role: OWNER"

### What the implementation does

| Permission | OWNER | MANAGER | EMPLOYEE | Status |
|---|---|---|---|---|
| List users (`GET /api/users`) | ✅ | ✅ | ✅ | **Inferred** — any authenticated user can list org members |
| Get user (`GET /api/users/:id`) | ✅ | ✅ | ✅ | **Inferred** — any authenticated user can view org members |
| Create user (`POST /api/users`) | ✅ | ❌ (403) | ❌ (403) | **Inferred** — only OWNER creates users |
| Update user role (`PATCH /api/users/:id`) | ✅ | ❌ (403) | ❌ (403) | **Inferred** — only OWNER modifies roles |
| Delete user (`DELETE /api/users/:id`) | ✅ | ❌ (403) | ❌ (403) | **Inferred** — only OWNER deletes users |

### Analysis

All permissions are **inferred** — the architecture does not prescribe specific per-role CRUD rules for the User module. The implementation follows a reasonable RBAC pattern (OWNER = full access, MANAGER/EMPLOYEE = read-only) but this is not explicitly documented in any architecture document.

**Assumption:** OWNER has full CRUD access to users; MANAGER and EMPLOYEE have read-only access.

⚠️ **Documented: inferred, not documented. Implemented: yes. Missing: specific per-role CRUD rules in architecture docs.**

---

## 4. Password Hashing

### Trace: POST /api/users

```
Controller: user.controller.ts → create()
  → input = req.body as CreateUserInput
  → createUser(req.user!.org, input)
       → service.createUser(orgId, input)
            → hashPassword(input.password)        [line 21 of user.service.ts]
                 → auth.hash.ts: argon2.hash(password)  [Step 4.1 implementation]
            → repo.create(input, passwordHash, orgId)
```

### Confirmation

- `user.service.ts` imports `hashPassword` from `../auth` (the auth module).
- `auth.hash.ts` uses `argon2.hash(password)` with library defaults.
- No second password hashing function exists anywhere in the codebase.
- No duplicate hashing implementation exists.

✅ **PASS** — Argon2id implementation from Step 4.1 is reused. No duplicate hashing.

---

## 5. Organization Isolation

### Request trace: GET /api/users

```
JWT (Authorization header)
  → authenticate middleware (middleware/auth.ts:6)
      → verifyAccessToken(token)  → validates HS256, issuer, audience, expiry
      → decodes { sub: "...", org: "org-a-uuid", role: "OWNER" }
      → prisma.user.findUnique({ where: { id: payload.sub } })  → confirms user exists
      → req.user = { sub, org, role }
  ↓
Controller (user.controller.ts)
  → listUsers(req.user!.org)
  ↓
Service (user.service.ts)
  → repo.findByOrg(orgId)
  ↓
Repository (user.repository.ts)
  → prisma.user.findMany({
      where: { organization_id: orgId, deleted_at: null }
    })
```

### Organization scoping per query

| Repository function | Organization scope | How |
|---|---|---|
| `findByOrg(orgId)` | ✅ Yes | `where: { organization_id: orgId, deleted_at: null }` |
| `findById(userId, orgId)` | ✅ Yes | `where: { id: userId, organization_id: orgId }` |
| `findByEmail(email)` | ❌ No (global) | `where: { email }` — email is globally unique per architecture |
| `create(data, passwordHash, orgId)` | ✅ Yes | `data.organization_id = orgId` |
| `update(userId, data)` | NA (guarded) | Called only after org-scoped findById in service |
| `softDelete(userId)` | NA (guarded) | Called only after org-scoped findById in service |

### Exceptions

- `findByEmail` is intentionally global — email uniqueness is platform-wide per the documented architecture decision from Step 2.2. It is only used for duplicate email checks during user creation, not for data retrieval.

✅ **PASS** — All data-retrieval queries are organization-scoped.

---

## 6. Architecture Compliance

### Endpoint → Architecture mapping

| Endpoint | 04-backend-architecture.md | 06-api-design.md | 07-auth.md | 10-auth-policy.md |
|---|---|---|---|---|
| `GET /api/users` | ✅ Layered (Route→Controller→Service→Repo) | ✅ `{ data }` response format | ✅ Requires authentication | ✅ org isolation via req.user.org |
| `GET /api/users/:id` | ✅ Layered | ✅ `{ data }` or `{ error }` | ✅ Requires authentication | ✅ org isolation |
| `POST /api/users` | ✅ Layered | ✅ 201 Created, 422 validation | ✅ RBAC (OWNER only) | ✅ org-scoped creation |
| `PATCH /api/users/:id` | ✅ Layered | ✅ 200, 404, 422 | ✅ RBAC (OWNER only) | ✅ org-scoped update |
| `DELETE /api/users/:id` | ✅ Layered | ✅ 204 No Content, 404 | ✅ RBAC (OWNER only), soft delete | ✅ org-scoped delete |

### Undocumented implementation decisions

1. **Role permissions for User CRUD are not documented.** The architecture states "OWNER" is the current supported role but does not define that MANAGER/EMPLOYEE are read-only for users. This is an inferred permission model.

2. **Soft-deleted users return 404, not a different status.** Not explicitly documented. The implementation treats soft-deleted users the same as non-existent users to prevent information leakage.

3. **CREATE user payload restricts to MANAGER | EMPLOYEE roles.** Creating a user with `role: "OWNER"` is prevented by Zod schema. Not explicitly documented.

4. **`GET /api/users` returns users scoped to the authenticated organization with no additional filtering.** Not explicitly documented.

### Assumptions

- Any authenticated user can list and view all users in their organization.
- Only OWNER can create, update, or delete users.
- Creating a user with OWNER role is not allowed via this endpoint (registered users are always created as sub-roles to the existing OWNER).

No architectural deviations found. All assumptions are within the spirit of "OWNER has administrative control, other roles have limited access" that the architecture implies but does not explicitly define.

⚠️ **Documented: partially. Assumptions: 4 identified. Deviations: 0.**

---

## 7. Final Verdict

### ⚠️ Ready to commit with documented assumptions

**Reasoning:**

The implementation is correct and secure:
- Cross-organization access is prevented at the repository layer through org-scoped queries.
- Repository `update`/`softDelete` cannot be called without first passing org-scoped `findById`.
- Role permissions (OWNER = full CRUD, others = read-only) are enforced via `requireRole` middleware.
- Password hashing reuses the Argon2id implementation from Step 4.1 — no duplicate hashing.
- All data queries are organization-scoped (except `findByEmail` for global uniqueness).
- All endpoints follow the layered architecture and documented API response formats.

**Assumptions requiring explicit documentation:**
1. Per-role CRUD permissions for the User module (OWNER = full, MANAGER = read-only, EMPLOYEE = read-only) are inferred, not documented.
2. Soft-deleted users return 404 (same as non-existent) — information leakage prevention.
3. `POST /api/users` restricts role to MANAGER | EMPLOYEE (OWNER cannot be created via this endpoint).
4. `GET /api/users` returns all non-deleted users in the authenticated organization.

If these assumptions are acceptable, the code is ready to commit. To eliminate the "⚠️" status, add explicit per-role CRUD rules for the User module to `10-authentication-policy.md`.
