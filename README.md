# Momentum API

Momentum ranks GitHub repositories by momentum signals such as recent developer activity, repository recency, community size, popularity, and — once history exists — recent star growth.

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

The interactive dashboard is built for people who do not want to write search expressions. It provides guided controls for topic, minimum stars, activity window, sort order, and quick-pick presets. Results can be viewed as cards, a leaderboard table, or an insights panel.

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
Google + free   ranking + quota
sessions        GitHub + cache
      |             |
      +------ shared D1 ------+
                 +-- KV / edge cache
```

The public gateway owns routing, CORS policy, request IDs, edge rate limits, query validation, and service-binding health checks. The gateway validates browser sessions through the auth Worker and hands the verified customer identity to the engine through a private service-binding secret.

The production engine is the **TypeScript Cloudflare Worker in `momentum-engine/worker`**. Its D1 schema is the source of truth for customers, API keys, usage, plans, snapshots, and activity cache. The top-level Python FastAPI app in that repository is retained as a separate non-production/legacy implementation and is not deployed by the production workflow.

## Authentication boundary

Google ID tokens are verified server-side for issuer, audience, signature, expiration, and verified email status. Only verified `@gmail.com` accounts are accepted by the browser authentication path.

Browser session tokens are stored only as one-way HMAC hashes in `auth_sessions`. They are **not** inserted into the developer `api_keys` table. A browser `/v1/*` request is revalidated by the auth Worker at the gateway and then forwarded to the engine with the external customer ID and Gmail address; the engine never treats a browser session token as a developer API key.

Developer integrations may use `X-API-Key` or `Authorization: Bearer mk_live_...`. API keys are stored as HMAC-derived hashes and are never returned after creation.

The engine requires `GATEWAY_SHARED_SECRET` on all `/v1/*` requests. The public gateway sends the matching `ENGINE_SHARED_SECRET`, so browser identity headers cannot be forged through the public API.

## Core endpoints

```http
POST /auth/google
GET  /auth/config
GET  /auth/health
GET  /auth/me
POST /auth/logout
GET  /v1/me
GET  /v1/momentum
GET  /health
GET  /version
```

## Momentum query parameters

| Parameter | Type | Default | Range |
|---|---|---:|---:|
| `language` | string | empty | max 64 chars |
| `min_stars` | integer | `100` | `0..1000000` |
| `max_age_days` | integer | `3650` | `1..36500` |
| `limit` | integer | `10` | `1..10` |

The gateway validates these constraints before forwarding. The engine applies the same hard caps centrally.

## Usage and rate limiting

Free access is **100 momentum requests per calendar month** with a **10 requests/minute** customer-level burst limit. Both limits are enforced server-side using atomic D1 updates. Usage accounting is retained for operational reporting.

## Ranking quality

The engine uses live GitHub repository search plus cached/background activity refresh. Commit lookups are bounded and concurrency-limited. GitHub rate-limit responses are represented as partial/unavailable activity instead of silently pretending that a repository has zero activity.

The momentum model uses recent commits, repository recency, community signals, baseline popularity, and seven-day star-growth history when enough snapshots exist. Historical snapshots are refreshed by a scheduled Worker job and retained for a bounded period.

## Reliability and verification

Production deployment follows:

```text
git push
  -> validate/typecheck
  -> D1 migration
  -> deploy engine/auth/gateway
  -> install production secrets
  -> real service-binding health
  -> boundary smoke tests
  -> production release gate
```

A green compile is not sufficient for a browser-facing change. The critical path must be verified in a real browser, including Gmail sign-in, Free access, guided filters, live scan, and all result views.

## Required deployment secrets

The production deployment workflow expects the following GitHub Actions secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
MOMENTUM_GITHUB_TOKEN
MOMENTUM_API_KEY_PEPPER
MOMENTUM_ADMIN_SECRET
MOMENTUM_ENGINE_SHARED_SECRET
GOOGLE_CLIENT_ID
```

`MOMENTUM_ENGINE_SHARED_SECRET` is installed into both the private engine as `GATEWAY_SHARED_SECRET` and the public gateway as `ENGINE_SHARED_SECRET`.

## Security

Never commit `.env`, GitHub tokens, Cloudflare credentials, API keys, Google credentials, or deployment secrets. Report vulnerabilities privately using `SECURITY.md` and never publish credentials or sensitive security details in an issue.
