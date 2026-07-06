# CloakRFQ Receipts — Canton Hackathon Alignment

This document records the official hackathon brief (reproduced verbatim below)
and how CloakRFQ Receipts is positioned against it. The project's own to-dos that
come out of these requirements (deck, video pitch, live deploy, etc.) are tracked
as GitHub issues, not here. For the delivery plan see `HACKATHON_ROADMAP.md`.

## Official brief

> Canton is a privacy-enabled Layer 1 blockchain where transactions stay private between the parties involved and multi-party workflows settle atomically.
>
> Build something that makes a real user or institution want to show up and start using Canton. Build for a world where users control who sees what using Canton's privacy model.

### Submission Requirements

- Public repository
- Presentation deck
- 3 minute video pitch w/ demo
- Link to live product

### Problem Statements/Themes of the 3 challenges

- Private DeFi (confidential lending, OTC trading, invoice financing)
- B2B marketplace with blind auctions
- Private M&A data rooms
- Invoice or Supply Chain financing
- Inter-company cross currency netting
- Agentic commerce with privacy
- Payments and neobanking services
- RWA & Tokenized deposits

### Judging Criteria

- Technical execution - Does it work? Is the code clean, well-structured, and properly documented?
- Originality and creativity - Is this a fresh approach or a new use case? Does it do something we haven't seen before?
- User experience and design - Could a real user actually use this? Is the interface clear and functional?
- Real-world applicability - Does this solve a genuine problem? Would someone actually want to use it?

## Decision

CloakRFQ Receipts will submit under **Track 1: Private DeFi & Capital Markets**.

The project may naturally touch invoice financing, B2B blind RFQs, receivables, and tokenized asset workflows, but the submission should be positioned under one track only. For this hackathon, the canonical track is **Private DeFi & Capital Markets**.

## Primary track

### 1. Private DeFi & Capital Markets

CloakRFQ Receipts fits this track because it is a privacy-first financial workflow for professional and institutional markets.

The project demonstrates:

- private credit / invoice financing;
- confidential quote submission;
- private counterparty and quote visibility;
- RFQ-style private deal execution;
- selective compliance and regulatory disclosure;
- capital-markets-style workflow logic where pricing, counterparties, and commercial terms should not be public.

Canonical positioning:

> **CloakRFQ Receipts is a private invoice-financing RFQ marketplace on Canton where Funders submit proof-backed Private Quotes, Sellers select the Best Compliant Quote, settlement is demonstrated on-ledger, and Auditors or Regulators receive Scoped Compliance Receipts without seeing the full marketplace.**

## Why this is the right track

The hackathon asks builders to create applications that bring real users or institutions to Canton, especially by using Canton's privacy model so users control who sees what.

CloakRFQ Receipts directly answers that challenge:

- Sellers do not expose their full receivable workflow to the public.
- Funders do not see competing Private Quotes.
- Coordinators do not receive quote contents by default.
- Auditors and Regulators receive scoped compliance evidence rather than the full RFQ.
- Sensitive commercial data is replaced with attestations and purpose-limited disclosure where practical.

The project is therefore not just using Canton as a generic ledger. The product logic depends on Canton-style privacy, selective disclosure, and multi-party workflow coordination.

## Why Canton

CloakRFQ uses Canton for concrete product benefits, not generic chain branding.

| Canton benefit | How CloakRFQ uses it |
|---|---|
| **Selective disclosure** | Sellers, Funders, Coordinators, Compliance, Risk, Auditors, and Regulators each receive only the records relevant to their role. |
| **Private RFQs** | Funders do not see competing Private Quotes, and Coordinators do not receive quote contents by default. |
| **Atomic multi-party settlement** | Receivable assignment and Demo Settlement Asset transfer can be demonstrated as one coordinated settlement outcome. |
| **Institutional decentralisation** | The workflow does not require a quote-visible marketplace operator that controls and reads the full Quote Book by default. |
| **Workflow speed** | Quote submission, selection, settlement status, fallback, and compliance receipt generation can happen in one coordinated workflow instead of across disconnected manual processes. |
| **Efficiency** | Unrelated parties do not need to process or store the full marketplace, quote book, or compliance record. |
| **Role-based authorization** | Daml/Canton workflow roles can encode who may create, view, approve, select, settle, or audit each record. |
| **Auditability without full transparency** | Auditors or Regulators can receive Scoped Compliance Receipts without becoming full observers of the private RFQ. |

Deck wording:

> **CloakRFQ uses Canton because private invoice-financing RFQs need more than tokenization. They need selective disclosure, role-based authorization, atomic settlement, and auditability without exposing the full marketplace.**

## Relationship to other themes

These themes are relevant, but they should be treated as supporting context rather than submission tracks.

| Theme | Relationship to CloakRFQ | Submission posture |
|---|---|---|
| Invoice or supply-chain financing | Core use case: the MVP is based on Receivable Sales. | Mention as use case inside Track 1. |
| B2B marketplace with blind auctions | CloakRFQ is a Blind RFQ marketplace with private quotes. | Mention as product pattern, not separate track. |
| TradeFi, RWA & Tokenized Assets | The Receivable is represented on-ledger and can be described as a real-world financial claim. | Secondary context only. |
| Payments and neobanking | The MVP has On-Ledger Demo Settlement, but it is not a payments product. | Do not position as this track. |
| Agentic commerce with privacy | Not part of the MVP. | Do not add agents just to chase the theme. |

## What to emphasize for judging

### Technical execution

Show a working multi-party Canton/Daml workflow:

1. Seller creates a Receivable and opens a Blind RFQ.
2. Funders receive RFQ Disclosure Packages.
3. Funders submit Private Quotes backed by scoped funding evidence, concretely committed CIP-56 allocation evidence in Phase 2.
4. Seller sees a Seller Quote View and selects the Best Compliant Quote.
5. Settlement is demonstrated with a Demo Settlement Asset.
6. Auditor or Regulator receives a Scoped Compliance Receipt.

The demo should clearly show that different parties see different ledger views.

### Originality and creativity

The strongest original angle is:

> **Disclosure is part of the quote.**

A Seller may prefer a quote with a slightly lower Net Purchase Price if it has faster settlement, better recourse terms, fewer required disclosures, or better privacy properties.

This makes the product more than generic invoice financing. It turns privacy and selective disclosure into commercial RFQ terms.

### User experience and design

Keep the UI simple and role-based:

- Seller dashboard;
- Funder dashboard;
- Compliance / Risk dashboard;
- Auditor / Regulator receipt view;
- Coordinator status view.

The demo story should be understandable in three minutes:

> A Seller wants liquidity without exposing its full financial workflow. Funders quote privately. The Seller selects the best compliant deal. Settlement completes. The Auditor or Regulator sees only the scoped receipt.

### Real-world applicability

The project solves a real commercial problem:

> Businesses want financing against receivables, but they do not want to unnecessarily reveal customers, quote terms, bidder identities, funding status, compliance records, or their wider financial position.

The use case is credible for institutional and professional finance because privacy, counterparty confidentiality, compliance evidence, and selective disclosure are not optional extras. They are core product requirements.

## What not to claim

Do not claim that CloakRFQ is:

- a generic RWA tokenization platform;
- a lending protocol;
- a payments or neobanking product;
- an agentic commerce product;
- a full cryptographic blind auction;
- a zero-knowledge proof system;
- a production payment network;
- a production legal receivables-assignment system;
- Canton Coin, stablecoin, bank, or custodian settlement.

The correct claim is narrower and stronger:

> **CloakRFQ is a private RFQ workflow for invoice financing / Receivable Sales that demonstrates Canton-native selective disclosure, multi-party privacy, and atomic demo settlement.**

## Submission positioning

Use this in the deck, README, and video pitch:

```text
Track: Private DeFi & Capital Markets

Theme: Private credit / invoice financing

Product: CloakRFQ Receipts — private invoice-financing RFQs with proof-backed quotes and scoped compliance receipts on Canton.
```

Do not present the project as spanning multiple tracks. The project can reference adjacent themes, but the submitted track should remain **Private DeFi & Capital Markets**.
