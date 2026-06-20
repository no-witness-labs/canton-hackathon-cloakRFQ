# 0009 - Use Binding Quotes With Explicit Quote Expiry for the MVP

## Status

Accepted

## Date

2026-06-19

## Context

CloakRFQ Receipts needs a quote lifecycle that supports real RFQ behavior, fallback, and Funder participation.

If Funders can freely withdraw Private Quotes after submission, the Seller's Fallback Queue becomes unreliable because fallback candidates can disappear during the Settlement Window. If Private Quotes never expire, Funders carry open-ended exposure and may be less willing to participate.

The MVP also has not committed to economic penalties, Bid Security, Quote Bonds, escrow, or Funding Locks. Proof of Funds is a bid eligibility signal, not a settlement guarantee.

## Decision

For the MVP, Private Quotes are Binding Quotes during their Quote Validity Period.

Every Private Quote must have a Quote Expiry. Before Quote Expiry, the quote remains eligible for Seller selection or fallback promotion unless the RFQ terms explicitly allow withdrawal. After Quote Expiry, the quote is no longer eligible unless the Funder refreshes or resubmits it.

The MVP may record Commitment Failure if a Selected Quote fails during the Settlement Window, but it does not need to implement economic penalties, Bid Security, Quote Bonds, escrow, or fund locking unless those mechanisms are explicitly added later.

## Consequences

The Seller receives a more reliable RFQ process because quotes and fallback candidates remain usable during a known validity period.

Funders are not exposed indefinitely because every quote expires.

The design preserves a future upgrade path to stronger real-world mechanisms such as Bid Security, Quote Bonds, reputation penalties, exclusion rules, escrow, Funding Locks, or settlement-bank commitments.

The implementation must track Quote Validity Period, Quote Expiry, Settlement Window, and RFQ Finality as distinct lifecycle concepts.
