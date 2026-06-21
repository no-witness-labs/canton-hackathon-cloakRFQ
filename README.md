# CloakRFQ Receipts Markdown Documentation

This bundle contains the current planning documentation for CloakRFQ Receipts.

## Files

- `CONTEXT.md` — glossary of canonical domain terms. This is not a spec or scratchpad.
- `docs/CLOAKRFQ_PROJECT_BRIEF.md` — consolidated product brief, resolved decisions, explicit Current workflow, privacy posture, non-goals, and open questions.
- `docs/MANIFEST.md` — package completeness notes and file inventory.
- `docs/CLOAKRFQ_MVP_BUILD_SPEC.md` — implementation handoff spec for the MVP.
- `docs/adr/0001-receivable-sale-rfq-mvp.md` — model the MVP as a Receivable Sale, not a secured loan.
- `docs/adr/0002-maximum-practical-privacy-for-rfqs.md` — target Maximum Practical Privacy for RFQs.
- `docs/adr/0003-functionality-preserving-privacy.md` — preserve real-world RFQ functionality before optimizing privacy.
- `docs/adr/0004-optional-debtor-notification.md` — make Debtor Notification optional and disclosure-controlled.
- `docs/adr/0005-require-funding-capacity-evidence-during-bidding.md` — require funding-capacity evidence during bidding; refined by ADR 0006.
- `docs/adr/0006-proof-of-funds-as-bid-eligibility-evidence.md` — require Proof of Funds as bid eligibility evidence, not a Funding Lock.
- `docs/adr/0007-controlled-funder-identity-disclosure.md` — control Funder identity disclosure timing.
- `docs/adr/0008-seller-controlled-fallback-queue.md` — use a Seller-Controlled Fallback Queue.
- `docs/adr/0009-binding-quotes-with-expiry.md` — use Binding Quotes with Quote Expiry for the MVP.
- `docs/adr/0010-on-ledger-demo-settlement.md` — use On-Ledger Demo Settlement for the MVP.
- `docs/adr/0011-scoped-compliance-receipts.md` — use Scoped Compliance Receipts for audit and regulatory disclosure.

## Status

Complete for current discovery/grilling phase as of 2026-06-20.

Ready to proceed to implementation design.

Not complete as production implementation. Exact Daml templates/choices, quote-selection protocol details, and exact Proof-of-Funds mechanism remain open.

Settlement product decision is resolved as On-Ledger Demo Settlement. Compliance Receipt product decision is resolved as Scoped Compliance Receipt.
