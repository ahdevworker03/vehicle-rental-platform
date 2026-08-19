---
name: mcp
description: Load when choosing or configuring MCP servers for this repository, especially `.codex/config.toml`, Context7, GitHub, Playwright, PostgreSQL, Docker, Vercel, or OpenAPI. Determines whether an MCP should be used and selects the appropriate server.
---

# MCP

## Purpose

This skill helps the agent determine **when an MCP should be used** and **which MCP server is appropriate** for the task.

Skills provide reasoning and implementation knowledge.

MCPs provide access to external tools, services, and live information.

Always prefer internal reasoning first. Use an MCP only when external information or actions are required.

---

## When to Load

Load this skill when a task requires:

- Official documentation or version-specific APIs
- Repository operations
- Database inspection or queries
- Browser automation
- Deployment management
- Container management
- External services or live data
- Any interaction with configured MCP servers

---

## When NOT to Load

Do not load this skill when:

- Solving implementation problems using existing skills alone
- Writing application code without external interactions
- Refactoring, reviewing, or designing code that requires only reasoning
- Repository rules and technology skills provide sufficient information

---

# Core Principles

## 1. Skills First

Always begin by loading the appropriate technology skills.

Example:

- React
- TypeScript
- Prisma
- PostgreSQL
- Docker

Skills explain **how to think**.

---

## 2. MCPs Enable Actions

Use an MCP only when external interaction is required.

Examples:

- Reading a GitHub Pull Request
- Querying a PostgreSQL database
- Running browser automation
- Deploying to Vercel

MCPs allow the agent to **perform actions** beyond reasoning.

---

## 3. Prefer Official Sources

Whenever implementation depends on:

- framework behavior
- library APIs
- version-specific features
- official recommendations

consult **Context7** before relying on memory.

Context7 is the preferred source for official documentation.

---

## 4. Use the Smallest Necessary Tool

Only use the MCP required for the current task.

Avoid unnecessary external calls.

---

# Decision Rules

## Documentation

**IF** implementation depends on library or framework behavior,

**THEN** use **Context7**.

Examples:

- React
- TypeScript
- Express
- Prisma
- PostgreSQL
- Docker
- OpenAPI
- Vercel
- Tailwind CSS
- shadcn/ui

---

## Repository Operations

**IF** the task involves:

- Pull Requests
- Issues
- Branches
- Repository metadata

**THEN** use the **GitHub MCP**.

---

## Database

**IF** the task requires:

- inspecting schema
- running queries
- checking indexes
- analyzing execution plans

**THEN** use the **PostgreSQL MCP**.

---

## Browser

**IF** the task requires:

- UI verification
- browser automation
- screenshots
- end-to-end testing

**THEN** use the **Playwright MCP**.

---

## Containers

**IF** the task requires:

- Docker images
- containers
- Compose
- logs

**THEN** use the **Docker MCP**.

---

## Deployment

**IF** the task requires:

- deployments
- environment variables
- project configuration
- production inspection

**THEN** use the **Vercel MCP**.

---

# Best Practices

- Prefer skills before MCPs.
- Use Context7 instead of memory when documentation matters.
- Use the minimum number of MCPs required.
- Prefer read-only operations before write operations.
- Respect user approval and permission boundaries.
- Use official documentation whenever available.

---

# Anti-Patterns

Avoid:

- Using an MCP when reasoning alone is sufficient.
- Guessing framework behavior instead of consulting Context7.
- Performing write operations without confirmation.
- Using multiple MCPs when one is sufficient.
- Assuming an MCP exists without checking the configured servers.

---

# Related Skills

- react
- typescript
- express
- prisma
- postgresql
- docker
- deployment
- git
- github-actions
- debugging

---

# Related Documentation

See:

- `docs/mcps/README.md`
- `docs/mcps/context7.md`
- `docs/mcps/github.md`
- `docs/mcps/postgresql.md`
- `docs/mcps/playwright.md`
- `docs/mcps/docker.md`
- `docs/mcps/vercel.md`

These documents contain MCP-specific setup, configuration, permissions, authentication, and maintenance guidance.

---

# Official References

- https://modelcontextprotocol.io
- https://github.com/modelcontextprotocol
