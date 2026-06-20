# CloakRFQ Receipts — Project Brief

Last updated: 2026-06-19

## Working definition

**CloakRFQ Receipts** is a private, functionality-preserving RFQ marketplace for **Receivable Sales** on Canton.

Working product language:

> CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. Funders submit Private Quotes with quote-scoped Proof of Funds, Sellers select the Best Compliant Quote through a minimal Seller Quote View, Compliance and Risk parties provide scoped attestations, and Auditors or Regulators receive selective proof-of-compliance receipts without exposing unnecessary bidders, quotes, identities, balances, or sensitive commercial data.

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
9. A scoped Compliance Receipt is produced for an Auditor or Regulator where required.

## Resolved product decisions

| Area | Decision |
|---|---|
| MVP asset | Use **Receivable**, not generic RWA, as the canonical financed object. |
| MVP transaction | Use **Receivable Sale**, not secured lending. |
| Main buyer term | Use **Funder**, not Lender, because the MVP is not a loan. |
| RFQ model | Preserve real-world RFQ functionality; do not downgrade to threshold acceptance only for privacy. |
| Privacy posture | Use Maximum Practical Privacy around the real RFQ. |
| Coordinator | Coordinator may route workflow state but should not read Private Quote contents by default. |
| Quote visibility | Funders do not see each other's Private Quotes. |
| Quote selection | Seller selects the Best Compliant Quote based on Selection Criteria. |
| Best deal | Best does not automatically mean highest headline price. |
| Required Disclosure | Disclosure requested by a Funder is part of the quote's commercial terms. |
| RFQ package | Funders receive an attestation-first RFQ Disclosure Package. |
| Debtor notification | Debtor Notification is optional and disclosure-controlled. |
| Risk assessment | Risk Assessor is an optional scoped role, separate from Compliance and Audit. |
| Proof of Funds | Required as bid eligibility evidence, but not a lock, reserve, escrow, or settlement guarantee. |
| Seller selection surface | Seller uses a Seller Quote View with minimum comparison fields. |
| Funder identity | Hidden by default in the Seller Quote View; revealed only when needed by selection, compliance, settlement, audit, regulation, or RFQ terms. |
| Fallback | Use a Seller-Controlled Fallback Queue, not automatic highest-price fallback. |
| Quote validity | For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period and have Quote Expiry. |
| Penalties | Monetary penalties are not in the MVP. Quote Bonds are a future option. |

## Main roles

| Role | Meaning |
|---|---|
| Seller | Owns the Receivable and seeks liquidity. |
| Debtor | Owes payment on the Receivable. |
| Funder | Submits a Private Quote to purchase the Receivable. |
| Coordinator | Routes invitations, deadlines, and workflow status, but should not see Private Quote contents by default. |
| Compliance Party | Determines legal, policy, jurisdiction, KYC, sanctions, or other eligibility. |
| Risk Assessor | Optional scoped party that evaluates Debtor Risk or Receivable Risk and issues Risk Attestations. |
| Funding Evidence Provider | Optional scoped party or service that may verify Proof of Funds if the chosen mechanism requires it. |
| Auditor | Non-government assurance party that may receive scoped audit evidence. |
| Regulator | Government authority or regulatory delegate that may receive compliance-relevant disclosures. |

## Current workflow

1. Seller creates or references a Receivable.
2. Seller defines RFQ parameters, Selection Criteria, and Disclosure Boundary.
3. Optional Risk Assessor issues Risk Attestations.
4. Compliance Party provides required Eligibility Attestations.
5. Funders receive RFQ Disclosure Packages.
6. Funders submit Private Quotes with quote-scoped Proof of Funds.
7. The Proof-of-Funds Gate determines whether a quote can be treated as eligible.
8. Private Quotes remain hidden from competing Funders and Coordinators by default.
9. Seller receives a Seller Quote View for Eligible Quotes.
10. Funder identity is hidden or pseudonymous in the Seller Quote View unless disclosure is required.
11. Seller selects the Best Compliant Quote as the Selected Quote for attempted settlement.
12. Seller may define a Seller-Controlled Fallback Queue from still-valid Eligible Quotes.
13. The RFQ enters the Settlement Window.
14. If the Selected Quote settles, it becomes the Winning Quote and the Receivable Sale completes.
15. If the Selected Quote fails before RFQ Finality, the Seller may promote a Fallback Quote that is still eligible and unexpired.
16. After RFQ Finality, fallback rights end.
17. Auditor or Regulator receives a scoped Compliance Receipt if required.

## RFQ Disclosure Package

A Funder should not receive the full Seller profile or full invoice record before quoting. The Funder receives an RFQ Disclosure Package that contains Core Pre-Quote Facts and optional Supplemental RFQ Information.

Recommended Core Pre-Quote Facts:

| Field | MVP posture |
|---|---|
| Receivable amount | Face value and currency. |
| Payment timing | Due date or days until due. |
| Receivable validity | Attestation-first; avoid raw documents unless required. |
| Debtor risk | Debtor Risk Attestation, not raw Debtor identity by default. |
| Seller eligibility | Seller eligibility attestation. |
| Jurisdiction / compliance | Jurisdiction or compliance eligibility attestation. |
| Recourse preference | Recourse, non-recourse, or negotiable. |
| Settlement preference | Same-day, T+1, T+2, or other window. |
| Disclosure Boundary | What the Seller is willing to reveal pre-quote, after selection, during settlement, or to Auditors and Regulators. |

Supplemental RFQ Information is a flexible optional field for non-core details such as industry category, dispute notes, payment history summary, notification preference, extra document references, insurance notes, or custom due-diligence requests.

## Seller Quote View

The Seller Quote View is the canonical selection surface.

Recommended MVP-visible comparison fields:

| Field | Seller visibility |
|---|---|
| Net Purchase Price | Visible. |
| Settlement timing | Visible. |
| Recourse model | Visible. |
| Fees / reserve / holdback | Visible. |
| Required Disclosure | Visible. |
| Debtor Notification requirement | Visible. |
| Compliance status | Visible as an attestation. |
| Proof-of-Funds status | Visible as a status or attestation. |
| Raw Proof-of-Funds data | Hidden unless required. |
| Funder legal identity | Hidden by default; reveal only if required. |
| Funder raw balances or funding sources | Hidden. |

The Seller Quote View does not yet guarantee Winning-Only Disclosure. In the MVP, the Seller may see multiple eligible quote comparison rows. Hiding all Unselected Quote terms from the Seller remains a stretch privacy ambition unless the quote-selection protocol makes it practical.

## Quote Terms currently in scope

A Private Quote may include:

- Net Purchase Price.
- Settlement timing.
- Recourse or non-recourse model.
- Fees.
- Reserve or holdback.
- Required Disclosure.
- Debtor Notification requirement.
- Quote Expiry.
- Proof-of-Funds status or evidence for bidding eligibility.
- Settlement requirements.
- Fallback availability or expiry.

## Proof of Funds posture

Proof of Funds is required as bid eligibility evidence. It is not the same as a lock, escrow, reserve, or settlement guarantee.

Current rule:

> A Funder must pass a quote-scoped Proof-of-Funds Gate before its Private Quote can be treated as eligible.

Accepted limitations:

- The same funds may support multiple bids unless a stronger mechanism is added.
- Funds may be spent after the proof point unless a stronger mechanism is added.
- Proof of Funds does not guarantee settlement.
- The exact proof mechanism remains unresolved.

Possible future mechanisms:

- Mock proof for the hackathon MVP.
- On-ledger funds check.
- Funding Capacity Attestation.
- Funding Evidence Provider.
- Settlement-bank or custodian check.
- Funding Lock.
- Escrow.
- Quote Bond.
- Canton payment workflow.

## Funder identity posture

Funder identity is hidden by default in the Seller Quote View, while still allowing identity disclosure when identity is part of the Seller's Selection Criteria, Required Disclosure, compliance, closing, settlement, audit, regulation, or RFQ terms.

Recommended lifecycle:

- During RFQ invitation and quote submission, Funders do not see each other through the RFQ workflow.
- The Coordinator does not see quote contents or full quote-linked Funder identities by default.
- In the Seller Quote View, Funders are pseudonymous or represented through eligibility/status attestations by default.
- At selection, closing, or settlement, the Winning Funder identity may be revealed if needed.
- For audit or regulation, Funder identity disclosure should remain scoped to the relevant requirement.

## Fallback and expiry posture

Fallback ordering is Seller-controlled.

When the Seller selects the Best Compliant Quote, the Seller may also define a Seller-Controlled Fallback Queue from other still-valid Eligible Quotes. If the Selected Quote fails during the Settlement Window before RFQ Finality, the Seller may promote a Fallback Quote if it remains eligible and unexpired.

For the MVP:

- Private Quotes are Binding Quotes during their Quote Validity Period.
- Every Private Quote has explicit Quote Expiry.
- Private Quotes cannot be arbitrarily withdrawn during the Quote Validity Period unless RFQ terms explicitly allow withdrawal.
- Monetary penalties are out of scope.
- Quote Bonds are a future option.

## Privacy guarantees vs ambitions

### MVP guarantees to aim for

These should be safe to claim if implemented correctly:

- Funders cannot see competing Funders' Private Quotes.
- Coordinator cannot read Private Quote contents by default.
- Outsiders cannot inspect Receivables, quote activity, Seller balances, or RFQ results.
- Auditor and Regulator receive scoped receipts or disclosures rather than full workflow visibility.
- Sensitive Attributes are not disclosed as raw data unless required.
- Seller sees only the comparison fields needed to choose the Best Compliant Quote, not raw Funder data, raw Proof-of-Funds evidence, full balances, funding sources, or full Funder identity unless required by purpose.
- Funder identity is minimized and disclosed only when the workflow requires it.

### Stretch privacy ambitions

These are valuable but should not be overclaimed until the protocol design is chosen:

- Seller sees only the Winning Quote rather than the full Quote Book.
- Unselected Funders remain hidden from the Seller unless identity disclosure is required by RFQ terms, compliance, closing, settlement, or regulation.
- Unselected Quotes remain hidden from everyone except the submitting Funder.
- Quote selection can happen without any single non-essential party seeing the full Quote Book.
- Pending Quotes remain private while still being available for fallback.
- Proof of Funds does not reveal full Funder balances, funding sources, or unrelated financial positions.

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
- A system with monetary penalties unless Quote Bonds, escrow, or legal-enforcement mechanics are explicitly designed.

## Open design questions

### 1. Settlement model

What exactly transfers in the MVP: mock cash, Canton Coin/Amulet, off-ledger settlement confirmation, or another payment representation?

### 2. Quote-selection mechanism

How does the Seller evaluate quotes while minimizing disclosure? The current product model uses a Seller Quote View, but stronger privacy properties such as Winning-Only Disclosure remain unresolved.

### 3. Proof-of-Funds mechanism

How is Proof of Funds produced in the MVP: mock proof, on-ledger funds check, attestation, Funding Evidence Provider, settlement-bank check, or another method?

### 4. Debtor identity disclosure

When, if ever, must raw Debtor identity be revealed? The default model prefers attestations before quote submission, with raw disclosure only if required by quote terms, compliance, settlement, or enforceability.

### 5. Post-settlement Funder exit

If a Funder buys the Receivable and later wants to exit, is that a secondary sale, reassignment, or separate RFQ? This should be treated as a new transaction, not fallback.

### 6. Compliance Receipt contents

Exactly what does the Compliance Receipt reveal to an Auditor or Regulator, especially when fallback occurred or identity disclosure was required?

## Current demo idea

Show multiple party views:

- Seller sees the Receivable, RFQ, Seller Quote View, selected quote, fallback status if applicable, and final sale state.
- Funder A sees only its RFQ Disclosure Package, Proof-of-Funds status, and its own Private Quote.
- Funder B sees only its RFQ Disclosure Package, Proof-of-Funds status, and its own Private Quote.
- Coordinator sees workflow status but not quote contents.
- Compliance Party sees eligibility data and can produce attestations.
- Risk Assessor sees only risk-relevant data and produces Risk Attestations.
- Auditor or Regulator sees a Compliance Receipt, not the full RFQ.
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
