# V3 Ordered Raw Images

These screenshots were captured from one fresh end-to-end workflow. They are the
ordered visual source for V3.

## Usage Rule

- Use images strictly in the order below.
- Use every selected image at most once.
- Do not duplicate an image to fill narration time; adjust scene duration or use
  the next ordered image instead.
- Keep the existing narration unless the final column calls for a short,
  UI-specific clarification.

| Order | Image | Role/View | UI step | What the image establishes | Narration cue |
| ---: | --- | --- | --- | --- | --- |
| 001 | [001-loading.png](001-loading.png) | System | Connect to Canton and load the isolated workspace | The single loading image establishes that the UI is connecting to a real ledger-backed workspace. | The demo begins by connecting this workspace to Canton. |
| 002 | [002-welcome.png](002-welcome.png) | Overview | Introduce the private Receivable Sale workflow | The welcome panel presents the four-stage product flow before any ledger action. | Use the existing problem statement and introduce CloakRFQ as the institutional workflow. |
| 003 | [003-seller-register-receivable.png](003-seller-register-receivable.png) | Seller | Review and register the Receivable | Raw Debtor identity and invoice metadata are visible in the Seller registration view. | The Seller registers a represented Receivable while raw Debtor identity stays private. |
| 004 | [004-seller-receivable-registered.png](004-seller-receivable-registered.png) | Seller | Receivable registration completes | The progress bar advances and the Seller is prompted to obtain Compliance and Risk attestations. | The Receivable is now on-ledger and ready for scoped review. |
| 005 | [005-compliance-review.png](005-compliance-review.png) | Compliance | Review Seller and package eligibility | Compliance controls its two eligibility decisions independently from the Seller. | Compliance now reviews Seller eligibility and RFQ-package eligibility. |
| 006 | [006-compliance-approved.png](006-compliance-approved.png) | Compliance | Issue the Compliance attestation | The eligibility result is recorded while certificate derivation remains a Seller action. | Compliance approval is now recorded as a scoped attestation. |
| 007 | [007-risk-review.png](007-risk-review.png) | Risk Assessor | Review and select the Receivable risk tier | Risk is evaluated by a role separate from Compliance. | The independent Risk Assessor now assigns the certified risk tier. |
| 008 | [008-risk-rated.png](008-risk-rated.png) | Risk Assessor | Issue the Risk attestation | The certified tier is ready for controlled disclosure to invited Funders. | The risk rating is recorded without exposing raw Debtor records to Funders. |
| 009 | [009-seller-open-rfq-enabled.png](009-seller-open-rfq-enabled.png) | Seller | Open RFQ becomes available | Both authority-controlled attestations are present, enabling the certificate-backed action. | With Compliance and Risk complete, the Seller can now open the RFQ. |
| 010 | [010-seller-rfq-opened.png](010-seller-rfq-opened.png) | Seller | Create one private request per Funder | The Seller derives both certificates and creates three isolated RFQ requests. | The Seller opens the RFQ, creating one private request for each invited Funder. |
| 011 | [011-funder-a-compose-offer.png](011-funder-a-compose-offer.png) | Funder A | Review the certified package and compose an offer | Funder A sees certified terms, a withheld Debtor identity, and no competing offers. | Funder A can now review its private package and submit an allocation-backed offer. |
| 012 | [012-funder-a-offer-submitted.png](012-funder-a-offer-submitted.png) | Funder A | Submit the first Private Quote | The first offer is recorded with a committed mock CIP-56 allocation. | Funder A submits its Private Quote with committed demo funding evidence. |
| 013 | [013-funder-b-compose-offer.png](013-funder-b-compose-offer.png) | Funder B | Compose a differentiated Private Quote | Funder B chooses a different price, recourse model, and notification requirement. | Funder B independently chooses different terms without seeing Funder A. |
| 014 | [014-funder-b-offer-submitted.png](014-funder-b-offer-submitted.png) | Funder B | Submit the second Private Quote | Funder B sees only its own submitted outcome and allocation evidence. | Funder B submits its own funding-backed Private Quote. |
| 015 | [015-seller-compares-open-offers.png](015-seller-compares-open-offers.png) | Seller | Compare offers before the deadline | The Seller compares price, recourse, notification, and funding status while settlement is disabled. | The Seller can compare both offers, but settlement remains locked until the response window closes. |
| 016 | [016-ledger-seller-view.png](016-ledger-seller-view.png) | Seller ledger view | Inspect Seller-visible contracts | The Seller sees contracts needed to originate, compare, and settle the deal. | The same transaction history now appears through separate Canton party views. |
| 017 | [017-ledger-funder-a-view.png](017-ledger-funder-a-view.png) | Funder A ledger view | Inspect Funder A entitlements | Funder A sees only its request, Quote, and related allocation state. | Funder A sees only contracts it is entitled to see. |
| 018 | [018-ledger-funder-b-view.png](018-ledger-funder-b-view.png) | Funder B ledger view | Inspect Funder B entitlements | Funder B sees its distinct request and Quote, not Funder A data. | Funder B receives a separate private view of the same RFQ. |
| 019 | [019-ledger-coordinator-view.png](019-ledger-coordinator-view.png) | Coordinator ledger view | Confirm no quote visibility | The Coordinator is not a stakeholder on Private Quotes and sees no quote contents. | The Coordinator sees no Private Quote contents. |
| 020 | [020-ledger-auditor-before-settlement.png](020-ledger-auditor-before-settlement.png) | Auditor ledger view | Confirm pre-settlement evidence is absent | Before settlement, the Auditor has no private RFQ or Quote contracts. | Before settlement, the Auditor sees none of the private marketplace. |
| 021 | [021-ledger-outsider-view.png](021-ledger-outsider-view.png) | Outsider ledger view | Confirm non-party privacy | A non-party sees no useful contract data. | The Outsider sees nothing useful; this is Canton disclosure, not a visual filter. |
| 022 | [022-seller-settlement-enabled.png](022-seller-settlement-enabled.png) | Seller | Response deadline closes | Accept and settle is enabled only after the common response deadline. | The response window is now closed, so the Seller can accept and settle one offer. |
| 023 | [023-seller-settlement-recorded.png](023-seller-settlement-recorded.png) | Seller | Settle the selected Quote | The Seller receives demo payment and a pending Receivable transfer is initiated atomically. | The selected Quote settles: payment reaches the Seller and a pending transfer is created. |
| 024 | [024-winner-transfer-ready.png](024-winner-transfer-ready.png) | Winning Funder | Pending Receivable transfer is ready | The Seller is paid and the winning Funder receives the ownership-acceptance action. | The winning Funder can now accept the pending Receivable transfer. |
| 025 | [025-winner-ownership-accepted.png](025-winner-ownership-accepted.png) | Winning Funder | Accept Receivable ownership | The post-settlement ownership step completes the transfer lifecycle. | The winning Funder accepts ownership, completing the transfer lifecycle. |
| 026 | [026-auditor-scoped-evidence.png](026-auditor-scoped-evidence.png) | Auditor | Inspect post-settlement evidence | The Auditor sees settlement fields while losing Quotes and raw source data remain withheld. | Only now does the Auditor receive scoped ReceivableSaleSettlement evidence. |
| 027 | [027-activity-ledger-transactions.png](027-activity-ledger-transactions.png) | Activity log | Inspect real ledger update identifiers | The Activity log shows real Daml transactions generated during the workflow. | The ledger Activity log provides the transaction-level execution trail. |
| 028 | [028-closing-value-proposition.png](028-closing-value-proposition.png) | Closing frame | Summarize the product value | The closing frame restates private competition, funding evidence, and scoped auditability. | Close with the existing value proposition about privacy shaping the marketplace. |
