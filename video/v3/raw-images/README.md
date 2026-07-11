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
| 005 | [005-seller-open-rfq-blocked.png](005-seller-open-rfq-blocked.png) | Seller | Confirm Open RFQ is blocked | The disabled Open RFQ control lists the missing Compliance and Risk attestations before the Seller changes roles. | Open RFQ remains blocked until both independent attestations exist. |
| 006 | [006-compliance-review.png](006-compliance-review.png) | Compliance | Review Seller and package eligibility | Compliance controls its two eligibility decisions independently from the Seller. | Compliance now reviews Seller eligibility and RFQ-package eligibility. |
| 007 | [007-compliance-approved.png](007-compliance-approved.png) | Compliance | Issue the Compliance attestation | The eligibility result is recorded while certificate derivation remains a Seller action. | Compliance approval is now recorded as a scoped attestation. |
| 008 | [008-risk-review.png](008-risk-review.png) | Risk Assessor | Review and select the Receivable risk tier | Risk is evaluated by a role separate from Compliance. | The independent Risk Assessor now assigns the certified risk tier. |
| 009 | [009-risk-rated.png](009-risk-rated.png) | Risk Assessor | Issue the Risk attestation | The certified tier is ready for controlled disclosure to invited Funders. | The risk rating is recorded without exposing raw Debtor records to Funders. |
| 010 | [010-seller-open-rfq-enabled.png](010-seller-open-rfq-enabled.png) | Seller | Open RFQ becomes available | Both authority-controlled attestations are present, enabling the certificate-backed action. | With Compliance and Risk complete, the Seller can now open the RFQ. |
| 011 | [011-seller-rfq-opened.png](011-seller-rfq-opened.png) | Seller | Create one private request per Funder | The Seller derives both certificates and creates three isolated RFQ requests. | The Seller opens the RFQ, creating one private request for each invited Funder. |
| 012 | [012-funder-a-compose-offer.png](012-funder-a-compose-offer.png) | Funder A | Review the certified package and compose an offer | Funder A sees certified terms, a withheld Debtor identity, and no competing offers. | Funder A can now review its private package and submit an allocation-backed offer. |
| 013 | [013-funder-a-offer-submitted.png](013-funder-a-offer-submitted.png) | Funder A | Submit the first Private Quote | The first offer is recorded with a committed mock CIP-56 allocation. | Funder A submits its Private Quote with committed demo funding evidence. |
| 014 | [014-funder-b-compose-offer.png](014-funder-b-compose-offer.png) | Funder B | Compose a differentiated Private Quote | Funder B chooses a different price, recourse model, and notification requirement. | Funder B independently chooses different terms without seeing Funder A. |
| 015 | [015-funder-b-offer-submitted.png](015-funder-b-offer-submitted.png) | Funder B | Submit the second Private Quote | Funder B sees only its own submitted outcome and allocation evidence. | Funder B submits its own funding-backed Private Quote. |
| 016 | [016-seller-compares-open-offers.png](016-seller-compares-open-offers.png) | Seller | Compare offers before the deadline | The Seller compares price, recourse, notification, and funding status while settlement is disabled. | The Seller can compare both offers, but settlement remains locked until the response window closes. |
| 017 | [017-ledger-seller-view.png](017-ledger-seller-view.png) | Seller ledger view | Inspect Seller-visible contracts | The Seller sees contracts needed to originate, compare, and settle the deal. | The same transaction history now appears through separate Canton party views. |
| 018 | [018-ledger-funder-a-view.png](018-ledger-funder-a-view.png) | Funder A ledger view | Inspect Funder A entitlements | Funder A sees only its request, Quote, and related allocation state. | Funder A sees only contracts it is entitled to see. |
| 019 | [019-ledger-funder-b-view.png](019-ledger-funder-b-view.png) | Funder B ledger view | Inspect Funder B entitlements | Funder B sees its distinct request and Quote, not Funder A data. | Funder B receives a separate private view of the same RFQ. |
| 020 | [020-ledger-funder-c-view.png](020-ledger-funder-c-view.png) | Funder C ledger view | Inspect the invited non-bidding Funder | Funder C sees its own RFQ request but no Quotes submitted by Funders A or B. | Funder C sees its invitation, but none of the competing Quotes. |
| 021 | [021-ledger-compliance-view.png](021-ledger-compliance-view.png) | Compliance ledger view | Inspect Compliance entitlements | Compliance sees only its scoped attestation and certificate-related contracts. | Compliance retains only its purpose-limited eligibility view. |
| 022 | [022-ledger-risk-view.png](022-ledger-risk-view.png) | Risk ledger view | Inspect Risk Assessor entitlements | The Risk Assessor sees only its scoped risk attestation and certificate-related contracts. | The Risk Assessor retains a separate, purpose-limited risk view. |
| 023 | [023-ledger-coordinator-view.png](023-ledger-coordinator-view.png) | Coordinator ledger view | Confirm no quote visibility | The Coordinator is not a stakeholder on Private Quotes and sees no quote contents. | The Coordinator sees no Private Quote contents. |
| 024 | [024-ledger-auditor-before-settlement.png](024-ledger-auditor-before-settlement.png) | Auditor ledger view | Confirm pre-settlement evidence is absent | Before settlement, the Auditor has no private RFQ or Quote contracts. | Before settlement, the Auditor sees none of the private marketplace. |
| 025 | [025-ledger-outsider-view.png](025-ledger-outsider-view.png) | Outsider ledger view | Confirm non-party privacy | A non-party sees no useful contract data. | The Outsider sees nothing useful; this is Canton disclosure, not a visual filter. |
| 026 | [026-seller-settlement-enabled.png](026-seller-settlement-enabled.png) | Seller | Response deadline closes | Accept and settle is enabled only after the common response deadline. | The response window is now closed, so the Seller can accept and settle one offer. |
| 027 | [027-seller-settlement-recorded.png](027-seller-settlement-recorded.png) | Seller | Settle the selected Quote | The Seller receives demo payment and a pending Receivable transfer is initiated atomically. | The selected Quote settles: payment reaches the Seller and a pending transfer is created. |
| 028 | [028-winner-transfer-ready.png](028-winner-transfer-ready.png) | Winning Funder | Pending Receivable transfer is ready | The Seller is paid and the winning Funder receives the ownership-acceptance action. | The winning Funder can now accept the pending Receivable transfer. |
| 029 | [029-winner-ownership-accepted.png](029-winner-ownership-accepted.png) | Winning Funder | Accept Receivable ownership | The post-settlement ownership step completes the transfer lifecycle. | The winning Funder accepts ownership, completing the transfer lifecycle. |
| 030 | [030-auditor-scoped-evidence.png](030-auditor-scoped-evidence.png) | Auditor | Inspect post-settlement evidence | The Auditor sees settlement fields while losing Quotes and raw source data remain withheld. | Only now does the Auditor receive scoped ReceivableSaleSettlement evidence. |
| 031 | [031-closing-value-proposition.png](031-closing-value-proposition.png) | Closing frame | Summarize the product value | The closing frame restates private competition, funding evidence, and scoped auditability. | Close with the existing value proposition about privacy shaping the marketplace. |
