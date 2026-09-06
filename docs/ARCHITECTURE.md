# Momentum API — Architecture v6

Momentum is a single free GitHub intelligence product for verified Gmail users. There is no Pro tier, subscription, checkout, or payment provider.

## Product contract

- Access: verified `@gmail.com` accounts only.
- Monthly usage: unlimited.
- Customer request limit: 10 requests/minute.
- Scan size: up to 20 repositories per request.
- Browser sessions: opaque `mk_session_*` tokens stored server-side only as HMAC hashes.

## Runtime topology

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
       +----- shared D1 -----+
                 \-- KV
```

The gateway owns routing, CORS, request IDs, query validation, edge abuse protection, and service-binding health checks. Authentication owns Google verification and browser sessions. The engine owns ranking, GitHub access, result caps, per-customer rate limiting, usage telemetry, and caching.

## Persistence

D1 stores customer, session, access, usage, and repository-intelligence metadata. KV is used for edge cache/rate-limit state. Schema changes are forward-only migrations. Historical migration files are not rewritten after deployment; corrective changes use a new migration.

## Security

Google credentials are verified for issuer, audience, RS256 signature, expiration, and verified email status. Only normalized `@gmail.com` identities are admitted. Browser sessions are random opaque tokens hashed before storage. Authentication failures are throttled by Cloudflare connecting IP. CORS is allow-listed at the public gateway. Dynamic dashboard values are escaped before rendering.

The engine rejects protected `/v1/*` traffic without the gateway shared secret. Browser customer identity headers therefore cannot be supplied directly by an anonymous external caller.

No credential, session token, API key, or database secret is exposed to the browser or written to application logs.

## Reliability and performance

External calls use bounded timeouts and bounded concurrency. The GitHub repository scan is capped at 20 results. Activity data is cached and background refresh is used where practical. GitHub rate-limit responses are represented as partial/unavailable activity rather than fabricated zero activity.

Monthly usage is unlimited, while the 10 requests/minute customer limit and edge abuse controls remain enforced.

## Dashboard

The dashboard is a static GitHub Pages client. It provides guided filters, quick picks, preview mode, live scans, Cards/Table views, and explicit loading/error states. It contains no deployment secrets and communicates only with the public gateway.

## Delivery

```text
git push
   -> CI contract/typecheck checks
   -> browser smoke checks
   -> forward D1 migrations
   -> deploy engine/auth/gateway
   -> production health checks
   -> release gate
   -> manual Gmail + live-scan acceptance
```

The release gate confirms the Gmail-only Unlimited Free contract, the 20-result ceiling, the 10/minute customer protection, healthy service bindings, and absence of retired payment routes.
