---
name: cloudflare
description: Cloudflare deployment for this repository, especially Cloudflare Pages for `apps/web` and Cloudflare Workers (or container elsewhere) for `apps/api`. Applicable when deploying to Cloudflare, configuring Wrangler, setting up Pages/Workers, managing DNS, R2, or planning edge deployment strategies.
---

# Cloudflare

## Purpose

This skill guides the agent in deploying applications to Cloudflare's platform following official best practices. It covers Cloudflare Pages for frontend static sites, Cloudflare Workers for serverless APIs, the Wrangler CLI, environment configuration, CI/CD integration, and DNS/edge configuration. The goal is reliable, secure, repeatable deployments on Cloudflare's global edge network.

---

## When to Load

- User is deploying to Cloudflare, configuring Wrangler, or planning edge deployments.
- User mentions: `Cloudflare`, `Cloudflare Pages`, `Cloudflare Workers`, `Wrangler`, `wrangler.toml`, `R2`, `D1`, `edge`, `workers.dev`, `pages.dev`.
- User is setting up DNS, custom domains, or edge functions on Cloudflare.
- User is migrating from Vercel/Netlify to Cloudflare.

---

## When NOT to Load

- Pure development or local setup without deployment implications.
- Database schema design (see `database-schema-design` and `migrations` skills).
- General API design or implementation (see `api-design` and `express` skills).
- Docker containerization (see `docker` skill).

---

## Core Principles

1. **Edge-First** – Deploy to Cloudflare's edge network for minimal latency and global distribution.
2. **Infrastructure as Code** – Define Workers/Pages configuration in `wrangler.toml` (or `wrangler.jsonc`) tracked in version control.
3. **Secrets via Bindings** – Store secrets as Worker secrets or environment variables, never hardcoded or committed.
4. **Immutable Deployments** – Each deploy produces a versioned, instantly rollback-able deployment.
5. **Compatibility Dates** – Pin a `compatibility_date` in `wrangler.toml` to keep the runtime behavior stable.
6. **Observability** – Enable Workers observability for logs, metrics, and traces from day one.

---

## Decision Rules

### Deployment Target Selection

- **IF** the app is a static frontend (React SPA, Vite, static Next.js export), **THEN** use **Cloudflare Pages**.
- **IF** the app needs server-side rendering or API routes (full-stack Next.js), **THEN** use **Workers** with `@opennextjs/cloudflare` adapter.
- **IF** the app is an Express/Node API, **THEN** either containerize (`docker` skill) or migrate to **Workers** (Hono/`@hono/node-server`) for edge runtime.
- **IF** you need file/object storage, **THEN** use **R2** (S3-compatible).
- **IF** you need a relational/SQLite database at the edge, **THEN** use **D1**.

### Wrangler Configuration

- **ALWAYS** pin `compatibility_date` in `wrangler.toml` to a recent date (e.g., `2026-07-01`).
- **IF** the app needs Node.js APIs (`process`, `Buffer`, `node:*` modules), **THEN** add `compatibility_flags = ["nodejs_compat"]`.
- **IF** deploying a static Pages project, **THEN** set `pages_build_output_dir` to the build output (e.g., `dist`, `out`, `build`).
- **IF** configuring a Worker, **THEN** set `main` to the entrypoint and define bindings (KV, R2, D1, secrets).

### Authentication

- **IF** deploying locally, **THEN** run `npx wrangler login` (OAuth browser flow) once.
- **IF** deploying from CI/CD, **THEN** create a Cloudflare API token and store it as `CLOUDFLARE_API_TOKEN` in GitHub Actions secrets.
- **IF** headless CI login is needed, **THEN** use `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` instead of interactive login.

### Environment Variables

- **IF** using Vite, **THEN** prefix build-time env vars with `VITE_`.
- **IF** using Next.js, **THEN** prefix public env vars with `NEXT_PUBLIC_`.
- **IF** defining secrets for Workers, **THEN** use `wrangler secret put <NAME>` (encrypted at rest) rather than `wrangler.toml` `[vars]`.
- **IF** configuring Pages env vars, **THEN** use the dashboard (Settings → Environment Variables) with separate Production/Preview scopes.

### CI/CD

- **IF** automating deploys, **THEN** use `cloudflare/wrangler-action` in GitHub Actions.
- **IF** deploying Pages via CI, **THEN** use `pages deploy <output_dir> --project-name=<name>`.
- **ALWAYS** run lint, typecheck, and tests before the deploy step.

### Static SPA Routing

- **IF** the frontend is a client-side-routed SPA, **THEN** add a `_redirects` file with `/* /index.html 200` in the output directory to fix 404s on refresh.

---

## Best Practices

### Pages Deployment

1. **Build command** – For React/Vite use `npm run build` with output `dist`; for static Next.js export use `next build` with output `out`.
2. **Custom domains** – Add domains in Pages → Custom domains; Cloudflare auto-provisions DNS and TLS.
3. **Preview deployments** – Use `branch` deployments to preview every PR.
4. **Headers** – Configure security headers (`_headers` file) for HSTS, CSP, X-Frame-Options.

### Workers Deployment

1. **Use observability** – Enable `observability = { enabled = true }` in `wrangler.toml`.
2. **Set resource limits** – Configure CPU/memory limits for paid plans as needed.
3. **Versioned deploys** – Use `wrangler deploy` for atomic, instantly rollback-able releases.
4. **Minimize bundle size** – Tree-shake, avoid heavy dependencies; Workers have bundle size limits.

### Rollback

1. **Keep prior versions** – Wrangler/Pages keep prior deployments for instant rollback.
2. **Use `wrangler rollback`** – Roll back to a previous deployment by version ID.
3. **Test in staging/preview** – Verify before promoting to production.

### Security

1. **Secrets** – Use `wrangler secret put` for Workers; dashboard secrets for Pages.
2. **API tokens** – Scope tokens to minimal permissions (single account, single resource).
3. **TLS** – Cloudflare provides TLS by default; set SSL/TLS mode to "Full (strict)" for custom domains.
4. **Never commit** – Never commit `wrangler.toml` secrets, `.dev.vars`, or API tokens.

---

## Anti-Patterns

| Anti-Pattern                            | Why it is wrong                                      | Correct approach                                        |
| --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| Hardcoding secrets in `wrangler.toml`   | Exposes secrets in version control.                  | Use `wrangler secret put` or dashboard secrets.         |
| Missing `compatibility_date`            | Runtime behavior changes unexpectedly.               | Pin a `compatibility_date`.                             |
| Skipping `nodejs_compat` for Node APIs  | Workers lacks Node APIs; runtime errors.             | Add `compatibility_flags = ["nodejs_compat"]`.          |
| No `_redirects` for SPA                 | 404 on client-side route refresh.                    | Add `/* /index.html 200` redirect.                      |
| Interactive `wrangler login` in CI      | CI hangs waiting for browser auth.                   | Use `CLOUDFLARE_API_TOKEN` secret.                      |
| Committing `.dev.vars`                  | Leaks local secrets.                                 | Gitignore `.dev.vars`; use `.dev.vars.example`.         |
| Not enabling observability              | No logs/metrics when issues occur.                   | Enable Workers observability.                           |

---

## Common Mistakes & Edge Cases

| Mistake                          | Symptom                                       | Solution                                            |
| -------------------------------- | --------------------------------------------- | --------------------------------------------------- |
| Wrong build output dir           | "Missing output directory" error.             | Set `pages_build_output_dir` to actual build output. |
| Node version too old             | Vite/Next build fails.                        | Set `NODE_VERSION=18` (or 20) env var in Pages.     |
| `output: "export"` missing       | Next.js static export fails.                  | Add `output: "export"` + `images.unoptimized: true`. |
| Non-edge runtime in Pages functions | 500 errors on API routes.                   | Add `export const runtime = "edge"` to route files.  |
| Missing custom domain DNS        | Domain not resolving.                         | Point nameservers to Cloudflare; SSL/TLS "Full".    |
| Env var prefix wrong             | `import.meta.env.VITE_X` is undefined.        | Prefix with `VITE_` / `NEXT_PUBLIC_`.               |
| Cache not purged after deploy    | Stale content served.                         | Purge cache in dashboard or via API.                |

---

## Related Skills

- `deployment` – for overall deployment strategy and CI/CD.
- `docker` – for containerized backend deployment.
- `github-actions` – for automating Cloudflare deploys in CI/CD.
- `environment-config` – for environment variable management.
- `logging-monitoring` – for production observability.

---

## Official References

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages – Next.js](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Cloudflare Pages – React (Vite)](https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/)
- [OpenNext for Cloudflare](https://opennext.js.org/cloudflare)
- [Wrangler GitHub Action](https://github.com/cloudflare/wrangler-action)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Workers Observability](https://developers.cloudflare.com/workers/observability/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)
- [D1 Documentation](https://developers.cloudflare.com/d1/)
