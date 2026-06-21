# CloakRFQ Receipts — Product Requirements Document

Last updated: 2026-06-21

## Problem Statement

Businesses that want liquidity from Receivable Sales need a credible RFQ workflow that does not expose unnecessary commercial, identity, funding, compliance, or audit data. Public bid books or operator-visible marketplaces are a poor fit because Sellers may not want to reveal the full Receivable workflow, Funders should not see competing Private Quotes, Coordinators should not read quote contents by default, and Auditors or Regulators should receive only the scoped evidence they are entitled to see.

CloakRFQ Receipts needs an MVP implementation plan that preserves real-world RFQ functionality while demonstrating Canton-native selective disclosure, role-based authorization, private quote handling, proof-backed bid eligibility, Seller-controlled quote selection, fallback, On-Ledger Demo Settlement, and Scoped Compliance Receipts.

## Solution

Build CloakRFQ Receipts as a private, functionality-preserving RFQ marketplace for Receivable Sales on Canton.

The MVP demonstrates one complete happy path and one Selected Quote failure/fallback branch. A Seller creates a Receivable, opens a Blind RFQ, receives Eligible Quotes through a Seller Quote View, selects the Best Compliant Quote, and completes On-Ledger Demo Settlement using a Demo Settlement Asset. Funders submit Private Quotes with Proof-of-Funds status and do not see each other's quotes. Compliance and optional Risk parties provide scoped attestations. If the Selected Quote fails before RFQ Finality, the Seller may promote a still-valid Eligible Quote from a Seller-Controlled Fallback Queue. If required, an Auditor or Regulator receives a Scoped Compliance Receipt rather than the full RFQ workflow.

The MVP is positioned for Track 1: Private DeFi & Capital Markets, with invoice financing / Receivable Sales as the use case. It must not overclaim production payment finality, production custody, production legal assignment, Debtor enforceability, ZK proofs, cryptographic blind auction behavior, Funding Locks, escrow, stablecoin settlement, Canton Coin/Amulet integration, or real bank settlement.

## Why Canton

CloakRFQ uses Canton because private invoice-financing RFQs need more than tokenization. They need selective disclosure, private RFQs, role-based authorization, atomic multi-party settlement, institutional decentralisation, workflow efficiency, and auditability without exposing the full marketplace.

## MVP Success Criteria

The MVP is successful if:

- Seller can create a Receivable and open a Blind RFQ.
- At least two Funders can submit Private Quotes with Proof-of-Funds status.
- Competing Funders cannot see each other's Private Quotes.
- Coordinator does not see Private Quote contents by default.
- Seller can compare Eligible Quotes through Seller Quote View.
- Seller can select Best Compliant Quote using Selection Criteria.
- Selected Quote can either settle or fail before RFQ Finality.
- Seller can promote a Fallback Quote after Commitment Failure.
- On-Ledger Demo Settlement transfers the represented Receivable and Demo Settlement Asset.
- Auditor or Regulator receives a Scoped Compliance Receipt without full RFQ visibility.

## User Stories

1. As a Seller, I want to create a Receivable, so that I can offer it for liquidity through a private RFQ process.
2. As a Seller, I want to define RFQ parameters, so that Funders know the commercial boundaries for quoting.
3. As a Seller, I want to define a Disclosure Boundary, so that only necessary information is revealed before quote submission, after selection, during settlement, and for audit or regulation.
4. As a Seller, I want to open a Blind RFQ, so that Funders can quote without seeing each other's Private Quotes.
5. As a Seller, I want Funders to receive an RFQ Disclosure Package, so that they can quote from attestation-first information rather than raw sensitive records by default.
6. As a Seller, I want the RFQ Disclosure Package to include Core Pre-Quote Facts, so that Funders can price the Receivable meaningfully.
7. As a Seller, I want Debtor Risk or Receivable Risk represented through attestations where practical, so that raw Debtor, invoice, or underwriting data is not disclosed by default.
8. As a Seller, I want Compliance Party eligibility attestations, so that only compliant participants and transactions proceed.
9. As a Seller, I want optional Risk Attestations, so that Funders can price risk without unnecessary raw data exposure.
10. As a Seller, I want Private Quotes to pass a Proof-of-Funds Gate, so that I do not compare quotes with no funding-capacity evidence.
11. As a Seller, I want Proof of Funds to be bid eligibility evidence only, so that the product does not overclaim that funds are locked, reserved, escrowed, or guaranteed.
12. As a Seller, I want a Seller Quote View, so that I can compare Eligible Quotes without receiving raw Proof-of-Funds evidence or Funder balances by default.
13. As a Seller, I want the Seller Quote View to show Net Purchase Price, settlement timing, recourse model, fees, reserves or holdbacks, Required Disclosure, Debtor Notification requirement, Compliance status, and Proof-of-Funds status, so that I can select the Best Compliant Quote.
14. As a Seller, I want Funder identity hidden by default in the Seller Quote View, so that unnecessary Funder identity disclosure is avoided.
15. As a Seller, I want Funder identity disclosed only when required by selection, compliance, settlement, audit, regulation, or RFQ terms, so that disclosure has a defined purpose.
16. As a Seller, I want to select the Best Compliant Quote based on Selection Criteria, so that I am not forced to select the highest headline price.
17. As a Seller, I want Required Disclosure to be part of a Private Quote's commercial terms, so that I can account for privacy cost when comparing quotes.
18. As a Seller, I want Debtor Notification requirements to be quote terms, so that I can choose between confidential and disclosed Receivable Sale paths where allowed.
19. As a Seller, I want Private Quotes to have Quote Expiry, so that quote validity is explicit and bounded.
20. As a Seller, I want Private Quotes to be Binding Quotes during the Quote Validity Period under demo workflow rules, so that fallback and selection behavior is credible in the MVP.
21. As a Seller, I want Binding Quotes to avoid external legal enforceability claims unless legal workflows are added, so that the demo does not overstate enforceability.
22. As a Seller, I want to define a Seller-Controlled Fallback Queue, so that fallback ordering reflects my Selection Criteria rather than highest headline price alone.
23. As a Seller, I want to promote a Fallback Quote if the Selected Quote fails before RFQ Finality, so that the RFQ can recover from Commitment Failure.
24. As a Seller, I want fallback rights to end after RFQ Finality, so that fallback is not confused with post-settlement Funder exit.
25. As a Seller, I want On-Ledger Demo Settlement to assign the represented Receivable to the Winning Funder and transfer Demo Settlement Asset to me, so that the demo shows payment-versus-receivable settlement as ledger state transitions.
26. As a Seller, I want Demo Settlement Asset to be clearly non-production, so that the demo does not claim real payment finality, real bank settlement, stablecoin settlement, Canton Coin/Amulet integration, or production custody.
27. As a Seller, I want Receivable assignment treated as an MVP workflow state transition, so that the demo does not claim production legal assignment, perfection, Debtor enforceability, or jurisdiction-specific transfer compliance.
28. As a Funder, I want to receive only the RFQ Disclosure Package I am entitled to see, so that I can evaluate the Receivable without seeing unnecessary Seller or Debtor data.
29. As a Funder, I want to submit a Private Quote, so that my commercial terms are not visible to competing Funders.
30. As a Funder, I want my Private Quote hidden from the Coordinator by default, so that workflow routing does not imply quote visibility.
31. As a Funder, I want to include Net Purchase Price, settlement timing, recourse, fees, reserve or holdback, Required Disclosure, Debtor Notification requirement, Quote Expiry, and Proof-of-Funds status in my Private Quote, so that the Seller can evaluate my offer as a complete commercial package.
32. As a Funder, I want to provide Proof-of-Funds status or attestation without exposing raw balances or funding sources to the Seller by default, so that funding evidence remains scoped.
33. As a Funder, I want to see my own quote outcome, so that I know whether my quote was selected, unselected, expired, or used as fallback.
34. As a Funder, I want competing Funders to be unable to see my Private Quote, so that my pricing strategy and terms remain confidential.
35. As a Funder, I want Unselected Quote and Unselected Funder privacy treated as privacy ambitions where stronger mechanisms are feasible, so that the MVP does not overclaim unavailable privacy properties.
36. As a Winning Funder, I want settlement status for my selected transaction, so that I can see whether the Receivable Sale completed.
37. As an Unselected Funder, I want my identity and quote details minimized by default, so that participating in an RFQ does not unnecessarily reveal market interest.
38. As a Coordinator, I want to route invitations, deadlines, and workflow status, so that the RFQ process can proceed without making me a quote-visible marketplace operator.
39. As a Coordinator, I want no default access to Private Quote contents, so that the application demonstrates Maximum Practical Privacy around the real RFQ workflow.
40. As a Compliance Party, I want to issue eligibility attestations, so that participant and transaction eligibility can be checked without disclosing all underlying attributes.
41. As a Compliance Party, I want compliance status to flow into Seller Quote View, so that the Seller can choose from Eligible Quotes.
42. As a Risk Assessor, I want to issue scoped Risk Attestations, so that Funders can price Debtor Risk or Receivable Risk without full raw data disclosure by default.
43. As a Risk Assessor, I want my role separate from Compliance, Audit, Coordination, Seller, and Funder roles, so that risk evaluation remains scoped.
44. As the system, I want to support Proof-of-Funds status or attestation as an implementation option, so that bid eligibility can be checked without committing the MVP to a specific verifier model.
45. As an Auditor, I want to receive a Scoped Compliance Receipt, so that I can verify required workflow outcomes without seeing the full RFQ.
46. As a Regulator, I want to receive compliance-relevant statuses, references, attestations, timestamps, and final settlement outcome, so that regulatory disclosure can be selective and purpose-bound.
47. As an Auditor or Regulator, I want the Scoped Compliance Receipt to include RFQ/workflow reference, opaque Receivable reference, Seller eligibility status, Winning Funder eligibility status, Risk Attestation reference if used, Proof-of-Funds Gate status for the Winning Quote, quote-selection statement, settlement status, Debtor Notification mode, fallback status if fallback occurred, and RFQ Finality timestamp, so that I can inspect the relevant compliance trail.
48. As an Auditor or Regulator, I do not want full RFQ workflow, full Quote Book, all Private Quotes, raw Proof-of-Funds data, raw Sensitive Attributes, raw invoice documents, Unselected Funder identities, or full party records by default, so that privacy is preserved while auditability remains possible.
49. As a Seller, I want Debtor Notification to be optional and disclosure-controlled, so that the Debtor is notified only when required by quote terms, compliance, settlement, enforceability, or RFQ terms.
50. As a demo viewer, I want to see different party views, so that I can understand how Canton role-scoped visibility supports the product.
51. As a hackathon judge, I want the demo to show private invoice-financing RFQs, so that the project clearly fits Private DeFi & Capital Markets.
52. As a hackathon judge, I want to see that disclosure is part of the quote, so that the project's original commercial insight is visible.
53. As a developer, I want the MVP to use minimal, demoable templates, so that implementation can focus on the core Receivable Sale RFQ lifecycle.
54. As a developer, I want one happy path and one failure/fallback branch, so that scope remains feasible for a hackathon implementation.
55. As a developer, I want the implementation to distinguish Privacy Guarantees from Privacy Ambitions, so that product claims remain accurate.
56. As a developer, I want the implementation to respect Canton stakeholder and participant trust boundaries, so that privacy is not described as full anonymity or secrecy from hosting infrastructure operators.
57. As a developer, I want production payment integration, real KYC/AML integration, real invoice verification, production underwriting, monetary penalties, Quote Bonds, and secondary market exit excluded from the MVP, so that the MVP remains focused.
58. As a reviewer, I want the code and demo to avoid claiming ZK proofs, cryptographic blind auction behavior, production custody, stablecoin settlement, Canton Coin/Amulet integration, or real bank settlement, so that documentation and implementation stay aligned.

## Implementation Decisions

- Build the MVP around Receivable Sales, not secured lending.
- Use Receivable as the canonical financed object, not generic RWA.
- Use Seller, Funder, Debtor, Coordinator, Compliance Party, optional Risk Assessor, optional Funding Evidence Provider, Auditor, and Regulator as the main workflow roles.
- Preserve Real-World RFQ Functionality before optimizing privacy. Do not replace comparative quote selection with threshold acceptance solely for privacy.
- Model the RFQ as a Blind RFQ where competing Funders do not see each other's Private Quotes.
- Keep Coordinators as workflow routers by default, not quote-visible marketplace operators.
- Provide an attestation-first RFQ Disclosure Package with Core Pre-Quote Facts.
- Treat Debtor Notification as optional and disclosure-controlled.
- Require Proof of Funds as bid eligibility evidence for Private Quotes.
- Do not treat Proof of Funds as a Funding Lock, reserve, escrow, Quote Bond, settlement guarantee, single-use proof, or guarantee that funds remain available at settlement.
- Provide a Seller Quote View as the MVP quote-selection surface.
- Hide full Funder identity by default in Seller Quote View unless disclosure is required by Selection Criteria, Required Disclosure, compliance, settlement, audit, regulation, or RFQ terms.
- Allow the Seller to select the Best Compliant Quote using Selection Criteria rather than highest headline price alone.
- Treat Required Disclosure as part of Quote Terms and therefore part of the commercial comparison.
- Use Binding Quotes with Quote Expiry during the MVP, binding under demo workflow rules only.
- Use a Seller-Controlled Fallback Queue for still-valid Eligible Quotes if the Selected Quote fails before RFQ Finality.
- Use On-Ledger Demo Settlement with a Demo Settlement Asset to show a represented Receivable assignment and demo payment transfer as application workflow state transitions.
- Do not claim production payment finality, production custody, real bank settlement, stablecoin settlement, Canton Coin/Amulet integration, production legal assignment, perfection, Debtor enforceability, or jurisdiction-specific receivables-transfer compliance.
- Create Scoped Compliance Receipts for entitled Auditors or Regulators when required.
- Treat Canton privacy as stakeholder- and participant-based role-scoped selective disclosure, not full anonymity or secrecy from a party's own infrastructure operator.
- Keep the MVP focused on one complete happy path and one Selected Quote failure/fallback branch.
- Track 1 positioning is Private DeFi & Capital Markets, with private credit / invoice financing as the use case.
- Open implementation details remain: exact Daml template and choice design, exact Proof-of-Funds mechanism, quote-selection protocol details, Debtor identity disclosure rules, post-settlement Funder exit model, post-MVP penalties/reputation/Quote Bond design, and any future production payment integration.

## Testing Decisions

- The primary testing seam should be the full Daml/Canton workflow lifecycle, tested at the highest practical level: happy path plus failure/fallback branch across role-specific party views.
- Good tests should assert externally observable workflow behavior and party visibility, not internal helper implementation details.
- Happy path coverage should verify Receivable creation, Blind RFQ opening, optional Risk Attestation, Compliance Attestation, RFQ Disclosure Package delivery, Private Quote submission, Proof-of-Funds status, Seller Quote View, Best Compliant Quote selection, Settlement Window entry, On-Ledger Demo Settlement, and Scoped Compliance Receipt creation.
- Failure/fallback coverage should verify Selected Quote failure before RFQ Finality, scoped Commitment Failure recording, Seller-Controlled Fallback Queue promotion, fallback settlement attempt, and fallback status in the Scoped Compliance Receipt without exposing the full Quote Book by default.
- Role-view tests should verify that competing Funders do not see each other's Private Quotes, Coordinators do not read Private Quote contents by default, Sellers see Seller Quote View and Proof-of-Funds status/attestation rather than raw proof data or balances, and Auditors/Regulators see Scoped Compliance Receipts rather than full RFQ data.
- Negative tests should verify that expired quotes cannot be selected or promoted, ineligible quotes do not enter Seller Quote View as Eligible Quotes, fallback cannot be used after RFQ Finality, and fallback is not automatically ordered by highest headline price.
- Claim-boundary tests or demo assertions should ensure the UI/docs do not present Demo Settlement Asset as real money, stablecoin, Canton Coin/Amulet, bank settlement, production custody, or production legal assignment.
- Since implementation does not yet exist, there is no code-level prior art in the repository. The documented prior art is the MVP Build Spec, Project Brief, glossary, and ADRs.

## Out of Scope

- Secured lending.
- Generic RWA tokenization as the primary product.
- Public bid book or operator-visible quote book.
- Threshold acceptance as the canonical RFQ model.
- Full cryptographic blind auction.
- ZK proofs.
- Production payment integration.
- Real Canton Coin/Amulet settlement.
- Stablecoin integration.
- Real bank or custodian settlement.
- Production custody.
- Production legal receivables assignment, perfection, Debtor enforceability, or jurisdiction-specific receivables-transfer compliance.
- Real KYC/AML integration.
- Real invoice verification.
- Production underwriting.
- Funding Locks, escrowed funds, locked funding reserves, settlement guarantees, or Quote Bonds in the MVP. This does not exclude modeling reserve or holdback as a quote term.
- Monetary penalties in the MVP.
- Secondary market exit or post-settlement Funder exit.
- Agentic commerce features.
- Full anonymity or secrecy from parties, hosting participant/validator operators, or intentionally entitled contract/transaction viewers.

## Further Notes

- The PRD is synthesized from the documented CloakRFQ Receipts glossary, project brief, MVP build spec, hackathon alignment note, manifest, and accepted ADRs.
- The implementation should keep product language precise: Funder, not Lender; Receivable Sale, not loan; Demo Settlement Asset, not production money; Scoped Compliance Receipt, not zero-knowledge proof.
- The demo should make the Canton value proposition visible through different party views and selective disclosure.
- The project should be presented under Track 1: Private DeFi & Capital Markets.
- The ideal first implementation milestone is a minimal, demoable Daml/Canton workflow that supports the documented happy path and fallback branch before adding optional stronger privacy mechanisms or production integrations.
