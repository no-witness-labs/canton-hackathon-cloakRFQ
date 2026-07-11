# Presentation Deck: outline

Slide-by-slide outline for the submission deck. The designed slides live in
`docs/pitch/cloakrfq-pitch.html` (source) and `docs/pitch/cloakrfq-pitch.pdf`
(rendered). To regenerate the PDF after editing the HTML, use the headless
Chrome command in the HTML file's header comment.

1. **Title**: CloakRFQ Receipts · private invoice-financing RFQs on Canton ·
   Track 1: Private DeFi & Capital Markets. Audience: suppliers and the factors,
   credit funds, and trade-finance desks competing to buy their receivables.
2. **Real financial problem**: obtaining competitive receivables-finance quotes
   usually means oversharing Debtor information, commercial terms, bidder
   identities, and the quote book with every participant or a central platform.
3. **Product**: one represented Receivable, scoped Compliance and Risk evidence,
   one private request per invited Funder, and funding-backed Private Quotes that
   only the Seller can compare. This is a blind-RFQ pattern, not a cryptographic
   blind auction.
4. **Privacy proof**: seven business role views backed by ten technical Canton
   parties. Each Funder sees only its own request and quote; Compliance and Risk
   remain separate; the Coordinator has no quote contents; the Auditor sees
   nothing before settlement; the Outsider sees nothing.
5. **Originality**: private competition without a quote-visible marketplace
   operator. The Seller compares eligible offers across Net Purchase Price,
   recourse, Debtor-notification requirements, and quote validity while competing
   Funders remain blind to one another.
6. **Workflow and product logic**: Register → Attest → Open private requests →
   Submit allocation-backed quotes → Compare after deadline → Settle demo payment
   and initiate transfer → Funder accepts ownership → Auditor receives scoped
   `ReceivableSaleSettlement` evidence. Failed settlement rolls back so the Seller
   can retry or choose another valid quote.
7. **Technical execution and UX**: modular Daml packages, authorization and
   validation checks, Phase 1–3 and failure tests, Canton DevNet deployment,
   JSON Ledger API integration, per-party ledger view, role-switcher workspace,
   self-service sessions, transaction explorer links, glossary, responsive UI,
   runbook, technical design, and 12 ADRs.
8. **Why Canton and boundaries**: the product depends on selective disclosure,
   role-based authorization, funding-backed private competition, coordinated
   settlement, and auditability without a public quote book. CIP-56 funding and
   settlement are non-production demo fixtures; no production custody, payment
   finality, invoice verification, or legal assignment is claimed.

Keep it judge-legible in three minutes. Lead with the privacy problem and show the
role-switcher proof early.
