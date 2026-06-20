# ADR 0009: Use Binding Quotes with Quote Expiry for the MVP

Date: 2026-06-19

## Status

Accepted

## Context

CloakRFQ Receipts needs fallback behavior to be meaningful. If Funders can freely withdraw Pending Quotes at any time, the Seller may believe there is a usable fallback path while the fallback quotes can disappear before promotion. If Private Quotes never expire, Funders carry open-ended exposure to changing market, liquidity, compliance, and operational conditions.

The product also avoids claiming that Proof of Funds locks or reserves funds. Because Proof of Funds is only a bid-eligibility signal, the quote lifecycle needs a separate way to express seriousness without overclaiming settlement certainty.

## Decision

For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period.

A Private Quote:

- has an explicit Quote Expiry;
- remains selectable until Quote Expiry if it is otherwise eligible;
- may be placed into the Seller-Controlled Fallback Queue while valid;
- cannot be arbitrarily withdrawn during its Quote Validity Period unless the RFQ terms explicitly allow withdrawal;
- becomes unavailable for selection or fallback promotion after Quote Expiry unless refreshed or resubmitted.

This decision does not imply funds are locked, reserved, escrowed, or guaranteed through settlement. It also does not add financial penalties for the MVP.

## Consequences

- Fallback behavior is more credible because the Seller can rely on still-valid Pending Quotes during the Settlement Window.
- Funders are protected from indefinite exposure because each Private Quote has an explicit expiry.
- The MVP can model market seriousness without implementing Quote Bonds, escrow, or a production payment system.
- A Selected Quote can still fail during the Settlement Window, so Commitment Failure and fallback behavior remain necessary.
- Penalties for withdrawal, failure to settle, or bad-faith quoting remain future design options rather than MVP claims.
