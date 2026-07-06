'use client';

/**
 * CloakRFQ Receipts — Workspace state engine, LIVE-backed.
 *
 * Same role-switcher UI as the prototype, but the data is read from the Canton
 * ledger (via lib/ledger.ts) and the actions issue real Daml commands. Quotes are
 * cached client-side by A/B/C key so the views (qByKey / winner / fallback) work
 * exactly as before even after a quote is archived on settlement.
 *
 * Per-party Canton enforcement is demonstrated on /ledger; here the Seller's view
 * provides the shared deal state and the role switches the lens.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PartyRole } from './types';
import { loadConfig, getParties, listActive, createAs, exerciseAs, type Contract } from './ledger';

export type Role = PartyRole;
export type Phase = 'origination' | 'preRfq' | 'quoting' | 'selected' | 'settling' | 'failed' | 'settled';

export const ROLES: { id: Role; label: string; sub: string }[] = [
  { id: 'seller', label: 'Seller', sub: 'Northwind Components' },
  { id: 'funder', label: 'Funder', sub: 'private quote view' },
  { id: 'compliance', label: 'Compliance', sub: 'eligibility' },
  { id: 'risk', label: 'Risk Assessor', sub: 'risk attestations' },
  { id: 'coordinator', label: 'Coordinator', sub: 'workflow router' },
  { id: 'auditor', label: 'Auditor / Regulator', sub: 'scoped receipt' },
  { id: 'outsider', label: 'Outsider', sub: 'public ledger' },
];

export const LEGEND: Record<Role, { sees: string; hidden: string }> = {
  seller: { sees: 'Receivable, RFQ, full Seller Quote View, selection, fallback, settlement', hidden: 'Raw Funder balances · funding sources · Funder identities (pre-settlement)' },
  funder: { sees: 'Own RFQ Disclosure Package, own Private Quote, own outcome', hidden: 'Competing Private Quotes · other Funder identities · the Quote Book' },
  compliance: { sees: 'Participant & transaction eligibility data; eligibility attestations it issues; Proof-of-Funds Gate status', hidden: 'Private Quote prices & commercial terms · raw underwriting data' },
  risk: { sees: 'Debtor and Receivable risk data needed to attest', hidden: 'Private Quote prices & terms · eligibility decisions · identities beyond risk scope' },
  coordinator: { sees: 'Workflow status, deadlines, party routing', hidden: 'Private Quote contents · prices · terms' },
  auditor: { sees: 'Scoped Compliance Receipt — statuses, references, final outcome', hidden: 'Full RFQ · Quote Book · raw evidence · Unselected Funders' },
  outsider: { sees: 'Nothing useful — opaque archived contracts only', hidden: 'Receivable · RFQ · quotes · identities · settlement detail' },
};

export const RECV = {
  ref: 'RCV-9F2A', invoice: 'INV-4471', face: '$480,000', currency: 'USD',
  due: 'in 45 days · 2026-08-09', recourse: 'Non-recourse pref', validity: 'Verified',
  settlePref: 'T+2', debtor: 'Meridian Retail Group', debtorRisk: 'BBB+ · Low',
};

export const BOUNDARY = [
  { stage: 'Pre-quote', what: 'Attestations only — no raw Debtor identity, no invoice document' },
  { stage: 'On selection', what: 'Debtor identity to Winning Funder only if the quote requires it' },
  { stage: 'Settlement', what: 'Receivable assignment + Demo Settlement Asset transfer, parties only' },
  { stage: 'Audit / Reg', what: 'Scoped Compliance Receipt — never the full RFQ or Quote Book' },
];

export interface Quote {
  key: string; label: string; name: string; net: string; fees: string; disc: string;
  netNum: number; advPctNum: number; adv: string; advAmt: string; reserve: string;
  allIn: string; allInPct: string; effApr: string; recourse: string; settle: string;
  disclosure: string; dLevel: string; dColor: string; dRank: number; notify: string;
  expiry: string; eligible: boolean;
}

export const Q: Quote[] = [
  { key: 'A', label: 'VC-7', name: 'Vanta Credit', net: '$468,000', fees: '$1,200', disc: '2.50%', netNum: 468000, advPctNum: 90, adv: '90%', advAmt: '$432,000', reserve: '$48,000', allIn: '$12,000', allInPct: '2.50%', effApr: '≈20.3%', recourse: 'Recourse', settle: 'T+1', disclosure: 'Debtor identity + payment history', dLevel: 'High', dColor: '#f0795f', dRank: 2, notify: 'Required', expiry: '18m', eligible: true },
  { key: 'B', label: 'LC-3', name: 'Lumen Capital', net: '$465,200', fees: '$900', disc: '3.08%', netNum: 465200, advPctNum: 85, adv: '85%', advAmt: '$408,000', reserve: '$72,000', allIn: '$14,800', allInPct: '3.08%', effApr: '≈25.0%', recourse: 'Non-recourse', settle: 'T+2', disclosure: 'Attestations only', dLevel: 'Minimal', dColor: '#57e3a0', dRank: 0, notify: 'Not required', expiry: '22m', eligible: true },
  { key: 'C', label: 'HF-9', name: 'Harbour Funding', net: '$466,800', fees: '$1,500', disc: '2.75%', netNum: 466800, advPctNum: 88, adv: '88%', advAmt: '$422,400', reserve: '$57,600', allIn: '$13,200', allInPct: '2.75%', effApr: '≈22.3%', recourse: 'Negotiable', settle: 'T+3', disclosure: 'Debtor identity only', dLevel: 'Medium', dColor: '#e8c15f', dRank: 1, notify: 'Required', expiry: '12m', eligible: true },
];

export const DLEVELS = [
  { dLevel: 'Minimal', label: 'Minimal', disclosure: 'Attestations only', dColor: '#57e3a0', dRank: 0 },
  { dLevel: 'Medium', label: 'Debtor ID', disclosure: 'Debtor identity only', dColor: '#e8c15f', dRank: 1 },
  { dLevel: 'High', label: 'Full file', disclosure: 'Debtor identity + payment history', dColor: '#f0795f', dRank: 2 },
];

/* Wallet connector — each role connects as a distinct Canton party (Outsider = non-party Observer). */
export type WalletState = 'disconnected' | 'connecting' | 'connected';
export interface WalletParty { name: string; badge: string; id: string; node: string; }
const WALLET_PARTIES: Record<string, WalletParty> = {
  seller: { name: 'Northwind Components', badge: 'Seller', id: 'Northwind::1220a9f2c41b8e73', node: 'participant-northwind-1' },
  compliance: { name: 'Meridian Compliance', badge: 'Compliance Party', id: 'Compliance::1220c0de4471a2f9', node: 'participant-compliance-1' },
  risk: { name: 'Sentinel Risk', badge: 'Risk Assessor', id: 'RiskAssessor::1220ra22b7f944', node: 'participant-risk-1' },
  coordinator: { name: 'RFQ Coordinator', badge: 'Coordinator', id: 'Coordinator::12204471c0017dab', node: 'participant-coord-1' },
  auditor: { name: 'Regulator Node', badge: 'Auditor / Regulator', id: 'Auditor::1220aud17e55c3b0', node: 'participant-regulator-1' },
};
const FUNDER_PARTY_NAMES: Record<string, string> = { A: 'Vanta Credit', B: 'Lumen Capital', C: 'Harbour Funding' };
const FUNDER_PARTY_IDS: Record<string, string> = { A: 'VantaCredit::1220vc7a0d13c4', B: 'LumenCapital::1220lc3f88a172', C: 'HarbourFund::1220hf90b2de55' };
export function truncParty(id: string): string {
  const i = id.indexOf('::');
  if (i < 0) return id;
  const p = id.slice(0, i), hsh = id.slice(i + 2);
  return p + '::' + hsh.slice(0, 4) + '…' + hsh.slice(-4);
}

const FACE = 480000, DAYS = 45;
export const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export interface Calc { net: string; netNum: number; disc: string; allIn: string; allInPct: string; effApr: string; adv: string; advPctNum: number; advAmt: string; reserve: string; }
export function calc(net: number, advPct: number): Calc {
  const cost = Math.max(0, FACE - net);
  const costPct = cost / FACE;
  const eff = costPct * (365 / DAYS);
  const advAmt = Math.round(FACE * advPct / 100);
  return {
    net: usd(net), netNum: net, disc: (costPct * 100).toFixed(2) + '%',
    allIn: usd(cost), allInPct: (costPct * 100).toFixed(2) + '%', effApr: '≈' + (eff * 100).toFixed(1) + '%',
    adv: advPct + '%', advPctNum: advPct, advAmt: usd(advAmt), reserve: usd(FACE - advAmt),
  };
}

export interface Draft { key: string; net: number; advPct: number; recourse: string; settle: string; dLevel: string; notify: string; }
type QuoteEdit = Partial<Quote>;

/* ---- live <-> UI mapping ---- */
const LABEL_TO_KEY: Record<string, string> = { 'VC-7': 'A', 'LC-3': 'B', 'HF-9': 'C' };
const KEY_TO_LABEL: Record<string, string> = { A: 'VC-7', B: 'LC-3', C: 'HF-9' };
const RECOURSE_UI: Record<string, string> = { Recourse: 'Recourse', NonRecourse: 'Non-recourse', Negotiable: 'Negotiable' };
const UI_RECOURSE: Record<string, string> = { 'Recourse': 'Recourse', 'Non-recourse': 'NonRecourse', 'Negotiable': 'Negotiable' };
const keyOfLabel = (label: string) => LABEL_TO_KEY[label] ?? label;

function quoteFromContract(c: Contract): { q: Quote; funder: string } {
  const a = c.args as Record<string, string>;
  const label = String(a.funderLabel);
  const key = keyOfLabel(label);
  const netNum = parseFloat(a.netPurchasePrice);
  const advPct = parseInt(a.advanceRatePct, 10) || 0;
  const cal = calc(netNum, advPct);
  const dl = DLEVELS.find((d) => d.dLevel === a.requiredDisclosure) ?? DLEVELS[0];
  return {
    funder: String(a.funder),
    q: {
      key, label, name: FUNDER_PARTY_NAMES[key] ?? label,
      net: cal.net, fees: '$0', disc: cal.disc, netNum, advPctNum: advPct,
      adv: cal.adv, advAmt: cal.advAmt, reserve: cal.reserve, allIn: cal.allIn, allInPct: cal.allInPct, effApr: cal.effApr,
      recourse: RECOURSE_UI[a.recourse] ?? a.recourse, settle: a.settlement,
      disclosure: dl.disclosure, dLevel: dl.dLevel, dColor: dl.dColor, dRank: dl.dRank,
      notify: a.debtorNotification, expiry: a.quoteExpiry, eligible: String(a.proofOfFundsPassed) === 'true',
    },
  };
}

/* ---- live origination state (manual flow) ---- */
export interface ReceivableForm {
  ref: string; invoiceId: string; faceValue: number; currency: string; daysToDue: number;
  debtorName: string; recoursePreference: string; settlementPreference: string;
}
export interface ReceivableView extends ReceivableForm { cid: string }
export interface AttView { subject: string; result: string }
const KEY_BY_FUNDER_ROLE: Record<string, string> = { funderA: 'A', funderB: 'B', funderC: 'C' };

interface State {
  role: Role; phase: Phase; selected: string | null; fallback: string[];
  winner: string | null; settleVia: string | null; funderTab: string;
  quoteEdits: Record<string, QuoteEdit>; draft: Draft | null;
  toast: string | null; toastColor: string;
  walletState: WalletState; walletMenuOpen: boolean;
  ready: boolean | null; quotesCache: Record<string, Quote>;
  receivable: ReceivableView | null; rfqOpen: boolean; rfqFunders: string[];
  complianceAtt: AttView | null; riskAtt: AttView | null;
}

interface StoreCtx {
  state: State;
  qByKey: (k: string) => Quote;
  resolvedQ: Quote[];
  eligible: Quote[];
  excludedQ: Quote | undefined;
  fallbackUsed: boolean;
  curDraft: () => Draft;
  setRole: (id: Role) => void;
  setFunderTab: (k: string) => void;
  setDraft: (patch: Partial<Draft>) => void;
  createReceivable: (r: ReceivableForm) => void;
  openRFQ: (funderKeys: string[]) => void;
  issueCompliance: (subject: string, result: string) => void;
  issueRisk: (subject: string, result: string) => void;
  submitQuote: () => void;
  onSelect: (k: string) => void;
  moveFb: (k: string, dir: number) => void;
  onSettle: () => void;
  onFail: () => void;
  onPromote: () => void;
  onReset: () => void;
  walletParty: (role: Role) => WalletParty | null;
  toggleWalletMenu: () => void;
  closeWalletMenu: () => void;
  connectWallet: () => void;
  disconnectWallet: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);
export function useStore(): StoreCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within <StoreProvider>');
  return v;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({
    role: 'seller', phase: 'origination', selected: null, fallback: [], winner: null,
    settleVia: null, funderTab: 'A', quoteEdits: {}, draft: null, toast: null, toastColor: '#57e3a0',
    walletState: 'disconnected', walletMenuOpen: false, ready: null, quotesCache: {},
    receivable: null, rfqOpen: false, rfqFunders: [], complianceAtt: null, riskAtt: null,
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cidByKey = useRef<Record<string, string>>({});
  const funderByKey = useRef<Record<string, string>>({});
  const selectedCid = useRef<string | null>(null);
  const receivableCid = useRef<string | null>(null);
  const viaFb = useRef(false);
  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);

  const toast = useCallback((msg: string, color = '#57e3a0') => {
    timers.current.forEach(clearTimeout);
    setState((s) => ({ ...s, toast: msg, toastColor: color }));
    timers.current.push(setTimeout(() => setState((s) => ({ ...s, toast: null })), 2600));
  }, []);

  // Read the Seller's view → the shared deal state (receivable, RFQ, attestations,
  // quotes, selection, receipt). The Seller observes all of these on-ledger.
  const refreshData = useCallback(async () => {
    const P = getParties();
    const funderKeyByParty: Record<string, string> = { [P.funderA]: 'A', [P.funderB]: 'B', [P.funderC]: 'C' };
    const cs = await listActive(P.seller);
    const fresh: Record<string, Quote> = {};
    let receivable: ReceivableView | null = null;
    let rfqOpen = false; let rfqFunders: string[] = [];
    let complianceAtt: AttView | null = null; let riskAtt: AttView | null = null;
    for (const c of cs) {
      const a = c.args as Record<string, unknown>;
      if (c.template === 'PrivateQuote') {
        const { q, funder } = quoteFromContract(c);
        fresh[q.key] = q; cidByKey.current[q.key] = c.contractId; funderByKey.current[q.key] = funder;
      } else if (c.template === 'Receivable') {
        receivableCid.current = c.contractId;
        receivable = {
          cid: c.contractId, ref: String(a.ref), invoiceId: String(a.invoiceId),
          faceValue: parseFloat(String(a.faceValue)), currency: String(a.currency),
          daysToDue: parseInt(String(a.daysToDue), 10) || 0, debtorName: String(a.debtorName),
          recoursePreference: RECOURSE_UI[String(a.recoursePreference)] ?? String(a.recoursePreference),
          settlementPreference: String(a.settlementPreference),
        };
      } else if (c.template === 'RFQRequest') {
        rfqOpen = true;
        rfqFunders = (Array.isArray(a.funders) ? a.funders : []).map((p) => funderKeyByParty[String(p)]).filter(Boolean);
      } else if (c.template === 'ComplianceAttestation') {
        complianceAtt = { subject: String(a.subject), result: String(a.result) };
      } else if (c.template === 'RiskAttestation') {
        riskAtt = { subject: String(a.subject), result: String(a.result) };
      }
    }
    const sel = cs.find((c) => c.template === 'SelectedQuote');
    selectedCid.current = sel ? sel.contractId : null;
    const rec = cs.find((c) => c.template === 'ScopedComplianceReceipt');
    const selKey = sel ? keyOfLabel(String((sel.args as Record<string, string>).funderLabel)) : null;
    const winKey = rec ? keyOfLabel(String((rec.args as Record<string, string>).winningFunderLabel)) : null;
    // Synthesize the winning quote so the selected/settled view still renders after a
    // page reload — the winner's PrivateQuote is archived on Accept, and the
    // SelectedQuote is archived on the (consuming) Settle. Pre-settle we recover it
    // from the SelectedQuote (has recourse/settlement); post-settle from the
    // SettlementResult + receipt. Advance %/disclosure aren't on-chain there → "—".
    const synth: Record<string, Quote> = {};
    const synthWinner = (wkey: string, label: string, netNum: number, recourse: string, settle: string, notify: string) => {
      const cal = calc(netNum, 0);
      synth[wkey] = {
        key: wkey, label, name: FUNDER_PARTY_NAMES[wkey] ?? label,
        net: usd(netNum), fees: '$0', disc: cal.disc, netNum, advPctNum: 0,
        adv: '—', advAmt: '—', reserve: '—', allIn: cal.allIn, allInPct: cal.allInPct, effApr: cal.effApr,
        recourse, settle, disclosure: '—', dLevel: '—', dColor: '#9aa1ad', dRank: 0,
        notify, expiry: '—', eligible: true,
      };
    };
    if (sel) {
      const a = sel.args as Record<string, string>;
      synthWinner(keyOfLabel(String(a.funderLabel)), String(a.funderLabel), parseFloat(String(a.netPurchasePrice)),
        RECOURSE_UI[String(a.recourse)] ?? String(a.recourse), String(a.settlement), String(a.debtorNotification));
    } else if (rec) {
      const ra = rec.args as Record<string, string>;
      const sr = cs.find((c) => c.template === 'SettlementResult');
      const netNum = sr ? parseFloat(String((sr.args as Record<string, string>).netPurchasePrice)) : 0;
      synthWinner(keyOfLabel(String(ra.winningFunderLabel)), String(ra.winningFunderLabel), netNum, '—', '—', String(ra.debtorNotification));
    }
    setState((s) => ({
      ...s,
      quotesCache: { ...synth, ...s.quotesCache, ...fresh },
      quoteEdits: { ...s.quoteEdits, ...Object.fromEntries(Object.keys(fresh).map((k) => [k, {} as QuoteEdit])) },
      receivable, rfqOpen, rfqFunders, complianceAtt, riskAtt,
    }));
    return {
      selKey, winKey, settled: !!rec, selectedExists: !!sel,
      hasQuotes: Object.keys(fresh).length > 0, hasReceivable: !!receivable, rfqOpen,
    };
  }, []);

  // Derive the workflow phase from live contracts.
  const phaseFrom = (r: { settled: boolean; selectedExists: boolean; rfqOpen: boolean; hasReceivable: boolean }): Phase =>
    r.settled ? 'settled' : r.selectedExists ? 'selected' : r.rfqOpen ? 'quoting' : r.hasReceivable ? 'preRfq' : 'origination';

  // Initial load: config → read live state → derive starting phase (fully manual,
  // no pre-seeding — the deal is built by hand through the role views).
  useEffect(() => { (async () => {
    const ok = await loadConfig();
    if (!ok) { patch({ ready: false }); return; }
    const r = await refreshData();
    patch({ ready: true, phase: phaseFrom(r), selected: r.selKey ?? null, winner: r.winKey ?? null });
  })(); }, [refreshData, patch]);

  const qByKey = useCallback((k: string): Quote => state.quotesCache[k] ?? Q.find((q) => q.key === k) ?? Q[0], [state.quotesCache]);
  const resolvedQ = useMemo(() => Object.values(state.quotesCache).sort((a, b) => a.key.localeCompare(b.key)), [state.quotesCache]);
  const eligible = useMemo(() => resolvedQ.filter((q) => q.eligible), [resolvedQ]);
  const excludedQ = useMemo(() => resolvedQ.find((q) => !q.eligible), [resolvedQ]);
  const fallbackUsed = !!(state.winner && state.selected && state.winner !== state.selected);

  const makeDraft = useCallback((k: string): Draft => {
    const q = qByKey(k);
    return { key: k, net: q.netNum, advPct: q.advPctNum, recourse: q.recourse, settle: q.settle, dLevel: q.dLevel, notify: q.notify };
  }, [qByKey]);
  const curDraft = useCallback((): Draft => {
    const d = state.draft;
    return d && d.key === state.funderTab ? d : makeDraft(state.funderTab);
  }, [state.draft, state.funderTab, makeDraft]);

  const setRole = useCallback((id: Role) => patch({ role: id }), [patch]);
  const setFunderTab = useCallback((k: string) => patch({ funderTab: k }), [patch]);
  const setDraft = useCallback((p: Partial<Draft>) =>
    setState((s) => {
      const d = s.draft && s.draft.key === s.funderTab ? s.draft : makeDraft(s.funderTab);
      return { ...s, draft: { ...d, ...p, key: s.funderTab } };
    }), [makeDraft]);

  const submitQuote = useCallback(() => {
    const ft = state.funderTab;
    const d = curDraft();
    toast('Submitting Private Quote…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        const funder = P[('funder' + ft) as 'funderA' | 'funderB' | 'funderC'];
        await createAs(funder, 'PrivateQuote', {
          funder, seller: P.seller, rfqRef: state.receivable?.ref ?? 'RFQ', funderLabel: KEY_TO_LABEL[ft] ?? ('F-' + ft),
          netPurchasePrice: d.net.toFixed(1), advanceRatePct: String(d.advPct),
          recourse: UI_RECOURSE[d.recourse] ?? d.recourse, settlement: d.settle,
          requiredDisclosure: d.dLevel, debtorNotification: d.notify, quoteExpiry: '—',
          proofOfFundsPassed: true, complianceEligible: true,
        });
        await refreshData();
        setState((s) => ({ ...s, draft: null }));
        toast('Private Quote submitted — hidden from competing Funders', '#57e3a0');
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [state.funderTab, state.receivable, curDraft, toast, refreshData]);

  // ---- origination (manual flow) ----
  const createReceivable = useCallback((r: ReceivableForm) => {
    toast('Creating Receivable…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        await createAs(P.seller, 'Receivable', {
          seller: P.seller, ref: r.ref, invoiceId: r.invoiceId, faceValue: r.faceValue.toFixed(1),
          currency: r.currency, daysToDue: String(r.daysToDue), debtorName: r.debtorName,
          recoursePreference: UI_RECOURSE[r.recoursePreference] ?? r.recoursePreference,
          settlementPreference: r.settlementPreference, validityVerified: true,
        });
        const d = await refreshData();
        patch({ phase: phaseFrom(d) });
        toast('Receivable created — private to you', '#57e3a0');
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [patch, toast, refreshData]);

  const openRFQ = useCallback((funderKeys: string[]) => {
    toast('Opening Blind RFQ…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        const funders = funderKeys.map((k) => P[('funder' + k) as 'funderA' | 'funderB' | 'funderC']);
        await exerciseAs(P.seller, 'Receivable', receivableCid.current!, 'OpenRFQ', {
          coordinator: P.coordinator, funders,
          debtorRisk: state.riskAtt?.result ?? 'Unrated',
          receivableValidity: state.complianceAtt ? 'Verified' : 'Unverified',
        });
        const d = await refreshData();
        patch({ phase: phaseFrom(d), funderTab: funderKeys[0] ?? 'A' });
        toast('Blind RFQ opened — attestation-first, no raw Debtor identity', '#57e3a0');
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [state.riskAtt, state.complianceAtt, patch, toast, refreshData]);

  const issueCompliance = useCallback((subject: string, result: string) => {
    toast('Issuing Compliance Attestation…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        await createAs(P.compliance, 'ComplianceAttestation', { complianceParty: P.compliance, seller: P.seller, subject, result });
        await refreshData();
        toast('Compliance Attestation issued', '#57e3a0');
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [toast, refreshData]);

  const issueRisk = useCallback((subject: string, result: string) => {
    toast('Issuing Risk Attestation…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        await createAs(P.risk, 'RiskAttestation', { riskAssessor: P.risk, seller: P.seller, subject, result });
        await refreshData();
        toast('Risk Attestation issued', '#57e3a0');
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [toast, refreshData]);

  const onSelect = useCallback((key: string) => {
    if (state.phase !== 'quoting') return;
    const others = eligible.filter((q) => q.key !== key).sort((a, b) => a.dRank - b.dRank).map((q) => q.key);
    viaFb.current = false;
    patch({ phase: 'selected', selected: key, fallback: others });
    toast('Selecting ' + qByKey(key).name + '…', '#57e3a0');
    (async () => {
      try { await exerciseAs(getParties().seller, 'PrivateQuote', cidByKey.current[key], 'Accept', {}); await refreshData(); toast('Selected ' + qByKey(key).name + ' as Best Compliant Quote', '#57e3a0'); }
      catch (e) { toast(String(e), '#f0795f'); patch({ phase: 'quoting', selected: null, fallback: [] }); }
    })();
  }, [state.phase, eligible, qByKey, patch, toast, refreshData]);

  const moveFb = useCallback((key: string, dir: number) => {
    setState((s) => {
      const fb = [...s.fallback];
      const i = fb.indexOf(key), j = i + dir;
      if (j < 0 || j >= fb.length) return s;
      [fb[i], fb[j]] = [fb[j], fb[i]];
      return { ...s, fallback: fb };
    });
  }, []);

  const settleKey = useCallback(async (key: string, fb: boolean) => {
    const P = getParties();
    const q = qByKey(key);
    const funder = funderByKey.current[key];
    const assetCid = await createAs(funder, 'DemoSettlementAsset', { owner: funder, amount: q.netNum.toFixed(1) });
    await exerciseAs(funder, 'SelectedQuote', selectedCid.current!, 'Settle', { funderAssetCid: assetCid, auditor: P.auditor, viaFallback: fb });
    await refreshData();
  }, [qByKey, refreshData]);

  const onSettle = useCallback(() => {
    const k = state.selected; if (!k) return;
    patch({ phase: 'settling', settleVia: k });
    (async () => {
      try { await settleKey(k, viaFb.current); patch({ phase: 'settled', winner: k, settleVia: null }); toast('Settled atomically with ' + qByKey(k).name, '#57e3a0'); }
      catch (e) { toast(String(e), '#f0795f'); patch({ phase: 'selected', settleVia: null }); }
    })();
  }, [state.selected, qByKey, patch, toast, settleKey]);

  const onFail = useCallback(() => {
    patch({ phase: 'failed' });
    toast('Commitment Failure on Selected Quote', '#f0795f');
    (async () => {
      try { await exerciseAs(getParties().seller, 'SelectedQuote', selectedCid.current!, 'Fail', {}); await refreshData(); }
      catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [patch, toast, refreshData]);

  const onPromote = useCallback(() => {
    const k = state.fallback[0]; if (!k) return;
    viaFb.current = true;
    patch({ phase: 'settling', settleVia: k });
    (async () => {
      try {
        await exerciseAs(getParties().seller, 'PrivateQuote', cidByKey.current[k], 'Accept', {});
        await refreshData();
        await settleKey(k, true);
        patch({ phase: 'settled', winner: k, settleVia: null });
        toast('Fallback promoted — settled with ' + qByKey(k).name, '#e8c15f');
      } catch (e) { toast(String(e), '#f0795f'); patch({ phase: 'failed', settleVia: null }); }
    })();
  }, [state.fallback, qByKey, patch, toast, refreshData, settleKey]);

  const onReset = useCallback(() => {
    toast('Reloading from ledger…', '#9aa1ad');
    (async () => {
      const r = await refreshData();
      patch({ phase: phaseFrom(r), selected: r.selKey ?? null, winner: r.winKey ?? null, fallback: [], settleVia: null });
    })();
  }, [refreshData, patch, toast]);

  const walletParty = useCallback((role: Role): WalletParty | null => {
    if (role === 'funder') {
      const q = qByKey(state.funderTab);
      return { name: FUNDER_PARTY_NAMES[state.funderTab] ?? q.name, badge: 'Funder · ' + q.label, id: FUNDER_PARTY_IDS[state.funderTab] ?? '', node: 'participant-funder-pool' };
    }
    if (role === 'outsider') return null;
    return WALLET_PARTIES[role] ?? null;
  }, [qByKey, state.funderTab]);

  const toggleWalletMenu = useCallback(() => setState((s) => ({ ...s, walletMenuOpen: !s.walletMenuOpen })), []);
  const closeWalletMenu = useCallback(() => patch({ walletMenuOpen: false }), [patch]);
  const connectWallet = useCallback(() => {
    patch({ walletState: 'connecting', walletMenuOpen: false });
    timers.current.push(setTimeout(() => { patch({ walletState: 'connected' }); toast('Wallet connected — acting as a scoped party on Canton Devnet', '#57e3a0'); }, 1100));
  }, [patch, toast]);
  const disconnectWallet = useCallback(() => { patch({ walletState: 'disconnected', walletMenuOpen: false }); toast('Wallet disconnected', '#9aa1ad'); }, [patch, toast]);

  const value = useMemo<StoreCtx>(() => ({
    state, qByKey, resolvedQ, eligible, excludedQ, fallbackUsed, curDraft,
    setRole, setFunderTab, setDraft, createReceivable, openRFQ, issueCompliance, issueRisk,
    submitQuote, onSelect, moveFb, onSettle, onFail, onPromote, onReset,
    walletParty, toggleWalletMenu, closeWalletMenu, connectWallet, disconnectWallet,
  }), [state, qByKey, resolvedQ, eligible, excludedQ, fallbackUsed, curDraft, setRole, setFunderTab, setDraft, createReceivable, openRFQ, issueCompliance, issueRisk, submitQuote, onSelect, moveFb, onSettle, onFail, onPromote, onReset, walletParty, toggleWalletMenu, closeWalletMenu, connectWallet, disconnectWallet]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
