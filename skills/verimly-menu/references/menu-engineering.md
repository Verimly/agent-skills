# Menu engineering recipe

Inputs: `product_margins` for a representative period (4 to 8 weeks, not a holiday), optionally per location and per category.

## Classes (`menuClass`)
Each product is placed by popularity (quantity) and profitability (margin), each relative to the other products in the same result (filter by `categoryId` to compare within a category):

| Class | Popularity | Margin | Typical action |
|---|---|---|---|
| Star | high | high | Protect: keep prominent, do not discount, check stock never runs out |
| Plowhorse | high | low | Raise price a little, trim portion or cost, pair with a high-margin side |
| Puzzle | low | high | Promote: better position, staff suggestion, rename or describe better |
| Dog | low | low | Remove or rework; check whether it is a traffic item before cutting |

## Steps
1. Pull `product_margins` (sort by `margin`, then by `quantity`). Filter by `categoryId` and compare drinks with drinks.
2. List the top 5 plowhorses and puzzles with numbers (quantity, net sales, margin percent).
3. For each, give one concrete suggestion and the expected effect, e.g. +0.20 on a plowhorse selling 300 a month is about +60 revenue per month at no volume loss.
4. Only propose changes; apply through `update_product` or `bulk_update_prices` after the user agrees.
5. Re-check after 4 weeks with the same range length.

## Cautions
- Margins need costs: recipes and ingredient costs must exist. Products without cost show null margin; do not treat null as zero.
- Revenue is VAT-exclusive, menu prices VAT-inclusive: convert before comparing a price change with revenue.
- Small samples (under about 20 sold) are noise.
- Do not recommend dropping an item based on one slow week; check seasonality with `report_query` (date:week).
