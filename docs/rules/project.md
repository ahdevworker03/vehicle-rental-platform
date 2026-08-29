# Project

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Product Vision](#product-vision) |
| 2 | [Current Stage](#current-stage) |
| 3 | [Repository Architecture](#repository-architecture) |
| 4 | [Repository Structure](#repository-structure) |
| 5 | [Source of Truth](#source-of-truth) |
| 6 | [Development Principles](#development-principles) |
| 7 | [Generated Artifacts](#generated-artifacts) |
| 8 | [Repository Rules](#repository-rules) |
| 9 | [Long-Term Goal](#long-term-goal) |

This repository contains the production codebase for the Vehicle Rental Management Platform.

The project follows a documentation-first, API-first, and monorepo architecture. Repository documentation is the primary source of truth for architecture, workflows, and development decisions.

## Product Vision

Build a production-ready SaaS platform for vehicle rental businesses.

The platform is designed to be:

- Multi-tenant
- API-first
- Mobile-first
- Offline-first
- Arabic-first
- Scalable
- Maintainable

## Current Stage

This repository contains the production implementation.

Development follows an incremental approach where architecture, documentation, and API contracts are established before implementation.

## Repository Architecture

The repository is organized as a monorepo.

Major repository areas include:

- Applications
- Shared packages
- Generated packages
- Documentation
- Repository rules
- AI skills

Follow `monorepo.md` for package boundaries and ownership.

## Repository Structure

```text
apps/
  web/
  api/

lib/
  api-spec/
  api-client-react/
  api-zod/
  db/

docs/
  rules/

.codex/
  skills/
```

Repository structure may evolve, but responsibilities should remain consistent.

## Source of Truth

Different parts of the repository own different responsibilities.

| Area                         | Source of Truth                  |
| ---------------------------- | -------------------------------- |
| Product behavior             | Product documentation            |
| Architecture                 | Architecture documentation       |
| API contracts                | `lib/api-spec`                   |
| Generated API client         | Generated from API specification |
| Generated validation schemas | Generated from API specification |
| Shared business logic        | Owning package                   |
| Repository rules             | `docs/rules/`                    |
| AI technology knowledge      | `.agents/skills/`                |

Never duplicate a source of truth.

## Development Principles

Development in this repository follows these principles:

- Documentation-first
- API-first
- Small incremental changes
- Clear package ownership
- Single source of truth
- Simplicity over complexity
- Consistency over cleverness
- Long-term maintainability

## Generated Artifacts

Some packages are generated from authoritative sources.

Generated artifacts are not edited manually.

Follow `api-contracts.md` before modifying generated packages.

## Repository Rules

Repository behavior is defined by the rule files inside `docs/rules/`.

These files define:

- workflow
- architecture boundaries
- safety
- documentation
- testing
- coding standards
- UI/UX expectations
- monorepo behavior
- API contract ownership
- generated code handling

Technology-specific implementation guidance belongs in `.agents/skills/`.

## Long-Term Goal

Maintain a production-quality repository that remains:

- predictable
- modular
- well documented
- easy to extend
- safe for AI-assisted development
