---
name: verimly-team
description: Use when the user asks about their Verimly team - planning or creating shifts, worked and planned hours, labour cost, who is on the schedule, inviting a new staff member, time off or tip questions. Staff-level analysis only within what the user may see; never evaluates or ranks people.
license: MIT
compatibility: Needs the Verimly MCP server; shifts and invites need the staff:write scope. Hours need the time-clock module; labour cost needs timesheet.cost_view. Invites need staff.invite.
metadata:
  author: Verimly
  version: "0.1.0"
allowed-tools: mcp__verimly__whoami mcp__verimly__list_locations mcp__verimly__list_staff mcp__verimly__timeclock_summary mcp__verimly__report_query
---

# Verimly team

Read the `verimly` skill first. Staff data is personal data: tools already leave out phone, email and pay details; do not try to get around that.

## Look
- `list_staff { locationId?, query?, includeInactive? }`: name, role, locations, active, back-office access, last login. Resolve names to `staffId` here; ask when two people match.
- `timeclock_summary { locationId, from, to }` (module `time-clock`): `totals` (planned and worked hours, planned and actual cost, sales, `laborPercent`, `targetPercent`), `days[]`, `staff[]`. Cost fields are null without `timesheet.cost_view`: say so.
- Labour over several locations or periods: `report_query` with `labor_cost`, `labor_pct`, dimension `date:*` or `location` (max 93 days).

## Plan shifts (`create_shift`)
Write tool, scope `staff:write`, permission `timesheet.plan`, module time-clock. The caller must work at the location and the person must be assigned there; overlapping shifts are refused.
1. Ask or infer: location, person, date, start, end, break minutes. Times are ISO 8601 with the location's UTC offset (for example `2026-10-30T17:00:00+01:00`); check the offset for the date (daylight saving).
2. Look at what exists first (`timeclock_summary` days/staff) and demand: `report_query` by `hour` and weekday for the same weekday over the last 4 to 8 weeks gives the busy hours to cover.
3. Build a proposal as a table (person, day, start, end, hours), the planned labour cost estimate when visible, and labour % against sales of comparable days.
4. After an explicit yes, call `create_shift` once per shift (batch the confirmation, not the calls). Shifts are drafts or published according to the panel's schedule workflow; link the schedule page from `adminUrl`.
5. Report created shifts and any refused ones (overlap, not assigned to location).
Recipe details and staffing ratios: `references/shift-planning.md`.

## Invite staff (`invite_staff`)
Scope `staff:write`, permission `staff.invite`. Input: `email` and `roleId` (or `staffId`). It is an approval tool: the call returns `approval_required` with an `approval_url`, and the email invitation goes out only after the user approves it in the Verimly panel (then call again with `{ proposal_id }`). Confirm the exact address and role with the user first, and only invite roles within the user's own rights. Role definitions, permissions and PINs are managed in the panel only; never try to change them.

## Not available
Approving timesheets, payroll exports, time-off decisions, tip pool settings and pay rates are panel actions: use `explain_how` and the panel link (Time clock). You may read hours and describe the process, not decide for the user.

## Boundaries
Do not rank, score or recommend dismissing staff, and do not produce individual performance verdicts: staff decisions stay with people. Reporting objective figures the user may see (hours, planned versus worked) is fine.
