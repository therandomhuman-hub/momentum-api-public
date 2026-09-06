# Momentum Release Readiness

This document is the final pre-production verification procedure for the standalone Gmail access model.

## Required sequence

1. `Momentum CI` passes.
2. `Momentum Browser E2E` passes.
3. Production stack deploy completes.
4. `Production Health Checks` confirms gateway, auth, security headers, and protected boundaries.
5. Sign in with a dedicated verified Gmail account from the real browser.
6. Confirm an unlisted Gmail account receives Free access.
7. Grant Pro to a controlled Gmail address through the server-side admin endpoint.
8. Confirm `/auth/me` resolves that Gmail address to Pro.
9. Revoke Pro and confirm the same address returns to Free.
10. Record request IDs for any failure without recording session tokens or admin secrets.

## Release-stop conditions

Stop the release when any of the following occurs:

- a CI or browser test fails;
- a service binding health check fails;
- a non-Gmail identity can obtain browser access;
- an unlisted Gmail address can obtain Pro access;
- a client-supplied tier can override the server-side access list;
- a Gmail address can remain in both Free and Pro lists;
- a Pro grant/revoke changes state non-atomically;
- a retired payment route is still exposed;
- the production release gate cannot verify the deployed version and Gmail access mode.

## Manual browser acceptance

Use a dedicated test Gmail account. No payment credentials or payment-provider interaction is part of the acceptance path.

Expected browser path:

`sign in -> verify Gmail -> Free/Pro resolution -> run live scan -> sign out -> sign in again -> current tier reflected`

Expected Pro administration path:

`admin grant Gmail -> customer refreshes auth state -> Pro active -> admin revoke Gmail -> customer refreshes auth state -> Free active`

## Evidence to retain

Record the deployed commit SHA, workflow run URLs, browser-test result, and request IDs. Do not record Google ID tokens, session tokens, API keys, admin secrets, or other credentials.
