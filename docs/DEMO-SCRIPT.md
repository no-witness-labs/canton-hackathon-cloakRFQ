# CloakRFQ — demo run-of-show (~3 min)

The exact click path + one line to say per step. Ordered to land the privacy story and
end on "live on Canton DevNet, try it yourself." Roles are the top switcher.

**Prep:** fresh session ("↻ New deal", or a clean sandbox). Have `/ledger` and `/activity`
ready in the same tab. Keep it moving; each DevNet action takes ~1–3s.

---

### 0 · Hook (10s)
> "CloakRFQ is private invoice financing on Canton. A seller auctions a receivable to
> competing funders — but the funders **can't see each other's bids**, and the raw debtor
> stays hidden. And it's running **live on Canton DevNet**."

### 1 · Origination — attestation-first (~30s)
- **Risk Assessor →** Issue Risk Attestation. **Compliance →** Issue Compliance Attestation.
- **Seller →** fill the Receivable → **Create Receivable** → **Open RFQ** to 3 Funders.
> "Risk and Compliance attest. The seller lists the receivable — the **raw debtor identity
> never leaves this contract** — and opens a *blind* RFQ. Funders receive the risk/eligibility
> **statuses only**, never the debtor or the invoice."

### 2 · Blind quoting + the privacy proof (~45s) ⭐
- **Funder →** (tab VC-7) tweak price/disclosure → **Submit Private Quote**. Point at
  "competing quotes hidden." Submit LC-3 and HF-9 too.
- **Seller →** Quote View shows 3 quotes.
- **Open `/ledger`.** Click **Funder A** → *only its own quote + the RFQ*. Click **Funder B**
  → *can't see A's quote*. Click **Outsider** → *nothing*.
> "Each funder quotes blind. Now the proof — this is the *raw ledger*, per party: Funder A
> sees only its own quote, Funder B **cannot see A's**, and an outsider sees **nothing**.
> That's not the UI hiding it — **Canton enforces it**."

### 3 · Selection + atomic settlement (~30s)
- **Seller →** **Select as Best Compliant Quote** (pick LC-3). Note the fallback queue.
  → **Settle selected quote.**
- **Auditor →** the Scoped Compliance Receipt.
> "The seller picks the **Best Compliant Quote** — not just cheapest; disclosure and terms are
> priced in. Settlement is **one atomic transaction**: the asset moves and the receipt is
> issued, or nothing happens. The auditor receives **only the scoped receipt** — winner and
> status, never the quotes."

### 4 · Proof it's real on a public network (~30s) ⭐
- **`/activity`** → point at the **Settle** row (one tx, 4 contract changes) → **Verify on
  ledger** → "✓ confirmed on-ledger, offset …".
- Open **Lighthouse** (`lighthouse.devnet.cantonloop.com`) → search the validator namespace →
  show `5nsandbox-devnet-2` funded with Canton Coin, but **the deal is nowhere on it**.
> "Every step is a real transaction — here's the settlement's `updateId`, verified against the
> ledger. And on the **public network explorer**: the validator is there, funded, paying
> traffic — but our confidential deal is **invisible**. Privacy on a public network."

### 5 · Close — self-service (~15s)
- Click **"↻ New deal"** (or share the deployed URL).
> "And it's self-service — open the link, and you get **your own private deal on live Canton
> DevNet**. Same contracts, real network, real privacy. That's CloakRFQ."

---

## Notes for recording
- Record at 1280×800+, hide bookmarks, use the fresh-session start.
- If a DevNet action lags, pause narration a beat — don't click twice.
- Screens that sell it: **`/ledger` per-party** (§2) and **`/activity` Verify + Lighthouse** (§4).
- Deck mirrors this: Problem → Why Canton → **Live demo** (§1–4) → Architecture (participants +
  Global Synchronizer) → Future work (real wallets / multi-party — Level 2/3).
