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
- RFQ package data is prepared for later disclosure;
- optional per-Funder `RFQRequest` bridge contracts can be opened for locally simulated target Funders.

Discovery, invitation sourcing, package access policy, and Private Quotes belong to Phase 2. Phase 1 may create per-Funder bridge requests only after the Seller has already identified target Funders off-ledger or in the local simulation.

## Working Assumptions

- There is no ledger-level Coordinator in Phase 1.
- Compliance is included in Phase 1. Regulation is not part of Phase 1; direct regulator/auditor certificate visibility belongs to later settlement/finality flows.
- Risk Assessor is a party.
- Risk assessment output is mandatory for Phase 1 package creation.
- Risk Assessor provides a risk tier, but does not decide whether the risk is acceptable. Funders make that decision in Phase 2.
- Phase 1 prepares package content and may disclose it through per-Funder `RFQRequest` bridge contracts for locally simulated or off-ledger identified Funders.
- The RFQ package data contains package-safe information and references to authority certificates derived from Seller data, Risk Assessor output, and compliance output.
- Discovery and access sourcing are outside Phase 1. Phase 2 will decide whether future package access is public, common to eligible Funders, access-scoped, or Funder-specific.

## Candidate Parties

| Party | Phase 1 role |
|---|---|
| Seller | Self-registers the pre-existing Receivable for the MVP, owns the represented Receivable, prepares package data, and controls when the package is ready for later disclosure. |
| Compliance Party | Checks eligibility, KYC/AML/sanctions/policy status, disclosure rules, RFQ eligibility, and package access rules. |
| Risk Assessor | Assesses Debtor or Receivable risk and produces a mandatory `RiskAttestation` for the Seller before package creation. |

Compliance checks are MVP workflow checks or attestations. They do not imply real KYC/AML integration unless that integration is explicitly added later.

## Candidate Data Partitions

Receivable information should be separated for selective disclosure instead of stored as one monolithic payload. For the MVP, detailed partition payloads remain opaque instead of being modeled as separate structured data types.

| Data partition | Purpose |
|---|---|
| Compliance disclosure | Seller-disclosed information needed for compliance evaluation. It is not disclosed through the package by default. |
| Package-safe metadata | Seller-prepared package metadata for disclosure through `RFQPackageData` on per-Funder `RFQRequest`s. |


## Candidate Contracts

These names are implementation candidates, not final Daml names.

| Contract | Purpose |
|---|---|
| `Receivable` | NFT-like represented receivable for a pre-existing invoice. For the MVP, the Seller self-registers it and remains the owner. |
| `ComplianceAttestation` | Compliance Party-signed detailed compliance output for the Seller package workflow. It contains scoped Seller disclosure and a `ComplianceResult`. |
| `ComplianceCertificate` | Minimal Compliance Party-signed credential derived from a `ComplianceAttestation`. It can be included in or referenced by the RFQ package without exposing the full compliance disclosure. The MVP version is simplified, but the name reflects the intended formal credential semantics. |
| `RiskCertificate` | Minimal Risk Assessor-signed credential derived from a `RiskAttestation`. It can be included in or referenced by the RFQ package without exposing full risk assessment inputs. |
| `RFQRequestAssembly` | Seller-private workflow state for package-safe data and certificate references. It creates per-Funder `RFQRequest` contracts through a nonconsuming validation choice. |
| `RFQRequest` | Per-Funder RFQ bridge created by the validated workflow path. It discloses `RFQPackageData` to one Funder and keeps other Funders hidden. |

## Package Boundary

Phase 1 uses two Daml packages:

- `cloakrfq-lib` contains reusable data types and pure helper functions. It must not contain templates, choices, signatories, observers, controllers, or ledger authorization policy.
- `cloakrfq-contracts` contains deployable templates, choices, and party visibility rules. It imports `cloakrfq-lib`.

This keeps shared domain code reusable while preserving a clear boundary around ledger behavior.

## Candidate Daml Surface

This section names the first likely Daml templates and data types. It is still a design target, not final Daml code.

### `ReceivableTerms` Field Examples

| Field | Meaning | Real-world example |
|---|---|---|
| `payableAmount` | Amount due from the Debtor under the invoice. | `480000.0` for a USD 480,000 invoice. |
| `currency` | Invoice currency code. | `USD`, `EUR`, or `GBP`. |
| `issueDate` | Date the invoice was issued. | `2026-01-01`. |
| `dueDate` | Date payment is due from the Debtor. | `2026-02-15`. |
| `paymentTerms` | Human-readable commercial payment terms. | `Net 45` or `Due 45 days from invoice date`. |

`invoiceId` lives in required `ReceivableMetadata`, not inside `ReceivableTerms`, because it is readable invoice metadata rather than commercial payment terms.

### Data Types

| Data type | Purpose |
|---|---|
| `ReceivableTerms` | MVP invoice/receivable commercial core: payable amount, currency, issue date, due date, and payment terms. |
| `ReceivableMetadata` | Required readable invoice metadata, with required `invoiceId` and optional buyer, purchase-order, and source-system references. |
| `IdentityDisclosure` | Seller-disclosed legal identity information for an entity, such as legal name, jurisdiction, and entity type. |
| `ComplianceDisclosure` | Seller-disclosed information needed by the Compliance Party: Seller identity, Debtor identity, receivable terms, transaction purpose, and disclosure restrictions. |
| `ComplianceResult` | MVP compliance output with `sellerEligible` and `rfqEligible`. |
| `RiskTier` | Closed MVP risk tier: `LowRisk`, `MediumRisk`, or `HighRisk`. |
| `RiskDisclosure` | Minimal Funder-visible input disclosed to the Risk Assessor for risk tiering, currently receivable terms. |
| `RiskResult` | Risk output returned to the Seller, currently the mandatory `riskTier`. |
| `RFQPackageData` | Confirmed Phase 1 package-safe Funder-interested disclosure: receivable terms, risk tier, and shared response deadline. |

### Templates

| Template | Signatories / controllers to decide | Purpose |
|---|---|---|
| `Receivable` | Seller self-registration | Represents the pre-existing Receivable as an immutable, NFT-like ledger object. |
| `ComplianceAttestation` | Compliance Party signatory, Seller observer | Records Compliance Party authority over the detailed compliance result and the disclosed information it evaluated. |
| `ComplianceCertificate` | Compliance Party signatory, observers TBD | Minimal certificate derived from `ComplianceAttestation`; intended to support package authenticity while preserving privacy, with room to become a reusable formal credential later. |
| `RiskCertificate` | Risk Assessor signatory, observers TBD | Minimal certificate derived from `RiskAttestation`; intended to support package authenticity while preserving privacy, with room to become a reusable formal credential later. |
| `RFQRequestAssembly` | Seller signatory | Seller-private assembly workflow that stores `RFQPackageData` plus certificate references and validates them before creating per-Funder `RFQRequest`s. |
| `RFQRequest` | Seller signatory, Funder observer | Minimal bridge from Phase 1 to Phase 2 when created through `OpenRFQRequest`. It is per Funder request and means ready to open, not public/open market discovery. |

### Choice Sketch

| Template | Candidate choice | Purpose |
|---|---|---|
| `ComplianceAttestation` | `CreateComplianceCertificate` | Derive a minimal compliance certificate from the detailed Compliance Party-signed attestation. |
| `RiskAttestation` | `CreateRiskCertificate` | Derive a minimal risk certificate from the detailed Risk Assessor-signed attestation. |

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

Decision: keep `Receivable` as a stable object and use workflow contracts for compliance, risk assessment, and package preparation. Discovery/listing and Funder-originated access requests belong to Phase 2.

## Confirmed Phase 1 Compliance Direction

Compliance is part of the Seller-controlled package workflow, but the Seller is not the authority over compliance. The Compliance Party is the authority over the compliance output.

Use `ComplianceAttestation` as the first simple compliance template. Do not keep a standalone `ComplianceProcess` as a separate Seller-started Phase 1 flow. Package creation may trigger or require compliance work, and the compliance model can evolve from the attestation template later if the workflow needs more steps. Mirror this simplification for risk: do not keep a standalone `RiskAssessmentProcess` in Phase 1; the Risk Assessor creates `RiskAttestation` directly.

`ComplianceAttestation` should include:

- `complianceParty : Party`
- `seller : Party`
- `packageId : Text`
- `receivableCid : ContractId Receivable`
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

The certificate should be minimal but may include the Funder-disclosed overlap that Compliance evaluated, so Funders can compare request package data against Compliance Party-signed facts. It remains linked to the package and receivable with `receivableCid` plus explicit workflow identifiers. Do not introduce hashes, ZK, or encryption in Phase 1.

The Daml authorization reason for deriving the certificate from the attestation is that a contract create requires the authority of the created contract signatories, and consequences of exercising a choice are authorized by the choice actors plus the signatories of the exercised contract. A Seller-authored boolean is therefore not enough; the certificate must be Compliance Party-signed or produced from a Compliance Party-signed contract.

The Canton privacy reason for separating certificate from attestation is that later parties may need to see or use the certificate without seeing the private Compliance-only parts of `ComplianceDisclosure`. In the MVP, the certificate can disclose `certifiedReceivableTerms` because those terms are already part of Funder-visible `RFQPackageData`; it must not disclose Seller identity, Debtor identity, transaction purpose, or disclosure restrictions by default. If a later non-stakeholder must use the certificate, Phase 2 may need explicit disclosure or another visibility mechanism.

Candidate certificate fields:

- `complianceParty : Party`
- `seller : Party`
- `packageId : Text`
- `receivableCid : ContractId Receivable`
- `certifiedReceivableTerms : ReceivableTerms`
- `policyVersion : Text`
- `certificationScope : Text`

Confirmed: do not include `compliancePassed : Bool` on `ComplianceCertificate`. The certificate exists only when the Compliance Party certifies the package/receivable for the stated scope. This avoids downstream code mistakenly relying on a Seller-visible boolean instead of the existence of an authoritative Compliance Party-signed certificate.

`CreateComplianceCertificate` should be a Seller-controlled, nonconsuming choice on `ComplianceAttestation`. The Seller controls certificate creation as part of package assembly, while authenticity still comes from the Compliance Party-signed attestation and resulting certificate. The certificate copies `certifiedReceivableTerms` from `complianceDisclosure.receivableTerms`. The attestation remains active as the detailed private source record.

Do not enforce `ComplianceCertificate` uniqueness on-ledger in Phase 1. Duplicate certificates for the same package are redundant, but not a core security failure because each certificate must still be Compliance Party-authorized. Add contract-key uniqueness later only if duplicate certificates create real workflow or verifier ambiguity.

## Risk Certificate Direction

`RiskCertificate` should mirror the compliance attestation/certificate split. `RiskAttestation` remains the detailed Risk Assessor-signed risk output, while `RiskCertificate` is a package-facing credential derived from it. To make the Funder-visible risk tier verifiable against the input used for tiering, `RiskAttestation` includes a minimal `RiskDisclosure` containing the Funder-visible receivable terms.

The purpose of `RiskCertificate` is to preserve authenticity and scoped disclosure:

- authenticity: it is signed by the Risk Assessor or visibly derived from a Risk Assessor-signed `RiskAttestation`;
- scoped disclosure: it exposes only the Funder-visible input/output needed to verify the risk tier, not full risk assessment inputs.

Candidate certificate fields:

- `riskAssessor : Party`
- `seller : Party`
- `packageId : Text`
- `receivableCid : ContractId Receivable`
- `certifiedReceivableTerms : ReceivableTerms`
- `certifiedRiskTier : RiskTier`
- `riskPolicyVersion : Text`
- `certificationScope : Text`

The risk certificate includes `certifiedRiskTier` because the package workflow discloses the risk tier as part of the package-safe output. It also includes `certifiedReceivableTerms`, sourced from `RiskDisclosure`, so the Funder can verify that the disclosed terms match the terms used for risk tiering. This is different from compliance, where a separate boolean is intentionally avoided.

`CreateRiskCertificate` should follow the same Phase 1 mechanics as compliance: Seller-controlled, nonconsuming, and no on-ledger uniqueness enforcement. The Seller controls certificate creation as part of package assembly, while authenticity still comes from the Risk Assessor-signed attestation and resulting certificate. The certificate copies `certifiedReceivableTerms` from `riskDisclosure.receivableTerms` and `certifiedRiskTier` from `riskResult.riskTier`. The detailed `RiskAttestation` remains active as the private source record.

## RFQ Request Bridge Direction

The Seller-created package anchor is replaced with two templates:

- `RFQRequestAssembly`, a Seller-private workflow that holds `RFQPackageData` and technical certificate references;
- `RFQRequest`, a per-Funder output created by exercising a Seller-controlled validation choice on `RFQRequestAssembly`.

`RFQRequestAssembly` remains Seller-private workflow state. `OpenRFQRequest` fetches and validates the `ComplianceCertificate` and `RiskCertificate` before creating an `RFQRequest`. The validation compares Funder-visible `RFQPackageData` against the certified Funder-visible fields on the certificates.

Important limitation: because `RFQRequest` is currently Seller-signatory, its template constructor is not itself authority-proof against direct Seller creation. The MVP mitigation is to make authority-signed certificates carry the Funder-disclosed certified facts, and to require Funders or later Phase 2 workflow to compare `RFQRequest.packageData` against those certificate fields. A future hardening step may still make the final request authority-signed or certificate-created.

The validation choice should also fetch the `Receivable` by `receivableCid` and assert that all referenced certificates and the assembly point to the same active receivable contract, that `receivable.terms == packageData.receivableTerms`, that certificate issuer parties match the expected `complianceParty` and `riskAssessor`, and that certificate certified fields match `packageData`. This is stronger than relying on copied text references; `fetch` aborts the transaction if the contract ID is not active or visible to the submitting party.

For Phase 1, `RFQRequest` means ready to open, not already open to the market. Phase 2 decides how it becomes visible to Funders and how package access works.

All Funder-interested disclosed business information should live inside `RFQPackageData`; fields outside it should exist only for technical linking, authorization, and validation. The Phase 1 `RFQPackageData` baseline is `receivableTerms`, `riskTier`, and `responseDeadline`. Do not include a Seller-authored `complianceOk` boolean; compliance readiness is validated on-ledger by fetching and checking `ComplianceCertificate`.

Funder discovery and routing are out of scope for the MVP ledger model. In a production or later-branch design, Funders may arrive through a public platform, private Seller invitation, broker/third-party workflow, or another off-ledger channel. For the local MVP, parties are simulated locally, so per-Funder request instances can be tested without deciding the off-ledger sourcing path.

`RFQRequest` should be per request / per Funder interaction when Phase 2 introduces Funder visibility. The current Phase 1 bridge should leave that path open rather than modeling a public marketplace or discovery registry.

All package pieces must be linked together. For Phase 1, use `receivableCid : ContractId Receivable` as the primary receivable link, plus explicit identifiers such as `packageId`. Use `Receivable.metadata.invoiceId` as the readable invoice reference when needed. Do not use hashes, ZK, or encryption for this linking.

`RFQDiscoveryListing` is no longer a Phase 1 template candidate. Move discovery/listing to Phase 2 or later. It also remains open whether discovery/listing should be on-ledger at all.

## Receivable Registration Decision

The real-world receivable is a prerequisite asset for the MVP. Phase 1 does not create the legal receivable itself; it creates an on-ledger representation used by the RFQ workflow.

For the hackathon MVP, use Seller self-registration:

- `Receivable` is the NFT-like represented receivable state object.
- `registrar` is the party that records the receivable on-ledger.
- `owner` is the Seller/current owner of the represented receivable.
- MVP self-registration requires `registrar == owner`.
- `ReceivableMetadata.invoiceId` is the readable invoice reference. It is not the security or workflow identity.
- The implementation should not rely on contract keys as the long-term uniqueness mechanism for Canton 3.x deployment assumptions.
- Sensitive fields such as raw Debtor identity may live on `Receivable` because it is not disclosed to Funders in Phase 1.
- The `Receivable` source object should contain source facts only; eligibility and verification conclusions belong in later workflow attestations.
- Compliance can later attest whether the Seller and RFQ are eligible, including whether the self-registration assumption is acceptable for the MVP flow.

A future third-party registrar model would need its own proposal/acceptance and authorization design.

## Candidate Step Order

1. Seller self-registers a pre-existing `Receivable` as an immutable, NFT-like ledger object.
2. Seller prepares package workflow state and gathers required authority outputs.
3. Compliance Party creates `ComplianceAttestation` from scoped `ComplianceDisclosure`.
4. `ComplianceAttestation` may produce a minimal `ComplianceCertificate` for package use.
5. Risk Assessor creates `RiskAttestation` for the Seller. The attestation contains the risk tier used in the package.
6. `RiskAttestation` may produce a minimal `RiskCertificate` for package use.
7. Seller creates `RFQRequestAssembly` with `RFQPackageData` and certificate references.
8. Seller exercises `RFQRequestAssembly.OpenRFQRequest` for each target Funder to create a per-Funder `RFQRequest` after certificate checks pass.


## Ideas To Consider Later

- Per-request certificates: consider whether `ComplianceCertificate` and `RiskCertificate` should be created once per RFQ assembly or separately per Funder request. This is not a Phase 1 decision yet. Per-request certificates may improve privacy or per-Funder scoping, but they add workflow and visibility complexity.

## Open Questions

1. Should `receivableCid`, `seller`, `packageId`, and issuer party be the full Phase 1 certificate binding set?
2. Should compliance and risk attestations be consumed or kept active when `RFQRequest` is created?
3. Should request/assembly data include versioning before Phase 2 package access is implemented?

## Undecided Implementation Options

### Contract keys for request or assembly uniqueness

The Seller-authored assembly and `RFQRequest` data should be immutable after creation. One option is to use Daml contract keys later to enforce uniqueness for a chosen identifier, such as `(seller, packageId)` or a future request identifier.

This is not yet a decision. A local spike with SDK `3.5.1` verified that contract keys fail under LF target `2.1` with a compiler error saying keys are supported from `2.3`, and the same keyed template builds under LF target `2.3`. The current package configuration uses LF target `2.3`; keep this target under review against the intended Canton deployment environment as package-key usage is implemented.

Open points:

1. Should Phase 1 enforce one active assembly or `RFQRequest` per chosen identifier?
2. Is LF target `2.3` acceptable for the intended Canton deployment environment?
3. If package replacement is ever needed, should the model archive the old package and create a new keyed package, or introduce explicit versioning?

## Non-Goals

- No Funder-originated package access request in Phase 1.
- No public/semi-public listing or discovery contract in Phase 1.
- No decision yet that discovery/listing is on-ledger.
- No Private Quote submission in Phase 1.
- No Seller quote selection in Phase 1.
- No settlement or fallback in Phase 1.
- No regulation modeling in Phase 1.
- No hashes, ZK, or encryption in Phase 1 package linking.
- No production legal assignment or production payment integration.
