# CloakRFQ Receipts — Package Manifest

Generated: 2026-06-19

## Completeness status

This package is complete for the current domain-discovery and product-decision phase.

It contains:

- the current glossary (`CONTEXT.md`);
- the current consolidated project brief (`CLOAKRFQ_PROJECT_BRIEF.md`);
- the accepted ADRs created so far (`docs/adr/0001` through `docs/adr/0009`);
- a README describing the bundle.

This package is not complete as a build specification. The following are intentionally still open:

- exact Daml template and choice design;
- settlement model;
- exact Proof-of-Funds mechanism;
- quote-selection protocol details;
- Compliance Receipt contents;
- Debtor identity disclosure rules;
- post-settlement Funder exit model;
- post-MVP penalties, reputation, or Quote Bond design.

## File inventory

| Path | Purpose |
|---|---|
| `README.md` | Describes the documentation bundle. |
| `CONTEXT.md` | Glossary-only domain language. |
| `CLOAKRFQ_PROJECT_BRIEF.md` | Consolidated brief and decision summary. |
| `MANIFEST.md` | Completeness and inventory notes. |
| `docs/adr/0001-receivable-sale-rfq-mvp.md` | Receivable Sale instead of secured loan. |
| `docs/adr/0002-maximum-practical-privacy-for-rfqs.md` | Maximum Practical Privacy. |
| `docs/adr/0003-functionality-preserving-privacy.md` | Functionality-Preserving Privacy. |
| `docs/adr/0004-optional-debtor-notification.md` | Optional Debtor Notification. |
| `docs/adr/0005-require-funding-capacity-evidence-during-bidding.md` | Funding evidence during bidding; refined by ADR 0006. |
| `docs/adr/0006-proof-of-funds-as-bid-eligibility-evidence.md` | Proof of Funds as eligibility evidence, not locking. |
| `docs/adr/0007-controlled-funder-identity-disclosure.md` | Controlled Funder identity disclosure. |
| `docs/adr/0008-seller-controlled-fallback-queue.md` | Seller-controlled fallback. |
| `docs/adr/0009-binding-quotes-with-expiry.md` | Binding Quotes with Quote Expiry. |
