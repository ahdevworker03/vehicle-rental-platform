# Authentication Policy

This document defines the approved authentication architecture and implementation policies for the platform.

It is the single source of truth for authentication and security decisions. All authentication-related implementation must follow this document.

---

## Authentication Method

The platform uses:

- Email and password authentication.
- JWT-based authentication.
- An Access Token + Refresh Token architecture.

Users authenticate with their email and password. On successful authentication, the backend issues an access token and a refresh token. The access token authenticates API requests. The refresh token allows the client to obtain new access tokens without requiring the user to log in again.

---

## JWT Policy

- **Algorithm:** HS256
- **Issuer:** `vehicle-rental-platform`
- **Audience:** `vehicle-rental-api`

Required claims:

| Claim  | Purpose                                                                       |
| ------ | ----------------------------------------------------------------------------- |
| `sub`  | The authenticated user ID. Identifies which user the token represents.        |
| `org`  | The user's organization ID. Carries the organization context for the request. |
| `role` | The user's assigned role. Used for authorization decisions.                   |

Every access token must include all three claims. The backend validates the algorithm, issuer, and audience on every verification.

---

## Token Lifetimes

- **Access Token:** 15 minutes
- **Refresh Token:** 30 days

Short-lived access tokens limit the window in which a stolen token can be used. If an access token is compromised, it expires quickly.

Longer-lived refresh tokens provide persistent sessions so users remain signed in until they explicitly log out. The refresh token is only exchanged for new access tokens, which keeps long-lived credentials from being used directly on every request.

---

## Password Policy

- Passwords are never stored in plaintext.
- Password hashing algorithm: **Argon2id**.
- Use the library's recommended default parameters.
- Password verification uses Argon2id.

Only secure password hashes are stored. Authentication compares the submitted password against the stored hash.

---

## Secret Management

- Secrets are loaded only from environment variables.
- Never hard-code secrets.
- Separate secrets are used for access tokens and refresh tokens.

Required environment variables:

- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`

Separating the two secrets limits the impact of a single secret being compromised.

---

## Refresh Token Policy

- Refresh tokens are long-lived authentication credentials.
- Refresh token rotation is required.
- Every successful refresh issues a new refresh token.
- The previous refresh token is immediately invalidated.
- Logging out revokes refresh tokens.

Rotation ensures that a refresh token is single-use. Once used to obtain new tokens, it can no longer be used again.

---

## Refresh Token Storage

- Refresh tokens must never be stored in plaintext.
- Only a cryptographic hash of the refresh token is stored.
- The raw refresh token is returned to the client only once.
- A database compromise must not expose usable refresh tokens.

The specific hashing implementation is an implementation detail and is not prescribed by this document.

---

## Authorization

Authorization uses Role-Based Access Control (RBAC).

Current supported role:

- `OWNER`

Future roles:

- `MANAGER`
- `EMPLOYEE`

Permissions are determined by the user's assigned role. The backend is responsible for enforcing all authorization rules.

---

## Organization Isolation

- Every authenticated user belongs to exactly one organization.
- Every authenticated request carries the organization context.
- Users cannot access data outside their own organization.

The organization identity is derived from authentication, not supplied by the client.

- The authenticated organization ID is obtained from `req.user.org`.
- `req.user.org` originates from the validated JWT `org` claim.
- Clients cannot request another organization's data by providing an organization ID.

Because every authenticated user belongs to exactly one organization, the API derives the organization context from authentication instead of a URL parameter. This reduces the attack surface and prevents cross-organization access caused by user-controlled organization identifiers.

Organization boundaries are enforced by the backend and the database.

---

## Security Principles

- Least privilege.
- Never store secrets in plaintext.
- Validate every JWT.
- Validate every request.
- Rotate refresh tokens.
- Revoke tokens on logout.
- Use HTTPS in production.
- Never trust client input.
- Follow secure defaults.

---

### Tenant Context Rule

The authenticated organization (`req.user.org`) is the single source of truth for tenant context.

Repositories, services, and controllers must never trust a client-supplied organization identifier when the authenticated organization is already known.

Organization-owned resources must always be queried using the authenticated organization context to guarantee tenant isolation.

Exceptions must be explicitly documented and justified in the architecture.

---

## Future Authentication Features

The following features are intentionally deferred and are not part of the current scope:

- Password reset
- Email verification
- Multi-factor authentication (MFA)
- OAuth providers
- Session management improvements
- Advanced refresh token reuse detection

---

> This document defines the approved authentication policy for the project. Any changes to these policies are architectural decisions and must be explicitly approved before implementation.
