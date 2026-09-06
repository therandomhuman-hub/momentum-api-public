# Momentum — Free Access

Momentum is completely free to use. There is one product experience for every verified Gmail account.

| Access | Requests / month | Rate limit | Results / request |
|---|---:|---:|---:|
| Free | 100 | 10/min | 10 |

## Account experience

Sign in with Google using a verified `@gmail.com` account. The service automatically creates or reuses the Free account.

There is no Pro tier, subscription, checkout, payment provider, or payment information collected by the active product.

Developer API keys remain available for integrations that need direct API access.

## Dashboard

The web dashboard is designed around choices rather than free-form query writing. Users can choose a topic, minimum star range, activity window, sort order, quick-pick preset, and result view.

Available views include:

- result cards with momentum meters and signals;
- sortable-style leaderboard table;
- insight panels for momentum distribution and top-ranked projects.

## Plan enforcement

The private engine keeps the single Free plan as the source of truth for request quota, rate limits, and result caps. The public API and dashboard cannot upgrade an account to another tier.

The forward migration `0022_free_only.sql` normalizes existing customers to Free, removes non-Free plan rows, and removes the legacy Pro Gmail access table.

## Data model

Verified Gmail identities are recorded in the separate Free access table:

```text
google_free_accounts(email PRIMARY KEY)
```

Customer rows are retained for session, quota, rate-limit, and usage state required by the engine.
