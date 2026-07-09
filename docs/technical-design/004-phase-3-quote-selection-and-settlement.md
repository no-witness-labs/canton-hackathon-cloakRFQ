# Phase 3 Quote Selection and Settlement

## Purpose

Document the Phase 3 design for quote acceptance, demo settlement, Receivable transfer, and final settlement evidence.

Phase 3 is the final MVP phase. It is implemented in two internal steps:

1. Common settlement path plus success branch.
2. Failure and fallback branch.

This document records the confirmed design for the common path, success branch, and MVP failed/fallback handling. The failed path is implemented through existing rollback behavior, UI error surfacing, and off-ledger selection of another still-valid `PrivateQuote`.

## Confirmed Scope

Phase 3 starts after Phase 2 quote intake has closed. `PrivateQuote`s already exist and are visible to the Seller according to the Phase 2 disclosure model.

Quote review and quote selection are off-ledger. The Seller reviews available `PrivateQuote`s off-ledger and then acts on the chosen quote on-ledger. There is no separate on-ledger `SelectedQuote` contract in the confirmed success path.

The on-ledger action records the consequence of the Seller's off-ledger decision: attempt settlement against the chosen `PrivateQuote`, transfer the represented Receivable to the winning Funder, settle the committed funding allocation, and create final settlement evidence.

## Common Path

The common Phase 3 path starts from the Seller's off-ledger decision to act on a chosen `PrivateQuote`. The on-ledger success action is a Seller-controlled consuming choice on the Funder-signed `PrivateQuote`:

```daml
AcceptAndSettle : ContractId ReceivableSaleSettlement
```

`AcceptAndSettle` uses the generic `Receivable.Transfer` choice to initiate transfer to the Funder. It does not call `AcceptTransfer`; Funder acceptance is a later step after the settlement action.

`AcceptAndSettle` must re-check all active conditions that still matter at settlement time. Because `SubmitPrivateQuote` consumes the `RFQRequest` quote slot, the request itself is not fetched during settlement. These checks are mandatory when omitting them would allow fake settlement evidence, wrong-party transfer, underpayment, policy bypass, or privacy leakage.

### Mandatory Checks

| Check | Security reason |
| ----- | --------------- |
| `now > packageData.responseDeadline` | Prevents the Seller from settling before all invited Funders had the agreed quote window. |
| `now <= quoteTerms.quoteExpiresAt` | Prevents accepting an expired price/funding commitment. |
| `hasValidQuoteForRequest packageData quoteTerms` | Prevents invalid or request-incompatible quote terms from becoming settlement evidence. |
| `hasValidReceivableTerms packageData.receivableTerms` | Prevents settlement against malformed package terms. |
| fetch `receivableCid` and assert `receivable.owner == seller` | Prevents settling or recording sale of a Receivable the Seller no longer owns. |
| assert `receivable.terms == packageData.receivableTerms` | Prevents transferring a Receivable whose actual terms differ from the terms disclosed to the Funder. |
| fetch `fundingAllocationCid` and assert `allocationSpec.committed` | Prevents settlement against non-committed funding evidence. The allocation must be visible to the Seller or settlement executor. |
| assert `allocationView.settlement.id == packageId` | Prevents reusing an allocation reserved for a different RFQ package. |
| assert `allocationSpec.authorizer.owner == Some funder` | Prevents using another party's allocation as this Funder's funding. |
| assert `allocationSpec.admin == packageData.paymentInstrumentAdmin` | Prevents payment through the wrong token registry/admin. |
| assert a matching sender-side payment leg pays `seller` | Prevents final evidence when funds are routed to the wrong party. |
| assert the payment leg `instrumentId == packageData.paymentInstrumentId` | Prevents paying with the wrong asset or currency instrument. |
| assert the payment leg amount equals `quoteTerms.netPurchasePrice` | Prevents underpayment or accidental over-settlement. |
| assert the allocation deadline still covers the quote expiry or settlement requirement | Prevents relying on funding evidence that can expire before the quote obligation. |
| exercise CIP-56 `SettlementFactory_SettleBatch` and require settled allocation results | Uses the token-provider settlement factory path and prevents final evidence if token settlement returned pending, cancelled, or withdrawn. |
| require an `auditor` party on `AcceptAndSettle` and copy it to `ReceivableSaleSettlement` | Ensures the final settlement evidence has a mandatory auditor/regulator in the MVP. |

`AcceptAndSettle` is consuming so the same `PrivateQuote` cannot be settled twice.

## Success Branch

On success, `AcceptAndSettle` must atomically:

1. exercise CIP-56 `SettlementFactory_SettleBatch` so the Seller receives the committed allocated funds;
2. exercise `Receivable.Transfer` to create a pending Receivable transfer to the Funder;
3. create `ReceivableSaleSettlement` as durable post-settlement evidence linked to that pending transfer.

`ReceivableSaleSettlement` is not the swap engine itself. It is the durable record created after the MVP demo settlement succeeds. From the Seller's point of view, settlement is complete when `AcceptAndSettle` succeeds: the Seller has received the allocation settlement and has initiated the Receivable transfer. The Funder's later `AcceptTransfer` is a post-settlement ownership completion step, not a condition for Seller settlement finality.

## Failed Settlement Handling

For the MVP, a failed `AcceptAndSettle` transaction does not create an on-ledger failure record.

If `SettlementFactory_SettleBatch` or any mandatory settlement check aborts, the Daml transaction rolls back. The `PrivateQuote`, `Receivable`, allocation, and other active contracts remain in their prior state unless the failing token workflow consumed or changed something outside the successful CloakRFQ transaction, which should be treated as a demo integration issue.

The UI must surface the ledger error message clearly to the Seller so the Seller understands why settlement failed. The Seller may then:

- retry the same `PrivateQuote` if the issue is operational and the quote is still valid;
- choose another visible, still-valid `PrivateQuote` off-ledger and attempt settlement on that quote.

This keeps the failed path flexible for the demo and avoids adding a failure-record template before there is a verifiable token-failure signal to record. The UI must not present a rolled-back failed attempt as final settlement evidence.

## Fallback Quote Selection

For the MVP failed path, fallback selection is off-ledger.

If settlement fails and the Seller does not retry the same `PrivateQuote`, the Seller may review the remaining visible `PrivateQuote`s in the UI and choose another still-valid quote. The Seller then calls the existing `PrivateQuote.AcceptAndSettle` choice on that quote.

There is no on-ledger fallback queue, fallback-ranking contract, or `SelectedQuote` contract in this MVP path. The ledger does not encode business ranking or prove that the Seller chose the next-best quote. It only enforces that any quote the Seller attempts to settle still satisfies the mandatory settlement checks.

This keeps the failed path simple and demo-safe. A formal fallback queue or ranking evidence can be added later if the product needs auditability over why one fallback quote was chosen over another.

## Implementation Approach For Failed Path

The failed-settlement MVP pass is docs and tests only unless tests expose a real ledger gap.

No new templates or choices are required for the current failed/fallback path because the existing ledger behavior already provides the required mechanics:

- a failed `AcceptAndSettle` transaction rolls back and leaves the attempted `PrivateQuote` active;
- other visible `PrivateQuote`s remain active;
- the Seller can retry the same quote or call `AcceptAndSettle` on another still-valid quote;
- `ReceivableSaleSettlement` is created only by a successful `AcceptAndSettle` transaction.

The required regression coverage is a Phase 3 test proving that a failed settlement attempt does not consume the failed quote or create settlement evidence, and that the Seller can then settle another valid quote.

## Receivable Transfer

`Receivable` is prerequisite infrastructure, not RFQ-specific workflow state. Transfer choices must therefore use generic receivable language, not RFQ-specific names such as `AssignToFunder`.

Confirmed transfer design:

- keep `registrar` unchanged across transfers;
- use `owner` as the current owner;
- remove permanent template-level enforcement that `registrar == owner`;
- use `signatory registrar, owner`;
- add generic transfer capability.

Initial creation may normally have `registrar == owner`, because the Seller self-registers the represented Receivable in the MVP, but this must not be enforced forever with template-level `ensure` because later transfers change `owner`.

The generic transfer flow is two-step: current owner starts `Transfer`, then the proposed new owner completes `AcceptTransfer`. For RFQ settlement, `AcceptAndSettle` performs only the first step. The Funder completes `AcceptTransfer` later, after Phase 3 settlement evidence exists.

`Transfer` and `AcceptTransfer` are implemented as generic Receivable primitives, not RFQ-specific choices.

## Settlement Record

The settlement evidence template is defined in `CloakRFQ.Settlement`:

```daml
template ReceivableSaleSettlement
```

Confirmed properties:

- signed by `seller, funder`;
- records completed MVP demo settlement;
- links the Seller, winning Funder, auditor/regulator, original Receivable and pending transfer reference, compact package id, accepted quote terms, funding allocation, settlement factory, and settlement time;
- is useful for audit, regulatory, and compliance evidence, but is not itself a compliance certificate;
- intentionally avoids duplicating heavy package data already represented by the settled Receivable and quote terms.

The registrar is not a signatory on `ReceivableSaleSettlement`. The registrar remains represented through the pending transfer `Receivable`.

## Auditor

The final settlement record must have a mandatory `auditor : Party`. In regulatory scenarios, this party can represent the regulator or regulatory delegate entitled to final settlement evidence.

This party is not automatically the Compliance Party. The Compliance Party issued or authorized compliance evidence earlier in the workflow; the auditor is the party entitled to final settlement evidence.

For the MVP, there is no separate `SettlementDisclosurePolicy` template. `PrivateQuote.AcceptAndSettle` takes `auditor : Party` directly and copies it into `ReceivableSaleSettlement`, where it becomes an observer of the final evidence contract.

## CIP-56 Settlement Factory

Phase 3 uses CIP-56 `SettlementFactory_SettleBatch`, not a direct app-level `Allocation_Settle` call. `AcceptAndSettle` fetches the settlement factory, checks that its `admin` matches the expected payment instrument admin, submits the required Funder funding allocation plus optional extra finalized allocations supplied for the token workflow, and requires the returned allocation results to be settled.

The real Canton Coin/Amulet demo path therefore requires a visible CIP-56 allocation and compatible settlement factory from the token provider. The local tests use `MockSettlementFactory` and `MockFundingAllocation` fixtures that implement the same CIP-56 interfaces for regression coverage.

## Deferred

The following are intentionally deferred until the next grilling step:

- formal on-ledger fallback queue or fallback-ranking evidence, if later needed;
- fallback finality rules beyond quote expiry and settlement success;
- on-ledger failed-settlement evidence, if later needed;
- generic Receivable transfer UI beyond what the RFQ settlement path needs.
