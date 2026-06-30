# CloakRFQ Receipts — Phase 1 Technical Design

## Purpose

Define the Phase 1 design for RFQ Origination & Eligibility.

This document is a working design note for issue #9. It sits below the high-level technical design and should be updated as the Phase 1 contract model becomes concrete.

## Phase Boundary

Phase 1 starts when the Seller prepares a Receivable for RFQ.

Phase 1 ends when:

- the Receivable is represented on ledger;
- applicable compliance assumptions and statuses are represented;
- mandatory risk assessment output is represented;
- RFQ package data is prepared for later disclosure.

Phase 1 does not know specific Funders yet. Funder requests, invitations, package access decisions, listing/discovery behavior, and Private Quotes belong to Phase 2.

## Working Assumptions

- There is no ledger-level Coordinator in Phase 1.
- Compliance is included in Phase 1. Regulation is not part of Phase 1; direct regulator/auditor receipt visibility belongs to later settlement/finality flows.
- Risk Assessor is a party.
- Risk assessment is mandatory for Phase 1 package creation.
- Risk Assessor provides a risk tier, but does not decide whether the risk is acceptable. Funders make that decision in Phase 2.
- Phase 1 prepares package content, but does not issue it to specific Funders.
- The RFQ package contains selectively disclosed information derived from Seller data, Risk Assessor output, and compliance output.
- The RFQ package is Seller-controlled in Phase 1. Phase 2 will decide whether package access is public, common to eligible Funders, access-scoped, or Funder-specific.

## Candidate Parties

| Party | Phase 1 role |
|---|---|
| Seller | Owns or creates the Receivable, prepares package data, and controls when the package is ready for later disclosure. |
| Compliance Party | Checks eligibility, KYC/AML/sanctions/policy status, disclosure rules, RFQ eligibility, and package access rules. |
| Risk Assessor | Assesses Debtor or Receivable risk and produces a mandatory risk tier for the Seller before package creation. |

Compliance checks are MVP workflow checks or attestations. They do not imply real KYC/AML integration unless that integration is explicitly added later.

## Candidate Data Partitions

Receivable information should be separated for selective disclosure instead of stored as one monolithic payload. For the MVP, detailed partition payloads remain opaque instead of being modeled as separate structured data types.

| Data partition | Purpose |
|---|---|
| Compliance input | Data needed for compliance evaluation. It is not disclosed through the package by default. |
| Risk input | Data needed by the Risk Assessor. It is not disclosed through the package by default. |
| `RFQPackageData` | Package-safe data prepared for later disclosure to Funders in Phase 2. |

The exact compliance and risk input fields are intentionally deferred until the workflow needs them.

## Candidate Contracts

These names are implementation candidates, not final Daml names.

| Contract | Purpose |
|---|---|
| `Receivable` | Canonical on-ledger object for the Receivable and its partitioned data references. |
| `ComplianceProcess` | Tracks compliance processing for Seller eligibility, RFQ eligibility, disclosure constraints, and package access rules. It does not model regulation in Phase 1. |
| `RiskAssessmentProcess` | Tracks risk assessment work and produces a `RiskAttestation` for the Seller. |
| `RFQPackage` | Represents package-safe data prepared for later disclosure. It contains an aggregate compliance status and mandatory risk tier, both verified against attestations. It is not issued to a specific Funder in Phase 1. |

## Package Boundary

Phase 1 uses two Daml packages:

- `cloakrfq-lib` contains reusable data types and pure helper functions. It must not contain templates, choices, signatories, observers, controllers, or ledger authorization policy.
- `cloakrfq-contracts` contains deployable templates, choices, and party visibility rules. It imports `cloakrfq-lib`.

This keeps shared domain code reusable while preserving a clear boundary around ledger behavior.

## Candidate Daml Surface

This section names the first likely Daml templates and data types. It is still a design target, not final Daml code.

### Data Types

| Data type | Purpose |
|---|---|
| `ReceivableTerms` | MVP commercial core: face value, currency, and days to due. |
| `ComplianceResult` | MVP compliance output with `sellerEligible` and `rfqEligible`. |
| `RiskTier` | Closed MVP risk tier: `LowRisk`, `MediumRisk`, or `HighRisk`. |
| `RiskResult` | Risk output returned to the Seller, currently the mandatory `riskTier`. |
| `RFQPackageData` | Package-safe data prepared for Phase 2: `terms`, `complianceOk`, `riskTier`, and `responseDeadline`. |

### Templates

| Template | Signatories / controllers to decide | Purpose |
|---|---|---|
| `Receivable` | Seller-led | Represents the Receivable and references or contains partitioned data. |
| `ComplianceProcess` | Seller and Compliance Party boundary TBD | Runs MVP compliance checks and produces `ComplianceResult`. |
| `RiskAssessmentProcess` | Seller and Risk Assessor boundary TBD | Runs mandatory risk assessment and produces `RiskAttestation` for the Seller. |
| `RFQPackage` | Seller-led | Stores package-safe data prepared for Phase 2; not issued to a specific Funder in Phase 1. |

### Choice Sketch

| Template | Candidate choice | Purpose |
|---|---|---|
| `Receivable` | `StartCompliance` | Start compliance processing around the Receivable. |
| `Receivable` | `StartRiskAssessment` | Start mandatory risk assessment around the Receivable. |
| `ComplianceProcess` | `RecordComplianceResult` | Record eligibility, access, and disclosure outputs. |
| `RiskAssessmentProcess` | `RecordRiskAttestation` | Record risk output for the Seller. |
| TBD | `CreateRFQPackage` | Create package data while verifying `complianceOk` and `riskTier` against the relevant attestations. |

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

Decision: keep `Receivable` as a stable object and use workflow contracts for compliance, risk assessment, and package preparation. Discovery/listing and Funder requests belong to Phase 2.

## Candidate Step Order

1. Seller creates or references `Receivable` with partitioned data.
2. Compliance Party runs `ComplianceProcess`.
3. Risk Assessor runs mandatory `RiskAssessmentProcess`.
4. `RiskAssessmentProcess` produces `RiskAttestation` for the Seller. The attestation contains the risk tier used in the package.
5. Seller derives package-safe `RFQPackageData` from receivable terms, compliance output, and risk output.
6. Seller creates `RFQPackage`. The package may exist whether `complianceOk` is true or false, but `complianceOk` must equal `sellerEligible && rfqEligible`, and `riskTier` must match the `RiskAttestation`.

## Open Questions

1. Which template or choice should create `RFQPackage` while verifying compliance and risk attestation accuracy?
2. Should compliance and risk attestations be consumed or kept active when `RFQPackage` is created?
3. Should package data include a package version or hash before Phase 2 package access is implemented?

## Undecided Implementation Options

### Contract keys for package uniqueness

`RFQPackage` package data should be immutable after creation. One option is to use a Daml contract key to enforce at most one active package for a given Seller and Receivable reference, for example `(seller, receivableRef)` with `seller` as maintainer.

This is not yet a decision. A local spike with SDK `3.5.1` verified that contract keys fail under LF target `2.1` with a compiler error saying keys are supported from `2.3`, and the same keyed template builds under LF target `2.3`. The current package configuration still uses LF target `2.1`; do not change the target version until the Phase 1 package-key design is accepted and the target is checked against the intended Canton deployment environment.

Open points:

1. Should Phase 1 enforce one active `RFQPackage` per `(seller, receivableRef)`?
2. Should the ledger packages move from LF target `2.1` to `2.3` to support contract keys?
3. If package replacement is ever needed, should the model archive the old package and create a new keyed package, or introduce explicit versioning?

## Non-Goals

- No Funder-specific package issuance in Phase 1.
- No Funder package access request in Phase 1.
- No public/semi-public listing or discovery contract in Phase 1.
- No Funder-originated RFQ request in Phase 1.
- No Private Quote submission in Phase 1.
- No Seller quote selection in Phase 1.
- No settlement or fallback in Phase 1.
- No regulation modeling in Phase 1.
- No production legal assignment or production payment integration.
