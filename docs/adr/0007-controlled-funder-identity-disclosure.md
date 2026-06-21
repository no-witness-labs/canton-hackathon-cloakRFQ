# ADR 0007: Control Funder Identity Disclosure Timing

## Status

Accepted

## Date

2026-06-19

## Context

CloakRFQ Receipts wants to preserve real RFQ functionality while minimizing unnecessary disclosure. The Seller may sometimes need to know a Funder's identity because reputation, jurisdiction, internal policy, relationship constraints, compliance, settlement, or legal assignment can matter.

At the same time, revealing every participating Funder's full identity to the Seller by default weakens Unselected Funder Privacy and may discourage participation. It can also leak business strategy, market interest, and relationship information.

The product therefore needs a controlled identity-disclosure model rather than either full anonymity or full upfront identity disclosure.

## Decision

Funder identity is hidden by default in the Seller Quote View, but may be revealed when identity is required by Selection Criteria, Required Disclosure, compliance, settlement, audit, regulation, or RFQ terms.

The preferred product principle is Funder Identity Minimization.

A Seller may require known Funder identity before selection, but that requirement becomes part of the RFQ's Disclosure Boundary and should be visible as a term of participation.

The default lifecycle is:

- During RFQ invitation and quote submission, competing Funders do not learn each other's identities through the RFQ workflow.
- Coordinators do not receive Private Quote contents or full quote-linked Funder identities by default.
- In the Seller Quote View, Funders may be pseudonymous or represented through eligibility and status attestations by default.
- At selection, closing, or settlement, the Winning Funder identity may be revealed if required.
- For audit or regulation, Funder identity disclosure is scoped to the relevant rule or evidentiary purpose.

## Consequences

The Seller can still make real commercial decisions when Funder identity matters, but identity disclosure is not automatic for every quote.

Unselected Funder Privacy remains a stronger product story because non-winning participants are not necessarily exposed merely for participating.

RFQ terms must make identity expectations clear. If a Seller requires known Funder identity before selection, Funders should know that before submitting a quote.

The implementation should avoid treating identity as a binary property. Identity disclosure can be staged, scoped, and tied to purpose.

This decision does not guarantee that all Unselected Funders are always hidden. It defines the product posture: disclose identity only when needed, and treat stronger hiding properties as privacy ambitions unless technically enforced.
