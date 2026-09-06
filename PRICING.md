# Momentum API — Access Plans

Momentum currently uses access lists rather than paid checkout. Pricing is not part of the active product.

| Tier | Requests / month | Rate limit | Results / request | Intended use |
|---|---:|---:|---:|---|
| Free | 100 | 10/min | 10 | Evaluation and small scripts |
| Pro | 10,000 | 60/min | 25 | Production apps and automation |

## Account experience

Users sign in with Google. Only verified `@gmail.com` identities are accepted by the browser experience.

A new verified Gmail address receives Free access automatically. Pro is activated only when the normalized Gmail address is present in the server-side Pro access list.

Developer API keys remain available as an advanced integration mechanism for applications that call Momentum directly.

## Pro access policy

The owner can grant or revoke Pro by Gmail address using the protected administrative endpoints:

```http
POST /admin/pro/grant
POST /admin/pro/revoke
```

The browser never decides its own tier. `/auth/me` re-checks the current server-side access list and updates the operational customer record to match.

## Plan enforcement

The private engine stores plan limits in its centralized D1 `plans` table. Result limits, monthly quota, and rate limits are enforced server-side by customer tier.

- **Free:** maximum 10 repositories per request.
- **Pro:** maximum 25 repositories per request.

The public API accepts the global parameter range supported by the server, but the customer's plan cap is the effective maximum. Quota and rate-limit values are enforced centrally rather than trusting caller-supplied values.

## Data model

Free and Pro addresses are stored separately:

```text
google_free_accounts(email PRIMARY KEY)
google_pro_accounts(email PRIMARY KEY)
```

An address is maintained in exactly one list.

## Important

The production engine caps commit activity at 500 commits per repository. Do not advertise higher commit limits until implemented and load-tested.
