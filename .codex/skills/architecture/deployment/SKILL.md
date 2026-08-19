---
name: deployment
description: Deployment strategy for this repository, especially Vercel for `apps/web` and container or server deployment for `apps/api`. Applicable when deploying applications to production, configuring CI/CD pipelines, setting up environment-specific configurations, planning deployment strategies, or implementing rollback procedures.
---

# Deployment

## Purpose

This skill guides the agent in deploying production-ready applications following industry best practices and official documentation from Vercel, Docker, and related tools. It covers environment configuration, CI/CD integration, deployment strategies, security hardening, monitoring, and rollback procedures. The goal is to ensure reliable, secure, and repeatable deployments with minimal downtime and risk.

---

## When to Load

- User is setting up deployment pipelines, configuring environments, or planning production releases.
- User mentions: `deployment`, `deploy`, `production`, `staging`, `environment`, `CI/CD`, `build`, `release`, `rollback`, `zero-downtime`, `container`, `Docker`, `Vercel`.
- User is configuring environment variables, build scripts, or deployment scripts.
- User is planning the release process or setting up monitoring for production.
- User is implementing rollback strategies or backup procedures.

---

## When NOT to Load

- Pure development or local setup without deployment implications.
- Database schema design or migrations (see `migrations` and `database-schema-design` skills).
- General API design or implementation (see `api-design` and `express` skills).
- Frontend or React component development (see `react` and `data-fetching` skills).

---

## Core Principles

1. **Infrastructure as Code** – Define all infrastructure, configurations, and environment settings in code. Use version control to track and review changes.
2. **Environment Consistency** – Minimize differences between environments (development, staging, production). Use the same configuration patterns and dependencies across all stages.
3. **Automate Everything** – Use CI/CD pipelines to automate builds, tests, and deployments. Manual deployments are error-prone and not repeatable.
4. **Deploy Often, Deploy Small** – Frequent small deployments reduce risk and make it easier to identify issues. Each deployment should be a manageable change.
5. **Always Have a Rollback Plan** – Every deployment should be reversible. Implement automated rollback procedures that can be triggered quickly.
6. **Monitor Everything** – Deployments are not complete until monitoring and alerting are in place. Track key metrics (error rates, latency, resource usage) from day one.
7. **Security First** – Secure all deployment artifacts, secrets, and infrastructure. Use environment variables for secrets and never hardcode them.

---

## Decision Rules

### Environment Configuration

- **IF** an application has multiple environments (development, staging, production), **THEN** use environment variables to manage environment-specific configuration.
- **IF** using environment variables, **THEN** validate their presence and format at application startup – fail fast with a clear error.
- **IF** dealing with secrets (database passwords, API keys, tokens), **THEN** never commit them to version control. Use environment variables, secret management services (e.g., Vercel Secrets, Docker Secrets, AWS Secrets Manager), or CI/CD secret stores.
- **IF** a configuration value changes per environment, **THEN** use environment variables – not build-time constants or separate config files.

### Deployment Strategy Selection

- **IF** deploying a web application and zero downtime is required, **THEN** choose a deployment strategy that avoids downtime:
  - **Blue-Green**: Two identical environments; switch traffic after validation.
  - **Canary**: Gradually roll out to a subset of users before full deployment.
  - **Rolling**: Update instances incrementally behind a load balancer.
- **IF** the application is stateless (e.g., API-first, microservices), **THEN** containerization with Docker makes it easier to deploy and scale consistently.
- **IF** the application is a frontend SPA, **THEN** use Vercel's platform for optimized builds, atomic deployments, and instant rollbacks.

### CI/CD Pipeline

- **IF** automating deployments, **THEN** use GitHub Actions (preferred) or similar CI/CD tools.
- **ALWAYS** run linting, type checking, unit tests, and build in the pipeline before deployment.
- **IF** building a Docker image, **THEN** build and push the image to a container registry (e.g., Docker Hub, GitHub Container Registry) in the pipeline.
- **IF** using Vercel, **THEN** connect the repository and let Vercel handle builds and deployments via the platform's native Git integration.

### Health Checks

- **ALWAYS** implement a health check endpoint (`/health` or `/api/health`) that returns the status of the application and its dependencies (database, external services).
- **IF** deploying to Vercel, **THEN** Vercel handles health checks automatically for serverless functions.
- **IF** deploying a containerized application, **THEN** configure health checks in the Dockerfile or orchestration configuration.

### Database Migrations in Deployment

- **IF** a deployment includes database schema changes, **THEN** run migrations **before** starting the application that uses the new schema – especially when making backward-incompatible changes.
- **IF** zero-downtime deployments, **THEN** ensure migrations are backward-compatible with the previous version of the application.
- **IF** deploying changes that cannot be made backward-compatible, **THEN** plan a maintenance window and communicate downtime.

---

## Best Practices

### Build & Deployment

1. **Use the same build process locally and in CI/CD** – To catch issues early, the same commands (`npm run build`) should work identically in all environments.
2. **Use `.env.example` files** – Document required environment variables in a `.env.example` file and include it in version control (without values).
3. **Optimize build performance** – Use caching in CI/CD (e.g., `actions/cache` for npm dependencies, Docker layer caching) to speed up builds.
4. **Tag releases** – Use Git tags or Docker image tags with version numbers to track what is deployed.
5. **Use immutable artifacts** – Build once, deploy many times. Artifacts (e.g., Docker images) should be immutable and not rebuilt after testing.

### Monitoring & Observability

1. **Set up logging** – Use structured logging (e.g., with `pino`, `winston`) and send logs to a centralized system (e.g., Datadog, Logtail, AWS CloudWatch).
2. **Instrument metrics** – Track key metrics: request latency, error rates, database query performance, memory usage, and CPU utilization.
3. **Set up alerts** – Configure alerts for critical metrics exceeding thresholds (e.g., error rate > 5%, latency > 500ms).
4. **Monitor deployment rollouts** – Use deployment monitoring to track the success of a deployment (e.g., Vercel's Deployment Overview) and automatically roll back on failures.

### Rollback Procedures

1. **Keep previous versions** – Maintain the previous stable version (e.g., previous Docker images) so that rollback is instant.
2. **Implement automated rollback** – In the CI/CD pipeline, automate rollback when critical metrics fail after deployment.
3. **Communicate rollbacks** – Notify the team and stakeholders when a rollback occurs, with reasons and next steps.
4. **Test rollback first** – In staging, test that rollback works before deploying to production.

### Security

1. **Use secret management** – Store secrets in the CI/CD environment or a secret management service, never in code or `.env` files committed to the repo.
2. **Run security scans** – Scan dependencies for vulnerabilities (`npm audit`, `yarn audit`) in the CI/CD pipeline.
3. **Use HTTPS** – Always use HTTPS in production. Vercel automatically provides TLS certificates. For custom servers, obtain certificates and enforce HTTPS.
4. **Limit access** – Restrict deployment permissions to a minimal set of users and services. Use fine-grained access control in CI/CD.

---

## Anti-Patterns

| Anti-Pattern                                     | Why it is wrong                                      | Correct approach                                                                                       |
| ------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Manual deployments                               | Error-prone, not repeatable, slow.                   | Use CI/CD automation for all deployments.                                                              |
| Hardcoding secrets in code                       | Exposes secrets in version control.                  | Use environment variables and secret management.                                                       |
| Deploying directly to production without staging | Risk of breaking production.                         | Always deploy to staging first and test before production.                                             |
| Not having a rollback plan                       | Production stays broken if deployment fails.         | Always plan and test rollback procedures.                                                              |
| Ignoring environment differences                 | Application fails due to misconfiguration.           | Use the same configuration patterns across environments and use environment variables for differences. |
| Not monitoring after deployment                  | Performance issues go unnoticed.                     | Set up monitoring and alerts before deployment.                                                        |
| Deploying changes and migrations together        | Risk of data loss or downtime.                       | Separate migrations and code deployments or use backward-compatible changes.                           |
| Not using health checks                          | Load balancers route traffic to unhealthy instances. | Implement health checks and configure load balancers to use them.                                      |

---

## Common Mistakes & Edge Cases

| Mistake                                              | Symptom                                                                   | Solution                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Forgetting to set environment variables              | App crashes or misbehaves in production.                                  | Validate required environment variables at startup.                                 |
| Not running migrations before deployment             | App tries to use new schema before it exists.                             | Run migrations as a separate step before starting the app.                          |
| Building artifacts differently in CI/CD than locally | Build succeeds locally but fails in CI/CD.                                | Use the same commands and ensure the environment (Node version, etc.) is identical. |
| Not caching dependencies                             | Slow builds; wasted resources.                                            | Use caching in CI/CD (e.g., `actions/cache` for npm, Docker layer caching).         |
| Health check endpoint not implemented                | Load balancer marks instances as unhealthy; traffic fails.                | Implement `/health` endpoint.                                                       |
| Rollback doesn't revert database changes             | Rollback of app does not revert schema; app incompatible with old schema. | Use backward-compatible migrations or separate migration rollback.                  |
| Deploying changes without proper testing             | Critical bugs reach production.                                           | Ensure automated tests and manual QA pass before deployment.                        |
| Not monitoring error rates after deployment          | Issues go unnoticed until users complain.                                 | Use deployment monitoring to track error rates and latency.                         |

---

## Related Skills

- `docker` – for containerizing the application for consistent deployments.
- `vercel` – for deploying frontend SPAs with Vercel's platform.
- `github-actions` – for automating CI/CD pipelines.
- `logging-monitoring` – for setting up production logging and alerting.
- `migrations` – for managing database migrations during deployments.
- `performance` – for optimizing build and runtime performance.
- `security` – for securing production infrastructure and secrets.

---

## Official References

- [Vercel Documentation – Deployments](https://vercel.com/docs/deployments)
- [Vercel Documentation – Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Docker Documentation – Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Docker Documentation – Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions – Caching Dependencies](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [Twelve-Factor App – Config](https://12factor.net/config)
- [Twelve-Factor App – Build, Release, Run](https://12factor.net/build-release-run)
- [OWASP – Deployment Security](https://cheatsheetseries.owasp.org/cheatsheets/Deployment_Cheat_Sheet.html)
- [Vercel Security Overview](https://vercel.com/security)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
- [GitHub Actions – Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
