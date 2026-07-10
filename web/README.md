# CloakRFQ Receipts — Next.js demo

Frontend for **CloakRFQ Receipts**: a private, functionality-preserving RFQ
marketplace for **Receivable Sales** on Canton. The UI is **live-backed**: each
action submits a real Daml transaction to a Canton participant (local sandbox or
DevNet) and reads back per-party contract visibility. The wallet connector is a
simulated demo connector (no browser key-signing); authorization is handled
server-side per party. Its job is to make the full MVP workflow and its
multi-party selective-disclosure story understandable in a few minutes.

The UI is built to match the design prototype `CloakRFQ.dc.html` (the visual +
UX source of truth) and its `handoff/` spec.

## Run it

```bash
npm --prefix web install       # from the repository root; first run only
./scripts/reset-local-demo.sh  # reset and start Canton plus the web app
# open http://localhost:3000
```

`reset-local-demo.sh` intentionally creates a fresh local ledger and demo party
set. To run only the web process against an already-configured ledger, use
`npm --prefix web run dev`.

`npm run build && npm start` for a production build.

## What it shows

A single workspace for one Receivable Sale RFQ, viewed through a **role
switcher**. Flip between roles and the *same* RFQ renders only what that Canton
party is entitled to see, mirroring how Daml contract visibility would enforce
it for real:

- **Seller** — Receivable, Debtor (risk attestation), Disclosure Boundary, and
  the **Seller Quote View** with per-quote economics; select a Private Quote,
  settle, retry a failed settlement, or choose another still-valid quote.
- **Funder (A / B / C)** — own attestation-first Disclosure Package (raw debtor
  identity + invoice **redacted**), a live **Private Quote composer**, own
  outcome; competing quotes shown only as redaction bars.
- **Compliance** — eligibility attestations; quote prices not visible.
- **Risk Assessor** — risk attestations only, separate scoped role.
- **Coordinator** — workflow timeline; Private Quote contents sealed.
- **Auditor / Regulator** — the Scoped Compliance Receipt (after settlement) +
  the withheld-by-default list.
- **Outsider** — opaque archived contracts; what / who / how much all sealed.

**Wallet connector** (top bar): connect a party wallet to act on the RFQ. The
connected party **follows the selected role** (Seller → Northwind Components,
each Funder → its fund, Compliance → Meridian Compliance, etc.); **Outsider**
connects as a non-party **Observer** with no entitlements.

The full MVP flow is interactive: origination, certificate-backed RFQ requests,
Private Quote submission, quote review, settlement, and rollback-based failed
settlement handling. If settlement fails, the failed transaction does not create
settlement evidence; the Seller can retry or select another visible,
still-valid Private Quote.

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
                    demo scenario values
  types.ts          Domain model (copied from the design's handoff/types.ts)
  icons.tsx         SVG icon set
```

## Claim boundaries

This is a hackathon demo, not a production finance system. The CloakRFQ workflow
uses real Daml/Canton contracts and party-scoped ledger visibility. Demo scenario
values are example business data. Token funding and settlement are scoped to the
Canton demo environment and must not be described as production custody, escrow,
bank settlement, or guaranteed payment finality. The wallet connector signs
nothing in the browser.
