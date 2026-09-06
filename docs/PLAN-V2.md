# Momentum v4 — Plan Before Code

## Goal

Run Momentum as a standalone, completely free Gmail-authenticated GitHub intelligence service with a professional dashboard and no payment provider dependency.

## Core slice

`Choose guided filters -> Google sign-in -> verified Gmail -> Free access -> bounded live scan -> cards/table/insights`

## Decisions

1. Keep the public browser app thin and dashboard-focused.
2. Keep gateway, auth, and engine responsibilities separate.
3. Keep D1 as the relational source of truth for customer/session/access/usage state.
4. Keep one Free Gmail access table; every verified Gmail account receives the same Free experience.
5. Remove the Pro tier and all paid-tier authorization logic.
6. Validate at system boundaries before domain logic runs.
7. Bound external network calls with timeouts.
8. Protect authentication from repeated failed attempts.
9. User-facing errors stay calm and safe; detailed diagnostics remain server-side.
10. Ship only after automated checks pass and the real browser path is verified.
11. Keep API documentation synchronized with the actual gateway/auth/engine route surface.
12. Preserve applied migration history; remove obsolete payment/Pro state through forward migrations rather than rewriting old migrations.
13. Do not store payment-provider credentials, payment payloads, subscription identifiers, webhook state, or paid-tier access in the active model.

## Delivery phases

### Phase A — foundation

- [x] Permanent AI rules in `CLAUDE.md`.
- [x] Architecture in `docs/ARCHITECTURE.md`.
- [x] Engineering checklist in `docs/ENGINEERING-CHECKLIST.md`.
- [x] Reusable secure-build skill.
- [x] CI hygiene and typechecks.

### Phase B — professional dashboard

- [x] Replace dense demo layout with a dashboard workspace.
- [x] Separate account, controls, metrics, and results visually.
- [x] Replace free-form language entry with guided topic choices.
- [x] Add star threshold, activity window, sort, and quick-pick controls.
- [x] Add Cards, Table, and Insights result views.
- [x] Keep sample data available without authentication.
- [x] Make errors visible without exposing implementation details.
- [x] Remove payment/upgrade UI.

### Phase C — free Gmail access model

- [x] Accept only verified Google identities with `@gmail.com` addresses.
- [x] Maintain the dedicated `google_free_accounts` table.
- [x] Automatically place each authenticated Gmail account in Free access.
- [x] Normalize all existing customers to Free through a forward migration.
- [x] Remove the active Pro Gmail access table.
- [x] Remove paid-tier grant/revoke endpoints.
- [x] Remove active billing service binding and payment routes.
- [x] Forward migration removes obsolete payment tables and triggers.

### Phase D — security

- [x] Explicit browser CORS origin policy.
- [x] Gateway query and auth-request boundary validation.
- [x] HSTS/security headers checked in production health tests.
- [x] IP-keyed brute-force throttling to Google sign-in.
- [x] Secret-pattern scanning without payment-provider credential patterns.
- [x] No client-side tier switching.

### Phase E — reliability/performance

- [x] Critical external calls have bounded timeouts.
- [x] Authentication key retrieval is bounded and cached.
- [x] Free-account creation is idempotent by normalized Gmail address.
- [ ] Audit remaining shared-state updates for races.
- [ ] Audit rate limiting per user and per IP.
- [x] Preserve bounded result counts and background refresh architecture.
- [ ] Audit cache TTLs and invalidation.
- [ ] Optimize engine N+1 and upstream latency after observability is complete.

### Phase F — quality and shipping

- [x] CI validates the free-only access architecture and migration contract.
- [x] Gateway/auth typechecks run in CI.
- [x] Production health checks cover gateway/auth and retired payment routes.
- [x] Post-deploy release gate checks free Gmail dashboard markers and route boundaries.
- [ ] Add browser E2E coverage for Gmail sign-in and live scan.
- [ ] Standardize structured JSON logs across Workers.
- [ ] Add centralized exception/error tracking.

## Acceptance criteria

- The dashboard renders correctly in a real browser.
- A verified Gmail account can sign in and receives the same Free access as every other verified Gmail account.
- Non-Gmail Google identities are rejected.
- No client or browser state can upgrade an account to another tier.
- Retired payment routes return 404.
- No active Worker, gateway route, deployment workflow, or UI depends on a payment provider.
- Live scans enforce the single Free plan limits server-side.
- Guided filters work without requiring free-form query writing.
- Cards, Table, and Insights views render from the same live result set.
- Authentication and service-binding failures return safe errors with request IDs.
- A failed validation or health gate blocks release.
