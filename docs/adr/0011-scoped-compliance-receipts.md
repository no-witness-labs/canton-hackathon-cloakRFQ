# ADR 0011: Use Scoped Compliance Receipts for Audit and Regulatory Disclosure

## Status

Accepted

## Context

CloakRFQ Receipts needs to give Auditors or Regulators enough information to verify that a Receivable Sale workflow followed the required rules. A simple approach would disclose the full RFQ workflow, including all Private Quotes, all Unselected Funders, raw Proof-of-Funds evidence, full invoice documents, full Seller or Debtor data, and all fallback details.

That approach conflicts with the product's privacy goal and with the core value proposition of selective disclosure on Canton. However, hiding everything from audit or regulatory parties would make the workflow unrealistic for receivables finance, where assignment, invoice verification, eligibility, risk, and compliance evidence matter.

## Decision

The MVP will use Scoped Compliance Receipts.

A Scoped Compliance Receipt is a selectively disclosed record that provides statuses, references, attestations, timestamps, and final settlement outcome to an entitled Auditor or Regulator. It should not disclose the full RFQ, full Quote Book, raw Proof-of-Funds evidence, raw Sensitive Attributes, raw invoice documents, or Unselected Funder identities by default.

The receipt should include only the information required for the relevant audit or regulatory purpose, such as:

- RFQ or workflow reference;
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

Additional evidence may be disclosed only when a specific rule, entitled party, or workflow condition requires it.

## Consequences

The MVP can demonstrate auditability without turning the Auditor or Regulator into a full observer of the private marketplace.

The receipt is useful for a hackathon demo because it makes the privacy value visible: the Auditor or Regulator can see that required steps happened while still not seeing all bids, all bidders, or all commercial records.

The product must avoid claiming that the receipt is a zero-knowledge proof unless a cryptographic proof system is actually implemented. The accurate claim is selective disclosure through scoped receipts and attestations.

Future versions can add jurisdiction-specific receipt profiles, richer evidence bundles, cryptographic commitments, proof systems, or regulator-specific disclosure rules.
