# report_query cookbook

Everything is a whitelisted structure; no SQL. Money in minor units.

Daily net sales and orders, last 14 days, one location:
```json
{ "metrics": ["revenue_net", "orders"], "dimensions": ["date:day"],
  "filters": { "locationIds": ["<id>"] },
  "range": { "from": "2026-10-10", "to": "2026-10-23" }, "compare": "none" }
```

Busiest hours of a week, compared with the previous week:
```json
{ "metrics": ["revenue_net", "orders"], "dimensions": ["hour"],
  "range": { "from": "2026-10-12", "to": "2026-10-18" }, "compare": "previous",
  "sort": { "by": "revenue_net", "order": "desc" }, "limit": 5 }
```

Channel mix this month:
```json
{ "metrics": ["revenue_net", "orders", "avg_ticket"], "dimensions": ["channel"],
  "range": { "from": "2026-10-01", "to": "2026-10-23" } }
```

Category x week:
```json
{ "metrics": ["revenue_net"], "dimensions": ["category", "date:week"], "range": { "from": "2026-09-01", "to": "2026-10-23" } }
```
(at most two dimensions, and only one of them a time dimension)

Labour % per location (module time-clock, range up to 93 days):
```json
{ "metrics": ["labor_cost", "revenue_net", "labor_pct"], "dimensions": ["location"], "range": { "from": "2026-10-01", "to": "2026-10-23" } }
```

Notes: default range is the last 30 days; `limit` default 100, max 500; use `cursor` from `nextCursor`. Labour metrics only combine with date or location dimensions and location filters. Staff dimension and filter need `report.staff_performance`. Product/category splits null out `tips` and `refunds_amount`.
