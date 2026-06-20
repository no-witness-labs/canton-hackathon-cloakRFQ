# 0005 - Require Funding Capacity Evidence During Bidding

## Status

Accepted; refined by ADR 0006

## Date

2026-06-18

## Context

A Receivable Sale RFQ is vulnerable if Funders can submit attractive Private Quotes without any evidence that they can actually fund the transaction. A post-selection Funding Window alone would preserve bidder convenience, but it would allow unserious or underfunded quotes to waste the Seller's time and could make fallback selection less credible.

At the same time, requiring every Funder to fully lock the purchase amount upfront could reduce market participation and reveal more financial information than necessary. Raw proof-of-funds documents or full balance visibility would also conflict with CloakRFQ Receipts' privacy posture.

## Decision

A Private Quote should include quote-scoped funding-capacity evidence during bidding.

This ADR uses the phrase "funding-capacity evidence" as the broad product requirement. ADR 0006 refines the MVP posture: the canonical bid eligibility concept is **Proof of Funds**, and Proof of Funds must not be described as a Funding Lock, escrow, reserve, or settlement guarantee unless that stronger mechanism is explicitly implemented.

Funding Capacity Attestation remains one possible future or implementation-specific form of Proof of Funds.

The exact technical mechanism is intentionally unresolved. The MVP may mock the proof, while later versions may use a Funding Evidence Provider, settlement bank, custodian, on-ledger funds check, soft funds reservation, escrow, or another stronger evidence mechanism.

Do not require every Funder to fully lock the entire purchase amount upfront unless a later protocol decision justifies that trade-off.

Quote Bonds may be explored as a stretch feature, but a Quote Bond is distinct from Proof of Funds because it does not necessarily prove capacity to fund the full purchase price.

## Consequences

Private Quotes become more credible because each quote is accompanied by evidence of funding capacity.

Fallback Quotes become more useful because the Seller can prefer fallback candidates that were already funding-capacity checked during bidding.

The product gains a stronger answer to Winning Funder failure without changing the core RFQ into a threshold-only or first-acceptable process.

The MVP must avoid overclaiming: funding-capacity evidence demonstrates bid seriousness, not production-grade settlement finality.

Privacy design must ensure that funding evidence is scoped to the quote and does not become a general disclosure of Funder balances or funding sources.
