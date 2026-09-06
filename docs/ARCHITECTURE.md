# Momentum API — Architecture v4

Momentum has one product experience: free GitHub momentum intelligence for verified Gmail users. There is no Pro tier, subscription, checkout, or payment provider.

## 1. Product boundary

Momentum returns ranked GitHub repository momentum data. Supporting capabilities are Google authentication, Free-account access, quotas, usage tracking, data freshness, and developer API access.

Every verified `@gmail.com` account is automatically Free.

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
Google + free   ranking + quotas
sessions        usage + caching
      |             |
      +------ D1 --+---- KV
```

The gateway owns routing, CORS policy, request IDs, safe error translation, rate-limit boundaries, and service-binding health checks. It does not own ranking logic or payment logic.

## 3. Layers

### Presentation
`demo/` contains the dashboard. It talks only to the public gateway and contains no secrets.

### Gateway
`worker/` is a thin adapter layer. It validates methods and query parameters, adds request context, calls authentication or engine services, and maps failures to safe responses.

### Domain services
- `auth/`: verifies Google identity, enforces Gmail-only access, creates sessions, and maintains the Free Gmail access record.
- private `momentum-engine`: repository ranking, quotas, usage, GitHub access, caching, and background refresh.

### Persistence
D1 stores customer, session, Free-access, quota, and usage state. Migrations are the only schema-change mechanism. KV is used for rate-limit/cache state.

## 4. Access-control invariants

1. A verified Gmail identity maps to one Momentum Free customer account.
2. Non-Gmail Google identities cannot obtain browser access.
3. Every accepted Gmail address receives the same Free tier.
4. No browser path can promote an account to another tier.
5. The active database contains only the Free access list; legacy Pro access is removed by migration.
6. The browser never receives internal database details or secret credentials.

## 5. Data model direction

The active Gmail access record is intentionally simple:

```text
google_free_accounts
  email PRIMARY KEY
```

Customer rows remain necessary for engine quotas, usage, sessions, and API-key compatibility. The Gmail address is the account identity key.

The forward migration `0022_free_only.sql` normalizes all existing customers to Free, deletes non-Free plan rows, and removes the legacy Pro access table. Historical migration files remain immutable database history.

## 6. Dashboard model

The browser uses guided choices instead of requiring users to write query syntax. Controls include topic, minimum stars, activity window, sort order, and quick-pick presets.

Results can be viewed as cards, a leaderboard table, or an insights panel. Each view is driven from the same result set so presentation changes do not alter ranking semantics.

## 7. Security

- Verify Google issuer, audience, signature, expiration, and `email_verified`.
- Accept only normalized `@gmail.com` addresses for browser authentication.
- Apply authentication brute-force throttling and edge rate limits.
- Keep CORS origins allow-listed.
- Escape dynamic HTML in the dashboard.
- Never expose credentials, session tokens after issuance, API keys, or internal database details in the browser.

## 8. Reliability

All outbound network calls use bounded timeouts. Retries are restricted to safe/idempotent operations. Database changes that can race use atomic operations or transactions.

Google signing-key fetches and service-binding calls are bounded. Free-account creation is idempotent by normalized email.

## 9. Performance

Live ranking should prefer cached activity where correctness permits. Expensive refresh work belongs in background jobs. Public requests are rate limited, result counts are bounded, and the single Free quota is enforced server-side.

## 10. Observability

Every request gets a request ID. Logs use structured JSON with safe context. Authentication failures, service-binding failures, rate limiting, quota rejection, and engine latency should be searchable by request ID.

Do not log Google credentials, session tokens, API keys, or complete authentication payloads.

## 11. Delivery

```text
git push
   -> contract validation
   -> typecheck
   -> tests
   -> D1 migration
   -> deploy engine/auth/gateway
   -> production health checks
   -> release gate
   -> live Gmail sign-in verification
```

The release gate verifies that retired payment routes are gone and the deployed dashboard uses the Gmail-only Free model.

## 12. Scope discipline

The current critical path is:

`Open dashboard -> choose filters -> Gmail sign-in -> Free access -> live scan -> cards/table/insights`

Do not reintroduce a second paid tier or payment-provider workflow unless a future product decision explicitly requires it.
