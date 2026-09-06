# Momentum — Product and Delivery Plan

## Product contract

Momentum is a free GitHub momentum intelligence service for verified Gmail users.

- Access: verified `@gmail.com` only.
- Monthly usage: unlimited.
- Per-customer rate limit: 10 requests/minute.
- Scan size: up to 20 repositories.
- Payment system: none.

## Core experience

`Open dashboard -> preview or Google sign-in -> choose filters -> live scan -> Cards/Table results`

## Architecture decisions

1. Keep the GitHub Pages dashboard static and secret-free.
2. Keep gateway, authentication, and ranking responsibilities separate.
3. Use D1 for customer/session/access state and KV for edge cache/rate-limit state.
4. Use opaque browser sessions stored server-side as hashes.
5. Keep only one active Gmail Free access path; no paid-tier authorization.
6. Validate request boundaries before domain logic.
7. Bound all external calls with timeouts.
8. Keep monthly usage unlimited while retaining per-minute abuse protection.
9. Cap each scan at 20 repositories for response size and latency control.
10. Preserve migration history and use forward migrations for production corrections.

## Quality gates

- CI contract checks pass.
- Gateway and auth typechecks pass.
- Browser smoke tests pass.
- D1 migration contract passes.
- Production health endpoint reports healthy bindings.
- Production version reports the Gmail-only unlimited 20-result contract.
- Anonymous protected routes return safe 401 responses with request IDs.
- Invalid query parameters are rejected at the gateway.

## Improvement backlog

- Add authenticated Gmail sign-in E2E with a dedicated test account.
- Add structured request latency/error metrics for the engine.
- Audit cache TTLs and invalidation.
- Optimize GitHub API batching and N+1 calls after observability is available.
- Add accessibility checks for the static dashboard.
