# Context7 MCP

## Purpose

Context7 MCP provides AI agents with access to accurate, up‑to‑date library documentation directly from official sources. Instead of relying on potentially outdated training data, agents can fetch real‑time, version‑specific documentation and code examples to answer questions and generate working code.

The server acts as a bridge between MCP‑compatible clients and the Context7 API, exposing documentation querying, project search, and project metadata retrieval as standard MCP tools.

## Problems It Solves

AI agents frequently struggle with three core issues that Context7 directly addresses:

| Problem                | How Context7 Solves It                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Outdated knowledge** | Training data becomes stale; agents use deprecated APIs. Context7 fetches live documentation from the source.                            |
| **Hallucinated APIs**  | Models confidently suggest methods that don't exist. Context7 grounds answers in actual API surfaces — not training‑data approximations. |
| **Version mismatches** | Code examples from old versions that no longer work. Context7 supports version‑specific documentation lookups.                           |

## Primary Capabilities

The Context7 MCP server exposes the following tools and resources:

| Capability         | Description                                                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `c7_query`         | Query the Context7 API for information on a specific topic within a project. Accepts project name, query text, optional format (txt/json), and optional token limit. |
| `c7_search`        | Search for available Context7 projects by keyword. Returns a list of matching projects with title and usable name.                                                   |
| `c7_info`          | Get metadata about a specific Context7 project (source repository, last update, etc.).                                                                               |
| `c7_projects_list` | Provides a list of all available Context7 projects via the URI `context7://projects/list`.                                                                           |

## When to Use

Use Context7 MCP when:

1. **Working with a library you don't know well** – The agent needs accurate API references.
2. **Working with a library that has recently changed** – New React versions, framework migrations, or major version updates.
3. **Debugging "this function should exist but it doesn't" confusion** – The agent is referencing non‑existent or renamed APIs.
4. **Writing code for SDKs/APIs** – The model's training data doesn't cover the current API surface well.
5. **Validating code review** – Verifying implementations against current API documentation for correctness and best practices.
6. **Generating code for production** – Ensuring generated code uses current APIs and best practices, not deprecated patterns.

### Usage Pattern

In prompts, simply include `use context7` to instruct the agent to fetch current documentation:

> _"Create a Next.js middleware that checks for a valid JWT in cookies and redirects unauthenticated users to `/login`. use context7"_

For version‑specific queries, use the resolve‑then‑query pattern:

> _`context7: resolve "next.js" v15 — then look up streaming rendering`_

## When NOT to Use

Do NOT use Context7 MCP when:

1. **Documentation is for private/internal code** – Context7 only covers public libraries.
2. **The library is obscure with no real documentation** – Context7 cannot fetch what doesn't exist.
3. **You need to understand the actual codebase usage** – Context7 grounds in docs, not your usage patterns.
4. **The task is better handled by reading the codebase directly** – For project‑specific patterns, consult the code itself.
5. **The library is not indexed by Context7** – While thousands are covered, some may be missing.

## Permissions

Context7 MCP requires:

- **Network access** – To reach the Context7 API endpoint (`https://mcp.context7.com/mcp`).
- **Optional API key** – Without a key, the server works but with more aggressive rate limits. A free API key from the [Context7 dashboard](https://context7.com/dashboard) raises rate limits and enables access to private repositories.

## Authentication

Context7 MCP supports two authentication modes:

| Mode        | Configuration                                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Keyless** | Works without authentication; rate‑limited more aggressively. Suitable for occasional use.                                            |
| **API Key** | Get a free key at [context7.com/dashboard](https://context7.com/dashboard). Include as `CONTEXT7_API_KEY` in headers or command args. |

**OAuth 2.0** is also supported for MCP clients that implement the MCP OAuth specification. For remote connections, change the endpoint from `/mcp` to `/mcp/oauth`.

## Limitations

| Limitation                    | Impact                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Rate limits without a key** | Keyless endpoint is rate‑limited more aggressively; a free API key raises limits.                                                   |
| **Token budget**              | Context7 returns chunks of documentation; very chatty queries can push past your context window.                                    |
| **No private/internal docs**  | Context7 only covers public libraries.                                                                                              |
| **Version drift**             | If you don't pin the version explicitly, Context7 resolves to the latest version it knows, which may not match your `package.json`. |
| **SSE transport deprecated**  | The Server‑Sent Events (SSE) transport protocol is deprecated; use HTTP or stdio transport methods.                                 |

## Best Practices

1. **Use version‑specific queries** – Explicitly pin the version when your repository's `package.json` is behind the latest. Example: `context7: resolve "next.js" v15`.
2. **Be specific in queries** – Token budget is limited; ask targeted questions rather than broad, open‑ended ones.
3. **Get a free API key** – Sign up at context7.com for higher rate limits, even for public use.
4. **Use `use context7` in prompts** – This signals the agent to fetch current documentation before generating code.
5. **Combine with code review** – Use Context7 to verify that code follows current API best practices.

## Common Mistakes

| Mistake                                         | Why it fails                                                         | Correct approach                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Not pinning the version                         | Context7 resolves to latest, which may not match your `package.json` | Explicitly specify the version: `context7: resolve "next.js" v15`               |
| Asking overly broad questions                   | Exceeds token budget; returns too much context                       | Be specific: ask about a particular API or pattern                              |
| Relying on Context7 for private code            | Context7 only covers public libraries                                | Use Memory MCP or a custom internal MCP for private/internal documentation      |
| Assuming Context7 replaces reading the codebase | It grounds in documentation, not your project's usage patterns       | Use Context7 for API reference, read the codebase for project‑specific patterns |
| Forgetting to include `use context7` in prompts | Agent relies on training data instead of fetching live docs          | Always include `use context7` in prompts requiring current documentation        |

## Related Skills

- `typescript` – For language‑specific documentation lookups
- `react` – For React component and hook documentation
- `express` – For Express.js API documentation
- `prisma` – For Prisma ORM documentation
- `postgresql` – For PostgreSQL documentation
- `api-design` – For OpenAPI and REST API documentation
- `debugging` – For verifying API usage during debugging
- `code-review` – For validating code against current API documentation

## Related MCPs

- **OpenAPI MCP** – For discovering and invoking APIs; Context7 provides the documentation context for those APIs
- **GitHub MCP** – For reading repository code alongside documentation lookups
- **Filesystem MCP** – For reading local project files while referencing documentation

## Official References

- [Context7 MCP Overview](https://context7.com/docs/agentic-tools/overview)
- [c7-mcp-server npm Package](https://www.npmjs.com/package/c7-mcp-server)
- [Context7 GitHub Repository](https://github.com/deldos/context7)
- [Context7 Dashboard](https://context7.com/dashboard) – For API key management
