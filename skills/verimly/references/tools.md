# Tool catalog (MCP)

Scopes: read tools need `read`; write tools need the scope shown. Risk: `read`, `write` (applied at once with the scope: `status: applied`), `approval` (user approves via `approval_url`). All results have `adminUrl` deep links. Lists take `limit` (default 25, max 100) and `cursor`; results include `nextCursor` (null on the last page).

## Account
| Tool | Purpose / inputs |
|---|---|
| `whoami` | Business, user, locations, scopes, `readOnly`, permissions. No input. Always first. |
| `get_business_overview` | Name, country, currency, timezone, language, business type, plan. |
| `list_locations` | `includeInactive?`. Ids for `locationId`. |
| `get_plan_and_modules` | Plan, limits, AI usage, every module (`enabled`, `inPlan`, `minPlan`). |
| `get_onboarding_status` | Setup steps done/missing, first-sale steps, `nextStep`, links. |
| `get_setup_checklist` | Steps to the first sale: menu, POS PIN, paired till, register, first sale, card payments. |
| `audit_log_search` | `action?`, `entityType?`, `staffId?`, `locationId?`, `search?`, `from?`, `to?`; entries with actor kind (agent/assistant/panel). Needs `audit.view`. |

## Help
| Tool | Purpose |
|---|---|
| `search_help` | `{ query }`; help centre search in the user's language; results with links. Use before answering how-to questions. |
| `explain_error` | `{ code }`; what an error code means and the fix. |
| `explain_how` | `{ task }`; guidance only: steps, panel path, permission needed. Use for refunds, voids, payouts, deletions, role changes (never done by agents). |

## Reports (read)
| Tool | Inputs |
|---|---|
| `sales_summary` | `from?`, `to?` (YYYY-MM-DD), `locationId?`, `compare?` (previous/year/none), `granularity?`, `type?` (DINE_IN/TAKEAWAY/DELIVERY). Returns major units. |
| `top_products` | period + `sortBy?` (netSales/quantity/margin), `order?` (top/bottom). Major units. |
| `sales_breakdown` | `from`, `to`, `locationId?`, `by` (day, week, month, hour, category, product, staff, location, channel), `compare?`, `limit`, `cursor`. Minor units. |
| `product_margins` | period, `sortBy` (marginPercent, margin, netSales, quantity), `order`, `categoryId?`; cost/margin only with `inventory.cost_view` (`costsVisible`). Includes `menuClass`. |
| `report_query` | `metrics[1-10]`: revenue_gross, revenue_net, orders, items_sold, avg_ticket, discounts, refunds_amount, tips, labor_cost, labor_pct. `dimensions[<=2]`: date:day, date:week, date:month, hour, location, category, product, staff, channel (one time dimension). `filters`: locationIds, categoryIds, productIds, staffIds, channel (pos, qr, online, reservation, tab). `range {from,to}` (default last 30 days, max 400; labour 93). `compare`: previous/year/none. `sort {by, order}`. `limit` (default 100, max 500), `cursor`. Revenue is VAT-exclusive; line-level splits (category/product) make `orders` = orders containing those lines and `tips`/`refunds_amount` null; splits by staff/channel/product are before refunds (`refundsIncluded: false`); labour metrics only split by date or location. |

## Orders (read; permission `order.view_all`)
`list_orders`: `locationId?`, `status?`, `source?`, `from?`, `to?`, `staffId?`, `customerId?`, `orderNumber?`, page. `get_order`: `orderId`. Payments and refunds appear read-only.

## Menu
| Tool | Risk / scope | Inputs |
|---|---|---|
| `get_menu` | read | `locationId?`, `includeInactive?`; categories with products, modifier groups, counts, `truncated` over 400 products. |
| `search_products` | read | `query?`, `categoryId?`, `locationId?`, `includeInactive?`, page. |
| `inventory_low_stock` | read (module inventory) | `locationId?`, page. |
| `create_product` | write, `menu:write` | `name`, `price` (minor units), `categoryId?`, `description?`, `taxRateId?`, `sku?`, `barcode?`, `color?`, `variants?[{name, priceDelta}]`, `modifierGroupIds?`. |
| `update_product` | write (approval when `price` is given), `menu:write` | `productId` + any of name, price, description, categoryId (null clears), taxRateId, sku, barcode, color, isActive. |
| `set_product_availability` | write, `menu:write` | `productIds[1-100]`, `locationId`, `available`. This is "86". |
| `create_category` | write, `menu:write` | `name`, `parentId?`, `description?`, `color?`. |
| `bulk_update_prices` | approval (60 min), `menu:write` | `prices[{productId, price}]` or `adjust {percent -50..100, roundTo?, categoryId?, productIds?}`. A percentage is applied to prices current at approval. |
| `import_menu` | approval (120 min), `menu:write` | `categories[{name, description?, products[{name, price, description?, sku?, barcode?, vatRate?, variants?, modifierGroups?}]}]`, `modifierGroups?[{name, minSelect, maxSelect, options[{name, priceDelta}]}]`, `mode?` (`create_only` default, `update_existing`); max 300 products. `vatRate` is a percent hint that must match an existing tax rate. |

## Team
| Tool | Risk / scope | Inputs |
|---|---|---|
| `list_staff` | read | `locationId?`, `query?`, `includeInactive?`; name, role, locations, no contact data. |
| `timeclock_summary` | read (module time-clock) | `locationId`, `from`, `to`; planned/worked hours and cost, sales, `laborPercent`, per day and per person. Cost needs `timesheet.cost_view`. |
| `create_shift` | write, `staff:write` | `locationId`, `staffId`, `startsAt`, `endsAt` (ISO with offset), `breakMinutes?`, `note?`. |
| `invite_staff` | approval, `staff:write` | `email`, and `roleId` or `staffId`. Sends an email once the user approved. |

## Guests
| Tool | Risk / scope | Inputs |
|---|---|---|
| `list_reservations` | read (module reservations) | `locationId` (required), `date?`, `status[]?`, `query?`, page. |
| `search_customers` | read (module loyalty) | `query?`, `tag?`, page; contact data masked. |
| `create_reservation` | write, `reservations:write` | `locationId`, `guestName`, `partySize`, `startsAt?`, `durationMinutes?`, `phone?`, `email?`, `notes?`, `tableIds?`, `status?` (booked, confirmed, waitlist), `customerId?`. |
| `update_reservation` | write, `reservations:write` | `reservationId` + fields above, `status?` (booked, confirmed, completed). |

## Panel assistant only (not over MCP)
`update_opening_hours`, `toggle_module` and the browser tools (navigate, highlight, prefill). Over MCP, send the user to the panel link.

## Not in the catalog by design
Refunds, voids, payments, payouts, payment settings, discounts, deletions, role and permission changes.
