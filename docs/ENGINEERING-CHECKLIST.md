# Momentum Vibe Engineering Checklist

This checklist applies the plan-first, small-slice, secure, reliable, observable engineering model to the standalone Gmail access version of Momentum.

## Plan and scope

- [x] Core product slice is explicit.
- [x] Architecture is documented before structural changes.
- [x] Significant changes have a written implementation plan or decision record.
- [x] Non-core features remain behind later delivery slices.

## Project hygiene

- [ ] Add lockfiles for each independently installed Node project and move CI from `npm install` to `npm ci`.
- [x] Runtime configuration is kept outside source where supported by the platform.
- [x] Authentication/admin secrets stay in platform/GitHub secret stores.
- [x] CI performs tracked-source secret-pattern scanning.

## Structure

- [x] Public gateway is separated from authentication and engine services.
- [ ] Split remaining large service files into smaller domain/persistence modules.
- [x] UI, API routing, access-control rules, and persistence have explicit ownership boundaries.
- [x] Active payment-provider code and billing Worker have been removed.

## Data

- [x] JSON remains the external API format.
- [x] D1 stores operational customer/session/usage state.
- [x] Schema changes are represented as ordered migrations.
- [x] Free and Pro Gmail access lists are stored in separate tables.
- [x] Grant/revoke changes to both lists use atomic D1 batches.
- [x] Gmail access is re-evaluated on authenticated account refresh.
- [x] Legacy payment tables are removed by a forward migration; historical migrations remain immutable.
- [ ] Audit the private engine for N+1 access patterns.
- [x] NoSQL is not introduced without a demonstrated document-shaped requirement.

## Security

- [x] HTTPS service endpoints are used in production.
- [x] HSTS/security headers are checked in production health tests.
- [x] Gateway query boundaries validate type, range, and length before forwarding.
- [x] Auth JSON input validates content type, credential size, and credential structure before verification.
- [x] Dynamic HTML in the public demo is escaped.
- [x] Production CORS is explicit rather than wildcard.
- [ ] Add SSRF defenses before introducing any user-supplied URL fetcher.
- [x] Session and API credentials are never returned in full after issuance.
- [x] Google ID tokens require valid signature, issuer, audience, expiration, and verified email.
- [x] Browser authentication accepts only normalized `@gmail.com` addresses.
- [x] Pro grant/revoke requires the server-side admin secret.
- [x] Authentication has IP-keyed brute-force throttling.
- [x] Protected actions check authentication and server-side access state.

## Reliability

- [x] Google signing-key fetches and service-binding calls have bounded timeouts.
- [x] Access-list grant/revoke operations use D1 atomic batches.
- [ ] Audit remaining shared-state updates for races and make read/modify/write sequences atomic.
- [x] Edge rate limiting protects authentication and public routes.
- [x] Production deployment is serialized and fails on unhealthy critical routes.

## Performance

- [x] Repository activity caching exists in the engine architecture.
- [x] Result counts are bounded by the authenticated plan.
- [x] Gateway applies explicit edge rate limits per client IP and route.
- [ ] Add stronger per-user limits at the gateway once authentication identity is available before routing.
- [ ] Add pagination to any future endpoint whose result set can grow without a hard cap.
- [x] Non-critical refresh work has a background-job architecture in the engine.
- [ ] Optimize engine N+1 behavior and upstream latency after observability is complete.

## Observability

- [x] Public requests carry request IDs.
- [x] Cloudflare Worker observability is enabled in deployment configuration.
- [x] Gateway rate-limit rejections are logged with route, scope, and request ID.
- [ ] Standardize structured JSON logging fields across all Workers.
- [ ] Add centralized exception/error tracking with safe customer messages.
- [ ] Add operational audit events for Pro grants/revokes without logging admin secrets.

## Quality and shipping

- [x] Gateway/auth typechecks run during CI.
- [x] Engineering-contract checks run during CI.
- [x] D1 migration contract is checked in CI and deployment.
- [x] Production health checks cover gateway/auth and retired payment routes.
- [x] Deployment smoke tests verify Gmail access mode and protected route boundaries.
- [x] Post-deploy production release gate verifies the deployed gateway, auth binding, security headers, and Gmail UI markers.
- [ ] Add behavior tests for Free/Pro list transitions.
- [ ] Add Playwright coverage for Gmail sign-in and live scan.
- [ ] Add browser verification for Pro grant/revoke using a controlled test Gmail account.
- [x] CI/CD deployment exists.

## Access-control model

- [x] Any verified Gmail account receives Free automatically.
- [x] Pro access is represented by a separate Gmail allowlist.
- [x] Free and Pro Gmail addresses cannot exist in both lists simultaneously.
- [x] Client-supplied tier values are ignored for authorization.
- [x] Existing sessions are re-checked against the current access list.
- [x] Pro grant/revoke endpoints are server-authorized and POST-only.

## Browser verification

The critical browser journey is:

```text
Open site
  -> Preview works
  -> Sign in with Google using Gmail
  -> Account resolves to Free or Pro
  -> Run live query
  -> Sign out
  -> Sign in again
  -> Current access-list tier is reflected
```

A build is not complete merely because TypeScript compiles. The browser path and the real service-binding path must be exercised.

## Release gate

A production release should satisfy:

`plan -> validate -> test -> browser smoke -> deploy -> binding health -> live verification`

The post-deploy gate is implemented in `.github/workflows/release-gate.yml`. It verifies the Gmail access model and confirms retired payment routes are no longer exposed.
