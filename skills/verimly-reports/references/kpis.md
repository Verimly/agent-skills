# KPI definitions (as Verimly computes them)

| KPI | Definition | Notes |
|---|---|---|
| Net sales (`revenue_net`) | Sales after comps, discounts and refunds-as-booked, excluding VAT | The dashboard headline |
| Gross sales (`revenue_gross`) | Menu-price sales before comps and discounts, excluding VAT | |
| Orders (`orders`) | Closed orders in range | With product/category dimension or filter: distinct orders that contain those lines |
| Items sold (`items_sold`) | Quantity of lines sold | |
| Average ticket (`avg_ticket`) | Net sales / orders | Per order, not per guest |
| Discounts (`discounts`) | Value of discounts | Excludes comps, like the dashboard |
| Refunds (`refunds_amount`) | Refunded value, booked by day, hour and location | Split by staff, channel, product: revenue is before refunds (`refundsIncluded: false`) |
| Tips (`tips`) | Tips collected | null for line-level splits |
| Labour cost (`labor_cost`) | Worked hours x pay rates | Needs time clock, pay rates and cost permission |
| Labour % (`labor_pct`) | Labour cost / net sales x 100 | By date or location only |
| Margin / margin % | Net sales - cost; margin / net sales | Needs recipes and costs; null without them |
| Menu class | Star, plowhorse, puzzle, dog | Popularity x profitability within the result |
| Covers | Guests across reservations of a day (`list_reservations`) | Only bookings, not walk-ins |

## Comparisons
- `compare: previous` = the equal-length period right before; `year` = same dates one year earlier. Date buckets are matched by position, so ranges with different lengths misalign: keep them equal.
- Percent change = (current - previous) / previous x 100; say "no comparison" when previous is 0.

## Periods
- Business day = the location's day as configured; late-night sales belong to the business day they opened in.
- A week is Monday to Sunday unless asked otherwise.
