# CloakRFQ Receipts — Hackathon Roadmap

## Goal

Deliver one polished Canton/Daml MVP for **Track 1: Private DeFi & Capital Markets**.

The roadmap is intentionally compact. It exists to keep implementation focused on the documented MVP and avoid scope drift.

## Milestone 0 — Planning and alignment

**Status:** complete

- Repo and documentation structure exist.
- Hackathon track is fixed: Private DeFi & Capital Markets.
- PRD, project brief, MVP build spec, glossary, ADRs, and alignment docs are in place.
- MVP scope and non-goals are documented.

## Milestone 1 — Core Daml workflow

**Status:** complete

**Goal:** model the minimum Receivable Sale RFQ lifecycle.

**Deliverables:**

- represented `Receivable`
- Compliance and Risk attestations/certificates
- per-Funder `RFQRequest`
- allocation-backed `PrivateQuote`
- `ReceivableSaleSettlement` evidence
- pending transfer plus Funder `AcceptTransfer`
- rollback-based failed-settlement handling

**Done when:**

- Seller can create a Receivable and open a Blind RFQ.
- At least two Funders can submit Private Quotes.
- Seller can compare eligible, funding-backed Private Quotes after the deadline and choose one off-ledger.

## Milestone 2 — Privacy and party visibility

**Status:** complete

**Goal:** make Canton’s privacy value visible.

**Deliverables:**

- Seller view
- Funder view
- Coordinator view
- Auditor view
- Compliance and Risk attestation visibility

**Done when:**

- Funders cannot see each other’s Private Quotes.
- Coordinator does not see quote contents by default.
- The designated Auditor sees nothing before settlement and only scoped `ReceivableSaleSettlement` evidence afterward.

## Milestone 3 — Settlement and fallback

**Status:** complete

**Goal:** complete the business workflow.

**Deliverables:**

- DemoSettlementAsset
- On-Ledger Demo Settlement
- Quote Expiry
- atomic rollback with a visible ledger failure reason
- retry or selection of another still-valid Quote

**Done when:**

- Happy path settles the CIP-56-compatible demo payment and initiates the Receivable transfer in one transaction; the winning Funder accepts ownership afterward.
- A failed settlement transaction rolls back, leaving valid quotes available for retry or fallback selection.
- The product does not claim production payment finality, custody, legal assignment, or settlement guarantees.

## Milestone 4 — Frontend demo

**Status:** complete

**Goal:** make the workflow understandable in three minutes.

**Deliverables:**

- Seller dashboard
- Funder dashboard
- Coordinator status view
- Compliance / Risk view
- Auditor receipt view

**Done when:**

- A judge can see different parties viewing different data.
- The demo clearly shows why Canton privacy matters.

## Milestone 5 — Tests and claim boundaries

**Status:** complete

**Goal:** prove the MVP behavior and avoid overclaiming.

**Deliverables:**

- Happy-path tests
- Failure/fallback tests
- Party-visibility tests
- Quote-expiry tests
- Claim-boundary checks

**Done when:**

- Tests cover the documented happy path and fallback branch.
- UI/docs do not claim ZK proofs, cryptographic blind auction behavior, real settlement, production legal assignment, Funding Locks, or full anonymity.

## Milestone 6 — Submission package

**Status:** in progress — repository, live product, deck, and README complete; video recording remains.

**Goal:** finish the hackathon deliverables.

**Deliverables:**

- Public repository
- Live product link
- Presentation deck
- 3-minute pitch/demo video
- README with setup and demo instructions

**Done when:**

- The project can be submitted under Track 1: Private DeFi & Capital Markets.
- A reviewer can understand, run, and evaluate the Canton privacy demo quickly.
