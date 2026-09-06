# Account & Usage API

The authenticated account endpoint lets a customer inspect the current Free access and API usage without exposing the full API credential.

## Browser account

Browser users sign in with a verified Gmail account through Google. Every accepted `@gmail.com` address receives the same Free access automatically.

There is no Pro tier and no paid upgrade path.

The browser session is issued by the authentication Worker and stored hashed in D1.

## Developer API account

Developer integrations can use an API key with the existing engine account model.

```http
GET /v1/me
```

Authentication:

```http
X-API-Key: mk_live_...
```

`Authorization: Bearer mk_live_...` is also accepted.

## Example

```bash
curl https://momentum-api-public.manikandanruki2004.workers.dev/v1/me \
  -H "X-API-Key: mk_live_..."
```

The endpoint returns account/usage information and never returns the full API key.

## Storage

The active Gmail access model uses one dedicated table:

```text
google_free_accounts(email PRIMARY KEY)
```

Operational customer/session/usage records remain in D1 because the engine needs them for quotas, rate limits, and usage tracking.

Legacy Pro and payment state is retired through forward migrations; historical migration files remain immutable database history.
