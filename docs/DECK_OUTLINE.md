# Presentation Deck — outline

Slide-by-slide outline for the submission deck (~10 slides). This is the
content plan; producing the designed slides is the remaining step for #18.

1. **Title** — CloakRFQ Receipts · private invoice-financing RFQs on Canton ·
   Track 1: Private DeFi & Capital Markets. One-line: "Finance receivables
   without exposing your book."
2. **Problem** — receivables financing needs confidentiality: Sellers won't
   reveal their book; Funders shouldn't see each other's quotes; auditors still
   need assurance. Public/operator-visible marketplaces don't fit.
3. **Why Canton** — privacy-enabled L1: transactions private between parties,
   atomic multi-party settlement, role-scoped selective disclosure.
4. **The product** — Blind RFQ: Seller → Funders (proof-backed Private Quotes) →
   Best Compliant Quote → On-Ledger Demo Settlement → Scoped Compliance Receipt.
5. **Originality hook** — *"disclosure is part of the price."* Best ≠ highest
   price; recourse, settlement, notification, required disclosure are priced in.
6. **Selective disclosure (the demo)** — the role switcher: same RFQ, seven
   parties, each sees only its slice. Outsider sees nothing.
7. **Demo flow** — select Best Compliant Quote → settle (or fail → fallback) →
   Auditor's scoped receipt. (Mirror `docs/VIDEO_SCRIPT.md`.)
8. **Architecture** — Daml templates enforce party-scoped visibility on-ledger;
   JSON Ledger API; Next.js UI per-party views. (Today UI is mocked; ledger in
   progress — be honest.)
9. **Claim boundaries** — CIP-56 token settlement scoped to the demo environment; PoF =
   eligibility evidence only; no ZK / production settlement / custody.
10. **Roadmap + team** — what's built (UI, scaffold), what's next (Daml phases),
    and who.

Keep it judge-legible in 3 minutes; lead with the role-switcher moment.
