# UI Integration and Demo Flow

## Purpose

Record UI and demo-layer responsibilities that are not enforced only by the ledger templates.

This document is a technical integration checklist, not a screen design spec. It exists to prevent demo bugs around party selection, visible contract IDs, CIP-56 allocation setup, timing, and settlement arguments.

## Demo Principle

For the hackathon MVP, prefer a reliable guided flow over maximum automation. The UI may ask the operator to select visible contracts explicitly when that reduces hidden assumptions.

The ledger remains the source of truth for authorization and visibility. The UI should not claim an action is available unless the current party can see and exercise the required contracts.

## Parties

The UI should support at least these demo roles:

| Role | Purpose |
| ---- | ------- |
| Seller | Creates Receivable, opens RFQRequest, reviews PrivateQuotes, accepts settlement. |
| Funder | Views own RFQRequest, creates or selects committed CIP-56 allocation, submits PrivateQuote, later accepts Receivable transfer. |
| Compliance Party | Creates ComplianceAttestation and authorizes ComplianceCertificate. |
| Risk Assessor | Creates RiskAttestation and authorizes RiskCertificate. |
| Token Admin | Provides the CIP-56 settlement factory and token/instrument administration. |
| Auditor | Observes final ReceivableSaleSettlement evidence. |

Do not describe the auditor as the Compliance Party. The auditor is the party entitled to final settlement evidence.

## Required UI Contract Calls

### Phase 1

1. Seller creates `Receivable`.
2. Compliance Party creates `ComplianceAttestation`.
3. Seller exercises `CreateComplianceCertificate`.
4. Risk Assessor creates `RiskAttestation`.
5. Seller exercises `CreateRiskCertificate`.
6. Seller creates one `RFQRequest` per Funder.

The UI must keep `packageId`, `receivableCid`, `RFQPackageData`, certificate CIDs, and party fields consistent across these calls.

### Phase 2

1. Funder obtains or selects a committed CIP-56 `Allocation` outside CloakRFQ.
2. Funder exercises `RFQRequest.SubmitPrivateQuote` with `quoteTerms` and `fundingAllocationCid`.

The UI must submit this before `packageData.responseDeadline` and before `quoteTerms.quoteExpiresAt`.

The selected allocation must be visible to the submitting Funder and later visible to the Seller or settlement executor path used by the demo.

### Phase 3

1. Seller waits until after `packageData.responseDeadline`.
2. Seller reviews visible `PrivateQuote`s off-ledger in the UI.
3. Seller selects one quote and exercises `PrivateQuote.AcceptAndSettle` with:
   - `auditor`
   - `settlementFactoryCid`
   - `extraSettlementAllocations`
4. If settlement fails, the UI surfaces the ledger error and lets the Seller retry or select another visible, still-valid `PrivateQuote` off-ledger.
5. Funder later exercises `Receivable.AcceptTransfer` on the pending transfer created by successful settlement.

For the simple local path, `extraSettlementAllocations = []`.

For a real CIP-56 token demo, the UI must allow optional extra finalized allocations when the token workflow requires more than the Funder's funding allocation for `SettlementFactory_SettleBatch`.

## CIP-56 Demo Checklist

Before allowing `SubmitPrivateQuote`, the UI should verify or display:

- allocation is committed;
- allocation settlement deadline covers `quoteTerms.quoteExpiresAt`;
- allocation settlement id equals `packageId`;
- allocation authorizer owner is the Funder;
- allocation admin equals `packageData.paymentInstrumentAdmin`;
- allocation has a sender-side payment leg to Seller;
- payment leg instrument id equals `packageData.paymentInstrumentId`;
- payment leg amount equals `quoteTerms.netPurchasePrice`.

Before allowing `AcceptAndSettle`, the UI should verify or display:

- current time is after `packageData.responseDeadline`;
- quote is not expired;
- Seller can see the `PrivateQuote`, `Receivable`, `Allocation`, and `SettlementFactory` needed for settlement;
- settlement factory admin equals `packageData.paymentInstrumentAdmin`;
- any required `extraSettlementAllocations` are available and visible for the settlement path.

## Timing Rules

The UI should guide the operator through time-sensitive phases:

| Action | Timing |
| ------ | ------ |
| SubmitPrivateQuote | `now <= responseDeadline` and `now <= quoteExpiresAt`. |
| AcceptAndSettle | `now > responseDeadline` and `now <= quoteExpiresAt`. |
| AcceptTransfer | after successful `AcceptAndSettle`. |

For local demos, scripts or UI controls may advance ledger time, but the displayed workflow should still explain why an action is currently enabled or disabled.

The UI uses a deliberately short quote window for the hackathon demo. The current local demo window is 2.5 minutes, which is only a usability simplification so the operator can see quote submission and settlement in one session. In real receivable-sale RFQs, response windows can run for days to weeks depending on diligence, transaction size, and counterparty process.

## Visibility Rules

Each Funder should only see their own `RFQRequest` and their own `PrivateQuote`.

The Seller sees submitted `PrivateQuote`s and performs off-ledger quote review. There is no separate on-ledger quote selection contract in the happy path.

The Auditor sees `ReceivableSaleSettlement` as final evidence. The Auditor does not need to see full compliance disclosure or all quotes.

## Failed Settlement And Fallback UI

A failed `AcceptAndSettle` transaction rolls back. The UI should keep the attempted `PrivateQuote` visible as active, show the ledger error to the Seller, and allow the Seller to retry that quote if still valid.

If the Seller chooses not to retry, fallback selection is off-ledger: the Seller selects another visible, still-valid `PrivateQuote` and calls the same `AcceptAndSettle` action on that quote. There is no on-ledger fallback queue or failure record in the MVP failed path.

The UI must not show failed attempts as settlement evidence. `ReceivableSaleSettlement` exists only after successful settlement.

## Demo Failure Points To Surface Clearly

The UI should show explicit messages for these likely demo problems:

- wrong party selected;
- missing visible contract CID;
- quote submitted after deadline;
- settlement attempted before response deadline;
- quote expired;
- allocation not committed;
- allocation settlement id does not equal `packageId`;
- allocation admin or instrument id does not match package data;
- settlement factory admin does not match package data;
- payment leg amount does not equal `netPurchasePrice`;
- missing optional extra settlement allocation for the token workflow.

## Out Of Scope For This Document

- final visual design and screen layout;
- wallet connector implementation details;
- formal on-ledger fallback queue or ranking evidence;
- production custody, reconciliation, and reporting;
- regulatory filing workflow beyond final settlement evidence visibility.
