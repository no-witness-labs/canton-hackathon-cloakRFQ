# Deploy CloakRFQ to Vercel (self-service, live on DevNet)

Goal: a public URL where **anyone can open it and run their own isolated deal on Canton
DevNet** — no local setup, no `bootstrap-devnet.py`. This deploys the [self-service
(Level 1)](./DEVNET.md#self-service-deploy-level-1) mode.

## Prerequisites
- The repo on GitHub (it is).
- The DAR **uploaded once** to the DevNet participant (already done; any `bootstrap-devnet.py`
  run does it). The deploy does **not** upload the DAR at runtime.
- The Seaport `client_secret` (paste it into Vercel privately — never commit it).

## 1. Import the project
Vercel → **Add New… → Project** → import the GitHub repo. Then in the project settings:
- **Root Directory:** `web`  ← important (the Next.js app lives in `web/`, not the repo root)
- **Framework Preset:** Next.js (auto-detected)
- Build/Output: defaults are fine.

## 2. Environment variables
Project → **Settings → Environment Variables** — add all of these (Production + Preview):

| Key | Value |
|---|---|
| `CLOAKRFQ_LEDGER_TARGET` | `https://ledger-api.validator.devnet.sandbox.fivenorth.io` |
| `CLOAKRFQ_OIDC_TOKEN_URL` | `https://auth.sandbox.fivenorth.io/application/o/token/` |
| `CLOAKRFQ_OIDC_CLIENT_ID` | `validator-devnet-m2m` |
| `CLOAKRFQ_OIDC_CLIENT_SECRET` | *(the shared secret — paste here, don't commit)* |
| `CLOAKRFQ_OIDC_AUDIENCE` | `validator-devnet-m2m` |
| `CLOAKRFQ_OIDC_SCOPE` | `daml_ledger_api` |
| `CLOAKRFQ_SESSION_PROVISIONING` | `1` |
| `CLOAKRFQ_LEDGER_USER_ID` | `6` |
| `CLOAKRFQ_PARTY_NAMESPACE` | `1220a14ca128063b8dc9d1ebb0bd22633be9f2168500f4dbc1ecaeb1855b14e5acf8` |

These are read **server-side only** (the `/v2` proxy and `/api/session` route). The browser
never sees the secret.

## 3. Deploy & verify
Deploy. Open the URL:
- First load shows *"Setting up your Canton ledger session…"* (~3s) then a clean origination.
- Build a deal; each action is a real DevNet transaction (`/activity` proves it).
- **"↻ New deal"** starts a fresh isolated deal. Open an incognito window to confirm two
  visitors are independent.

## Notes & gotchas
- **Function timeout.** `/api/session` does ~9 sequential DevNet allocations (~3–5s). We set
  `maxDuration = 30` (honored on **Vercel Pro**). On the **Hobby** plan functions cap at
  **10s** — usually fine, but if DevNet is slow a first load could time out; retry, or upgrade.
- **Cold starts.** Serverless instances are ephemeral, so the in-memory token + session cache
  reset occasionally → a few extra token exchanges and one re-provision. Harmless (idempotent).
- **It's a public write endpoint.** `/api/session` allocates parties on the shared validator.
  It has a crude per-instance guard only — **add real rate-limiting** (e.g. Vercel KV + a token
  bucket, or Vercel’s built-in rate limiting) before sharing widely, or you can get spammed.
- **Region.** Optional: set the function region near the validator for lower latency.
- **To deploy the single-shared-deal version instead** (not self-service), omit
  `CLOAKRFQ_SESSION_PROVISIONING` and commit a `web/public/ledger-config.json` from
  `bootstrap-devnet.py`.
