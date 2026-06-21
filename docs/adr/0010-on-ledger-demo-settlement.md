# ADR 0010: Use On-Ledger Demo Settlement for the MVP

## Status

Accepted

## Context

CloakRFQ needs a settlement story for the hackathon demo. The product could use off-ledger payment confirmation, mock payment messages, real bank or custodian settlement, Canton Coin/Amulet, or a fully on-ledger demo payment asset.

A production payment integration would be more realistic, but it adds integration, custody, compliance, and failure-mode complexity. A pure off-ledger confirmation would be simpler, but it would make the demo less compelling because the Receivable Sale would not show payment-versus-receivable completion on the ledger.

## Decision

The MVP will use On-Ledger Demo Settlement.

A tokenized Receivable will be assigned to the Winning Funder while a Demo Settlement Asset is transferred to the Seller as one completed business outcome.

The MVP must not claim real payment finality, real bank settlement, production custody, stablecoin integration, or Canton Coin/Amulet integration unless those integrations are explicitly added later.

The MVP must also not claim production legal assignment, perfection of ownership or security rights, enforceability against the Debtor, or jurisdiction-specific receivables-transfer compliance. The on-ledger Receivable assignment is a demo workflow state transition unless legal documentation, Debtor notification, transfer restrictions, or jurisdiction-specific assignment workflows are explicitly added later.

## Consequences

The demo can show a complete Receivable Sale lifecycle without depending on external payment infrastructure.

The settlement flow remains understandable to hackathon judges because it shows both sides of the transaction: the asset moves to the Funder and demo payment moves to the Seller.

The product language must be clear that the settlement asset is non-production.

Future production versions may need jurisdiction-specific receivables assignment logic, Debtor notification, proof of assignment, transfer-restriction checks, legal agreement references, or other enforceability workflows.

Future versions may replace the Demo Settlement Asset with Canton Coin/Amulet, a regulated stablecoin, bank confirmation, custodian settlement, or another production-grade payment workflow.
