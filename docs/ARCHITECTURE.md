# Momentum API — Architecture v3

This architecture applies the plan-first, small-slice, modular, secure, reliable, observable engineering model to Momentum.

## 1. Product boundary

Momentum has one core job: return ranked GitHub repository momentum data. Supporting capabilities are Google authentication, access control, quotas, usage tracking, data freshness, and developer API access.

There is no payment provider in the active product. Browser access is Gmail-only. Every verified `@gmail.com` account is automatically Free. Pro is granted or revoked by a server-side Gmail access list.

## 2. Runtime topology

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
Google identity  ranking + quotas
sessions         usage + caching
access lists     GitHub access
      |             |
      +------ D1 --+---- KV
```

The gateway owns routing, CORS policy, request IDs, safe error translation, rate-limit boundaries, and service-binding health checks. It does not own authorization lists or ranking logic.

## 3. Layers

### Presentation
`demo/` contains the browser application. It talks only to the public gateway. It does not contain secrets or access-control authority.

### Gateway
`worker/` is a thin adapter layer. It validates method/path combinations, adds request context, calls the authentication or engine service, and maps failures to safe responses.

### Domain services
- `auth/`: verifies Google identity, enforces Gmail-only access, creates sessions, and manages the separate Free/Pro Gmail access lists.
- private `momentum-engine`: repository ranking, quotas, usage, GitHub access, caching, and background refresh.

### Persistence
D1 stores relational customer/session/access/usage state. Migrations are the only schema-change mechanism. KV is used for cache-like or rate-limit state.

## 4. Access-control invariants

1. A verified Gmail identity maps to one Momentum customer account.
2. Non-Gmail Google identities cannot obtain browser access.
3. A Gmail address is stored in exactly one access list: Free or Pro.
4. Pro authorization is derived from the server-side Pro Gmail access list, never from browser state.
5. Granting Pro removes the address from the Free access list.
6. Revoking Pro places the address in the Free access list.
7. Existing sessions are re-authorized against the current access list on `/auth/me`.
8. The browser never receives admin credentials or internal database details.

## 5. Data model direction

The two access tables are intentionally simple:

```text
google_free_accounts
  email PRIMARY KEY

google_pro_accounts
  email PRIMARY KEY
```

Customer rows remain necessary for engine quotas, usage, sessions, and API-key compatibility. The Gmail address is the identity key used to choose the effective tier.

Legacy payment/subscription tables are removed by the standalone access migration. Historical migration files remain immutable because applied migrations are part of the database history.

## 6. Security

- Verify Google issuer, audience, signature, expiration, and `email_verified`.
- Accept only normalized `@gmail.com` addresses for browser authentication.
- Keep Pro grant/revoke behind the server-side admin secret and POST-only endpoints.
- Apply authentication brute-force throttling and edge rate limits.
- Keep CORS origin allow-listed.
- Escape dynamic HTML in the browser.
- Never expose secrets, session tokens after issuance, or admin credentials.

## 7. Reliability

All outbound network calls use bounded timeouts. Retries are restricted to safe/idempotent operations. Database changes that can race use atomic operations or transactions.

The Google signing-key fetch is bounded. Service-binding calls are bounded. Access-list grant/revoke operations update related records atomically.

## 8. Performance

Live ranking should prefer cached activity where correctness permits. Expensive refresh work belongs in background jobs. Public requests are rate limited, result counts are bounded, and account quota checks remain server-side.

## 9. Observability

Every request gets a request ID. Logs use structured JSON with safe context. Authentication failures, access-list mutations, service-binding failures, rate limiting, quota rejections, and engine latency should be searchable by request ID and normalized Gmail address only when operationally necessary.

Do not log Google credentials, session tokens, admin secrets, API keys, or complete authentication payloads.

## 10. Delivery

```text
git push
   -> contract validation
   -> typecheck
   -> tests
   -> deploy engine/auth/gateway
   -> D1 migration
   -> production health checks
   -> release gate
   -> live Gmail sign-in verification
```

The release gate must verify that retired payment routes are gone and the deployed browser contains the Gmail access model.

## 11. Scope discipline

The current critical path is:

`Open site -> Gmail sign-in -> Free/Pro authorization -> live scan -> results`

Do not reintroduce payment-provider complexity unless a new product decision explicitly requires paid checkout.
