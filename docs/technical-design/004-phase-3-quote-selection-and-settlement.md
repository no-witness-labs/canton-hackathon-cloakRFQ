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

The common Phase 3 path starts from the Seller's off-ledger decision to act on a chosen `PrivateQuote`. The on-ledger success action is a Seller-controlled consuming choice on the Funder-signed `PrivateQuote`:

```daml
AcceptAndSettle : ContractId ReceivableSaleSettlement
```

Because the action is inside `PrivateQuote`, the Funder's contract authority is available. The RFQ settlement path must therefore transfer the Receivable by directly archiving the old `Receivable` and creating the transferred `Receivable` inside `AcceptAndSettle`. It must not call the generic `Receivable.Transfer` sub-choice for RFQ settlement, because that sub-choice does not carry the Funder authority needed to create the new Funder-owned `Receivable`.

`AcceptAndSettle` must re-check all conditions that still matter at settlement time. These checks are mandatory when omitting them would allow fake settlement evidence, wrong-party transfer, underpayment, policy bypass, or privacy leakage.

### Mandatory Checks

| Check | Security reason |
| ----- | --------------- |
| `now > packageData.responseDeadline` | Prevents the Seller from settling before all invited Funders had the agreed quote window. |
| `now <= quoteTerms.quoteExpiresAt` | Prevents accepting an expired price/funding commitment. |
| `hasValidQuoteForRequest packageData quoteTerms` | Prevents invalid or request-incompatible quote terms from becoming settlement evidence. |
| fetch `rfqRequestCid` and assert Seller, Funder, Receivable, package id, and package data match `PrivateQuote` | Prevents settling a directly created or mismatched `PrivateQuote` outside the official request context. |
| `hasValidReceivableTerms packageData.receivableTerms` | Prevents settlement against malformed package terms. |
| fetch `receivableCid` and assert `receivable.owner == seller` | Prevents settling or recording sale of a Receivable the Seller no longer owns. |
| assert `receivable.terms == packageData.receivableTerms` | Prevents transferring a Receivable whose actual terms differ from the terms disclosed to the Funder. |
| fetch `fundingAllocationCid` and assert `allocationSpec.committed` | Prevents settlement against non-committed funding evidence. The allocation must be visible to the Seller or settlement executor. |
| assert `allocationView.settlement.cid == Some (coerceContractId rfqRequestCid)` | Prevents reusing an allocation reserved for a different RFQ request. |
| assert `allocationSpec.authorizer.owner == Some funder` | Prevents using another party's allocation as this Funder's funding. |
| assert `allocationSpec.admin == packageData.paymentInstrumentAdmin` | Prevents payment through the wrong token registry/admin. |
| assert a matching sender-side payment leg pays `seller` | Prevents final evidence when funds are routed to the wrong party. |
| assert the payment leg `instrumentId == packageData.paymentInstrumentId` | Prevents paying with the wrong asset or currency instrument. |
| assert the payment leg amount covers `quoteTerms.netPurchasePrice` | Prevents underpayment. |
| assert the allocation deadline still covers the quote expiry or settlement requirement | Prevents relying on funding evidence that can expire before the quote obligation. |
| exercise CIP-56 `Allocation_Settle` and require `AllocationResult_Settled` | Prevents creating final settlement evidence if token settlement returned pending, cancelled, or withdrawn. |
| require an `auditor` party on `AcceptAndSettle` and copy it to `ReceivableSaleSettlement` | Ensures the final settlement evidence has a mandatory auditor/regulator in the MVP. |

`AcceptAndSettle` is consuming so the same `PrivateQuote` cannot be settled twice.

## Success Branch

On success, `AcceptAndSettle` must atomically:

1. exercise CIP-56 `Allocation_Settle` so the Seller receives the committed allocated funds;
2. archive the original Seller-owned `Receivable`;
3. create the transferred `Receivable` with the same `registrar` and `owner = funder`;
4. create `ReceivableSaleSettlement` as durable post-settlement evidence.

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

The generic transfer flow is two-step: current owner starts `Transfer`, then the proposed new owner completes `AcceptTransfer`. For RFQ settlement, the Funder's submitted `PrivateQuote` is commercial consent to receive the Receivable, and the `AcceptAndSettle` choice on that Funder-signed contract provides the Funder authorization needed to create the transferred `Receivable`.

`Transfer` and `AcceptTransfer` are implemented as generic Receivable primitives, not RFQ-specific choices. The RFQ settlement path uses direct archive/create inside `PrivateQuote.AcceptAndSettle`, not the generic transfer sub-choice.

## Settlement Record

The settlement evidence template is defined in `CloakRFQ.Settlement`:

```daml
template ReceivableSaleSettlement
```

Confirmed properties:

- signed by `seller, funder`;
- records completed MVP demo settlement;
- links the Seller, winning Funder, auditor/regulator, original/transferred Receivable reference, compact package id, accepted quote terms, funding allocation, and settlement time;
- is useful for audit, regulatory, and compliance evidence, but is not itself a compliance certificate;
- intentionally avoids duplicating heavy package data already represented by the settled Receivable and quote terms.

The registrar is not a signatory on `ReceivableSaleSettlement`. The registrar remains represented through the transferred `Receivable`.

## Auditor

The final settlement record must have a mandatory `auditor : Party`. In regulatory scenarios, this party can represent the regulator or regulatory delegate entitled to final settlement evidence.

This party is not automatically the Compliance Party. The Compliance Party issued or authorized compliance evidence earlier in the workflow; the auditor is the party entitled to final settlement evidence.

For the MVP, there is no separate `SettlementDisclosurePolicy` template. `PrivateQuote.AcceptAndSettle` takes `auditor : Party` directly and copies it into `ReceivableSaleSettlement`, where it becomes an observer of the final evidence contract.

## CIP-56 Settlement Actor Constraint

CIP-56 `Allocation_Settle` takes `actors : [Party]`. The interface comments say implementations must check these actors to avoid unauthorized settlement execution. By default, implementations should require the actors to equal the allocation `admin` and the allocation `executors`, and the comments state this authorization is typically provided through `SettlementFactory_SettleBatch`, used by the executors to settle V2 allocations.

Implication for Phase 3: a production-grade implementation should not assume a Seller-only direct `Allocation_Settle` call is sufficient. The allocation must also be visible to the party executing settlement. The MVP implementation uses a settle-capable test allocation with explicit Seller visibility and Seller-as-executor actor rules; a production-grade path should use the CIP-56 settlement-factory flow or equivalent token-provider workflow.

## Authorization Finding: Avoid Generic Transfer Sub-Choice in RFQ Settlement

Implementation testing showed that calling the generic `Receivable.Transfer` sub-choice from `PrivateQuote.AcceptAndSettle` cannot create a transferred `Receivable` with `owner = funder` when `Receivable` has `signatory registrar, owner`. The sub-choice is authorized by the current Receivable owner path, but it does not provide the Funder authority needed to create the new Funder-owned Receivable.

Security implication: this is correct behavior. It prevents generic transfer from forcing a party into Receivable ownership without that party's authority.

Design implication: RFQ settlement must not call `Receivable.Transfer`. It must perform the transfer directly inside the Funder-signed `PrivateQuote.AcceptAndSettle` action, where Seller control and Funder contract authority are both present.

## Deferred

The following are intentionally deferred until the next grilling step:

- failed settlement recording;
- fallback quote promotion;
- fallback finality rules;
- funder-visible verification of the settlement disclosure policy;
- generic Receivable transfer UI beyond what the RFQ settlement path needs.
