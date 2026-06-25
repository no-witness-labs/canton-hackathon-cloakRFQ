# CloakRFQ — Next.js

Privacy-preserving RFQ settlement on Canton Network. This is the
**Next.js (App Router + TypeScript)** port of the HTML prototype in the
parent folder — same Meridian institutional theme, same four surfaces,
the wallet/RFQ logic rebuilt as React client components.

## Run it

```bash
cd cloakrfq-next
npm install
npm run dev
# open http://localhost:3000
```

`npm run build && npm start` for a production build.

## Structure

```
app/
  layout.tsx        Root layout → <Providers> (wallet + toasts + modal) wrapping <Shell>
  globals.css       Full design system (ported from the prototype's css/app.css + per-page styles)
  page.tsx          /           Overview / launcher (server component)
  trade/page.tsx    /trade      Cloaked RFQ ticket + live competing quotes + settlement
  maker/page.tsx    /maker      Incoming RFQs, quoting, inventory, fills
  portfolio/page.tsx /portfolio Connect gate, balances, settlement history, privacy
components/
  Providers.tsx     'use client' — wallet context (localStorage-persisted), toasts, connect modal,
                    requireWallet(cb) gate that resumes the pending action after connect
  Shell.tsx         'use client' — sidebar nav, per-route topbar, mobile bottom nav (active via usePathname)
lib/
  icons.tsx         Monoline SVG icon set as a typed <Icon name=… /> component
  format.ts         number / USD formatting + deterministic jitter (no Math.random in render → no hydration drift)
```

## Notes for production

This is a faithful UI port — all data is mocked client-side. To make it
real you'd swap the in-component fixtures for:

- a Canton wallet adapter in `Providers.tsx` (replace the localStorage stub),
- RFQ broadcast / quote subscription calls in `app/trade` and `app/maker`
  (today these are `setTimeout`-driven simulations),
- server actions or a ledger API layer for balances and settlement history.

The component boundaries (`requireWallet`, the quote stream state machine,
the maker quote→win/pass flow) are where those integrations slot in.
