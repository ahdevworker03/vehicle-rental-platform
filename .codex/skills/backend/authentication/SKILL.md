---
name: authentication
description: Authentication and authorization implementation with JWT, session-based authentication, OAuth2/OIDC integration, password hashing with bcrypt, token management, refresh tokens, route protection, role-based access control (RBAC), and security best practices. Applicable when implementing login/logout flows, protecting API routes, managing user sessions, integrating with OAuth providers, or designing authorization systems.
---

# Authentication

## Purpose

This skill guides the agent in implementing secure authentication and authorization for web applications following OWASP security standards and industry best practices. It covers password hashing, JWT management, session-based authentication, OAuth2/OIDC integration, token refresh strategies, route protection, role-based access control (RBAC), and security considerations. The skill prioritizes defense-in-depth and follows official security guidelines.

---

## When to Load

- User is implementing login, logout, registration, or password reset flows.
- User mentions: `authentication`, `auth`, `JWT`, `session`, `login`, `logout`, `register`, `password`, `bcrypt`, `OAuth`, `OIDC`, `OpenID`, `refresh token`, `access token`, `authorization`, `RBAC`, `permissions`, `roles`, `protected route`.
- User asks about securing API endpoints, managing user sessions, or integrating with identity providers.
- User is designing user roles, permissions, or access control systems.
- User is implementing middleware for route protection or token validation.

---

## When NOT to Load

- Pure frontend UI components without authentication logic (see `react` and `shadcn` skills).
- Database schema design unrelated to users or sessions (see `database-schema-design` skill).
- General API design decisions (see `api-design` skill).
- Infrastructure or deployment configuration.

---

## Core Principles

1. **Defense in Depth** – Implement multiple layers of security. Never rely on a single control.
2. **Never Roll Your Own Crypto** – Use established, battle-tested libraries for hashing, encryption, and token generation.
3. **Store Secrets Securely** – Never hardcode secrets. Use environment variables or secret management services.
4. **Least Privilege** – Users and services should have only the permissions they need.
5. **Secure by Default** – Assume all endpoints are protected unless explicitly marked public.
6. **Log, But Don't Log Secrets** – Log authentication events for auditing, but never log passwords, tokens, or session IDs.
7. **Use HTTPS Everywhere** – Always use HTTPS in production. Never transmit credentials over HTTP.
8. **Implement Rate Limiting** – Protect authentication endpoints from brute force attacks.

---

## Decision Rules

### Authentication Strategy Selection

- **IF** the application is a traditional server-rendered web app with server-side sessions, **THEN** use session-based authentication with HTTP-only cookies.
- **IF** the application is an API-first, SPA, or mobile app, **THEN** use JWT-based authentication with access and refresh tokens.
- **IF** the application needs to integrate with external identity providers (Google, GitHub, Microsoft), **THEN** use OAuth2/OIDC.
- **IF** the application is internal or enterprise with existing SSO, **THEN** integrate with SAML or OIDC.
- **DO NOT** mix authentication strategies unnecessarily; choose one primary approach.

### Password Storage

- **ALWAYS** hash passwords using bcrypt with a work factor of 10–12 (or higher for increased security).
- **NEVER** store passwords in plain text, encrypted, or using weak hashing algorithms (MD5, SHA1, SHA2 without salt).
- **IF** using bcrypt, **THEN** include the salt in the hash output (bcrypt handles this automatically).
- **IF** user rehashes password, **THEN** use a new salt for each hashing operation.

### JWT Management

- **IF** using JWT, **THEN** store the token in HTTP-only cookies for web apps, or in secure storage for mobile/native apps.
- **IF** storing JWT in localStorage/sessionStorage, **THEN** be aware of XSS risks; prefer HTTP-only cookies.
- **IF** using JWT with short-lived access tokens, **THEN** implement refresh tokens for obtaining new access tokens.
- **IF** implementing refresh tokens, **THEN** store refresh tokens in the database and invalidate them on logout or suspicious activity.
- **ALWAYS** sign JWT with a strong secret (HS256) or public/private key pair (RS256, ES256).
- **ALWAYS** set a reasonable expiration time for access tokens (e.g., 15 minutes) and refresh tokens (e.g., 7–30 days).
- **ALWAYS** validate JWT signature, expiration (`exp`), and audience (`aud`) claims.

### Authorization (RBAC)

- **IF** users have different roles (admin, user, moderator), **THEN** implement role-based access control (RBAC).
- **IF** permissions are fine-grained, **THEN** implement attribute-based or policy-based access control.
- **ALWAYS** check authorization on the server-side. Never trust client-side checks.
- **IF** a user attempts to access a resource, **THEN** check both authentication (who they are) and authorization (what they can do).

### Session Management

- **IF** using sessions, **THEN** store session data securely (database or Redis) and use signed cookies.
- **IF** using sessions, **THEN** set session cookies with `HttpOnly`, `Secure`, `SameSite=Lax` or `Strict`.
- **IF** implementing logout, **THEN** clear session data on the server-side and clear cookies on the client-side.

---

## Best Practices

1. **Use established authentication libraries** – For Node.js/Express, use Passport.js, Auth0, or NextAuth.js. These are battle-tested and support multiple strategies.
2. **Hash passwords with bcrypt** – Always use bcrypt with a work factor of 10–12:
   ```ts
   const saltRounds = 12;
   const hash = await bcrypt.hash(password, saltRounds);
   ```
3. **Validate password strength** – Enforce minimum password length (8+ characters), complexity, and check against common passwords.
4. **Implement account lockout** – Lock accounts after multiple failed login attempts to prevent brute force.
5. **Use CORS appropriately** – Restrict allowed origins to trusted domains only.
6. **Implement rate limiting** – Limit login attempts, registration, password reset, and token refresh endpoints:
   ```ts
   // 5 attempts per IP per 15 minutes for login
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5,
     message: "Too many login attempts, please try again later.",
   });
   ```
7. **Protect routes with middleware** – Implement middleware that checks authentication and authorization before processing requests.
8. **Implement `logout` endpoint** – Clear tokens/sessions and invalidate refresh tokens on the server.
9. **Use `helmet` and security headers** – Protect against XSS, clickjacking, and other attacks.
10. **Implement email verification** – Verify email addresses during registration to prevent fake accounts.

---

## Anti-Patterns

| Anti-Pattern                             | Why it is wrong                                                      | Correct approach                                                     |
| ---------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Storing passwords in plain text          | Complete security failure; any data breach exposes all passwords.    | Always hash with bcrypt, Argon2, or scrypt.                          |
| Rolling your own crypto/hashing          | Insecure by design; lacks proper salting, iteration, and algorithms. | Use battle-tested libraries like bcrypt.                             |
| Storing JWT in localStorage              | Vulnerable to XSS attacks; any injected script can steal tokens.     | Use HTTP-only cookies for web apps.                                  |
| Long-lived JWT without refresh           | If token is compromised, attacker has permanent access.              | Use short-lived access tokens + refresh tokens.                      |
| Not validating JWT signature             | Attacker can forge tokens; authentication bypass.                    | Always verify signature using the correct secret/key.                |
| Trusting client-side role checks         | User can modify client-side code to bypass checks.                   | Always enforce authorization server-side.                            |
| Logging passwords or tokens              | Exposes sensitive data in logs; security risk.                       | Never log credentials; use sanitized logs.                           |
| Using `localhost` in OAuth redirects     | Breaks in production; security risk.                                 | Use proper domain names in OAuth configurations.                     |
| Not handling token expiration gracefully | Users see unhelpful error messages.                                  | Implement token refresh flows and user-friendly expiration handling. |

---

## Common Mistakes & Edge Cases

| Mistake                                       | Symptom                                             | Solution                                                                       |
| --------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| Missing JWT secret in environment             | Token validation fails; application crashes.        | Always set JWT_SECRET in environment variables.                                |
| Not validating email during registration      | Fake accounts and email bounces.                    | Send verification email; require confirmation.                                 |
| Forgetting `HttpOnly` on cookies              | Session cookie accessible via JavaScript; XSS risk. | Set `HttpOnly: true` for all session cookies.                                  |
| Using `SameSite: None` without `Secure`       | Cookies sent over HTTP; security risk.              | Use `SameSite=Lax` or `Strict` and `Secure: true`.                             |
| Not invalidating refresh tokens on logout     | Users can still obtain new tokens after logout.     | Maintain refresh token allowlist; remove on logout.                            |
| JWT contains sensitive data                   | Exposes PII or secrets in token payload.            | Store only non-sensitive claims (user ID, role).                               |
| OAuth redirect URI mismatch                   | OAuth flow fails with redirect error.               | Ensure exact matching of redirect URIs in OAuth provider config.               |
| Password reset token not expiring             | Token can be used indefinitely.                     | Set short expiration (e.g., 1 hour) for reset tokens.                          |
| Not implementing password change confirmation | Users accidentally change password to wrong value.  | Require current password + new password + confirm new.                         |
| Error messages leaking user existence         | Username enumeration vulnerability.                 | Return generic "Invalid credentials" for both missing user and wrong password. |

---

## Related Skills

- `express` – for implementing authentication middleware and route protection.
- `prisma` / `database-schema-design` – for user and session models.
- `validation` – for validating login credentials, registration inputs, and token requests.
- `api-design` – for consistent authentication endpoint structures.
- `security` – for additional security best practices and hardening.
- `logging-monitoring` – for auditing authentication events.

---

## Official References

- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [JWT Introduction (jwt.io)](https://jwt.io/introduction)
- [JWT RFC 7519](https://tools.ietf.org/html/rfc7519)
- [OAuth 2.0 RFC 6749](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [Passport.js Documentation](https://www.passportjs.org/docs/)
- [bcrypt Documentation](https://www.npmjs.com/package/bcrypt)
- [HTTP Cookie Security – MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
