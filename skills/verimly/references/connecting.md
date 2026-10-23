# Connecting an agent to Verimly

MCP endpoint: `https://mcp.verimly.com/mcp` (Streamable HTTP).
Read-only endpoint: `https://mcp.verimly.com/mcp/readonly` (same tools, writes refused). Use it when the user wants a safe start.

Sign-in is OAuth with the user's Verimly account. The consent screen lets the user pick the organization, the locations and the scopes, and read-only is the default. Only the owner can switch MCP off for the business.

## Scopes

| Scope | Allows |
|---|---|
| `read` | all read tools |
| `menu:write` | create/update products, categories, availability, price changes, menu import |
| `reservations:write` | create and update reservations |
| `staff:write` | invite staff, create shifts |
| `orders:write` | order notes and status (never refunds, voids or payments) |

There is no scope for money movement.

## Clients

If you can run shell commands, run the command or edit the config file for your client yourself; the user only has to sign in. If you are a chat app, walk the user through the steps. The step-by-step entry guide is `GET-STARTED.md` at the root of the skills repository.

**Claude (claude.ai, Desktop, mobile)**: Settings > Connectors > Add custom connector > name `Verimly`, URL `https://mcp.verimly.com/mcp` > Connect > sign in with Verimly.

**ChatGPT**: Settings > Apps & Connectors > Advanced > turn on Developer mode > Create > URL `https://mcp.verimly.com/mcp`, authentication OAuth > sign in with Verimly. Developer mode may require a paid ChatGPT plan.

**Claude Code**:
```
claude mcp add --transport http verimly https://mcp.verimly.com/mcp
```
then run `/mcp` and sign in. Skills: `npx skills add Verimly/agent-skills`, or install the plugin (`/plugin marketplace add Verimly/agent-skills`, `/plugin install verimly@verimly`), which bundles the MCP server and the skills.

**Codex**:
```
codex mcp add verimly --url https://mcp.verimly.com/mcp
```
then `codex mcp login verimly`.

**Cursor**: Settings > MCP > Add new MCP server, or `.cursor/mcp.json`:
```json
{ "mcpServers": { "verimly": { "url": "https://mcp.verimly.com/mcp" } } }
```

**VS Code (Copilot)**: command palette > `MCP: Add Server` > HTTP > the URL, or `.vscode/mcp.json`:
```json
{ "servers": { "verimly": { "type": "http", "url": "https://mcp.verimly.com/mcp" } } }
```

**Other clients**: any client that supports remote MCP over Streamable HTTP with OAuth works. `npx add-mcp https://mcp.verimly.com/mcp` configures installed clients.

## Agent keys (headless use)
For automation or CI that cannot do an interactive OAuth sign-in, an owner/manager creates an agent key in Verimly > Settings > Agents & MCP. Keys start with `vk_live_`, are bound to the member who created them, carry chosen scopes and locations, and are shown once. Send as `Authorization: Bearer vk_live_...`. Treat as a password: never paste into chats, never commit.

## Verify the connection
Call `whoami`. It shows the business, locations, scopes and `readOnly`. If a client shows no Verimly tools, the user has not finished sign-in, or the owner switched MCP off for the business.
