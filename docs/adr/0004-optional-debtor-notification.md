# ADR 0004: Make Debtor Notification Optional and Disclosure-Controlled

## Status

Accepted

## Date

2026-06-18

## Context

Receivable Sale workflows differ in how much the Debtor is told. Some real-world factoring arrangements are disclosed to the Debtor, while confidential or non-notification structures also exist.

CloakRFQ Receipts aims to maximize practical privacy while preserving real-world RFQ functionality. Requiring Debtor Notification in every MVP flow would simplify settlement semantics, but it would weaken the privacy story and exclude confidential receivables-finance scenarios. Never supporting Debtor Notification would also be unrealistic because some jurisdictions, Funders, or settlement arrangements may require it.

## Decision

Debtor Notification is optional and disclosure-controlled.

The default MVP posture is a Confidential Receivable Sale during the RFQ phase. The Debtor is not part of the RFQ by default and does not see the quote process.

The workflow may support a Disclosed Receivable Sale when notification is required by the Seller's selection criteria, the Winning Quote, settlement terms, compliance, jurisdiction, or enforceability requirements.

## Consequences

The product can demonstrate stronger privacy during quote discovery while still preserving a path for realistic disclosed settlement flows.

The RFQ Disclosure Package should avoid revealing Debtor identity by default where a Debtor Risk Attestation is sufficient.

Quote Terms may include whether the Funder requires Debtor Notification before closing, after closing, at maturity, or not at all.

Future implementation must treat Debtor Notification as a scoped disclosure event rather than an automatic side effect of every RFQ.
