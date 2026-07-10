# Presentation Deck: outline

Slide-by-slide outline for the submission deck. The designed slides live in
`docs/pitch/cloakrfq-pitch.html` (source) and `docs/pitch/cloakrfq-pitch.pdf`
(rendered). To regenerate the PDF after editing the HTML, use the headless
Chrome command in the HTML file's header comment.

1. **Title**: CloakRFQ Receipts · private invoice-financing RFQs on Canton ·
   Track 1: Private DeFi & Capital Markets. One-line: "Private invoice
   financing where every party sees only its slice of the deal." Audience:
   suppliers plus the factors, credit funds, and trade-finance desks that
   compete to fund them. Now live on Canton DevNet: every step is a real
   Daml transaction.
2. **Problem**: to get a quote, you overshare. Sellers broadcast debtor files;
   Funders see each other's bids; platforms in the middle see everything.
   Receivables finance already prices on private, bilateral terms.
3. **The idea**: Blind RFQ, scoped per party. Seller publishes attestations,
   not raw files; Funders submit Private Quotes only the Seller can read, with
   funds committed behind every quote (a CIP-56 allocation): no bidding what
   you can't pay; everyone else gets a scoped view. Enforced on-ledger by
   Daml contract visibility, not filtered in a UI.
4. **Selective disclosure (the centerpiece)**: the who-sees-what table. Same
   RFQ, seven parties, each sees only its slice. Outsider sees nothing.
5. **Originality hook**: *"disclosure is part of the quote."* Best ≠ highest
   price; recourse, settlement, notification, required disclosure are priced in;
   the highest headline is excluded at the PoF Gate.
6. **Party interaction**: Open → Quote (Private Quote with funds committed
   behind it) → Select → Settle (payment and Receivable change hands
   atomically, CIP-56) → Audit (Scoped Compliance Receipt). Binding quotes;
   seller-controlled fallback queue.
7. **Built & running**: live on Canton DevNet. The Daml model enforces the
   product rules (no RFQ without attestations, no quote without committed
   funds, no settlement unless payment and Receivable move together; Phases
   1–3 implemented incl. rollback-based failed-settlement handling); a
   role-switcher workspace a first-time user can drive
   (in-UI glossary, mobile), live-backed via the JSON Ledger API; zero-setup
   self-service per-visitor sessions; per-transaction Lighthouse explorer
   links; 12 ADRs + per-phase design notes in the repo.
8. **Why Canton + claim boundaries**: no operator sees the whole book;
   disclosure is a ledger permission. Demo Settlement Asset (non-production)
   via the CIP-56 token workflow; Proof-of-Funds = committed CIP-56 allocation
   (bid-eligibility evidence, not payment finality, a funds lock, or escrow);
   no production custody, payments, or legal assignment.

Keep it judge-legible in 3 minutes; lead with the role-switcher moment.
