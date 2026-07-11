# Claim-Boundary Review

Verifies the UI and docs do not overclaim, per the ADRs and
`HACKATHON_ALIGNMENT.md`. Re-run before submitting (and after any copy change).

## What must NOT be implied

ZK proofs · cryptographic blind auction · production payment finality ·
production custody · real bank / stablecoin / Canton Coin / Amulet settlement ·
production legal assignment / perfection / Debtor enforceability · escrow ·
full anonymity · guaranteed settlement.

Allowed framing: **On-Ledger Demo Settlement** with a **committed CIP-56 token allocation
(non-production)**; **committed CIP-56 allocation evidence = scoped quote
funding evidence that allocates funds for the RFQ context, not escrow, custody,
bank settlement, production payment finality, or guaranteed settlement**; privacy
= **role-scoped selective disclosure**, not anonymity.

## Method

```bash
grep -rniE 'zero[- ]?knowledge|\bZK\b|production (settlement|custody)|real (money|bank|settlement)|stablecoin|canton coin|amulet|escrow|guaranteed' web docs
```
Then confirm the safe phrasings are present in the UI copy.

## Findings

- **UI wording is aligned.** Committed CIP-56 allocations are described as
  non-production demo funding evidence; the UI does not claim bank settlement,
  custody, escrow, or guaranteed payment finality.
- **Settlement sequencing is explicit.** The demo payment settles and the pending
  Receivable transfer is initiated in one Daml transaction; final ownership changes
  when the winning Funder exercises `AcceptTransfer`.
- **Privacy claims are scoped.** Competing Funders cannot see one another's requests
  or quotes, the Outsider sees nothing, and the Auditor receives only
  `ReceivableSaleSettlement` evidence. The project does not claim anonymity or a
  cryptographic blind auction.
- **Wallet connector is clearly simulated.** It is labelled non-production and
  performs no browser custody or signing.

## Final submission checks

- Re-run the scan after deck and video-script edits.
- Confirm the rendered PDF uses the same settlement and privacy boundaries.
- Record the video against the live product and describe token funding as non-production demo funding.
- Keep `AcceptTransfer` visible as the winning Funder's post-settlement ownership-acceptance step.
