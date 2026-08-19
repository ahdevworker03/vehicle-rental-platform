# OpenAPI MCP

## Purpose

OpenAPI MCP servers bridge OpenAPI specifications with AI assistants by dynamically generating Model Context Protocol tools from OpenAPI-defined REST APIs. They transform any OpenAPI 3.x specification—whether local JSON/YAML files or remote URLs—into structured, machine-readable MCP tools that LLMs can discover and invoke.

The OpenAPI ecosystem in MCP has two primary dimensions:

- **API Consumption**: Servers that convert OpenAPI specs into MCP tools, enabling AI agents to call any REST API with a well-defined specification. The OpenAPI MCP Server from AWS Labs is the most mature and actively maintained implementation.

- **API Discovery**: The MCP Registry API itself is defined as an OpenAPI specification, enabling standardized discovery and access to MCP server metadata. This is the official OpenAPI spec that powers the MCP Registry ecosystem.

## Problems It Solves

| Problem | How OpenAPI MCP Solves It |
|---------|---------------------------|
| **APIs are inaccessible to AI** | AI models cannot natively understand REST API structures. OpenAPI MCP exposes API operations as structured tools with clear schemas. |
| **Manual API integration** | Developers must write custom code to interact with each API. OpenAPI MCP automates API discovery and invocation. |
| **Spec-driven APIs remain underutilized** | Many services have OpenAPI specs but no AI-friendly interface. OpenAPI MCP unlocks these APIs for agentic workflows. |
| **Inconsistent API exploration** | Exploring API endpoints, parameters, and schemas requires manual effort. OpenAPI MCP provides structured exploration tools. |
| **Context switching** | Moving between API documentation, code, and AI assistants interrupts workflow. OpenAPI MCP brings API interaction directly into the AI environment. |

## Primary Capabilities

The primary OpenAPI MCP server (AWS Labs) offers comprehensive features:

| Capability | Description |
|------------|-------------|
| **Dynamic Tool Generation** | Automatically creates MCP tools from OpenAPI endpoints; maps GET operations with query parameters to tools rather than resources for better LLM usability |
| **Multi-Spec Composition** | Combine multiple OpenAPI specs into a single MCP server; each spec gets its own HTTP client with independent authentication |
| **Tag-based Filtering** | Control which operations are exposed using include/exclude tags via CLI args or environment variables |
| **Enriched Tool Descriptions** | Appends response codes and parameter examples from the OpenAPI spec to help LLMs make better tool selections |
| **SSRF Protection** | URLs are validated against DNS resolution and IP allowlisting before fetching |
| **Output Validation** | Optional response schema validation; can be disabled for APIs with loose specs |
| **Dynamic Prompts** | Creates operation-specific and API documentation prompts from API structure |
| **Token Optimization** | Implements strategies achieving 70–75% reduction in token usage while maintaining functionality |
| **Authentication Support** | Multiple methods: Basic, Bearer Token, API Key, Cognito |
| **Metrics Collection** | Tracks API calls, tool usage, errors, and performance |

Alternative implementations provide exploration-focused tools:

| Tool | Description |
|------|-------------|
| `search_endpoints` | Search endpoints by path pattern, HTTP method, tags, or description |
| `get_endpoint_details` | Get complete endpoint details including parameters and schemas |
| `search_schemas` | Search for schemas/models by name or property |
| `get_schema_details` | Get full schema definition with resolved references |

## When to Use

Use OpenAPI MCP when:

1. **You have an OpenAPI specification** – Any OpenAPI 3.x spec (JSON or YAML) can be converted to MCP tools
2. **You need AI to interact with REST APIs** – The server exposes API operations as structured, callable tools
3. **You want to explore an API's structure** – Search endpoints, schemas, and understand API architecture
4. **You have multiple APIs to consolidate** – Combine multiple specs into a single MCP server with per-spec authentication
5. **You need to control which operations are exposed** – Use tag-based filtering to include or exclude specific operations
6. **You want to reduce token usage** – The server's prompt optimization achieves 70–75% token reduction
7. **You need to validate API responses** – Enable response schema validation to catch mismatches

## When NOT to Use

Do NOT use OpenAPI MCP when:

1. **The API has no OpenAPI specification** – OpenAPI MCP requires a well-defined spec
2. **The API is internal with no public spec** – Only works with accessible OpenAPI specifications
3. **You need interactive API exploration with human context** – OpenAPI MCP is for programmatic AI interaction, not human browsing
4. **The spec is extremely large and exceeds token limits** – Large specs may exceed context windows; use token optimization or filtering
5. **You need to manage the API lifecycle** – OpenAPI MCP is for consumption, not API management
6. **The operation is better handled by direct code** – For complex multi-step operations, custom code may be more appropriate

## Permissions

OpenAPI MCP permissions vary by implementation:

- **Network access**: Required to fetch OpenAPI specifications from remote URLs
- **API authentication**: May require API keys, bearer tokens, or other credentials for the target APIs
- **Filesystem access**: Required for local OpenAPI spec files (JSON/YAML)
- **SSRF protection**: URLs are validated against IP allowlisting before fetching

**Security considerations**:
- SSRF protection prevents fetching from unauthorized IP addresses
- Authentication credentials are passed per-spec via environment variables
- Response validation can be enabled to ensure API responses match the spec

## Authentication

OpenAPI MCP supports multiple authentication methods:

| Method | Description |
|--------|-------------|
| **Basic Auth** | Username/password authentication |
| **Bearer Token** | Token-based authentication via Authorization header |
| **API Key** | Key-based authentication (header or query parameter) |
| **Cognito** | AWS Cognito integration |

For **spec endpoint authentication**, the server supports:
- Per-entry `auth_type`, `auth_token` for each spec when composing multiple specs
- Environment variable configuration for API keys and tokens

## Limitations

| Limitation | Impact |
|------------|--------|
| **Requires OpenAPI 3.x** | Only works with OpenAPI 3.x specifications (JSON or YAML) |
| **Spec validity** | Minor spec issues log warnings but do not fail startup; major issues may prevent tool generation |
| **Token limits** | Large specs may exceed context window; use filtering or prompt optimization |
| **Authentication per-spec** | Each spec in multi-spec composition requires its own authentication configuration |
| **SSRF restrictions** | URLs are validated against IP allowlisting; some endpoints may be blocked |
| **No API management** | OpenAPI MCP consumes APIs; it does not provide API management or lifecycle features |
| **Transport options** | Primarily supports stdio; HTTP support varies by implementation |

## Best Practices

1. **Use tag-based filtering** – Limit exposed operations to relevant tags to reduce token usage and focus the AI
2. **Enable response validation** – Validate outputs to catch API response mismatches early
3. **Configure SSRF protection** – Use IP allowlisting to restrict which URLs can be fetched
4. **Compose multiple specs** – Combine related APIs into a single server with per-spec authentication
5. **Set appropriate cache TTL** – Configure `SPEC_CACHE_TTL` to balance freshness and performance
6. **Use token optimization** – Leverage the server's prompt optimization to reduce token usage by 70–75%
7. **Validate specs before use** – Use the server's validation features to catch issues early
8. **Use the MCP Registry API** – For discovering MCP servers, leverage the official OpenAPI specification

## Common Mistakes

| Mistake | Why it fails | Correct approach |
|---------|--------------|------------------|
| Not validating the OpenAPI spec | Invalid specs cause tool generation to fail | Use the server's validation features; it logs warnings for minor issues |
| Exposing too many operations | Exceeds token limits; overwhelms the AI | Use tag-based filtering to limit exposed operations |
| Not configuring authentication | API calls fail with 401/403 errors | Configure auth_type and auth_token per spec |
| Using untrusted OpenAPI URLs | SSRF vulnerabilities | Use SSRF protection with IP allowlisting |
| Ignoring response validation | API response mismatches go undetected | Enable output validation; disable only for loose specs |
| Not optimizing prompts | High token usage increases costs | Use the server's built-in token optimization |
| Not caching the spec | Repeated fetches waste bandwidth and time | Configure `SPEC_CACHE_TTL` |

## Related Skills

- `api-design` – For understanding OpenAPI specification structure and design principles
- `openapi` – For maintaining and updating OpenAPI specifications
- `express` – For implementing OpenAPI-defined APIs
- `validation` – For request/response validation patterns
- `debugging` – For troubleshooting API integration issues
- `testing` – For testing API endpoints against OpenAPI specifications

## Related MCPs

- **Context7 MCP** – For documentation lookup alongside API discovery
- **PostgreSQL MCP** – For database operations alongside API integration
- **GitHub MCP** – For managing repositories and code alongside API consumption
- **Docker MCP** – For container management alongside API orchestration

## Official References

- [AWS Labs OpenAPI MCP Server – PyPI](https://pypi.org/project/awslabs.openapi-mcp-server/)
- [mcp-openapi-proxy – PyPI](https://pypi.org/project/mcp-openapi-proxy/0.3.1/)
- [MCP Registry OpenAPI Specification](https://registry.modelcontextprotocol.io/openapi.yaml)
- [MCP Registry API Documentation](https://modelcontextprotocol.io)