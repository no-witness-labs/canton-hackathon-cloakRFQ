# CloakRFQ Receipts — Current Project Brief

Last updated: 2026-06-19

## Working product definition

CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. Sellers offer Receivables into a Blind RFQ, Funders submit Proof-Backed Private Quotes, Compliance Parties and Risk Assessors provide scoped attestations, the Seller selects the Best Compliant Quote through a Seller Quote View, fallback quotes may remain pending until RFQ Finality, and the completed transaction can generate a scoped Compliance Receipt for Auditors or Regulators.

The product's guiding question is:

> How private can we make this real RFQ workflow?

not:

> What weaker workflow can we build to satisfy a privacy target?

## Canonical one-line pitch

A private RFQ marketplace for receivable-backed financing on Canton, where Funders submit confidential quotes backed by quote-scoped Proof of Funds, Sellers select the Best Compliant Quote through minimal disclosure, fallback quotes can be promoted if settlement fails before finality, compliance and risk checks are disclosed selectively, and the final deal produces a proof-of-compliance receipt without exposing unnecessary bidders, quote details, identities, balances, or commercial records.

## Core thesis

Canton is valuable here because the product depends on role-based visibility and selective disclosure. The value is not merely tokenizing a receivable; the value is running a recognizable institutional RFQ workflow where each party receives only the information needed for its role.

## Resolved decisions

### 1. MVP asset: Receivable

The MVP is centered on Receivables, not generic RWAs.

A Receivable is a private financial claim owed to a Seller. In invoice-focused examples, the Receivable is usually an invoice or account receivable owed by the Seller's customer.

RWA remains useful in the pitch as a broader category, but the first product object is Receivable.

### 2. MVP transaction: Receivable Sale, not a loan

The MVP is a Receivable Sale workflow. A Seller sells a Receivable to a Funder, typically at a discount to face value.

Use Seller and Funder as canonical role names.

Avoid Borrower and Lender in the MVP because those imply a secured-loan model with repayment, interest, default, and collateral enforcement.

### 3. Privacy posture: Maximum Practical Privacy

The product should minimize disclosure as far as realistically achievable for the MVP.

Guaranteed MVP privacy claims should be separated from stretch privacy ambitions.

Current safe MVP privacy guarantees:

- Competing Funders should not see each other's Private Quotes.
- Coordinators should not receive Private Quote contents by default.
- Outsiders should see nothing useful about the RFQ workflow.
- Regulators and Auditors should receive scoped disclosures, not the full private workflow.
- Sensitive Attributes should be replaced with Eligibility Attestations or narrower disclosures where possible.

Current privacy ambitions:

- Hide Unselected Quotes as much as technically practical.
- Hide Unselected Funders as much as technically practical.
- Reveal only the information needed for selection and settlement.
- Avoid any single non-essential party seeing the full Quote Book.
- Keep Pending Quotes private while still available as fallbacks.

### 4. Functionality comes before privacy optimization

The product should preserve the real-world RFQ function first, then add privacy around it.

Do not simplify the RFQ into a threshold-only or first-acceptable-quote process merely because it is easier to make private.

The canonical process is a Best-Deal RFQ: the Seller should be able to compare eligible offers according to meaningful Selection Criteria before choosing a Selected Quote.

### 5. Best deal is Seller-selected, not automatically highest price

The Seller selects the Best Compliant Quote after required compliance checks. That quote becomes the Selected Quote for settlement, not necessarily the final Winning Quote yet.

The default MVP economic comparison is Net Purchase Price, but Seller Selection Discretion matters. A lower headline price may be better if it settles faster, requires less disclosure, has better recourse terms, has a better Proof-of-Funds status, imposes fewer Debtor Notification requirements, or is more compliant.

### 6. Required Disclosure is part of the quote

A Private Quote should include the information the Funder requires as a condition of quoting or closing.

Required Disclosure is a commercial term. This makes privacy a pricing dimension rather than a hidden backend detail.

Example:

- Funder A offers a higher Net Purchase Price but requires full Debtor identity.
- Funder B offers a slightly lower Net Purchase Price but accepts a Debtor Risk Attestation.
- The Seller may choose Funder B if reduced disclosure is worth the price difference.

### 7. RFQ Disclosure Package is attestation-first

Before quoting, a Funder should receive an RFQ Disclosure Package.

The package should contain Core Pre-Quote Facts necessary for a meaningful quote, while minor or scenario-specific information goes into Supplemental RFQ Information.

Core Pre-Quote Facts for the MVP:

- Face value and currency.
- Due date or days until due.
- Receivable validity attestation.
- Debtor Risk Attestation.
- Seller eligibility attestation.
- Jurisdiction or compliance eligibility attestation.
- Recourse preference.
- Settlement preference.
- Disclosure boundary.

Supplemental RFQ Information is a flexible optional field for non-core details such as industry category, dispute notes, payment history summary, notification preference, extra document references, insurance notes, or custom due-diligence requests.

### 8. Debtor Notification is optional and disclosure-controlled

The Debtor should not automatically participate in the RFQ.

The default MVP posture is a Confidential Receivable Sale during the RFQ phase.

A Disclosed Receivable Sale remains possible if notification is required by the Winning Quote, settlement terms, compliance, jurisdiction, enforceability, or Seller preference.

### 9. Risk Assessment is a separate optional scoped role

The Risk Assessor is optional but distinct from Compliance, Audit, Regulation, Coordination, and Funding.

Recommended role split:

- Compliance Party decides eligibility.
- Risk Assessor issues Risk Attestations.
- Funders price the risk.
- Seller selects the Best Compliant Quote.
- Auditor or Regulator receives scoped proof.

The MVP can mock the Risk Assessor while preserving the role in the domain model.

### 10. Proof of Funds gates quote submission but does not lock funds

A Funder should provide Proof of Funds to be eligible to submit a serious Private Quote. The goal is to reduce unserious or impossible bids and preserve a path for stronger mechanisms later.

Proof of Funds should be stated carefully: it proves funding capacity at a relevant verification point, but does not by itself lock funds, reserve funds, escrow funds, prevent the same funds from supporting multiple quotes, prevent later spending, or guarantee settlement.

The exact Proof-of-Funds mechanism is intentionally unresolved for now. It may later be an on-ledger funds check, a mocked check, a Funding Capacity Attestation, a settlement-bank or custodian check, or an upgraded lock or escrow model.

### 11. Seller selection uses a Seller Quote View

The Seller should receive enough information to select the Best Compliant Quote, but not unnecessary Funder information.

The Seller Quote View should contain the minimum Seller-visible comparison fields needed for selection, such as Net Purchase Price, settlement timing, recourse model, fees or holdback, Required Disclosure, Debtor Notification requirement, compliance status, and Proof-of-Funds status.

The Seller Quote View should not reveal raw Funder balances, raw Proof-of-Funds evidence, funding sources, or full Funder identity unless required by RFQ terms, compliance, selection, closing, settlement, or applicable rules.

This does not yet guarantee Winning-Only Disclosure. In the MVP, the Seller may see multiple eligible quote comparison fields. Hiding all Unselected Quote terms from the Seller remains a stretch privacy ambition unless the quote-selection protocol makes it practical.

### 12. Funder identity is disclosed only when needed

Funder identity should be hidden by default in the Seller Quote View, while still allowing identity disclosure when identity is part of the Seller's Selection Criteria, Required Disclosure, compliance, closing, settlement, audit, regulation, or RFQ terms.

The goal is Funder Identity Minimization, not an absolute ban on identity disclosure. A Seller may choose to require known Funder identity before selection, but that requirement becomes part of the RFQ's Disclosure Boundary and should be visible to Funders as a term of participation.

Recommended default lifecycle:

- During RFQ invitation and quote submission, Funders do not see each other through the RFQ workflow.
- The Coordinator does not see quote contents or full quote-linked Funder identities by default.
- In the Seller Quote View, Funders are pseudonymous or represented through eligibility and status attestations by default.
- At selection, closing, or settlement, the Winning Funder identity may be revealed if needed.
- For audit or regulation, Funder identity disclosure should remain scoped to the relevant requirement.

### 13. Fallback ordering is Seller-controlled

If the Selected Quote fails before RFQ Finality, fallback should be controlled by the Seller rather than automatically promoting the highest-price quote.

The Seller may define a Fallback Queue from still-valid Eligible Quotes when selecting the Best Compliant Quote. A Fallback Quote can be promoted if the Selected Quote fails during the Settlement Window, provided the fallback remains eligible, unexpired, and acceptable under the RFQ's Selection Criteria.

This preserves real RFQ behavior because the next-best quote may not be the second-highest Net Purchase Price. Settlement timing, Required Disclosure, recourse, Proof-of-Funds status, Debtor Notification requirements, identity constraints, and compliance can all affect fallback ordering.


### 14. Private Quotes are binding until Quote Expiry for the MVP

For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period. A Funder cannot freely withdraw a submitted eligible quote unless the RFQ terms explicitly allow withdrawal.

Each Private Quote should have a Quote Expiry. After Quote Expiry, the quote is no longer selectable or promotable as a Fallback Quote unless refreshed or resubmitted.

This preserves fallback usefulness without trapping Funders indefinitely. It also keeps the MVP realistic: quotes can remain open for acceptance during a defined validity period, while avoiding open-ended commitment.

This decision does not claim that funds are locked, reserved, escrowed, or guaranteed through settlement. It also does not add financial penalties for the MVP; penalties remain a future design branch.

## Main roles

| Role | Meaning |
|---|---|
| Seller | Owns the Receivable and seeks liquidity. |
| Debtor | Owes payment on the Receivable. |
| Funder | Submits a Proof-Backed Private Quote to purchase the Receivable. |
| Coordinator | Routes invitations, deadlines, and workflow status, but should not see Private Quote contents by default. |
| Compliance Party | Determines legal, policy, jurisdiction, KYC, sanctions, or other eligibility. |
| Risk Assessor | Optional scoped party that evaluates Debtor Risk or Receivable Risk and issues Risk Attestations. |
| Auditor | Non-government assurance party that may receive scoped audit evidence. |
| Regulator | Government authority or regulatory delegate that may receive compliance-relevant disclosures. |
| Settlement Bank | Possible settlement party for payment confirmation or future payment integration. |
| Funding Evidence Provider | Optional scoped party or service that may verify Proof of Funds if the chosen mechanism requires it. |

## Main workflow as currently understood

1. Seller creates or references a Receivable.
2. Seller defines RFQ parameters and disclosure boundaries.
3. Optional Risk Assessor issues Risk Attestations.
4. Compliance Party provides required eligibility attestations.
5. Funders receive RFQ Disclosure Packages.
6. Funders submit Private Quotes with quote-scoped Proof of Funds and a Quote Expiry.
7. Bidding closes; eligible still-valid Binding Quotes become Pending Quotes.
8. Private Quotes remain hidden from competing Funders and Coordinators by default.
9. Seller receives a Seller Quote View for Eligible Quotes, with Funder identity hidden by default unless disclosure is required.
10. Seller selects the Best Compliant Quote as the Selected Quote for attempted settlement.
11. Seller may define a Seller-Controlled Fallback Queue from other still-valid Eligible Quotes.
12. The RFQ enters the Settlement Window: the Selected Quote attempts to fund and settle while Pending Quotes may remain available as Fallback Quotes.
13. If settlement succeeds, the Selected Quote becomes the Winning Quote and the Receivable Sale completes.
14. If settlement fails before RFQ Finality, the Seller may promote a Fallback Quote from the Fallback Queue.
15. After RFQ Finality, pending fallback rights end.
16. Auditor or Regulator receives a scoped Compliance Receipt if required.

## Seller Quote View

The Seller Quote View is the canonical selection surface.

Recommended MVP-visible comparison fields:

| Field | Seller visibility |
|---|---|
| Net Purchase Price | Visible |
| Settlement timing | Visible |
| Recourse model | Visible |
| Fees / reserve / holdback | Visible |
| Required Disclosure | Visible |
| Debtor Notification requirement | Visible |
| Compliance status | Visible as an attestation |
| Proof-of-Funds status | Visible as a status or attestation |
| Raw Proof-of-Funds data | Hidden unless required |
| Funder legal identity | Hidden by default; reveal only if required |
| Funder raw balances or funding sources | Hidden |

Identity timing rule:

- Funder identity is hidden by default in the Seller Quote View.
- Funder identity may be revealed before selection only if the Seller makes identity part of its Selection Criteria or Disclosure Boundary.
- Winning Funder identity may be revealed at selection, closing, settlement, or regulatory disclosure if required.
- Unselected Funder identity remains private as far as practically achievable.

## Fallback model

Fallback applies only before RFQ Finality.

Recommended fallback rules:

- Fallback ordering is Seller-controlled, not automatically highest-price.
- Only still-valid Eligible Quotes within their Quote Validity Period can be fallback candidates.
- A Fallback Quote must still satisfy the Proof-of-Funds Gate, or refresh it if the selected mechanism requires freshness.
- A Fallback Quote may be promoted only if the current Selected Quote fails before finality and the fallback has not passed Quote Expiry.
- The Seller may promote a fallback, reopen the RFQ, or cancel depending on RFQ terms.
- A completed Receivable Sale does not fall back. A later Funder exit is a separate secondary transaction.

Privacy posture:

- Competing Funders should not see fallback ordering.
- The Coordinator should see workflow status, not quote contents.
- Auditor or Regulator may receive a scoped receipt saying fallback occurred without exposing the full Quote Book unless required.
- Unselected Funder and Unselected Quote privacy remain ambitions unless technically enforced.

## Quote Terms currently in scope

A Private Quote may include:

- Net Purchase Price.
- Settlement timing.
- Recourse or non-recourse model.
- Fees.
- Reserve or holdback.
- Required Disclosure.
- Debtor Notification requirement.
- Quote Validity Period and Quote Expiry.
- Proof-of-Funds status or evidence for bidding eligibility.
- Settlement requirements.
- Fallback availability or expiry.
- Withdrawal rule, if the RFQ allows Withdrawable Quotes.

The MVP should not claim that Proof of Funds is the same as locked or reserved funds.

## Privacy guarantees vs ambitions

### MVP guarantees to aim for

These should be safe to claim if implemented correctly:

- Funders cannot see competing Funders' Private Quotes.
- Coordinator cannot read Private Quote contents by default.
- Outsiders cannot inspect Receivables, quote activity, Seller balances, or RFQ results.
- Auditor and Regulator receive scoped receipts or disclosures rather than full workflow visibility.
- Sensitive Attributes are not disclosed as raw data unless required.
- Seller sees only the comparison fields needed to choose the Best Compliant Quote, not raw Funder data, raw Proof-of-Funds evidence, full balances, funding sources, or full Funder identity unless required by purpose.

### Stretch privacy ambitions

These are valuable but should not be overclaimed until the protocol design is chosen:

- Seller sees only the Winning Quote rather than the full Quote Book.
- Unselected Funders remain hidden from the Seller unless identity disclosure is required by the RFQ terms, compliance, closing, settlement, or regulation.
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
- A system that automatically promotes fallback quotes purely by highest headline price.

## Open design questions

### 1. Quote-selection mechanism

How does the Seller evaluate or receive enough information to select the Best Compliant Quote while minimizing disclosure?

Current boundary: the Seller Quote View is the MVP selection surface, but stronger Winning-Only Disclosure remains a stretch privacy ambition.

### 2. Proof-of-Funds mechanism

Proof of Funds is useful as a bidding eligibility gate, but it is not a settlement guarantee.

Current boundary: Proof of Funds screens for funding capacity at a relevant point. It does not mean funds are locked, reserved, escrowed, prevented from later movement, or guaranteed for settlement unless a later design explicitly adds that mechanism.

Open options include a mocked proof, an on-ledger funds check, a Funding Capacity Attestation, a Funding Evidence Provider, or a settlement-bank check. Stronger mechanisms such as Funding Lock, escrow, or Quote Bond remain future upgrades and should not be claimed by the MVP unless explicitly implemented.

### 3. Validity duration and penalties

Current boundary: for the MVP, Private Quotes are Binding Quotes during their Quote Validity Period and expire at Quote Expiry. Withdrawal is not the default unless RFQ terms explicitly allow it.

Open detail: exact validity duration and any real-world penalty or enforcement mechanism are not yet decided.

### 4. Commitment Failure consequences

What is disclosed or penalized when a Selected Quote fails during the Settlement Window?

Open options include no penalty, reputation impact, a Quote Bond, exclusion from future RFQs, or scoped audit disclosure.

### 5. Post-settlement exit

If a Funder buys the Receivable and later wants to exit, is that a secondary sale, reassignment, or separate RFQ?

Current boundary: after a Receivable Sale completes, Funder exit should be treated as a new transaction, not a fallback.

### 6. Debtor identity disclosure

When, if ever, must the Debtor identity be revealed?

The default model prefers attestations before quote submission, with raw disclosure only if required by quote terms, compliance, settlement, or enforceability.

### 7. Settlement model

What exactly transfers in the MVP: mock cash, Canton Coin/Amulet, off-ledger settlement confirmation, or another payment representation?

Not resolved yet.

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

## Working product language

Use this wording for now:

> CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. Funders submit Binding Private Quotes with quote-scoped Proof of Funds and Quote Expiry, Sellers select the Best Compliant Quote through a minimal Seller Quote View, fallback quotes can be promoted before finality if settlement fails, Compliance and Risk parties provide scoped attestations, and Auditors or Regulators receive selective proof-of-compliance receipts without exposing unnecessary bidders, quotes, identities, balances, or sensitive commercial data.

## Current ADRs

- ADR 0001: Model the MVP as a Receivable Sale, Not a Secured Loan.
- ADR 0002: Target Maximum Practical Privacy for RFQs.
- ADR 0003: Preserve Real-World RFQ Functionality Before Optimizing Privacy.
- ADR 0004: Make Debtor Notification Optional and Disclosure-Controlled.
- ADR 0005: Require Funding Capacity Evidence During Bidding. This decision is refined by ADR 0006.
- ADR 0006: Require Proof of Funds as Bid Eligibility Evidence, Not a Funding Lock.
- ADR 0007: Control Funder Identity Disclosure Timing.
- ADR 0008: Use a Seller-Controlled Fallback Queue.
- ADR 0009: Use Binding Quotes with Quote Expiry for the MVP.
