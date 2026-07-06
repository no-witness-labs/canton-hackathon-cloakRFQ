# ADR 0006: Require Proof of Funds as Bid Eligibility Evidence, Not a Funding Lock

## Status

Accepted; refined by ADR 0012

## Date

2026-06-18


## Refinement Note

ADR 0012 keeps Proof of Funds as the broad product concept, but selects committed CIP-56 allocation evidence as the concrete Phase 2 mechanism. That means Phase 2 no longer relies only on point-in-time proof. The allocation-backed quote path reserves funds for the RFQ context until the allocation deadline or token-standard release path, while still not claiming escrow, custody, bank settlement, production payment finality, or guaranteed settlement completion.

## Context

CloakRFQ Receipts wants Funders to provide evidence of funding capacity before or during bidding so that Sellers are not comparing completely unserious or fake quotes.

One option is to lock, reserve, or escrow funds for every Private Quote. That gives stronger settlement assurance, but it increases bidder friction, may reduce participation, and requires a more specific payment or custody mechanism than the MVP has selected.

Another option is to require only quote-scoped Proof of Funds. This is weaker than locking because the same funds may support multiple quotes or be spent after verification. However, it preserves flexibility, avoids over-designing the protocol early, and creates a clear upgrade path to stronger mechanisms later.

## Decision

CloakRFQ Receipts will require Proof of Funds as bid eligibility evidence for Private Quotes.

Proof of Funds means that the Funder had enough funds or funding capacity to support the proposed quote at a relevant verification point.

The exact technical mechanism is intentionally not locked yet. It may be mocked, attested by a scoped party, checked against on-ledger funds, supported by a settlement-bank check, or later upgraded.

Proof of Funds is not a Funding Lock, escrow, reserve, Quote Bond, or settlement guarantee. The MVP must not claim that funds are locked, reserved, unspendable, single-use, or available at settlement unless that stronger mechanism is explicitly implemented.

## Consequences

The bidding process has a meaningful seriousness gate without forcing every Funder to lock full funds for every quote.

The Seller can prefer quotes that include credible Proof of Funds, but should not treat Proof of Funds as a guarantee that settlement will succeed.

The design accepts the Reusable Funds Caveat: the same funds may be used to support multiple bids or may be spent later unless a stronger mechanism is added.

The project keeps a clear upgrade path to Funding Locks, escrow, Quote Bonds, Canton payment workflows, bank or custodian attestations, or other future proof mechanisms.
