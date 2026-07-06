# Phase 2 Technical Design - Private Quote Intake

## Purpose

Define the current Phase 2 ledger direction for Private Quote intake.

This note documents the implemented Daml surface and the still-open design questions. Quote review, selection, settlement, and finality remain outside Phase 2.

## Boundary

Phase 2 starts when a Funder has an existing per-Funder `RFQRequest` created after Phase 1 origination and eligibility. Phase 2 ends at the RFQ `responseDeadline`.

During Phase 2, Funders may submit `PrivateQuote`s. Quote review, Seller selection, fallback queues, and settlement are not Phase 2.

## Implemented Ledger Surface

| Object | Purpose |
|---|---|
| `RFQRequest` | Per-Funder request carrying the Funder-visible RFQ package and authority certificate references. |
| `RFQPackageData` | Funder-disclosed package data, including receivable terms, certified risk tier, response deadline, and expected CIP-56 payment instrument. |
| `QuoteTerms` | Funder commercial terms: net purchase price, recourse model, debtor notification requirement, and quote expiry. |
| `PrivateQuote` | Funder-signed quote created through the request workflow. Visible to the Seller, not to competing Funders. |
| `Splice.Api.Token.AllocationV2:Allocation` | CIP-56 funding-evidence interface fetched during quote submission. |

## Private Quote Submission

`RFQRequest.SubmitPrivateQuote` is a consuming, Funder-controlled choice.

The consuming shape is intentional:

- one `RFQRequest` represents one Funder's quote slot;
- successful quote submission consumes that slot;
- a Funder cannot submit multiple quotes from the same request;
- competing Funders remain hidden because each Funder has a separate request.

The choice creates `PrivateQuote` only after checking the submitted quote terms and the referenced CIP-56 allocation. Quote terms must keep the quote valid beyond the RFQ `responseDeadline`.

## CIP-56 Allocation Validation

The Funder supplies a `ContractId Token.Allocation` as funding evidence.

The choice fetches the allocation and requires:

- the allocation is committed;
- the allocation settlement deadline covers the quote expiry;
- the allocation settlement context references the exact `RFQRequest`;
- the allocation authorizer account owner is the Funder;
- the allocation admin matches `RFQPackageData.paymentInstrumentAdmin`;
- the allocation has a sender-side transfer leg to the Seller;
- the transfer leg instrument id matches `RFQPackageData.paymentInstrumentId`;
- the transfer leg amount covers `QuoteTerms.netPurchasePrice`.

This avoids a Seller-trusted `proofOfFundsPassed` boolean. The `PrivateQuote` stores the allocation contract id as evidence. A committed allocation is mandatory at quote submission time.

## Privacy And Authenticity

The Seller should not receive the Funder's full wallet balance or unrelated holdings. The implemented check relies on the allocation view only for the RFQ-scoped facts needed to validate quote funding evidence.

The request remains per-Funder. Funder A does not see Funder B's request or quote through normal ledger visibility.

The request still depends on Phase 1 certificate comparison for package authenticity. Certificate visibility and explicit disclosure to Funders remain an open Phase 2 hardening area.

## Tests

Phase 2 tests use a test-only `MockFundingAllocation` template that implements the real CIP-56 `AllocationV2` interface.

Covered behavior:

- a quote expiring at the RFQ response deadline cannot create a `PrivateQuote`;
- an underfunded committed allocation cannot create a `PrivateQuote`;
- a correctly funded committed allocation can create a `PrivateQuote`;
- successful quote submission consumes the original `RFQRequest`;
- the Seller can see the resulting `PrivateQuote`.

## Open Questions

1. How unselected or expired quote allocations are cancelled, released, or ignored.
2. Whether Phase 2 should model the allocation request/instruction flow before the committed allocation exists.
3. Whether certificate visibility should be handled by explicit disclosure, Funder observers, or a later authority-created request pattern.

## External References

- CIP-56: Canton Network Token Standard.
- Splice token-standard APIs, especially `AllocationV2`.
