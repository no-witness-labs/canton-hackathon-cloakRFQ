# CloakRFQ Receipts — Submission

Private invoice-financing **Receivable Sale RFQ** on Canton — Track 1: Private
DeFi & Capital Markets. Invited Funders compete through funding-backed Private
Quotes while Canton restricts each party to its entitled workflow records.

## Links

| | |
| --- | --- |
| Repository | https://github.com/no-witness-labs/canton-hackathon-cloakRFQ |
| Live product | https://canton-hackathon-cloak-6v1qrvvgn-dappwebsites-projects.vercel.app |
| Video pitch (3 min) | [`video/cloakrfq-hackathon-demo.mp4`](../video/cloakrfq-hackathon-demo.mp4) (2:59; script in [`VIDEO_SCRIPT.md`](VIDEO_SCRIPT.md)) |
| Presentation deck | [`docs/pitch/cloakrfq-pitch.pdf`](pitch/cloakrfq-pitch.pdf) |

## What it is

A Seller offers a represented Receivable through one private request per invited
Funder. Funders submit **Private Quotes** backed by committed CIP-56 demo
allocations without seeing competitors. The Seller compares eligible offers across
Net Purchase Price, recourse, Debtor-notification requirements, and validity,
then demonstrates on-ledger payment settlement and Receivable transfer. An
Auditor receives scoped `ReceivableSaleSettlement` evidence rather
than the private RFQ or quote book.

The brief and our positioning are in [`HACKATHON_ALIGNMENT.md`](HACKATHON_ALIGNMENT.md);
the product detail in [`CLOAKRFQ_PRD.md`](CLOAKRFQ_PRD.md).

## Run the local demo

```bash
npm --prefix web install       # first run only
./scripts/reset-local-demo.sh  # fresh ledger, demo parties, and UI
# open http://localhost:3000
```

Use the **seven role views**: Seller, grouped Funder A/B/C, Compliance, Risk Assessor, Coordinator, Auditor, and Outsider. Register the Receivable, issue scoped attestations, open one private request per Funder, submit funding-backed Private Quotes, compare eligible offers after the deadline, settle, and complete the winning Funder's ownership acceptance. The Auditor receives scoped settlement evidence; the Outsider sees nothing.

## Component-level operation

See [`RUNBOOK.md`](RUNBOOK.md) for ledger-only startup, manual UI startup, and
troubleshooting.

## Claim boundaries

This is a demo. It does **not** use ZK proofs, production payment finality,
production custody, real bank settlement, production legal assignment, escrow,
or guaranteed settlement. Token funding and settlement are scoped to the Canton
demo environment and must not be described as bank settlement or production
custody. See [`CLAIM_BOUNDARY_REVIEW.md`](CLAIM_BOUNDARY_REVIEW.md).
