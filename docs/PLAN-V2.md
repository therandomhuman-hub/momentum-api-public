# Momentum v3 — Plan Before Code

## Goal

Run Momentum as a standalone Gmail-authenticated GitHub intelligence service with a simple Free/Pro access model and no payment provider dependency.

## Core slice

`Google sign-in -> verified Gmail -> Free/Pro access-list lookup -> bounded live scan -> results`

## Decisions

1. Keep the public browser app thin.
2. Keep gateway, auth, and engine responsibilities separate.
3. Keep D1 as the relational source of truth for customer/session/access/usage state.
4. Keep Free and Pro Gmail addresses in separate access-list tables.
5. Any verified `@gmail.com` account receives Free access automatically unless its address is in the Pro list.
6. Pro is granted and revoked only by server-side administrative actions.
7. Re-check the current Gmail access list whenever `/auth/me` is requested so access changes do not depend on payment callbacks or browser state.
8. Validate at system boundaries before domain logic runs.
9. Bound external network calls with timeouts.
10. Protect authentication from repeated failed attempts.
11. User-facing errors stay calm and safe; detailed diagnostics remain server-side.
12. Ship only after automated checks pass and the real browser path is verified.
13. Keep API documentation synchronized with the actual gateway/auth/engine route surface.
14. Preserve applied migration history; remove obsolete payment tables through a forward migration rather than rewriting old migrations.
15. Do not store payment-provider credentials, payment payloads, subscription identifiers, or webhook state in the active access model.

## Delivery phases

### Phase A — foundation

- [x] Permanent AI rules in `CLAUDE.md`.
- [x] Architecture in `docs/ARCHITECTURE.md`.
- [x] Engineering checklist in `docs/ENGINEERING-CHECKLIST.md`.
- [x] Reusable secure-build skill.
- [x] CI hygiene and typechecks.

### Phase B — product interface

- [x] Replace dense demo layout with a clear interface.
- [x] Separate account, scan, access, results, and trust concepts visually.
- [x] Make errors visible without exposing implementation details.
- [x] Keep sample data available without authentication.
- [x] Remove payment/checkout UI.
- [x] Explain Gmail-only Free and Pro access.

### Phase C — Gmail access model

- [x] Accept only verified Google identities with `@gmail.com` addresses.
- [x] Create separate `google_free_accounts` and `google_pro_accounts` tables.
- [x] Automatically place newly authenticated Gmail accounts in Free unless allow-listed for Pro.
- [x] Reconcile existing customers against the current access list during authentication.
- [x] Add protected administrative Pro grant endpoint.
- [x] Add protected administrative Pro revoke endpoint.
- [x] Remove active billing service binding and payment routes.
- [x] Forward migration removes obsolete payment tables and triggers.

### Phase D — security

- [x] Explicit browser CORS origin policy.
- [x] Gateway query and auth-request boundary validation.
- [x] HSTS/security headers checked in production health tests.
- [x] IP-keyed brute-force throttling to Google sign-in.
- [x] Secret-pattern scanning without payment-provider credential patterns.
- [x] Pro grant/revoke requires a server-side admin secret.

### Phase E — reliability/performance

- [x] Critical external calls have bounded timeouts.
- [x] Authentication key retrieval is bounded and cached.
- [x] Access-list writes use atomic D1 batches where multiple records change.
- [ ] Audit remaining shared-state updates for races.
- [ ] Audit rate limiting per user and per IP.
- [x] Preserve bounded result counts and background refresh architecture.
- [ ] Audit cache TTLs and invalidation.
- [ ] Optimize engine N+1 and upstream latency after observability is complete.

### Phase F — quality and shipping

- [x] CI validates the Gmail access architecture and migration contract.
- [x] Gateway/auth typechecks run in CI.
- [x] Production health checks cover gateway/auth and retired payment routes.
- [x] Post-deploy release gate checks Gmail access markers and route boundaries.
- [ ] Add behavior tests for Free/Pro list transitions.
- [ ] Add browser E2E coverage for Gmail sign-in and live scan.
- [ ] Standardize structured JSON logs across Workers.
- [ ] Add centralized exception/error tracking.

## Acceptance criteria

- The demo renders correctly in a real browser.
- A verified Gmail account can sign in and receives Free access automatically.
- A Gmail address on the Pro access list receives Pro limits after sign-in or `/auth/me` refresh.
- A revoked Gmail address returns to Free access.
- Non-Gmail Google identities are rejected.
- Pro access cannot be granted by browser state or client-supplied tier values.
- Retired payment routes return 404.
- No active Worker, gateway route, deployment workflow, or UI depends on a payment provider.
- Live scans enforce server-side plan limits.
- Authentication and service-binding failures return safe errors with request IDs.
- A failed validation or health gate blocks release.
