# Momentum — Unlimited Free Access

Momentum is completely free to use. Every verified Gmail account receives the same product experience.

| Access | Monthly usage | Results / scan |
|---|---:|---:|
| Verified Gmail | Unlimited | Up to 20 |

## Account experience

Sign in with Google using a verified `@gmail.com` account. The service creates or reuses the corresponding Free account automatically.

There is no Pro tier, subscription, checkout, payment provider, or payment information collected by the active product.

Monthly usage is unlimited. A customer-level rate limit of 10 requests/minute remains enabled for abuse protection and service stability.

## Dashboard

The dashboard provides guided filters, quick picks, live scans, preview mode, Cards/Table views, and account state. Each scan can return up to 20 repositories.

## Enforcement

The private engine retains the single Free plan for schema compatibility. A monthly quota of `0` means unlimited and is handled explicitly by runtime quota logic. The result window is hard-capped at 20.

The authoritative forward migration is `0025_unlimited_20_results.sql`. Earlier migrations are historical schema history and are not rewritten after deployment.

## Data model

Verified Gmail identities are tracked in:

```text
google_free_accounts(email PRIMARY KEY)
```

The matching customer record is stored in D1 for authenticated sessions, rate limiting, usage telemetry, and repository intelligence state. Google ID tokens are verified but never persisted as raw credentials.
