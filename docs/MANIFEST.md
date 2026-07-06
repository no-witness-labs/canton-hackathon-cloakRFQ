# CloakRFQ Receipts — Package Manifest

Updated: 2026-07-06

## Completeness status

This repository now contains both the product/design documentation and the Daml ledger implementation for Phase 1 plus the first Phase 2 Private Quote workflow. It is no longer only a domain-discovery documentation bundle.

It contains:

- the current glossary (`CONTEXT.md`);
- the current consolidated project brief (`docs/CLOAKRFQ_PROJECT_BRIEF.md`), including the explicit Current workflow section;
- the product requirements document (`docs/CLOAKRFQ_PRD.md`);
- the hackathon track alignment note (`docs/HACKATHON_ALIGNMENT.md`), documenting that the submission track is Track 1: Private DeFi & Capital Markets;
- the hackathon roadmap (`docs/HACKATHON_ROADMAP.md`), documenting the compact completion plan for the MVP and submission package;
- the root agent instructions (`AGENTS.md`) and detailed agent workflow (`docs/AGENT_WORKFLOW.md`);
- the MVP implementation handoff spec (`docs/CLOAKRFQ_MVP_BUILD_SPEC.md`);
- the high-level, Phase 1, and Phase 2 technical design notes under `docs/technical-design/`;
- the accepted ADRs created so far (`docs/adr/0001` through `docs/adr/0012`);
- the Phase 1 and early Phase 2 Daml ledger packages under `ledger/`;
- a README describing the repository.

This repository is not complete as production implementation. The following implementation and design details are intentionally still open:

- hardening whether `RFQRequest` itself should become authority-signed or certificate-created rather than Seller-signatory only;
- production-grade payment/custody integration beyond CIP-56 allocation-backed quote evidence;
- quote-selection protocol details;
- exact API endpoints and frontend screen layouts;
- Debtor identity disclosure rules;
- post-settlement Funder exit model;
- post-MVP penalties, reputation, or Quote Bond design;
- production payment integration, if ever added.

## File inventory

| Path                                                                | Purpose                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| `README.md`                                                         | Describes the repository layout and current status.   |
| `AGENTS.md`                                                         | Canonical AI-agent operating instructions.            |
| `CONTEXT.md`                                                        | Glossary-only domain language.                        |
| `docs/CLOAKRFQ_PROJECT_BRIEF.md`                                    | Consolidated brief and decision summary.              |
| `docs/CLOAKRFQ_PRD.md`                                              | Product requirements document for the MVP workflow.   |
| `docs/HACKATHON_ALIGNMENT.md`                                       | Hackathon track alignment and submission positioning. |
| `docs/HACKATHON_ROADMAP.md`                                         | Compact roadmap for MVP and submission completion.    |
| `docs/AGENT_WORKFLOW.md`                                            | Detailed AI-agent branch, commit, and PR workflow.    |
| `docs/MANIFEST.md`                                                  | Completeness and inventory notes.                     |
| `docs/CLOAKRFQ_MVP_BUILD_SPEC.md`                                   | MVP implementation handoff spec.                      |
| `docs/technical-design/001-high-level-technical-design.md`           | High-level implementation-oriented technical design.  |
| `docs/technical-design/002-phase-1-origination-eligibility.md`       | Phase 1 ledger design and current implementation notes. |
| `docs/technical-design/003-phase-2-private-quoting-selection.md`      | Phase 2 Private Quote and CIP-56 allocation design notes. |
| `ledger/`                                                            | Daml multi-package ledger model and tests for Phase 1 and early Phase 2. |
| `docs/adr/0001-receivable-sale-rfq-mvp.md`                          | Receivable Sale instead of secured loan.              |
| `docs/adr/0002-maximum-practical-privacy-for-rfqs.md`               | Maximum Practical Privacy.                            |
| `docs/adr/0003-functionality-preserving-privacy.md`                 | Functionality-Preserving Privacy.                     |
| `docs/adr/0004-optional-debtor-notification.md`                     | Optional Debtor Notification.                         |
| `docs/adr/0005-require-funding-capacity-evidence-during-bidding.md` | Funding evidence during bidding; refined by ADR 0006. |
| `docs/adr/0006-proof-of-funds-as-bid-eligibility-evidence.md`       | Proof of Funds as eligibility evidence, not locking.  |
| `docs/adr/0007-controlled-funder-identity-disclosure.md`            | Controlled Funder identity disclosure.                |
| `docs/adr/0008-seller-controlled-fallback-queue.md`                 | Seller-controlled fallback.                           |
| `docs/adr/0009-binding-quotes-with-expiry.md`                       | Binding Quotes with Quote Expiry.                     |
| `docs/adr/0010-on-ledger-demo-settlement.md`                        | On-Ledger Demo Settlement.                            |
| `docs/adr/0011-scoped-compliance-receipts.md`                       | Scoped Compliance Receipts.                           |
| `docs/adr/0012-cip56-committed-allocations-for-private-quotes.md`    | CIP-56 committed allocation evidence for Private Quotes. |
