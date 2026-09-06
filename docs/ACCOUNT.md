# Account & Usage API

The authenticated account endpoint lets a customer inspect the current Free access and usage state without exposing a full API credential.

## Browser account

Browser users sign in with Google. Only verified `@gmail.com` identities are accepted, and every accepted Gmail address receives the same Unlimited Free access.

There is no Pro tier and no paid upgrade path.

Browser sessions are opaque `mk_session_*` tokens. The authentication Worker stores only an HMAC hash in D1.

## Developer API account

Developer integrations can use an issued API key:

```http
GET /v1/me
X-API-Key: mk_live_...
```

`Authorization: Bearer mk_live_...` is also accepted.

The endpoint returns account, rate-limit, maximum-result, and usage telemetry without returning the full API key.

## Usage contract

```text
Monthly usage: unlimited
Per-customer rate limit: 10 requests/minute
Maximum results per momentum scan: 20
```

Usage telemetry remains enabled for operational reporting even though monthly quota enforcement is disabled.

## Storage

Verified Gmail identities are tracked in:

```text
google_free_accounts(email PRIMARY KEY)
```

Operational customer, session, rate-limit, usage, and repository-intelligence records remain in D1.

Legacy payment schema is retired through forward migrations; historical migration files remain immutable database history.
