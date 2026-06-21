# CloakRFQ Receipts — Package Manifest

Generated: 2026-06-20

## Completeness status

This package is complete for the current domain-discovery and product-decision phase.

It contains:

- the current glossary (`CONTEXT.md`);
- the current consolidated project brief (`docs/CLOAKRFQ_PROJECT_BRIEF.md`), including the explicit Current workflow section;
- the product requirements document (`docs/CLOAKRFQ_PRD.md`);
- the hackathon track alignment note (`docs/HACKATHON_ALIGNMENT.md`), documenting that the submission track is Track 1: Private DeFi & Capital Markets;
- the hackathon roadmap (`docs/HACKATHON_ROADMAP.md`), documenting the compact completion plan for the MVP and submission package;
- the MVP implementation handoff spec (`docs/CLOAKRFQ_MVP_BUILD_SPEC.md`);
- the accepted ADRs created so far (`docs/adr/0001` through `docs/adr/0011`);
- a README describing the bundle.

This package is not complete as production implementation. The following implementation and design details are intentionally still open:

- exact Daml template and choice design;
- exact Proof-of-Funds mechanism;
- quote-selection protocol details;
- Debtor identity disclosure rules;
- post-settlement Funder exit model;
- post-MVP penalties, reputation, or Quote Bond design;
- production payment integration, if ever added.

## File inventory

| Path                                                                | Purpose                                               |
| ------------------------------------------------------------------- | ----------------------------------------------------- |
| `README.md`                                                         | Describes the documentation bundle.                   |
| `CONTEXT.md`                                                        | Glossary-only domain language.                        |
| `docs/CLOAKRFQ_PROJECT_BRIEF.md`                                    | Consolidated brief and decision summary.              |
| `docs/CLOAKRFQ_PRD.md`                                              | Product requirements document for the MVP workflow.   |
| `docs/HACKATHON_ALIGNMENT.md`                                       | Hackathon track alignment and submission positioning. |
| `docs/HACKATHON_ROADMAP.md`                                         | Compact roadmap for MVP and submission completion.    |
| `docs/MANIFEST.md`                                                  | Completeness and inventory notes.                     |
| `docs/CLOAKRFQ_MVP_BUILD_SPEC.md`                                   | MVP implementation handoff spec.                      |
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
