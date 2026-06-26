'use client';

/**
 * CloakRFQ Receipts — demo state engine.
 *
 * Ported from the CloakRFQ.dc.html prototype (the visual + UX source of truth).
 * One Receivable Sale RFQ, seven Canton-party roles. Each role reads the SAME
 * state but is entitled to a different slice — selective disclosure. All data is
 * placeholder; in the real app each role view is backed by a Daml contract view.
 */

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PartyRole } from './types';

export type Role = PartyRole;
export type Phase = 'quoting' | 'selected' | 'settling' | 'failed' | 'settled';

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
  { key: 'D', label: 'OX-2', name: 'Onyx Partners', net: '$470,000', fees: '$0', disc: '2.08%', netNum: 470000, advPctNum: 92, adv: '92%', advAmt: '$441,600', reserve: '$38,400', allIn: '$10,000', allInPct: '2.08%', effApr: '≈16.9%', recourse: 'Recourse', settle: 'T+1', disclosure: 'Full file + audited accounts', dLevel: 'High', dColor: '#f0795f', dRank: 2, notify: 'Required', expiry: '—', eligible: false },
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

interface State {
  role: Role; phase: Phase; selected: string | null; fallback: string[];
  winner: string | null; settleVia: string | null; funderTab: string;
  quoteEdits: Record<string, QuoteEdit>; draft: Draft | null;
  toast: string | null; toastColor: string;
  walletState: WalletState; walletMenuOpen: boolean;
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
    role: 'seller', phase: 'quoting', selected: null, fallback: [], winner: null,
    settleVia: null, funderTab: 'B', quoteEdits: {}, draft: null, toast: null, toastColor: '#57e3a0',
    walletState: 'disconnected', walletMenuOpen: false,
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);

  const toast = useCallback((msg: string, color = '#57e3a0') => {
    timers.current.forEach(clearTimeout);
    setState((s) => ({ ...s, toast: msg, toastColor: color }));
    timers.current.push(setTimeout(() => setState((s) => ({ ...s, toast: null })), 2600));
  }, []);

  const qByKey = useCallback((k: string): Quote => {
    const base = Q.find((q) => q.key === k)!;
    return { ...base, ...(state.quoteEdits[k] || {}) };
  }, [state.quoteEdits]);

  const resolvedQ = useMemo(() => Q.map((q) => ({ ...q, ...(state.quoteEdits[q.key] || {}) })), [state.quoteEdits]);
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
    const dl = DLEVELS.find((x) => x.dLevel === d.dLevel) || DLEVELS[0];
    const edit: QuoteEdit = { ...calc(d.net, d.advPct), recourse: d.recourse, settle: d.settle, notify: d.notify, disclosure: dl.disclosure, dLevel: dl.dLevel, dColor: dl.dColor, dRank: dl.dRank };
    setState((s) => ({ ...s, quoteEdits: { ...s.quoteEdits, [ft]: edit }, draft: null }));
    toast('Private Quote submitted to RFQ-4471 — hidden from competing Funders', '#57e3a0');
  }, [state.funderTab, curDraft, toast]);

  const onSelect = useCallback((key: string) => {
    if (state.phase !== 'quoting') return;
    const others = eligible.filter((q) => q.key !== key).sort((a, b) => a.dRank - b.dRank).map((q) => q.key);
    patch({ phase: 'selected', selected: key, fallback: others });
    toast('Selected ' + qByKey(key).name + ' as Best Compliant Quote', '#57e3a0');
  }, [state.phase, eligible, qByKey, patch, toast]);

  const moveFb = useCallback((key: string, dir: number) => {
    setState((s) => {
      const fb = [...s.fallback];
      const i = fb.indexOf(key), j = i + dir;
      if (j < 0 || j >= fb.length) return s;
      [fb[i], fb[j]] = [fb[j], fb[i]];
      return { ...s, fallback: fb };
    });
  }, []);

  const onSettle = useCallback(() => {
    const k = state.selected;
    patch({ phase: 'settling', settleVia: k });
    timers.current.push(setTimeout(() => {
      patch({ phase: 'settled', winner: k, settleVia: null });
      toast('Settled atomically with ' + qByKey(k!).name, '#57e3a0');
    }, 1600));
  }, [state.selected, qByKey, patch, toast]);

  const onFail = useCallback(() => { patch({ phase: 'failed' }); toast('Commitment Failure on Selected Quote', '#f0795f'); }, [patch, toast]);

  const onPromote = useCallback(() => {
    setState((s) => {
      const k = s.fallback[0];
      timers.current.push(setTimeout(() => {
        patch({ phase: 'settled', winner: k, settleVia: null });
        toast('Fallback promoted — settled with ' + qByKey(k).name, '#e8c15f');
      }, 1600));
      return { ...s, phase: 'settling', settleVia: k };
    });
  }, [qByKey, patch, toast]);

  const onReset = useCallback(() => patch({ phase: 'quoting', selected: null, fallback: [], winner: null, settleVia: null }), [patch]);

  const walletParty = useCallback((role: Role): WalletParty | null => {
    if (role === 'funder') {
      const q = qByKey(state.funderTab);
      return { name: FUNDER_PARTY_NAMES[state.funderTab], badge: 'Funder · ' + q.label, id: FUNDER_PARTY_IDS[state.funderTab], node: 'participant-funder-pool' };
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
    setRole, setFunderTab, setDraft, submitQuote, onSelect, moveFb, onSettle, onFail, onPromote, onReset,
    walletParty, toggleWalletMenu, closeWalletMenu, connectWallet, disconnectWallet,
  }), [state, qByKey, resolvedQ, eligible, excludedQ, fallbackUsed, curDraft, setRole, setFunderTab, setDraft, submitQuote, onSelect, moveFb, onSettle, onFail, onPromote, onReset, walletParty, toggleWalletMenu, closeWalletMenu, connectWallet, disconnectWallet]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
