# Momentum — Unlimited Free Access

Momentum is completely free to use. Every verified Gmail account gets the same unlimited product experience.

| Access | Requests / month | Results / scan |
|---|---:|---:|
| Gmail | Unlimited | Up to 20 |

## Account experience

Sign in with Google using a verified `@gmail.com` account. The service automatically creates or reuses the account.

There is no Pro tier, subscription, checkout, payment provider, or payment information collected by the active product.

The product has no monthly request quota. Infrastructure-level throttling may still temporarily reject abusive bursts so the service remains available to everyone.

## Dashboard

The web dashboard is designed around choices rather than free-form query writing. Users can choose a topic, minimum star range, activity window, sort order, quick-pick preset, and result view.

Every scan requests up to 20 repositories. Results can be viewed as cards, a leaderboard table, or insight panels.

## Enforcement

The private engine keeps the single Free plan for compatibility with the existing schema, but monthly quota enforcement is disabled. The result window is capped at 20 per scan.

The forward migration `0023_unlimited_20_results.sql` sets the Free plan result window to 20 and removes the monthly request cap from active enforcement.

## Data model

Verified Gmail identities are recorded in the separate access table:

```text
google_free_accounts(email PRIMARY KEY)
```

The same Gmail address is also stored on the `customers.email` field because the engine needs a customer record for authenticated sessions and usage telemetry. Google ID tokens are verified and are not persisted as raw tokens.
