# Context

## Glossary

### CloakRFQ Receipts

A private, functionality-preserving RFQ marketplace for Receivable Sales on Canton, where Funders submit Private Quotes, the Seller selects the Best Compliant Quote, compliance and regulatory parties receive scoped disclosures, and the product maximizes privacy without changing how real-world RFQs work.

### Receivable

A private financial claim owed to a Seller that can be offered into a private RFQ financing process.

### Receivable Sale

A transaction in which a Seller sells a Receivable to a Funder, typically at a discount to face value, rather than borrowing against it.

### Factoring

A business term for a Receivable Sale. Prefer "Receivable Sale" in the product language unless explaining the concept to a finance audience.

### Real-World Asset (RWA)

A broader category for assets or claims represented in the system. The MVP uses Receivable as the canonical financed asset rather than a generic RWA.

### Seller

The participant that owns a Receivable and seeks liquidity by offering it through a private RFQ process.

### Funder

A participant that submits a Private Quote to purchase a Receivable in a private RFQ process. Prefer "Funder" over "Lender" because the MVP is a Receivable Sale rather than a loan.

### Bidder

An informal synonym for Funder in RFQ or auction-style explanations. Prefer "Funder" in canonical product language.

### Lender

A participant that provides a loan to a borrower. This term is not part of the MVP's canonical language unless the product later adds secured lending.

### Debtor

The party obligated to pay a Receivable. In invoice-focused examples, the Debtor is usually the Seller's customer.

### Debtor Risk

The commercial risk that the Debtor will not pay the Receivable in full and on time.

### Receivable Risk

The commercial, legal, or operational risk that a Receivable is invalid, disputed, diluted, restricted from assignment, previously assigned or encumbered, unenforceable, fraudulent, or otherwise less collectible than represented.

### Risk Assessor

An optional scoped party that evaluates Debtor Risk or Receivable Risk and issues Risk Attestations without acting as the Coordinator, Compliance Party, Auditor, Regulator, Funder, Seller, or quote selector.

### Risk Attestation

A selective statement from a Risk Assessor about Debtor Risk or Receivable Risk that helps Funders price a Receivable without necessarily disclosing all raw Debtor, Seller, invoice, or underwriting data.

### Debtor Risk Attestation

A risk statement about the Debtor that helps Funders price a Receivable without necessarily disclosing all raw Debtor information.

### Debtor Notification

A disclosure to the Debtor that the Receivable has been assigned or sold. Debtor Notification is optional and disclosure-controlled in the MVP rather than always required.

### Confidential Receivable Sale

A Receivable Sale where the Debtor is not notified during the RFQ process unless notification becomes required by the transaction terms, settlement model, or applicable rules.

### Disclosed Receivable Sale

A Receivable Sale where the Debtor is notified of the assignment or sale, usually after selection or as part of settlement or compliance requirements.

### Blind RFQ

A private request-for-quote process in which Funders do not see competing quotes, outsiders do not see the process, and no ordinary marketplace Coordinator receives the full Quote Book by default.

### Private Quote

A Funder's confidential offer to purchase a Receivable in a Blind RFQ. A Private Quote is disclosed only according to the RFQ's selective disclosure rules.

### Proof-Backed Private Quote

A Private Quote that has passed a quote-scoped Proof-of-Funds Gate.

### Quote Book

The set of Private Quotes submitted for a Blind RFQ.

### Eligible Quote

A Private Quote that has passed required eligibility checks, including compliance requirements and any required Proof-of-Funds Gate.

### Pending Quote

A submitted Private Quote whose final outcome has not yet been determined. Pending Quotes may remain available during the Settlement Window so the Seller can fall back to another quote if the Selected Quote fails before RFQ Finality.

### Quote Validity Period

The period during which a Private Quote remains eligible for Seller selection or fallback promotion.

### Quote Expiry

The time after which a Private Quote is no longer selectable or promotable unless the Funder refreshes or resubmits it.

### Binding Quote

A Private Quote that cannot be withdrawn during its Quote Validity Period except under conditions explicitly allowed by the RFQ terms. The MVP uses Binding Quotes with Quote Expiry to preserve fallback reliability without making quotes open-ended.

### Withdrawable Quote

A Private Quote that a Funder may cancel before selection if the RFQ terms explicitly allow withdrawal. This is not the default MVP model.

### Selected Quote

A Private Quote selected by the Seller for attempted settlement. A Selected Quote is not final until settlement succeeds or the RFQ otherwise reaches Finality.

### Winning Quote

The Selected Quote that successfully completes settlement and becomes the basis for the completed Receivable Sale.

### Unselected Quote

A Private Quote that is not selected as the Winning Quote by RFQ Finality. Prefer "Unselected Quote" over "lost bid" in product language.

### Fallback Quote

A Pending Quote that may be selected if the current Selected Quote fails before RFQ Finality.

### Fallback Queue

The Seller-controlled ordered set of still-valid Eligible Quotes that may be promoted if the current Selected Quote fails before RFQ Finality.

### Seller-Controlled Fallback Queue

A Fallback Queue ordered by the Seller according to Selection Criteria rather than automatically by highest price or any single quote field.

### Fallback Promotion

The act of making a Fallback Quote the new Selected Quote after the prior Selected Quote fails before RFQ Finality.

### Best Compliant Quote

The eligible Private Quote selected by the Seller according to the RFQ's Selection Criteria after required compliance checks. The Best Compliant Quote may become a Selected Quote and later a Winning Quote if settlement succeeds.

### Seller Selection Discretion

The Seller's right to select the Best Compliant Quote according to the RFQ's Selection Criteria, rather than being forced to accept the quote with the highest headline price.

### Selection Criteria

The Seller-defined commercial, risk, timing, disclosure, and compliance factors used to determine which Private Quote is the best eligible quote for a Receivable Sale.

### Net Purchase Price

The amount of money the Seller expects to receive from a Private Quote after applying the quote's discount, fees, reserves, and other economic terms.

### Quote Terms

The commercial, operational, and disclosure terms contained in a Private Quote, such as purchase price, fees, reserve or holdback, settlement timing, recourse, and Required Disclosure.

### Required Disclosure

The information a Funder requires the Seller or workflow to disclose as a condition of making or completing a Private Quote. Required Disclosure is part of the quote's terms and can affect whether the Seller considers that quote the Best Compliant Quote.

### RFQ Disclosure Package

The minimum set of disclosed facts and attestations a Funder receives before deciding whether to submit a Private Quote.

### Core Pre-Quote Facts

The major commercial facts and attestations needed to make a Receivable meaningfully quotable without turning the MVP into a full receivables-finance underwriting system.

### Supplemental RFQ Information

Optional non-core information that may matter in some receivables-finance scenarios but is not required to preserve the MVP's core RFQ meaning.

### Seller Quote View

The minimum Seller-visible comparison view needed to select the Best Compliant Quote from Eligible Quotes.

### Funder Identity Disclosure Timing

The rule governing when a Funder's identity is revealed during RFQ, selection, closing, settlement, audit, or regulation.

### Funder Identity Minimization

The product principle that Funder identity should stay hidden or pseudonymous unless there is a real workflow reason to reveal it.

### Pseudonymous Funder View

A Seller Quote View presentation in which a Funder can be compared without revealing its full legal identity unless disclosure is required.

### Coordinator

A participant or service that may help route invitations, deadlines, and workflow status in the RFQ process without being entitled to read Private Quote contents by default.

### Marketplace Operator

Avoid this as a canonical term when possible. If used, it means a Coordinator and not a quote-visible auctioneer.

### Compliance Party

The participant that determines whether parties and transactions satisfy applicable eligibility, policy, or regulatory requirements.

### Regulator

A government authority or regulatory delegate that may receive compliance-relevant disclosures without receiving the full private RFQ workflow.

### Auditor

A non-government assurance party that may receive scoped audit evidence without receiving the full private RFQ workflow.

### Selective Disclosure

The intentional disclosure of only the specific facts a party needs for a defined purpose, rather than disclosing the full underlying workflow, Quote Book, identity, or asset record.

### Regulatory Disclosure

A selectively disclosed fact or record provided to a Regulator because an applicable rule requires it.

### Eligibility Attestation

A selective statement that a party satisfies a specific eligibility or compliance rule without disclosing all underlying attributes used to make that determination.

### Compliance Receipt

A selectively disclosed record that states the compliance-relevant outcome of a Receivable Sale workflow without revealing unnecessary commercial or personal information.

### Sensitive Attribute

A personal or organizational attribute that is not part of the ordinary commercial quote decision and should not be disclosed unless specifically required for compliance.

### Proof of Funds

Evidence that a Funder has enough liquid or committed funding capacity to support a Private Quote at a relevant verification point.

### Proof-of-Funds Gate

The requirement that a Funder provide acceptable quote-scoped Proof of Funds before a Private Quote can be treated as eligible.

### Funding Capacity Attestation

A quote-scoped statement that a Funder can support a Private Quote without revealing full balances or funding sources.

### Funding Evidence Provider

An optional scoped party or service that verifies Proof of Funds if the chosen Proof-of-Funds mechanism requires an external verifier.

### Reusable Funds Caveat

The accepted limitation that Proof of Funds may show funds existed at a verification point while not preventing the same funds from supporting multiple bids or being spent later unless a stronger mechanism is added.

### Funding Lock

A stronger future mechanism that reserves or locks funds for a Private Quote. The MVP should not claim Funding Lock behavior unless it is explicitly implemented.

### Quote Bond

An optional future security deposit or penalty mechanism used to discourage unserious quotes. A Quote Bond is not the same as proving ability to fund the full purchase price.

### Funding Commitment

The Selected Quote Funder's obligation to complete funding or settlement during the Settlement Window.

### Settlement Window

The phase after the Seller selects a quote and before the Receivable Sale reaches finality. During this window, the Selected Quote attempts to settle and eligible Pending Quotes may remain available as Fallback Quotes.

### Commitment Failure

Failure by the Selected Quote's Funder to complete funding or settlement during the Settlement Window.

### RFQ Finality

The point after which the Receivable Sale is complete or fallback rights end.

### Privacy Ambition

A desired privacy outcome that guides the product direction but has not yet been committed to as an MVP-enforced guarantee.

### Privacy Guarantee

A privacy property that the product explicitly claims to enforce in the current implementation.

### Maximum Practical Privacy

The product objective of minimizing disclosure as far as realistically achievable while preserving Real-World RFQ Functionality. This term does not authorize changing the core financial workflow merely to obtain stronger privacy.

### Real-World RFQ Functionality

The core business behavior of a financial RFQ process that should be preserved even when privacy goals are added. Privacy features should be evaluated by asking how much privacy can be added to this functionality, not by replacing the functionality with a simpler private substitute.

### Functionality-Preserving Privacy

The product principle that CloakRFQ Receipts should preserve real-world RFQ behavior first, then maximize privacy within that constraint. If a privacy mechanism would materially change the business meaning of the RFQ, the product should reduce the privacy claim rather than alter the financial workflow.

### Market Fidelity

The degree to which the product preserves recognizable real-world RFQ behavior, including competitive quoting, compliance eligibility, commercial quote comparison, Seller selection, settlement, and scoped audit or regulatory disclosure.

### Functional Fidelity

A synonym for Market Fidelity in product discussions. Prefer "Market Fidelity" or "Real-World RFQ Functionality" when possible.

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
