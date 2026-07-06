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
  | 'compliance' | 'risk' | 'coordinator' | 'auditor' | 'outsider';

interface LedgerConfig {
  jsonApiUrl: string;
  packageRef: string;
  userId: string;
  parties: Record<Role, string>;
}

const EMPTY_PARTIES: Record<Role, string> = {
  seller: '', funderA: '', funderB: '', funderC: '',
  compliance: '', risk: '', coordinator: '', auditor: '', outsider: '',
};

let cfg: LedgerConfig = { jsonApiUrl: '', packageRef: '#cloakrfq-ledger', userId: 'cloakrfq', parties: EMPTY_PARTIES };

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
      const s = await fetch(`/api/session?sid=${sid}`, { cache: 'no-store' });
      if (s.ok) {
        const j = await s.json();
        if (j?.parties?.seller) { sessionMode = true; return applyConfig(j); }   // provisioning enabled → per-session parties
      }
    }
    const res = await fetch('/ledger-config.json', { cache: 'no-store' });
    if (!res.ok) return false;
    return applyConfig(await res.json());
  } catch {
    return false;
  }
}

export const getParties = (): Record<Role, string> => cfg.parties;

const tpl = (name: string) => `${cfg.packageRef}:CloakRFQ:${name}`;

const KNOWN: string[] = [
  'Receivable', 'ComplianceAttestation', 'RiskAttestation', 'RFQRequest',
  'PrivateQuote', 'SelectedQuote', 'DemoSettlementAsset', 'SettlementResult',
  'ScopedComplianceReceipt',
];

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
  if (a.includes('SelectedQuote') && c.includes('ScopedComplianceReceipt')) return 'Settle';
  if (a.includes('PrivateQuote') && c.includes('SelectedQuote')) return 'Accept · select quote';
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
// DEMO SCENARIO — edit these values to change what gets seeded on load.
// (Funders can also submit their own quotes live via the Workspace composer.)
//
// Contract-enforced constraints: faceValue > 0, daysToDue >= 0, netPurchasePrice > 0;
// recourse ∈ Recourse|NonRecourse|Negotiable; requiredDisclosure ∈ Minimal|Medium|High.
// A quote with proofOfFundsPassed:false is shown excluded and cannot be selected.
//
// NOTE: the Workspace maps the labels VC-7/LC-3/HF-9 → A/B/C. Prices/terms are safe
// to change freely; if you RENAME a label, also update LABEL_TO_KEY/NAMES in store.tsx.
// ============================================================================
type EnumRecourse = 'Recourse' | 'NonRecourse' | 'Negotiable';
type EnumDisclosure = 'Minimal' | 'Medium' | 'High';
export interface QuoteSpec {
  funder: Role; label: string; netPurchasePrice: string; advanceRatePct: number;
  recourse: EnumRecourse; settlement: string; requiredDisclosure: EnumDisclosure;
  debtorNotification: string; quoteExpiry: string; proofOfFundsPassed: boolean; complianceEligible: boolean;
}
export interface Scenario {
  receivable: { ref: string; invoiceId: string; faceValue: string; currency: string; daysToDue: string; debtorName: string; recoursePreference: EnumRecourse; settlementPreference: string };
  attestations: { compliance: string; risk: string };
  quotes: QuoteSpec[];
}

export const SCENARIOS: Record<string, Scenario> = {
  base: {
    receivable: { ref: 'RCV-9F2A', invoiceId: 'INV-4471', faceValue: '480000.0', currency: 'USD', daysToDue: '45', debtorName: 'Meridian Retail Group', recoursePreference: 'Negotiable', settlementPreference: 'T+2' },
    attestations: { compliance: 'Eligible', risk: 'BBB+ · Low' },
    quotes: [
      { funder: 'funderA', label: 'VC-7', netPurchasePrice: '468000.0', advanceRatePct: 90, recourse: 'Recourse',    settlement: 'T+1', requiredDisclosure: 'High',    debtorNotification: 'Required',     quoteExpiry: '18m', proofOfFundsPassed: true, complianceEligible: true },
      { funder: 'funderB', label: 'LC-3', netPurchasePrice: '465200.0', advanceRatePct: 85, recourse: 'NonRecourse', settlement: 'T+2', requiredDisclosure: 'Minimal', debtorNotification: 'Not required', quoteExpiry: '22m', proofOfFundsPassed: true, complianceEligible: true },
      { funder: 'funderC', label: 'HF-9', netPurchasePrice: '466800.0', advanceRatePct: 88, recourse: 'Negotiable', settlement: 'T+3', requiredDisclosure: 'Medium',  debtorNotification: 'Required',     quoteExpiry: '12m', proofOfFundsPassed: true, complianceEligible: true },
    ],
  },
  // Example variant: VC-7 FAILS the Proof-of-Funds Gate → shown excluded, not selectable.
  stressed: {
    receivable: { ref: 'RCV-9F2A', invoiceId: 'INV-4471', faceValue: '480000.0', currency: 'USD', daysToDue: '30', debtorName: 'Meridian Retail Group', recoursePreference: 'Recourse', settlementPreference: 'T+1' },
    attestations: { compliance: 'Eligible', risk: 'BB · Medium' },
    quotes: [
      { funder: 'funderA', label: 'VC-7', netPurchasePrice: '470000.0', advanceRatePct: 92, recourse: 'Recourse',    settlement: 'T+1', requiredDisclosure: 'High',    debtorNotification: 'Required',     quoteExpiry: '10m', proofOfFundsPassed: false, complianceEligible: true },
      { funder: 'funderB', label: 'LC-3', netPurchasePrice: '462000.0', advanceRatePct: 80, recourse: 'NonRecourse', settlement: 'T+3', requiredDisclosure: 'Minimal', debtorNotification: 'Not required', quoteExpiry: '20m', proofOfFundsPassed: true,  complianceEligible: true },
      { funder: 'funderC', label: 'HF-9', netPurchasePrice: '466000.0', advanceRatePct: 88, recourse: 'Negotiable', settlement: 'T+2', requiredDisclosure: 'Medium',  debtorNotification: 'Required',     quoteExpiry: '14m', proofOfFundsPassed: true,  complianceEligible: true },
    ],
  },
};

/** The scenario seedDemo() uses. Switch to SCENARIOS.stressed — or edit base above. */
export const SCENARIO: Scenario = SCENARIOS.base;

let seedingPromise: Promise<void> | null = null;

/** Seed the active demo scenario. Guarded so React StrictMode double-mounts (dev)
 *  or a double-click can't create duplicate contracts; a failed seed clears the guard. */
export function seedDemo(): Promise<void> {
  if (!seedingPromise) seedingPromise = doSeed().catch((e) => { seedingPromise = null; throw e; });
  return seedingPromise;
}

async function doSeed(): Promise<void> {
  const p = cfg.parties;
  // Idempotent against the ledger: if a scenario is already seeded, do nothing.
  // (The ledger is append-only — to re-seed with new values, restart the sandbox.)
  const existing = await listActive(p.seller);
  if (existing.some((c) => c.template === 'PrivateQuote')) return;
  const s = SCENARIO;

  await submit(p.compliance, create('ComplianceAttestation',
    { complianceParty: p.compliance, seller: p.seller, subject: 'Seller eligibility', result: s.attestations.compliance }), 'seed');
  await submit(p.risk, create('RiskAttestation',
    { riskAssessor: p.risk, seller: p.seller, subject: 'Debtor Risk', result: s.attestations.risk }), 'seed');

  const rcv = await submit(p.seller, create('Receivable', { seller: p.seller, ...s.receivable, validityVerified: true }), 'seed');
  const rcvCid = rcv.created.find((c) => c.template === 'Receivable')!.contractId;

  await submit(p.seller, exercise('Receivable', rcvCid, 'OpenRFQ', {
    coordinator: p.coordinator, funders: [p.funderA, p.funderB, p.funderC],
    debtorRisk: s.attestations.risk, receivableValidity: 'Verified',
  }), 'seed');

  for (const q of s.quotes) {
    const funder = p[q.funder];
    await submit(funder, create('PrivateQuote', {
      funder, seller: p.seller, rfqRef: s.receivable.ref, funderLabel: q.label,
      netPurchasePrice: q.netPurchasePrice, advanceRatePct: String(q.advanceRatePct),
      recourse: q.recourse, settlement: q.settlement, requiredDisclosure: q.requiredDisclosure,
      debtorNotification: q.debtorNotification, quoteExpiry: q.quoteExpiry,
      proofOfFundsPassed: q.proofOfFundsPassed, complianceEligible: q.complianceEligible,
    }), 'seed');
  }
}
