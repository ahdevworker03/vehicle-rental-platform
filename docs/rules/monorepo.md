# Monorepo Rules

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Package Boundaries](#package-boundaries) |
| 2 | [Dependency Direction](#dependency-direction) |
| 3 | [Shared Code](#shared-code) |
| 4 | [Package Ownership](#package-ownership) |
| 5 | [Source of Truth](#source-of-truth) |
| 6 | [Cross-Package Changes](#cross-package-changes) |
| 7 | [Repository Consistency](#repository-consistency) |

These rules define how packages are organized and interact within this repository.

## Package Boundaries

- Treat each package as an independent module with a clear responsibility.
- Respect package ownership and responsibilities.
- Do not move functionality between packages without approval.
- Avoid creating unnecessary dependencies between packages.

## Dependency Direction

- Dependencies must follow the documented architecture.
- Do not introduce circular dependencies.
- Prefer depending on shared libraries instead of duplicating code.
- Keep dependency graphs as simple as possible.

## Shared Code

- Reuse existing shared packages before creating new implementations.
- Shared functionality belongs in the package that owns it.
- Avoid copying code across packages.
- Move duplicated logic into a shared package only when reuse is established.

## Package Ownership

- Modify only the packages required for the current task.
- Keep public package APIs stable unless the change is approved.
- Avoid changing unrelated packages during feature work.

## Source of Truth

- Every piece of shared logic should have a single owner.
- Never duplicate API contracts, domain models, or shared utilities across packages.
- Generated packages remain derived artifacts and must stay synchronized with their sources.

## Cross-Package Changes

- Keep cross-package changes as small and coordinated as possible.
- When a change affects multiple packages, preserve compatibility throughout the repository.
- Update dependent packages when required.
- Verify that affected packages continue to build and function correctly.

## Repository Consistency

- Follow existing package structure and naming conventions.
- Place new code in the package that best matches its responsibility.
- Do not create new packages unless the existing architecture no longer supports the requirement.
