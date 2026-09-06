# Momentum API

Momentum ranks GitHub repositories by momentum signals such as recent developer activity, repository recency, community size, popularity, and — once enough history exists — recent star growth.

## Product flow

```text
Open site
    -> Sign in with Google
    -> verify Gmail identity
    -> resolve Free/Pro access list
    -> bounded live scan
    -> results
```

Momentum is a standalone Gmail-authenticated product. There is no active payment provider or checkout dependency.

## Production API

Base URL:

```text
https://momentum-api-public.manikandanruki2004.workers.dev
```

## Customer access

The browser customer experience uses **Sign in with Google** and accepts only verified `@gmail.com` identities.

Every verified Gmail address receives Free access automatically unless it is present in the separate Pro access list.

| Tier | Requests / month | Rate limit | Max results / request |
|---|---:|---:|---:|
| Free | 100 | 10/min | **10** |
| Pro | 10,000 | 60/min | **25** |

Normal web users do not need to create or paste an API key. Google identity is verified server-side and the application issues a browser session.

## Pro access

Pro is an owner-managed Gmail allowlist, not a payment subscription.

Grant Pro to a Gmail address:

```http
POST /admin/pro/grant
X-Admin-Secret: <server-side admin secret>
Content-Type: application/json

{"email":"user@gmail.com"}
```

Revoke Pro and return the address to Free:

```http
POST /admin/pro/revoke
X-Admin-Secret: <server-side admin secret>
Content-Type: application/json

{"email":"user@gmail.com"}
```

The admin secret never belongs in browser code. After a grant or revoke, the affected user can sign out/in again or refresh account state.

## Gmail access storage

The access model uses two separate D1 tables:

```text
google_free_accounts
  email PRIMARY KEY

google_pro_accounts
  email PRIMARY KEY
```

An address is kept in one list only. Pro takes precedence during authentication, and grant/revoke operations maintain the lists atomically.

Customer rows are retained for service-session, quota, rate-limit, and usage state required by the engine. Legacy payment tables are removed by the forward migration `0021_google_access_lists.sql`; older migration files remain immutable history.

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
Google + lists  ranking + quotas
sessions        usage + caching
      |             |
      +------ D1 --+---- KV
                       |
                     GitHub
```

The public gateway owns routing, request IDs, CORS policy, safe error translation, edge rate limits, and service-binding health. It does not own access-list authority or ranking logic.

The private engine remains the source of truth for quotas, rate limits, result caps, repository ranking, GitHub access, caching, and background refresh work.

## Engineering model

Momentum follows a plan-first, modular, secure, observable shipping model based on the supplied **Vibe Engineering Blocks** reference:

- plan the approach, data, and edge cases before coding;
- keep the first useful slice small;
- keep UI, logic, data, and integrations separated;
- version migrations and protect multi-step writes;
- validate input at boundaries and keep secrets out of source and logs;
- use HTTPS, explicit authorization, rate limiting, timeouts, safe retries, and calm error handling;
- cache repeated work and move slow work to background jobs;
- use structured logs, request IDs, error tracking, tests, CI/CD, and browser verification;
- maintain durable AI rules in `CLAUDE.md` and reusable procedures in `skills/`.

Project documents:

- [`CLAUDE.md`](CLAUDE.md) — durable AI/build rules
- [`docs/PLAN-V2.md`](docs/PLAN-V2.md) — plan-first delivery plan
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture and invariants
- [`docs/ENGINEERING-CHECKLIST.md`](docs/ENGINEERING-CHECKLIST.md) — implementation gates and remaining work
- [`skills/secure-saas-build/SKILL.md`](skills/secure-saas-build/SKILL.md) — reusable secure SaaS build procedure

## Interactive demo

```text
https://therandomhuman-hub.github.io/momentum-api-public/
```

The demo provides an immediate sample preview, then uses verified Gmail sign-in for live queries. It contains no production API key or payment checkout.

## API authentication

Developer integrations can continue to use API keys with `X-API-Key` or `Authorization: Bearer` where the engine account has an API key. Browser authorization is controlled by Google Gmail access lists.

```bash
curl "https://momentum-api-public.manikandanruki2004.workers.dev/v1/momentum?language=python&min_stars=100&limit=10" \
  -H "X-API-Key: mk_live_..."
```

API credentials must never be committed to Git or exposed in browser source.

## Core endpoints

```http
POST /auth/google
GET  /auth/config
GET  /auth/me
POST /auth/logout
GET  /v1/me
GET  /v1/momentum
POST /admin/pro/grant
POST /admin/pro/revoke
GET  /auth/health
```

Retired payment routes such as `/billing/checkout`, `/billing/status`, `/billing/claim`, and `/webhooks/razorpay` are no longer part of the active API surface.

## Momentum query parameters

| Parameter | Type | Default | Range |
|---|---|---:|---:|
| `language` | string | empty | max 64 chars |
| `min_stars` | integer | `100` | `0..1000000` |
| `max_age_days` | integer | `3650` | `1..36500` |
| `limit` | integer | `5` | `1..20` |

The server applies the effective limit of the authenticated plan.

## Reliability and verification

Production deployment is expected to follow:

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

A green compile is not sufficient for a browser-facing change. The critical flow must be tested in a real browser, including Gmail sign-in, Free/Pro resolution, live scan, and post-grant/revoke account state.

## Security

Google ID tokens are verified server-side for issuer, audience, signature, expiration, and verified email status. Only `@gmail.com` accounts are accepted by the browser authentication path. Developer API keys are stored as HMAC-derived hashes. Pro authorization comes only from the server-side Gmail allowlist. Admin credentials remain in Cloudflare/GitHub secret storage and are never committed to the repository.

Report vulnerabilities privately using `SECURITY.md` and never publish credentials or sensitive security details in an issue.
