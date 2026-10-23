---
name: verimly-setup
description: Use when the user is setting up a new Verimly business or location, wants to import their menu from a PDF, photo, screenshot, spreadsheet or CSV into Verimly, or asks what is still missing before the first sale (menu, tax rates, staff and roles, opening hours, devices, printers, card payments).
license: MIT
compatibility: Needs the Verimly MCP server connected with the menu:write scope for imports; read-only connections can still audit setup. Needs a client that can read the user's menu file or photo.
metadata:
  author: Verimly
  version: "0.1.0"
allowed-tools: mcp__verimly__whoami mcp__verimly__get_business_overview mcp__verimly__get_onboarding_status mcp__verimly__get_setup_checklist mcp__verimly__get_menu mcp__verimly__list_staff mcp__verimly__search_help
---

# Verimly setup

Get a new business to its first sale. Read the `verimly` skill first for concepts and safety rules; they apply here (read first, preview, explicit yes, no money actions).

## 1. Audit

1. `whoami`, `get_business_overview` (country, currency, language), `list_locations`.
2. `get_onboarding_status` and `get_setup_checklist`: what is done and the `nextStep`. Report it as a short list with the `adminUrl` of each missing step.
3. `get_menu`: does a menu exist already? If yes, plan an update, not a duplicate import.

## 2. Menu import (the strongest workflow)

Turn the user's menu (PDF, photo, screenshot, spreadsheet, CSV, a pasted list) into structured JSON and load it with `import_menu`.

1. Read the file. If it is a photo or scan, transcribe carefully; mark anything unreadable instead of guessing.
2. Extract into the schema in `references/menu-import.md`: categories, products, prices, descriptions, variants (sizes), modifier groups (extras, choices), VAT hints.
3. Prices: integer minor units of the business currency (EUR 3.50 -> 350). Prices on menus are what the guest pays (VAT-inclusive). Never invent a missing price: put the product in a "needs price" list for the user.
4. VAT: propose rates for the business country (see `references/tax-and-defaults.md`) and check them against the tax rates that exist. `vatRate` must match an existing tax rate or the row errors; do not send a hint you have not checked. Tell the user to add a missing rate in Settings > Tax rates, or leave `vatRate` out for the default.
5. Show the user a table first (category, product, price, variants, VAT) and the open questions. Fix what they correct.
6. Call `import_menu` with `mode: "create_only"` (default). It returns a preview with `totals` and per-row `errors`, and an `approval_url`. Show the preview, give the user the link, wait for approval.
7. Verify with `get_menu`, report counts and any `failed` rows, link the menu page. Re-running the same import is safe (existing names are skipped).

Limits: at most 300 products per call; split bigger menus by category and import in rounds.

## 3. The rest of the checklist

Most remaining steps happen in the panel (devices, printers, card payments, opening hours). Do what tools allow and guide the rest:
- Staff: `list_staff`; `invite_staff` (needs `staff:write`, sends an email; confirm the address and role first).
- Opening hours, devices, printers, card reader, floor plan, tax rates: use `explain_how` or `search_help` and give the panel link. The full checklist is in `references/setup-checklist.md`.

## 4. Finish

Summarize: what is imported, what is missing (prices, tax rates, devices), and the three next actions with links. Offer `verimly-menu` for fine-tuning and `verimly-team` for shifts.
