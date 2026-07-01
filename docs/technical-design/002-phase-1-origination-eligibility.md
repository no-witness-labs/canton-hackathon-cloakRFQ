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
- Compliance is included in Phase 1. Regulation is not part of Phase 1; direct regulator/auditor certificate visibility belongs to later settlement/finality flows.
- Risk Assessor is a party.
- Risk assessment is mandatory for Phase 1 package creation.
- Risk Assessor provides a risk tier, but does not decide whether the risk is acceptable. Funders make that decision in Phase 2.
- Phase 1 prepares package content, but does not issue it to specific Funders.
- The RFQ package contains selectively disclosed information derived from Seller data, Risk Assessor output, and compliance output.
- The RFQ package is Seller-controlled in Phase 1. Phase 2 will decide whether package access is public, common to eligible Funders, access-scoped, or Funder-specific.

## Candidate Parties

| Party | Phase 1 role |
|---|---|
| Seller | Self-registers the pre-existing Receivable for the MVP, owns the represented Receivable, prepares package data, and controls when the package is ready for later disclosure. |
| Compliance Party | Checks eligibility, KYC/AML/sanctions/policy status, disclosure rules, RFQ eligibility, and package access rules. |
| Risk Assessor | Assesses Debtor or Receivable risk and produces a mandatory risk tier for the Seller before package creation. |

Compliance checks are MVP workflow checks or attestations. They do not imply real KYC/AML integration unless that integration is explicitly added later.

## Candidate Data Partitions

Receivable information should be separated for selective disclosure instead of stored as one monolithic payload. For the MVP, detailed partition payloads remain opaque instead of being modeled as separate structured data types.

| Data partition | Purpose |
|---|---|
| Compliance disclosure | Seller-disclosed information needed for compliance evaluation. It is not disclosed through the package by default. |
| Risk input | Data needed by the Risk Assessor. It is not disclosed through the package by default. |
| `RFQPackageData` | Package-safe data prepared for later disclosure to Funders in Phase 2. |

The exact risk input fields are intentionally deferred until the workflow needs them.

## Candidate Contracts

These names are implementation candidates, not final Daml names.

| Contract | Purpose |
|---|---|
| `Receivable` | NFT-like represented receivable for a pre-existing invoice. For the MVP, the Seller self-registers it and remains the owner. |
| `ComplianceAttestation` | Compliance Party-signed detailed compliance output for the Seller package workflow. It contains scoped Seller disclosure and a `ComplianceResult`. |
| `ComplianceCertificate` | Minimal Compliance Party-signed credential derived from a `ComplianceAttestation`. It can be included in or referenced by the RFQ package without exposing the full compliance disclosure. The MVP version is simplified, but the name reflects the intended formal credential semantics. |
| `RiskAssessmentProcess` | Tracks risk assessment work and produces a `RiskAttestation` for the Seller. |
| `RiskCertificate` | Minimal Risk Assessor-signed credential derived from a `RiskAttestation`. It can be included in or referenced by the RFQ package without exposing full risk assessment inputs. |
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
| `IdentityDisclosure` | Seller-disclosed legal identity information for an entity, such as legal name, jurisdiction, and entity type. |
| `ComplianceDisclosure` | Seller-disclosed information needed by the Compliance Party: Seller identity, Debtor identity, receivable terms, transaction purpose, and disclosure restrictions. |
| `ComplianceResult` | MVP compliance output with `sellerEligible` and `rfqEligible`. |
| `RiskTier` | Closed MVP risk tier: `LowRisk`, `MediumRisk`, or `HighRisk`. |
| `RiskResult` | Risk output returned to the Seller, currently the mandatory `riskTier`. |
| `RFQPackageData` | Package-safe data prepared for Phase 2: `terms`, `complianceOk`, `riskTier`, and `responseDeadline`. |

### Templates

| Template | Signatories / controllers to decide | Purpose |
|---|---|---|
| `Receivable` | Seller self-registration | Represents the pre-existing Receivable as an immutable, NFT-like ledger object keyed by `(registrar, invoiceId)`. |
| `ComplianceAttestation` | Compliance Party signatory, Seller observer | Records Compliance Party authority over the detailed compliance result and the disclosed information it evaluated. |
| `ComplianceCertificate` | Compliance Party signatory, observers TBD | Minimal certificate derived from `ComplianceAttestation`; intended to support package authenticity while preserving privacy, with room to become a reusable formal credential later. |
| `RiskAssessmentProcess` | Seller and Risk Assessor boundary TBD | Runs mandatory risk assessment and produces `RiskAttestation` for the Seller. |
| `RiskCertificate` | Risk Assessor signatory, observers TBD | Minimal certificate derived from `RiskAttestation`; intended to support package authenticity while preserving privacy, with room to become a reusable formal credential later. |
| `RFQPackage` | Seller-led | Thin on-ledger package anchor for a Seller-controlled funding workflow. It references or is linked to authority outputs such as compliance and risk certificates; it is not issued to a specific Funder in Phase 1. |

### Choice Sketch

| Template | Candidate choice | Purpose |
|---|---|---|
| `Receivable` | `StartRiskAssessment` | Start mandatory risk assessment around the Receivable. |
| `ComplianceAttestation` | `CreateComplianceCertificate` | Derive a minimal compliance certificate from the detailed Compliance Party-signed attestation. |
| `RiskAssessmentProcess` | `RecordRiskAttestation` | Record risk output for the Seller. |
| `RiskAttestation` | `CreateRiskCertificate` | Derive a minimal risk certificate from the detailed Risk Assessor-signed attestation. |
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

## Confirmed Phase 1 Compliance Direction

Compliance is part of the Seller-controlled package workflow, but the Seller is not the authority over compliance. The Compliance Party is the authority over the compliance output.

Use `ComplianceAttestation` as the first simple compliance template. Do not keep a standalone `ComplianceProcess` as a separate Seller-started Phase 1 flow. Package creation may trigger or require compliance work, and the compliance model can evolve from the attestation template later if the workflow needs more steps.

`ComplianceAttestation` should include:

- `complianceParty : Party`
- `seller : Party`
- `packageId : Text`
- `receivableRef : Text`
- `complianceDisclosure : ComplianceDisclosure`
- `complianceResult : ComplianceResult`

The `ComplianceAttestation` signatory is the Compliance Party. The Seller observes it.

`ComplianceDisclosure` should use clearly named subtypes and compact field comments in code. The confirmed MVP baseline is:

- `sellerIdentity : IdentityDisclosure`
- `debtorIdentity : IdentityDisclosure`
- `receivableTerms : ReceivableTerms`
- `transactionPurpose : Text`
- `disclosureRestrictions : Text`

`IdentityDisclosure` should contain:

- `legalName : Text`
- `jurisdiction : Text`
- `entityType : Text`

Keep `ComplianceResult` as the current two booleans:

- `sellerEligible : Bool`
- `rfqEligible : Bool`

## Compliance Certificate Direction

`ComplianceCertificate` should be a separate contract related to `ComplianceAttestation`, not an independent Seller-created claim.

The purpose of `ComplianceCertificate` is to preserve authenticity and privacy while naming the artifact as a formal compliance credential:

- authenticity: it is signed by the Compliance Party or visibly derived from a Compliance Party-signed `ComplianceAttestation`;
- privacy: it does not expose the full `ComplianceDisclosure`.

The certificate should be minimal and linked to the package and receivable with explicit workflow identifiers. Do not introduce hashes, ZK, or encryption in Phase 1.

The Daml authorization reason for deriving the certificate from the attestation is that a contract create requires the authority of the created contract signatories, and consequences of exercising a choice are authorized by the choice actors plus the signatories of the exercised contract. A Seller-authored boolean is therefore not enough; the certificate must be Compliance Party-signed or produced from a Compliance Party-signed contract.

The Canton privacy reason for separating certificate from attestation is that later parties may need to see or use the minimal certificate without seeing the private `ComplianceDisclosure`. If a later non-stakeholder must use the certificate, Phase 2 may need explicit disclosure or another visibility mechanism.

Candidate certificate fields:

- `complianceParty : Party`
- `seller : Party`
- `packageId : Text`
- `receivableRef : Text`
- `policyVersion : Text`
- `certificationScope : Text`

Confirmed: do not include `compliancePassed : Bool` on `ComplianceCertificate`. The certificate exists only when the Compliance Party certifies the package/receivable for the stated scope. This avoids downstream code mistakenly relying on a Seller-visible boolean instead of the existence of an authoritative Compliance Party-signed certificate.

`CreateComplianceCertificate` should be a Seller-controlled, nonconsuming choice on `ComplianceAttestation`. The Seller controls certificate creation as part of package assembly, while authenticity still comes from the Compliance Party-signed attestation and resulting certificate. The attestation remains active as the detailed private source record.

Do not enforce `ComplianceCertificate` uniqueness on-ledger in Phase 1. Duplicate certificates for the same package are redundant, but not a core security failure because each certificate must still be Compliance Party-authorized. Add contract-key uniqueness later only if duplicate certificates create real workflow or verifier ambiguity.

## Risk Certificate Direction

`RiskCertificate` should mirror the compliance attestation/certificate split. `RiskAttestation` remains the detailed Risk Assessor-signed risk output, while `RiskCertificate` is a minimal package-facing credential derived from it.

The purpose of `RiskCertificate` is to preserve authenticity and privacy:

- authenticity: it is signed by the Risk Assessor or visibly derived from a Risk Assessor-signed `RiskAttestation`;
- privacy: it does not expose full risk assessment inputs.

Candidate certificate fields:

- `riskAssessor : Party`
- `seller : Party`
- `packageId : Text`
- `receivableRef : Text`
- `riskTier : RiskTier`
- `riskPolicyVersion : Text`
- `certificationScope : Text`

The risk certificate may include `riskTier` because the package workflow needs to disclose the risk tier as part of the package-safe output. This is different from compliance, where a separate boolean is intentionally avoided.

## RFQ Package Direction

The RFQ package should be modeled as a thin on-ledger anchor plus related contracts and metadata, not as one large monolithic contract.

The full package can be assembled by the application off-ledger from:

- the on-ledger `RFQPackage` anchor;
- related authority contracts or certificates such as `ComplianceCertificate` and `RiskCertificate`;
- package-safe metadata;
- later Phase 2 disclosure or access artifacts.

All package pieces must be linked together. For Phase 1, use explicit identifiers such as `packageId` and `receivableRef`. Do not use hashes, ZK, or encryption for this linking.

`RFQDiscoveryListing` is no longer a Phase 1 template candidate. Move discovery/listing to Phase 2 or later. It also remains open whether discovery/listing should be on-ledger at all.

## Receivable Registration Decision

The real-world receivable is a prerequisite asset for the MVP. Phase 1 does not create the legal receivable itself; it creates an on-ledger representation used by the RFQ workflow.

For the hackathon MVP, use Seller self-registration:

- `Receivable` is the NFT-like represented receivable state object.
- `registrar` is the party that records the receivable on-ledger.
- `owner` is the Seller/current owner of the represented receivable.
- MVP self-registration requires `registrar == owner`.
- The uniqueness key is `(registrar, invoiceId)`, maintained by `registrar`.
- Sensitive fields such as raw Debtor identity may live on `Receivable` because it is not disclosed to Funders in Phase 1.
- The `Receivable` source object should contain source facts only; eligibility and verification conclusions belong in later workflow attestations.
- Compliance can later attest whether the Seller and RFQ are eligible, including whether the self-registration assumption is acceptable for the MVP flow.

A future third-party registrar model would need its own proposal/acceptance and authorization design.

## Candidate Step Order

1. Seller self-registers a pre-existing `Receivable` as an immutable, NFT-like ledger object.
2. Seller prepares package workflow state and gathers required authority outputs.
3. Compliance Party creates `ComplianceAttestation` from scoped `ComplianceDisclosure`.
4. `ComplianceAttestation` may produce a minimal `ComplianceCertificate` for package use.
5. Risk Assessor runs mandatory `RiskAssessmentProcess`.
6. `RiskAssessmentProcess` produces `RiskAttestation` for the Seller. The attestation contains the risk tier used in the package.
7. `RiskAttestation` may produce a minimal `RiskCertificate` for package use.
8. Seller derives package-safe `RFQPackageData` from receivable terms, compliance output, and risk output.
9. Seller creates `RFQPackage`. The package may exist whether `complianceOk` is true or false, but `complianceOk` must equal `sellerEligible && rfqEligible`, and `riskTier` must match the `RiskAttestation`.

## Open Questions

1. Which template or choice should create `RFQPackage` while verifying compliance and risk attestation accuracy?
2. Should compliance and risk attestations be consumed or kept active when `RFQPackage` is created?
3. Should package data include package versioning before Phase 2 package access is implemented?

## Undecided Implementation Options

### Contract keys for package uniqueness

`RFQPackage` package data should be immutable after creation. One option is to use a Daml contract key to enforce at most one active package for a given Seller and Receivable reference, for example `(seller, receivableRef)` with `seller` as maintainer.

This is not yet a decision. A local spike with SDK `3.5.1` verified that contract keys fail under LF target `2.1` with a compiler error saying keys are supported from `2.3`, and the same keyed template builds under LF target `2.3`. The current package configuration uses LF target `2.3`; keep this target under review against the intended Canton deployment environment as package-key usage is implemented.

Open points:

1. Should Phase 1 enforce one active `RFQPackage` per `(seller, receivableRef)`?
2. Is LF target `2.3` acceptable for the intended Canton deployment environment?
3. If package replacement is ever needed, should the model archive the old package and create a new keyed package, or introduce explicit versioning?

## Non-Goals

- No Funder-specific package issuance in Phase 1.
- No Funder package access request in Phase 1.
- No public/semi-public listing or discovery contract in Phase 1.
- No decision yet that discovery/listing is on-ledger.
- No Funder-originated RFQ request in Phase 1.
- No Private Quote submission in Phase 1.
- No Seller quote selection in Phase 1.
- No settlement or fallback in Phase 1.
- No regulation modeling in Phase 1.
- No hashes, ZK, or encryption in Phase 1 package linking.
- No production legal assignment or production payment integration.
