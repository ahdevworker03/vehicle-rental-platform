# GitHub MCP

## Purpose

The GitHub MCP server is a Model Context Protocol (MCP) server provided and managed by GitHub. It enables AI assistants (including GitHub Copilot, Claude, and other MCP‑compatible clients) to interact directly with GitHub repositories, issues, pull requests, and other GitHub features.

The server bridges AI assistants with GitHub's API, exposing repository management, issue tracking, pull request workflows, and project management as structured MCP tools. The GitHub MCP server is available to all GitHub users regardless of plan type, though individual tools inherit the same access requirements as their corresponding GitHub features.

## Problems It Solves

| Problem                             | How GitHub MCP Solves It                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Context switching**               | Developers must leave their IDE or chat to check PR status, create issues, or review repository history. The MCP server brings GitHub operations directly into the AI assistant. |
| **Manual, repetitive GitHub tasks** | Creating issues, updating PRs, or managing branches are repetitive tasks that can be automated through natural language.                                                         |
| **Repository discovery**            | Finding repositories, branches, commits, or files requires navigating the GitHub UI or using the CLI. The MCP server provides structured search and retrieval.                   |
| **Workflow automation**             | Complex multi-step workflows (create issue → branch → PR → merge) can be orchestrated by an AI agent using multiple tools.                                                       |
| **Permission complexity**           | Different GitHub operations require different token scopes. The server automatically filters available tools based on token permissions.                                         |

## Primary Capabilities

The GitHub MCP server exposes **104 tools** across **16 toolsets**. Key toolsets include:

| Toolset           | Capabilities                                                                          |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Repos**         | Repository management, branches, commits, tags, file contents (read and write)        |
| **Issues**        | Issue CRUD, comments, labels, conversation locking                                    |
| **Pull Requests** | PR listing, creation, merging, reviews                                                |
| **Projects**      | Project listing, retrieval, item management (consolidated toolset, ~50% fewer tokens) |
| **Search**        | Repository and code search                                                            |
| **Users**         | User information and organization management                                          |

**Write tools** (create, update, delete operations) are only registered when `GITHUB_PERMISSION=read-write`; setting `GITHUB_PERMISSION=read-only` registers only read tools.

## When to Use

Use the GitHub MCP server when:

1. **You need to query repository information** – List branches, get file contents, view commit history, search repositories
2. **You need to manage issues** – Create, update, list, comment on, and label issues
3. **You need to manage pull requests** – List, get, create, or merge PRs; manage reviews
4. **You need to manage projects** – List projects, retrieve project details including fields and items
5. **You need to automate GitHub workflows** – Create issue → create branch → open PR → merge
6. **You are using GitHub Copilot or another MCP‑compatible client** – The server integrates natively with Copilot Chat
7. **You need to read or write repository files** – Get file contents, create or update files

## When NOT to Use

Do NOT use the GitHub MCP server when:

1. **You are working with private repositories that your token cannot access** – The server respects token permissions; operations will fail
2. **You need to perform operations requiring elevated permissions your token lacks** – The server automatically hides unavailable tools
3. **The task is better handled by the GitHub CLI or direct Git commands** – For complex local Git operations, direct commands may be more efficient
4. **You are working in an environment where MCP is not configured** – The server requires proper setup and token configuration
5. **You need to perform bulk operations at scale** – The server is designed for interactive assistant use, not batch processing
6. **You are using a free tier where a specific feature requires a paid Copilot license** – Certain tools inherit GitHub/Copilot license requirements

## Permissions

The GitHub MCP server requires:

- **GitHub Personal Access Token (PAT)** – Required for authentication
- **Network access** – To reach the GitHub API (`api.github.com`)
- **OAuth scopes** – The server automatically filters tools based on your token's scopes

| Token Type                          | Behavior                                                           |
| ----------------------------------- | ------------------------------------------------------------------ |
| **Classic PAT (ghp\_)**             | Tools filtered based on token scopes; unavailable tools are hidden |
| **Fine-grained PAT (github_pat\_)** | All tools shown; API enforces permissions at runtime               |
| **OAuth (remote server)**           | Dynamic scope challenges on‑demand                                 |

**Security considerations:**

- The server never stores your token in plaintext; tokens are stored in the system keychain
- Write tools are only registered when `GITHUB_PERMISSION=read-write`
- Tool availability is dynamically managed based on your token's actual permissions

## Authentication

The GitHub MCP server supports multiple authentication methods:

| Method                          | Description                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Personal Access Token (PAT)** | Required for all configurations. Set the `GITHUB_TOKEN` environment variable                      |
| **Classic PAT**                 | Prefix `ghp_` – tools automatically filtered by OAuth scopes                                      |
| **Fine-grained PAT**            | Prefix `github_pat_` – all tools shown; API enforces permissions                                  |
| **OAuth (remote server)**       | Per‑request OAuth tokens via `Authorization` header; falls back to `GITHUB_PERSONAL_ACCESS_TOKEN` |

**Configuration variables**:

| Variable            | Required | Default      | Description                                   |
| ------------------- | -------- | ------------ | --------------------------------------------- |
| `GITHUB_TOKEN`      | Yes      | —            | Personal access token for GitHub API calls    |
| `GITHUB_SERVER_URL` | No       | `github.com` | GitHub host; set for GitHub Enterprise Server |
| `GITHUB_PERMISSION` | No       | `read-write` | `read-only` or `read-write`                   |
| `LOG_LEVEL`         | No       | `info`       | `debug`, `info`, or `error`                   |

## Limitations

| Limitation                   | Impact                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Token scope filtering**    | Tools requiring scopes your token lacks are hidden; you may not see all available tools                 |
| **Permission inheritance**   | Tools inherit the same access requirements as corresponding GitHub features; some require paid licenses |
| **Rate limits**              | Subject to GitHub API rate limits based on your token type (higher for authenticated requests)          |
| **Write operation approval** | Write tools are only available when `GITHUB_PERMISSION=read-write`                                      |
| **Enterprise configuration** | For GitHub Enterprise, you must set `GITHUB_SERVER_URL`                                                 |
| **Organization policy**      | MCP usage may be disabled by organization or enterprise policy                                          |

## Best Practices

1. **Use a fine-grained PAT with minimal required scopes** – This reduces the attack surface and ensures least privilege
2. **Set `GITHUB_PERMISSION=read-only` unless write operations are needed** – This prevents accidental modifications
3. **Verify your token's scopes before using the server** – The server automatically filters tools, but understanding your permissions helps set expectations
4. **Use environment variables for token storage** – Never hardcode tokens in configuration files
5. **For GitHub Enterprise, explicitly set `GITHUB_SERVER_URL`** – The server defaults to `github.com`
6. **Enable Insiders mode for experimental features** – Use the `/insiders` URL or configuration header to access preview functionality
7. **Use the consolidated Projects toolset** – It reduces token usage by ~50% compared to the previous approach
8. **Test with read‑only mode first** – Set `GITHUB_PERMISSION=read-only` to verify the server works before enabling write operations

## Common Mistakes

| Mistake                                                                                | Why it fails                                                               | Correct approach                                                       |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Not setting `GITHUB_TOKEN`                                                             | Server cannot authenticate; all operations fail                            | Always set `GITHUB_TOKEN` environment variable                         |
| Using a token with insufficient scopes                                                 | Tools are hidden or operations fail with permission errors                 | Use a token with the required scopes for your operations               |
| Forgetting to set `GITHUB_PERMISSION=read-write` for write operations                  | Write tools are not registered                                             | Set `GITHUB_PERMISSION=read-write` if you need to create/update/delete |
| Using the server with a GitHub Enterprise instance without setting `GITHUB_SERVER_URL` | Server tries to reach `api.github.com` instead of your enterprise instance | Set `GITHUB_SERVER_URL` to your enterprise host                        |
| Assuming all tools are available                                                       | Some tools require specific token scopes or Copilot licenses               | Check your token's scopes and verify tool availability                 |
| Not understanding write vs read permissions                                            | Attempting write operations when `GITHUB_PERMISSION=read-only`             | Check your configuration before using write tools                      |
| Hardcoding the token in configuration files                                            | Security risk; token exposed                                               | Use environment variables or system keychain                           |

## Related Skills

- `git` – For Git workflows that complement GitHub operations
- `api-design` – For understanding GitHub's REST API patterns
- `security` – For token management and permission best practices
- `deployment` – For integrating GitHub operations into deployment pipelines
- `code-review` – For automating PR review workflows
- `testing` – For CI/CD integration with GitHub

## Related MCPs

- **Context7 MCP** – For documentation lookup alongside GitHub repository exploration
- **Playwright MCP** – For browser automation that may interact with GitHub's web UI
- **Docker MCP** – For container management in GitHub Actions or deployment workflows
- **Vercel MCP** – For deployment management connected to GitHub repositories

## Official References

- [GitHub MCP Server Repository](https://github.com/github/github-mcp-server)
- [About the Model Context Protocol (MCP) – GitHub Docs](https://docs.github.com/en/copilot/concepts/context/mcp)
- [Using the Model Context Protocol (MCP) – GitHub Docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp)
- [Set up the GitHub MCP Server – GitHub Docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/set-up-the-github-mcp-server)
- [Configure toolsets for the GitHub MCP Server – GitHub Docs](https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/configure-toolsets)
- [GitHub MCP Server: New Projects tools, OAuth scope filtering, and new features – GitHub Changelog](https://github.blog/changelog/2026-01-28-github-mcp-server-new-projects-tools-oauth-scope-filtering-and-new-features/)
- [github-mcp-server-js on npm](https://www.npmjs.com/package/github-mcp-server-js)
