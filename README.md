# Momentum API

Momentum ranks GitHub repositories by recent developer activity, recency, community signals, popularity, and historical star growth.

## Product

Momentum is completely free. Every verified `@gmail.com` account receives the same access.

| Access | Monthly usage | Rate limit | Max results / scan |
|---|---:|---:|---:|
| Verified Gmail | Unlimited | 10 requests/minute | 20 |

There is no Pro tier, subscription, checkout, or payment provider in the active product.

## Dashboard

Open the GitHub Pages dashboard, sign in with Google, choose guided filters or a quick pick, and run a live scan. Results support Cards and Table views, with preview mode available before sign-in.

Dashboard: `https://therandomhuman-hub.github.io/momentum-api-public/`

## API

Base URL:

```text
https://momentum-api-public.manikandanruki2004.workers.dev
```

Core endpoints:

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

Query parameters:

| Parameter | Default | Production range |
|---|---:|---:|
| `language` | empty | max 64 characters |
| `min_stars` | 100 | 0..1,000,000 |
| `max_age_days` | 3650 | 1..36,500 |
| `limit` | 20 | 1..20 |

`limit=20` is the maximum result window for one scan. Unlimited refers to monthly usage, not unrestricted per-minute traffic or unbounded response size.

## Authentication

Browser authentication uses Google ID tokens verified server-side for issuer, audience, RS256 signature, expiration, and verified email status. Only normalized `@gmail.com` addresses are accepted.

Browser sessions are opaque `mk_session_*` tokens. Only a one-way HMAC hash is stored in `auth_sessions`; browser session tokens are never inserted into the developer `api_keys` table.

Developer integrations may use `X-API-Key` or `Authorization: Bearer mk_live_...`. Developer API keys are stored as HMAC-derived hashes and are never returned after creation.

The engine accepts protected `/v1/*` traffic only when the gateway supplies the shared service secret, preventing clients from forging the internal customer headers directly.

## Architecture

```text
Browser / SDK
      |
      v
momentum-api-public
      |              |
      v              v
momentum-auth   momentum-engine
Google/session  ranking/GitHub/cache
      \              /
       +----- D1 ---+
          \-- KV
```

The public gateway owns CORS, request IDs, query validation, edge abuse protection, and routing. Authentication owns Google verification and browser sessions. The engine owns ranking, GitHub access, result caps, per-customer rate limits, usage telemetry, and caching.

The production runtime is the TypeScript Cloudflare Worker in `momentum-engine/worker`.

## Reliability

External calls use bounded timeouts. GitHub rate-limit responses are surfaced as partial/unavailable activity rather than being silently treated as zero activity. Repository activity is cached and refreshed in background work where possible. Production deployment runs typechecks, migrations, service-binding checks, smoke tests, and a release gate.

## Deployment secrets

The production deployment workflow expects these GitHub Actions secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
MOMENTUM_GITHUB_TOKEN
MOMENTUM_API_KEY_PEPPER
MOMENTUM_ADMIN_SECRET
MOMENTUM_ENGINE_SHARED_SECRET
GOOGLE_CLIENT_ID
```

Never commit these values or place credentials in browser JavaScript, issues, screenshots, or logs.
