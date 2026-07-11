# CloakRFQ Receipts — Project Brief

Last updated: 2026-07-11

## Working definition

**CloakRFQ Receipts** is a private, functionality-preserving RFQ marketplace for **Receivable Sales** on Canton.

Working product language:

> CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. Funders submit Private Quotes backed by committed CIP-56 allocation evidence, Sellers select a Quote through a minimal Seller Quote View, Compliance and Risk parties provide scoped attestations, and the designated Auditor receives scoped settlement evidence without exposing unnecessary bidders, quotes, identities, balances, or sensitive commercial data.

The guiding product question is:

> **How private can we make this real RFQ workflow?**

Not:

> **What weaker workflow can we build to satisfy a privacy target?**

## Core positioning

The MVP is not a generic RWA tokenization app, a lending protocol, or a public bid book.

It is a private RFQ flow for selling a Receivable at a discount, with privacy and selective disclosure built into the workflow:

1. A Seller owns a Receivable and wants liquidity.
2. Funders receive a limited RFQ Disclosure Package.
3. Funders submit Private Quotes.
4. Private Quotes must pass a Proof-of-Funds Gate.
5. Compliance and Risk parties provide scoped attestations.
6. The Seller selects a Quote using a Seller Quote View.
7. Settlement is attempted with the Selected Quote.
8. If settlement fails, the Seller sees the ledger error and may retry or choose another still-valid Quote.
9. The designated Auditor receives scoped `ReceivableSaleSettlement` evidence after successful settlement.

## Resolved product decisions

| Area                     | Decision                                                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| MVP asset                | Use **Receivable**, not generic RWA, as the canonical financed object.                                                                       |
| MVP transaction          | Use **Receivable Sale**, not secured lending.                                                                                                |
| Main buyer term          | Use **Funder**, not Lender, because the MVP is not a loan.                                                                                   |
| RFQ model                | Preserve real-world RFQ functionality; do not downgrade to threshold acceptance only for privacy.                                            |
| Privacy posture          | Use Maximum Practical Privacy around the real RFQ.                                                                                           |
| Coordinator              | Coordinator may route workflow state but should not read Private Quote contents by default.                                                  |
| Quote visibility         | Funders do not see each other's Private Quotes.                                                                                              |
| Quote selection          | Seller selects a Quote based on Selection Criteria.                                                                         |
| Best deal                | Best does not automatically mean highest headline price.                                                                                     |
| Disclosure cost          | Disclosure requirements can affect quote attractiveness, but the MVP does not model a back-and-forth Funder disclosure-request workflow.     |
| RFQ package              | Funders receive an attestation-first RFQ Disclosure Package.                                                                                 |
| Debtor notification      | Debtor Notification is optional and disclosure-controlled.                                                                                   |
| Risk assessment          | Risk Assessor is an optional scoped role, separate from Compliance and Audit.                                                                |
| Funding evidence         | Phase 2 requires committed CIP-56 allocation-backed quotes. This allocates funds for the RFQ context during the quote validity window, but is not escrow, custody, bank settlement, production payment finality, or a guarantee settlement will complete. |
| Seller selection surface | Seller uses a Seller Quote View with minimum comparison fields.                                                                              |
| Funder identity          | Hidden by default in the Seller Quote View; revealed only when needed by selection, compliance, settlement, audit, regulation, or RFQ terms. |
| Failure recovery         | Surface the ledger error; the Seller may retry or choose another still-valid Quote.                                                         |
| Quote validity           | For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period and have Quote Expiry.                                     |
| Penalties                | Monetary penalties are not in the MVP. Quote Bonds are a future option.                                                                      |
| Settlement model         | Use On-Ledger Demo Settlement with a committed CIP-56 token allocation.                                                                                  |
| Settlement evidence     | The designated Auditor observes the scoped `ReceivableSaleSettlement` record.                                                               |

## Main roles

| Role                      | Meaning                                                                        |
| ------------------------- | ------------------------------------------------------------------------------ |
| Seller                    | Owns the Receivable and seeks liquidity.                                       |
| Funder                    | Submits a Private Quote to buy the Receivable.                                 |
| Debtor                    | The party obligated to pay the Receivable.                                     |
| Coordinator               | Routes workflow status and invitations without quote visibility by default.    |
| Compliance Party          | Determines participant and transaction eligibility.                            |
| Risk Assessor             | Issues risk attestations about Debtor Risk or Receivable Risk.                 |
| Funding Evidence Provider | Optional scoped verifier for Proof of Funds if the chosen mechanism needs one. |
| Auditor                   | Receives scoped audit evidence.                                                |
| Regulator                 | Receives compliance-relevant disclosures where required.                       |

## Current workflow

1. Seller creates or references a Receivable.
2. Seller defines RFQ parameters and disclosure boundaries.
3. Optional Risk Assessor issues Risk Attestations.
4. Compliance Party provides required eligibility attestations.
5. Funders receive RFQ Disclosure Packages.
6. Funders submit Private Quotes backed by committed CIP-56 allocation evidence.
7. Bidding closes; eligible still-valid quotes become Pending Quotes.
8. Private Quotes remain hidden from competing Funders and Coordinators by default.
9. Seller receives a Seller Quote View for Eligible Quotes, with Funder identity hidden by default unless disclosure is required.
10. Seller selects a Quote as the Selected Quote for attempted settlement.
11. Other still-valid Quotes remain available if a settlement attempt fails.
12. The selected Quote attempts settlement using its committed allocation.
13. If settlement succeeds, the CIP-56 allocation pays the Seller and a pending Receivable transfer is created; the Winning Funder accepts ownership afterward.
14. If settlement fails, the UI shows the ledger error and the Seller may retry or choose another still-valid Quote.
15. After successful settlement, the settled Quote cannot be reused.
16. The designated Auditor observes the `ReceivableSaleSettlement` record after success.

## RFQ Disclosure Package

The RFQ Disclosure Package is the minimum pre-quote information a Funder receives.

### Core Pre-Quote Facts

| Core fact               | MVP form                                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Receivable amount       | Face value and currency.                                                                                          |
| Payment timing          | Due date or days until due.                                                                                       |
| Receivable validity     | Receivable verified attestation.                                                                                  |
| Debtor payment risk     | Debtor Risk Attestation rather than raw Debtor identity by default.                                               |
| Seller eligibility      | Seller eligibility attestation.                                                                                   |
| Jurisdiction/compliance | Jurisdiction or transaction eligibility attestation.                                                              |
| Recourse preference     | With recourse or without recourse.                                                                                 |
| Settlement preference   | Desired settlement window.                                                                                        |
| Disclosure Boundary     | What the Seller is willing to reveal pre-quote, post-selection, during settlement, and to Regulators or Auditors. |

### Supplemental RFQ Information

Minor, situational, or later-stage details may be grouped as Supplemental RFQ Information. Examples include industry category, invoice dispute notes, debtor concentration notes, payment history summary, collection preference, notification preference, extra document references, jurisdiction notes, insurance notes, relationship history, or custom due-diligence requests.

## Implemented Phase 2 Quote Terms

A Private Quote includes:

| Quote term                      | Meaning                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Net Purchase Price              | Amount the Funder offers to pay the Seller for the Receivable.                                 |
| Recourse model                  | Whether the quote is with recourse or without recourse.                                        |
| Debtor Notification requirement | Whether the quote requires notifying the Debtor.                                               |
| Quote Expiry                    | Time after which the quote and its committed allocation are no longer binding for the RFQ workflow. |
| Funding allocation reference    | Committed CIP-56 allocation evidence backing the quote.                                        |

Real-world factoring may also price fees, reserves, holdbacks, settlement windows, and additional diligence or disclosure requests. The MVP does not model those separately; they are either outside scope or economically compressed into Net Purchase Price.

Important product principle:

> **Disclosure burden can affect the real economic attractiveness of a quote.**

A Seller may prefer a slightly lower quote if it requires less sensitive disclosure, fewer diligence steps, or a better recourse position. The MVP keeps this as product context; the implemented Phase 2 quote terms stay intentionally smaller.

## Seller Quote View

The Seller Quote View is the minimum Seller-visible comparison surface needed to select a Quote.

The MVP Seller Quote View may include:

| Field                             | Seller visibility                           |
| --------------------------------- | ------------------------------------------- |
| Net Purchase Price                  | Yes.                                        |
| Recourse model                      | Yes.                                        |
| Debtor Notification requirement     | Yes.                                        |
| Quote Expiry                        | Yes.                                        |
| Compliance status                   | Yes, as an attestation or status.           |
| Funding allocation reference/status | Yes, as scoped allocation evidence.         |
| Raw Funder balances / funding sources | No.                                       |
| Full Funder identity                | No by default; revealed only when required. |

The MVP should not yet claim Winning-Only Disclosure. The Seller may see multiple eligible quote comparison rows unless a later quote-selection mechanism supports stronger privacy without weakening RFQ functionality.

## Funding evidence model

Phase 2 Private Quotes require committed CIP-56 allocation evidence at submission time. The allocation must cover the quote amount, reference the RFQ context, and remain valid through Quote Expiry.

This allocates funds for the RFQ workflow during the quote validity window. It is not escrow, custody, bank settlement, production payment finality, or a guarantee that settlement will complete. The Seller receives scoped allocation evidence, not raw Funder balances, funding sources, or unrelated financial positions.

## Failed-settlement recovery

A failed settlement transaction rolls back atomically. While another Quote remains valid, the Seller may retry or choose that Quote off-ledger.

| Stage                   | Behavior                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Before Seller selection | Private Quotes may be Pending Quotes if eligible and unexpired.                            |
| Seller selection        | Seller chooses a visible, still-valid Quote off-ledger.                                      |
| Settlement Window       | The Selected Quote attempts settlement.                                                    |
| Settlement failure      | The transaction rolls back; the UI shows the ledger error and another valid Quote remains usable. |
| After successful settlement | The settled Quote cannot be used again; later Funder exit is a separate transaction. |

The ledger does not rank alternatives. After a failure, the Seller decides off-ledger whether to retry or use another still-valid Quote.

## Binding quote model

For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period.

A Binding Quote:

- has an explicit Quote Expiry;
- remains selectable until Quote Expiry if otherwise eligible;
- remains available for another settlement attempt while valid;
- cannot be arbitrarily withdrawn during its Quote Validity Period unless the RFQ terms explicitly allow withdrawal;
- does not imply escrow, custody, bank settlement, production payment finality, or guaranteed settlement completion;
- does not imply monetary penalties in the MVP.

In the MVP, "Binding Quote" means binding under the demo workflow rules during the Quote Validity Period. It does not claim external legal enforceability unless a legal agreement, enforcement mechanism, or jurisdiction-specific legal workflow is explicitly added.

## Settlement model

The MVP uses On-Ledger Demo Settlement.

The CIP-56 token allocation pays the Seller while settlement initiates a pending Receivable transfer. The Winning Funder accepts ownership afterward. This demonstrates payment-versus-receivable settlement as Canton/Daml ledger state transitions.

The CIP-56 token settlement path is scoped to the demo environment. The MVP must not claim bank settlement, production custody, production legal assignment, or jurisdiction-specific payment finality.

The MVP also does not claim production legal assignment, perfection of ownership or security rights, enforceability against the Debtor, or jurisdiction-specific receivables-transfer compliance. The on-ledger Receivable assignment demonstrates the application workflow state transition only, unless legal documentation, Debtor notification, transfer restrictions, or jurisdiction-specific assignment workflows are explicitly added later.

## `ReceivableSaleSettlement` record

The implemented `ReceivableSaleSettlement` identifies the Seller, Winning Funder, accepted price, payment and transfer references, and settlement time.

The record does not disclose by default:

- full RFQ workflow;
- full Quote Book;
- all Private Quotes;
- raw Proof-of-Funds data;
- raw Sensitive Attributes;
- raw invoice documents;
- Unselected Funder identities;
- full Seller/Debtor/Funder records.

## Canton privacy and trust boundary

Canton privacy is stakeholder- and participant-based. Parties, their hosting participant or validator operators, and explicitly entitled signatories, observers, controllers, or actors may see the contracts or transaction views they are entitled to see.

The MVP does not claim full anonymity, secrecy from a party's own infrastructure operator, or secrecy from parties intentionally added to a contract or transaction view. Privacy claims should be understood as role-scoped selective disclosure within the application workflow.

## Privacy guarantees vs ambitions

### MVP privacy guarantees to aim for

| Privacy claim                                                                                         | Status                |
| ----------------------------------------------------------------------------------------------------- | --------------------- |
| Competing Funders cannot see each other's Private Quotes.                                             | MVP guarantee target. |
| Coordinator cannot read Private Quote contents by default.                                            | MVP guarantee target. |
| Outsiders see nothing useful about Receivables, RFQs, quotes, or results.                             | MVP guarantee target. |
| The designated Auditor receives scoped settlement evidence, not the full workflow.                      | MVP guarantee target. |
| Sensitive Attributes are not disclosed as raw data unless required.                                   | MVP guarantee target. |
| Funders receive an attestation-first RFQ Disclosure Package.                                          | MVP guarantee target. |
| Seller receives a minimal Seller Quote View, not raw Funder balances or funding sources.              | MVP guarantee target. |
| Seller receives only scoped funding evidence, such as a committed CIP-56 allocation reference/status, not raw wallet balances, funding sources, or unrelated financial positions. | MVP guarantee target. |

### Stretch privacy ambitions

These are valuable but should not be overclaimed until the protocol design is chosen:

- Seller sees only the Winning Quote.
- Unselected Funders remain hidden from the Seller.
- Unselected Quotes remain hidden from everyone except the submitting Funder.
- Quote selection can happen without any single non-essential party seeing the full Quote Book.
- Pending Quotes remain private while still being available for fallback.
- The Proof-of-Funds mechanism itself can verify funding capacity without revealing raw balances, funding sources, or unrelated financial positions to any non-essential verifier.

## Important non-goals for the MVP

The MVP should not become:

- A full secured lending protocol.
- A generic RWA tokenization platform.
- A full DEX or AMM.
- A full invoice verification or underwriting platform.
- A full cryptographic blind auction unless implementation feasibility is proven.
- A production-grade settlement or payment network.
- A system that changes the RFQ into threshold acceptance purely for privacy reasons.
- A system that overstates committed allocation evidence as escrow, custody, bank settlement, production payment finality, or guaranteed settlement completion.
- A system that automatically promotes fallback quotes purely by highest headline price.
- A system that imposes monetary penalties unless a Quote Bond, escrow, legal agreement, or equivalent mechanism is explicitly designed.

## Open design questions

### 1. Quote-selection mechanism

How does the Seller evaluate or receive enough information to select a Quote while minimizing disclosure?

Current boundary: the Seller Quote View is the MVP selection surface, but stronger Winning-Only Disclosure remains a stretch privacy ambition.

### 2. Proof-of-Funds mechanism

What exact technical proof is used for the MVP?

Current boundary: Phase 2 uses committed CIP-56 allocation evidence for quote funding. This allocates funds for the RFQ workflow during the quote validity window, but it is not escrow, custody, bank settlement, production payment finality, or guaranteed settlement completion.

### Resolved product decisions

Settlement model is resolved as On-Ledger Demo Settlement with a committed CIP-56 token allocation.

Compliance Receipt product shape is resolved as `ReceivableSaleSettlement` record.

### 3. Winning-Only Disclosure feasibility

How much stronger Winning-Only Disclosure is technically feasible without weakening RFQ functionality?

### 4. Debtor identity disclosure

When, if ever, must the raw Debtor identity be revealed?

The default model prefers attestations before quote submission, with raw disclosure only if required by quote terms, compliance, settlement, or enforceability.

### 5. Post-settlement Funder exit

If a Funder buys the Receivable and later wants to exit, is that a secondary sale, reassignment, or separate RFQ?

Current boundary: this should be treated as a new transaction, not fallback. Exact model is not resolved.

### 6. Production payment integration

Will a later version add production payment integration?

Current boundary: the MVP uses a committed CIP-56 token allocation for settlement evidence; it does not claim bank settlement or production custody.

### 7. Quote penalties and reputation

The MVP excludes monetary penalties. Future versions may add Quote Bonds, reputation penalties, legal remedies, or access restrictions.

Not resolved for post-MVP.

## Current demo idea

Show multiple party views:

- Seller sees the Receivable, RFQ, Seller Quote View, selected Quote, settlement errors, and final sale state.
- Funder A sees only its RFQ Disclosure Package, funding evidence status, and its own Private Quote.
- Funder B sees only its RFQ Disclosure Package, funding evidence status, and its own Private Quote.
- Coordinator sees workflow status but not quote contents.
- Compliance Party sees eligibility data and can produce attestations.
- Risk Assessor sees only risk-relevant data and produces Risk Attestations.
- The designated Auditor sees scoped `ReceivableSaleSettlement` evidence, not the full RFQ.
- Outsider sees nothing useful.

## Current ADRs

- ADR 0001: Model the MVP as a Receivable Sale, Not a Secured Loan.
- ADR 0002: Target Maximum Practical Privacy for RFQs.
- ADR 0003: Preserve Real-World RFQ Functionality Before Optimizing Privacy.
- ADR 0004: Make Debtor Notification Optional and Disclosure-Controlled.
- ADR 0005: Require Funding Capacity Evidence During Bidding; refined by ADR 0006.
- ADR 0006: Require Proof of Funds as Bid Eligibility Evidence, Not a Funding Lock.
- ADR 0007: Control Funder Identity Disclosure Timing.
- ADR 0008 records the earlier fallback-queue design; the MVP uses retry or another still-valid Quote without an on-ledger queue.
- ADR 0009: Use Binding Quotes with Quote Expiry for the MVP.
- ADR 0010: Use On-Ledger Demo Settlement for the MVP.
- ADR 0011: preserve scoped audit disclosure; the implementation uses `ReceivableSaleSettlement` evidence.
