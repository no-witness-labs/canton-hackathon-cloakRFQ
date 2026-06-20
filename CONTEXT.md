# Context

## Glossary

### CloakRFQ Receipts

A private, functionality-preserving RFQ marketplace for Receivable Sales on Canton, where Funders submit Private Quotes, Sellers select the Best Compliant Quote, scoped parties provide attestations, and Auditors or Regulators receive selective compliance evidence without unnecessary disclosure.

### Receivable

A private financial claim owed to a Seller that can be offered into a private RFQ financing process.

### Receivable Sale

A transaction in which a Seller sells a Receivable to a Funder, typically at a discount to face value, rather than borrowing against it.

### Factoring

A business term for a Receivable Sale. Prefer "Receivable Sale" in product language unless explaining the concept to a finance audience.

### Real-World Asset (RWA)

A broader category for assets or claims represented in the system. The MVP uses Receivable as the canonical financed asset rather than a generic RWA.

### Seller

The participant that owns a Receivable and seeks liquidity by offering it through a private RFQ process.

### Debtor

The party obligated to pay a Receivable. In invoice-focused examples, the Debtor is usually the Seller's customer.

### Funder

A participant that submits a Private Quote to purchase a Receivable in a private RFQ process. Prefer "Funder" over "Lender" because the MVP is a Receivable Sale rather than a loan.

### Lender

A participant that provides a loan to a borrower. This term is not part of the MVP's canonical language unless the product later adds secured lending.

### Coordinator

A participant or service that may help route invitations, deadlines, and workflow status in the RFQ process without being entitled to read Private Quote contents by default.

### Compliance Party

The participant that determines whether parties and transactions satisfy applicable eligibility, policy, or regulatory requirements.

### Risk Assessor

An optional scoped party that evaluates Debtor Risk or Receivable Risk and issues Risk Attestations without acting as the Coordinator, Compliance Party, Auditor, Regulator, Funder, Seller, or quote selector.

### Auditor

A non-government assurance party that may receive scoped audit evidence without receiving the full private RFQ workflow.

### Regulator

A government authority or regulatory delegate that may receive compliance-relevant disclosures without receiving the full private RFQ workflow.

### Funding Evidence Provider

An optional scoped party or service that verifies Proof of Funds if the chosen Proof-of-Funds mechanism requires an external verifier.

### Debtor Risk

The commercial risk that the Debtor will not pay the Receivable in full and on time.

### Receivable Risk

The commercial, legal, or operational risk that a Receivable is invalid, disputed, diluted, restricted from assignment, previously assigned or encumbered, unenforceable, fraudulent, or otherwise less collectible than represented.

### Risk Attestation

A selective statement from a Risk Assessor about Debtor Risk or Receivable Risk that helps Funders price a Receivable without necessarily disclosing all raw Debtor, Seller, invoice, or underwriting data.

### Eligibility Attestation

A selective statement that a party satisfies a specific eligibility or compliance rule without disclosing all underlying attributes used to make that determination.

### Compliance Receipt

A selectively disclosed record that states the compliance-relevant outcome of a Receivable Sale workflow without revealing unnecessary commercial or personal information.

### Selective Disclosure

The intentional disclosure of only the specific facts a party needs for a defined purpose, rather than disclosing the full underlying workflow, Quote Book, identity, or asset record.

### Sensitive Attribute

A personal or organizational attribute that is not part of the ordinary commercial quote decision and should not be disclosed unless specifically required for compliance.

### Disclosure Boundary

The Seller-defined boundary for what information may be disclosed before quoting, after selection, during settlement, or to Auditors and Regulators.

### Debtor Notification

A disclosure to the Debtor that the Receivable has been assigned or sold. Debtor Notification is optional and disclosure-controlled in the MVP rather than always required.

### Confidential Receivable Sale

A Receivable Sale where the Debtor is not notified during the RFQ process unless notification becomes required by the transaction terms, settlement model, or applicable rules.

### Disclosed Receivable Sale

A Receivable Sale where the Debtor is notified of the assignment or sale, usually after selection or as part of settlement or compliance requirements.

### Blind RFQ

A private request-for-quote process in which Funders do not see competing quotes, outsiders do not see the process, and no ordinary Coordinator receives the full Quote Book by default.

### Private Quote

A Funder's confidential offer to purchase a Receivable in a Blind RFQ. A Private Quote is disclosed only according to the RFQ's selective disclosure rules.

### Quote Book

The set of Private Quotes submitted for a Blind RFQ.

### Quote Terms

The commercial, operational, and disclosure terms contained in a Private Quote, such as purchase price, fees, reserve or holdback, settlement timing, recourse, Required Disclosure, Debtor Notification requirement, Quote Expiry, and Proof-of-Funds status.

### Net Purchase Price

The amount of money the Seller expects to receive from a Private Quote after applying the quote's discount, fees, reserves, and other economic terms.

### Required Disclosure

The information a Funder requires the Seller or workflow to disclose as a condition of making or completing a Private Quote. Required Disclosure is part of the quote's terms and can affect whether the Seller considers that quote the Best Compliant Quote.

### Best Compliant Quote

The eligible Private Quote selected by the Seller to complete a Receivable Sale after required compliance checks. Net Purchase Price is a primary comparison term, but the Seller may also consider other Selection Criteria.

### Selection Criteria

The Seller-defined commercial, risk, timing, disclosure, identity, and compliance factors used to determine which Private Quote is the best eligible quote for a Receivable Sale.

### Seller Selection Discretion

The Seller's right to select the Best Compliant Quote according to the RFQ's Selection Criteria, rather than being forced to accept the quote with the highest headline price.

### Seller Quote View

The minimum Seller-visible comparison view needed to select the Best Compliant Quote from Eligible Quotes.

### Pseudonymous Funder View

A Seller Quote View presentation in which a Funder can be compared without revealing its full legal identity unless disclosure is required.

### Funder Identity Disclosure Timing

The rule governing when a Funder's identity is revealed during RFQ, selection, closing, settlement, audit, or regulation.

### Funder Identity Minimization

The product principle that Funder identity should stay hidden or pseudonymous unless there is a real workflow reason to reveal it.

### Winning Quote

The Private Quote that completes a Receivable Sale.

### Selected Quote

The Private Quote selected by the Seller for attempted settlement. A Selected Quote is not final until settlement succeeds or the RFQ otherwise reaches finality.

### Unselected Quote

A Private Quote that is not selected to complete a Receivable Sale. Prefer "Unselected Quote" over "lost bid" in product language.

### Pending Quote

An eligible, still-valid Private Quote that may remain available while a Selected Quote attempts settlement.

### Fallback Quote

A Pending Quote that may be selected if the current Selected Quote fails before RFQ Finality.

### Seller-Controlled Fallback Queue

The Seller-controlled ordered set of still-valid Eligible Quotes that may be promoted if the current Selected Quote fails before RFQ Finality.

### Quote Expiry

The time after which a Private Quote is no longer selectable unless refreshed or resubmitted.

### Quote Validity Period

The period during which a Private Quote remains eligible for selection or fallback promotion.

### Binding Quote

A Private Quote that cannot be arbitrarily withdrawn during its Quote Validity Period unless the RFQ terms explicitly allow withdrawal.

### RFQ Disclosure Package

The minimum set of disclosed facts and attestations a Funder receives before deciding whether to submit a Private Quote.

### Core Pre-Quote Facts

The major commercial facts and attestations needed to make a Receivable meaningfully quotable without turning the MVP into a full receivables-finance underwriting system.

### Supplemental RFQ Information

Optional non-core information that may matter in some receivables-finance scenarios but is not required to preserve the MVP's core RFQ meaning.

### Proof of Funds

Evidence that a Funder has enough liquid or committed funding capacity to support a Private Quote at a relevant verification point.

### Proof-of-Funds Gate

The requirement that a Funder provide acceptable quote-scoped Proof of Funds before a Private Quote can be treated as eligible.

### Funding Capacity Attestation

A possible form of quote-scoped Proof of Funds stating that a Funder can support a Private Quote without revealing full balances or funding sources.

### Reusable Funds Caveat

The accepted limitation that Proof of Funds may show funds existed at a verification point while not preventing the same funds from supporting multiple bids or being spent later unless a stronger mechanism is added.

### Funding Lock

A stronger future mechanism that reserves or locks funds for a Private Quote. The MVP should not claim Funding Lock behavior unless it is explicitly implemented.

### Quote Bond

An optional future security or penalty deposit intended to discourage unserious Private Quotes. A Quote Bond is distinct from Proof of Funds because it does not necessarily prove capacity to fund the full purchase price.

### Settlement Window

The phase after the Seller selects a quote and before RFQ Finality. During the Settlement Window, the Selected Quote attempts settlement while eligible Pending Quotes may remain available as Fallback Quotes.

### Commitment Failure

Failure by the Selected Quote's Funder to complete funding or settlement during the Settlement Window.

### RFQ Finality

The point after which the Receivable Sale is complete or fallback rights end.

### Maximum Practical Privacy

The product objective of minimizing disclosure as far as realistically achievable while preserving Real-World RFQ Functionality. This term does not authorize changing the core financial workflow merely to obtain stronger privacy.

### Functionality-Preserving Privacy

The product principle that CloakRFQ Receipts should preserve real-world RFQ behavior first, then maximize privacy within that constraint.

### Real-World RFQ Functionality

The core business behavior of a financial RFQ process that should be preserved even when privacy goals are added.

### Best-Deal RFQ

An RFQ process in which the Winning Quote is expected to be the best eligible offer according to the Seller's Selection Criteria, rather than merely the first quote or any quote above a threshold.

### Threshold Acceptance RFQ

An RFQ process where any quote satisfying a pre-defined threshold may be accepted without preserving the full best-deal selection behavior. This is not the canonical MVP model.

### Winning-Only Disclosure

The Privacy Ambition that the Seller receives only the Winning Quote and not the full Quote Book, where this can be achieved without weakening Real-World RFQ Functionality.

### Unselected Funder Privacy

The Privacy Ambition that Funders and Private Quotes not selected for a Receivable Sale remain undisclosed as much as practically achievable, without distorting the real-world RFQ process.

### Unselected Quote Privacy

The Privacy Ambition that Private Quotes not selected for a Receivable Sale remain hidden from parties that do not need them, as far as practically achievable.

### Privacy Ambition

A desired privacy outcome that guides the product direction but has not yet been committed to as an MVP-enforced guarantee.

### Privacy Guarantee

A privacy property that the product explicitly claims to enforce in the current implementation.
