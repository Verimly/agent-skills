# Shift planning recipe

## Inputs
1. Location and week to plan (`list_locations`).
2. Demand: `report_query` `{ metrics: [orders, revenue_net], dimensions: [hour], filters: { locationIds }, range: last 4-8 same weekdays }`. Repeat per weekday or pull `date:day` + `hour` and aggregate. Reservations: `list_reservations { locationId, date }` for covers on special days.
3. Team: `list_staff { locationId }` for people and roles; availability and time off come from the user (not readable through tools).
4. Constraints from the user: opening hours, minimum staff per hour, maximum hours per person, break rules (local labour law), target labour %.

## Method
1. Convert demand to staff-hours: guests or orders per hour divided by the service capacity per person (ask the user; typical hospitality planning uses a sales-per-labour-hour target). Round up at peaks.
2. Cover opening and closing duties first (open, close), then the peaks, then fill.
3. Respect rest and maximum hours given by the user; mention that legal rest rules differ per country and must be checked by the user.
4. Compute planned labour % = planned labour cost / forecast sales. Needs `timesheet.cost_view`; otherwise plan on hours.
5. Present as a day-by-day table, flag understaffed hours and any overlap risk, and ask for approval.
6. Create shifts one by one with `create_shift` (ISO times with offset; `breakMinutes` as the user said).

## Quality checks
- No overlaps for a person; the person is assigned to the location.
- Daylight-saving changes alter offsets: recompute offsets per date.
- Do not plan people who are inactive (`includeInactive` false).
- Tell the user the schedule must be published in the panel for staff to see it, if the panel keeps drafts.
