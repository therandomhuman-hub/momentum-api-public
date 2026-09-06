# Momentum API Quickstart

Momentum ranks GitHub repositories by developer activity, recency, community signals, popularity, and historical star growth.

## Browser dashboard

The public web experience uses **Sign in with Google**. Only verified `@gmail.com` accounts are accepted, and every accepted Gmail address receives the same unlimited Free access.

```text
https://therandomhuman-hub.github.io/momentum-api-public/
```

No payment account is required.

### Guided discovery

Use the guided controls for language/topic, minimum stars, activity window, sort order, and quick picks such as Fast movers and Rising stars. Results support Cards and Table views, with preview mode available before sign-in.

## Developer API

Developer integrations can use an issued API key. Store it outside source control.

### PowerShell

```powershell
$env:MOMENTUM_API_KEY = "mk_live_..."
```

### cURL

```bash
curl "https://momentum-api-public.manikandanruki2004.workers.dev/v1/momentum?language=python&min_stars=100&limit=20" \
  -H "X-API-Key: mk_live_..."
```

## Access contract

| Access | Monthly requests | Rate limit | Max results/request |
|---|---:|---:|---:|
| Verified Gmail | Unlimited | 10/min | 20 |

Unlimited applies to monthly usage. The 10 requests/minute customer limit remains as infrastructure and abuse protection.

## Parameters

| Parameter | Default | Production range |
|---|---:|---:|
| `language` | none | max 64 characters |
| `min_stars` | 100 | 0–1,000,000 |
| `max_age_days` | 3650 | 1–36,500 |
| `limit` | 20 | 1–20 |

## Errors

`401` means authentication is missing or invalid.

`403` means the browser identity is not an accepted verified Gmail address.

`429` means the per-minute customer rate limit was exceeded.

`502`/`503` indicates a GitHub or production service dependency failure.

## Security

Treat API keys, Google credentials, and browser session tokens as secrets. Never commit them, embed them in client-side source, or publish them in issues or screenshots. The active product has no payment-provider or paid-tier authorization logic.
