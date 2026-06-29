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

/** Load runtime config written by scripts/bootstrap.sh. False if not bootstrapped. */
export async function loadConfig(): Promise<boolean> {
  try {
    const res = await fetch('/ledger-config.json', { cache: 'no-store' });
    if (!res.ok) return false;
    const loaded = await res.json();
    cfg = { ...cfg, ...loaded, parties: { ...EMPTY_PARTIES, ...(loaded.parties ?? {}) } };
    return Boolean(cfg.parties.seller);
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

interface TxResult { created: { template: string; contractId: string }[]; }

async function submit(actAs: string, command: unknown, prefix: string): Promise<TxResult> {
  const res = await api<any>('/v2/commands/submit-and-wait-for-transaction', {
    commands: { commands: [command], commandId: nextCommandId(prefix), actAs: [actAs], userId: cfg.userId },
  });
  const created: TxResult['created'] = [];
  for (const ev of res.transaction?.events ?? []) {
    if (ev.CreatedEvent) created.push({ template: lastSegment(ev.CreatedEvent.templateId), contractId: ev.CreatedEvent.contractId });
  }
  return { created };
}

const create = (name: string, createArguments: Record<string, unknown>) => ({ CreateCommand: { templateId: tpl(name), createArguments } });
const exercise = (name: string, contractId: string, choice: string, choiceArgument: Record<string, unknown> = {}) =>
  ({ ExerciseCommand: { templateId: tpl(name), contractId, choice, choiceArgument } });

/** Seed the canonical demo scenario (Northwind / $480K / VC-7, LC-3, HF-9).
 *  Idempotent-ish: safe to call once after the sandbox is up. */
export async function seedDemo(): Promise<void> {
  const p = cfg.parties;

  await submit(p.compliance, create('ComplianceAttestation',
    { complianceParty: p.compliance, seller: p.seller, subject: 'Seller eligibility', result: 'Eligible' }), 'seed');
  await submit(p.risk, create('RiskAttestation',
    { riskAssessor: p.risk, seller: p.seller, subject: 'Debtor Risk', result: 'BBB+ · Low' }), 'seed');

  const rcv = await submit(p.seller, create('Receivable', {
    seller: p.seller, ref: 'RCV-9F2A', invoiceId: 'INV-4471',
    faceValue: '480000.0', currency: 'USD', daysToDue: '45',
    debtorName: 'Meridian Retail Group', recoursePreference: 'Negotiable',
    settlementPreference: 'T+2', validityVerified: true,
  }), 'seed');
  const rcvCid = rcv.created.find((c) => c.template === 'Receivable')!.contractId;

  await submit(p.seller, exercise('Receivable', rcvCid, 'OpenRFQ', {
    coordinator: p.coordinator, funders: [p.funderA, p.funderB, p.funderC],
    debtorRisk: 'BBB+ · Low', receivableValidity: 'Verified',
  }), 'seed');

  const quote = (funder: string, label: string, price: string, adv: number, recourse: string, settle: string, disc: string, notify: string, expiry: string) =>
    submit(funder, create('PrivateQuote', {
      funder, seller: p.seller, rfqRef: 'RCV-9F2A', funderLabel: label,
      netPurchasePrice: price, advanceRatePct: String(adv), recourse, settlement: settle,
      requiredDisclosure: disc, debtorNotification: notify, quoteExpiry: expiry,
      proofOfFundsPassed: true, complianceEligible: true,
    }), 'seed');

  await quote(p.funderA, 'VC-7', '468000.0', 90, 'Recourse', 'T+1', 'High', 'Required', '18m');
  await quote(p.funderB, 'LC-3', '465200.0', 85, 'NonRecourse', 'T+2', 'Minimal', 'Not required', '22m');
  await quote(p.funderC, 'HF-9', '466800.0', 88, 'Negotiable', 'T+3', 'Medium', 'Required', '12m');
}
