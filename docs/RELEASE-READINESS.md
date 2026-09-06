# Momentum Release Readiness

This is the final acceptance procedure for the standalone Gmail-only product.

## Automated gates

1. `Momentum CI` passes.
2. `Momentum Browser E2E` passes.
3. The production stack deployment completes.
4. `Production Health Checks` reports healthy gateway/auth bindings and expected security headers.
5. `Production Release Gate` verifies the deployed version and public product contract.

## Production contract

The deployed service must report:

```text
verified @gmail.com access only
unlimited monthly usage
10 requests/minute per customer
maximum 20 repositories per scan
no paid tier or payment provider
```

## Manual browser acceptance

Use a dedicated verified Gmail test account.

`open dashboard -> preview -> sign in with Google -> account resolves to Free -> run live scan -> inspect results -> switch Cards/Table -> change filters -> run again -> sign out -> sign in again`

Confirm that a non-Gmail account cannot obtain browser access.

Confirm `limit=20` is accepted and `limit=21` is rejected by the gateway.

Confirm anonymous protected requests receive `401` with a request ID.

## Release-stop conditions

Stop the release if any CI, E2E, migration, binding health, security-header, authentication, contract, or live-browser check fails; if non-Gmail access is granted; if monthly quota enforcement is accidentally enabled; if more than 20 results can be requested; if protected engine requests can bypass the gateway secret; or if a retired payment route is exposed.

## Evidence

Retain the deployed commit SHA, workflow run URLs, browser-test result, and request IDs for failures. Never retain Google ID tokens, browser session tokens, API keys, admin secrets, or other credentials.
