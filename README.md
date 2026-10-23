# Verimly agent skills

Skills and an MCP configuration that teach AI agents (Claude, ChatGPT, Claude Code, Codex, Cursor, VS Code ...) to work with a Verimly business safely: read first, preview before writes, never refunds or payments.

| Skill | For |
|---|---|
| `verimly` | Concepts, connecting, tool map, safety rules (start here) |
| `verimly-setup` | New business: audit, menu import from PDF/photo/CSV, tax rates, checklist |
| `verimly-menu` | Prices, 86 (sold out), margins, menu engineering |
| `verimly-reports` | End of day, weekly report, labour %, KPIs, anomalies |
| `verimly-team` | Shifts, hours, labour cost, invites |

MCP server: `https://mcp.verimly.com/mcp` (read-only: `https://mcp.verimly.com/mcp/readonly`). Sign in with your Verimly account. Scopes: `read`, `menu:write`, `reservations:write`, `staff:write`, `orders:write`. Agent keys (`vk_live_...`) are created in Verimly > Settings > Agents & MCP.

## Install

Skills only (any client that supports Agent Skills):

```bash
npx skills add Verimly/agent-skills          # from the public GitHub repo (https://github.com/Verimly/agent-skills)
```

Claude Code plugin (skills plus the MCP server in one install):

```
/plugin marketplace add Verimly/agent-skills
/plugin install verimly@verimly
```

MCP server only:

```bash
claude mcp add --transport http verimly https://mcp.verimly.com/mcp
codex mcp add verimly --url https://mcp.verimly.com/mcp
```

Manual: copy the folders in `skills/` into your agent's skills directory (for example `~/.claude/skills/`, `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`), then connect the MCP server (see `skills/verimly/references/connecting.md`).

Entry point for any agent: [`GET-STARTED.md`](GET-STARTED.md). The admin's "Get started with your agent" prompt points the agent at its raw GitHub URL; the agent connects itself where it can (shell access) or walks the user through it (chat apps), then starts the setup. Agent-readable product docs: `https://verimly.com/llms.txt`.

## Layout

```
.claude-plugin/plugin.json        Claude Code plugin manifest (name, version, metadata)
.claude-plugin/marketplace.json   marketplace listing this plugin (source "./")
.mcp.json                         MCP server bundled with the plugin
skills/<name>/SKILL.md            portable frontmatter only: name, description, license, compatibility, metadata, allowed-tools
skills/<name>/references/*.md     details, loaded on demand
GET-STARTED.md                    entry guide the copied prompt points to: connect, check, start the setup
scripts/build.mjs                 validate + emit dist/ (an index of the skills)
```

## Build and validate

```bash
pnpm --filter @verimly/agent-skills build      # validates, writes dist/index.json and dist/<skill>/...
pnpm --filter @verimly/agent-skills validate   # validation only
```

Rules enforced: only the six portable frontmatter fields; `name` equals the folder; description 40-1024 characters and says "Use when"; license present; `SKILL.md` body under 200 lines; every `references/*.md` mentioned exists; plugin version equals package version; `.mcp.json` points at the MCP endpoint.

`dist/index.json` has `{ "skills": [{ "name", "description", "files": [...] }] }` (the `.well-known/skills` layout `npx skills add <url>` reads), kept in case the skills are also served from a website later. Distribution is the public GitHub repository: `npx skills add Verimly/agent-skills` reads `skills/` from it directly.

## Editing

Keep the tool names and inputs accurate to `docs/ai/tool-catalog.md` in the monorepo; change `version` in `package.json` and `.claude-plugin/plugin.json` together. The public GitHub repository https://github.com/Verimly/agent-skills is a mirror of this folder.
