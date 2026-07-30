# CloakRFQ Finalist Pitch — Exact 2:50 Script

One presenter. Target duration: **2 minutes 50 seconds**, leaving a
10-second safety buffer against the 3-minute limit.

## Run of show

| Time | Section | Visual |
| --- | --- | --- |
| 0:00–0:20 | Hook + Finance Context | Slide 1 · Finance Background |
| 0:20–0:40 | Top Three Problems | Slide 2 · Top 3 Problems CloakRFQ Solves |
| 0:40–2:30 | Live Product Proof | Pre-staged live workspace, Ledger, and Activity |
| 2:30–2:50 | Why Canton + Close | Slide 3 · Why Canton |

## Exact spoken wording and actions

### 0:00–0:20 — Finance Background

**Action:** Show Slide 1. Point once across the three-step flow: unpaid invoice
→ discounted sale → private competition on Canton.

> A receivable is an unpaid invoice. A business can sell it at a discount for
> early liquidity. CloakRFQ lets Funders compete privately to purchase that
> receivable on Canton, with role-scoped disclosure.

### 0:20–0:40 — Top 3 Problems CloakRFQ Solves

**Action:** Advance to Slide 2. Move across the three numbered cards without
reading their supporting labels.

> Three problems follow. Sensitive financial information is overshared. Private
> competition usually requires an operator who sees every quote. Compliance,
> funding, settlement, and audit are fragmented. CloakRFQ connects the workflow
> without exposing the full marketplace.

### 0:40–0:52 — Separate scoped attestations

**Action:** Switch to the pre-staged Workspace on **Compliance**, then click
**Risk Assessor**.

> Pre-staged after the deadline: Compliance issued eligibility, Risk issued a
> separate assessment, and the Seller derived both scoped certificates.

### 0:52–1:10 — One private request and quote per Funder

**Action:** Click **Funder**, then the **Funder A**, **Funder B**, and
**Funder C** subtabs.

> Each Funder received its own request and submitted its own Private Quote,
> visible only to that Funder and Seller. Quotes use committed
> CIP-56-compatible demo allocations—not real money, custody, escrow, or
> guaranteed settlement.

### 1:10–1:38 — Ledger privacy proof

**Action:** Switch to the preloaded **Live ledger** tab. Show **Funder A**,
**Funder B**, **Coordinator**, **Auditor**, then **Outsider**.

> This Ledger page queries Canton by party. Funders have distinct views. The
> Coordinator sees no quotes; before settlement, the Auditor sees no RFQ or quote
> book; the Outsider sees no workflow contents. This is role-scoped disclosure—
> not anonymity, ZK, or a cryptographic blind auction.

**Optional cut if timing runs late:** “Funders have distinct views.”

### 1:38–2:00 — Seller selection and settlement

**Action:** Return to the Workspace, click **Seller**, compare the three offer
cards, and click **Accept & settle →** on **Funder B · Lumen Capital**.

> As Seller, I compare eligible quotes by price, recourse, and notification
> terms, then choose Funder B. This transaction completes the demo payment and
> creates a pending Receivable transfer.

### 2:00–2:08 — Canton transaction evidence

**Action:** In the settlement toast, click **View in Activity →**. Point to the
highlighted **Accept & settle** row and its `updateId`.

> Here is its update ID. Settlement is recorded; ownership is pending.

### 2:08–2:20 — Separate ownership acceptance

**Action:** Go back to the Workspace. Click **Funder**, confirm **Funder B** is
selected, and click **Accept receivable transfer**.

> Funder B separately exercises AcceptTransfer. Only that authorization moves
> the represented Receivable into Funder ownership.

### 2:20–2:30 — Scoped Auditor evidence

**Action:** Switch to the **Live ledger** tab, click **Auditor**, and show its
single visible `ReceivableSaleSettlement` contract. Point to the winning terms
and references; no private RFQ or losing Funder appears.

> The Auditor now sees one scoped ReceivableSaleSettlement: winning terms and
> references—not the private RFQ or losing Funders.

### 2:30–2:50 — Why Canton + close

**Action:** Return to the deck and show Slide 3.

> CloakRFQ uses Canton because private receivable-financing RFQs require
> selective disclosure, role-based authorization, coordinated settlement, and
> auditability without exposing the full marketplace. Canton is not an add-on
> here; its disclosure and authorization model is essential to the product.

## Timing check

- The cue windows total exactly **170 seconds**.
- The script contains **268 spoken words**. A neutral synthetic read-through at
  its default rate measured **149.6 seconds**, leaving about 20 seconds inside
  the 170-second cue plan for clicks and tab transitions.
- Cutting the one marked optional sentence saves approximately two seconds
  without changing any core claim.

## Accuracy guardrails for delivery and Q&A

- Privacy means role-scoped Canton disclosure. It does not mean anonymity, ZK,
  or a cryptographic blind auction.
- The UI uses committed CIP-56-compatible demo allocations and a demo
  settlement factory. It does not use real money, a real wallet, custody,
  escrow, bank settlement, or guaranteed production settlement.
- `AcceptAndSettle` completes the demo payment, initiates a pending Receivable
  transfer, and creates `ReceivableSaleSettlement` in one transaction.
  `AcceptTransfer` is the winning Funder’s later ownership step.
- The Seller compares quotes off-ledger. Do not claim an on-ledger ranking,
  automatic fallback, or proof that the selected quote was objectively “best.”
- A failed settlement transaction rolls back. The Seller may retry or choose
  another still-valid quote; there is no automatic on-ledger fallback queue.
- The Auditor receives the scoped winning settlement record, not the private RFQ,
  quote book, or losing Funders.
- The **Ledger** page is the privacy proof because it queries Canton by party.
  Workspace role panels are the guided product view, not independent privacy
  evidence.

## Corrections from the existing deck and video

The existing submission deck remains unchanged. This finalist draft avoids these
stale or overbroad claims found during the current-`main` review:

- “Every step is a real Daml transaction” is too broad: quote comparison and
  selection are off-ledger; workflow mutations submit Daml transactions.
- “Private Quotes only the Seller can read” omits the submitting Funder, which
  is the quote signatory; the Seller is its observer.
- “Blind-RFQ” and “no all-seeing middleman” require qualification: implemented
  privacy is role-scoped Canton disclosure, not a cryptographic blind auction or
  secrecy from entitled infrastructure operators.
- “Each Funder sees its outcome” is too broad as an on-ledger claim: a losing
  Funder has no separate settlement-outcome contract; that result is a guided UI
  state.
- The existing deck says Daml enforces certificate-backed request creation, but
  `RFQRequest` currently stores certificate CIDs without fetching and comparing
  them at creation.
- The deck’s Funder names are stale. Current UI mapping is **A · Vanta Credit**,
  **B · Lumen Capital**, and **C · Harbour Funding**.
- The old timed video script describes explicit payment and transfer “status”
  fields for the Auditor. The implemented settlement record contains the
  winning parties and terms, allocation and transfer references, package ID,
  and time; transfer acceptance is the separate `AcceptTransfer` step.
