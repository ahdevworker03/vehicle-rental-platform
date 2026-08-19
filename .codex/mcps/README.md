# MCP Ecosystem

## Purpose

This directory documents the Model Context Protocol (MCP) servers used in our development environment. MCP is an open protocol that standardizes how AI assistants discover and interact with tools, data sources, and services. It enables seamless integration between AI agents and external systems through a consistent, secure interface.

The documentation here serves both human developers and AI agents, providing clear guidance on:

- Why each MCP server exists
- When to use it and when NOT to use it
- What permissions it requires
- What problems it solves
- How it fits into our workflow

This is NOT a tutorial on MCP itself. It is a practical reference for making decisions about tool usage in our development environment.

## Philosophy

### MCP as an Enabler, Not a Replacement

MCP servers extend the capabilities of AI agents by providing structured access to external systems. They do not replace:

- Direct developer workflows (e.g., using git commands manually)
- CI/CD pipelines (GitHub Actions)
- Application code (our React/Express codebase)

Instead, MCP servers enable AI agents to assist with tasks that would otherwise require manual intervention or context switching.

### Tools Are Capabilities, Not Commands

Each MCP server exposes a set of **tools**—callable functions that the AI agent can invoke. Think of MCP tools not as API endpoints but as specialized capabilities that help an AI achieve a particular task. Behind a single tool may be multiple APIs and business logic.

### Security and Consent First

MCP enables powerful capabilities through arbitrary data access and code execution paths. The protocol's security principles are non-negotiable:

- **User consent and control**: Users must explicitly consent to and understand all data access and operations
- **Data privacy**: Hosts must obtain explicit user consent before exposing user data to servers
- **Tool safety**: Tools represent arbitrary code execution and must be treated with appropriate caution
- **LLM sampling controls**: Users must explicitly approve any LLM sampling requests

## Why Each MCP Exists

| MCP            | Purpose                                 | Key Use Cases                                                                        |
| -------------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| **Context7**   | Documentation search and retrieval      | Querying official docs, finding API references, staying current with library updates |
| **GitHub**     | Repository and collaboration management | Creating repos, managing issues/PRs, reading/writing files, automating workflows     |
| **Playwright** | Browser automation                      | Web scraping, UI testing, taking screenshots, interacting with web pages             |
| **PostgreSQL** | Database interaction                    | Executing queries, inspecting schemas, analyzing performance                         |
| **Docker**     | Container management                    | Managing containers, images, networks, volumes                                       |
| **Vercel**     | Deployment and project management       | Managing projects, deployments, logs, and analytics                                  |
| **OpenAPI**    | API discovery and invocation            | Parsing OpenAPI specs, generating MCP tools from API definitions                     |

## MCP Selection Principles

When deciding whether to use an MCP server for a task, follow these principles:

### Use an MCP When:

1. **The task is repetitive and automatable** – e.g., creating the same PR template, running the same database query pattern
2. **The task requires cross-system context** – e.g., checking a GitHub issue, then updating the database, then deploying
3. **The task would require context switching** – e.g., leaving the IDE to check Vercel logs
4. **The task is well-defined and bounded** – e.g., "list all open PRs" vs. "redesign the entire authentication system"

### Do NOT Use an MCP When:

1. **Manual execution is faster** – e.g., running `git status` manually is faster than invoking an MCP tool
2. **The operation is destructive and requires human judgment** – e.g., deleting production data
3. **The tool would require excessive permissions** – avoid tools that need broad write access for a read-only task
4. **The task is better handled by CI/CD** – e.g., running tests, building artifacts
5. **The operation is one-off and not repeatable** – e.g., a one-time data migration that will never be repeated

## Security Principles

### Authentication

Each MCP server handles authentication differently:

- **GitHub MCP**: Requires a GitHub Personal Access Token (PAT) with appropriate scopes
- **Vercel MCP**: Uses OAuth with Vercel's hosted MCP endpoint
- **PostgreSQL MCP**: Requires database connection string with credentials
- **Docker MCP**: May require Docker socket access or specific permissions
- **Context7 MCP**: Supports keyless access or API key for higher rate limits
- **Playwright MCP**: No authentication to the server itself; supports page authentication
- **OpenAPI MCP**: Varies by implementation; supports Basic, Bearer, API Key, Cognito

### Permission Boundaries

Always follow the principle of least privilege:

1. **Read vs. Write**: Prefer read-only tools when exploring. Write operations may require explicit approval.
2. **Scope**: Restrict MCP server access to the minimum necessary (e.g., specific repos, specific databases, specific directories).
3. **Tokens**: Never hardcode credentials. Use environment variables or secure secret storage.
4. **Audit**: Review tool execution logs to understand what operations were performed.

### Configuration Safety

- Never commit MCP configuration files containing secrets to version control
- Use `.env` or environment variables for credentials
- Add configuration files with secrets to `.gitignore`
- Use `.example` files for documenting required variables

## Maintenance Guidelines

### Adding a New MCP Server

Before introducing a new MCP server:

1. **Verify official support**: Prefer servers from official sources (GitHub, Vercel, Docker, etc.)
2. **Document it**: Follow the structure in this directory (Purpose, Problems It Solves, Primary Capabilities, etc.)
3. **Assess permissions**: Clearly document what access the server requires
4. **Test in isolation**: Verify the server works as expected before integrating into workflows
5. **Update this README**: Add the new server to the inventory table

### Updating an Existing MCP Server

1. **Check official documentation**: Ensure the server's capabilities and configuration haven't changed
2. **Test the update**: Verify existing tools still work as expected
3. **Update documentation**: Reflect any changes in capabilities, permissions, or limitations

### Deprecating an MCP Server

1. **Communicate**: Notify the team before deprecation
2. **Document the transition**: Provide alternatives and migration guidance
3. **Remove references**: Update this README and remove the server from the inventory

## Current MCP Inventory

```
docs/mcps/
├── README.md              # This file
├── context7.md            # Documentation search and retrieval
├── github.md              # GitHub repository and collaboration management
├── playwright.md          # Browser automation and testing
├── postgresql.md          # PostgreSQL database interaction
├── docker.md              # Docker container management
├── vercel.md              # Vercel deployment and project management
└── openapi.md             # OpenAPI API discovery and invocation
```

## How MCPs Complement AI Skills

Our AI Skills library (in `.opencode/skills/`) provides knowledge about how to use technologies effectively. MCP servers provide the **tools** to act on that knowledge.

| AI Skill                           | Related MCP                      | How They Work Together                                                                            |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `git`                              | `github`                         | The `git` skill teaches proper Git workflows; the GitHub MCP automates repository operations      |
| `testing`                          | `playwright`                     | The `testing` skill defines testing strategy; Playwright MCP executes browser tests               |
| `postgresql` / `prisma`            | `postgresql`                     | The database skills teach schema design and query optimization; PostgreSQL MCP executes queries   |
| `deployment`                       | `vercel`                         | The deployment skill defines deployment strategy; Vercel MCP manages deployments                  |
| `docker`                           | `docker`                         | The Docker skill teaches containerization best practices; Docker MCP manages containers           |
| `openapi` / `api-design`           | `openapi`                        | The API skills define API contracts; OpenAPI MCP discovers and invokes APIs                       |
| `debugging`                        | `postgresql`, `docker`, `vercel` | Debugging skills identify issues; MCP servers help inspect logs, queries, and container state     |
| `typescript` / `react` / `express` | `context7`                       | Framework skills guide implementation; Context7 fetches current documentation to ground decisions |
| `security`                         | `github`, `docker`, `vercel`     | Security skills define policies; MCP servers enforce secure configurations and access controls    |

## When to Introduce a New MCP

Introduce a new MCP server when:

1. **A task is frequently performed by AI agents** – the server would reduce repeated manual effort
2. **The task requires access to an external system** – e.g., a new database, a new API, a new deployment platform
3. **An official MCP server exists** – prefer official implementations over community ones
4. **The benefits outweigh the maintenance cost** – consider the overhead of configuration, updates, and documentation

## When NOT to Introduce a New MCP

Do NOT introduce a new MCP server when:

1. **The task is better handled by a script** – scripts are simpler and don't require MCP infrastructure
2. **The task is one-off** – if it won't be repeated, manual execution is fine
3. **No official server exists** – avoid untrusted community servers unless thoroughly vetted
4. **The server requires excessive permissions** – if the server needs broad access for a narrow task, reconsider
5. **The server is poorly maintained** – check the repository for recent activity and issue resolution

## Getting Started

To configure an MCP server for your environment, refer to the specific documentation file for that server. Each file includes configuration examples for common clients (Claude Desktop, Cursor, VS Code, etc.).

### Quick Reference: Configuration Entry Points

| MCP Server     | Configuration Source                              | Authentication Method      |
| -------------- | ------------------------------------------------- | -------------------------- |
| **Context7**   | `claude_desktop_config.json`                      | Optional API key           |
| **GitHub**     | Environment variable `GITHUB_TOKEN`               | Personal Access Token      |
| **Playwright** | Command-line arguments / config file              | None (local)               |
| **PostgreSQL** | Environment variable `POSTGRES_CONNECTION_STRING` | Database credentials       |
| **Docker**     | Docker Desktop Beta feature                       | Docker daemon access       |
| **Vercel**     | MCP client configuration URL                      | OAuth                      |
| **OpenAPI**    | Command-line arguments / environment variables    | API credentials (per spec) |

## Official References

- [Model Context Protocol (MCP) – Official Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP Architecture Overview](https://modelcontextprotocol.io/docs/learn/architecture)
- [MCP Security and Trust & Safety](https://modelcontextprotocol.io/specification/2025-11-25#security-and-trust-safety)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [MCP Servers Reference Implementations](https://github.com/modelcontextprotocol/servers)
- [MCP SDKs](https://modelcontextprotocol.io/docs/sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
