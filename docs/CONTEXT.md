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

A private request-for-quote process in which Funders do not see competing quotes, outsiders do not see the process, and no ordinary marketplace coordinator receives the full quote book by default.

### Private Quote

A Funder's confidential offer to purchase a Receivable in a Blind RFQ. A Private Quote is disclosed only according to the RFQ's selective disclosure rules.

### Quote Book

The set of Private Quotes submitted for a Blind RFQ.

### Winning Quote

The Private Quote selected to complete a Receivable Sale.

### Unselected Quote

A Private Quote that is not selected to complete a Receivable Sale. Prefer "Unselected Quote" over "lost bid" in product language.

### Best Compliant Quote

The eligible Private Quote selected by the Seller to complete a Receivable Sale after required compliance checks. For the MVP, the default economic comparison is Net Purchase Price, but the Seller may also consider other Selection Criteria.

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

The intentional disclosure of only the specific facts a party needs for a defined purpose, rather than disclosing the full underlying workflow, quote book, identity, or asset record.

### Regulatory Disclosure

A selectively disclosed fact or record provided to a Regulator because an applicable rule requires it.

### Eligibility Attestation

A selective statement that a party satisfies a specific eligibility or compliance rule without disclosing all underlying attributes used to make that determination.

### Compliance Receipt

A selectively disclosed record that states the compliance-relevant outcome of a Receivable Sale workflow without revealing unnecessary commercial or personal information.

### Sensitive Attribute

A personal or organizational attribute that is not part of the ordinary commercial quote decision and should not be disclosed unless specifically required for compliance.

### Privacy Ambition

A desired privacy outcome that guides the product direction but has not yet been committed to as an MVP-enforced guarantee.

### Privacy Guarantee

A privacy property that the product explicitly claims to enforce in the current implementation.

### Maximum Practical Privacy

The product objective of minimizing disclosure as far as realistically achievable while preserving Real-World RFQ Functionality. This term does not authorize changing the core financial workflow merely to obtain stronger privacy.

### Functional Fidelity

The product principle that privacy mechanisms should preserve the real-world business behavior of the RFQ process rather than replacing it with a materially different workflow.

### Functionality-Preserving Privacy

The product principle that CloakRFQ Receipts should preserve real-world RFQ behavior first, then maximize privacy within that constraint. If a privacy mechanism would materially change the business meaning of the RFQ, the product should reduce the privacy claim rather than alter the financial workflow.

### Market Fidelity

The degree to which the product preserves recognizable real-world RFQ behavior, including competitive quoting, compliance eligibility, commercial quote comparison, Seller selection, settlement, and scoped audit or regulatory disclosure.

### Real-World RFQ Functionality

The core business behavior of a financial RFQ process that should be preserved even when privacy goals are added. Privacy features should be evaluated by asking how much privacy can be added to this functionality, not by replacing the functionality with a simpler private substitute.

### Best-Deal RFQ

An RFQ process in which the Winning Quote is expected to be the best eligible offer according to the Seller's Selection Criteria, rather than merely the first quote or any quote above a threshold.

### Threshold Acceptance RFQ

An RFQ process where any quote satisfying a pre-defined threshold may be accepted without preserving the full best-deal selection behavior. This is not the canonical MVP model.

### Winning-Only Disclosure

The Privacy Ambition that the Seller receives only the Winning Quote and not the full Quote Book, where this can be achieved without weakening Real-World RFQ Semantics.

### Unselected Funder Privacy

The Privacy Ambition that Funders and Private Quotes not selected for a Receivable Sale remain undisclosed as much as practically achievable, without distorting the real-world RFQ process.

### Unselected Quote Privacy

The Privacy Ambition that Private Quotes not selected for a Receivable Sale remain hidden from parties that do not need them, as far as practically achievable.
