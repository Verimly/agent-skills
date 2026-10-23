# import_menu: schema and extraction rules

```json
{
  "mode": "create_only",
  "modifierGroups": [
    { "name": "Milk", "minSelect": 0, "maxSelect": 1,
      "options": [ { "name": "Oat", "priceDelta": 50 }, { "name": "Soy", "priceDelta": 50 } ] }
  ],
  "categories": [
    { "name": "Coffee", "description": "Roasted in house",
      "products": [
        { "name": "Flat white", "price": 380, "vatRate": 9,
          "variants": [ { "name": "Small", "priceDelta": 0 }, { "name": "Large", "priceDelta": 60 } ],
          "modifierGroups": ["Milk"] },
        { "name": "Espresso", "price": 280, "description": "Double shot" }
      ] }
  ]
}
```

## Fields
- `categories[].name` (required), `description?`; products belong to exactly one category. Up to 300 products in total.
- `products[]`: `name`, `price` (integer minor units, required), `description?`, `sku?`, `barcode?`, `vatRate?` (percent hint, e.g. 9 or 21), `variants?[{ name, priceDelta }]`, `modifierGroups?` (names of groups defined in `modifierGroups`).
- `modifierGroups[]`: `name`, `minSelect`, `maxSelect`, `options[{ name, priceDelta }]`. 0/1 = optional single choice; 1/1 = required single choice; 0/n = any extras up to n.
- `mode`: `create_only` (default; existing names are skipped) or `update_existing` (updates price, description, category and VAT of products with the same name; the preview warns).

## Extraction rules
1. One row per sellable item. A size list ("S 3.20 / L 3.80") becomes one product with variants: base price = the smallest size, `priceDelta` = difference of the others (0 for the first, 60 for +0.60).
2. Combos and daily specials: import as normal products named as on the menu, flag them to the user.
3. Menu text with ranges, "market price" or "ask staff": no price, so no import for that row; list under "needs price".
4. Allergen and dietary labels: put short text in `description` only when it is on the menu.
5. Language: keep the names exactly as written; do not translate unless asked.
6. Currency: minor units of the business currency from `get_business_overview`. If the menu shows another currency symbol, ask.
7. Duplicates: the same product name in two categories is ambiguous; ask or rename ("Cola (bar)").
8. Names match case-insensitively; re-importing a corrected file only creates what is new.

## Checking the result
`import_menu` preview: `changes[]` with `op` (create/update/skip), `kind` (modifier_group, category, product), `errors` per row, `totals {create, update, skip, errors}`. Rows with errors are left out of the apply and listed in `failed` afterwards. Typical errors: unknown VAT rate, product without category, modifier group name that does not exist.
