# CloakRFQ

Privacy-preserving RFQ settlement on the Canton Network. This repository
holds both the planning documentation and the first implementation.

## Layout

```
docs/    Planning documentation — product brief, PRD, ADRs, technical design, roadmap.
ledger/  Daml multi-package ledger model and script tests for Phase 1 and early Phase 2.
web/     Next.js 14 (App Router + TypeScript) UI prototype of the MVP. See web/README.md.
```

## Web app

The `web/` directory is a Next.js prototype of the Receivable Sale RFQ workflow,
built to match the design prototype `CloakRFQ.dc.html`. A single workspace
with a **role switcher** across all seven Canton parties (Seller, Funder A/B/C,
Compliance, Risk Assessor, Coordinator, Auditor/Regulator, Outsider) shows the
same RFQ from each party's entitled view — demonstrating selective disclosure,
the Phase 1 origination flow, and a simulated wallet connector that acts as the
party for the selected role. The UI is **live-backed**: each action submits a
real Daml transaction to a Canton participant (local sandbox or DevNet) and reads
back per-party contract visibility — the selective disclosure is enforced
on-ledger, not mocked. See `web/README.md` for details.

```bash
cd web
npm install
npm run dev   # http://localhost:3000
```

## Documentation files

- `CONTEXT.md` — glossary of canonical domain terms. This is not a spec or scratchpad.
- `docs/CLOAKRFQ_PROJECT_BRIEF.md` — consolidated product brief, resolved decisions, explicit Current workflow, privacy posture, non-goals, and open questions.
- `docs/CLOAKRFQ_PRD.md` — product requirements document for the MVP workflow.
- `docs/HACKATHON_ALIGNMENT.md` — Canton Hackathon track alignment and submission positioning. The project will submit under Track 1: Private DeFi & Capital Markets.
- `docs/HACKATHON_ROADMAP.md` — compact roadmap for completing the hackathon MVP and submission package.
- `docs/MANIFEST.md` — package completeness notes and file inventory.
- `docs/CLOAKRFQ_MVP_BUILD_SPEC.md` — implementation handoff spec for the MVP.
- `docs/technical-design/001-high-level-technical-design.md` — first implementation-oriented high-level technical design note.
- `docs/technical-design/002-phase-1-origination-eligibility.md` — Phase 1 ledger design and implementation notes.
- `docs/technical-design/003-phase-2-private-quote-intake.md` — Phase 2 Private Quote intake and CIP-56 allocation design notes.
- `docs/technical-design/004-workflow-diagrams.md` — diagram-first technical workflow summary for the implemented Phase 1 and Phase 2 ledger flow.
- `docs/adr/0001-receivable-sale-rfq-mvp.md` — model the MVP as a Receivable Sale, not a secured loan.
- `docs/adr/0002-maximum-practical-privacy-for-rfqs.md` — target Maximum Practical Privacy for RFQs.
- `docs/adr/0003-functionality-preserving-privacy.md` — preserve real-world RFQ functionality before optimizing privacy.
- `docs/adr/0004-optional-debtor-notification.md` — make Debtor Notification optional and disclosure-controlled.
- `docs/adr/0005-require-funding-capacity-evidence-during-bidding.md` — require funding-capacity evidence during bidding; refined by ADR 0006.
- `docs/adr/0006-proof-of-funds-as-bid-eligibility-evidence.md` — original Proof-of-Funds boundary, refined by ADR 0012.
- `docs/adr/0007-controlled-funder-identity-disclosure.md` — control Funder identity disclosure timing.
- `docs/adr/0008-seller-controlled-fallback-queue.md` — use a Seller-Controlled Fallback Queue.
- `docs/adr/0009-binding-quotes-with-expiry.md` — use Binding Quotes with Quote Expiry for the MVP.
- `docs/adr/0010-on-ledger-demo-settlement.md` — use On-Ledger Demo Settlement for the MVP.
- `docs/adr/0011-scoped-compliance-receipts.md` — use Scoped Compliance Receipts for audit and regulatory disclosure.

## Status

Phase 1 ledger implementation is working, and Phase 2 Private Quote submission is now started as of 2026-07-06.

Implemented ledger scope currently covers represented Receivable registration, Compliance/Risk attestations and certificates, `RFQPackageData`, per-Funder `RFQRequest` bridge contracts, and allocation-backed `PrivateQuote` submission.

Not complete as production implementation. Later RFQ discovery, package access policy, quote-selection protocol details, settlement, receipts, and production payment/custody integration remain open.

Settlement product decision is resolved as On-Ledger Demo Settlement. Compliance Receipt product decision is resolved as Scoped Compliance Receipt.

## Agent workflow

AI-agent operating rules live in `AGENTS.md`.

Detailed branch, commit, PR, automation, and local push-guardrail guidance lives in `docs/AGENT_WORKFLOW.md`.
