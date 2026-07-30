# CloakRFQ Finalist Demo Runbook

This runbook supports the 2:50 one-presenter script in
[`FINALIST_SCRIPT.md`](FINALIST_SCRIPT.md). The on-stage flow inspects a
pre-staged deal, proves privacy through the per-party Ledger page, performs one
settlement, completes the separate ownership acceptance, and closes on scoped
Auditor evidence.

## Required browser tabs

Use one normal browser profile and one window. Do not use incognito or a second
profile: the deployed app stores the isolated session ID in local storage, and a
different profile will provision a different party set.

| Tab | Open before presenting | Starting view |
| --- | --- | --- |
| 1 · PITCH | `cloakrfq-finalist-pitch.pdf#page=1` | Slide 1 · Finance Background |
| 2 · PRODUCT | `https://canton-hackathon-cloak-6v1qrvvgn-dappwebsites-projects.vercel.app/` | Workspace · Compliance |
| 3 · LEDGER | `https://canton-hackathon-cloak-6v1qrvvgn-dappwebsites-projects.vercel.app/ledger` | Live ledger · Funder A |
| 4 · FALLBACK | [`../../../video/contact-sheet.jpg`](../../../video/contact-sheet.jpg) | Fit the completed-run contact sheet to the window |

The Activity view does not need a separate tab. Open it from the settlement
toast so the correct `updateId` is deep-linked and highlighted, then use browser
Back to return to the still-hydrated Workspace.

Set browser zoom to 100%, hide unrelated tabs and notifications, and confirm the
projector or shared window is 16:9.

## Pre-stage the live session

Do this at least 10 minutes before presenting. The response window is a real
150 seconds and there is no time-advance control.

1. Open Tab 2 and wait for **Setting up your demo…** to finish.
2. If the welcome modal appears, click **Got it — start the demo**.
3. If the current session is not empty, click **↻ New deal**, then
   **Start new deal**. Wait for the new isolated workspace.
4. In **Seller**, keep the pre-filled `$480,000` example and click
   **Register Receivable**.
5. Click **Compliance**. Leave both controls on **Eligible**, then click
   **Approve compliance**.
6. Click **Risk Assessor**. Leave **Low risk** selected, then click
   **Submit risk rating**.
7. Click **Seller**. Keep Funders A, B, and C selected, then click
   **Open RFQ to 3 Funders**. The 150-second quote window starts now.
8. Click **Funder** and stage these differentiated offers before the window
   closes:

   | Funder subtab | Price | Recourse | Debtor notification | Final click |
   | --- | ---: | --- | --- | --- |
   | **Funder A · Vanta Credit** | `$465,000` | Non-recourse | Not required | **Submit private offer** |
   | **Funder B · Lumen Capital** | `$470,000` | With recourse | Required | **Submit private offer** |
   | **Funder C · Harbour Funding** | `$468,500` | Non-recourse | Required | **Submit private offer** |

9. Click **Seller**. Confirm **Offers · 3 in** is visible.
10. Wait until the status changes to **offers closed · settle now** and every
    offer button reads **Accept & settle →**.
11. Do **not** settle yet.
12. Open Tab 3 in the same profile, click **Refresh**, click **Funder A**, and
    leave that role selected.
13. Return to Tab 2, click **Compliance**, and leave the page there.
14. Put Tab 1 on Slide 1 and Tab 4 on the contact sheet.

## Required starting state

Do not begin unless all of these are true:

- The welcome modal is dismissed.
- The represented Receivable is registered.
- Compliance and Risk have issued separate attestations.
- Seller-derived Compliance and Risk certificates exist.
- All three Funders submitted one Private Quote using a committed
  CIP-56-compatible demo allocation.
- The response deadline has elapsed.
- No settlement exists yet.
- Seller shows three offer cards and **offers closed · settle now**.
- The Workspace is on **Compliance**.
- The Ledger tab was refreshed after staging and is on **Funder A**.

Expected pre-settlement Ledger proof:

| Ledger role | Expected active CloakRFQ view |
| --- | --- |
| Seller | 8 contracts: Receivable, two attestations, two certificates, three Private Quotes |
| Funder A | Its own `PrivateQuote` |
| Funder B | Its own `PrivateQuote` |
| Funder C | Its own `PrivateQuote` |
| Compliance | Its scoped attestation and certificate |
| Risk | Its scoped attestation and certificate |
| Coordinator | Nothing |
| Auditor | Nothing before settlement |
| Outsider | No entitled workflow contract contents |

Submitting a quote consumes that Funder’s `RFQRequest`, so a quoted Funder
cannot show an active request and active quote at the same time. The Workspace
submitted-offer state and spoken narration establish the request-to-quote
history; the Ledger view proves the current per-party disclosure.

## Exact on-stage clicks

Follow these actions without rebuilding the deal or waiting on a deadline.

### 0:00–0:40 — Slides

1. Tab 1: show Slide 1.
2. At `0:20`, press **Page Down** once for Slide 2.
3. At `0:40`, switch to Tab 2.

### 0:40–1:10 — Scoped roles and private offers

1. Tab 2 opens on **Compliance**. Point to **Eligible** and
   **Compliance certificate · Derived by Seller**.
2. Click **Risk Assessor**. Point to the risk tier and
   **Risk certificate · Derived by Seller**.
3. Click **Funder**.
4. Click the subtabs in this exact order:
   **Funder A · Vanta Credit** →
   **Funder B · Lumen Capital** →
   **Funder C · Harbour Funding**.
5. On each subtab, point to **Your submitted offer** and
   **Other Funders’ offers — hidden from you**. Do not claim an active
   `RFQRequest`; submission consumed it.

### 1:10–1:38 — Ledger privacy proof

1. Switch to Tab 3. It should already show **Funder A**.
2. Click, in order:
   **Funder B** → **Coordinator** → **Auditor** → **Outsider**.
3. Use the contract count and contract payload returned for each selected party
   as the proof. Do not use the Workspace role switcher itself as the privacy
   proof.
4. End on **Outsider** showing no entitled workflow contracts.

### 1:38–2:08 — Selection, settlement, and update ID

1. Switch to Tab 2.
2. Click **Seller**.
3. Briefly point across the three offer cards: price, recourse, and
   Debtor-notification terms. The current Seller cards do not display quote
   expiry, so do not say that expiry is being compared on screen.
4. On **Funder B · Lumen Capital**, click **Accept & settle →**.
5. Wait for the toast:
   **Settlement recorded — transfer ready for Funder B**.
6. Before the toast closes, click **View in Activity →**.
7. On **Ledger activity**, show the highlighted
   **Accept & settle** row.
8. Point directly to the `updateId`, offset, and record time. The page
   automatically requests verification for the deep-linked transaction; point
   to **✓ confirmed on-ledger** if it appears without waiting.
9. Do not open Lighthouse for private contract contents. Lighthouse can confirm
   the Canton transaction but intentionally does not show CloakRFQ’s private
   payload.

If the toast is missed, click the header’s **Activity · _n_ tx** link, then show
the newest **Accept & settle** row.

### 2:08–2:30 — Ownership acceptance and Auditor evidence

1. Use browser **Back** to return to the Workspace.
2. Click **Funder**. The winning **Funder B** subtab should already be selected.
3. Click **Accept receivable transfer**.
4. Wait for **Receivable ownership accepted**.
5. Switch to Tab 3 and click **Auditor**. This runs a fresh party-scoped Ledger
   query after settlement.
6. Show **1 visible** and the `ReceivableSaleSettlement` contract.
7. Point to its winning terms, allocation and transfer references, and time.
8. Point out that no private RFQ, quote book, or losing Funder is present.

### 2:30–2:50 — Close

1. Switch to Tab 1.
2. Press **Page Down** once to show Slide 3 · Why Canton.
3. Deliver the final wording exactly as written in `FINALIST_SCRIPT.md`.
4. Stop speaking by `2:50`.

## Ten-second failure fallback

If DevNet, an action, or screen sharing fails, do not reload, reprovision,
re-seed, or debug on stage.

1. Within two seconds, switch to Tab 4. If screen sharing itself failed, simply
   continue speaking.
2. Say:

   > These captured views prove party-scoped Canton disclosure, demo settlement,
   > separate Funder acceptance, and scoped Auditor evidence.

3. Return to Slide 3 and deliver the close.

The fallback sentence takes about eight seconds at presentation pace.

## Claim and recovery boundaries

- The demo allocation is committed and CIP-56-compatible, but it is a mock
  funding fixture: no real money, wallet, custody, escrow, bank settlement, or
  guaranteed settlement.
- `AcceptAndSettle` completes the demo payment and creates the pending transfer.
  Ownership changes only after the winning Funder exercises `AcceptTransfer`.
- The Auditor’s scoped record proves successful settlement and contains winning
  terms and references; it is not the private RFQ or quote book.
- If `AcceptAndSettle` fails, the whole transaction rolls back. The quote
  remains active, no settlement evidence is created, and the Seller can retry
  or choose another still-valid quote.
- There is no automatic ranked fallback queue and no on-ledger proof that the
  selected quote was objectively best.
- Privacy is Canton party-scoped disclosure, not anonymity or a cryptographic
  blind auction.
