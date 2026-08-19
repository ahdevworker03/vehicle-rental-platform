# Playwright MCP

## Purpose

Playwright MCP is a Model Context Protocol (MCP) server that provides browser automation capabilities using Playwright. It enables AI agents to interact with web pages through structured accessibility snapshots—not screenshots or pixel-based models. Each interactive element in the accessibility tree receives a unique reference (`ref`) for deterministic interaction, allowing agents to click buttons, fill forms, and navigate pages without coordinate guessing or vision models.

The server operates entirely on structured data from Playwright's accessibility tree, producing ~200-400 tokens per snapshot compared to thousands for DOM or screenshot-based approaches. This token efficiency makes it practical for agentic workflows with limited context windows.

## Problems It Solves

| Problem | How Playwright MCP Solves It |
|---------|------------------------------|
| **AI cannot interact with web pages directly** | LLMs have no native way to browse, click, or fill forms. Playwright MCP exposes 40+ browser automation tools as structured MCP calls. |
| **Screenshots are ambiguous and token-heavy** | Pixel-based methods require vision models and produce large outputs. Playwright MCP uses the accessibility tree—deterministic, structured, and LLM-friendly. |
| **Manual web testing is repetitive** | Exploratory testing, form filling, and UI verification require manual effort. Playwright MCP automates these tasks through natural language. |
| **Debugging web apps requires context switching** | Developers leave their IDE to inspect pages. Playwright MCP brings browser automation directly into MCP-compatible clients (VS Code, Cursor, Claude Desktop, etc.). |
| **Web scraping is brittle** | Screen-scraping breaks when UI changes. Playwright MCP operates on accessibility semantics, making automation more resilient. |

## Primary Capabilities

Playwright MCP provides **40+ tools** organized into capability groups:

### Core Tools (always enabled)
| Tool | Description |
|------|-------------|
| `browser_navigate` | Navigate to a URL |
| `browser_navigate_back` / `browser_navigate_forward` | History navigation |
| `browser_reload` | Reload the current page |
| `browser_snapshot` | Capture structured accessibility snapshot |
| `browser_click` | Click an element by reference |
| `browser_hover` | Hover over an element |
| `browser_drag` | Drag and drop between elements |
| `browser_type` | Type text into an element |
| `browser_fill_form` | Fill multiple form fields at once |
| `browser_select_option` | Select dropdown option |
| `browser_check` / `browser_uncheck` | Check/uncheck checkbox or radio |
| `browser_press_key` | Press a key (Enter, Tab, etc.) |
| `browser_take_screenshot` | Take a PNG/JPEG screenshot |
| `browser_tabs` | List, create, close, switch tabs |
| `browser_handle_dialog` | Accept or dismiss dialogs |
| `browser_file_upload` | Upload files |
| `browser_close` | Close the browser |
| `browser_resize` | Resize the browser window |
| `browser_wait_for` | Wait for text, element, or time |
| `browser_run_code` | Execute Playwright code |
| `browser_evaluate` | Evaluate JavaScript in page context |
| `browser_console_messages` | Get console output |
| `browser_network_requests` | List network requests |

### Optional Capability Groups
| Capability | Tools | Enable Flag |
|------------|-------|-------------|
| **Network** | `browser_route` (mock requests), `browser_route_list`, `browser_unroute`, `browser_network_state_set` | `--caps=network` |
| **Storage** | Cookie, localStorage, sessionStorage management; `browser_storage_state` (save/restore) | `--caps=storage` |
| **Testing** | `browser_verify_element_visible`, `browser_verify_text_visible`, `browser_verify_list_visible`, `browser_verify_value`, `browser_generate_locator` | `--caps=testing` |
| **Vision** | `browser_mouse_move_xy`, `browser_mouse_click_xy`, `browser_mouse_drag_xy`, `browser_mouse_down`, `browser_mouse_up`, `browser_mouse_wheel` | `--caps=vision` |
| **PDF** | `browser_pdf_save` | `--caps=pdf` |
| **Devtools** | `browser_start_tracing`, `browser_stop_tracing`, `browser_start_video`, `browser_stop_video`, `browser_video_chapter`, `browser_resume` | `--caps=devtools` |
| **Config** | `browser_get_config` | `--caps=config` |

## When to Use

Use Playwright MCP when:

1. **You need AI to automate browser interactions** – Navigate, click, type, fill forms, upload files
2. **You need structured page context** – The accessibility snapshot provides deterministic, LLM-friendly page representation
3. **You want to test UI elements without vision models** – Verify element visibility, text presence, form values
4. **You need to debug web applications** – Capture console logs, network requests, traces, and videos during automated workflows
5. **You are building exploratory automation** – Self-healing tests, long-running autonomous workflows that benefit from persistent browser context
6. **You need cross-browser testing** – Supports Chrome, Firefox, WebKit, and Edge

## When NOT to Use

Do NOT use Playwright MCP when:

1. **You need high-throughput, token-efficient browser automation** – Playwright CLI with SKILLs is more token-efficient; MCP loads large tool schemas and verbose accessibility trees into context. CLI is better suited for coding agents balancing browser automation with large codebases.
2. **You only need a one-off browser interaction** – Manual browser use or a simple script is faster and simpler.
3. **You are working in an environment without MCP client support** – Playwright MCP requires an MCP-compatible client (VS Code, Cursor, Claude Desktop, etc.).
4. **The task is a single, deterministic test script** – Traditional Playwright tests are more reliable for fixed test suites.
5. **You need to run browser automation at scale in CI/CD** – Playwright's native test runner is better suited for CI/CD pipelines.

## Permissions

Playwright MCP requires:

- **Node.js 18 or newer**
- **Browser installation** – A Chromium-compatible browser installed via `npx playwright install chromium`
- **Filesystem access** – For screenshots, PDFs, video recordings, and storage state files (saved to `outputDir`; default varies by client)
- **Network access** – To reach target web pages and serve the MCP server over HTTP when using standalone mode
- **Optional: Docker socket access** – If running in containerized environments with shared browser contexts

**By default, Playwright MCP runs the browser in headed mode so you can see what is happening**. To run headless, add the `--headless` flag.

## Authentication

Playwright MCP does not require authentication to the server itself. It supports:

| Authentication Type | Description |
|---------------------|-------------|
| **No authentication** | The server runs locally via stdio or HTTP; no credentials required |
| **Page authentication** | Use `browser_navigate` to login forms, or use `browser_set_storage_state` to restore saved sessions |
| **Persistent sessions** | Login state and cookies are preserved between sessions by default |
| **Proxy authentication** | Use `--proxy-server` with optional credentials in the URL |

## Limitations

| Limitation | Impact |
|------------|--------|
| **Token cost** | MCP loads tool schemas + accessibility snapshots (~200-400 tokens per snapshot) into context. CLI-based approaches are more token-efficient |
| **Browser dependency** | Requires a Playwright-supported browser installed on the system |
| **Accessibility tree, not DOM** | Operates on accessibility semantics; some visual interactions may require vision mode or coordinates |
| **Headed by default** | Browser opens visibly unless `--headless` is specified; may not be suitable for all environments |
| **Capability opt-in** | Advanced tools (network, storage, testing, vision, PDF, devtools) must be explicitly enabled via `--caps` |
| **Display requirement for headed mode** | Headed browser requires a display; use standalone HTTP server with `--host 0.0.0.0` in containers |

## Best Practices

1. **Use the accessibility snapshot** – The snapshot is the primary interaction mechanism. Use `browser_snapshot` to get element references (`ref`) and then interact using those references.

2. **Enable only needed capabilities** – Use `--caps=network,storage` to unlock only the tool groups you need; default core tools are sufficient for most tasks.

3. **Run headless in CI/CD** – Add `--headless` flag to avoid opening browser windows in automated environments.

4. **Use persistent sessions** – Login state and cookies are preserved by default between sessions, reducing repetitive authentication.

5. **Set appropriate timeouts** – Configure action, navigation, and expect timeouts via config file to match your application's performance.

6. **Consider Playwright CLI for coding agents** – If your primary use case is code generation with browser automation, Playwright CLI with SKILLs is more token-efficient than MCP.

7. **Use standalone HTTP server for headless/container environments** – When running on systems without a display, start the server with `--port` and `--host 0.0.0.0`.

8. **Enable tracing for debugging** – Use `--caps=devtools` to start/stop execution traces and video recordings for debugging failed automation.

## Common Mistakes

| Mistake | Why it fails | Correct approach |
|---------|--------------|------------------|
| **Not installing the browser** | Server fails with "browser not found" errors | Run `npx playwright install chromium` |
| **Using coordinates instead of refs** | Coordinates are brittle; UI changes break automation | Use `browser_snapshot` to get element `ref`s and interact with them |
| **Forgetting to enable capabilities** | Advanced tools (network, storage, testing, vision) are not available | Add `--caps=network,storage,testing` |
| **Running headed in CI/CD** | Browser window opens; may hang in headless environments | Add `--headless` flag |
| **Not handling dialogs** | Alerts, confirms, or prompts block automation | Use `browser_handle_dialog` to accept or dismiss |
| **Using MCP for all browser automation** | Token cost is higher than CLI-based approaches | Use Playwright CLI with SKILLs for high-throughput coding agent workflows |
| **Not saving session state** | Repeated logins required across sessions | Use `browser_storage_state` and `browser_set_storage_state` |

## Related Skills

- `testing` – For integrating browser automation into test workflows
- `debugging` – For capturing console logs, network requests, and traces
- `performance` – For measuring page load and interaction performance
- `security` – For testing authentication flows and security controls
- `react` – For testing React components in the browser

## Related MCPs

- **OpenAPI MCP** – For API discovery alongside browser-based API testing
- **GitHub MCP** – For repository operations in browser automation workflows
- **Docker MCP** – For running Playwright MCP in containerized environments
- **Context7 MCP** – For documentation lookup when writing Playwright test code

## Official References

- [Playwright MCP Introduction](https://playwright.dev/mcp/introduction)
- [Playwright MCP Configuration](https://playwright.dev/mcp/configuration/options)
- [Playwright MCP Capabilities](https://playwright.dev/mcp/capabilities)
- [Playwright MCP GitHub Repository](https://github.com/microsoft/playwright-mcp)
- [Playwright MCP vs Playwright CLI](https://github.com/microsoft/playwright-cli)
- [Playwright Official Documentation](https://playwright.dev)