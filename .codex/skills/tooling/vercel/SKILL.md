---
name: vercel
description: Vercel deployment for this monorepo, especially preview/production releases, env vars, and backend hosting for `apps/web` and `apps/api`. Applicable when deploying applications to Vercel, configuring preview/production environments, managing environment variables, setting up custom domains, or optimizing Vercel deployments.
---

# Vercel

## Purpose

This skill guides the agent in deploying and managing applications on the Vercel platform following official Vercel documentation and best practices. Vercel is a deployment platform that provides Git-integrated deployments, preview environments, serverless functions, and edge network delivery. The skill covers the complete deployment workflow—from connecting repositories and configuring projects to managing environments, custom domains, and production readiness. The goal is to ensure reliable, secure, and performant deployments with minimal friction.

---

## When to Load

- User is deploying an application to Vercel or configuring Vercel project settings.
- User mentions: `Vercel`, `deploy`, `preview deployment`, `production deployment`, `vercel.json`, `vercel.ts`, `environment variables`, `custom domain`, `monorepo`, `serverless functions`.
- User asks about Git integration, preview URLs, or deployment workflows.
- User is setting up environment variables, custom domains, or deployment protection.
- User is preparing for production launch or optimizing Vercel deployments.

---

## When NOT to Load

- General application development without deployment considerations.
- Infrastructure or deployment to other platforms (AWS, GCP, Azure).
- Database schema design or application code implementation.
- Docker-specific containerization (see `docker` skill).

---

## Core Principles

1. **Git as the Source of Truth** – Vercel integrates with Git providers (GitHub, GitLab, Bitbucket). Every push to a connected repository triggers a deployment. The Git branch determines the environment: the production branch (usually `main`) creates Production Deployments; all other branches create Preview Deployments.
2. **Preview Every Change** – Every pull request gets a unique preview URL with its own isolated environment. Reviewers can test changes before they merge to production.
3. **Environment Variables Drive Configuration** – Configuration values that vary between environments (database URLs, API keys, feature flags) are set as environment variables in the Vercel dashboard or CLI. Values are encrypted at rest.
4. **Zero-Configuration by Default** – Vercel automatically detects your framework (Next.js, React, Express, etc.) and applies sensible defaults for builds, deployments, and routing.
5. **Deployments Are Immutable** – Each successful build creates a new deployment with its own unique URL. Production deployments can be instantly rolled back to any previous deployment.
6. **Serverless by Default** – Backend code (API routes, Express apps) runs as serverless functions. There is no always-running server; functions scale automatically and you pay only for compute time used.

---

## Decision Rules

### Deployment Methods

- **IF** your project is connected to a Git repository, **THEN** the most common way to deploy is by pushing code. Each commit or pull request automatically triggers a new deployment.
- **IF** you need to deploy without Git (static sites, prototypes), **THEN** use Vercel Drop by dragging a folder into your browser at vercel.com/drop.
- **IF** you need to deploy from the command line, **THEN** use the Vercel CLI: `vercel` for preview, `vercel --prod` for production.
- **IF** you need to trigger deployments programmatically, **THEN** use Deploy Hooks (unique URLs that trigger deployments) or the Vercel REST API.

### Environment Variables

- **ALWAYS** store configuration values that change between environments as environment variables in the Vercel dashboard.
- **IF** a variable should only apply to Production Deployments, **THEN** set it to the Production environment only.
- **IF** a variable should apply to Preview Deployments, **THEN** set it to the Preview environment. You can apply to all non-production branches or select specific branches.
- **IF** a variable is needed for local development, **THEN** set it to the Development environment and run `vercel env pull` to download it locally.
- **ALWAYS** verify environment variables apply to new deployments—changes to environment variables only affect new deployments, not existing ones.

### Preview Deployments

- **IF** you open a pull request on a connected repository, **THEN** Vercel automatically creates a Preview Deployment with a unique URL.
- **IF** you need to secure preview environments, **THEN** enable Deployment Protection in Settings → Deployment Protection. With Vercel Authentication enabled, only team members with Vercel accounts can access preview URLs.
- **IF** you need to test tenant-specific experiences in previews, **THEN** use multi-tenant preview URLs to test different contexts without additional domain configuration.

### Project Configuration

- **IF** you need to override Vercel's default build, routing, or function behavior, **THEN** use either `vercel.json` (static configuration) or `vercel.ts` (programmatic configuration that runs at build time). Use only one configuration file per project.
- **IF** you need dynamic configuration based on environment variables or API calls, **THEN** use `vercel.ts` with the `@vercel/config` package.
- **IF** you need static configuration (build commands, clean URLs, redirects, headers), **THEN** use `vercel.json` with schema validation: `{ "$schema": "https://openapi.vercel.sh/vercel.json" }`.

### Monorepo Deployments

- **IF** deploying from a monorepo, **THEN** create a separate Vercel project for each directory you want to deploy. When importing, click Edit next to Root Directory to select the specific directory.
- **IF** using Vercel CLI in a monorepo, **THEN** run `vercel link --repo` from the root directory to link multiple Vercel projects at once.
- **IF** you want to skip builds for projects whose files haven't changed, **THEN** Vercel automatically skips unaffected projects—this does not occupy concurrent build slots.
- **IF** using a monorepo with Turborepo, **THEN** configure caching to prevent unnecessary builds.

### Custom Domains

- **IF** you want to use a custom domain (instead of the default `vercel.app` URL), **THEN** add it in Project Settings → Domains.
- **IF** adding an apex domain (e.g., `example.com`), **THEN** Vercel will prompt you to also add the `www` subdomain prefix.
- **IF** adding a subdomain (e.g., `docs.example.com`), **THEN** configure it with a CNAME record pointing to your project's unique Vercel DNS target.
- **IF** adding a wildcard domain, **THEN** prefix it with `*` (e.g., `*.acme.com`).

---

## Best Practices

### Production Readiness

1. **Follow the production checklist** – Review the Vercel engineering team's production checklist covering operational excellence, security, reliability, performance, and cost optimization.
2. **Define an incident response plan** – Include escalation paths, communication channels, and rollback strategies for deployments.
3. **Familiarize with staging, promotion, and rollback** – Understand how to stage, promote, and rollback deployments using Vercel's Instant Rollback feature.
4. **Enable Deployment Checks** – Add native Vercel checks (lint, typecheck) or GitHub Actions checks that must pass before a production deployment is released.

### Environment Configuration

1. **Use separate databases for each environment** – Configure different `DATABASE_URL` values for Production, Preview, and Development environments.
2. **Pull environment variables locally** – Use `vercel env pull` to download Development Environment Variables for local development.
3. **Audit environment variables** – Regularly review what's configured across environments, verify each variable targets the right environments, and handle sensitive values properly.

### Security

1. **Enable Deployment Protection** – Secure preview environments and test changes safely before production.
2. **Configure the Vercel Web Application Firewall (WAF)** – Set up custom rules, IP blocking, and managed rulesets.
3. **Implement a Content Security Policy (CSP)** – Add proper security headers to prevent XSS and other attacks.
4. **Enable Log Drains** – Persist deployment logs for security auditing and debugging.
5. **Review common SSL certificate issues** – Ensure custom domains have valid certificates.

### Performance

1. **Enable Speed Insights** – Get field performance data and Core Web Vitals for real user monitoring.
2. **Review Time To First Byte (TTFB)** – Ensure fast responses by optimizing function regions and database proximity.
3. **Use Image Optimization** – Reduce image sizes with Vercel's built-in image optimization.
4. **Enable Fluid compute** – Reduce cold starts and optimize concurrency with zero-configuration dynamic scaling.
5. **Ensure Vercel Function region matches your API or database region** – Reduce latency by colocating resources.

### Monorepo Optimization

1. **Configure caching** – If deploying using a monorepo, configure caching (e.g., Turborepo) to prevent unnecessary builds.
2. **Perform a zero-downtime DNS migration** – When migrating to Vercel DNS, ensure no downtime.
3. **Use `vercel link --repo`** – Link multiple Vercel projects at once from the root of your monorepo.

---

## Anti-Patterns

| Anti-Pattern                                                     | Why it is wrong                                                            | Correct approach                                                            |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Hardcoding environment-specific values                           | Cannot change without redeploying; environment-specific values impossible. | Use environment variables.                                                  |
| Deploying directly to production without preview                 | Changes go live without testing; higher risk of breaking production.       | Use preview deployments for every PR.                                       |
| Not configuring environment variables for preview                | Preview deployments use production data or fail due to missing variables.  | Set Preview environment variables.                                          |
| Committing `.env` files to the repository                        | Exposes secrets.                                                           | Use Vercel dashboard for environment variables; add `.env` to `.gitignore`. |
| Ignoring the production checklist                                | Missing critical security, reliability, or performance configurations.     | Review and follow the production checklist.                                 |
| Not enabling Deployment Protection                               | Preview deployments are publicly accessible.                               | Enable Deployment Protection with Vercel Authentication.                    |
| Deploying monorepo projects without root directory configuration | Wrong directory is deployed; build fails.                                  | Set Root Directory when importing from a monorepo.                          |

---

## Common Mistakes & Edge Cases

| Mistake                                   | Symptom                                               | Solution                                                                          |
| ----------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| Environment variables not applied         | New variables don't work; old deployments unaffected. | Redeploy the application after adding environment variables.                      |
| Custom domain not resolving               | Domain status shows "Invalid" or "Pending".           | Verify DNS records are correctly configured at your registrar.                    |
| Preview deployment inaccessible           | 404 or authentication error.                          | Check Deployment Protection settings; ensure the user has access.                 |
| Monorepo deploying wrong project          | Wrong directory is built; application fails.          | Verify Root Directory setting in Project Settings.                                |
| Build failing due to missing dependency   | `npm install` fails in Vercel build environment.      | Ensure lockfile is committed; check package manager detection.                    |
| Function timeout                          | Serverless function exceeds maximum duration.         | Increase function duration in `vercel.json`/`vercel.ts` or optimize the function. |
| Environment variables size limit exceeded | Deployment fails with size error.                     | Environment variables are limited to 64 KB total per deployment.                  |
| Preview URL not commenting on PR          | Vercel integration not properly configured.           | Check Git provider integration settings; ensure Vercel app has permissions.       |

---

## Related Skills

- `deployment` – for broader deployment strategies and CI/CD integration.
- `github-actions` – for custom CI/CD workflows with Vercel deployments.
- `environment-config` – for managing environment variables and configuration.
- `monorepo` – for monorepo-specific deployment strategies.
- `express` – for deploying Express backends as serverless functions on Vercel.
- `docker` – for containerized deployments (Vercel primarily uses serverless, not containers).
- `performance` – for optimizing Vercel deployments and Core Web Vitals.

---

## Official References

- [Vercel Documentation – Deployments](https://vercel.com/docs/deployments)
- [Vercel Documentation – Environments](https://vercel.com/docs/deployments/environments)
- [Vercel Documentation – Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Documentation – Project Configuration](https://vercel.com/docs/project-configuration)
- [Vercel Documentation – vercel.json](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel Documentation – vercel.ts](https://vercel.com/docs/project-configuration/vercel-ts)
- [Vercel Documentation – Git Integration](https://vercel.com/docs/git)
- [Vercel Documentation – Custom Domains](https://vercel.com/docs/domains)
- [Vercel Documentation – Monorepos](https://examples.vercel.com/docs/monorepos)
- [Vercel Documentation – Deployment Checks](https://vercel.com/docs/deployment-checks)
- [Vercel Documentation – Production Checklist](https://vercel.com/docs/production-checklist)
- [Vercel Documentation – Backends on Vercel](https://vercel.com/docs/frameworks/backend)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel REST API Documentation](https://vercel.com/docs/rest-api)
- [Vercel Documentation – How Vercel Builds Your Application](https://vercel.com/docs/fundamentals/builds)
- [Vercel Knowledge Base – Environment Variables](https://vercel.com/kb)
- [Vercel Documentation – Fluid Compute](https://vercel.com/docs/fluid-compute)
- [Vercel Documentation – Instant Rollback](https://vercel.com/docs/instant-rollback)
