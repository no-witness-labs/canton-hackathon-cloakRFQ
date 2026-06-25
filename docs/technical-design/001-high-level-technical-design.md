# CloakRFQ Receipts — High-Level Technical Design

## Purpose

This document is the first implementation-oriented technical design note for CloakRFQ Receipts.

It modularises the financial workflow into a small number of phases that are easy to reason about, implement, test, and demo on Canton.

This document sits below the PRD and project brief, but above detailed Daml template, choice, visibility, API, and UI design.

## Document scope

This document defines:

- the canonical high-level workflow phases;
- the boundary of each phase;
- the main actors in each phase;
- the main technical actions in each phase;
- how RFQ discovery differs from private RFQ disclosure;
- where cross-cutting concerns fit.

This document does not define:

- exact Daml templates;
- exact Daml choices;
- contract signatories, observers, controllers, or actors;
- API endpoints;
- frontend screen layouts;
- exact Proof-of-Funds mechanism;
- exact quote-selection privacy protocol;
- production payment integration;
- production legal assignment mechanics.

Those belong in later technical-design documents and implementation tasks.

## Phase model

CloakRFQ has three main implementation phases:

1. **RFQ Origination & Eligibility**
2. **Private Quoting & Selection**
3. **Settlement & Finality**

All workflow actions should fit into one of these phases.

## Important naming rule

Use **Private Quoting** as the canonical technical term, not **Bidding**.

The process may be described informally as bidding, but CloakRFQ is an RFQ workflow:

- the Seller opens a request for quotes;
- Funders submit **Private Quotes**;
- the Seller selects the **Best Compliant Quote**.

Also avoid calling the Seller-side RFQ a public "offer". The Funder's quote is the offer-like commercial response. Use **RFQ Discovery Listing** or **RFQ Teaser** for the public or semi-public discovery object.

## RFQ discovery vs private disclosure

CloakRFQ needs a practical way for Funders to discover that an RFQ exists.

The design separates discovery from disclosure:

| Layer | Purpose | Visibility |
|---|---|---|
| **RFQ Discovery Listing** | Lets Funders discover that an RFQ may be interesting. | Public or visible to registered/eligible Funders, depending on MVP choice. |
| **Funder-Specific RFQ Disclosure Package** | Gives an invited or approved Funder the information needed to prepare a Private Quote. | Role-scoped; visible only to the entitled Funder and other entitled workflow parties. |
| **Private Quote** | The Funder's confidential commercial quote. | Hidden from competing Funders and Coordinators by default. |

The RFQ Disclosure Package is not a public post.

Preferred wording:

- "Seller creates an RFQ Discovery Listing."
- "Funder requests access to the RFQ Disclosure Package."
- "Seller or workflow issues a Funder-specific RFQ Disclosure Package."
- "Package visibility is role-scoped through Canton contracts."

Avoid:

- "Seller publishes the RFQ Disclosure Package."
- "All Funders can see the package."
- "The RFQ package is a public listing."

## Phase 1 — RFQ Origination & Eligibility

### Boundary

This phase starts when the Seller prepares a Receivable for financing and ends when the RFQ is opened for discovery and later private quoting.

Funders are not active quote participants in this phase.

### Main goal

Prepare a Receivable, eligibility evidence, risk evidence, disclosure boundaries, and an RFQ discovery surface so that Funders can later request or receive a scoped RFQ Disclosure Package.

### Main actors

- Seller
- Compliance Party
- Risk Assessor
- Coordinator

### Main actions

- Seller creates or references a Receivable.
- Seller defines RFQ parameters.
- Seller defines the Disclosure Boundary.
- Compliance Party issues required eligibility attestations.
- Risk Assessor optionally issues Risk Attestations.
- Seller prepares Core Pre-Quote Facts.
- Seller prepares optional Supplemental RFQ Information.
- Seller prepares Funder-specific RFQ Disclosure Package content.
- Seller creates an RFQ Discovery Listing or RFQ Teaser.
- Coordinator may prepare workflow routing, deadlines, and invitations without receiving quote contents.
- Seller opens the Blind RFQ.

### Outputs

- Receivable prepared for RFQ.
- RFQRequest opened.
- RFQ Discovery Listing available for discovery.
- Funder-specific RFQ Disclosure Package content prepared for later issuance.
- Compliance Attestations available where required.
- Risk Attestations available where used.
- Disclosure Boundary recorded.

## Phase 2 — Private Quoting & Selection

### Boundary

This phase starts when Funders can discover or access the RFQ and ends when the Seller selects a quote for attempted settlement.

### Main goal

Allow Funders to discover relevant RFQs, request or receive Funder-specific RFQ Disclosure Packages, submit Private Quotes, and allow the Seller to select the Best Compliant Quote without exposing unnecessary quote, identity, or funding data.

### Main actors

- Seller
- Funders
- Coordinator
- Compliance Party
- optional Funding Evidence Provider or Proof-of-Funds mechanism

### Main actions

- Funders browse RFQ Discovery Listings.
- A Funder selects an interesting RFQ.
- The Funder requests access to the RFQ Disclosure Package or accepts an invitation.
- The workflow checks whether the Funder is entitled to receive the package.
- Seller or workflow issues a Funder-specific RFQ Disclosure Package.
- The Funder reviews the package.
- The Funder submits a Private Quote.
- Private Quotes include Quote Terms such as Net Purchase Price, settlement timing, recourse model, fees, reserve or holdback, Required Disclosure, Debtor Notification requirement, Quote Expiry, and Proof-of-Funds status.
- Private Quotes pass the Proof-of-Funds Gate as bid eligibility evidence.
- Eligibility checks determine which quotes become Eligible Quotes.
- Seller receives a Seller Quote View.
- Seller compares Eligible Quotes using Selection Criteria.
- Seller selects the Best Compliant Quote as the Selected Quote.
- Seller may define a Seller-Controlled Fallback Queue from still-valid Eligible Quotes.

### Outputs

- Funders have discovered the RFQ through RFQ Discovery Listings.
- Funder-specific RFQ Disclosure Packages issued to entitled Funders.
- Private Quotes submitted.
- Proof-of-Funds status or attestation attached where required.
- Eligible Quotes identified.
- Seller Quote View available to Seller.
- Selected Quote created.
- Optional Seller-Controlled Fallback Queue defined.

## Phase 3 — Settlement & Finality

### Boundary

This phase starts when a quote becomes the Selected Quote and enters the Settlement Window. It ends when the RFQ reaches RFQ Finality.

### Main goal

Complete the Receivable Sale through On-Ledger Demo Settlement or handle failure through Seller-controlled fallback, then produce scoped audit or regulatory evidence where required.

### Main actors

- Seller
- Winning Funder
- Fallback Funder, if fallback is used
- Coordinator
- Auditor or Regulator
- Compliance Party, where final compliance evidence is needed
- Debtor, only if Debtor Notification is required

### Main actions

- Selected Quote enters the Settlement Window.
- Winning Funder attempts settlement.
- On-Ledger Demo Settlement assigns the represented Receivable to the Winning Funder and transfers Demo Settlement Asset to the Seller.
- If settlement succeeds, RFQ Finality is reached.
- If settlement fails before RFQ Finality, a scoped Commitment Failure is recorded.
- Seller may promote a still-valid Fallback Quote from the Seller-Controlled Fallback Queue.
- Optional Debtor Notification occurs only if required by quote terms, compliance, settlement, enforceability, or RFQ terms.
- Auditor or Regulator receives a Scoped Compliance Receipt if required.

### Outputs

- Settlement Result recorded.
- Represented Receivable assigned to the Winning Funder in the demo workflow.
- Demo Settlement Asset transferred to the Seller in the demo workflow.
- RFQ Finality reached.
- Fallback status recorded if fallback occurred.
- Scoped Compliance Receipt created where required.

## Cross-cutting concerns

| Concern | Primary phase | Notes |
|---|---|---|
| Compliance eligibility | Phase 1 | May be referenced again during Phase 2 or Phase 3. |
| Risk assessment | Phase 1 | Risk Attestations are prepared before Funder quoting. |
| RFQ Discovery Listing | Phase 1 / Phase 2 | Created in Phase 1, used by Funders for discovery in Phase 2. |
| RFQ Disclosure Package | Phase 1 / Phase 2 | Content prepared in Phase 1, issued to entitled Funders in Phase 2. |
| Proof of Funds | Phase 2 | Required as bid eligibility evidence, not as a Funding Lock. |
| Funder identity disclosure | Phase 2 / Phase 3 | Hidden by default in Seller Quote View; revealed only when required. |
| Seller Quote View | Phase 2 | Main Seller quote-comparison surface. |
| Fallback Queue | Phase 2 / Phase 3 | Defined during selection, used only if Phase 3 settlement fails. |
| Commitment Failure | Phase 3 | Failure of the Selected Quote during the Settlement Window. |
| Debtor Notification | Phase 3 | Optional and disclosure-controlled. |
| Scoped Compliance Receipt | Phase 3 | Produced after final outcome or when required by the workflow. |

## High-level phase diagram

```text
Phase 1: RFQ Origination & Eligibility
  Seller + Compliance + Risk prepare the Receivable, eligibility, risk,
  disclosure boundaries, and discovery listing
  -> RFQ opens

Phase 2: Private Quoting & Selection
  Funders discover RFQs, request packages, receive Funder-specific packages,
  and submit Private Quotes
  -> Seller selects Best Compliant Quote and optional fallback queue

Phase 3: Settlement & Finality
  Selected Quote attempts settlement
  -> success: demo settlement + receipt
  -> failure: commitment failure + optional fallback promotion
```
