---
name: checklists
description: Production-ready checklists for code review, security, deployment, testing, performance, database migrations, API design, and accessibility. Applicable when preparing for release, reviewing code, conducting security audits, or ensuring quality standards are met before merging or deploying.
---

# Checklists

## Purpose

This skill provides comprehensive, actionable checklists for common development activities. Checklists ensure consistency, reduce errors, and help teams follow best practices systematically. Use these checklists as a reference during code review, deployment, security audits, testing, performance optimization, and other critical processes. Each checklist is derived from official sources and industry best practices.

---

## When to Load

- User is preparing a pull request or code review.
- User mentions: `checklist`, `pre-deployment`, `security review`, `release checklist`, `code review checklist`, `testing checklist`.
- User asks about verifying completeness before merging, deploying, or shipping.
- User is conducting a security audit or performance review.
- User is preparing a new release or setting up a production deployment.

---

## When NOT to Load

- Writing new code without review or deployment context.
- General architecture design or planning.
- Infrastructure or deployment configuration unrelated to checklists.
- Technology-specific implementation without quality assurance processes.

---

## Code Review Checklist

### Correctness

- [ ] Does the code solve the problem described in the PR?
- [ ] Are edge cases handled (empty states, null/undefined, invalid input)?
- [ ] Are error handling and logging in place for all possible failure paths?
- [ ] Are all new code paths covered by tests?

### Security

- [ ] Is all user input validated and sanitized?
- [ ] Are there any hardcoded secrets or credentials?
- [ ] Are authentication and authorization checks present where needed?
- [ ] Are SQL injection and XSS vulnerabilities prevented (parameterized queries, sanitization)?
- [ ] Are sensitive data (passwords, tokens, PII) not logged or exposed?

### Performance

- [ ] Are there any N+1 queries or unnecessary database round trips?
- [ ] Is pagination or limiting used for large result sets?
- [ ] Are expensive computations memoized or cached?
- [ ] Are indexes added for new query patterns?

### Maintainability

- [ ] Is the code readable, with meaningful variable and function names?
- [ ] Is the code DRY (Don't Repeat Yourself) – no unnecessary duplication?
- [ ] Are complex logic blocks well-commented?
- [ ] Does the code follow project conventions (naming, file structure, patterns)?
- [ ] Are dependencies justified and well-maintained?

### Testing

- [ ] Are there tests for the new code (unit, integration, or E2E as appropriate)?
- [ ] Do tests cover both happy paths and error paths?
- [ ] Are tests independent and isolated?
- [ ] Do all existing tests pass?

### Documentation

- [ ] Are OpenAPI/API docs updated for new/changed endpoints?
- [ ] Is the README or relevant documentation updated?
- [ ] Are inline comments sufficient for complex logic?

---

## Security Audit Checklist

### Authentication & Authorization

- [ ] Passwords hashed with bcrypt/Argon2/scrypt with sufficient work factor.
- [ ] JWT or session tokens have appropriate expiration times.
- [ ] Tokens stored securely (HTTP-only cookies, not localStorage).
- [ ] OAuth/OIDC redirect URIs validated; state parameter used.
- [ ] Password reset tokens have short expiration and are invalidated after use.
- [ ] Role-based access control enforced server-side (not client-side).
- [ ] Rate limiting applied to authentication endpoints.

### Data Protection

- [ ] All sensitive data encrypted at rest (database, storage).
- [ ] TLS/HTTPS enforced for all connections (production).
- [ ] PII, passwords, tokens not logged or exposed in responses.
- [ ] Sensitive fields omitted or masked in API responses.
- [ ] Third-party services meet security compliance standards.

### Input Validation & Sanitization

- [ ] All user input validated with schema (Zod/Joi/etc.).
- [ ] SQL injection prevented (parameterized queries or ORM).
- [ ] XSS prevented (sanitize user-generated HTML/JS output).
- [ ] File uploads validated (type, size, content) and stored securely outside web root.
- [ ] CSRF protection implemented (tokens or SameSite cookies).

### Security Headers & Configuration

- [ ] Helmet.js or equivalent security headers set (X-Content-Type-Options, X-Frame-Options, CSP, HSTS).
- [ ] CORS restricted to trusted origins.
- [ ] Cookies set with HttpOnly, Secure, SameSite attributes.
- [ ] Environment variables used for secrets; no hardcoded values.
- [ ] Dependencies scanned for vulnerabilities (npm audit, Snyk).

### Monitoring & Incident Response

- [ ] Authentication attempts (success/failure) logged.
- [ ] Authorization failures logged.
- [ ] Anomaly alerts set up (e.g., multiple failed logins, unusual geographic access).
- [ ] Incident response plan documented and tested.
- [ ] Secrets rotation plan in place.

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing in CI (unit, integration, E2E).
- [ ] Code reviewed and approved by at least one team member.
- [ ] All PR comments resolved.
- [ ] Build succeeds in CI without warnings/errors.
- [ ] Environment variables validated (all required are set).
- [ ] Database migrations created and tested (backward-compatible if zero-downtime required).
- [ ] Rollback plan documented and tested.
- [ ] Monitoring and alerts configured for the new release.

### Deployment Steps

- [ ] Run migrations (if any) before starting the application.
- [ ] Deploy application to staging environment (if applicable) for final verification.
- [ ] Deploy to production using the chosen strategy (blue-green, canary, rolling).
- [ ] Verify health checks pass after deployment.
- [ ] Monitor error rates and performance metrics for 15 minutes after deployment.
- [ ] Verify critical user flows (login, signup, key features) work.

### Post-Deployment

- [ ] Logs checked for any unexpected errors.
- [ ] Rollback tested in staging (if not already).
- [ ] Documentation updated if necessary.
- [ ] Team notified of successful deployment.
- [ ] All monitoring dashboards updated.

---

## Performance Checklist

### Frontend (React)

- [ ] Production build used (NODE_ENV=production).
- [ ] Bundle size analyzed (webpack-bundle-analyzer) and optimized.
- [ ] Code splitting implemented for large components/routes (React.lazy).
- [ ] Long lists virtualized (react-window).
- [ ] Components memoized where necessary (React.memo, useMemo, useCallback).
- [ ] Images lazy loaded and optimized (WebP/AVIF, srcset).
- [ ] Font loading optimized (font-display: swap).
- [ ] Lighthouse performance score > 90 (or target).

### Backend (Express)

- [ ] Asynchronous operations used; no blocking sync functions.
- [ ] Compression enabled (compression middleware).
- [ ] Caching implemented for frequently accessed data (Redis/in-memory).
- [ ] Connection pooling configured (Prisma handles this automatically).
- [ ] Static assets served via CDN.
- [ ] Rate limiting in place.

### Database (PostgreSQL)

- [ ] Appropriate indexes created on frequently queried columns.
- [ ] `EXPLAIN ANALYZE` used to verify query performance.
- [ ] Database statistics up-to-date (ANALYZE run after bulk changes).
- [ ] Autovacuum enabled to prevent bloat.
- [ ] Connection pool size optimized (Prisma's default is usually fine).
- [ ] Pagination used for large result sets.
- [ ] Sensitive queries monitored for performance issues.

### Monitoring

- [ ] Core Web Vitals being collected (LCP, INP, CLS).
- [ ] API response times monitored (p95, p99).
- [ ] Database query latency monitored.
- [ ] Error rates tracked.
- [ ] Alerts configured for performance degradation.

---

## Testing Checklist

### Unit Tests

- [ ] All critical utility functions tested.
- [ ] Edge cases and error paths covered.
- [ ] Test names describe behavior clearly.
- [ ] Tests isolated and independent.
- [ ] Mocking used appropriately (only external dependencies).

### Integration Tests (API)

- [ ] All endpoints tested for expected status codes and response structures.
- [ ] Authentication and authorization tested for protected routes.
- [ ] Validation errors tested.
- [ ] Database state reset between tests.

### Component Tests (React)

- [ ] User interactions tested (clicks, input, form submission).
- [ ] Accessibility queried (getByRole, getByText).
- [ ] Error states displayed correctly.
- [ ] Loading states handled.
- [ ] State updates tested with act/waitFor.

### End-to-End Tests

- [ ] Critical user journeys tested (login, signup, checkout, dashboard).
- [ ] Cross-browser compatibility verified if required.
- [ ] Tests run in CI and are stable.
- [ ] Screenshots/recording on failure for debugging.

### General

- [ ] Code coverage met for critical modules (>80%).
- [ ] All tests passing before merging.
- [ ] Flaky tests fixed or disabled.

---

## Database Migration Checklist

### Pre-Migration

- [ ] Migration tested in development and staging environments.
- [ ] Backup taken (database snapshot).
- [ ] Migration documented (changes and rationale).
- [ ] Rollback migration available (if possible).
- [ ] Migration performance assessed (time to run on production-sized data).

### Migration Execution

- [ ] Run migrations during low-traffic window (if significant downtime expected).
- [ ] Use `prisma migrate deploy` in production (never `migrate dev`).
- [ ] Monitor migration logs for errors.
- [ ] Verify application works with new schema after migration.

### Zero-Downtime Considerations

- [ ] Backward-compatible changes: new columns nullable with default, new tables, indexes.
- [ ] For breaking changes, use multi-step approach (add, backfill, switch, drop).
- [ ] Ensure application can handle both old and new schema during transition.

---

## API Design Checklist

### Endpoint Design

- [ ] Resource names are plural nouns (e.g., `/users`, `/orders`).
- [ ] HTTP methods used correctly (GET, POST, PUT, PATCH, DELETE).
- [ ] Status codes appropriate (200, 201, 204, 400, 401, 403, 404, 422, 500).
- [ ] Versioning strategy in place (e.g., `/api/v1`).

### Request/Response

- [ ] Request and response bodies use consistent format (e.g., `{ data: ... }`).
- [ ] Error responses include code, message, and details (if needed).
- [ ] Query parameters documented (pagination, filtering, sorting).
- [ ] Validation errors return field-specific details.

### Documentation

- [ ] OpenAPI specification updated for all endpoints.
- [ ] Examples provided for success and error responses.
- [ ] Authentication requirements documented.
- [ ] Rate limiting and usage policies documented.

---

## Accessibility Checklist

### Semantic HTML

- [ ] Use correct HTML elements: `<button>`, `<a>`, `<input>`, `<label>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<table>`.
- [ ] Use `<form>` with proper `<label>` associations (htmlFor/id).
- [ ] Landmarks used: `<main>`, `<nav>`, `<aside>`, `<footer>`, `<header>`.

### Keyboard Navigation

- [ ] All interactive elements focusable and operable via keyboard.
- [ ] Focus order logical and visible.
- [ ] No focus traps.
- [ ] Skip link provided to skip navigation.

### ARIA

- [ ] ARIA roles used only when semantic HTML is insufficient.
- [ ] `aria-label`, `aria-labelledby`, `aria-describedby` used where needed.
- [ ] `aria-hidden="true"` for decorative content.
- [ ] `aria-live` for dynamic updates.

### Color and Contrast

- [ ] Text and interactive elements meet WCAG AA contrast ratios (4.5:1 normal, 3:1 large).
- [ ] Color not the only means of conveying information.
- [ ] Focus indicators visible.

### Screen Reader Compatibility

- [ ] Images have `alt` text (or `alt=""` for decorative).
- [ ] Form fields have associated labels.
- [ ] Error messages announced by screen readers.
- [ ] Dynamic content updates announced via `aria-live`.

---

## Related Skills

- `code-review` – for applying the code review checklist.
- `security` – for applying the security checklist.
- `deployment` – for applying the deployment checklist.
- `performance` – for applying the performance checklist.
- `testing` – for applying the testing checklist.
- `migrations` – for applying the migration checklist.
- `api-design` – for applying the API design checklist.
- `accessibility` – for applying the accessibility checklist.

---

## Official References

- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Google Code Review Developer Guide](https://google.github.io/eng-practices/review/)
- [Google Code Review – What to Look For](https://google.github.io/eng-practices/review/reviewer/looking-for.html)
- [Web.dev – Measure Core Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [OpenAPI Specification – Best Practices](https://swagger.io/docs/specification/best-practices/)
- [Prisma Migration Best Practices](https://www.prisma.io/docs/orm/prisma-migrate/workflows/developing-with-prisma-migrate)
- [Testing Library – Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)
- [Atlassian – Code Review Best Practices](https://www.atlassian.com/agile/software-development/code-reviews)
- [Refactoring Guru – Code Smells](https://refactoring.guru/refactoring/smells)
