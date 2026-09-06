# Account & Usage API

The authenticated account endpoint lets a customer inspect the current plan and API usage without exposing the full API credential.

## Browser account

Browser users sign in with a verified Gmail account through Google. The effective plan is determined server-side:

- Free: any verified `@gmail.com` address not present in the Pro access list.
- Pro: a verified `@gmail.com` address present in the Pro access list.

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

The endpoint returns account/plan/usage information and never returns the full API key.

## Pro access administration

Pro access is controlled by Gmail address, not payment status.

```http
POST /admin/pro/grant
POST /admin/pro/revoke
```

Both endpoints require the server-side `X-Admin-Secret` and a JSON body containing a valid `@gmail.com` address.

A grant places the address in the Pro list and removes it from the Free list. A revoke does the opposite. The browser's `/auth/me` path rechecks the current Pro list, so access changes take effect without payment callbacks.

## Storage

The active access model uses two separate tables:

```text
google_free_accounts(email PRIMARY KEY)
google_pro_accounts(email PRIMARY KEY)
```

Operational customer/session/usage records remain in D1 because the engine needs them for quotas, rate limits, and usage tracking.
