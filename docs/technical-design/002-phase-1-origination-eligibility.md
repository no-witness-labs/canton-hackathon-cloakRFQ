# CloakRFQ Receipts — Phase 1 Technical Design

## Purpose

Define the Phase 1 design for RFQ Origination & Eligibility.

This document is a working design note for issue #9. It sits below the high-level technical design and should be updated as the Phase 1 contract model becomes concrete.

## Phase Boundary

Phase 1 starts when the Seller prepares a Receivable for RFQ.

Phase 1 ends when:

- the Receivable is represented on ledger;
- applicable compliance assumptions and statuses are represented;
- risk assessment inputs and outputs are represented where used;
- RFQ package content is prepared;
- public or semi-public discovery information is available;
- the RFQ is ready for Phase 2 package access and Private Quoting.

Phase 1 does not know specific Funders yet. Funder requests, invitations, access decisions for a concrete Funder, and Private Quotes belong to Phase 2.

## Working Assumptions

- There is no ledger-level Coordinator in Phase 1.
- Compliance is included in Phase 1. Regulation is not part of Phase 1; direct regulator/auditor receipt visibility belongs to later settlement/finality flows.
- Risk Assessor is a party.
- Risk Assessor does not set final quote prices. Funders price risk themselves in Phase 2.
- Phase 1 prepares package content, but does not issue it to specific Funders.
- The RFQ package contains selectively disclosed information derived from Seller data, Risk Assessor output, and compliance output.
- The RFQ package may be a common package for all eligible Funders rather than a Funder-specific package. Phase 2 will decide whether package access is common, access-scoped, or Funder-specific.

## Candidate Parties

| Party | Phase 1 role |
|---|---|
| Seller | Owns or creates the Receivable, defines RFQ parameters, controls disclosure boundaries, prepares package content, and opens the RFQ. |
| Compliance Party | Checks eligibility, KYC/AML/sanctions/policy status, disclosure rules, RFQ eligibility, and package access rules. |
| Risk Assessor | Optionally assesses Debtor or Receivable risk and produces risk assessment output for the Seller before package issuance. |

Compliance checks are MVP workflow checks or attestations. They do not imply real KYC/AML integration unless that integration is explicitly added later.

## Candidate Data Partitions

Receivable information should be separated for selective disclosure instead of stored as one monolithic payload.

| Data partition | Purpose |
|---|---|
| `ComplianceReceivableData` | Data needed for compliance evaluation. |
| `RiskReceivableData` | Data needed by the Risk Assessor. |
| `FunderReceivableData` | Data intended for the eventual RFQ package shown to eligible Funders. |

The exact fields are not decided in this note.

## Candidate Contracts

These names are implementation candidates, not final Daml names.

| Contract | Purpose |
|---|---|
| `Receivable` | Canonical on-ledger object for the Receivable and its partitioned data references. |
| `ComplianceProcess` | Tracks compliance processing for Seller eligibility, RFQ eligibility, disclosure constraints, and package access rules. It does not model regulation in Phase 1. |
| `RiskAssessmentProcess` | Tracks risk assessment work and produces a `RiskAttestation` for the Seller. |
| `RFQPackage` | Represents final package content prepared for eligible Funders. It contains selectively disclosed information derived by the Seller from Seller data, compliance output, and risk output. It is not issued to a specific Funder in Phase 1. |

## Package Boundary

Phase 1 uses two Daml packages:

- `cloakrfq-core` contains reusable domain data types and pure helper functions. It must not contain templates, choices, signatories, observers, controllers, or ledger authorization policy.
- `cloakrfq-ledger` contains deployable templates, choices, and party visibility rules. It imports `cloakrfq-core`.

This keeps shared domain code reusable while preserving a clear boundary around ledger behavior.

## Candidate Daml Surface

This section names the first likely Daml templates and data types. It is still a design target, not final Daml code.

### Data Types

| Data type | Purpose |
|---|---|
| `ReceivableId` | Stable identifier for the Receivable in the demo workflow. |
| `ReceivableTerms` | Commercial core such as face value, currency, due date, and recourse preference. |
| `ComplianceReceivableData` | Receivable data used by the Compliance Party. |
| `RiskReceivableData` | Receivable and Debtor risk data sent to the Risk Assessor. |
| `FunderReceivableData` | Selectively disclosed data intended for eventual eligible Funders. |
| `DisclosureBoundary` | Seller-defined disclosure constraints for pre-quote, package, and later workflow contexts. |
| `ComplianceResult` | MVP compliance output for Seller eligibility, RFQ eligibility, package access policy, and disclosure constraints. |
| `RiskAttestation` | Risk output returned to the Seller. It includes at least `riskTier`; exact fields remain open. |
| `RFQPackageContent` | Selectively disclosed package content derived by the Seller from Seller data, compliance output, and risk output. |
| `RFQDiscoverySummary` | Partial public or semi-public discovery information. |
| `RFQParameters` | RFQ timing, settlement preference, package policy, and other Phase 1 RFQ settings. |

### Templates

| Template | Signatories / controllers to decide | Purpose |
|---|---|---|
| `Receivable` | Seller-led | Represents the Receivable and references or contains partitioned data. |
| `ComplianceProcess` | Seller and Compliance Party boundary TBD | Runs MVP compliance checks and produces `ComplianceResult`. |
| `RiskAssessmentProcess` | Seller and Risk Assessor boundary TBD | Runs optional risk assessment and produces `RiskAttestation` for the Seller. |
| `RFQPackage` | Seller-led | Stores final package content prepared for eligible Funders; not issued to a specific Funder in Phase 1. |
| `RFQDiscoveryListing` | Seller-led; public/semi-public visibility TBD | Stores partial discovery data only. |
| `RFQRequest` | Seller-led | Opens the RFQ for Phase 2 package access and Private Quoting. |

### Choice Sketch

| Template | Candidate choice | Purpose |
|---|---|---|
| `Receivable` | `StartCompliance` | Start compliance processing around the Receivable. |
| `Receivable` | `StartRiskAssessment` | Start optional risk assessment around the Receivable. |
| `ComplianceProcess` | `RecordComplianceResult` | Record eligibility, access, and disclosure outputs. |
| `RiskAssessmentProcess` | `RecordRiskAttestation` | Record risk output for the Seller. |
| `RFQPackage` | `CreateDiscoveryListing` | Create partial discovery listing from package-safe data. |
| `RFQPackage` | `OpenRFQRequest` | Open Seller-side RFQ workflow for Phase 2. |

The exact placement of choices remains open. In particular, `Receivable` should stay a stable object, so lifecycle choices may move to wrapper workflow templates during implementation.

## Current Contract-Model Question

The main unresolved modeling question is whether `Receivable` should contain the Phase 1 lifecycle choices directly, or whether it should remain a simpler object that is wrapped by more capable workflow contracts.

Option A: `Receivable` owns Phase 1 actions.

- Simpler object graph.
- Fewer contracts at first.
- Risk: the Receivable contract becomes overloaded with compliance, risk, RFQ, and package concerns.

Option B: `Receivable` is a stable object and workflow contracts perform actions around it.

- Cleaner separation between asset data and workflow state.
- Easier to keep selective disclosure boundaries explicit.
- More contracts to implement.

Decision: keep `Receivable` as a stable object and use workflow contracts for compliance, risk assessment, package preparation, discovery, and RFQ opening.

## Candidate Step Order

1. Seller creates or references `Receivable` with partitioned data.
2. Compliance Party runs `ComplianceProcess`.
3. Risk Assessor runs `RiskAssessmentProcess`, if risk assessment is used.
4. `RiskAssessmentProcess` produces `RiskAttestation` for the Seller. The attestation may contain private risk information.
5. Seller derives selectively disclosed package content from receivable data, compliance output, and risk output.
6. Seller creates `RFQPackage`.
7. Seller creates `RFQDiscoveryListing` with partial discovery data only.
8. Seller opens `RFQRequest`.

## Open Questions

1. Should `RFQPackage` be common for all eligible Funders, or can Phase 2 derive Funder-specific package views from a common Phase 1 package?
2. What exact fields should `RiskAttestation` contain beyond at least `riskTier`?
3. What exact output should `ComplianceProcess` produce for Seller eligibility, RFQ eligibility, disclosure constraints, and package access policy?
4. What minimal fields belong in `ComplianceReceivableData`, `RiskReceivableData`, and `FunderReceivableData` for the demo?
5. Should `RFQRequest` reference `RFQPackage` directly, or should it reference a package version/hash/status object?

## Non-Goals

- No Funder-specific package issuance in Phase 1.
- No Funder package access request in Phase 1.
- No Private Quote submission in Phase 1.
- No Seller quote selection in Phase 1.
- No settlement or fallback in Phase 1.
- No regulation modeling in Phase 1.
- No production legal assignment or production payment integration.
