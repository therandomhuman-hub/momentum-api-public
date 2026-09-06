# Momentum API

Momentum ranks GitHub repositories by momentum signals such as recent developer activity, repository recency, community size, popularity, and — once enough history exists — recent star growth.

## Product flow

```text
Open dashboard
    -> choose guided filters / quick picks
    -> Sign in with Google
    -> verify Gmail identity
    -> Free access
    -> bounded live scan
    -> cards / table / insights
```

Momentum is a standalone, completely free Gmail-authenticated product. There is no Pro tier, subscription, checkout, or active payment provider.

## Production API

Base URL:

```text
https://momentum-api-public.manikandanruki2004.workers.dev
```

## Customer access

The browser customer experience uses **Sign in with Google** and accepts only verified `@gmail.com` identities. Every verified Gmail address receives the same Free account automatically.

| Access | Requests / month | Rate limit | Max results / request |
|---|---:|---:|---:|
| Free | 100 | 10/min | **10** |

No payment information is required or collected by the active product.

## Dashboard experience

The interactive dashboard is built for people who do not want to write search expressions. It provides guided controls:

- Topic presets such as Python, JavaScript, TypeScript, Go, Rust, Java, AI/ML, and Web.
- Star thresholds from any project through 50K+.
- Activity windows from 30 days through longer history.
- Sort choices for momentum, stars, or commit activity.
- Quick picks for Fast movers, Rising stars, Established projects, and Builder favorites.
- Cards, leaderboard table, and insights views.

Results surface repository name, stars, recent commits, momentum score, momentum level, language, and a compact signal label when supplied by the engine.

## Gmail access storage

The active access model uses one separate D1 table:

```text
google_free_accounts
  email PRIMARY KEY
```

Customer rows remain necessary for authenticated sessions, quota, rate-limit, and usage state. The forward migration `0022_free_only.sql` normalizes every existing customer to Free, removes non-Free plan rows, and removes the legacy Pro access table.

## Architecture

```text
Browser / SDK
      |
      v
+---------------------------+
| momentum-api-public       |
| public Cloudflare gateway |
+---------------------------+
      |             |
      v             v
momentum-auth   momentum-engine
Google + free   ranking + quotas
sessions        usage + caching
      |             |
      +------ D1 --+---- KV
                       |
                     GitHub
```

The public gateway owns routing, request IDs, CORS policy, safe error translation, edge rate limits, and service-binding health. It does not own ranking logic or secret credentials.

The private engine remains the source of truth for quotas, rate limits, result caps, repository ranking, GitHub access, caching, and background refresh work.

## Interactive dashboard

```text
https://therandomhuman-hub.github.io/momentum-api-public/
```

The dashboard provides an immediate sample preview, guided choices instead of free-form query writing, verified Gmail sign-in for live queries, and multiple result views. It contains no production API key or payment checkout.

## API authentication

Developer integrations can continue to use API keys with `X-API-Key` or `Authorization: Bearer` where the engine account has an API key. Browser authorization is controlled by the verified Gmail sign-in path.

```bash
curl "https://momentum-api-public.manikandanruki2004.workers.dev/v1/momentum?language=python&min_stars=100&limit=10" \
  -H "X-API-Key: mk_live_..."
```

API credentials must never be committed to Git or exposed in browser source.

## Core endpoints

```http
POST /auth/google
GET  /auth/config
GET  /auth/health
GET  /auth/me
POST /auth/logout
GET  /v1/me
GET  /v1/momentum
```

Retired payment routes are no longer part of the active API surface.

## Momentum query parameters

| Parameter | Type | Default | Range |
|---|---|---:|---:|
| `language` | string | empty | max 64 chars |
| `min_stars` | integer | `100` | `0..1000000` |
| `max_age_days` | integer | `3650` | `1..36500` |
| `limit` | integer | `10` | `1..10` |

The server applies the single Free plan limits centrally.

## Reliability and verification

Production deployment follows:

```text
git push
  -> validate
  -> typecheck / tests
  -> D1 migration
  -> deploy engine/auth/gateway
  -> exercise real service bindings
  -> production health
  -> release gate
  -> real Gmail browser verification
```

A green compile is not sufficient for a browser-facing change. The critical flow must be tested in a real browser, including Gmail sign-in, Free access, guided filters, live scan, and all result views.

## Security

Google ID tokens are verified server-side for issuer, audience, signature, expiration, and verified email status. Only `@gmail.com` accounts are accepted by the browser authentication path. Developer API keys are stored as HMAC-derived hashes. No browser path can promote an account to another tier because the product has only one Free tier.

Report vulnerabilities privately using `SECURITY.md` and never publish credentials or sensitive security details in an issue.
