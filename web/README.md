# CloakRFQ Receipts — Next.js demo

Frontend for **CloakRFQ Receipts**: a private, functionality-preserving RFQ
marketplace for **Receivable Sales** on Canton. The UI is **live-backed** — each
action submits a real Daml transaction to a Canton participant (a local sandbox
or DevNet) and reads back per-party contract visibility. The wallet connector is
a simulated demo (no browser key-signing); authorization is handled server-side
per party. Its job is to make the Phase 1 origination workflow and its
multi-party selective-disclosure story understandable in a few minutes.

The UI is built to match the design prototype `CloakRFQ.dc.html` (the visual +
UX source of truth) and its `handoff/` spec.

## Run it

```bash
cd web
npm install
npm run dev
# open http://localhost:3000
```

`npm run build && npm start` for a production build.

## What it shows

A single workspace for one Receivable Sale RFQ, viewed through a **role
switcher**. Flip between roles and the *same* RFQ renders only what that Canton
party is entitled to see, mirroring how Daml contract visibility would enforce
it for real:

- **Seller** — Receivable, Debtor (risk attestation), Disclosure Boundary, and
  the **Seller Quote View** with per-quote economics (net price, advance,
  reserve, all-in cost, effective rate); select the Best Compliant Quote,
  reorder the Seller-controlled fallback queue, settle, or simulate a Commitment
  Failure and promote a fallback.
- **Funder (A / B / C)** — own attestation-first Disclosure Package (raw debtor
  identity + invoice **redacted**), a live **Private Quote composer**, own
  outcome; competing quotes shown only as redaction bars.
- **Compliance** — eligibility attestations + Proof-of-Funds Gate (one funder
  fails → excluded); quote prices not visible.
- **Risk Assessor** — risk attestations only, separate scoped role.
- **Coordinator** — workflow timeline; Private Quote contents sealed.
- **Auditor / Regulator** — the Scoped Compliance Receipt (after settlement) +
  the withheld-by-default list.
- **Outsider** — opaque archived contracts; what / who / how much all sealed.

**Wallet connector** (top bar): connect a party wallet to act on the RFQ. The
connected party **follows the selected role** (Seller → Northwind Components,
each Funder → its fund, Compliance → Meridian Compliance, etc.); **Outsider**
connects as a non-party **Observer** with no entitlements.

Both documented MVP paths are interactive: the **happy path** (select → settle →
scoped receipt) and the **failure/fallback branch** (Commitment Failure →
promote fallback → settle). The original product angle — **disclosure is part of
the price** — is built into the data: the highest-priced quote also demands the
most disclosure, so the Best Compliant Quote is not simply the highest price.

## Structure

```
app/
  layout.tsx        Root layout → fonts (next/font) + <StoreProvider>
  globals.css       Dark institutional theme (ported from CloakRFQ.dc.html)
  page.tsx          Renders <Workspace/> (single-page app)
components/
  Workspace.tsx     Whole UI: top bar + wallet connector + role switcher +
                    Sees/Withheld legend + all 7 role views + toast
lib/
  store.tsx         State engine (RFQ lifecycle, per-role visibility, wallet) +
                    scenario data — ported from the prototype's DCLogic
  types.ts          Domain model (copied from the design's handoff/types.ts)
  icons.tsx         SVG icon set
```

## Claim boundaries

This is a UI prototype with **placeholder data**. It does **not** use Daml,
Canton, real settlement, real funds, or real proof-of-funds. "Demo Settlement
Asset" is non-production; the wallet connector signs nothing. The per-role
visibility rules in `lib/store.tsx` simulate the selective disclosure that a real
Canton deployment would enforce on-ledger via contract stakeholders — that
ledger layer is the next milestone, not part of this frontend.
