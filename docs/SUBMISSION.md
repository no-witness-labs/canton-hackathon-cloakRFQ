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

## Run the local demo

```bash
npm --prefix web install       # first run only
./scripts/reset-local-demo.sh  # fresh ledger, demo parties, and UI
# open http://localhost:3000
```

Flip the **role switcher** across the seven Canton parties (Seller, Funder
A/B/C, Compliance, Risk, Coordinator, Auditor, Outsider). As Seller, create the
RFQ, review visible Private Quotes, settle, retry a failed settlement, or select
another still-valid quote. Switch to Auditor for final settlement evidence; to
Outsider to see that a non-party sees nothing.

## Component-level operation

See [`RUNBOOK.md`](RUNBOOK.md) for ledger-only startup, manual UI startup, and
troubleshooting.

## Claim boundaries

This is a demo. It does **not** use ZK proofs, production payment finality,
production custody, real bank settlement, production legal assignment, escrow,
or guaranteed settlement. Token funding and settlement are scoped to the Canton
demo environment and must not be described as bank settlement or production
custody. See [`CLAIM_BOUNDARY_REVIEW.md`](CLAIM_BOUNDARY_REVIEW.md).
