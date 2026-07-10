# UI Integration and Demo Flow

## Purpose

Record UI and demo-layer responsibilities that are not enforced only by the ledger templates.

This document is a technical integration checklist, not a screen design spec. It exists to prevent demo bugs around party selection, visible contract IDs, CIP-56 allocation setup, timing, and settlement arguments.

## Demo Principle

For the hackathon MVP, prefer a reliable guided flow over maximum automation. The UI may ask the operator to select visible contracts explicitly when that reduces hidden assumptions.

The ledger remains the source of truth for authorization and visibility. The UI should not claim an action is available unless the current party can see and exercise the required contracts.

## First-Run Welcome

Keep a compact first-run welcome popup for new browser origins. Its copy should
describe the complete MVP as four steps:

1. Register the Receivable.
2. Obtain separate Compliance eligibility and Risk assessment attestations.
3. Open private RFQ requests and collect allocation-backed Private Quotes.
4. Settle the selected quote and let the winning Funder accept the pending
   Receivable transfer.

The popup should describe CloakRFQ as a Receivable Sale RFQ, not as a loan. It
must distinguish real Daml transactions on the demo ledger from the
CIP-56-compatible mock funding and settlement fixtures. Funder A/B/C are
separate parties even though the UI presents them through one Funder role view.

## New Deal

Keep the `New deal` action in per-visitor session mode. It starts another isolated
RFQ by discarding the browser session identifier and provisioning a fresh party
set. The action is hidden in local static-party mode, where it cannot provision a
new isolated deal.

The UI must always ask for confirmation before performing this action, regardless
of the current workflow state.

## Deployed Session Isolation

Each deployed browser session must use its own isolated demo party set. Sharing
one party set across public visitors would allow them to see or affect each
other’s RFQs. The browser session persists across refreshes and browser restarts
until the user explicitly confirms `New deal`; the MVP has no automatic session
expiry.

## Deployed Setup State

While provisioning the isolated Canton parties, show:

> **Setting up your demo...**
>
> Connecting to Canton and creating your isolated workspace for private RFQs.
> This may take about 20 seconds.

Deployment copy should foreground CloakRFQ’s private-RFQ and selective-disclosure
value while remaining precise about party-scoped privacy. It must not imply
absolute privacy from entitled parties or infrastructure operators.

## Deployed Error State

When Canton connectivity or isolated-party provisioning fails, show:

> **Demo connection unavailable**
>
> We couldn’t connect to Canton or finish creating your isolated workspace.
> Please retry in a moment.

Keep a `Retry` action and do not expose raw ledger, OIDC, or server errors in the
public UI. The local-only hint should direct developers to
`./scripts/reset-local-demo.sh`.

## Transaction Evidence

Use the in-app `Activity` and `Ledger` views as the primary transaction and
party-visibility evidence. On DevNet, retain 5N Lighthouse as a secondary
`Verify on Canton` action. Its tooltip or nearby context must explain that
Lighthouse confirms the Canton transaction but intentionally cannot display
CloakRFQ’s private contract contents.

## Environment And Funding Claims

Show `Canton DevNet · mock funds` in deployed session mode and
`Local Canton · mock funds` in local sandbox mode. The welcome copy should state:

> Workflow actions are real Daml transactions on Canton. Token funding uses
> CIP-56-compatible demo fixtures; no wallet or real money is used.

Use `Live` only for connection or workflow status. It must not imply production
operation, production custody, or real payment finality.

## Public Provisioning Boundary

Keep deployed session provisioning anonymous for the hackathon MVP; do not add a
login, access code, or database-backed quota system. Keep the confirmation-gated
`New deal` action available. Apply deployment-level rate limiting to
`/api/session` when the hosting platform supports it. The route’s in-memory
concurrency guard limits simultaneous provisioning work but is not durable abuse
protection.

Session provisioning must discover an active connected synchronizer, allocate
parties explicitly on it, use party IDs returned by Canton, and wait until each
party has submission permission before exposing the workspace. If Canton reports
that a deterministic party already exists but redacts its namespace, the route
may reconstruct the ID from the configured participant namespace only when the
same readiness check verifies it. Allocation or readiness failures must fail
setup rather than exposing an unverified party ID. Version party hints when
changing provisioning semantics so invalid older party sets recover on refresh.

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
5. Funder later exercises `Receivable.AcceptTransfer` on the pending transfer created by successful settlement. The Seller UI treats `AcceptAndSettle` as settlement recorded; the Funder UI exposes `AcceptTransfer` as the post-settlement ownership step.

For the simple local path, `extraSettlementAllocations = []`.

For a real CIP-56 token demo, the UI must allow optional extra finalized allocations when the token workflow requires more than the Funder's funding allocation for `SettlementFactory_SettleBatch`.

## Current Token Demo Boundary

The CloakRFQ ledger templates are designed against the CIP-56-compatible token interfaces: `RFQRequest.SubmitPrivateQuote` accepts `ContractId Token.Allocation`, and `PrivateQuote.AcceptAndSettle` accepts `ContractId Token.SettlementFactory`.

The current UI demo does not connect a real wallet or use real token holdings. Instead, it creates `MockFundingAllocation` and `MockSettlementFactory` contracts from the test fixture package. Those fixture templates implement the same token interfaces, so the production CloakRFQ choices still fetch `Token.Allocation` / `Token.SettlementFactory`, inspect their views, validate commitment, package id, Funder authorizer, token admin, payment leg, and settlement result, then proceed through the same interface-shaped path.

This means the demo proves the CloakRFQ workflow integration points and validation logic, but it does not prove production wallet signing, real token custody, real token balance availability, or a production CIP-56 allocation provider. Replacing the fixture path with real tokens requires the UI to let the Funder select or create a real committed allocation and the Seller select the real settlement factory required by that token workflow.

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
