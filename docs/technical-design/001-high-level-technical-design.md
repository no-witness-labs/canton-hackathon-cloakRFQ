# CloakRFQ Receipts — High-Level Technical Design

## Purpose

Define the high-level implementation contract for the MVP workflow on Canton.

This document sits below the PRD and project brief. It does not define exact Daml templates, choices, stakeholders, API endpoints, UI layouts, Proof-of-Funds mechanism, quote-selection privacy protocol, production payment integration, or production legal assignment mechanics.

## Technical Scope

The MVP workflow has three phases:

1. **RFQ Origination & Eligibility**
2. **Private Quoting & Selection**
3. **Settlement & Finality**

Use **Private Quoting** and **Private Quote** in technical design. Avoid **Bidding** unless referencing an accepted ADR title or legacy product wording. In implementation-facing text, Proof of Funds gates quote eligibility.

## Disclosure Layers

RFQ discovery and private RFQ disclosure are separate surfaces.

| Layer | Technical purpose | Visibility rule |
|---|---|---|
| `RFQDiscoveryListing` | Public partial information that lets Funders discover an RFQ exists and decide whether to request access. | Public or semi-public, but never the full RFQ package. |
| `RFQDisclosurePackage` | Funder-specific package with the information needed to prepare a Private Quote. | Role-scoped to the entitled Funder and required workflow parties. |
| `PrivateQuote` | Confidential commercial response from a Funder. | Hidden from competing Funders and Coordinators by default. |

The discovery listing must not expose the full RFQ Disclosure Package.

## Regulatory Mode

Regulation is always relevant to eligibility, disclosure, package access, settlement evidence, and receipt generation. Regulator visibility is scoped and mode-dependent.

The preferred MVP mode is **rule-publisher mode**:

- regulation-specific ledger state is not part of the current Phase 1 MVP implementation;
- Compliance Party applies the selected policy assumptions to the Seller, RFQ, Disclosure Boundary, and package access;
- Regulator is not automatically an active party on every RFQ;
- Regulator usually receives a Scoped Compliance Receipt after RFQ Finality.

An optional **pre-approval mode** may add Regulator involvement before quoting or settlement only if the selected regulation requires it.

## Phase 1 — RFQ Origination & Eligibility

### Boundary

Starts when the Seller prepares a Receivable for RFQ. Ends when the Blind RFQ is open for discovery and later private quoting.

### Actors

- Seller
- Compliance Party
- optional Risk Assessor
- optional Regulator, only when the selected regulatory mode requires direct involvement

There is no ledger-level Coordinator in the current Phase 1 MVP implementation.

### Actions

- Create or reference `Receivable`.
- Define RFQ parameters and package disclosure assumptions.
- Issue required `ComplianceAttestation`s.
- Apply compliance policy assumptions to Seller eligibility, RFQ eligibility, disclosure constraints, and package readiness.
- Optionally issue Debtor or Receivable `RiskAttestation`s before package issuance.
- Prepare package-safe `RFQPackageData`.
- Create Seller-private `RFQRequestAssembly`.
- Optionally open per-Funder `RFQRequest` bridge contracts for off-ledger identified or locally simulated Funders.

### Outputs

- `Receivable`
- `RFQRequestAssembly`
- optional per-Funder `RFQRequest` bridge contracts
- `ComplianceAttestation`s and `ComplianceCertificate`s
- optional `RiskAttestation`s and `RiskCertificate`s
- `RFQPackageData`

## Phase 2 — Private Quoting & Selection

### Boundary

Starts when Funders can discover the RFQ or receive invitations. Ends when a quote is selected for attempted settlement.

### Actors

- Seller
- Funders
- Coordinator
- Compliance Party
- optional Funding Evidence Provider or Proof-of-Funds mechanism

### Actions

- Funders inspect `RFQDiscoveryListing`s.
- Funder requests access or accepts an invitation.
- Workflow checks entitlement to the RFQ package.
- Seller or workflow issues a Funder-specific `RFQDisclosurePackage`.
- Funder submits `PrivateQuote`.
- `PrivateQuote` carries Quote Terms, including Net Purchase Price, settlement timing, recourse model, fees, reserve or holdback, Required Disclosure, Debtor Notification requirement, Quote Expiry, and Proof-of-Funds status.
- Proof-of-Funds Gate checks quote eligibility. It is not a Funding Lock, escrow, reserve, Quote Bond, or settlement guarantee.
- Eligible and still-valid quotes become `EligibleQuote`s or `PendingQuote`s, depending on lifecycle state.
- Seller selection mechanism produces enough information for the Seller to select the Best Compliant Quote.
- Seller selects `SelectedQuote`.
- Seller may define `SellerControlledFallbackQueue` from still-valid Eligible Quotes.

Regulatory rules may constrain Phase 2 access, package issuance, quote eligibility, and disclosure. In the preferred MVP mode, the Regulator does not view live quoting by default.

### Open Technical Question

The exact Seller quote-selection visibility model is not final.

The MVP must preserve real RFQ selection. It may use a multi-row `SellerQuoteView`, a stronger Winning-Only Disclosure protocol, or another mechanism if implementation can support Best Compliant Quote selection without exposing unnecessary quote data.

Until the mechanism is chosen, do not document Seller visibility as necessarily limited to only the Winning Quote or necessarily exposing all Eligible Quotes.

### Outputs

- issued `RFQDisclosurePackage`s
- submitted `PrivateQuote`s
- Proof-of-Funds status or attestation
- `EligibleQuote`s / `PendingQuote`s
- selection view or selection protocol output
- `SelectedQuote`
- optional `SellerControlledFallbackQueue`

## Phase 3 — Settlement & Finality

### Boundary

Starts when `SelectedQuote` enters the Settlement Window. Ends when the RFQ reaches `RFQFinality`.

### Actors

- Seller
- Winning Funder
- optional Fallback Funder
- Coordinator
- optional Compliance Party
- optional Debtor
- optional Auditor or Regulator

### Actions

- `SelectedQuote` enters Settlement Window.
- Winning Funder attempts settlement.
- On-Ledger Demo Settlement assigns the represented Receivable to the Winning Funder and transfers `DemoSettlementAsset` to the Seller.
- On success, record `SettlementResult` and reach `RFQFinality`.
- On failure before `RFQFinality`, record scoped `CommitmentFailure`.
- Seller may promote a still-valid `FallbackQuote` from `SellerControlledFallbackQueue`.
- Debtor Notification occurs only if required by quote terms, compliance, settlement, enforceability, or RFQ terms.
- Issue `ScopedComplianceReceipt` when required.

Regulator receipt visibility is usually post-finality. If a selected regulation requires pre-approval, that requirement must be modeled explicitly rather than making Regulator visibility automatic for all RFQs.

### Outputs

- `SettlementResult`
- represented Receivable assignment state
- `DemoSettlementAsset` transfer state
- `RFQFinality`
- fallback status, if fallback occurred
- optional `ScopedComplianceReceipt`

## Cross-Cutting Rules

| Concern | Rule |
|---|---|
| Discovery | Discovery/listing is Phase 2 or later. The full RFQ Disclosure Package must not be public. |
| Regulation | Regulation-specific ledger state is out of the current Phase 1 MVP; Regulator party involvement remains mode-dependent for later phases. |
| Compliance | Compliance applies selected policy assumptions to Seller eligibility, RFQ eligibility, disclosure constraints, and package access. |
| Risk | Risk Assessor acts before package issuance and produces Debtor or Receivable Risk Attestations; Funders price risk themselves. |
| Regulator risk visibility | Regulator usually needs risk outcomes, references, threshold status, or risk tier when required, not raw underwriting data or raw debtor credit files by default. |
| Proof of Funds | Gates quote eligibility only; does not imply locked, reserved, escrowed, single-use, or guaranteed funds. |
| Quote privacy | Competing Funders do not see competing Private Quotes. |
| Coordinator visibility | Coordinator routes workflow state and invitations without Private Quote contents by default. |
| Funder identity | Identity disclosure is staged and purpose-bound; stronger Unselected Funder hiding remains implementation-dependent. |
| Seller selection visibility | Exact mechanism remains open; document the implemented protocol once chosen. |
| Fallback | Fallback applies only before `RFQFinality` and only for still-valid eligible quotes. |
| Settlement | Demo settlement is a ledger workflow state transition, not production payment or production legal assignment. |
| Compliance receipt | `ScopedComplianceReceipt` discloses required evidence only, usually after finality, not the full RFQ workflow by default. |

## Phase Diagram

```text
Phase 1: RFQ Origination & Eligibility
  Receivable + attestations/certificates + RFQPackageData + RFQRequestAssembly
  -> optional per-Funder RFQRequest bridges

Phase 2: Private Quoting & Selection
  Entitled Funders receive scoped packages and submit Private Quotes
  -> selection mechanism chooses SelectedQuote and optional fallback queue

Phase 3: Settlement & Finality
  SelectedQuote attempts On-Ledger Demo Settlement
  -> success: SettlementResult + RFQFinality + optional receipt
  -> failure before finality: CommitmentFailure + optional fallback promotion
```
