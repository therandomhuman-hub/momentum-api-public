# Momentum API Quickstart

Momentum ranks GitHub repositories by developer activity, recency, community signals, popularity, and historical star growth.

## 1. Browser access

The public web experience uses **Sign in with Google**.

Only verified `@gmail.com` accounts are accepted. Every verified Gmail address receives Free access automatically unless the normalized address is present in the server-side Pro access list.

```text
https://therandomhuman-hub.github.io/momentum-api-public/
```

No payment account is required.

## 2. Pro access administration

The owner manages Pro access using the server-side admin API. Never put the admin secret in a browser, frontend, SDK, or public repository.

Grant:

```http
POST /admin/pro/grant
X-Admin-Secret: <server-side secret>
Content-Type: application/json

{"email":"user@gmail.com"}
```

Revoke:

```http
POST /admin/pro/revoke
X-Admin-Secret: <server-side secret>
Content-Type: application/json

{"email":"user@gmail.com"}
```

Access addresses are kept in separate D1 lists:

```text
google_free_accounts
  email PRIMARY KEY

google_pro_accounts
  email PRIMARY KEY
```

## 3. Developer API

Developer integrations can still use issued API keys. Store the key as an environment variable and never commit it.

### PowerShell

```powershell
$env:MOMENTUM_API_KEY = "mk_live_..."
```

### cURL

```bash
curl "https://momentum-api-public.manikandanruki2004.workers.dev/v1/momentum?language=python&min_stars=100&limit=5" \
  -H "X-API-Key: mk_live_..."
```

## 4. Python SDK

```bash
pip install httpx
```

```python
from sdk.python import MomentumClient

client = MomentumClient(api_key="mk_live_...")
result = client.momentum(language="python", min_stars=100, limit=5)

for repo in result["data"]:
    print(repo["repository"], repo["momentum_score"])
```

## 5. JavaScript / TypeScript SDK

```javascript
import { MomentumClient } from "./sdk/javascript/index.js";

const client = new MomentumClient({ apiKey: process.env.MOMENTUM_API_KEY });
const result = await client.momentum({ language: "python", minStars: 100, limit: 5 });
console.log(result.data);
```

## Plans

| Tier | Monthly requests | Rate limit | Max results/request |
|---|---:|---:|---:|
| Free | 100 | 10/min | 10 |
| Pro | 10,000 | 60/min | 25 |

## Parameters

| Parameter | Default | Production range |
|---|---:|---:|
| `language` | none | GitHub language name |
| `min_stars` | 100 | 0–1,000,000 |
| `max_age_days` | 3650 | 1–36,500 |
| `limit` | 5 | 1–20 |

## Errors

`401` means authentication is missing or invalid.

`403` means the browser account is not an accepted Gmail identity or an administrative action is not authorized.

`429` means the per-minute rate limit or monthly quota was exceeded.

`502`/`503` indicates a service or GitHub dependency failure.

## Security

Treat API keys, Google credentials, session tokens, and admin secrets as secrets. Do not commit them to Git, put them in client-side JavaScript, or paste them into screenshots or public issues. The active browser access model does not use a payment provider.
