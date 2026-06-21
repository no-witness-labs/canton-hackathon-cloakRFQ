# CloakRFQ Receipts — Project Brief

Last updated: 2026-06-20

## Working definition

**CloakRFQ Receipts** is a private, functionality-preserving RFQ marketplace for **Receivable Sales** on Canton.

Working product language:

> CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. Funders submit Private Quotes with quote-scoped Proof of Funds, Sellers select the Best Compliant Quote through a minimal Seller Quote View, Compliance and Risk parties provide scoped attestations, and Auditors or Regulators receive Scoped Compliance Receipts without exposing unnecessary bidders, quotes, identities, balances, or sensitive commercial data.

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
6. The Seller selects the Best Compliant Quote using a Seller Quote View.
7. Settlement is attempted with the Selected Quote.
8. If the Selected Quote fails before RFQ Finality, the Seller may use a Seller-Controlled Fallback Queue.
9. A Scoped Compliance Receipt is produced for an Auditor or Regulator where required.

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
| Quote selection          | Seller selects the Best Compliant Quote based on Selection Criteria.                                                                         |
| Best deal                | Best does not automatically mean highest headline price.                                                                                     |
| Required Disclosure      | Disclosure requested by a Funder is part of the quote's commercial terms.                                                                    |
| RFQ package              | Funders receive an attestation-first RFQ Disclosure Package.                                                                                 |
| Debtor notification      | Debtor Notification is optional and disclosure-controlled.                                                                                   |
| Risk assessment          | Risk Assessor is an optional scoped role, separate from Compliance and Audit.                                                                |
| Proof of Funds           | Required as bid eligibility evidence, but not a lock, reserve, escrow, or settlement guarantee.                                              |
| Seller selection surface | Seller uses a Seller Quote View with minimum comparison fields.                                                                              |
| Funder identity          | Hidden by default in the Seller Quote View; revealed only when needed by selection, compliance, settlement, audit, regulation, or RFQ terms. |
| Fallback                 | Use a Seller-Controlled Fallback Queue, not automatic highest-price fallback.                                                                |
| Quote validity           | For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period and have Quote Expiry.                                     |
| Penalties                | Monetary penalties are not in the MVP. Quote Bonds are a future option.                                                                      |
| Settlement model         | Use On-Ledger Demo Settlement with a Demo Settlement Asset.                                                                                  |
| Compliance receipt       | Use Scoped Compliance Receipts for audit and regulatory disclosure.                                                                          |

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
6. Funders submit Private Quotes with quote-scoped Proof of Funds.
7. Bidding closes; eligible still-valid quotes become Pending Quotes.
8. Private Quotes remain hidden from competing Funders and Coordinators by default.
9. Seller receives a Seller Quote View for Eligible Quotes, with Funder identity hidden by default unless disclosure is required.
10. Seller selects the Best Compliant Quote as the Selected Quote for attempted settlement.
11. Seller may define a Seller-Controlled Fallback Queue from other still-valid Eligible Quotes.
12. The Selected Quote enters the Settlement Window: the Selected Quote attempts to fund and settle while Pending Quotes may remain available as Fallback Quotes.
13. If settlement succeeds, On-Ledger Demo Settlement assigns the Receivable to the Winning Funder and transfers Demo Settlement Asset to the Seller.
14. If settlement fails before RFQ Finality, the Seller may promote a Fallback Quote from the Fallback Queue.
15. After RFQ Finality, pending fallback rights end.
16. Auditor or Regulator receives a Scoped Compliance Receipt if required.

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
| Recourse preference     | Recourse, non-recourse, or negotiable.                                                                            |
| Settlement preference   | Desired settlement window.                                                                                        |
| Disclosure Boundary     | What the Seller is willing to reveal pre-quote, post-selection, during settlement, and to Regulators or Auditors. |

### Supplemental RFQ Information

Minor, situational, or later-stage details may be grouped as Supplemental RFQ Information. Examples include industry category, invoice dispute notes, debtor concentration notes, payment history summary, collection preference, notification preference, extra document references, jurisdiction notes, insurance notes, relationship history, or custom due-diligence requests.

## Quote Terms currently in scope

A Private Quote can include:

| Quote term                      | Meaning                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Net Purchase Price              | Amount the Seller expects to receive after discount, fees, reserves, and other economic terms. |
| Settlement timing               | Same day, T+1, T+2, or another window.                                                         |
| Recourse model                  | Recourse, non-recourse, or negotiable.                                                         |
| Fees                            | Processing, service, or factoring fees.                                                        |
| Reserve / holdback              | Amount held back until Debtor payment or another condition.                                    |
| Required Disclosure             | Additional information required by the Funder as part of the quote.                            |
| Debtor Notification requirement | Whether the quote requires notifying the Debtor.                                               |
| Quote Expiry                    | Time after which the quote is no longer selectable.                                            |
| Proof-of-Funds status           | Whether the quote passed the Proof-of-Funds Gate.                                              |

Important product principle:

> **Required Disclosure is itself part of the price.**

A Seller may prefer a slightly lower quote if it requires less disclosure, settles faster, or has better recourse terms.

## Seller Quote View

The Seller Quote View is the minimum Seller-visible comparison surface needed to select the Best Compliant Quote.

The Seller Quote View may include:

| Field                             | Seller visibility                           |
| --------------------------------- | ------------------------------------------- |
| Net Purchase Price                | Yes.                                        |
| Settlement timing                 | Yes.                                        |
| Recourse model                    | Yes.                                        |
| Fees / reserve / holdback         | Yes.                                        |
| Required Disclosure               | Yes.                                        |
| Debtor Notification requirement   | Yes.                                        |
| Compliance status                 | Yes, as an attestation or status.           |
| Proof-of-Funds status             | Yes, as a status or attestation.            |
| Raw Proof-of-Funds data           | No by default.                              |
| Funder balances / funding sources | No.                                         |
| Full Funder identity              | No by default; revealed only when required. |

The MVP should not yet claim Winning-Only Disclosure. The Seller may see multiple eligible quote comparison rows unless a later quote-selection mechanism supports stronger privacy without weakening RFQ functionality.

## Proof of Funds model

Proof of Funds is required as bid eligibility evidence.

It means the Funder had enough funding capacity to support the quote at a relevant verification point. It does **not** mean the funds are locked, reserved, escrowed, unspendable, single-use, or guaranteed to be available at settlement.

Current accepted limitation:

> A Funder may prove funds existed and later spend them, or may use the same funds to support multiple quotes, unless a stronger mechanism is added.

Possible future mechanisms include Funding Capacity Attestation, Funding Evidence Provider, on-ledger funds check, Funding Lock, escrow, settlement-bank commitment, or Quote Bond.

## Fallback model

Fallback only applies before RFQ Finality.

| Stage                   | Behavior                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Before Seller selection | Private Quotes may be Pending Quotes if eligible and unexpired.                            |
| Seller selection        | Seller selects the Best Compliant Quote and may define a Seller-Controlled Fallback Queue. |
| Settlement Window       | The Selected Quote attempts settlement.                                                    |
| Commitment Failure      | If the Selected Quote fails before RFQ Finality, the Seller may promote a Fallback Quote.  |
| After RFQ Finality      | No fallback. Later Funder exit is a separate secondary transaction.                        |

Fallback ordering is Seller-controlled because the second-best quote is not necessarily the second-highest headline price.

## Binding quote model

For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period.

A Binding Quote:

- has an explicit Quote Expiry;
- remains selectable until Quote Expiry if otherwise eligible;
- may be placed in the Seller-Controlled Fallback Queue while valid;
- cannot be arbitrarily withdrawn during its Quote Validity Period unless the RFQ terms explicitly allow withdrawal;
- does not imply funds are locked, reserved, escrowed, or guaranteed through settlement;
- does not imply monetary penalties in the MVP.

In the MVP, "Binding Quote" means binding under the demo workflow rules during the Quote Validity Period. It does not claim external legal enforceability unless a legal agreement, enforcement mechanism, or jurisdiction-specific legal workflow is explicitly added.

## Settlement model

The MVP uses On-Ledger Demo Settlement.

A tokenized or represented Receivable is assigned to the Winning Funder, and Demo Settlement Asset transfers to the Seller. This demonstrates payment-versus-receivable settlement as Canton/Daml ledger state transitions.

The Demo Settlement Asset is non-production. The MVP must not claim real payment finality, bank settlement, stablecoin settlement, Canton Coin/Amulet integration, or production custody.

The MVP also does not claim production legal assignment, perfection of ownership or security rights, enforceability against the Debtor, or jurisdiction-specific receivables-transfer compliance. The on-ledger Receivable assignment demonstrates the application workflow state transition only, unless legal documentation, Debtor notification, transfer restrictions, or jurisdiction-specific assignment workflows are explicitly added later.

## Scoped Compliance Receipt

A Scoped Compliance Receipt may include:

- RFQ/workflow reference;
- opaque Receivable reference;
- Seller eligibility status;
- Winning Funder eligibility status;
- Risk Attestation reference if used;
- Proof-of-Funds Gate status for the Winning Quote;
- quote-selection statement;
- settlement status;
- Debtor Notification mode;
- fallback status if fallback occurred;
- RFQ Finality timestamp.

The receipt should not disclose by default:

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
| Auditor or Regulator receives scoped compliance evidence, not the full workflow.                      | MVP guarantee target. |
| Sensitive Attributes are not disclosed as raw data unless required.                                   | MVP guarantee target. |
| Funders receive an attestation-first RFQ Disclosure Package.                                          | MVP guarantee target. |
| Seller receives a minimal Seller Quote View, not raw Funder balances or funding sources.              | MVP guarantee target. |
| Seller receives only Proof-of-Funds status or an attestation by default, not raw Proof-of-Funds evidence, balances, funding sources, or unrelated financial positions. | MVP guarantee target. |

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
- A system that claims Proof of Funds locks, reserves, prevents later spending, or guarantees settlement unless locking, escrow, or settlement integration is actually implemented.
- A system that automatically promotes fallback quotes purely by highest headline price.
- A system that imposes monetary penalties unless a Quote Bond, escrow, legal agreement, or equivalent mechanism is explicitly designed.

## Open design questions

### 1. Quote-selection mechanism

How does the Seller evaluate or receive enough information to select the Best Compliant Quote while minimizing disclosure?

Current boundary: the Seller Quote View is the MVP selection surface, but stronger Winning-Only Disclosure remains a stretch privacy ambition.

### 2. Proof-of-Funds mechanism

What exact technical proof is used for the MVP?

Current boundary: Proof of Funds screens for funding capacity at a relevant point. It does not mean funds are locked, reserved, escrowed, prevented from later movement, or guaranteed for settlement unless a later design explicitly adds that mechanism.

Open options include a mocked proof, an on-ledger funds check, a Funding Capacity Attestation, a Funding Evidence Provider, or a settlement-bank check.

### Resolved product decisions

Settlement model is resolved as On-Ledger Demo Settlement with a Demo Settlement Asset.

Compliance Receipt product shape is resolved as Scoped Compliance Receipt.

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

Current boundary: the MVP uses a Demo Settlement Asset only.

### 7. Quote penalties and reputation

The MVP excludes monetary penalties. Future versions may add Quote Bonds, reputation penalties, legal remedies, or access restrictions.

Not resolved for post-MVP.

## Current demo idea

Show multiple party views:

- Seller sees the Receivable, RFQ, Seller Quote View, selected quote, fallback status if applicable, and final sale state.
- Funder A sees only its RFQ Disclosure Package, Proof-of-Funds status, and its own Private Quote.
- Funder B sees only its RFQ Disclosure Package, Proof-of-Funds status, and its own Private Quote.
- Coordinator sees workflow status but not quote contents.
- Compliance Party sees eligibility data and can produce attestations.
- Risk Assessor sees only risk-relevant data and produces Risk Attestations.
- Auditor or Regulator sees a Scoped Compliance Receipt, not the full RFQ.
- Outsider sees nothing useful.

## Current ADRs

- ADR 0001: Model the MVP as a Receivable Sale, Not a Secured Loan.
- ADR 0002: Target Maximum Practical Privacy for RFQs.
- ADR 0003: Preserve Real-World RFQ Functionality Before Optimizing Privacy.
- ADR 0004: Make Debtor Notification Optional and Disclosure-Controlled.
- ADR 0005: Require Funding Capacity Evidence During Bidding; refined by ADR 0006.
- ADR 0006: Require Proof of Funds as Bid Eligibility Evidence, Not a Funding Lock.
- ADR 0007: Control Funder Identity Disclosure Timing.
- ADR 0008: Use a Seller-Controlled Fallback Queue.
- ADR 0009: Use Binding Quotes with Quote Expiry for the MVP.
- ADR 0010: Use On-Ledger Demo Settlement for the MVP.
- ADR 0011: Use Scoped Compliance Receipts for Audit and Regulatory Disclosure.
