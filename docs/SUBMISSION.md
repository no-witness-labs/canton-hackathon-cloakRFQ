# CloakRFQ Receipts — Submission

Private invoice-financing **Receivable Sale RFQ** on Canton — Track 1: Private
DeFi & Capital Markets. Multi-party selective disclosure: different Canton
parties see different data.

## Links

| | |
| --- | --- |
| Repository | https://github.com/no-witness-labs/canton-hackathon-cloakRFQ |
| Live product | _TBD — see #17_ |
| Video pitch (3 min) | _TBD — see #19; script in `docs/VIDEO_SCRIPT.md`_ |
| Presentation deck | _TBD — see #18; outline in `docs/DECK_OUTLINE.md`_ |

## What it is

A Seller offers a receivable; Funders submit proof-backed **Private Quotes**;
the Seller selects the **Best Compliant Quote** (price *and* recourse,
settlement, debtor-notification, required-disclosure — "disclosure is part of
the price"); settlement is demonstrated **on-ledger**; an Auditor receives a
**Scoped Compliance Receipt** — without anyone seeing the full marketplace.

The brief and our positioning are in [`HACKATHON_ALIGNMENT.md`](HACKATHON_ALIGNMENT.md);
the product detail in [`CLOAKRFQ_PRD.md`](CLOAKRFQ_PRD.md).

## Run the UI (mocked, no backend needed)

```bash
cd web
npm install
npm run dev    # http://localhost:3000
```

Flip the **role switcher** across the seven Canton parties (Seller, Funder
A/B/C, Compliance, Risk, Coordinator, Auditor, Outsider). As Seller, select the
Best Compliant Quote and settle — or simulate a Commitment Failure and promote a
fallback. Switch to Auditor for the Scoped Compliance Receipt; to Outsider to
see that a non-party sees nothing.

## Run the ledger (Canton sandbox)

See [`RUNBOOK.md`](RUNBOOK.md) — `./scripts/start-sandbox.sh` brings up Canton +
the JSON Ledger API and allocates the demo parties.

## Claim boundaries

This is a demo. It does **not** use ZK proofs, production payment finality,
custody, real bank/stablecoin/Canton Coin settlement, production legal
assignment, Funding Locks, or escrow. Settlement uses a non-production **Demo
Settlement Asset**; Proof-of-Funds is **bid-eligibility evidence only**. See
[`CLAIM_BOUNDARY_REVIEW.md`](CLAIM_BOUNDARY_REVIEW.md).
