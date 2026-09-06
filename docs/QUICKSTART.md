# Momentum API Quickstart

Momentum ranks GitHub repositories by developer activity, recency, community signals, popularity, and historical star growth.

## 1. Browser dashboard

The public web experience uses **Sign in with Google**. Only verified `@gmail.com` accounts are accepted, and every verified Gmail address receives the same Free access.

```text
https://therandomhuman-hub.github.io/momentum-api-public/
```

No payment account is required.

### Guided discovery

The dashboard replaces free-form query writing with controls for:

- topic/language;
- minimum stars;
- activity window;
- sort order;
- quick picks such as Fast movers and Rising stars.

Results can be switched between Cards, Table, and Insights views.

## 2. Developer API

Developer integrations can still use issued API keys. Store the key as an environment variable and never commit it.

### PowerShell

```powershell
$env:MOMENTUM_API_KEY = "mk_live_..."
```

### cURL

```bash
curl "https://momentum-api-public.manikandanruki2004.workers.dev/v1/momentum?language=python&min_stars=100&limit=10" \
  -H "X-API-Key: mk_live_..."
```

## 3. Python SDK

```bash
pip install httpx
```

```python
from sdk.python import MomentumClient

client = MomentumClient(api_key="mk_live_...")
result = client.momentum(language="python", min_stars=100, limit=10)

for repo in result["data"]:
    print(repo["repository"], repo["momentum_score"])
```

## 4. JavaScript / TypeScript SDK

```javascript
import { MomentumClient } from "./sdk/javascript/index.js";

const client = new MomentumClient({ apiKey: process.env.MOMENTUM_API_KEY });
const result = await client.momentum({ language: "python", minStars: 100, limit: 10 });
console.log(result.data);
```

## 5. Access

| Access | Monthly requests | Rate limit | Max results/request |
|---|---:|---:|---:|
| Free | 100 | 10/min | 10 |

There is no Pro tier and no paid upgrade path.

## Parameters

| Parameter | Default | Production range |
|---|---:|---:|
| `language` | none | max 64 characters |
| `min_stars` | 100 | 0–1,000,000 |
| `max_age_days` | 3650 | 1–36,500 |
| `limit` | 10 | 1–10 |

## Errors

`401` means authentication is missing or invalid.

`403` means the browser account is not an accepted Gmail identity.

`429` means the per-minute rate limit or monthly quota was exceeded.

`502`/`503` indicates a service or GitHub dependency failure.

## Security

Treat API keys, Google credentials, and session tokens as secrets. Do not commit them to Git, put them in client-side JavaScript, or paste them into screenshots or public issues. The active product has no payment-provider or paid-tier access logic.
