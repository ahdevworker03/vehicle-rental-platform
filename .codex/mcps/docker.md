# Docker MCP

## Purpose

Docker MCP encompasses Docker's ecosystem of Model Context Protocol (MCP) tools and infrastructure, enabling AI agents to manage Docker containers, images, networks, and volumes through natural language. It includes several components:

- **Docker Agent MCP Mode**: Exposes Docker agents as MCP tools for use in Claude Desktop, Claude Code, and other MCP-compatible applications
- **MCP Gateway**: Docker's open-source solution for orchestrating MCP servers, acting as a centralized proxy between clients and servers
- **Docker MCP Toolkit**: A Docker Desktop interface for setting up, managing, and running containerized MCP servers
- **MCP Tool**: Connects agents to MCP servers, supporting three transport flavors (Docker MCP via containers, Local stdio, Remote)

The ecosystem provides a secure, containerized way to extend AI capabilities with Docker operations, enabling seamless container and compose stack management through AI assistants.

## Problems It Solves

| Problem                                             | How Docker MCP Solves It                                                                                                                                       |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MCP server management complexity**                | MCP servers are programs that need installation, dependencies, updates, and security management. The MCP Gateway runs them as isolated containers              |
| **Inconsistent tool configuration**                 | Without a gateway, each AI application requires individual MCP server configuration. The Gateway centralizes configuration, credentials, and access control    |
| **Security risks of running arbitrary MCP servers** | Servers run directly on your machine pose security risks. The Gateway runs servers in isolated Docker containers with restricted privileges and network access |
| **Agent distribution**                              | Docker agents can be shared across different applications and built into reusable teams consumable from any MCP client                                         |
| **Container management through natural language**   | AI assistants can manage Docker environments — containers, images, networks, volumes, swarm services — using natural language                                  |

## Primary Capabilities

| Capability                                 | Description                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Expose agents as MCP tools**             | The `docker agent serve mcp` command makes custom agents available to any MCP-compatible application           |
| **MCP Gateway orchestration**              | Centralized proxy manages server lifecycle, routing, authentication, and access control across all MCP servers |
| **Containerized MCP server execution**     | Runs MCP servers in isolated Docker containers with restricted privileges, network access, and resource usage  |
| **Built-in logging and tracing**           | Provides full visibility and governance of AI tool activity                                                    |
| **Profile-based server organization**      | Organizes MCP servers into collections (profiles) for different projects or workflows                          |
| **MCP Catalog access**                     | Browse and add curated MCP servers from the Docker MCP Catalog, with over 200 tools and services               |
| **Multiple transport flavors**             | Supports Docker MCP (containerized via Gateway), Local stdio (subprocess), and Remote (HTTP/SSE) transports    |
| **Tool whitelisting**                      | Optionally expose only specific tools from a server to the model                                               |
| **Container and compose stack management** | Enables seamless container and compose stack management through AI assistants                                  |

## When to Use

Use Docker MCP when:

1. **You need AI agents to manage Docker resources** – Containers, images, networks, volumes, swarm services, secrets, configs, nodes, plugins
2. **You want to expose custom agents as MCP tools** – For use in Claude Desktop, Claude Code, Cursor, or other MCP-compatible clients
3. **You need centralized MCP server management** – The Gateway provides unified configuration, credentials, and access control across all servers
4. **You want secure, containerized MCP server execution** – Servers run in isolated containers with restricted privileges
5. **You're building reusable agent teams** – Share specialized agents across different applications
6. **You want to integrate domain-specific agents** – Incorporate them into existing workflows
7. **You're working in a Docker Desktop environment** – With MCP Toolkit enabled, the Gateway runs automatically in the background

### Usage Patterns

**Expose an agent as an MCP server:**

```bash
# Expose a local config (stdio transport, default)
docker agent serve mcp ./agent.yaml

# Expose over streaming HTTP
docker agent serve mcp ./agent.yaml --http --listen 0.0.0.0:9090
```

**Add a Docker MCP tool to an agent configuration:**

```yaml
toolsets:
  - type: mcp
    ref: docker:github-official # Curated server from Docker MCP Catalog
    tools: ["list_issues", "create_issue"] # Optional whitelist
```

## When NOT to Use

Do NOT use Docker MCP when:

1. **You need to run MCP servers on Docker Engine without Docker Desktop** – Manual installation of the MCP Gateway is required; consider the overhead before proceeding
2. **You're not using Docker for your development environment** – The ecosystem is Docker-centric
3. **You need to manage resources outside Docker's scope** – For non-containerized infrastructure, other MCP servers may be more appropriate
4. **The operation requires direct host interaction** – Container isolation may limit access to certain host resources
5. **You're working in an environment where Docker Desktop is not available** – The MCP Toolkit UI is only available in Docker Desktop

## Permissions

Docker MCP requires:

- **Docker daemon access** – The ability to communicate with the Docker daemon (via Docker Desktop or Docker Engine)
- **Container execution privileges** – The MCP Gateway runs MCP servers as Docker containers
- **Network access** – For HTTP transport modes and remote MCP servers
- **Filesystem access** – Depending on the specific MCP servers being run
- **Docker Desktop (for Toolkit)** – Requires Docker Desktop 4.62 or later with Beta features enabled

**Security considerations:**

- MCP Gateway runs servers with restricted privileges, network access, and resource usage
- The Gateway injects credentials securely and applies security restrictions before forwarding requests
- Built-in logging and call-tracing ensure full visibility and governance

## Authentication

Docker MCP supports multiple authentication modes:

| Mode                           | Description                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| **Docker Desktop MCP Toolkit** | The Gateway runs automatically in the background. No manual authentication required             |
| **Manual MCP Gateway**         | For Docker Engine without Docker Desktop, download the binary from GitHub releases              |
| **Claude Desktop integration** | Configure MCP settings with environment variables (e.g., `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`) |
| **Remote MCP servers**         | Supports streamable HTTP or SSE transport for cloud services                                    |

**Claude Desktop configuration example:**

```json
{
  "mcpServers": {
    "myagent": {
      "command": "/usr/local/bin/docker",
      "args": [
        "agent",
        "serve",
        "mcp",
        "agentcatalog/coder",
        "--working-dir",
        "/home/user/projects"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "your_key_here",
        "OPENAI_API_KEY": "your_key_here"
      }
    }
  }
}
```

## Limitations

| Limitation                                    | Impact                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **MCP Gateway invite-only**                   | The MCP Gateway as part of Docker AI Governance is an invite-only feature; contact Docker Sales to learn more |
| **Docker Desktop requirement for Toolkit UI** | The MCP Toolkit interface is available only in Docker Desktop 4.62 and later                                  |
| **Beta feature status**                       | The MCP Toolkit is in Beta; features may change                                                               |
| **Manual installation for Docker Engine**     | Without Docker Desktop, you must download and install the MCP Gateway separately                              |
| **Container isolation overhead**              | Running servers as containers adds startup latency for cold starts                                            |
| **Tool availability depends on catalog**      | The Docker MCP Catalog determines which pre-curated servers are available                                     |
| **Required configuration for some servers**   | Some servers require mandatory configuration before use                                                       |

## Best Practices

1. **Use the Docker MCP (containerized) flavor for production** – It provides secure, curated, sandboxed servers from the Docker MCP Catalog
2. **Whitelist tools explicitly** – Use the `tools:` array to expose only the tools the agent actually needs
3. **Organize servers into profiles** – Create separate profiles for different projects or workflows
4. **Enable MCP Toolkit in Docker Desktop** – Open Settings → Beta features → Enable Docker MCP Toolkit
5. **Verify connections after configuration** – Test that everything works as expected
6. **Use the catalog for discovery** – Browse available servers before building custom ones
7. **Prefer terminal-based workflows when needed** – Use `docker mcp` CLI commands for automation
8. **Use stdio transport for local clients** – Ideal for Claude Desktop, Claude Code, and Cursor
9. **Use HTTP transport for remote access** – Expose MCP servers over streaming HTTP for broader connectivity

## Common Mistakes

| Mistake                                           | Why it fails                                                 | Correct approach                                                 |
| ------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| Not enabling Beta features in Docker Desktop      | MCP Toolkit is not visible                                   | Open Settings → Beta features → Enable Docker MCP Toolkit        |
| Forgetting to configure required server settings  | Servers show "Configuration Required" badge; they don't work | Complete mandatory configuration before using the server         |
| Using local stdio when containerized is available | Missing security isolation and centralized management        | Use `docker:` ref for curated, sandboxed servers                 |
| Exposing all tools without whitelisting           | Agent may use unintended tools; security risk                | Always specify a `tools:` whitelist                              |
| Not restarting Claude Desktop after configuration | MCP server changes don't take effect                         | Restart Claude Desktop after updating MCP settings               |
| Hardcoding API keys in configuration              | Security risk; keys exposed                                  | Use environment variables (`env:` field)                         |
| Running MCP Gateway manually when not needed      | Unnecessary complexity                                       | Use Docker Desktop with MCP Toolkit – Gateway runs automatically |

## Related Skills

- `docker` – For containerization best practices and Dockerfile authoring
- `deployment` – For integrating containerized deployments
- `performance` – For container performance optimization
- `security` – For comprehensive container security considerations
- `testing` – For testing containerized applications
- `debugging` – For debugging container issues

## Related MCPs

- **PostgreSQL MCP** – For database operations alongside container management
- **GitHub MCP** – For repository operations in containerized development workflows
- **Vercel MCP** – For deployment management alongside container orchestration

## Official References

- [MCP Mode – Docker Agent Docs](https://docs.docker.com/ai/docker-agent/features/mcp-mode/)
- [MCP Gateway – Docker Docs](https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/)
- [MCP Toolkit – Get Started](https://docs.docker.com/ai/mcp-catalog-and-toolkit/get-started/)
- [MCP Tool – Docker Agent Docs](https://docs.docker.com/ai/docker-agent/tools/mcp/)
- [Docker MCP Catalog](https://hub.docker.com/u/mcp)
- [docker/mcp-gateway – GitHub](https://github.com/docker/mcp-gateway)
