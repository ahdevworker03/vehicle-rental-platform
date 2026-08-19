# PostgreSQL MCP

## Purpose

PostgreSQL MCP servers bridge PostgreSQL databases with AI assistants through the Model Context Protocol (MCP). They enable AI agents to discover database schemas, execute SQL queries, and perform database operations through a structured, controlled interface.

The PostgreSQL ecosystem in MCP has evolved through multiple implementations. The original `@modelcontextprotocol/server-postgres` was deprecated and archived in July 2025 following a SQL-injection CVE. Today, several community-maintained alternatives provide production-grade capabilities with enhanced security.

## Problems It Solves

| Problem | How PostgreSQL MCP Solves It |
|---------|------------------------------|
| **AI cannot directly access databases** | LLMs have no native way to query databases. PostgreSQL MCP exposes structured tools for schema inspection and query execution. |
| **Manual schema exploration** | Developers must manually query system catalogs to understand schema. MCP servers automatically discover and serve table schemas as structured resources. |
| **Ad-hoc query execution requires context switching** | Moving between IDE, terminal, and database client interrupts workflow. MCP brings database interaction directly into AI-assisted environments. |
| **Unsafe query execution** | Without guardrails, AI-generated SQL can be destructive or resource-intensive. MCP servers provide read-only modes, query timeouts, row caps, and safety audits. |
| **Inconsistent database access patterns** | Different tools require different connection methods. MCP provides a standardized interface across all MCP-compatible clients. |

## Primary Capabilities

PostgreSQL MCP servers vary by implementation, but core capabilities include:

| Capability | Description |
|------------|-------------|
| **Schema Discovery** | Automatically discover and serve table schemas as JSON resources; list tables, columns, views, and relationships |
| **Query Execution** | Execute SQL queries with safety measures—row caps, timeouts, complexity analysis, and rate limiting |
| **Read-Only Mode** | Run all queries within a READ ONLY transaction to prevent accidental data modification |
| **Multi-Database Support** | Connect to multiple databases and switch between them; database + schema dual-layer allowlist control |
| **Write Operations (opt-in)** | INSERT, UPDATE, DELETE, and DDL operations when explicitly enabled with security flags |
| **Query Analysis** | Explain query execution plans; analyze performance |
| **Connection Pooling** | Production-grade connection pooling for concurrent queries |
| **Multiple Transports** | STDIO, HTTP (Streamable HTTP), and SSE transport modes |
| **Structured Responses** | JSON responses with data, count, affected rows, and metadata |

**Tool examples** (varies by implementation):

- `query` / `pg_execute_sql` – Execute SQL queries
- `list_tables` – List tables in a schema
- `list_columns` – List columns for a table
- `pg_switch_database` – Switch current database
- `pg_switch_schema` – Switch current schema
- `generate_erd_mermaid` – Generate ERD diagram
- `explain_query` – Get query execution plan

## When to Use

Use PostgreSQL MCP when:

1. **You need AI to explore database schemas** – Understand table structures, column types, and relationships without manual queries
2. **You need AI to generate and run SQL queries** – Natural language to SQL conversion with safety guardrails
3. **You are debugging database issues** – Inspect data, verify query results, analyze performance
4. **You need to understand database relationships** – Generate ER diagrams, find foreign key relationships
5. **You are developing in a multi-database environment** – Switch between databases and schemas within the same session
6. **You want safe, read-only database exploration** – Explore data without risk of accidental modifications
7. **You need production-grade database access** – Connection pooling, query safety, and extensible tooling

## When NOT to Use

Do NOT use PostgreSQL MCP when:

1. **You need to perform complex administrative tasks** – User management, role administration, or server-level configuration are better handled by dedicated database tools
2. **You are working with sensitive production data without proper safeguards** – Use read-only mode or test environments first
3. **The query is a one-off that you can run manually** – Simple queries are faster to run directly
4. **You need bulk data migration or ETL** – Dedicated ETL tools are more appropriate
5. **You are using an environment where MCP is not configured** – MCP requires client support and proper setup
6. **The database contains highly sensitive data requiring strict access controls** – Ensure proper security boundaries are configured

## Permissions

PostgreSQL MCP permission models vary by implementation:

| Permission | Description |
|------------|-------------|
| **Database Connection** | Requires credentials with appropriate database access |
| **Read-Only vs Read-Write** | Some servers default to read-only; write operations require explicit opt-in flags |
| **Schema-Level Access** | Dual-layer allowlist: database + schema; each database has independent schema allowlist |
| **Connection String** | May be provided via environment variable or command argument |
| **Security Modes** | `readonly`, `write`, `admin`, or `unsafe` modes for graduated access |
| **Destructive Operations** | Drops, resets, and broad role grants require `--allow-destructive` flag |
| **Tool-Level Connection Strings** | Disabled by default; must explicitly opt in with `--allow-tool-connection-string` |

## Authentication

PostgreSQL MCP supports PostgreSQL's native authentication methods:

| Method | Description |
|--------|-------------|
| **Connection String** | `postgresql://user:password@host:port/database` |
| **Environment Variables** | `POSTGRES_CONNECTION_STRING`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` |
| **SSL/TLS** | Configurable SSL connection; `PGSSL=true`, `PGSSL_REJECT_UNAUTHORIZED` |
| **Docker** | Pass connection string as argument or via environment variable |

**Configuration variables** (varies by implementation):

| Variable | Description |
|----------|-------------|
| `POSTGRES_CONNECTION_STRING` | Full PostgreSQL connection URL |
| `POSTGRES_HOST` / `PGHOST` | Database host |
| `POSTGRES_PORT` / `PGPORT` | Database port |
| `POSTGRES_USER` / `PGUSER` | Database user |
| `POSTGRES_PASSWORD` / `PGPASSWORD` | Database password |
| `POSTGRES_DEFAULT_DATABASE` / `PGDATABASE` | Default database |
| `POSTGRES_READ_ONLY` | Enable read-only mode (true/false) |
| `POSTGRES_ALLOWED_DATABASES` | Comma-separated list of allowed databases |

## Limitations

| Limitation | Impact |
|------------|--------|
| **Official server deprecated** | The original `@modelcontextprotocol/server-postgres` was archived in July 2025 due to a SQL-injection CVE. Use community-maintained alternatives |
| **Multiple implementations, no single standard** | Different servers have different tool sets, security models, and configuration approaches; choose one that fits your security requirements |
| **Read-only by default in some implementations** | Write operations require explicit opt-in flags |
| **Connection string limitations** | Some servers disable per-tool connection strings by default for security |
| **Schema discovery scope** | Schema information is automatically discovered from connected database metadata |
| **Query safety trade-offs** | Safety features (row caps, timeouts) may limit complex queries |
| **Multi-statement restrictions** | Multi-statement SQL may require specific flags (`transactional: true`, `expectRows: false`) |

## Best Practices

1. **Start with read-only mode** – Use `POSTGRES_READ_ONLY=true` or `--security-mode readonly` until you verify queries are safe

2. **Use database + schema allowlists** – Restrict access to specific databases and schemas to prevent cross-schema access

3. **Use connection pooling** – Production-grade implementations provide connection pooling for concurrent queries

4. **Enable SSL for production connections** – Configure `PGSSL=true` and `PGSSL_REJECT_UNAUTHORIZED=true`

5. **Explicitly opt into write operations** – Use `--security-mode write` or `--security-mode admin` only when necessary

6. **Use structured queries over arbitrary SQL** – Prefer structured where predicates over raw WHERE clauses for mutations

7. **Set query timeouts and row limits** – Protect against resource-intensive queries

8. **Test in a non-production environment first** – Verify queries and operations before running against production data

9. **Audit which implementation you're using** – Review the tool set, security model, and configuration approach for your chosen server

## Common Mistakes

| Mistake | Why it fails | Correct approach |
|---------|--------------|------------------|
| **Using the deprecated official server** | Archived; may have unpatched vulnerabilities | Use a community-maintained alternative with active development |
| **Not enabling read-only mode for exploration** | Accidental data modification | Use `POSTGRES_READ_ONLY=true` or `--security-mode readonly` |
| **Hardcoding credentials in configuration** | Security risk; credentials exposed | Use environment variables or secure secret management |
| **Not setting database + schema allowlists** | Cross-schema access; unintended queries | Configure `POSTGRES_ALLOWED_DATABASES` and per-database schema allowlists |
| **Assuming all PostgreSQL MCP servers are the same** | Different tools, flags, and security models | Review the specific implementation's documentation |
| **Running destructive operations without flags** | Operations fail silently | Use `--allow-destructive` for drops, resets, and broad grants |
| **Not using structured where predicates** | Mutations may affect unintended rows | Use structured where predicates; use `rawWhere` only with unsafe mode |

## Related Skills

- `postgresql` – For PostgreSQL-specific performance tuning and indexing
- `prisma` – For ORM patterns and schema design
- `database-schema-design` – For schema design principles
- `migrations` – For managing schema changes
- `debugging` – For troubleshooting database issues
- `testing` – For database testing strategies
- `performance` – For database performance optimization

## Related MCPs

- **Docker MCP** – For running PostgreSQL MCP in containerized environments
- **OpenAPI MCP** – For API discovery alongside database operations
- **GitHub MCP** – For repository operations in database workflows

## Official References

- [PostgreSQL MCP Server (pypi.org)](https://pypi.org/project/postgresql-mcp-server/)
- [mcp-server-postgresql (npm)](https://www.npmjs.com/package/mcp-server-postgresql)
- [PostgreSQL MCP Server (github.com/HenkDz)](https://github.com/henkdz/postgresql-mcp-server)
- [mcp-postgres (github.com/gardner)](https://github.com/gardner/mcp-postgres)
- [MCP 服务器 - PostgreSQL extension for Visual Studio Code](https://learn.microsoft.com/zh-cn/azure/postgresql/development/vs-code-extension/mcp-server)
- [PostgreSQL MCP Server (pkg.go.dev)](https://pkg.go.dev/github.com/leixiaotian1/pgsql-mcp-server@v0.3.1)