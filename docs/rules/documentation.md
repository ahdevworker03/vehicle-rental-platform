# Documentation Standards

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [What to Document](#what-to-document) |
| 2 | [Code Comments](#code-comments) |
| 3 | [Project Documentation](#project-documentation) |
| 4 | [Source of Truth](#source-of-truth) |
| 5 | [Breaking Changes](#breaking-changes) |
| 6 | [Documentation Style](#documentation-style) |
| 7 | [Documentation Quality](#documentation-quality) |

Document only information that other developers, packages, or future contributors cannot reliably infer from the code.

## What to Document

Document:

- Public APIs and contract changes.
- Architecture and design decisions.
- Business rules that are not obvious from the implementation.
- Shared libraries and reusable utilities.
- Source-of-truth boundaries and generated code workflows.
- Setup, deployment, and operational workflows.

## Code Comments

- Keep comments rare and valuable.
- Explain **why**, constraints, assumptions, or edge cases.
- Do not comment code that is already clear from names, types, or tests.
- Remove or update comments whenever the related code changes.

## Project Documentation

Update project documentation whenever repository truth changes.

This includes:

- README.md
- Architecture documents
- Product documentation
- API documentation
- Development workflows

Documentation must always reflect the current implementation.

## Source of Truth

- Every concept should have a single source of truth.
- Avoid duplicating the same information across multiple documents.
- Reference existing documentation instead of copying it.
- Generated artifacts should never become the primary source of truth.

## Breaking Changes

Document changes that affect:

- Public APIs.
- Development workflows.
- Configuration.
- Build or deployment processes.
- Database migrations.
- User-facing behavior.

Include migration guidance whenever required.

## Documentation Style

- Write in clear, concise English.
- Prefer concrete examples for complex workflows.
- Keep documentation easy to scan with headings and short sections.
- Keep documentation close to the code or artifact it describes.

## Documentation Quality

- Documentation should evolve with the codebase.
- Remove obsolete documentation instead of leaving outdated information.
- Favor self-documenting code over excessive documentation.
