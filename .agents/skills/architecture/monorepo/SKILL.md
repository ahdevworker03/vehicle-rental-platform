---
name: monorepo
description: Monorepo architecture for this workspace, especially `apps/*`, `lib/*`, shared generated packages, and package-boundary changes. Applicable when setting up or maintaining a monorepo, managing shared code between apps, optimizing build times with caching, or structuring multi-package repositories.
---

# Monorepo

## Purpose

This skill guides the agent in designing, managing, and optimizing monorepos using modern build tools. A monorepo consolidates multiple projects (frontend, backend, shared libraries, tooling) into a single repository with a unified dependency graph and build pipeline. The skill focuses on workspace configuration, task orchestration, caching, dependency management, and code sharing — ensuring fast builds, consistent tooling, and developer productivity.

---

## When to Load

- User is setting up or maintaining a monorepo structure with multiple packages or applications.
- User mentions: `monorepo`, `Turborepo`, `Nx`, `workspace`, `package`, `shared library`, `build pipeline`, `caching`, `task orchestration`, `dependency graph`.
- User is configuring `turbo.json`, `nx.json`, or workspace manifests.
- User asks about sharing code between frontend and backend, managing dependencies across packages, or optimizing build performance in a monorepo.

---

## When NOT to Load

- Single-package applications without multiple projects.
- General JavaScript/TypeScript development outside the monorepo context.
- Pure frontend or backend implementation without package management.
- Infrastructure or deployment configuration unrelated to monorepo structure.

---

## Core Principles

1. **Single Source of Truth** – All projects, shared libraries, and tooling live in one repository with a unified dependency graph. Changes are atomic and versioned together.
2. **Fast, Incremental Builds** – Use caching and task orchestration to rebuild only what changed. A well-configured monorepo should have near-instantaneous builds for local development and CI/CD.
3. **Shared Code, But Independent Deployment** – Share code between applications (e.g., shared types, utilities, UI components) while maintaining independent deployable units. Each application can be deployed separately.
4. **Dependency Management** – All dependencies are resolved from a single `node_modules` (hoisted) or isolated per package (workspace protocols). Ensure consistent versions across packages.
5. **Task Consistency** – Define common tasks (dev, build, test, lint, format) across all packages with the same interface. Use workspace-level task definitions for uniformity.

---

## Decision Rules

### Tooling Selection

- **IF** the monorepo contains a mix of frontend (React) and backend (Express/Prisma) applications with shared TypeScript packages, **THEN** use Turborepo (from Vercel) for its simplicity, excellent caching, and integration with Vercel deployments.
- **IF** the monorepo has many advanced features (e.g., distributed caching, granular dependency graph visualization, extensive plugin system), **THEN** consider Nx, but be aware it has a steeper learning curve.
- **IF** the team has limited monorepo experience, **THEN** start with Turborepo and extend as needed.

### Workspace Configuration

- **IF** using Turborepo, **THEN** define the workspace in the root `package.json` with `"workspaces": ["apps/*", "packages/*"]` (or a similar glob pattern).
- **IF** using npm/yarn/pnpm workspaces, **THEN** choose a package manager that supports workspaces (pnpm is recommended for monorepos due to its efficiency).
- **IF** using pnpm, **THEN** configure `pnpm-workspace.yaml` with glob patterns.

### Task Pipeline

- **IF** defining tasks in `turbo.json`, **THEN** specify `dependsOn` for task dependencies (e.g., `"build": { "dependsOn": ["^build"] }` to build dependencies first).
- **IF** using caching, **THEN** set `inputs` to define file globs that invalidate the cache (e.g., `["src/**/*.ts"]`).
- **IF** tasks produce artifacts (e.g., `dist/`, `build/`), **THEN** define `outputs` to cache the artifacts.
- **IF** a task should not be cached (e.g., tests with external side effects), **THEN** set `"cache": false`.

### Code Sharing Between Apps

- **IF** sharing code between frontend and backend (e.g., validation schemas, API types, utility functions), **THEN** place them in a `packages/shared` or `packages/types` directory.
- **IF** sharing React UI components between multiple frontend apps, **THEN** create a `packages/ui` package that exports the components.
- **IF** sharing configuration (e.g., ESLint config, TypeScript config), **THEN** place them in `packages/config/*` and reference them via workspace protocols.
- **ALWAYS** use workspace protocol (`"workspace:*"` or `"*"` in pnpm) to reference sibling packages.

### Dependency Management

- **IF** multiple packages depend on the same external library, **THEN** consider hoisting the dependency to the root to reduce duplicate installs.
- **IF** a package is used only internally (e.g., shared utilities), **THEN** keep it as a workspace dependency; do not publish to npm unless necessary.
- **IF** a package is public and consumed by external projects, **THEN** set `"private": false` and manage versioning independently.

### Versioning and Publishing

- **IF** all packages are versioned together (lockstep), **THEN** use a single version across all packages.
- **IF** packages are versioned independently, **THEN** use tools like Changesets to manage version bumps and changelogs.
- **IF** the monorepo contains apps (not libraries), **THEN** apps are not published; only internal packages may be versioned.

---

## Best Practices

1. **Use pnpm for efficiency** – pnpm is faster and uses less disk space than npm or yarn in monorepos. It also supports `workspace:*` protocols elegantly.
2. **Define root-level scripts** – In the root `package.json`, define scripts like `dev`, `build`, `test`, `lint` that run across all workspaces using `turbo run dev`, etc.
3. **Use `.turbo` caching** – Place `.turbo` in `.gitignore` to avoid committing cache. The cache is local to the developer or CI and should not be shared via git.
4. **Use `turbo prune` for deployment** – When deploying a single app, use `turbo prune` to create a minimal workspace with only the needed packages, reducing deployment size.
5. **Keep shared packages focused** – Each shared package should have a single responsibility (e.g., `@repo/types`, `@repo/ui`, `@repo/config`). Avoid "god" packages that become too broad.
6. **Use TypeScript project references** – In a TypeScript monorepo, enable project references to improve build times and type-checking performance.
7. **Use consistent tooling versions** – Pin tool versions (Node, pnpm, Turborepo) in the repository to avoid compatibility issues. Use a `.tool-versions` or `.nvmrc` file.
8. **Lint and format across the monorepo** – Use root-level ESLint and Prettier configurations that apply to all packages.

---

## Anti-Patterns

| Anti-Pattern                                         | Why it is wrong                                            | Correct approach                                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Every package has its own build tool config          | Duplicate configurations; difficult to maintain.           | Extract common configs into shared packages.                                      |
| Not using caching in CI                              | Wastes time rebuilding unchanged packages.                 | Configure Turborepo/Nx with caching in CI and persist the cache.                  |
| Manually building packages in order                  | Relies on developer order; easy to make mistakes.          | Use task orchestration (`dependsOn: ["^build"]`) to let the tool handle ordering. |
| Committing lockfiles from different package managers | Causes conflicts and inconsistent installs.                | Use a single package manager across the entire monorepo.                          |
| Creating circular dependencies between packages      | Build order becomes impossible; leads to errors.           | Refactor to break cycles.                                                         |
| Not using workspace protocols for internal packages  | Harder to update; accidental publishing of stale versions. | Use `workspace:*` or similar to link packages.                                    |
| Ignoring `.gitignore` for build artifacts            | Cache and dist files bloat the repository.                 | Always ignore `dist`, `build`, `.turbo`, `.nx`.                                   |

---

## Common Mistakes & Edge Cases

| Mistake                                                 | Symptom                                                     | Solution                                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Turborepo cache not invalidating                        | Builds use stale cache after code changes.                  | Check `inputs` in `turbo.json`; include all source files that affect the task. |
| Running `turbo run build` without building dependencies | Dependent packages missing.                                 | Set `dependsOn: ["^build"]` to build dependencies first.                       |
| Forgetting to add new package to workspace glob         | New package is ignored.                                     | Update workspace glob patterns to include the new package.                     |
| Using `file:` protocols for local packages              | Does not work with all package managers in monorepos.       | Use `workspace:*` (pnpm) or `*` (npm/yarn workspaces).                         |
| Not using `turbo prune` for deployment                  | Deployment artifacts include unused packages.               | Use `turbo prune` to isolate the application for deployment.                   |
| TypeScript project references not configured            | Type-checking slow and cross-package imports not optimized. | Enable project references in `tsconfig.json`.                                  |
| Inconsistent Node.js versions across dev and CI         | Build fails in CI due to Node version mismatch.             | Use `.nvmrc` or `.tool-versions` to pin Node version.                          |

---

## Related Skills

- `typescript` – for configuring project references and shared TypeScript configs.
- `github-actions` – for CI/CD pipelines in a monorepo (e.g., caching, building only changed packages).
- `deployment` – for deploying individual apps from a monorepo (e.g., using `turbo prune`).
- `tooling/git` – for managing versioning and commits across many packages.
- `performance` – for optimizing build times with caching and parallel execution.

---

## Official References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Turborepo – Core Concepts](https://turbo.build/repo/docs/core-concepts)
- [Turborepo – Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Turborepo – Pipeline](https://turbo.build/repo/docs/core-concepts/pipeline)
- [Turborepo – Deployment with `turbo prune`](https://turbo.build/repo/docs/core-concepts/monorepo-pruning)
- [Nx Documentation](https://nx.dev)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)
- [Yarn Workspaces Documentation](https://classic.yarnpkg.com/en/docs/workspaces/)
- [npm Workspaces Documentation](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Changesets – Versioning and Changelogs](https://github.com/changesets/changesets)
- [Vercel – Monorepo Deployment Guide](https://vercel.com/docs/monorepos)
