# ADR 0012: Use CIP-56 Committed Allocations for Phase 2 Private Quote Funding Evidence

## Status

Accepted.

## Context

ADR 0006 selected Proof of Funds as bid eligibility evidence and explicitly avoided claiming Funding Lock behavior unless a stronger mechanism was implemented. During Phase 2 design, the funding evidence model was revisited because CloakRFQ is intended to work with CIP-56 Canton Network tokens rather than a project-local demo token.

CIP-56 defines token APIs for holdings, transfer instructions, allocation requests, allocation instructions, and allocations. The allocation workflow is the closest fit for CloakRFQ Private Quotes because it lets a wallet or custody flow allocate assets to a settlement context for a bounded time.

## Decision

Phase 2 Private Quotes should use a committed CIP-56 `AllocationV2` as the concrete funding-evidence primitive.

A Funder submits a Private Quote by exercising a consuming `SubmitPrivateQuote` choice on its per-Funder `RFQRequest`. The choice must fetch the referenced CIP-56 allocation and verify that:

- the allocation is committed;
- the allocation settlement context references the `RFQRequest`;
- the allocation authorizer is the Funder account;
- the allocation admin matches the RFQ package's expected payment instrument admin;
- the allocation contains a sender-side transfer leg from the Funder account to the Seller account;
- the transfer leg instrument id matches the RFQ package's expected payment instrument id;
- the transfer leg amount covers the quote's net purchase price;
- the allocation settlement deadline covers the quote expiry.

The `PrivateQuote` stores the funding allocation contract id instead of a Seller-trusted `proofOfFundsPassed` boolean.

## Consequences

This refines ADR 0006. Proof of Funds remains the broad product concept, but the concrete Phase 2 implementation path is now CIP-56 committed allocation evidence.

This is stronger than a point-in-time proof or unsigned boolean because the Funder cannot withdraw a committed allocation before the settlement deadline except through the token-standard workflow conditions.

This still must not be described as production payment finality, bank settlement, production custody, legal receivables assignment, or a guarantee that settlement will complete. It is scoped token allocation evidence for the on-ledger workflow.

The Seller should not receive raw Funder balances, unrelated holdings, or funding sources by default. The Seller or workflow only needs enough allocation data to verify amount, instrument, deadline, commitment, and RFQ linkage.

Phase 3 can later settle against the committed allocation using the CIP-56 settlement/allocation workflow instead of a project-local token model.
