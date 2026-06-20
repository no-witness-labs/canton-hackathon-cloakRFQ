# CloakRFQ Receipts — Current Project Brief

Last updated: 2026-06-18

## Working product definition

CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. Sellers offer Receivables into a Blind RFQ, Funders submit Private Quotes, Compliance Parties approve participants privately, the Seller selects the Best Compliant Quote, and the completed transaction can generate a scoped Compliance Receipt for Auditors or Regulators.

The product's guiding question is:

> How private can we make this real RFQ workflow?

not:

> What weaker workflow can we build to satisfy a privacy target?

## Canonical one-line pitch

A private RFQ marketplace for receivable-backed financing on Canton, where Funders submit confidential quotes, compliance and risk checks are disclosed selectively, and the final deal produces a proof-of-compliance receipt without exposing unnecessary bidders, quote details, identity data, or commercial records.

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
- Reveal only the Winning Quote to the Seller if this can be achieved without weakening real RFQ functionality.
- Avoid any single non-essential party seeing the full Quote Book.

### 4. Functionality comes before privacy optimization

The product should preserve the real-world RFQ function first, then add privacy around it.

Do not simplify the RFQ into a threshold-only or first-acceptable-quote process merely because it is easier to make private.

The canonical process is a Best-Deal RFQ: the Seller should be able to compare eligible offers according to meaningful Selection Criteria.

### 5. Best deal is Seller-selected, not automatically highest price

The Seller selects the Best Compliant Quote after required compliance checks.

The default MVP economic comparison is Net Purchase Price, but Seller Selection Discretion matters. A lower headline price may be better if it settles faster, requires less disclosure, has better recourse terms, or is more compliant.

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

## Main roles

### Seller

Owns the Receivable and seeks liquidity.

### Debtor

Owes payment on the Receivable.

### Funder

Submits a Private Quote to purchase the Receivable.

### Coordinator

May route invitations, deadlines, and workflow status, but should not see Private Quote contents by default.

### Compliance Party

Determines whether parties and transactions satisfy eligibility, policy, jurisdiction, KYC, sanctions, or other compliance rules.

### Risk Assessor

Optional scoped party that evaluates Debtor Risk or Receivable Risk and issues Risk Attestations.

### Auditor

Non-government assurance party that may receive scoped audit evidence.

### Regulator

Government authority or regulatory delegate that may receive compliance-relevant disclosures.

### Settlement Bank

Potential settlement party for mock payment confirmation or future real payment integration. This role has been discussed but is not yet fully resolved.

## Main workflow as currently understood

1. Seller creates or references a Receivable.
2. Seller defines the RFQ parameters and disclosure boundaries.
3. Optional Risk Assessor issues Risk Attestations.
4. Compliance Party provides required eligibility attestations.
5. Funders receive RFQ Disclosure Packages.
6. Funders submit Private Quotes.
7. Private Quotes remain hidden from competing Funders and Coordinators by default.
8. Seller selects the Best Compliant Quote according to Selection Criteria.
9. Winning Quote moves toward funding and settlement.
10. Receivable Sale completes.
11. Auditor or Regulator receives a scoped Compliance Receipt.

## Quote Terms currently in scope

A Private Quote may include:

- Net Purchase Price.
- Settlement timing.
- Recourse or non-recourse model.
- Fees.
- Reserve or holdback.
- Required Disclosure.
- Debtor Notification requirement.
- Quote expiry.
- Funding requirements.

Quote expiry and funding requirements are not fully resolved yet.

## Privacy guarantees vs ambitions

### MVP guarantees to aim for

These should be safe to claim if implemented correctly:

- Funders cannot see competing Funders' Private Quotes.
- Coordinator cannot read Private Quote contents by default.
- Outsiders cannot inspect Receivables, quote activity, Seller balances, or RFQ results.
- Auditor and Regulator receive scoped receipts or disclosures rather than full workflow visibility.
- Sensitive Attributes are not disclosed as raw data unless required.

### Stretch privacy ambitions

These are valuable but should not be overclaimed until the protocol design is chosen:

- Seller sees only the Winning Quote rather than the full Quote Book.
- Unselected Funders remain hidden from the Seller.
- Unselected Quotes remain hidden from everyone except the submitting Funder.
- Quote selection can happen without any single non-essential party seeing the full Quote Book.

## Important non-goals for the MVP

The MVP should not become:

- A full secured lending protocol.
- A generic RWA tokenization platform.
- A full DEX or AMM.
- A full invoice verification or underwriting platform.
- A full cryptographic blind auction unless implementation feasibility is proven.
- A production-grade settlement or payment network.
- A system that changes the RFQ into threshold acceptance purely for privacy reasons.

## Open design questions

### 1. Quote-selection mechanism

How does the Seller evaluate or receive enough information to select the Best Compliant Quote while minimizing disclosure?

This is the largest unresolved privacy/protocol question.

### 2. Funder failure after selection

What happens if the Winning Funder is selected but does not fund?

Potential terms discussed but not yet locked:

- Funding Commitment.
- Funding Window.
- Fallback Quote.
- Fall back to second-best / third-best still-valid compliant quotes.
- Quote bond or penalty deposit.

### 3. Funds locking

Should funds be locked before quoting, after winning, or only at settlement?

Initial intuition: avoid locking full funds from every Funder upfront, but require some commitment from the Winning Funder after selection. This is not yet resolved.

### 4. Post-settlement exit

If a Funder buys the Receivable and later wants to exit, is that a secondary sale, reassignment, or separate RFQ?

This should be treated as a new transaction, not a fallback, but the exact model is not yet resolved.

### 5. Debtor identity disclosure

When, if ever, must the Debtor identity be revealed?

The default model prefers attestations before quote submission, with raw disclosure only if required by quote terms, compliance, settlement, or enforceability.

### 6. Settlement model

What exactly transfers in the MVP: mock cash, Canton Coin/Amulet, off-ledger settlement confirmation, or another payment representation?

Not resolved yet.

## Current demo idea

Show multiple party views:

- Seller sees the Receivable, RFQ, selected quote, and final sale state.
- Funder A sees only its RFQ Disclosure Package and its own Private Quote.
- Funder B sees only its RFQ Disclosure Package and its own Private Quote.
- Coordinator sees workflow status but not quote contents.
- Compliance sees eligibility data and can produce attestations.
- Risk Assessor sees only risk-relevant data and produces Risk Attestations.
- Auditor or Regulator sees a Compliance Receipt, not the full RFQ.
- Outsider sees nothing useful.

## Working product language

Use this wording for now:

> CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. Funders submit Private Quotes, Sellers select the Best Compliant Quote, Compliance and Risk parties provide scoped attestations, and Auditors or Regulators receive selective proof-of-compliance receipts without exposing unnecessary bidders, quotes, identities, or sensitive commercial data.

## Current ADRs

- ADR 0001: Model the MVP as a Receivable Sale, Not a Secured Loan.
- ADR 0002: Target Maximum Practical Privacy for RFQs.
- ADR 0003: Preserve Real-World RFQ Functionality Before Optimizing Privacy.
- ADR 0004: Make Debtor Notification Optional and Disclosure-Controlled.
