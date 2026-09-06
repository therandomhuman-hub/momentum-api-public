# Momentum Vibe Engineering Checklist

This checklist applies the plan-first, small-slice, secure, reliable, observable engineering model to the standalone free Gmail version of Momentum.

## Plan and scope

- [x] Core product slice is explicit.
- [x] Architecture is documented before structural changes.
- [x] Significant changes have a written implementation plan or decision record.
- [x] Non-core features remain behind later delivery slices.

## Project hygiene

- [ ] Add lockfiles for each independently installed Node project and move CI from `npm install` to `npm ci`.
- [x] Runtime configuration is kept outside source where supported by the platform.
- [x] Authentication secrets stay in platform/GitHub secret stores.
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
- [x] All browser users use the single Free Gmail access model.
- [x] Free Gmail identities are stored in a dedicated access table.
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
- [x] Authentication has IP-keyed brute-force throttling.
- [x] Protected actions check authentication and server-side access state.

## Reliability

- [x] Google signing-key fetches and service-binding calls have bounded timeouts.
- [x] Free-account creation is idempotent by normalized Gmail address.
- [ ] Audit remaining shared-state updates for races and make read/modify/write sequences atomic.
- [x] Edge rate limiting protects authentication and public routes.
- [x] Production deployment is serialized and fails on unhealthy critical routes.

## Performance

- [x] Repository activity caching exists in the engine architecture.
- [x] Result counts are bounded by the Free plan.
- [x] Gateway applies explicit edge rate limits per client IP and route.
- [x] Authenticated services enforce account/user-specific limits after identity resolution.
- [ ] Add pagination to any future endpoint whose result set can grow without a hard cap.
- [x] Non-critical refresh work has a background-job architecture in the engine.
- [ ] Optimize engine N+1 behavior and upstream latency after observability is complete.

## Dashboard UX

- [x] Dashboard provides guided controls rather than requiring free-form query writing.
- [x] Topic choices are presented as a dropdown.
- [x] Star thresholds are presented as a dropdown.
- [x] Activity windows are presented as a dropdown.
- [x] Sort choices are presented as a dropdown.
- [x] Quick-pick presets are provided for common discovery tasks.
- [x] Results can be viewed as cards, leaderboard table, or insights.
- [x] Preview mode works without authentication.
- [ ] Add persistent saved views after the core live journey is verified.

## Observability

- [x] Public requests carry request IDs.
- [x] Cloudflare Worker observability is enabled in deployment configuration.
- [x] Gateway rate-limit rejections are logged with route, scope, and request ID.
- [ ] Standardize structured JSON logging fields across all Workers.
- [ ] Add centralized exception/error tracking with safe customer messages.

## Quality and shipping

- [x] Gateway/auth typechecks run during CI.
- [x] Engineering-contract checks run during CI.
- [x] D1 migration contract is checked in CI and deployment.
- [x] Production health checks cover gateway/auth and retired payment routes.
- [x] Deployment smoke tests verify Gmail-only access mode and protected route boundaries.
- [x] Post-deploy production release gate verifies the deployed gateway, auth binding, security headers, and free dashboard UI markers.
- [ ] Add Playwright coverage for Gmail sign-in and live scan.
- [x] CI/CD deployment exists.

## Access-control model

- [x] Any verified Gmail account receives the same Free access.
- [x] No Pro access list exists in the active data model.
- [x] Client-supplied tier values are ignored for authorization.
- [x] Existing sessions are refreshed against the single Free plan.
- [x] There are no paid-tier grant/revoke endpoints.

## Browser verification

The critical browser journey is:

```text
Open dashboard
  -> Preview works
  -> Choose guided filters / quick pick
  -> Sign in with Google using Gmail
  -> Account resolves to Free
  -> Run live query
  -> Switch Cards / Table / Insights
  -> Sign out
  -> Sign in again
  -> Free access remains active
```

A build is not complete merely because TypeScript compiles. The browser path and the real service-binding path must be exercised.

## Release gate

A production release should satisfy:

`plan -> validate -> test -> browser smoke -> deploy -> binding health -> live verification`

The post-deploy gate is implemented in `.github/workflows/release-gate.yml`. It verifies the free Gmail dashboard model and confirms retired payment routes are no longer exposed.
