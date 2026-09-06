# Momentum API — Build Rules

This repository follows a plan-first, test-first Vibe Engineering workflow. Do not make ad-hoc production edits when a design or contract decision is missing.

## Plan
- Write or update the feature spec before changing implementation.
- Define the smallest useful slice first; defer non-critical features.
- For authentication, access-control changes, data migrations, and API contracts, document edge cases before coding.

## Structure
- Keep UI, gateway, domain logic, persistence, and integrations separated.
- Prefer small modules with one responsibility. Split files before they become difficult to review.
- The public Worker is a gateway, not the source of truth for engine or authentication business rules.
- The authentication Worker owns Gmail access-list authorization; the private engine owns ranking, quotas, and usage.

## Dependencies
- Pin direct dependency versions.
- Add and maintain lockfiles for install reproducibility before relying on transitive dependencies.
- Do not introduce a package solely to solve a small problem that can be handled by platform APIs.

## Configuration and secrets
- Keep configuration outside source code and validate it at startup/use boundaries.
- Never commit API keys, OAuth secrets, database credentials, admin credentials, or tokens.
- Never print raw secrets or credentials in logs. Redact sensitive values in diagnostic output.

## AI-assisted development
- Treat this file as the durable architecture contract for AI coding sessions.
- Save major decisions and known invariants under `docs/` so future sessions can recover context.
- Reusable procedures belong in `skills/` and should include inputs, steps, safety checks, and verification.

## Data
- JSON is the API boundary format; validate external responses before consuming them.
- Keep one source of truth for each fact and link tables by identifiers instead of duplicating mutable fields.
- Database changes use ordered migrations only.
- Multi-step state changes must be atomic where partial success could corrupt business state.
- Index frequent lookup paths; avoid N+1 query patterns.
- Gmail access lists are the source of truth for browser Free/Pro authorization.
- Free and Pro Gmail addresses are stored in separate tables.

## Security
- HTTPS-only production traffic with secure headers and secure session handling.
- Validate every input at the boundary.
- Escape output that reaches HTML.
- Use an allowlist for CORS origins.
- Treat user-supplied URLs as hostile; block private/internal destinations and unsafe schemes if server-side fetching is added.
- Authentication answers who the caller is; authorization separately checks what they can do and what records they can access.
- Only verified `@gmail.com` Google identities are accepted by the browser authentication path.
- Pro access is granted only when the normalized Gmail address exists in the server-side Pro access list.
- Apply abuse protection to authentication and public endpoints.

## Reliability
- Every outbound network call has a bounded timeout.
- Retry only safe/idempotent operations, with exponential backoff.
- Add circuit breaking around dependencies that can repeatedly fail and consume worker time.
- User-visible errors are calm and safe; detailed context goes to structured logs/error tracking.
- Make retryable mutations idempotent.
- Protect shared state from races with atomic database operations or transactions.

## Performance
- Move slow, non-user-critical work to background jobs.
- Cache repeated expensive reads with explicit TTL/invalidation rules.
- Rate-limit by authenticated user and, where appropriate, client IP.
- Use bounded pagination; prefer cursor pagination for changing datasets where appropriate.

## Observability
- Every request carries a request ID.
- Logs are structured JSON and include request context and safe user context.
- Production exceptions are centrally trackable without exposing implementation details to customers.

## Shipping
- Critical paths need unit and integration tests.
- Browser-visible flows need Playwright end-to-end coverage.
- CI must build/test before deploy; failed validation blocks shipping.
- Production deployment must have health checks for every service binding and critical dependency.

## Access control
- There is no payment-provider integration in the active product.
- Any verified Gmail account receives Free access automatically.
- Pro is an explicit server-side allowlist decision keyed by normalized Gmail address.
- The owner can grant or revoke Pro through authenticated administrative endpoints.
- Access changes must never be accepted from the browser as authority.

## Verification rule
For every meaningful change, verify the actual user flow when possible. A green unit test is not enough when the browser or service bindings are involved.
