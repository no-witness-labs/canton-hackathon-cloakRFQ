# Claim-Boundary Review

Verifies the UI and docs do not overclaim, per the ADRs and
`HACKATHON_ALIGNMENT.md`. Re-run before submitting (and after any copy change).

## What must NOT be implied

ZK proofs · cryptographic blind auction · production payment finality ·
production custody · real bank / stablecoin / Canton Coin / Amulet settlement ·
production legal assignment / perfection / Debtor enforceability · Funding Locks
· escrow · full anonymity.

Allowed framing: **On-Ledger Demo Settlement** with a **Demo Settlement Asset
(non-production)**; **Proof-of-Funds = bid-eligibility evidence only, not a
lock**; privacy = **role-scoped selective disclosure**, not anonymity.

## Method

```bash
grep -rniE 'zero[- ]?knowledge|\bZK\b|production (settlement|custody)|real (money|bank|settlement)|stablecoin|canton coin|amulet|funding lock|escrow|guaranteed' web docs
```
Then confirm the safe phrasings are present in the UI copy.

## Findings — PASS

- **UI copy is claim-safe.** `web/` uses "Demo Settlement Asset · Canton Devnet —
  non-production", "Demo Settlement Asset · non-production", and "Proof-of-Funds
  is bid-eligibility evidence only — not a funds lock, reserve, escrow, or
  settlement guarantee" (`web/components/Workspace.tsx`, `web/lib/types.ts`).
- **No overclaim in product copy.** The flagged terms (ZK, escrow, Funding Lock,
  stablecoin, Canton Coin, real bank settlement) appear **only** inside explicit
  "do not claim / out of scope" lists in `docs/CLOAKRFQ_PRD.md`,
  `docs/CLOAKRFQ_MVP_BUILD_SPEC.md`, the ADRs, and `HACKATHON_ALIGNMENT.md`, or in
  negations in `web/README.md` ("not … real settlement"). None assert a capability.
- **Wallet connector** is labelled "Canton Devnet — non-production. No real
  custody or signing."

## Still to check before final submit (human)

- Deck (`docs/DECK_OUTLINE.md`) and video (`docs/VIDEO_SCRIPT.md`) copy — apply
  the same list when those assets are produced.
- Any text added once the ledger lands (#9–#11) — settlement must stay "Demo".
