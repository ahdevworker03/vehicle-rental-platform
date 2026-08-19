---
name: security
description: Web application security, OWASP Top 10 vulnerability prevention, authentication and authorization security, secure coding practices, data encryption, HTTPS/TLS configuration, SQL injection prevention, XSS prevention, CSRF protection, security headers, rate limiting, input validation, secure session management, dependency scanning, and security monitoring. Applicable when implementing security measures, reviewing code for vulnerabilities, configuring security middleware, or responding to security incidents.
---

# Security

## Purpose

This skill guides the agent in implementing comprehensive security measures across the application stack following OWASP standards and industry best practices. Security is not a feature but a fundamental property of the system — it must be built in from the start, not bolted on later. The skill covers authentication, authorization, data protection, common vulnerability prevention, secure configuration, and security monitoring.

---

## When to Load

- User is implementing security features, reviewing code for vulnerabilities, or hardening the application.
- User mentions: `security`, `OWASP`, `XSS`, `CSRF`, `SQL injection`, `CORS`, `helmet`, `encryption`, `hashing`, `rate limiting`, `validation`, `sanitization`.
- User is configuring authentication, authorization, or session management.
- User asks about securing API endpoints, protecting data, or preventing common attacks.
- User is performing a security audit or setting up security monitoring.

---

## When NOT to Load

- General feature development without security implications.
- Pure frontend UI design without data handling or authentication.
- Infrastructure or deployment configuration (unless directly security-related).
- General TypeScript or code style discussions.

---

## Core Principles

1. **Defense in Depth** – Implement multiple layers of security controls. If one layer fails, others still protect the system.
2. **Least Privilege** – Users, services, and processes should have only the minimum permissions necessary.
3. **Secure by Default** – Default configurations should be secure. Assume all endpoints are protected unless explicitly public.
4. **Never Trust User Input** – Validate, sanitize, and escape all input from users. All external data is potentially malicious.
5. **Don't Roll Your Own Crypto** – Use established, battle-tested libraries for encryption, hashing, and key generation.
6. **Fail Securely** – Failures should not expose sensitive information or grant unintended access.
7. **Log, Monitor, Alert** – Log security-relevant events, monitor for anomalies, and alert on suspicious activity.

---

## Decision Rules

### Authentication & Authorization

- **IF** implementing password storage, **THEN** always use bcrypt, Argon2, or scrypt with appropriate work factors (bcrypt: 10–12).
- **IF** storing session tokens or JWTs, **THEN** set short expiration times (15 minutes for access tokens, 7–30 days for refresh tokens).
- **IF** using JWT, **THEN** store tokens in HTTP-only cookies for web applications (not localStorage) to prevent XSS theft.
- **IF** implementing OAuth2/OIDC, **THEN** validate redirect URIs and use state parameters to prevent CSRF.
- **IF** implementing authorization, **THEN** use role-based access control (RBAC) or attribute-based access control (ABAC) and enforce checks server-side.
- **IF** implementing password reset, **THEN** use tokens with short expiration (1 hour) and invalidate them after use.
- **IF** implementing login, **THEN** implement rate limiting to prevent brute force attacks.

### Data Protection

- **IF** storing sensitive data (PII, payment info, credentials), **THEN** encrypt it at rest using AES-256 or better.
- **IF** transmitting sensitive data, **THEN** enforce TLS 1.2+ (HTTPS) in production.
- **IF** logging data, **THEN** never log passwords, tokens, session IDs, credit card numbers, or personal information.
- **IF** returning data in API responses, **THEN** omit or mask sensitive fields using `select` or `omit` in Prisma.
- **IF** using third-party services, **THEN** ensure they meet security compliance standards (SOC2, ISO 27001, etc.).

### Common Vulnerability Prevention

- **IF** constructing SQL queries with user input, **THEN** always use parameterized queries or Prisma ORM (which is safe by default).
- **IF** returning user-generated content in HTML, **THEN** sanitize it to prevent XSS (use libraries like DOMPurify).
- **IF** using cookies, **THEN** set `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict` attributes.
- **IF** accepting user-uploaded files, **THEN** validate file types, scan for malware, and store them in a secure location outside the web root.
- **IF** implementing forms, **THEN** use CSRF tokens (or use SameSite=Strict cookies + anti-CSRF headers).
- **IF** using CORS, **THEN** restrict allowed origins to trusted domains only — never use `*` in production.

### Infrastructure Security

- **IF** deploying to production, **THEN** always use HTTPS (TLS 1.2 or higher) for all traffic.
- **IF** using environment variables, **THEN** store secrets in a secure store (Vercel Secrets, AWS Secrets Manager, Docker Secrets) — never in code.
- **IF** using containers (Docker), **THEN** use minimal base images, scan for vulnerabilities, and run as a non-root user.
- **IF** using CI/CD, **THEN** never expose secrets in logs; use CI/CD secret stores.
- **IF** using cloud services, **THEN** follow the principle of least privilege for IAM roles.

### Monitoring and Incident Response

- **ALWAYS** log authentication attempts (success and failure), authorization failures, and critical operations.
- **ALWAYS** set up alerts for anomalous activity (e.g., many failed logins, unusual geographic access patterns).
- **IF** a security incident occurs, **THEN** follow a documented incident response plan with clear steps for containment, analysis, and recovery.
- **IF** a vulnerability is discovered, **THEN** prioritize fixing it based on severity and potential impact.

---

## Best Practices

### Application Security

1. **Use security middleware in Express** – Add `helmet()` early in the middleware chain to set secure HTTP headers.
2. **Validate all input** – Use Zod or similar to validate request bodies, query parameters, and URL parameters. Never trust user input.
3. **Implement rate limiting** – Use `express-rate-limit` to limit repeated requests to authentication endpoints and API endpoints:
   ```ts
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // 100 requests per windowMs
     message: "Too many requests, please try again later.",
   });
   ```
4. **Sanitize output** – Escape or sanitize user-generated content before returning it to the client.
5. **Use secure cookie options**:
   ```ts
   res.cookie("token", token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax",
     maxAge: 15 * 60 * 1000, // 15 minutes
   });
   ```
6. **Implement proper CORS** – Restrict allowed origins, methods, and headers:
   ```ts
   const corsOptions = {
     origin: ["https://example.com", "https://app.example.com"],
     methods: ["GET", "POST", "PUT", "DELETE"],
     allowedHeaders: ["Content-Type", "Authorization"],
     credentials: true,
   };
   app.use(cors(corsOptions));
   ```
7. **Validate file uploads** – Check file type, size, and content. Store files outside the web root and serve them via a controlled endpoint.
8. **Use secure headers** – Helmet.js sets headers like `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Content-Security-Policy`.

### Database Security

1. **Use environment-specific database credentials** – Never use the same credentials across environments.
2. **Grant minimum permissions** – Database users should have only the permissions they need (SELECT, INSERT, UPDATE, DELETE on specific tables).
3. **Enable SSL/TLS for database connections** – This prevents data interception and man-in-the-middle attacks.
4. **Use row-level security (RLS) in PostgreSQL** – Enforce tenant isolation at the database level for multi-tenant applications.
5. **Encrypt sensitive columns** – Use PostgreSQL's `pgcrypto` extension for column-level encryption of sensitive data (e.g., email, phone numbers, PII).

### Dependency Security

1. **Regularly scan dependencies for vulnerabilities** – Use `npm audit`, `yarn audit`, or Snyk to identify and fix vulnerable packages.
2. **Use automated dependency updates** – Use Dependabot or Renovate to automatically create PRs for security patches.
3. **Maintain an allowlist of approved packages** – Avoid including packages that are unnecessary or have a high risk profile.
4. **Use a software composition analysis (SCA) tool** – This helps identify known vulnerabilities in open-source dependencies.

---

## Anti-Patterns

| Anti-Pattern                                   | Why it is wrong                                              | Correct approach                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Storing passwords in plain text                | Complete security failure; any breach exposes all passwords. | Hash with bcrypt, Argon2, or scrypt.                                     |
| Trusting client-side validation                | Security risk; client validation can be bypassed.            | Always validate server-side.                                             |
| Using `eval()` or `new Function()`             | Arbitrary code execution risk; XSS and RCE.                  | Avoid entirely; use JSON.parse for data.                                 |
| Exposing stack traces to clients               | Leaks sensitive internal details.                            | Hide stack traces in production (NODE_ENV=production).                   |
| Using `localhost` in CORS origins              | Breaks in production; allows open CORS.                      | Use domain names explicitly.                                             |
| Using a single secret for all purposes         | One compromised secret breaks everything.                    | Use separate secrets for different purposes (JWT, encryption, sessions). |
| Disabling security headers (`helmet` disabled) | Exposes the app to XSS, clickjacking, and other attacks.     | Enable `helmet` with default settings.                                   |
| Using `*` for CORS                             | Allows any domain to access your API.                        | Restrict CORS to trusted origins.                                        |
| Not rotating secrets                           | Compromised secrets remain valid indefinitely.               | Rotate secrets periodically and immediately after any incident.          |
| Hardcoding secrets in code                     | Secrets exposed in version control.                          | Use environment variables and secret management.                         |

---

## Common Mistakes & Edge Cases

| Mistake                                           | Symptom                                        | Solution                                                    |
| ------------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| Forgetting to validate email during registration  | Invalid or fake emails in the database.        | Implement email verification.                               |
| Using `SameSite=None` without `Secure`            | Cookie sent over HTTP; security risk.          | Set `SameSite=Lax` or `Strict` and `Secure: true`.          |
| Not hashing passwords with sufficient work factor | Brute force attacks easier.                    | Use bcrypt with work factor 10–12.                          |
| Not using `helmet` in production                  | Missing security headers.                      | Add `helmet()` early in middleware.                         |
| Not invalidating sessions on logout               | Users can still access resources after logout. | Invalidate sessions/tokens server-side.                     |
| Not using `CSP` (Content Security Policy)         | XSS attacks possible.                          | Implement CSP headers via `helmet.contentSecurityPolicy()`. |
| Exposing internal IPs in error messages           | Leaks internal network details.                | Use generic error messages in production.                   |
| Not using `prepared statements` in raw SQL        | SQL injection vulnerability.                   | Always use parameterized queries or Prisma ORM.             |
| Forgetting to set `HttpOnly` on cookies           | Cookies accessible via JavaScript; XSS risk.   | Always set `HttpOnly` for session cookies.                  |

---

## Related Skills

- `authentication` – for implementing secure authentication flows and authorization.
- `validation` – for validating and sanitizing user input to prevent injection attacks.
- `express` – for implementing security middleware and secure configuration.
- `postgresql` – for database security, encryption, and row-level security.
- `prisma` – for safe query execution and data access.
- `deployment` – for secure deployment practices and infrastructure hardening.
- `logging-monitoring` – for security monitoring and incident detection.

---

## Official References

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)
- [Prisma Security Best Practices](https://www.prisma.io/docs/orm/overview/prisma-in-your-stack/security-best-practices)
- [JWT Security Best Practices](https://auth0.com/blog/10-things-you-should-know-about-tokens-and-cookies/)
- [CORS Documentation (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Cookie Security (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#security)
- [Content Security Policy (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
