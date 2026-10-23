# Tax rates and defaults by country

Menu prices in Verimly include VAT; each product has a tax rate. Rates differ for food, drinks and takeaway, and change over time: treat this table as a starting point to confirm with the user or their accountant, never as tax advice.

| Country | Rates seen in hospitality (percent) |
|---|---|
| Netherlands | 9 and 21 (food and drinks, alcohol) |
| Germany | 7 and 19 (food and drinks; rules for dine-in food have changed recently) |
| France | 5.5, 10 and 20 (takeaway food, on-site food, alcohol) |
| Spain | 10 and 21 |
| Italy | 10 and 22 |

Which rate applies to which product depends on the product, on-site versus takeaway and current law. Always ask the user or their accountant; do not assume.

Procedure:
1. Read the business country from `get_business_overview`.
2. Ask the user which rates they use and which products are alcohol or takeaway.
3. Only use `vatRate` values that exist as tax rates in the business (the import preview errors otherwise). Missing rates are added by the user in Settings > Tax rates.
4. If unsure, leave `vatRate` out: the product gets the default rate and the user can change it.

Other defaults to confirm with the user: currency and timezone (from the overview), receipt language, opening hours per location, table names (floor plan), kitchen/bar stations.
