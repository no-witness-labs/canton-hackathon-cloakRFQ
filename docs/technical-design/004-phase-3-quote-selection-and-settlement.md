# Phase 3 Quote Selection and Settlement

## Purpose

Document the Phase 3 design for quote acceptance, demo settlement, Receivable transfer, and final settlement evidence.

Phase 3 is the final MVP phase. It is implemented in two internal steps:

1. Common settlement path plus success branch.
2. Failure and fallback branch.

This document currently records the confirmed design for the common path and success branch only. Failure recording and fallback promotion remain to be grilled and documented before implementation.

## Confirmed Scope

Phase 3 starts after Phase 2 quote intake has closed. `PrivateQuote`s already exist and are visible to the Seller according to the Phase 2 disclosure model.

Quote review and quote selection are off-ledger. The Seller reviews available `PrivateQuote`s off-ledger and then acts on the chosen quote on-ledger. There is no separate on-ledger `SelectedQuote` contract in the confirmed success path.

The on-ledger action records the consequence of the Seller's off-ledger decision: attempt settlement against the chosen `PrivateQuote`, transfer the represented Receivable to the winning Funder, settle the committed funding allocation, and create final settlement evidence.

## Common Path

The common Phase 3 path is a Seller-controlled consuming choice on `PrivateQuote`, expected to be named:

```daml
AcceptAndSettle : ContractId ReceivableSaleSettlement
```

The choice must re-check all conditions that still matter at settlement time:

- the current time is after `packageData.responseDeadline`;
- the current time is before or equal to `quoteTerms.quoteExpiresAt`;
- the referenced `Receivable` is still owned by the Seller;
- the quote's package data and quote terms are still valid;
- the referenced CIP-56 allocation is still committed;
- the allocation still references the RFQ context;
- the allocation authorizer is the Funder;
- the allocation payment leg pays the Seller;
- the allocation amount covers `quoteTerms.netPurchasePrice`;
- the allocation deadline still covers the quote expiry or settlement requirement.

The choice is consuming so the same `PrivateQuote` cannot be settled twice.

## Success Branch

On success, `AcceptAndSettle` must atomically:

1. exercise CIP-56 `Allocation_Settle` so the Seller receives the committed allocated funds;
2. transfer the represented `Receivable` to the Funder;
3. create `ReceivableSaleSettlement` as durable post-settlement evidence.

`ReceivableSaleSettlement` is not the swap engine itself. It is the durable record created after the MVP demo settlement succeeds.

## Receivable Transfer

`Receivable` is prerequisite infrastructure, not RFQ-specific workflow state. Transfer choices must therefore use generic receivable language, not RFQ-specific names such as `AssignToFunder`.

Confirmed transfer design:

- keep `registrar` unchanged across transfers;
- use `owner` as the current owner;
- remove permanent template-level enforcement that `registrar == owner`;
- use `signatory registrar, owner`;
- add generic transfer capability.

Initial creation may normally have `registrar == owner`, because the Seller self-registers the represented Receivable in the MVP, but this must not be enforced forever with template-level `ensure` because later transfers change `owner`.

A generic `AcceptTransfer` flow is still needed for a complete standalone Receivable workflow. For this RFQ settlement path, the Funder's submitted `PrivateQuote` is treated as consent to receive the Receivable if the Seller accepts and settles that quote. A separate transfer-acceptance UI step is not part of the current Phase 3 success branch.

A generic `ProposeTransfer` path may be left as an implementation TODO if it is not needed for the success branch.

## Settlement Record

The settlement evidence template is:

```daml
template ReceivableSaleSettlement
```

Confirmed properties:

- signed by `seller, funder`;
- records completed MVP demo settlement;
- links the Seller, winning Funder, `PrivateQuote`, original/transferred Receivable reference, quote terms, settlement time, and settlement disclosure policy;
- is useful for audit, regulatory, and compliance evidence, but is not itself a compliance certificate.

The registrar is not a signatory on `ReceivableSaleSettlement`. The registrar remains represented through the transferred `Receivable`.

## Outcome Observer Policy

The final settlement record must have a mandatory outcome observer representing the auditor, regulator, or evidence recipient entitled to final outcome visibility.

This observer is not automatically the Compliance Party. The Compliance Party issued or authorized compliance evidence earlier in the workflow; the final outcome observer is the party legally or institutionally entitled to settlement outcome evidence.

Use:

```daml
template SettlementDisclosurePolicy
  with
    policyAuthority : Party
    outcomeObserver : Party
    policyVersion : Text
```

Meaning:

- `policyAuthority`: legal or institutional authority defining the required final-outcome observer;
- `outcomeObserver`: auditor, regulator, or evidence recipient entitled to observe settlement outcome;
- `policyVersion`: version or reference for the disclosure policy.

`SettlementDisclosurePolicy` should be known before quote submission and referenced by the RFQ flow before `PrivateQuote` creation. The policy CID should be carried forward into `PrivateQuote`, and `AcceptAndSettle` should use that already-bound policy rather than allowing the Seller to supply a new observer at settlement time.

Funders are not required to see `SettlementDisclosurePolicy` for the current MVP scope. Making policy visibility verifiable by Funders is a more involved feature and is out of scope for this success-branch implementation.

## CIP-56 Settlement Actor Constraint

CIP-56 `Allocation_Settle` takes `actors : [Party]`. The interface comments say implementations must check these actors to avoid unauthorized settlement execution. By default, implementations should require the actors to equal the allocation `admin` and the allocation `executors`, and the comments state this authorization is typically provided through `SettlementFactory_SettleBatch`, used by the executors to settle V2 allocations.

Implication for Phase 3: a production-grade implementation should not assume a Seller-only direct `Allocation_Settle` call is sufficient. The MVP implementation must either use a settle-capable test allocation whose actor rules are explicit, or implement the CIP-56 settlement-factory path. This decision remains open before coding the settlement call.

## Deferred

The following are intentionally deferred until the next grilling step:

- failed settlement recording;
- fallback quote promotion;
- fallback finality rules;
- funder-visible verification of the settlement disclosure policy;
- generic Receivable transfer UI beyond what the RFQ settlement path needs.
