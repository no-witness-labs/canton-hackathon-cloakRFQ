// CloakRFQ Receipts — shared domain model
// Source of truth: docs in canton-hackathon-cloakRFQ/docs/ + the CloakRFQ.dc.html prototype.
// Product-language rule: Funder (not Lender), Receivable Sale (not loan), Private Quote,
// Net Purchase Price, Best Compliant Quote, Scoped Compliance Receipt, Demo Settlement Asset.

// ----------------------------------------------------------------------------
// Parties / roles — each is a distinct Canton party with its own disclosure scope.
// ----------------------------------------------------------------------------
export type PartyRole =
  | 'seller'        // owns the Receivable, opens the RFQ, selects the Best Compliant Quote
  | 'funder'        // submits a Private Quote to buy the Receivable
  | 'compliance'    // Compliance Party — issues eligibility attestations
  | 'risk'          // Risk Assessor — issues risk attestations (separate scoped role)
  | 'coordinator'   // routes workflow; does NOT see Private Quote contents by default
  | 'auditor'       // Auditor / Regulator — receives a Scoped Compliance Receipt only
  | 'outsider';     // non-party — sees nothing useful

export type RecourseModel = 'Recourse' | 'Non-recourse' | 'Negotiable';
export type SettlementTiming = 'T+1' | 'T+2' | 'T+3';
export type DebtorNotification = 'Required' | 'Not required';
/** Required-disclosure level — itself part of the quote's price. */
export type DisclosureLevel = 'Minimal' | 'Medium' | 'High';

export interface Receivable {
  ref: string;            // opaque reference, e.g. "RCV-9F2A"
  invoiceId: string;      // e.g. "INV-4471"
  faceValue: number;      // e.g. 480000
  currency: string;       // e.g. "USD"
  dueDate: string;        // ISO date
  daysToDue: number;      // e.g. 45
  debtorName: string;     // visible to Seller; Funders get the attestation, not raw identity
  recoursePreference: RecourseModel;
  settlementPreference: SettlementTiming;
  validityVerified: boolean;
}

/** Private Quote — Funder's confidential offer. Hidden from competing Funders + Coordinator. */
export interface PrivateQuote {
  funderId: string;             // pseudonymous label, e.g. "VC-7"
  funderName: string;           // real identity — disclosed only when required
  netPurchasePrice: number;     // amount the Seller nets
  advanceRatePct: number;       // % of face paid upfront
  reserveAmount: number;        // held back, released on debtor payment minus fees
  fees: number;
  recourse: RecourseModel;
  settlement: SettlementTiming;
  requiredDisclosure: DisclosureLevel;   // priced into the deal
  debtorNotification: DebtorNotification;
  quoteExpiry: string;          // Binding Quote during its validity period
  proofOfFundsPassed: boolean;  // Proof-of-Funds Gate — eligibility evidence ONLY, not a lock
  complianceEligible: boolean;
}

export type RfqPhase = 'quoting' | 'selected' | 'settling' | 'failed' | 'settled';

/** Withheld from the Scoped Compliance Receipt by default. */
export const RECEIPT_WITHHELD = [
  'Full RFQ workflow', 'Full Quote Book', 'All Private Quotes', 'Raw Proof-of-Funds data',
  'Raw Sensitive Attributes', 'Raw invoice documents', 'Unselected Funder identities', 'Full party records',
] as const;
