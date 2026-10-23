# Verimly concepts

## Account structure
- **User**: a person with a Verimly sign-in. One user can belong to several organizations.
- **Organization**: the business. Has a country, currency, timezone, language, business type and one subscription plan.
- **Location**: a venue of the organization. Opening hours, tables, devices, availability (86) and some prices are per location. The subscription is billed per active location.
- **Device**: a POS, kitchen/bar screen (KDS) or customer display paired to one location. Staff sign in on a POS with their own PIN.

## Roles and permissions
System roles: owner, manager, cashier, waiter, kitchen, accountant. Each role is a set of permissions (for example `menu.manage`, `menu.price_manage`, `report.view`, `timesheet.cost_view`). An agent connection acts for one user: effective rights = the user's permissions intersected with the connection's scopes and, optionally, its locations. A cashier connected through an agent sees what a cashier sees, nothing more.

## Plans and modules
Plans: starter, pro, business. Modules are features that can be switched on per organization or per location, limited by plan:

| Module | Lowest plan |
|---|---|
| tables, kds, cash-drawers, bar-tabs, pricing-rules, time-clock, customer-display | starter |
| inventory, purchasing, qr-ordering, online-ordering, reservations, loyalty, gift-cards, tip-pooling, website | pro |
| multi-location (central management, location prices, location comparison) | business |

`get_plan_and_modules` is the source of truth (plan, limits, AI usage, every module with `enabled` and `inPlan`). Do not guess from this table.

## Channels and order types
Orders come from the POS, QR table ordering, online ordering (pickup), reservations and bar tabs (`channel`: pos, qr, online, reservation, tab). Order types: dine-in, takeaway, delivery.

## Regular
Regular is Verimly's guest app (loyalty, gift cards, bookings, wallet pass). Guests are `customers` in tools; their contact data is masked in results.

## Money and time
- Amounts are integer minor units plus `currency` (`amountUnit: "minor"`), e.g. `350` = 3.50. Inputs that are money (prices) are minor units too.
- Report revenue is VAT-exclusive; menu prices and order totals are VAT-inclusive.
- Dates are `YYYY-MM-DD` business days in the location's timezone. Times such as `startsAt` are ISO 8601 with offset.

## Deep links
Results carry `adminUrl` (and per-row links). Use them to send the user to the right panel screen, especially for anything you cannot do.
