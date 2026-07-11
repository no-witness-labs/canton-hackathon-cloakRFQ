# CloakRFQ Receipts — MVP Build Spec

Last updated: 2026-07-11

## Purpose

CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. The MVP demonstrates private quotes, scoped attestations, committed allocation-backed quote eligibility, Seller quote comparison, failure recovery, on-ledger demo settlement, and scoped settlement evidence.

## MVP scope

Build one complete happy path and one failed-settlement recovery path.

### Happy path

1. Seller creates a Receivable.
2. Seller opens a Blind RFQ.
3. Risk Assessor may issue a Risk Attestation.
4. Compliance Party issues eligibility attestations.
5. Funders receive RFQ Disclosure Packages.
6. Funders submit Private Quotes backed by scoped funding evidence, concretely committed CIP-56 allocation evidence in Phase 2.
7. Seller receives Seller Quote View.
8. Seller selects a Quote.
9. Selected Quote enters Settlement Window.
10. On-Ledger Demo Settlement pays the Seller and initiates a pending Receivable transfer; the Winning Funder accepts ownership afterward.
11. `ReceivableSaleSettlement` is created for the designated Auditor.

### Failed-settlement recovery

1. A settlement attempt fails atomically.
2. The ledger error is surfaced to the Seller; no failure contract is created.
3. Seller retries or chooses another still-valid Quote after reviewing the ledger error.
4. The chosen Quote attempts settlement.
5. A successful retry creates the same scoped `ReceivableSaleSettlement` evidence.

## Implemented Daml/domain objects

The technical-design documents and ledger source define the exact schemas:

- `Receivable`
- `ComplianceAttestation` and `ComplianceCertificate`
- `RiskAttestation` and `RiskCertificate`
- `RFQPackageData`
- per-Funder `RFQRequest`
- allocation-backed `PrivateQuote`
- CIP-56 settlement interfaces and demo implementations
- `ReceivableSaleSettlement`

## Party views

- Seller View: create a Receivable, open the RFQ, compare Quotes, settle one, inspect errors, and retry or choose another still-valid Quote if needed.
- Funder View: view RFQ Disclosure Package, submit Private Quote, attach/reference committed CIP-56 allocation evidence, see own quote outcome.
- Compliance View: issue eligibility attestations.
- Risk Assessor View: issue risk attestations.
- Coordinator View: route workflow status and invitations; no quote contents by default.
- Auditor View: see scoped `ReceivableSaleSettlement` evidence only.

## MVP privacy guarantees to demonstrate

- Competing Funders do not see each other's Private Quotes.
- Coordinator does not read Private Quote contents by default.
- Seller sees Seller Quote View and scoped allocation reference/status, not raw Funder balances, funding sources, or unrelated financial positions.
- Funder identity is hidden by default unless required.
- The designated Auditor receives scoped `ReceivableSaleSettlement` evidence, not full RFQ data.
- Outsiders see nothing useful.

Caveat: these are application-level Canton privacy goals, not anonymity claims. Parties, their hosting participant or validator operators, and explicitly entitled signatories, observers, controllers, or actors may see the contracts or transaction views they are entitled to see.

## Stretch privacy ambitions

Do not claim these unless implemented:

- Seller sees only Winning Quote.
- Unselected Quotes hidden from Seller.
- Unselected Funders always hidden from Seller.
- Quote selection without any single non-essential party seeing full Quote Book.
- A Proof-of-Funds mechanism that verifies funding capacity without revealing raw balances, funding sources, or unrelated financial positions to any non-essential verifier.
- Production payment finality, production custody, escrow, or Quote Bonds. Phase 2 committed CIP-56 allocations are scoped quote funding evidence, not production settlement finality.

## Non-goals

- Production payment integration.
- Production bank or custodian settlement outside the CIP-56 token demo path.
- Real bank/custodian settlement.
- Stablecoin integration.
- ZK proofs.
- Full cryptographic blind auction.
- Real KYC/AML integration.
- Real invoice verification.
- Production underwriting.
- Monetary penalties.
- Quote Bonds.
- Secondary market exit.

## Implementation notes

- Keep committed CIP-56 allocation evidence scoped to the RFQ; do not describe it as escrow, custody, bank settlement, production payment finality, or guaranteed settlement completion.
- Keep CIP-56 token settlement clearly scoped to the demo environment.
- Treat Receivable assignment as an MVP workflow state transition. Do not claim production legal assignment, perfection, enforceability against the Debtor, or jurisdiction-specific receivables-transfer compliance unless those workflows are explicitly added.
- Treat Binding Quotes as workflow-binding for the MVP, not as externally legally enforceable commitments unless legal-enforcement workflows are explicitly added.
- Keep `ReceivableSaleSettlement` record as selective disclosure, not a zero-knowledge proof.
- Prefer minimal, demoable templates over over-generalized finance infrastructure.
