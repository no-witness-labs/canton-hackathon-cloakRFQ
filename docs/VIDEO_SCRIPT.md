# 3-Minute Video Pitch — script

Timed narration and on-screen actions for recording against the live Canton
DevNet deployment. Prepare one session with the RFQ open and three quotes before
recording the comparison/settlement segment; edit out the demo response-window wait.

## 0:00–0:20 — Real financial problem

> "Businesses sell receivables to get cash before invoices mature. But getting
> competitive quotes can expose the customer, commercial terms, bidder identities,
> and the entire quote book. CloakRFQ brings that institutional workflow to Canton
> without creating an all-seeing marketplace operator."

Show the welcome screen and the seven role views.

## 0:20–0:55 — Product logic, not generic infrastructure

As **Seller**, show the represented Receivable. Briefly switch to **Compliance**
and **Risk Assessor**, then return to Seller and open the RFQ.

> "Compliance and Risk issue separate scoped attestations. The Seller derives
> certificates and creates one private request per invited Funder. These are real
> Daml contracts with role-specific signatories and observers."

## 0:55–1:25 — Funding-backed private competition

Switch between **Funder A** and **Funder B**. Show that each receives only its own
request and submits its own Private Quote with a committed CIP-56 demo allocation.

> "A Funder cannot inspect competing requests or quotes, and cannot submit a valid
> quote without committed funding evidence matching this RFQ, Seller, amount, token
> administrator, and validity window."

## 1:25–1:50 — The privacy proof

Open the **Ledger** view. Compare Funder A, Funder B, Coordinator, Auditor, and
Outsider.

> "Same deal, different ledger views. Funders see only their own contracts. The
> Coordinator sees no quote contents. The Auditor sees nothing before settlement.
> The Outsider sees nothing. This is Canton disclosure, not a CSS filter."

## 1:50–2:30 — Selection, settlement, and ownership

Use the prepared post-deadline Seller view. Compare Net Purchase Price, recourse,
Debtor-notification requirements, and expiry. Accept one quote.

> "Selection is a Seller decision, but settlement rules are on-ledger. Canton
> verifies the quote, Receivable, committed allocation, payment leg, and settlement
> factory. The demo payment settles and the pending Receivable transfer is created
> in one transaction."

Switch to the winning **Funder** and click **Accept receivable transfer**.

> "The winning Funder then accepts ownership, completing the transfer lifecycle."

## 2:30–2:50 — Scoped audit evidence

Switch to **Auditor**.

> "Only after settlement does the Auditor receive scoped
> ReceivableSaleSettlement evidence: outcome, parties, price, payment status,
> transfer status, and time — not the private quote book or losing Funders."

## 2:50–3:00 — Close

> "CloakRFQ is a real financial workflow where privacy shapes the marketplace:
> funding-backed private competition, coordinated settlement, and auditability on
> Canton."

## Recording notes

- Keep the final cut below 3:00 and record at 1280×800 or higher.
- Use the live production URL and show at least one real transaction/update ID.
- Edit out the 2.5-minute demo response-window wait.
- Keep token language explicitly non-production: no real wallet, custody, bank
  settlement, escrow, or guaranteed payment finality.
- Use `docs/CLAIM_BOUNDARY_REVIEW.md` for the final narration check.
