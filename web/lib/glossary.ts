// Plain-English glossary for in-UI term tooltips. Newbie-friendly rewordings of
// the canonical definitions in the repo's CONTEXT.md — the goal is that a
// first-time, non-technical user can hover/tap any core term and understand it.

export interface GlossaryEntry { term: string; def: string }

export const GLOSSARY: Record<string, GlossaryEntry> = {
  receivable: {
    term: 'Receivable',
    def: 'An unpaid invoice — money a customer owes you. You can sell it to a lender for cash now instead of waiting to be paid.',
  },
  rfq: {
    term: 'RFQ (Request for Quote)',
    def: 'You privately ask several lenders to make an offer to finance your invoice — without them seeing each other or competing openly.',
  },
  funder: {
    term: 'Funder',
    def: 'A lender who can buy your invoice: they pay you now and collect from your customer later. Sometimes called an investor.',
  },
  debtor: {
    term: 'Debtor',
    def: 'The customer who owes the money on the invoice — the party who will eventually pay it.',
  },
  attestation: {
    term: 'Attestation',
    def: 'A signed statement from a checker (Compliance or Risk) about the invoice — for example, that it is eligible, or how likely it is to be paid.',
  },
  certificate: {
    term: 'Certificate',
    def: 'A trimmed, shareable version of an attestation. It proves a check passed while revealing only what lenders need to see — not the underlying data.',
  },
  risktier: {
    term: 'Risk rating',
    def: 'A simple low / medium / high rating of how likely the invoice is to be paid. Lenders use it to price their offer — lower risk means better terms.',
  },
  canton: {
    term: 'Canton',
    def: 'The privacy-focused blockchain network this runs on. It lets each participant see only the data they are entitled to, enforced automatically.',
  },
  party: {
    term: 'Party',
    def: 'One participant in the deal — you, a lender, a compliance checker, and so on. On Canton, each party sees only its own slice of the data.',
  },
};
