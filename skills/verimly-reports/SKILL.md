---
name: verimly-reports
description: Use when the user asks about sales, takings, revenue, average ticket, labour cost percentage, best sellers, busiest hours or how a location is doing in Verimly - end-of-day, weekly or monthly reports, comparisons with last week or last year, and anomaly checks.
license: MIT
compatibility: Needs the Verimly MCP server with the read scope. Staff breakdowns need report.staff_performance; labour metrics need the time-clock module plus timesheet.view and timesheet.cost_view; margins need inventory.cost_view.
metadata:
  author: Verimly
  version: "0.1.0"
allowed-tools: mcp__verimly__whoami mcp__verimly__list_locations mcp__verimly__sales_summary mcp__verimly__top_products mcp__verimly__sales_breakdown mcp__verimly__product_margins mcp__verimly__report_query mcp__verimly__timeclock_summary mcp__verimly__list_orders
---

# Verimly reports

Reports are read-only, so nothing here needs confirmation. Follow the `verimly` skill for concepts and what you can never do (refunds, voids, payments).

## Rules for correct numbers
1. Resolve the location first (`list_locations`); say which location(s) and which dates every figure covers. Dates are business days `YYYY-MM-DD` in the location's timezone; "yesterday" and "this week" are your job to translate. Weeks start on Monday unless the user says otherwise.
2. Revenue in reports is net of VAT. Say so when comparing with a till receipt or the bank.
3. Money is minor units (350 = 3.50) in `report_query`, `sales_breakdown`, `product_margins`; `sales_summary` and `top_products` return major units. Convert before display and use the business currency.
4. Use the same length period for comparisons (`compare: "previous"` or `"year"`).
5. An empty result is a result: say no sales were recorded, then check range, location and module before suspecting a bug.
6. Cite the numbers and the `adminUrl` to the matching report page. Do not extrapolate beyond the data.

## Recipes

### End of day
Goal: one short summary of today (or a given day) per location.
1. `sales_summary { from: day, to: day, locationId, compare: "previous" }`; compare means the previous equal period (yesterday).
2. `report_query` with `metrics: [revenue_net, orders, avg_ticket, tips, discounts, refunds_amount]`, `dimensions: ["hour"]`, one day: busiest hour.
3. `top_products` (top 5 by quantity) and, if relevant, the bottom 3.
4. Add labour if the module is on: `report_query` `metrics: [labor_cost, labor_pct]` by `location`, or `timeclock_summary`.
5. Write: revenue and change, orders, average ticket, busiest hour, top items, one anomaly or one thing to look at. Mention refunds and discounts as facts, never act on them.

### Weekly report
1. Range = last full week (Mon-Sun); `compare: "previous"` and again with `"year"` if there is data.
2. `report_query` `dimensions: ["date:day"]` for the trend; `["channel"]` for the channel mix; `["category"]` for the category mix; `["hour"]` for the peaks.
3. `product_margins` (4 weeks) for the star/plowhorse list if costs are visible.
4. Labour % for the week. Compare against the target in `timeclock_summary` (`targetPercent`).
5. Deliver: headline (net sales, change %), 3 insights, 1 risk, 1 action.

### Month and multi-location
`report_query` with `dimensions: ["location"]` or `["date:week"]`, `range` of the month, `compare: "previous"`. Max range 400 days (labour: 93). Use `limit` and `cursor` for long tables.

### Labour percentage
`labor_pct` = labour cost / net sales x 100. Needs the time-clock module with pay rates, and `timesheet.cost_view`; per location, split only by date or location. Typical hospitality targets are about 25-35 percent; use the business's own `targetPercent`. If cost is null, say the permission or pay rates are missing. Never evaluate or rank individual employees' performance from this; staff-level analysis is limited to sales figures the user may see.

### Anomaly check
Compare the day with the same weekday over the last 4 to 8 weeks (`report_query` `date:day`, `filters`). Flag a deviation beyond roughly 25 percent in net sales, orders, average ticket or refunds, then look for a cause (hour, channel, product, location). State it as an observation, not a diagnosis.

KPI definitions and formulas: `references/kpis.md`. Query cookbook: `references/queries.md`.
