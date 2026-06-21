# CloakRFQ Receipts — MVP Build Spec

Last updated: 2026-06-20

## Purpose

CloakRFQ Receipts is a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton. The MVP demonstrates private quotes, scoped attestations, proof-of-funds eligibility, Seller quote comparison, fallback, on-ledger demo settlement, and scoped compliance receipts.

## MVP scope

Build one complete happy path and one failure/fallback branch.

### Happy path

1. Seller creates a Receivable.
2. Seller opens a Blind RFQ.
3. Risk Assessor may issue a Risk Attestation.
4. Compliance Party issues eligibility attestations.
5. Funders receive RFQ Disclosure Packages.
6. Funders submit Private Quotes with Proof-of-Funds status.
7. Seller receives Seller Quote View.
8. Seller selects the Best Compliant Quote.
9. Selected Quote enters Settlement Window.
10. On-Ledger Demo Settlement assigns Receivable to Winning Funder and transfers Demo Settlement Asset to Seller.
11. Scoped Compliance Receipt is created for Auditor/Regulator if required.

### Failure/fallback branch

1. Selected Quote fails before RFQ Finality.
2. Commitment Failure is recorded in scoped form.
3. Seller promotes a still-valid Eligible Quote from Seller-Controlled Fallback Queue.
4. Fallback quote attempts settlement.
5. Scoped Compliance Receipt records fallback status without exposing full Quote Book by default.

## Suggested Daml/domain objects

These are implementation candidates, not final law:

- Receivable
- RFQRequest
- RFQDisclosurePackage
- ComplianceAttestation
- RiskAttestation
- PrivateQuote
- ProofOfFundsStatus
- SellerQuoteView
- SelectedQuote
- FallbackQueue
- DemoSettlementAsset
- SettlementResult
- ScopedComplianceReceipt

## Party views

- Seller View: create Receivable, open RFQ, review Seller Quote View, select quote, define fallback, see settlement status.
- Funder View: view RFQ Disclosure Package, submit Private Quote, attach/record Proof-of-Funds status, see own quote outcome.
- Compliance View: issue eligibility attestations.
- Risk Assessor View: issue risk attestations.
- Coordinator View: route workflow status and invitations; no quote contents by default.
- Auditor/Regulator View: see Scoped Compliance Receipt only.

## MVP privacy guarantees to demonstrate

- Competing Funders do not see each other's Private Quotes.
- Coordinator does not read Private Quote contents by default.
- Seller sees Seller Quote View, not raw Proof-of-Funds data or Funder balances.
- Funder identity is hidden by default unless required.
- Auditor/Regulator receives Scoped Compliance Receipt, not full RFQ data.
- Outsiders see nothing useful.

## Stretch privacy ambitions

Do not claim these unless implemented:

- Seller sees only Winning Quote.
- Unselected Quotes hidden from Seller.
- Unselected Funders always hidden from Seller.
- Quote selection without any single non-essential party seeing full Quote Book.
- Proof of Funds without revealing raw balances/funding sources.
- Funding Locks, escrow, Quote Bonds, or production payment finality.

## Non-goals

- Production payment integration.
- Real Canton Coin/Amulet settlement.
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

- Keep Proof of Funds as eligibility evidence, not a lock.
- Keep Demo Settlement Asset clearly non-production.
- Keep Scoped Compliance Receipt as selective disclosure, not a zero-knowledge proof.
- Prefer minimal, demoable templates over over-generalized finance infrastructure.
