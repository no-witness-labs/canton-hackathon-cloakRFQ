'use client';

/**
 * CloakRFQ — Workspace state engine, LIVE-backed (Phase 1 origination).
 *
 * The role-switcher UI reads live contracts from the Canton ledger (lib/ledger.ts)
 * and issues real Daml commands for Mazen's Phase 1 workflow:
 *
 *   1. Seller self-registers a Receivable (registrar == owner).
 *   2. Compliance issues a ComplianceAttestation (disclosure + eligibility result).
 *   3. Risk issues a RiskAttestation (risk tier).
 *   4. Seller opens the RFQ: derives a ComplianceCertificate + RiskCertificate from
 *      the attestations, then creates one RFQRequest per invited Funder.
 *
 * Phase 1 ends there — quoting, selection and settlement are Phase 2/3 and are not
 * on the ledger yet. Per-party Canton enforcement (each Funder sees only its own
 * RFQRequest) is demonstrated live on /ledger; here the Seller's view is the shared
 * deal state and the role switch is the lens.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PartyRole } from './types';
import {
  loadConfig, getParties, listActive, createAs, exerciseAs, getTxLog, explorerUrlForParty, type Contract,
  SCENARIO, type Phase1Scenario, type RiskTier,
  complianceAttestationArgs, riskAttestationArgs, rfqRequestArgs,
} from './ledger';

export type Role = PartyRole;
export type { RiskTier };
export type Phase = 'origination' | 'preRfq' | 'rfqOpen';

export const ROLES: { id: Role; label: string; sub: string }[] = [
  { id: 'seller', label: 'Seller', sub: 'originator' },
  { id: 'funder', label: 'Funder', sub: 'per-Funder RFQ' },
  { id: 'compliance', label: 'Compliance', sub: 'eligibility' },
  { id: 'risk', label: 'Risk Assessor', sub: 'risk tier' },
  { id: 'coordinator', label: 'Coordinator', sub: 'workflow router' },
  { id: 'auditor', label: 'Auditor / Regulator', sub: 'scoped view' },
  { id: 'outsider', label: 'Outsider', sub: 'public ledger' },
];

export const LEGEND: Record<Role, { sees: string; hidden: string }> = {
  seller: { sees: 'Receivable, both attestations, both certificates, every per-Funder RFQRequest it authored', hidden: 'Nothing at Phase 1 — the Seller originates the whole package' },
  funder: { sees: 'Only its own RFQRequest: certified receivable terms, risk tier, response deadline', hidden: 'Raw Debtor identity · the Receivable · attestations · certificates · other Funders’ requests' },
  compliance: { sees: 'The compliance disclosure it reviews and the ComplianceAttestation/Certificate it authors', hidden: 'Risk tier · per-Funder RFQ requests · Funder identities' },
  risk: { sees: 'The receivable terms it tiers and the RiskAttestation/Certificate it authors', hidden: 'Compliance disclosure · eligibility result · per-Funder RFQ requests · Funder identities' },
  coordinator: { sees: 'Workflow status only (Phase 1 has no Coordinator party on-ledger)', hidden: 'Receivable · attestations · certificates · RFQ request contents' },
  auditor: { sees: 'Nothing in Phase 1 — the scoped audit receipt is a later phase', hidden: 'Receivable · attestations · certificates · RFQ requests' },
  outsider: { sees: 'Nothing useful — opaque per-party contracts only', hidden: 'Receivable · attestations · certificates · RFQ requests · identities' },
};

// Phase 1 disclosure boundary — what is / isn't shared as the package is built.
export const BOUNDARY = [
  { stage: 'Receivable', what: 'Private to the Seller — raw Debtor identity never leaves this contract' },
  { stage: 'Attestation', what: 'Compliance & Risk each see only their scoped disclosure; the Seller observes the result' },
  { stage: 'Certificate', what: 'Seller-derived from an attestation — exposes only the Funder-visible certified terms' },
  { stage: 'RFQ request', what: 'Per-Funder — each Funder sees its own certified terms + risk tier, nothing else' },
];

/* Wallet connector — each role connects as a distinct Canton party (Outsider = non-party Observer). */
export type WalletState = 'disconnected' | 'connecting' | 'connected';
export interface WalletParty { name: string; badge: string; id: string; node: string; }
const WALLET_PARTIES: Record<string, WalletParty> = {
  seller: { name: 'Aster Components', badge: 'Seller', id: 'Seller::1220a9f2c41b8e73', node: 'participant-seller-1' },
  compliance: { name: 'Meridian Compliance', badge: 'Compliance Party', id: 'Compliance::1220c0de4471a2f9', node: 'participant-compliance-1' },
  risk: { name: 'Sentinel Risk', badge: 'Risk Assessor', id: 'RiskAssessor::1220ra22b7f944', node: 'participant-risk-1' },
  coordinator: { name: 'RFQ Coordinator', badge: 'Coordinator', id: 'Coordinator::12204471c0017dab', node: 'participant-coord-1' },
  auditor: { name: 'Regulator Node', badge: 'Auditor / Regulator', id: 'Auditor::1220aud17e55c3b0', node: 'participant-regulator-1' },
};
export const FUNDER_PARTY_NAMES: Record<string, string> = { A: 'Vanta Credit', B: 'Lumen Capital', C: 'Harbour Funding' };
const FUNDER_PARTY_IDS: Record<string, string> = { A: 'VantaCredit::1220vc7a0d13c4', B: 'LumenCapital::1220lc3f88a172', C: 'HarbourFund::1220hf90b2de55' };
export function truncParty(id: string): string {
  const i = id.indexOf('::');
  if (i < 0) return id;
  const p = id.slice(0, i), hsh = id.slice(i + 2);
  return p + '::' + hsh.slice(0, 4) + '…' + hsh.slice(-4);
}

export const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

/* ---- live Phase 1 state ---- */
export interface ReceivableForm {
  invoiceId: string; debtorName: string;
  payableAmount: number; currency: string;
  issueDate: string; dueDate: string; paymentTerms: string;
  buyerReference: string; purchaseOrderReference: string; sourceSystemReference: string;
}
export interface ReceivableView {
  cid: string; invoiceId: string; debtorName: string;
  payableAmount: number; currency: string; issueDate: string; dueDate: string; paymentTerms: string;
  buyerReference: string | null; purchaseOrderReference: string | null; sourceSystemReference: string | null;
}
export interface ComplianceView { attCid: string; sellerEligible: boolean; rfqEligible: boolean; certified: boolean }
export interface RiskView { attCid: string; riskTier: RiskTier; certified: boolean }
export interface RFQRequestView {
  cid: string; funderParty: string; funderKey: string;
  payableAmount: number; currency: string; issueDate: string; dueDate: string; paymentTerms: string;
  riskTier: RiskTier; responseDeadline: string;
}

const funderRole = (k: string) => ('funder' + k) as 'funderA' | 'funderB' | 'funderC';

// Build a per-deal Phase1Scenario from the live Receivable + scenario defaults
// (identities, transaction purpose, policy versions, packageId, response deadline).
const dealScenario = (rcv: ReceivableView): Phase1Scenario => ({
  ...SCENARIO,
  receivable: {
    invoiceId: rcv.invoiceId,
    buyerReference: rcv.buyerReference,
    purchaseOrderReference: rcv.purchaseOrderReference,
    sourceSystemReference: rcv.sourceSystemReference,
    debtorName: rcv.debtorName,
    terms: { payableAmount: rcv.payableAmount.toFixed(1), currency: rcv.currency, issueDate: rcv.issueDate, dueDate: rcv.dueDate, paymentTerms: rcv.paymentTerms },
  },
});

const num = (v: unknown) => parseFloat(String(v)) || 0;
const str = (v: unknown) => (v == null ? null : String(v));

interface State {
  role: Role; phase: Phase; funderTab: string;
  toast: string | null; toastColor: string; toastTx: string | null;
  walletState: WalletState; walletMenuOpen: boolean;
  ready: boolean | null;
  receivable: ReceivableView | null;
  compliance: ComplianceView | null;
  risk: RiskView | null;
  requests: RFQRequestView[];
  rfqOpen: boolean;
}

interface StoreCtx {
  state: State;
  invitedFunders: string[];
  requestFor: (key: string) => RFQRequestView | undefined;
  explorerUrl: string | null;   // 5N Lighthouse view for the acting party (DevNet only)
  setRole: (id: Role) => void;
  setFunderTab: (k: string) => void;
  createReceivable: (r: ReceivableForm) => void;
  issueCompliance: (sellerEligible: boolean, rfqEligible: boolean) => void;
  issueRisk: (riskTier: RiskTier) => void;
  openRFQ: (funderKeys: string[]) => void;
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
    role: 'seller', phase: 'origination', funderTab: 'A', toast: null, toastColor: '#57e3a0', toastTx: null,
    walletState: 'disconnected', walletMenuOpen: false, ready: null,
    receivable: null, compliance: null, risk: null, requests: [], rfqOpen: false,
  });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const patch = useCallback((p: Partial<State>) => setState((s) => ({ ...s, ...p })), []);

  // A toast with a tx link stays up longer so it's clickable (dApp-style receipt).
  const toast = useCallback((msg: string, color = '#57e3a0', tx: string | null = null) => {
    timers.current.forEach(clearTimeout);
    setState((s) => ({ ...s, toast: msg, toastColor: color, toastTx: tx }));
    timers.current.push(setTimeout(() => setState((s) => ({ ...s, toast: null, toastTx: null })), tx ? 7000 : 2600));
  }, []);
  // updateId of the transaction the just-completed action submitted (newest first).
  const lastTx = () => getTxLog()[0]?.updateId ?? null;

  // Read the Seller's view → the shared deal state. The Seller is signatory or
  // observer on every Phase 1 contract, so it sees the whole package it authored.
  const refreshData = useCallback(async () => {
    const P = getParties();
    const funderKeyByParty: Record<string, string> = { [P.funderA]: 'A', [P.funderB]: 'B', [P.funderC]: 'C' };
    const cs = await listActive(P.seller);
    let receivable: ReceivableView | null = null;
    let compliance: ComplianceView | null = null;
    let risk: RiskView | null = null;
    let hasComplianceCert = false, hasRiskCert = false;
    const requests: RFQRequestView[] = [];
    for (const c of cs) {
      const a = c.args as Record<string, any>;
      if (c.template === 'Receivable') {
        const m = a.metadata ?? {}, t = a.terms ?? {};
        receivable = {
          cid: c.contractId, invoiceId: String(m.invoiceId ?? ''), debtorName: String(a.debtorName ?? ''),
          payableAmount: num(t.payableAmount), currency: String(t.currency ?? ''),
          issueDate: String(t.issueDate ?? ''), dueDate: String(t.dueDate ?? ''), paymentTerms: String(t.paymentTerms ?? ''),
          buyerReference: str(m.buyerReference), purchaseOrderReference: str(m.purchaseOrderReference), sourceSystemReference: str(m.sourceSystemReference),
        };
      } else if (c.template === 'ComplianceAttestation') {
        const r = a.complianceResult ?? {};
        compliance = { attCid: c.contractId, sellerEligible: !!r.sellerEligible, rfqEligible: !!r.rfqEligible, certified: false };
      } else if (c.template === 'ComplianceCertificate') {
        hasComplianceCert = true;
      } else if (c.template === 'RiskAttestation') {
        risk = { attCid: c.contractId, riskTier: (a.riskResult?.riskTier ?? 'LowRisk') as RiskTier, certified: false };
      } else if (c.template === 'RiskCertificate') {
        hasRiskCert = true;
      } else if (c.template === 'RFQRequest') {
        const pd = a.packageData ?? {}, t = pd.receivableTerms ?? {};
        const fp = String(a.funder ?? '');
        requests.push({
          cid: c.contractId, funderParty: fp, funderKey: funderKeyByParty[fp] ?? '?',
          payableAmount: num(t.payableAmount), currency: String(t.currency ?? ''),
          issueDate: String(t.issueDate ?? ''), dueDate: String(t.dueDate ?? ''), paymentTerms: String(t.paymentTerms ?? ''),
          riskTier: (pd.riskTier ?? 'LowRisk') as RiskTier, responseDeadline: String(pd.responseDeadline ?? ''),
        });
      }
    }
    if (compliance) compliance.certified = hasComplianceCert;
    if (risk) risk.certified = hasRiskCert;
    requests.sort((x, y) => x.funderKey.localeCompare(y.funderKey));
    const rfqOpen = requests.length > 0;
    setState((s) => ({ ...s, receivable, compliance, risk, requests, rfqOpen }));
    return { hasReceivable: !!receivable, rfqOpen };
  }, []);

  const phaseFrom = (r: { hasReceivable: boolean; rfqOpen: boolean }): Phase =>
    r.rfqOpen ? 'rfqOpen' : r.hasReceivable ? 'preRfq' : 'origination';

  // Initial load: config → read live state → derive starting phase.
  useEffect(() => { (async () => {
    const ok = await loadConfig();
    if (!ok) { patch({ ready: false }); return; }
    const r = await refreshData();
    patch({ ready: true, phase: phaseFrom(r) });
  })(); }, [refreshData, patch]);

  const setRole = useCallback((id: Role) => patch({ role: id }), [patch]);
  const setFunderTab = useCallback((k: string) => patch({ funderTab: k }), [patch]);

  const invitedFunders = useMemo(() => state.requests.map((r) => r.funderKey), [state.requests]);
  const requestFor = useCallback((key: string) => state.requests.find((r) => r.funderKey === key), [state.requests]);

  // External explorer link for whichever party the current role acts as.
  const explorerUrl = useMemo(() => {
    const P = getParties();
    const id = state.role === 'funder'
      ? P[funderRole(state.funderTab)]
      : P[state.role as 'seller' | 'compliance' | 'risk' | 'coordinator' | 'auditor' | 'outsider'];
    return explorerUrlForParty(id ?? '');
  }, [state.role, state.funderTab, state.ready]);  // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Phase 1 origination actions ----
  const createReceivable = useCallback((r: ReceivableForm) => {
    toast('Registering Receivable…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        await createAs(P.seller, 'Receivable', {
          registrar: P.seller, owner: P.seller,
          metadata: {
            invoiceId: r.invoiceId,
            buyerReference: r.buyerReference.trim() || null,
            purchaseOrderReference: r.purchaseOrderReference.trim() || null,
            sourceSystemReference: r.sourceSystemReference.trim() || null,
          },
          debtorName: r.debtorName,
          terms: { payableAmount: r.payableAmount.toFixed(1), currency: r.currency, issueDate: r.issueDate, dueDate: r.dueDate, paymentTerms: r.paymentTerms },
        }, 'Register Receivable');
        const d = await refreshData();
        patch({ phase: phaseFrom(d) });
        toast('Receivable registered — private to you', '#57e3a0', lastTx());
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [patch, toast, refreshData]);

  const issueCompliance = useCallback((sellerEligible: boolean, rfqEligible: boolean) => {
    toast('Issuing Compliance Attestation…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        const rcv = state.receivable;
        if (!rcv) { toast('Register the Receivable first', '#f0795f'); return; }
        const scen: Phase1Scenario = { ...dealScenario(rcv), compliance: { ...SCENARIO.compliance, sellerEligible, rfqEligible } };
        await createAs(P.compliance, 'ComplianceAttestation', complianceAttestationArgs(P.compliance, P.seller, rcv.cid, scen), 'Compliance attestation');
        await refreshData();
        toast('Compliance Attestation issued', '#57e3a0', lastTx());
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [state.receivable, toast, refreshData]);

  const issueRisk = useCallback((riskTier: RiskTier) => {
    toast('Issuing Risk Attestation…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        const rcv = state.receivable;
        if (!rcv) { toast('Register the Receivable first', '#f0795f'); return; }
        const scen: Phase1Scenario = { ...dealScenario(rcv), risk: { ...SCENARIO.risk, riskTier } };
        await createAs(P.risk, 'RiskAttestation', riskAttestationArgs(P.risk, P.seller, rcv.cid, scen), 'Risk attestation');
        await refreshData();
        toast('Risk Attestation issued', '#57e3a0', lastTx());
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [state.receivable, toast, refreshData]);

  // Seller derives both certificates from the attestations, then creates one
  // RFQRequest per invited Funder (each Funder observes only its own request).
  const openRFQ = useCallback((funderKeys: string[]) => {
    toast('Deriving certificates & opening RFQ…', '#57e3a0');
    (async () => {
      try {
        const P = getParties();
        const rcv = state.receivable, comp = state.compliance, rk = state.risk;
        if (!rcv || !comp || !rk) { toast('Need the Receivable and both attestations first', '#f0795f'); return; }
        const scen: Phase1Scenario = {
          ...dealScenario(rcv),
          compliance: { ...SCENARIO.compliance, sellerEligible: comp.sellerEligible, rfqEligible: comp.rfqEligible },
          risk: { ...SCENARIO.risk, riskTier: rk.riskTier },
        };
        const compCerts = await exerciseAs(P.seller, 'ComplianceAttestation', comp.attCid, 'CreateComplianceCertificate',
          { policyVersion: scen.compliance.policyVersion, certificationScope: scen.compliance.certificationScope }, 'Derive Compliance certificate');
        const compCertCid = compCerts.find((c) => c.template === 'ComplianceCertificate')!.contractId;
        const riskCerts = await exerciseAs(P.seller, 'RiskAttestation', rk.attCid, 'CreateRiskCertificate',
          { riskPolicyVersion: scen.risk.riskPolicyVersion, certificationScope: scen.risk.certificationScope }, 'Derive Risk certificate');
        const riskCertCid = riskCerts.find((c) => c.template === 'RiskCertificate')!.contractId;
        const already = new Set(state.requests.map((r) => r.funderKey));
        for (const k of funderKeys) {
          if (already.has(k)) continue;
          await createAs(P.seller, 'RFQRequest',
            rfqRequestArgs(P.seller, P[funderRole(k)], P.compliance, P.risk, rcv.cid, compCertCid, riskCertCid, scen), 'Open RFQ · Funder ' + k);
        }
        const d = await refreshData();
        patch({ phase: phaseFrom(d), funderTab: funderKeys[0] ?? 'A' });
        toast('RFQ opened — one private request per Funder', '#57e3a0', lastTx());
      } catch (e) { toast(String(e), '#f0795f'); }
    })();
  }, [state.receivable, state.compliance, state.risk, state.requests, patch, toast, refreshData]);

  const onReset = useCallback(() => {
    toast('Reloading from ledger…', '#9aa1ad');
    (async () => {
      const r = await refreshData();
      patch({ phase: phaseFrom(r) });
    })();
  }, [refreshData, patch, toast]);

  const walletParty = useCallback((role: Role): WalletParty | null => {
    if (role === 'funder') {
      const k = state.funderTab;
      return { name: FUNDER_PARTY_NAMES[k] ?? ('Funder ' + k), badge: 'Funder ' + k, id: FUNDER_PARTY_IDS[k] ?? '', node: 'participant-funder-pool' };
    }
    if (role === 'outsider') return null;
    return WALLET_PARTIES[role] ?? null;
  }, [state.funderTab]);

  const toggleWalletMenu = useCallback(() => setState((s) => ({ ...s, walletMenuOpen: !s.walletMenuOpen })), []);
  const closeWalletMenu = useCallback(() => patch({ walletMenuOpen: false }), [patch]);
  const connectWallet = useCallback(() => {
    patch({ walletState: 'connecting', walletMenuOpen: false });
    timers.current.push(setTimeout(() => { patch({ walletState: 'connected' }); toast('Wallet connected — acting as a scoped party on Canton Devnet', '#57e3a0'); }, 1100));
  }, [patch, toast]);
  const disconnectWallet = useCallback(() => { patch({ walletState: 'disconnected', walletMenuOpen: false }); toast('Wallet disconnected', '#9aa1ad'); }, [patch, toast]);

  const value = useMemo<StoreCtx>(() => ({
    state, invitedFunders, requestFor, explorerUrl,
    setRole, setFunderTab, createReceivable, issueCompliance, issueRisk, openRFQ, onReset,
    walletParty, toggleWalletMenu, closeWalletMenu, connectWallet, disconnectWallet,
  }), [state, invitedFunders, requestFor, explorerUrl, setRole, setFunderTab, createReceivable, issueCompliance, issueRisk, openRFQ, onReset, walletParty, toggleWalletMenu, closeWalletMenu, connectWallet, disconnectWallet]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
