# ADR 0001: Model the MVP as a Receivable Sale, Not a Secured Loan

## Status

Accepted

## Context

The initial product idea used the phrase "invoice/RWA financing," which could mean either a receivable sale or a loan secured by a receivable. Those models have different domain language, user expectations, risk logic, and demo complexity.

A secured-loan model would require concepts such as borrower, lender, repayment, interest, maturity, default, and collateral enforcement. A receivable-sale model is simpler: a seller offers a receivable, funders bid to purchase it at a discount, and the accepted transaction transfers economic ownership to the winning funder.

## Decision

The MVP is a private RFQ marketplace for Receivable Sales.

Use "Seller" for the party offering the receivable and "Funder" for the party bidding to purchase it. Avoid "Borrower" and "Lender" in the MVP language unless a later version explicitly adds secured lending.

## Consequences

The MVP has a clearer story for a hackathon demo and avoids loan-servicing complexity.

The product can still be positioned within the broader RWA financing category, but the canonical MVP object is a Receivable and the canonical transaction is a Receivable Sale.

Adding secured lending later would be a separate product decision because it would introduce new domain concepts and obligations.
