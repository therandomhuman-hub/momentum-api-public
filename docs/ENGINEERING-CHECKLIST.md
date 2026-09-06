# Momentum Engineering Checklist

This checklist covers the standalone free Gmail product and separates release requirements from non-blocking future improvements.

## Product contract

- [x] Verified `@gmail.com` access only.
- [x] Unlimited monthly usage.
- [x] 10 requests/minute customer-specific protection.
- [x] Maximum 20 repositories per scan.
- [x] No Pro tier, subscription, checkout, or payment provider.

## Project hygiene

- [ ] Add lockfiles for each independently installed Node project and move CI from `npm install` to `npm ci`.
- [x] Runtime configuration stays outside source where supported.
- [x] Authentication and deployment secrets stay in secret stores.
- [x] CI scans tracked source for secret patterns.
- [x] Obsolete Pages sentinel/trigger artifacts removed.

## Structure

- [x] Public gateway, authentication, and ranking engine have separate responsibilities.
- [x] Production engine is the TypeScript Cloudflare Worker.
- [x] Active billing/payment-provider code is not part of the runtime path.
- [ ] Split the large engine/gateway files into smaller domain and persistence modules as maintenance work.

## Data and migrations

- [x] D1 is the operational source of truth.
- [x] Schema changes are represented by ordered forward migrations.
- [x] Historical migrations are not rewritten to repair production state.
- [x] Authoritative unlimited/20-result state is in migration `0025_unlimited_20_results.sql`.
- [x] Verified Gmail access is represented by the dedicated Free access table.
- [x] Browser sessions are stored as hashes in `auth_sessions`.
- [x] Legacy payment tables are retired by forward migration.
- [ ] Further optimize repository metadata access if production telemetry shows meaningful N+1 cost.

## Security

- [x] HTTPS production endpoints.
- [x] HSTS and security headers.
- [x] Explicit production CORS allowlist.
- [x] Gateway validates query types, ranges, and lengths before forwarding.
- [x] Google credentials are validated for issuer, audience, RS256 signature, expiry, and verified email.
- [x] Only normalized Gmail addresses are admitted.
- [x] Authentication failures are throttled by Cloudflare connecting IP.
- [x] Public and authentication routes have per-client-IP edge rate limiting.
- [x] Browser sessions are opaque and stored only as HMAC hashes.
- [x] Protected engine routes require the gateway shared secret.
- [x] API keys are hashed and never returned after issuance.
- [x] No credentials are intentionally logged or exposed to the browser.
- [x] No user-supplied URL fetching exists, so SSRF is not part of the current attack surface.

## Reliability and performance

- [x] External Google/GitHub/service-binding calls have bounded timeouts.
- [x] Customer rate limiting uses atomic D1 updates.
- [x] Unlimited monthly usage is explicitly handled without quota rejection.
- [x] Scan size is hard-capped at 20.
- [x] GitHub commit lookups use bounded concurrency and pagination.
- [x] Repository activity is cached and refreshed in background execution.
- [x] Query-result caching is bounded by TTL.
- [x] Deployment is serialized and fails on critical health checks.
- [ ] Add centralized external exception tracking after the core browser journey is proven stable.
- [ ] Standardize structured logging fields across all Workers.

## Dashboard UX

- [x] Guided filters instead of free-form query writing.
- [x] Quick-pick presets.
- [x] Preview mode without authentication.
- [x] Live scan control.
- [x] Cards and Table result views.
- [x] Explicit loading and error states.
- [x] Unlimited / 20-result / 10-per-minute messaging matches the runtime contract.
- [ ] Add persistent saved views after live usage validates the need.
- [ ] Add automated accessibility checks.

## Quality and shipping

- [x] Gateway and auth typechecks run in CI.
- [x] Engine typecheck and unlimited/20 contract checks run in CI.
- [x] D1 migration contract is checked in CI.
- [x] Browser smoke suite covers dashboard render, preview, anonymous boundaries, invalid queries, and limit 21 rejection.
- [x] Production deployment includes D1 migrations, engine/auth/gateway deployment, and smoke tests.
- [x] Production release gate verifies the deployed public contract and retired payment surface.
- [ ] Add a dedicated authenticated Gmail browser test using a controlled test account; this requires protected test credentials and is not enabled in public CI.

## Release gate

A release should satisfy:

`plan -> validate -> CI -> browser smoke -> forward migration -> deploy -> binding health -> release gate -> real Gmail live-scan acceptance`

Release evidence should contain the deployed commit SHA, workflow runs, test outcomes, and request IDs for failures. Never retain Google ID tokens, session tokens, API keys, or deployment secrets.
