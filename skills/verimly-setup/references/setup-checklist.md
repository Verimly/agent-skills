# Setup checklist (first sale)

Tracked by `get_onboarding_status` and `get_setup_checklist`. Typical order:

1. Business details: name, country, currency, timezone (Settings > General). Panel.
2. Location(s): address, code, timezone (Settings > Locations). Panel.
3. Tax rates (Settings > Tax rates). Panel.
4. Menu: categories, products, prices. Agent: `import_menu` or `create_category`/`create_product`.
5. Staff and roles: invite people, assign roles; each person sets a POS PIN. Agent: `invite_staff`; roles and PINs in the panel (never by agent).
6. Opening hours per location. Panel (Settings > Locations), or the in-panel assistant.
7. Devices: pair POS and kitchen screens with a pairing code (Devices). Panel.
8. Printers (receipts, kitchen tickets): Devices. Panel.
9. Card payments: connect the payment account and a card reader (Settings > Payments). Panel; money settings are never done by agents.
10. Open the till (register), take a test sale, close the till.

For any panel step: `explain_how` gives the steps and the link; `search_help` finds the help article.
