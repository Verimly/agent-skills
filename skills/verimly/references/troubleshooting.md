# Troubleshooting

| Symptom / code | Meaning | What to do |
|---|---|---|
| `429 AI_RATE_LIMITED` | More than the per-minute call rate of this token (60/min, Business 120/min). | Wait a minute; batch with `report_query` instead of many small calls; use `limit` and `cursor`. |
| `429 AI_QUOTA_REACHED` | The organization used its monthly MCP call quota (3,000 / 10,000 / 30,000 per active location on starter / pro / business). Help tools (`search_help`, `explain_error`, `explain_how`) and `whoami`, `get_business_overview`, `get_plan_and_modules`, `get_onboarding_status` still work. | Tell the user; quota resets next month; upgrading the plan raises it (`get_plan_and_modules` shows usage). |
| `AGENT_READ_ONLY` | The connection is read-only (read-only URL, or the read-only switch on the key/consent). | Say that writes are off; the user can reconnect with write scopes (consent screen) or create an agent key with the scope; or do it in the panel. |
| `AGENT_TOOL_UNAVAILABLE` | The tool is not offered on this connection: scope missing, tool not for MCP (`update_opening_hours`, `toggle_module` are panel-assistant only), or not in the plan. | Check `whoami` scopes. Needed scope: see `tools.md`. Offer the panel link instead. |
| `PERMISSION_REQUIRED` / 403 | The user's role lacks the permission (for example `report.staff_performance`, `timesheet.cost_view`, `menu.price_manage`). | Do not retry. Say what is missing; ask an owner or manager. |
| `MODULE_DISABLED` / `MODULE_NOT_IN_PLAN` | Module off, or not in the plan. | `get_plan_and_modules`; the user enables it in Features or upgrades. |
| `LOCATION_ACCESS_DENIED`, `LOCATION_NOT_FOUND` | The connection is limited to other locations, or wrong id. | `whoami` lists the allowed locations. |
| `LOCATION_REQUIRED` | The tool needs a `locationId`. | Ask which location, or use the only one. |
| `SUBSCRIPTION_INACTIVE` / `SUBSCRIPTION_REQUIRED` | The subscription is not active. | The owner fixes it in Settings > Billing. |
| `403 MCP_DISABLED` | The owner switched agent access off for this business. | Tell the user; an owner turns it on in Settings > Agents & MCP, then reconnect. |
| `AGENT_PROPOSAL_REJECTED` / `AGENT_PROPOSAL_EXPIRED` | The user rejected the proposal, or it expired (60 min price changes, 120 min menu import). | Rejected: stop. Expired: call the tool again for a new `approval_url`. |
| Sign-in fails or no tools appear | The owner turned MCP off for the business, only approved clients are allowed, or the user did not finish OAuth. | The owner checks Settings > Agents & MCP. |
| `VALIDATION_FAILED` | Wrong shape (money must be integer minor units, dates `YYYY-MM-DD`, ISO times with offset). | Fix the input; unknown keys are dropped. |
| Preview `errors` | Row problems (for import: unknown VAT rate, missing price). | Fix and call again; rows with errors are left out of an import. |
| Empty report | No sales in range, wrong location, or the module is off. | Check range, `locationId`, and the timezone. |

For error codes not listed, call `explain_error` with the code: it returns the explanation and help article in the user's language.
