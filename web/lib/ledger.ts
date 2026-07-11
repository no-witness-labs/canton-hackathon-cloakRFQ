// Minimal client for the Canton JSON Ledger API v2.
//
// The browser calls "/v2/..." same-origin; next.config.mjs proxies it to the
// sandbox (which sends no CORS headers). The sandbox runs with auth disabled, so
// requests carry no token — the acting party is named explicitly per command.
//
// Runtime config (party ids) is fetched from /ledger-config.json, which
// scripts/bootstrap.sh writes into web/public. On a clean checkout (no sandbox)
// loadConfig() returns false so the UI can show a "run start-sandbox" message.

export type Role =
  | 'seller' | 'funderA' | 'funderB' | 'funderC'
  | 'compliance' | 'risk' | 'coordinator' | 'auditor' | 'outsider' | 'tokenAdmin';

interface LedgerConfig {
  jsonApiUrl: string;
  packageRef: string;
  userId: string;
  parties: Record<Role, string>;
}

const EMPTY_PARTIES: Record<Role, string> = {
  seller: '', funderA: '', funderB: '', funderC: '',
  compliance: '', risk: '', coordinator: '', auditor: '', outsider: '', tokenAdmin: '',
};

let cfg: LedgerConfig = { jsonApiUrl: '', packageRef: '#cloakrfq-contracts-v2', userId: 'cloakrfq', parties: EMPTY_PARTIES };

/** Stable per-browser session id (for self-service per-visitor parties on the deploy). */
function sessionId(): string {
  try {
    const k = 'cloakrfq-sid';
    let s = localStorage.getItem(k);
    if (!s) {
      s = ((typeof crypto !== 'undefined' && crypto.randomUUID?.()) || String(Math.random())).replace(/[^a-z0-9]/gi, '').slice(0, 16);
      localStorage.setItem(k, s);
    }
    return s;
  } catch { return ''; }
}
/** Start a brand-new isolated deal (new party set) on the next load. */
export function newSession(): void { try { localStorage.removeItem('cloakrfq-sid'); } catch { /* ignore */ } }

const applyConfig = (loaded: Record<string, unknown>): boolean => {
  cfg = { ...cfg, ...loaded, parties: { ...EMPTY_PARTIES, ...((loaded.parties as Record<Role, string>) ?? {}) } };
  return Boolean(cfg.parties.seller);
};

let sessionMode = false;
/** True when this deploy provisioned per-visitor parties (so "New deal" makes sense). */
export const isSessionMode = (): boolean => sessionMode;

/** Load runtime config. Prefers a self-service session (/api/session) when the deploy
 *  has provisioning enabled; otherwise falls back to the static /ledger-config.json
 *  written by scripts/bootstrap.sh (local sandbox). False if neither is available. */
export async function loadConfig(): Promise<boolean> {
  try {
    const sid = sessionId();
    if (sid) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(`/api/session?sid=${sid}`, { cache: 'no-store' });
          if (response.ok) {
            const loaded = await response.json();
            if (loaded?.parties?.seller) { sessionMode = true; return applyConfig(loaded); }
            break;
          }
          if (response.status < 500 && response.status !== 429) break;
        } catch {
          if (attempt === 2) break;
        }
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 1250));
      }
    }
    const response = await fetch('/ledger-config.json', { cache: 'no-store' });
    if (!response.ok) return false;
    return applyConfig(await response.json());
  } catch {
    return false;
  }
}

export const getParties = (): Record<Role, string> => cfg.parties;

/** External explorer URL for a single transaction by ledger updateId (5N Lighthouse
 *  indexes the DevNet participant — it shows the synchronizer record: parties,
 *  traffic and verdict, not private contract contents). Null off DevNet (e.g. a
 *  local sandbox), where callers fall back to the in-app Activity view. */
export function explorerTxUrl(updateId: string): string | null {
  if (!updateId) return null;
  const onDevnet = /devnet|fivenorth|cantonloop/i.test(cfg.jsonApiUrl) || sessionMode;
  return onDevnet ? `https://lighthouse.devnet.cantonloop.com/transactions/${encodeURIComponent(updateId)}` : null;
}

// CloakRFQ templates live in per-module namespaces inside cloakrfq-contracts.
const MODULE: Record<string, string> = {
  Receivable: 'Receivable',
  ComplianceAttestation: 'Compliance', ComplianceCertificate: 'Compliance',
  RiskAttestation: 'Risk', RiskCertificate: 'Risk',
  RFQRequest: 'RFQRequest', PrivateQuote: 'RFQRequest',
  ReceivableSaleSettlement: 'Settlement',
};
// The CIP-56 token mocks live in a separate package (cloakrfq-test).
const TEST_PACKAGE_REF = '#cloakrfq-test-v2';
const TEST_TEMPLATES = new Set(['MockFundingAllocation', 'MockSettlementFactory']);
const tpl = (name: string) => TEST_TEMPLATES.has(name)
  ? `${TEST_PACKAGE_REF}:CloakRFQ.Test.Fixtures:${name}`
  : `${cfg.packageRef}:CloakRFQ.${MODULE[name] ?? name}:${name}`;

const KNOWN: string[] = Object.keys(MODULE);

export interface Contract { contractId: string; template: string; args: Record<string, unknown>; }

let cmdSeq = 0;
const nextCommandId = (p: string) => `cloakrfq-${p}-${Date.now()}-${++cmdSeq}`;

async function api<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Ledger API ${path} failed (HTTP ${res.status}): ${text}`);
  return (text ? JSON.parse(text) : {}) as T;
}

const lastSegment = (templateId: unknown) => String(templateId).split(':').pop() ?? '?';

/** Active contracts visible to `party`, filtered to CloakRFQ templates. */
export async function listActive(party: string): Promise<Contract[]> {
  if (!party) return [];
  const end = await fetch('/v2/state/ledger-end').then((r) => r.json());
  const entries = await api<any[]>('/v2/state/active-contracts', {
    filter: { filtersByParty: { [party]: { cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }] } } },
    verbose: false,
    activeAtOffset: end.offset,
  });
  const out: Contract[] = [];
  for (const e of entries) {
    const ce = e?.contractEntry?.JsActiveContract?.createdEvent;
    if (!ce) continue;
    const template = lastSegment(ce.templateId);
    if (!KNOWN.includes(template)) continue;
    out.push({ contractId: ce.contractId, template, args: (ce.createArgument ?? {}) as Record<string, unknown> });
  }
  return out;
}

// ---- transaction log (a lightweight on-ledger activity feed / explorer) ----
export interface TxEvent { kind: 'created' | 'archived'; template: string; contractId: string }
export interface LedgerTx {
  updateId: string; offset: number; recordTime: string; commandId: string;
  actAs: string; label: string; events: TxEvent[];
}
const txLog: LedgerTx[] = [];
const txListeners = new Set<() => void>();
let txVersion = 0;
export const subscribeTx = (cb: () => void): (() => void) => { txListeners.add(cb); return () => { txListeners.delete(cb); }; };
export const getTxLog = (): LedgerTx[] => txLog;
export const getTxVersion = (): number => txVersion;
export const partyLabel = (id: string): string => (id ? id.split('::')[0] : id) || id;

interface TxResult { created: { template: string; contractId: string }[]; tx: LedgerTx }

async function submit(actAs: string, command: unknown, prefix: string, label = 'Transaction'): Promise<TxResult> {
  const res = await api<any>('/v2/commands/submit-and-wait-for-transaction', {
    commands: { commands: [command], commandId: nextCommandId(prefix), actAs: [actAs], userId: cfg.userId },
  });
  const t = res.transaction ?? {};
  const events: TxEvent[] = [];
  const created: TxResult['created'] = [];
  for (const ev of t.events ?? []) {
    if (ev.CreatedEvent) {
      const template = lastSegment(ev.CreatedEvent.templateId);
      events.push({ kind: 'created', template, contractId: ev.CreatedEvent.contractId });
      created.push({ template, contractId: ev.CreatedEvent.contractId });
    } else if (ev.ArchivedEvent) {
      events.push({ kind: 'archived', template: lastSegment(ev.ArchivedEvent.templateId), contractId: ev.ArchivedEvent.contractId });
    }
  }
  const tx: LedgerTx = {
    updateId: String(t.updateId ?? ''), offset: Number(t.offset ?? 0), recordTime: String(t.recordTime ?? ''),
    commandId: String(t.commandId ?? ''), actAs, label, events,
  };
  txLog.unshift(tx);
  txVersion += 1;
  txListeners.forEach((cb) => cb());
  return { created, tx };
}

const create = (name: string, createArguments: Record<string, unknown>) => ({ CreateCommand: { templateId: tpl(name), createArguments } });
const exercise = (name: string, contractId: string, choice: string, choiceArgument: Record<string, unknown> = {}) =>
  ({ ExerciseCommand: { templateId: tpl(name), contractId, choice, choiceArgument } });

/** Create `name` as `party`; returns the new contractId. `label` names the tx in the activity feed. */
export async function createAs(party: string, name: string, args: Record<string, unknown>, label?: string): Promise<string> {
  const r = await submit(party, create(name, args), 'create', label ?? `Create ${name}`);
  return r.created.find((c) => c.template === name)?.contractId ?? '';
}

/** Exercise `choice` on a contract as `party`; returns the created contracts. */
export async function exerciseAs(party: string, name: string, contractId: string, choice: string, arg: Record<string, unknown> = {}, label?: string): Promise<{ template: string; contractId: string }[]> {
  const r = await submit(party, exercise(name, contractId, choice, arg), 'exercise', label ?? `${choice} · ${name}`);
  return r.created;
}

/** Re-fetch a transaction from the ledger by updateId — proves the entry is authoritative on-chain. */
export async function fetchUpdateById(updateId: string, party: string): Promise<Record<string, unknown> | null> {
  try {
    const r = await api<any>('/v2/updates/update-by-id', {
      updateId,
      updateFormat: { includeTransactions: { eventFormat: { filtersByParty: { [party]: { cumulative: [{ identifierFilter: { WildcardFilter: { value: {} } } }] } }, verbose: false }, transactionShape: 'TRANSACTION_SHAPE_ACS_DELTA' } },
    });
    return r?.update?.Transaction?.value ?? null;
  } catch {
    return null;
  }
}

// dig the transaction object (updateId + events) out of a nested /v2/updates item
function digTx(o: unknown): Record<string, unknown> | null {
  if (o && typeof o === 'object') {
    const r = o as Record<string, unknown>;
    if (r.updateId && r.events) return r;
    for (const k of Object.keys(r)) { const f = digTx(r[k]); if (f) return f; }
  }
  return null;
}
function labelForEvents(events: TxEvent[]): string {
  const c = events.filter((e) => e.kind === 'created').map((e) => e.template);
  const a = events.filter((e) => e.kind === 'archived').map((e) => e.template);
  if (c.includes('ReceivableSaleSettlement')) return 'Accept & settle · receivable sold';
  if (c.includes('PrivateQuote')) return 'Submit private quote';
  if (c.includes('MockSettlementFactory')) return 'Prepare settlement';
  if (c.includes('MockFundingAllocation')) return 'Lock funding';
  if (c.includes('Receivable') && a.includes('Receivable')) return 'Transfer receivable';
  if (c.includes('RFQRequest')) return 'Open RFQ · per-Funder request';
  if (c.includes('ComplianceCertificate')) return 'Derive Compliance certificate';
  if (c.includes('RiskCertificate')) return 'Derive Risk certificate';
  if (c.includes('ComplianceAttestation')) return 'Compliance attestation';
  if (c.includes('RiskAttestation')) return 'Risk attestation';
  if (c.includes('Receivable')) return 'Register Receivable';
  if (c.length && !a.length) return 'Create ' + c.join(', ');
  if (a.length) return `${a.join(', ')} archived` + (c.length ? ' · +' + c.join(', ') : '');
  return 'Transaction';
}

/** Full, persistent transaction history for `party` from the ledger's update stream
 *  (survives reloads — unlike the in-session tx log). Most-recent first. */
export async function fetchHistory(party: string): Promise<LedgerTx[]> {
  if (!party) return [];
  const end = await fetch('/v2/state/ledger-end').then((r) => r.json());
  const arr = await api<unknown[]>('/v2/updates/flats', {
    beginExclusive: 0, endInclusive: end.offset,
    filter: { filtersByParty: { [party]: { cumulative: [{ identifierFilter: { WildcardFilter: { value: { includeCreatedEventBlob: false } } } }] } } },
    verbose: false,
  });
  const out: LedgerTx[] = [];
  for (const item of arr) {
    const tx = digTx(item);
    if (!tx) continue;
    const events: TxEvent[] = [];
    for (const e of (tx.events as Record<string, { templateId: unknown; contractId: string }>[]) ?? []) {
      const ev = e as Record<string, { templateId: unknown; contractId: string }>;
      if (ev.CreatedEvent) events.push({ kind: 'created', template: lastSegment(ev.CreatedEvent.templateId), contractId: ev.CreatedEvent.contractId });
      else if (ev.ArchivedEvent) events.push({ kind: 'archived', template: lastSegment(ev.ArchivedEvent.templateId), contractId: ev.ArchivedEvent.contractId });
    }
    out.push({ updateId: String(tx.updateId), offset: Number(tx.offset), recordTime: String(tx.recordTime ?? ''), commandId: String(tx.commandId ?? ''), actAs: '', label: labelForEvents(events), events });
  }
  return out.sort((x, y) => y.offset - x.offset);
}

// ============================================================================
// PHASE 1 DEMO SCENARIO — edit these values to change what seedDemo() creates.
// Mirrors ledger/test/daml/CloakRFQ/Test.daml (the values the phase1 script proves).
//
// Workflow: Seller registers a Receivable → Compliance issues a
// ComplianceAttestation and the Seller derives a ComplianceCertificate → Risk
// issues a RiskAttestation and the Seller derives a RiskCertificate → the Seller
// creates one RFQRequest per Funder (each Funder sees only its own request).
//
// Contract-enforced constraints: payableAmount > 0 (hasValidReceivableTerms),
// registrar == owner, and CreateComplianceCertificate asserts both
// sellerEligible && rfqEligible. riskTier ∈ LowRisk|MediumRisk|HighRisk.
// JSON encoding: Decimal/Int → string, Date → "YYYY-MM-DD", Time → RFC3339,
// Optional None → null, enums → constructor-name string, records → nested objects.
// ============================================================================
export type RiskTier = 'LowRisk' | 'MediumRisk' | 'HighRisk';

export interface ReceivableTerms { payableAmount: string; currency: string; issueDate: string; dueDate: string; paymentTerms: string }
export interface IdentityDisclosure { legalName: string; jurisdiction: string; entityType: string }

export interface Phase1Scenario {
  packageId: string;
  receivable: {
    invoiceId: string;
    buyerReference: string | null;
    purchaseOrderReference: string | null;
    sourceSystemReference: string | null;
    debtorName: string;
    terms: ReceivableTerms;
  };
  sellerIdentity: IdentityDisclosure;
  debtorIdentity: IdentityDisclosure;
  compliance: {
    transactionPurpose: string; disclosureRestrictions: string;
    sellerEligible: boolean; rfqEligible: boolean;
    policyVersion: string; certificationScope: string;
  };
  risk: { riskTier: RiskTier; riskPolicyVersion: string; certificationScope: string };
  rfq: { responseDeadline: string; funders: Role[]; paymentInstrumentId: string };
}

// Phase 2/3 quote data. QuoteTerms mirrors CloakRFQ.Lib.Quote.
export type RecourseModel = 'WithRecourse' | 'WithoutRecourse';
export interface QuoteTerms {
  netPurchasePrice: string;          // Decimal → string
  recourseModel: RecourseModel;
  debtorNotificationRequired: boolean;
  quoteExpiresAt: string;            // Time → RFC3339
}

// The contract requires quoting BEFORE the response deadline and settling AFTER it.
// Demo-only short window: real RFQ response windows can run for days or weeks.
export const QUOTE_WINDOW_SECONDS = 150;
/** ISO time `secs` seconds from now (client clock ≈ ledger clock on DevNet). */
export const isoFromNow = (secs: number): string => new Date(Date.now() + secs * 1000).toISOString();

export const SCENARIO: Phase1Scenario = {
  packageId: 'PKG-INV-4471',
  receivable: {
    invoiceId: 'INV-4471',
    buyerReference: 'AP-DEPT-42',
    purchaseOrderReference: 'PO-98776',
    sourceSystemReference: 'NETSUITE-AR-10031',
    debtorName: 'Meridian Retail Group',
    terms: { payableAmount: '480000.0', currency: 'USD', issueDate: '2026-01-01', dueDate: '2026-02-15', paymentTerms: 'Net 45' },
  },
  sellerIdentity: { legalName: 'Aster Components LLC', jurisdiction: 'US-DE', entityType: 'Limited liability company' },
  debtorIdentity: { legalName: 'Meridian Retail Group', jurisdiction: 'US-NY', entityType: 'Corporation' },
  compliance: {
    transactionPurpose: 'Receivable sale RFQ for working capital',
    disclosureRestrictions: 'Package disclosure limited to the invited Funder for this request',
    sellerEligible: true, rfqEligible: true,
    policyVersion: 'MVP-COMPLIANCE-v1', certificationScope: 'Phase 1 RFQ package eligibility',
  },
  risk: { riskTier: 'LowRisk', riskPolicyVersion: 'MVP-RISK-v1', certificationScope: 'Phase 1 receivable risk tier' },
  rfq: { responseDeadline: '2026-07-01T12:00:00Z', funders: ['funderA', 'funderB', 'funderC'], paymentInstrumentId: 'USD' },
};

// Command builders for the Phase 1 workflow — each mirrors a Test.daml step and is
// reused by both seedDemo() (below) and the manual origination flow (store.tsx).
export const receivableArgs = (registrar: string, s: Phase1Scenario) => ({
  registrar, owner: registrar, newOwner: registrar,
  metadata: {
    invoiceId: s.receivable.invoiceId,
    buyerReference: s.receivable.buyerReference,
    purchaseOrderReference: s.receivable.purchaseOrderReference,
    sourceSystemReference: s.receivable.sourceSystemReference,
  },
  debtorName: s.receivable.debtorName,
  terms: s.receivable.terms,
});

export const complianceAttestationArgs = (complianceParty: string, seller: string, receivableCid: string, s: Phase1Scenario) => ({
  complianceParty, seller, packageId: s.packageId, receivableCid,
  complianceDisclosure: {
    sellerIdentity: s.sellerIdentity, debtorIdentity: s.debtorIdentity,
    receivableTerms: s.receivable.terms,
    transactionPurpose: s.compliance.transactionPurpose,
    disclosureRestrictions: s.compliance.disclosureRestrictions,
  },
  complianceResult: { sellerEligible: s.compliance.sellerEligible, rfqEligible: s.compliance.rfqEligible },
});

export const riskAttestationArgs = (riskAssessor: string, seller: string, receivableCid: string, s: Phase1Scenario) => ({
  riskAssessor, seller, packageId: s.packageId, receivableCid,
  riskDisclosure: { receivableTerms: s.receivable.terms },
  riskResult: { riskTier: s.risk.riskTier },
});

export const packageDataArgs = (tokenAdmin: string, s: Phase1Scenario) => ({
  receivableTerms: s.receivable.terms,
  riskTier: s.risk.riskTier,
  responseDeadline: s.rfq.responseDeadline,
  paymentInstrumentAdmin: tokenAdmin,
  paymentInstrumentId: s.rfq.paymentInstrumentId,
});

export const rfqRequestArgs = (
  seller: string, funder: string, complianceParty: string, riskAssessor: string, tokenAdmin: string,
  receivableCid: string, complianceCertificateCid: string, riskCertificateCid: string, s: Phase1Scenario,
) => ({
  seller, funder, complianceParty, riskAssessor,
  packageId: s.packageId, receivableCid,
  packageData: packageDataArgs(tokenAdmin, s),
  complianceCertificateCid, riskCertificateCid,
});

// Phase 2/3 command builders.
export const mockFundingAllocationArgs = (
  funder: string, seller: string, tokenAdmin: string, packageId: string,
  amount: string, instrumentId: string, settlementDeadline: string, createdAt: string,
) => ({ funder, seller, tokenAdmin, packageId, amount, instrumentId, settlementDeadline, createdAt });

export const mockSettlementFactoryArgs = (tokenAdmin: string, seller: string) => ({ tokenAdmin, seller });

const firstCid = (r: TxResult, template: string) => r.created.find((c) => c.template === template)!.contractId;

let seedingPromise: Promise<void> | null = null;

/** Seed the Phase 1 origination workflow end-to-end. Guarded so React StrictMode
 *  double-mounts (dev) or a double-click can't create duplicate contracts; a failed
 *  seed clears the guard. */
export function seedDemo(): Promise<void> {
  if (!seedingPromise) seedingPromise = doSeed().catch((e) => { seedingPromise = null; throw e; });
  return seedingPromise;
}

async function doSeed(): Promise<void> {
  const p = cfg.parties;
  const s = SCENARIO;
  // Idempotent against the append-only ledger: if requests already exist, do nothing.
  const existing = await listActive(p.seller);
  if (existing.some((c) => c.template === 'RFQRequest')) return;

  // 1. Seller self-registers the Receivable (registrar == owner).
  const rcv = await submit(p.seller, create('Receivable', receivableArgs(p.seller, s)), 'seed');
  const rcvCid = firstCid(rcv, 'Receivable');

  // 2. Compliance issues an attestation; 3. Seller derives the certificate.
  const att = await submit(p.compliance, create('ComplianceAttestation', complianceAttestationArgs(p.compliance, p.seller, rcvCid, s)), 'seed');
  const compCert = await submit(p.seller, exercise('ComplianceAttestation', firstCid(att, 'ComplianceAttestation'), 'CreateComplianceCertificate',
    { policyVersion: s.compliance.policyVersion, certificationScope: s.compliance.certificationScope }), 'seed');
  const compCertCid = firstCid(compCert, 'ComplianceCertificate');

  // 4. Risk issues an attestation; 5. Seller derives the certificate.
  const riskAtt = await submit(p.risk, create('RiskAttestation', riskAttestationArgs(p.risk, p.seller, rcvCid, s)), 'seed');
  const riskCert = await submit(p.seller, exercise('RiskAttestation', firstCid(riskAtt, 'RiskAttestation'), 'CreateRiskCertificate',
    { riskPolicyVersion: s.risk.riskPolicyVersion, certificationScope: s.risk.certificationScope }), 'seed');
  const riskCertCid = firstCid(riskCert, 'RiskCertificate');

  // 6. Seller creates one RFQRequest per Funder (each Funder observes only its own).
  for (const role of s.rfq.funders) {
    await submit(p.seller, create('RFQRequest', rfqRequestArgs(p.seller, p[role], p.compliance, p.risk, p.tokenAdmin, rcvCid, compCertCid, riskCertCid, s)), 'seed');
  }
}
