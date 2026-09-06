# Momentum API — Architecture v5

Momentum is a single free GitHub intelligence product for verified Gmail users. There is no Pro tier, subscription, checkout, or payment provider.

## Product contract

- Access: verified `@gmail.com` accounts only.
- Monthly usage: unlimited.
- Customer request limit: 10 requests/minute.
- Scan size: up to 20 repositories per request.
- Browser sessions: opaque `mk_session_*` tokens stored server-side only as hashes.

## Runtime topology

```text
Browser / SDK
      |
      v
+---------------------------+
| momentum-api-public       |
| public API gateway        |
+---------------------------+
      |             |
      v             v
momentum-auth   momentum-engine
Google + Gmail  ranking + cache
sessions        GitHub access
      |             |
      +------ D1 --+---- KV
```

The gateway owns routing, CORS, request IDs, boundary validation, edge abuse protection, and service-binding health checks. Authentication owns Google verification and browser sessions. The engine owns ranking, GitHub access, caching, and the authoritative 10/minute + 20-result runtime contract.

## Persistence

D1 stores customer, session, access, and usage metadata. KV is used for edge rate-limit/cache state. Schema changes are forward-only migrations. Applied migration history is never rewritten as a substitute for a corrective migration.

## Security

Google credentials are verified for issuer, audience, signature, expiration, and `email_verified`. Only normalized `@gmail.com` identities are admitted. Browser sessions are random opaque tokens hashed before storage. Authentication failures are throttled by the Cloudflare connecting IP. CORS is allow-listed. Dynamic dashboard content is escaped before rendering.

No credential, session token, API key, or database secret is exposed to the browser or written to logs.

## Reliability and performance

External requests use bounded timeouts. Rate limits and result counts are bounded at the service boundary even though monthly usage is unlimited. Ranking should prefer cached activity where correctness permits; expensive refresh work belongs in background execution.

## Dashboard

The dashboard is a static client hosted on GitHub Pages. It provides guided filters, quick presets, Cards/Table views, preview data, live scans, and clear authentication/error states. It does not contain secrets and talks only to the public gateway.

## Delivery

```text
git push
   -> CI contract/typecheck checks
   -> browser smoke checks
   -> forward D1 migrations
   -> deploy engine/auth/gateway
   -> production health checks
   -> release gate
```

The release gate must confirm the Gmail-only Unlimited Free contract, retired payment routes are absent, service bindings are healthy, and the dashboard reflects the same limits as the API.
