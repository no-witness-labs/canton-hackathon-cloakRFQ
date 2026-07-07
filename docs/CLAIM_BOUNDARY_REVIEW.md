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

- **UI copy needs a Phase 2 wording refresh before final submission.** It should
  describe committed CIP-56 allocation evidence as scoped quote funding evidence
  for the RFQ context, without calling it escrow, custody, bank settlement,
  production payment finality, or guaranteed settlement.
- **No overclaim in product copy.** The flagged terms (ZK, escrow, stablecoin,
  Canton Coin, real bank settlement, guaranteed settlement) appear **only** inside explicit
  "do not claim / out of scope" lists in `docs/CLOAKRFQ_PRD.md`,
  `docs/CLOAKRFQ_MVP_BUILD_SPEC.md`, the ADRs, and `HACKATHON_ALIGNMENT.md`, or in
  negations in `web/README.md` ("not … real settlement"). None assert a capability.
- **Wallet connector** is labelled "Canton Devnet — non-production. No real
  custody or signing."

## Still to check before final submit (human)

- Deck (`docs/DECK_OUTLINE.md`) and video (`docs/VIDEO_SCRIPT.md`) copy — apply
  the same list when those assets are produced.
- Any text added once the ledger lands (#9–#11) — settlement must stay "Demo".
