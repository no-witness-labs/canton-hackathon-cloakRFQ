# Deploy — public live URL

The submission needs a public "Link to live product". The `web/` app is a
static-friendly Next.js app with **mocked data** (no backend), so it deploys as
a plain Next.js project.

## Vercel (recommended)

1. Import the repo at vercel.com → **New Project**.
2. Set **Root Directory = `web/`** (the Next app lives in a subfolder; this is a
   dashboard setting, not in `vercel.json`).
3. Framework preset auto-detects **Next.js** (see `web/vercel.json`). Build
   command `next build`, output handled by the preset.
4. Deploy → copy the public URL into `docs/SUBMISSION.md` and the README.

Every push to `main` redeploys; PRs get preview URLs.

## Notes

- No env vars needed today (mock data). When the ledger integration lands (#21),
  add the JSON API URL / party config as environment variables.
- The deploy itself (connecting Vercel, getting the URL) is a one-time dashboard
  step — this PR provides the config + instructions; finish it to close #17.
