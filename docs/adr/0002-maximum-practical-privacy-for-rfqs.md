# 0002 - Target Maximum Practical Privacy for RFQs

## Status

Accepted

## Date

2026-06-17

## Context

A simple RFQ marketplace could let a marketplace operator collect and inspect all quotes. That is simpler to build, but it creates a centralized party with access to sensitive commercial terms and weakens the privacy story of CloakRFQ Receipts.

The product aims to support private Receivable Sale RFQs where Funders do not see each other's quotes, ordinary coordinators do not read quote contents by default, and regulatory or audit visibility is limited to information relevant to applicable rules.

Some additional privacy goals, such as hiding Unselected Quotes and Unselected Funders from the Seller, may require a specific protocol, trust model, or later technical design. The project should not commit to those details before implementation feasibility is understood.

## Decision

The product's privacy posture is Maximum Practical Privacy.

A Coordinator or marketplace operator should not receive Private Quote contents by default.

Competing Funders should not see each other's Private Quote contents.

Regulators and auditors should receive Compliance Receipts or other scoped disclosures, not the full RFQ record by default.

Sensitive Attributes should not be disclosed as raw data when an Eligibility Attestation or narrower disclosure is sufficient.

Unselected Funder Privacy and Unselected Quote Privacy are explicit privacy ambitions, but not guaranteed MVP protocol properties until the quote-selection mechanism is finalized.

The exact quote-selection protocol is intentionally not decided in this ADR.

## Consequences

The product should not be described as a simple operator-run bid book.

The pitch should avoid claiming a cryptographic blind auction unless the implementation actually enforces that property.

The MVP can still demonstrate Canton-native selective visibility by showing different parties receiving only the records relevant to their role.

Future protocol design must distinguish between privacy enforced by Canton contract visibility and privacy achieved through additional mechanisms, attestations, or trust assumptions.

This privacy posture is subject to ADR 0003: privacy should be maximized around the real RFQ workflow, not achieved by replacing that workflow with a materially different one.
