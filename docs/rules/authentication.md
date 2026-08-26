# Authentication & Authorization Rules

These rules define how authentication and access control work in this repository. The full policy lives in `docs/architecture/10-authentication-policy.md`.

## Roles

Only these roles exist:

```text
PLATFORM_OWNER
OWNER
EMPLOYEE
```

Do not introduce:

```text
MANAGER
CLIENT
```

Normal tenant registration creates an `OWNER`, not a `PLATFORM_OWNER`.

## Tokens

- The access and refresh token strategy follows the approved authentication policy and configuration.
- Validate required JWT properties according to the current authentication infrastructure.
- Refresh tokens rotate and are single-use.
- Store refresh tokens only in the approved hashed representation; never the raw value.
- Revoke or invalidate tokens according to the logout/refresh policy.
- Do not invent or change token lifetimes during unrelated feature work.

## Passwords and Secrets

- Hash passwords with Argon2id using the project's approved authentication configuration.
- Do not rely on unspecified library defaults as the policy.
- Never store plaintext passwords.
- Secrets come from environment/configuration; never hard-code them.
- Use separate secrets for access and refresh tokens.
- Never log tokens, hashes, reset tokens, invitation tokens, or secrets.

## Authorization

- Backend authorization is authoritative.
- Use the established `requireRole` role middleware for role-gated routes.
- Follow least privilege.
- Frontend checks are not security boundaries.

## Tenant Context

- For ordinary tenant-scoped users and operations, the authenticated JWT/server context is authoritative for organization identity.
- Do not trust client-supplied organization identifiers for tenant operations when tenant context is already authenticated.
- `PLATFORM_OWNER` platform-administration operations may explicitly target another organization only through approved platform-level authorization paths.
- Do not use ordinary tenant endpoints as a workaround for platform administration.

## Changes

- Authentication strategy or role-model changes are architectural/product changes and follow the normal design-decision workflow (`docs/rules/design-decisions.md`).
