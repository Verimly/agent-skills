---
name: verimly-menu
description: Use when the user wants to change or analyse their Verimly menu - update prices (single or in bulk, by percent or per product), mark items sold out or available again (86), add products or categories, check margins and best or worst sellers, or do menu engineering and clean-up.
license: MIT
compatibility: Needs the Verimly MCP server; menu changes need the menu:write scope and the user's menu.manage and menu.price_manage permissions. Margins need the inventory.cost_view permission.
metadata:
  author: Verimly
  version: "0.1.0"
allowed-tools: mcp__verimly__get_menu mcp__verimly__search_products mcp__verimly__top_products mcp__verimly__product_margins mcp__verimly__inventory_low_stock mcp__verimly__list_locations
---

# Verimly menu

Menu maintenance and analysis. Safety rules of the `verimly` skill apply: read first, explicit yes before every write, `approval_url` for bulk changes.

## Look before you change
- `get_menu` (compact, whole menu) or `search_products` (`query`, `categoryId`, `locationId`). Prices are minor units; `locationPrice` and `availableHere` are per location.
- Resolve names to ids yourself; never guess an id. If a name matches several products, ask.

## 86 management (sold out / available again)
`set_product_availability { productIds[1-100], locationId, available }`. It is per location, immediate in effect once confirmed, and reversible with `available: true`.
- "We are out of salmon": `search_products` for the item and any product that uses it (dishes, specials), confirm the list, set `available: false` for that location.
- End of the day or restock: ask what is back and set `available: true`.
- Low stock hints: `inventory_low_stock` (inventory module) lists items at or below their low level; suggest 86-ing dishes that depend on them.
- Always say which location. `locationId` is required; use `list_locations`.

## Price changes
- One or a few products: `update_product { productId, price }`. A price change needs approval: it returns an `approval_url`; give it to the user and call again with `{ proposal_id }` after they approved.
- Many products: `bulk_update_prices`, an approval tool. Either exact `prices[{ productId, price }]` (idempotent) or `adjust { percent, roundTo?, categoryId?, productIds? }` (a percentage is applied to the prices at the moment of approval; the preview says so). Show before and after per product, the average change and any product that would end below cost when margins are visible. Give the `approval_url`; do not claim it is done until the user approved and `get_menu` shows the new prices.
- Prices are VAT-inclusive. "Raise by 5 percent, round to 10 cents" -> `adjust { percent: 5, roundTo: 10 }` (check `roundTo` units in the preview).
- Price changes need `menu.price_manage`; without it say so and stop.

## New items
`create_category`, then `create_product` (`name`, `price`, `categoryId`, optional `variants`, `modifierGroupIds`, `taxRateId`). Check `search_products` first to avoid duplicates. For many items use `import_menu` (see `verimly-setup`).

## Analysis
- `top_products` (`sortBy` netSales, quantity or margin; `order` top or bottom) and `product_margins` (margin, margin percent, `menuClass`: star, plowhorse, puzzle, dog).
- Menu engineering recipe and thresholds: `references/menu-engineering.md`.
- If `costsVisible` is false the user lacks cost permission or recipes/costs are missing: do not infer margins; say how to add costs (inventory and recipes) via `search_help`.

## Not possible by agent
Deleting products or categories, discounts and promotions, tax rate edits, modifier group edits: guide with `explain_how` and the `adminUrl`.
