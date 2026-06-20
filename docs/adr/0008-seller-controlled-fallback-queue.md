# 0008 - Use a Seller-Controlled Fallback Queue

## Status

Accepted

## Date

2026-06-19

## Context

CloakRFQ Receipts needs a fallback model for cases where the Selected Quote fails to fund or settle before RFQ Finality.

A simple fallback model could automatically promote the quote with the highest Net Purchase Price. That is easy to explain, but it does not preserve real RFQ decision-making. The Seller may prefer a lower-price quote because it settles faster, requires less disclosure, has a better recourse model, avoids Debtor Notification, satisfies identity constraints, has a more reliable Proof-of-Funds status, or better matches compliance requirements.

The product also wants to preserve privacy for Unselected Funders and Unselected Quotes where practical. A fallback model should not require the Coordinator or competing Funders to see the fallback order or quote contents.

## Decision

Fallback ordering is Seller-controlled.

When the Seller selects a Best Compliant Quote as the Selected Quote, the Seller may also define a Fallback Queue from other still-valid Eligible Quotes.

If the Selected Quote fails during the Settlement Window before RFQ Finality, the Seller may promote a Fallback Quote from the Fallback Queue, provided that quote remains eligible, unexpired, and acceptable under the RFQ's Selection Criteria.

The Fallback Queue should not be automatically ordered by highest price alone.

Fallback applies only before RFQ Finality. After the Receivable Sale completes, a later Funder exit is a new transaction, not a fallback.

## Consequences

The fallback process preserves real-world RFQ functionality because the Seller keeps control over what counts as the next-best acceptable deal.

The product avoids overfitting fallback to one metric such as Net Purchase Price.

The implementation must treat quote validity, quote expiry, Proof-of-Funds freshness, and settlement failure as important lifecycle concerns.

The Coordinator does not need to see quote contents or fallback ordering by default. Auditor or Regulator disclosures about fallback should remain scoped unless broader disclosure is required.

This decision does not yet decide quote expiry, quote withdrawal rights, penalty rules for Commitment Failure, or the exact settlement model.
