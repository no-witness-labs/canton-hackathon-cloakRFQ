'use client';

import { Icon, type IconName } from '@/lib/icons';
import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { subscribeTx, getTxLog, getTxVersion, isSessionMode, newSession } from '@/lib/ledger';
import {
  useStore, ROLES, LEGEND, BOUNDARY, truncParty, usd, FUNDER_PARTY_NAMES,
  type ReceivableForm, type RiskTier, type ComplianceView, type RiskView, type RFQRequestView,
  type QuoteForm, type SettlementView,
} from '@/lib/store';
import type { RecourseModel } from '@/lib/ledger';
import { Term } from './Term';

// Live clock (ticks each second while `active`) for the quote-window countdown.
function useNow(active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!active) return; const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, [active]);
  return now;
}
const secsUntil = (iso: string | null, now: number): number => (iso ? Math.round((new Date(iso).getTime() - now) / 1000) : 0);
const fmtSecs = (s: number): string => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const RECOURSE_LABEL: Record<string, string> = { WithRecourse: 'With recourse', WithoutRecourse: 'Non-recourse' };

const TIER_LABEL: Record<string, string> = { LowRisk: 'Low risk', MediumRisk: 'Medium risk', HighRisk: 'High risk' };
const fmtAmount = (n: number, ccy: string) => `${usd(n)} ${ccy}`;

function NewDealButton() {
  if (!isSessionMode()) return null;
  return (
    <button className="chip ghost" style={{ cursor: 'pointer' }} title="Start a fresh, isolated deal (new parties)"
      onClick={() => { newSession(); window.location.href = '/'; }}>
      ↻ New deal
    </button>
  );
}

function TxIndicator() {
  useSyncExternalStore(subscribeTx, getTxVersion, getTxVersion);
  const n = getTxLog().length;
  return (
    <Link href="/activity" className="chip ghost" style={{ textDecoration: 'none' }} title="Explore ledger transactions">
      Activity · {n} tx{n === 1 ? '' : 's'}
    </Link>
  );
}

export default function Workspace() {
  const { state, setRole } = useStore();
  const role = state.role;
  const lg = LEGEND[role];
  const dealLabel = state.settlement ? 'invoice sold · settled'
    : state.rfqOpen && state.receivable ? `${state.receivable.invoiceId} · offers open`
    : state.receivable ? `${state.receivable.invoiceId} · building`
    : 'demo · new deal';
  const [showWelcome, setShowWelcome] = useState(false);
  useEffect(() => { try { setShowWelcome(!localStorage.getItem('cloakrfq-welcomed')); } catch { /* ignore */ } }, []);
  const closeWelcome = () => { try { localStorage.setItem('cloakrfq-welcomed', '1'); } catch { /* ignore */ } setShowWelcome(false); };

  if (state.ready === null) return (
    <>
      <WelcomeOverlay open={showWelcome} onClose={closeWelcome} />
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ display: 'block', margin: '0 auto 14px' }} />
          <div className="disp" style={{ fontSize: 15, fontWeight: 600 }}>Setting up your demo…</div>
          <div className="t-mut" style={{ fontSize: 12, marginTop: 6 }}>Creating your private demo workspace — about 20 seconds.</div>
        </div>
      </div>
    </>
  );
  if (state.ready === false) return (
    <div style={{ maxWidth: 520, margin: '80px auto', padding: 24, textAlign: 'center' }}>
      <h1 className="disp" style={{ fontSize: 20, fontWeight: 700 }}>Demo temporarily unavailable</h1>
      <p className="t-ink3" style={{ marginTop: 10, lineHeight: 1.6 }}>We couldn&apos;t reach the demo ledger just now. Please refresh in a moment — no action needed on your part.</p>
      <button className="btn accent" style={{ marginTop: 16 }} onClick={() => window.location.reload()}>Retry</button>
      <p className="t-mut" style={{ marginTop: 18, fontSize: 11.5 }}>Running locally? Start the ledger with <span className="mono">./scripts/start-sandbox.sh</span>, then reload.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <WelcomeOverlay open={showWelcome} onClose={closeWelcome} />
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <span className="brand-mark"><Icon name="lock" size={17} /></span>
            <div>
              <div className="brand-name">Cloak<span>RFQ</span> <span className="rec">Receipts</span></div>
              <div className="brand-sub">Private invoice financing · <Term id="canton">Canton</Term></div>
            </div>
          </div>
          <span className="demo-badge" title="Interactive demo — no wallet, sign-up, or real money needed">Demo · no real funds</span>
          <span className="spacer" />
          <button className="chip ghost" style={{ cursor: 'pointer' }} onClick={() => setShowWelcome(true)}>? How it works</button>
          <NewDealButton />
          <TxIndicator />
          <Link href="/ledger" className="chip ghost" style={{ textDecoration: 'none' }} title="See the per-party privacy proof">Ledger</Link>
          <span className="live"><span className="dot" /> Live · {dealLabel}</span>
          <WalletConnector />
        </div>

        <div className="role-switch">
          {ROLES.map((r) => (
            <button key={r.id} className={'role-btn' + (r.id === role ? ' on' : '')} onClick={() => setRole(r.id)}>
              <span className="lab">{r.label}</span>
              <span className="sub">{r.sub}</span>
            </button>
          ))}
        </div>

        <div className="legend">
          <div className="legend-cell"><span className="legend-key sees">Sees</span><span className="legend-val">{lg.sees}</span></div>
          <div className="legend-cell"><span className="legend-key withheld">Withheld</span><span className="legend-val dim">{lg.hidden}</span></div>
        </div>
      </header>

      <main className="main">
        {role !== 'outsider' && <ProgressStepper />}
        {role === 'seller' && <SellerView />}
        {role === 'funder' && <FunderView />}
        {role === 'compliance' && <ComplianceRoleView />}
        {role === 'risk' && <RiskRoleView />}
        {role === 'coordinator' && <CoordinatorView />}
        {role === 'auditor' && <AuditorView />}
        {role === 'outsider' && <OutsiderView />}
      </main>

      <Toast />
    </div>
  );
}

/* ============================ shared ============================ */
const toastLinkStyle: React.CSSProperties = { marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid var(--line3)', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' };
function Toast() {
  const { state } = useStore();
  if (!state.toast) return null;
  // The /tx page waits for the explorer to index the tx, then forwards — so a
  // fresh transaction never lands on a 404. (It routes to Activity off DevNet.)
  return (
    <div className="toast">
      <span className="dot" style={{ background: state.toastColor }} />
      <span>{state.toast}</span>
      {state.toastTx && (
        <a href={`/tx/${state.toastTx}`} target="_blank" rel="noopener noreferrer" style={toastLinkStyle}>Explore transaction ↗</a>
      )}
    </div>
  );
}

// First-run welcome — explains what the app is, the 3-step flow, and that it's a
// role-play demo, so a new user isn't dropped into a jargon-heavy workspace cold.
function WelcomeOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const steps = [
    { n: '1', t: 'Register your invoice', d: 'Add an unpaid invoice you want to turn into cash now — we call it a “Receivable”.' },
    { n: '2', t: 'Get it approved', d: 'Switch to the Compliance and Risk roles (top tabs) and approve it — in this demo you play every party yourself.' },
    { n: '3', t: 'Send private requests', d: 'Open the RFQ (Request for Quote) to send each lender (“Funder”) its own private request — no funder can see another’s.' },
  ];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 8 }}>
          <span className="brand-mark"><Icon name="lock" size={17} /></span>
          <h2 className="disp" style={{ fontSize: 19, fontWeight: 700 }}>Welcome to CloakRFQ</h2>
        </div>
        <p className="t-ink2" style={{ fontSize: 13.5, lineHeight: 1.6 }}>
          A private marketplace for <b>invoice financing</b> on the Canton Network: sell an unpaid invoice
          to lenders early — <b>without exposing your data to competing lenders</b>.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, margin: '16px 0' }}>
          {steps.map((s) => (
            <div key={s.n} style={{ display: 'flex', gap: 12 }}>
              <span className="welcome-step-n">{s.n}</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.t}</div>
                <div className="t-ink3" style={{ fontSize: 12.5, lineHeight: 1.5, marginTop: 2 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="note" style={{ fontSize: 12 }}>
          <Icon name="eyeoff" size={16} color="#57e3a0" />
          <div>This is a free interactive <b>demo</b>. You role-play all seven parties to see how each sees only what it&apos;s entitled to. <b>No wallet, sign-up, or real money</b> needed — ledger actions are real test-net transactions.</div>
        </div>
        <button className="btn accent block" style={{ marginTop: 16 }} onClick={onClose}>Got it — start the demo</button>
      </div>
    </div>
  );
}

// Live Phase 1 progress, shown across role views so the deal's journey is always visible.
function ProgressStepper() {
  const { state: s } = useStore();
  const settled = !!s.settlement;
  const hasQuotes = s.quotes.length > 0;
  const steps = [
    { label: 'Invoice', done: !!s.receivable || settled, active: !s.receivable && !settled },
    { label: 'Compliance', done: !!s.compliance || settled, active: !!s.receivable && !s.compliance },
    { label: 'Risk', done: !!s.risk || settled, active: !!s.receivable && !s.risk },
    { label: 'RFQ open', done: s.rfqOpen || settled, active: !!s.compliance && !!s.risk && !s.rfqOpen && !settled },
    { label: 'Offers', done: hasQuotes || settled, active: s.rfqOpen && !hasQuotes && !settled },
    { label: 'Settled', done: settled, active: hasQuotes && !settled },
  ];
  return (
    <div className="stepper">
      {steps.map((st, i) => {
        const stateCls = st.done ? ' done' : st.active ? ' active' : '';
        return (
          <div className="step" key={st.label}>
            {i < steps.length - 1 && <span className={'step-line' + (st.done ? ' done' : '')} />}
            <span className={'step-dot' + stateCls}>{st.done ? '✓' : i + 1}</span>
            <span className={'step-lab' + stateCls}>{st.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function WalletConnector() {
  const { state, walletParty, toggleWalletMenu, closeWalletMenu, connectWallet, disconnectWallet } = useStore();
  const role = state.role;
  const wParty = walletParty(role);
  const connected = state.walletState === 'connected';
  const observer = connected && !wParty;
  const dotColor = observer ? '#e8c15f' : '#57e3a0';
  const intentName = wParty ? `${wParty.name} (${wParty.badge})` : 'a non-party Observer';
  const chipName = wParty ? wParty.name : 'Observer';
  const chipSub = wParty ? truncParty(wParty.id) : 'non-party · no entitlements';
  const detailRows = !wParty
    ? [
        { k: 'Party', v: 'None — connected as a non-party', color: '#e8c15f' },
        { k: 'Ledger', v: 'Canton Devnet · demo', color: '#cdd2db' },
        { k: 'Entitlements', v: 'No Receivable, attestation or RFQ visibility', color: '#9aa1ad' },
      ]
    : [
        { k: 'Party ID', v: wParty.id, color: '#cdd2db' },
        { k: 'Participant node', v: wParty.node, color: '#cdd2db' },
        { k: 'Ledger', v: 'Canton Devnet · CloakRFQ Phase 1', color: '#cdd2db' },
        { k: 'Scoped to', v: LEGEND[role].sees, color: '#9aa1ad' },
      ];
  const providers: { id: string; label: string; sub: string; icon: IconName; sw?: number }[] = [
    { id: 'canton', label: 'Canton Network Wallet', sub: 'Browser party-key signer', icon: 'card' },
    { id: 'demo', label: 'Demo Party Key', sub: 'Hackathon ephemeral key', icon: 'key', sw: 1.8 },
  ];

  return (
    <div className="wallet-wrap">
      {state.walletState === 'disconnected' && (
        <button className="w-connect" onClick={toggleWalletMenu}><Icon name="card" size={15} /> Sign in (optional)</button>
      )}
      {state.walletState === 'connecting' && (
        <div className="w-connecting"><span className="sp" /> Connecting…</div>
      )}
      {connected && (
        <button className="w-chip" style={{ border: `1px solid ${observer ? 'rgba(232,193,95,0.35)' : 'rgba(87,227,160,0.32)'}` }} onClick={toggleWalletMenu}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: dotColor }} />
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.15, minWidth: 0 }}>
            <span className="nm">{chipName}</span>
            <span className="sub">{chipSub}</span>
          </span>
          <Icon name="chevdown" size={13} sw={2.4} color="#6b7280" />
        </button>
      )}

      {state.walletMenuOpen && (
        <>
          <div className="w-overlay" onClick={closeWalletMenu} />
          <div className="w-pop">
            {connected ? (
              <>
                <div style={{ padding: '15px 16px 13px', display: 'flex', alignItems: 'center', gap: 11, borderBottom: '1px solid var(--line)' }}>
                  <span style={{ width: 36, height: 36, borderRadius: 10, display: 'grid', placeItems: 'center', flex: 'none', background: observer ? 'rgba(232,193,95,0.12)' : 'rgba(87,227,160,0.12)', border: `1px solid ${observer ? 'rgba(232,193,95,0.28)' : 'rgba(87,227,160,0.28)'}`, color: dotColor }}><Icon name="user" size={18} /></span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="disp" style={{ fontWeight: 600, fontSize: 14 }}>{chipName}</div>
                    <div className="mono" style={{ fontSize: 10, color: dotColor, marginTop: 2 }}>{observer ? 'Non-party · observer only' : `${wParty!.badge} · simulated`}</div>
                  </div>
                </div>
                <div style={{ padding: '10px 16px' }}>
                  {detailRows.map((d) => (
                    <div key={d.k} className="w-detail-row">
                      <span className="eyebrow sm">{d.k}</span>
                      <span className="mono" style={{ fontSize: 12, color: d.color, wordBreak: 'break-all', lineHeight: 1.4 }}>{d.v}</span>
                    </div>
                  ))}
                  <p className="t-mut" style={{ fontSize: 10.5, lineHeight: 1.5, marginTop: 8 }}>
                    Simulated connection — no browser key signs here. The Party ID above is the real on-ledger party; the app authorizes commands as it server-side.
                  </p>
                </div>
                <div style={{ padding: '6px 16px 15px' }}>
                  <button className="w-disconnect" onClick={disconnectWallet}><Icon name="logout" size={14} sw={2.2} /> Disconnect wallet</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: '14px 16px 6px' }}>
                  <div className="disp" style={{ fontWeight: 600, fontSize: 13.5 }}>Sign in as this participant</div>
                  <div className="t-ink3" style={{ fontSize: 11.5, marginTop: 2, lineHeight: 1.45 }}>Optional &amp; simulated — no real wallet. You&apos;ll appear as <span className="t-ink2">{intentName}</span>; your view follows the selected role.</div>
                </div>
                <div style={{ padding: '8px 12px 6px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {providers.map((p) => (
                    <button key={p.id} className="w-prov" onClick={connectWallet}>
                      <span className="w-prov-ic"><Icon name={p.icon} size={16} sw={p.sw} /></span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="lab">{p.label}</span>
                        <span className="sub">{p.sub}</span>
                      </span>
                      <Icon name="chevright" size={15} sw={2.4} color="#6b7280" />
                    </button>
                  ))}
                </div>
                <div className="w-foot">CloakRFQ Phase 1 · Canton Devnet — non-production. No real custody or signing.</div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Seg({ opts, val, onPick }: { opts: { label: string; value: string | number; danger?: boolean }[]; val: string | number; onPick: (v: string | number) => void }) {
  return (
    <div className="seg">
      {opts.map((o) => {
        const selected = o.value === val;
        return <button key={String(o.value)} className={selected ? (o.danger ? 'on danger' : 'on') : ''} onClick={() => onPick(o.value)}>{o.label}</button>;
      })}
    </div>
  );
}

const fieldInput: React.CSSProperties = { background: 'rgba(255,255,255,.03)', border: '1px solid var(--line3)', color: 'var(--ink)', borderRadius: 8, padding: '9px 11px', fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none' };
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span className="t-ink3" style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</span>
      {children}
    </label>
  );
}
function StatusRow({ k, v, ok }: { k: string; v: string; ok: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span className="t-ink3" style={{ fontSize: 12 }}>{k}</span>
      <span className="chip" style={{ background: ok ? 'rgba(87,227,160,.12)' : 'rgba(154,161,173,.1)', color: ok ? 'var(--accent)' : 'var(--mut)' }}>{v}</span>
    </div>
  );
}
const attRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--line3)' };

/* ============================ SELLER ============================ */
function ReceivableForm({ onCreate }: { onCreate: (r: ReceivableForm) => void }) {
  const [f, setF] = useState<ReceivableForm>({
    invoiceId: 'INV-4471', debtorName: 'Meridian Retail Group',
    payableAmount: 480000, currency: 'USD',
    issueDate: '2026-01-01', dueDate: '2026-02-15', paymentTerms: 'Net 45',
    buyerReference: 'AP-DEPT-42', purchaseOrderReference: 'PO-98776', sourceSystemReference: 'NETSUITE-AR-10031',
  });
  const set = (p: Partial<ReceivableForm>) => setF((s) => ({ ...s, ...p }));
  const valid = f.invoiceId.trim() !== '' && f.debtorName.trim() !== '' && f.payableAmount > 0 && f.issueDate !== '' && f.dueDate !== '';
  return (
    <section className="panel">
      <div className="panel-h"><h2 className="lg">Register your invoice</h2><span className="spacer" /><span className="chip ghost">private to you</span></div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Pre-filled with <span className="t-ink3">example data</span> — edit the fields or just continue. This becomes your on-ledger &ldquo;Receivable&rdquo; (the invoice you want to finance).</p>
        <div className="form-grid">
          <Field label="Invoice ID"><input style={fieldInput} value={f.invoiceId} onChange={(e) => set({ invoiceId: e.target.value })} /></Field>
          <Field label="Payment terms"><input style={fieldInput} value={f.paymentTerms} onChange={(e) => set({ paymentTerms: e.target.value })} /></Field>
          <Field label="Payable amount"><input style={fieldInput} type="number" value={f.payableAmount} onChange={(e) => set({ payableAmount: Number(e.target.value) })} /></Field>
          <Field label="Currency"><input style={fieldInput} value={f.currency} onChange={(e) => set({ currency: e.target.value })} /></Field>
          <Field label="Issue date"><input style={fieldInput} type="date" value={f.issueDate} onChange={(e) => set({ issueDate: e.target.value })} /></Field>
          <Field label="Due date"><input style={fieldInput} type="date" value={f.dueDate} onChange={(e) => set({ dueDate: e.target.value })} /></Field>
        </div>
        <Field label="Debtor — raw identity, stays with you"><input style={fieldInput} value={f.debtorName} onChange={(e) => set({ debtorName: e.target.value })} /></Field>
        <div className="form-grid-3">
          <Field label="Buyer ref"><input style={fieldInput} value={f.buyerReference} onChange={(e) => set({ buyerReference: e.target.value })} /></Field>
          <Field label="PO ref"><input style={fieldInput} value={f.purchaseOrderReference} onChange={(e) => set({ purchaseOrderReference: e.target.value })} /></Field>
          <Field label="Source system"><input style={fieldInput} value={f.sourceSystemReference} onChange={(e) => set({ sourceSystemReference: e.target.value })} /></Field>
        </div>
        <button className="btn accent block" disabled={!valid} onClick={() => onCreate(f)}><Icon name="plus" size={16} sw={2.4} /> Register Receivable</button>
      </div>
    </section>
  );
}

function AttestStatus({ risk, comp }: { risk: RiskView | null; comp: ComplianceView | null }) {
  const compVal = comp ? (comp.sellerEligible && comp.rfqEligible ? 'Eligible' : 'Not eligible') : 'Not issued';
  const riskVal = risk ? TIER_LABEL[risk.riskTier] ?? risk.riskTier : 'Not issued';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <StatusRow k="Compliance attestation" v={compVal} ok={!!comp && comp.sellerEligible && comp.rfqEligible} />
      <StatusRow k="Risk attestation" v={riskVal} ok={!!risk} />
    </div>
  );
}

function OpenRFQPanel({ onOpen, risk, comp }: { onOpen: (k: string[]) => void; risk: RiskView | null; comp: ComplianceView | null }) {
  const { setRole } = useStore();
  const [funders, setFunders] = useState<string[]>(['A', 'B', 'C']);
  const toggle = (k: string) => setFunders((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const eligible = !!comp && comp.sellerEligible && comp.rfqEligible;
  const missing = [
    !comp ? 'Compliance attestation' : !eligible ? 'Eligible compliance result' : null,
    !risk ? 'Risk attestation' : null,
    funders.length === 0 ? 'At least one invited Funder' : null,
  ].filter((x): x is string => !!x);
  const ready = missing.length === 0;
  return (
    <section className="panel">
      <div className="panel-h"><h2 className="lg">Open <Term id="rfq">RFQ</Term></h2><span className="spacer" /><span className="chip ghost">certificate-backed</span></div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <p className="t-ink3" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Opening the RFQ derives a <b>Compliance Certificate</b> and <b>Risk Certificate</b> from the <Term id="attestation">attestations</Term>, then creates one private request per invited <Term id="funder">Funder</Term> — each Funder sees only its own.</p>
        <Field label="Invite Funders">
          <div style={{ display: 'flex', gap: 8 }}>
            {['A', 'B', 'C'].map((k) => (
              <button key={k} className={'btn sm ' + (funders.includes(k) ? 'accent' : 'dark')} style={{ flex: 1 }} onClick={() => toggle(k)}>Funder {k}</button>
            ))}
          </div>
        </Field>
        <AttestStatus risk={risk} comp={comp} />
        {!eligible && comp && <p className="t-red" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Compliance marked the package not eligible — the certificate choice will reject. Re-issue an eligible attestation to proceed.</p>}
        {(!comp || !risk) && (
          <div style={{ background: 'rgba(232,193,95,0.08)', border: '1px solid var(--amber-line)', borderRadius: 10, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--amber)' }}>Next step: get this approved</div>
            <p className="t-ink3" style={{ fontSize: 11.5, lineHeight: 1.5 }}>In this demo you play these roles too. Approve the invoice, then come back here to open the RFQ.</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {!comp && <button className="btn amber sm" onClick={() => setRole('compliance')}>Approve as Compliance →</button>}
              {!risk && <button className="btn amber sm" onClick={() => setRole('risk')}>Set risk as Risk Assessor →</button>}
            </div>
          </div>
        )}
        <div className="action-tip-wrap" tabIndex={ready ? undefined : 0}>
          <button className="btn accent block" disabled={!ready} onClick={() => onOpen(funders)} aria-describedby={ready ? undefined : 'open-rfq-missing'}>
            <Icon name="send" size={16} sw={2.4} /> Open RFQ to {funders.length} Funder{funders.length === 1 ? '' : 's'}
          </button>
          {!ready && (
            <div id="open-rfq-missing" className="action-tip" role="tooltip">
              <div className="action-tip-title">Missing before Open RFQ</div>
              <ul>
                {missing.map((m) => <li key={m}>{m}</li>)}
              </ul>
              <div className="action-tip-note">Certificates are derived automatically when the RFQ opens.</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StepHint({ title, body, risk, comp }: { title: string; body: string; risk: RiskView | null; comp: ComplianceView | null }) {
  return (
    <section className="panel">
      <div className="panel-h"><h2 className="lg">{title}</h2></div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p className="t-ink2" style={{ fontSize: 13, lineHeight: 1.55 }}>{body}</p>
        <AttestStatus risk={risk} comp={comp} />
        <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Tip: issue these from the <b>Compliance</b> and <b>Risk Assessor</b> roles — they&apos;re certified into the RFQ.</p>
      </div>
    </section>
  );
}

function SellerView() {
  const { state, createReceivable, openRFQ } = useStore();
  const rcv = state.receivable;
  const { risk, compliance: comp } = state;

  // Settled — the receivable has been sold and transferred; show the receipt.
  if (state.settlement) return <SellerSettledView settlement={state.settlement} />;

  // Step 1 — register the Receivable
  if (!rcv) return (
    <div className="grid-origination">
      <ReceivableForm onCreate={createReceivable} />
      <StepHint title="Step 1 · Originate" body="Register the Receivable you want to finance. It is private to you on the ledger (registrar == owner) — the raw Debtor identity never leaves this contract. Next, gather the Compliance and Risk attestations, then open the RFQ." risk={risk} comp={comp} />
    </div>
  );

  const receivableCard = (
    <section className="panel">
      <div className="panel-h"><h2><Term id="receivable">Receivable</Term></h2><span className="spacer" /><span className="h-tag">{rcv.invoiceId}</span></div>
      <div className="panel-b">
        <div className="face">{usd(rcv.payableAmount)}</div>
        <div className="t-ink3" style={{ fontSize: 12.5, marginTop: 3 }}>Payable · {rcv.currency} · {rcv.paymentTerms}</div>
        <div className="meta-grid">
          <div className="meta"><div className="k">Issued</div><div className="v mono">{rcv.issueDate}</div></div>
          <div className="meta"><div className="k">Due</div><div className="v mono">{rcv.dueDate}</div></div>
          <div className="meta"><div className="k">Buyer ref</div><div className="v">{rcv.buyerReference ?? '—'}</div></div>
          <div className="meta"><div className="k">PO ref</div><div className="v">{rcv.purchaseOrderReference ?? '—'}</div></div>
        </div>
      </div>
    </section>
  );

  const debtorCard = (
    <section className="panel">
      <div className="panel-h"><h2><Term id="debtor">Debtor</Term></h2></div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="t-ink3" style={{ fontSize: 12.5 }}>Identity (to you)</span><span style={{ fontSize: 13, fontWeight: 600 }}>{rcv.debtorName}</span></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><span className="t-ink3" style={{ fontSize: 12.5 }}>Risk attestation</span>{risk ? <span className="chip accent">{TIER_LABEL[risk.riskTier] ?? risk.riskTier}</span> : <span className="chip ghost">pending</span>}</div>
        <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 2 }}>Funders receive the certified <span className="t-ink3">risk tier</span> — not the raw Debtor identity.</p>
      </div>
    </section>
  );

  const boundaryCard = (
    <section className="panel">
      <div className="panel-h"><h2>Disclosure Boundary</h2></div>
      <div style={{ padding: '7px 17px 13px' }}>
        {BOUNDARY.map((b) => (
          <div key={b.stage} style={{ display: 'flex', gap: 11, padding: '9px 0', borderBottom: '1px solid var(--line3)' }}>
            <span className="mono t-accent" style={{ fontSize: 10, width: 78, flex: 'none', paddingTop: 1 }}>{b.stage}</span>
            <span className="t-ink2" style={{ fontSize: 12, lineHeight: 1.45 }}>{b.what}</span>
          </div>
        ))}
      </div>
    </section>
  );

  // Step 2 — gather attestations & open the RFQ. Boundary sits on the right, under
  // Open RFQ, so the two columns stay balanced instead of leaving a right-side void.
  if (!state.rfqOpen) return (
    <div className="grid-seller">
      <div className="col">{receivableCard}{debtorCard}</div>
      <div className="col"><OpenRFQPanel onOpen={openRFQ} risk={risk} comp={comp} />{boundaryCard}</div>
    </div>
  );

  // Step 3 — RFQ open: certificates derived, per-Funder requests created
  return (
    <div className="grid-seller">
      <div className="col">{receivableCard}{debtorCard}{boundaryCard}</div>
      <div className="col">
        <div className="hook">
          <span className="hook-ic"><Icon name="check" size={16} /></span>
          <div>
            <div className="t">RFQ open — waiting for offers.</div>
            <div className="s">Each Funder received its own private request. Switch to a <b>Funder</b> to submit an offer, then come back to accept &amp; settle.</div>
          </div>
        </div>

        <SellerQuotesPanel />

        <section className="panel">
          <div className="panel-h"><h2 className="lg"><Term id="certificate">Certificates</Term></h2><span className="spacer" /><span className="chip ghost">Seller-derived</span></div>
          <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <StatusRow k="Compliance certificate" v={comp?.certified ? 'Derived' : 'Pending'} ok={!!comp?.certified} />
            <StatusRow k="Risk certificate" v={risk?.certified ? 'Derived' : 'Pending'} ok={!!risk?.certified} />
            <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 2 }}>Each certificate exposes only the Funder-visible certified terms. Verify per-party privacy on the <Link href="/ledger" className="linklike">Ledger view</Link>.</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function SellerQuotesPanel() {
  const { state, acceptAndSettle } = useStore();
  const now = useNow();
  const deadlineSecs = secsUntil(state.responseDeadline, now);
  const windowOpen = deadlineSecs > 0;
  const quotes = state.quotes;
  return (
    <section className="panel">
      <div className="panel-h">
        <h2 className="lg">Offers</h2>
        <span className="h-tag">{quotes.length} in</span>
        <span className="spacer" />
        {windowOpen
          ? <span className="chip amber">offers close in {fmtSecs(Math.max(0, deadlineSecs))}</span>
          : <span className="chip accent">offers closed · settle now</span>}
      </div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {quotes.length === 0 && (
          <p className="t-mut" style={{ fontSize: 12.5, lineHeight: 1.5 }}>No offers yet. Switch to a <b>Funder</b> to submit one{windowOpen ? `, before the window closes.` : ' — but the window has closed.'}</p>
        )}
        {quotes.map((q) => (
          <div key={q.cid} className="qcard">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
              <span className="q-av">{q.funderKey}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="q-name">Funder {q.funderKey} · {FUNDER_PARTY_NAMES[q.funderKey] ?? '—'}</div>
                <div className="q-id-note">{RECOURSE_LABEL[q.recourseModel]} · debtor notify {q.debtorNotificationRequired ? 'required' : 'not required'}</div>
              </div>
              <div style={{ textAlign: 'right', flex: 'none' }}>
                <div className="q-net">{usd(q.netPurchasePrice)}</div>
                <div className="q-net-sub">funding locked</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
              <span className="mono t-accent" style={{ fontSize: 10.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="check" size={12} sw={2.5} /> Committed token allocation</span>
              <span className="spacer" />
              <button className="btn accent sm" disabled={windowOpen} onClick={() => acceptAndSettle(q.funderKey)}>
                {windowOpen ? `Settle in ${fmtSecs(Math.max(0, deadlineSecs))}` : 'Accept & settle →'}
              </button>
            </div>
          </div>
        ))}
        {state.requests.length > 0 && (
          <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>{state.requests.length} funder{state.requests.length === 1 ? '' : 's'} haven’t offered yet. Accepting an offer settles atomically: funds move to you, the invoice transfers to that lender.</p>
        )}
      </div>
    </section>
  );
}

function SellerSettledView({ settlement }: { settlement: SettlementView }) {
  const { onReset } = useStore();
  const rows = [
    { k: 'Buyer (lender)', v: `Funder ${settlement.funderKey} · ${FUNDER_PARTY_NAMES[settlement.funderKey] ?? '—'}` },
    { k: 'Sale price received', v: usd(settlement.netPurchasePrice) },
    { k: 'Settled at', v: settlement.settledAt.replace('T', ' ').slice(0, 19) + ' UTC' },
    { k: 'Invoice ownership', v: 'Transferred to the lender' },
    { k: 'Payment', v: 'Funds settled to you on-ledger' },
  ];
  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <section className="panel">
        <div className="panel-h">
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(87,227,160,0.12)', border: '1px solid rgba(87,227,160,0.28)', display: 'grid', placeItems: 'center', color: '#57e3a0', flex: 'none' }}><Icon name="check" size={16} sw={2.5} /></span>
          <h2 className="lg">Invoice sold — settled</h2><span className="spacer" /><button className="btn dark sm" onClick={onReset}>Refresh</button>
        </div>
        <div style={{ padding: '6px 18px 16px' }}>
          {rows.map((r) => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--line3)' }}>
              <span className="t-ink3" style={{ fontSize: 12.5 }}>{r.k}</span>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 500, textAlign: 'right', color: '#eef0f3' }}>{r.v}</span>
            </div>
          ))}
          <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 12 }}>Atomic on-ledger settlement — the lender’s locked funds paid you and the invoice transferred to them in one transaction. See it on the <Link href="/activity" className="linklike">Activity log</Link>.</p>
        </div>
      </section>
    </div>
  );
}

function RFQRequestCard({ r }: { r: RFQRequestView }) {
  return (
    <div className="qcard">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        <span className="q-av">{FUNDER_PARTY_NAMES[r.funderKey]?.[0] ?? r.funderKey}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="q-name">Funder {r.funderKey} · {FUNDER_PARTY_NAMES[r.funderKey] ?? '—'}</div>
          <div className="q-id-note">private RFQRequest · observer = this Funder only</div>
        </div>
        <div style={{ textAlign: 'right', flex: 'none' }}>
          <div className="q-net">{usd(r.payableAmount)}</div>
          <div className="q-net-sub">{r.currency} certified</div>
        </div>
      </div>
      <div className="q-terms" style={{ marginTop: 12 }}>
        <div className="term"><div className="k">Risk tier</div><div className="v">{TIER_LABEL[r.riskTier] ?? r.riskTier}</div></div>
        <div className="term"><div className="k">Payment terms</div><div className="v">{r.paymentTerms}</div></div>
        <div className="term"><div className="k">Due</div><div className="v mono">{r.dueDate}</div></div>
        <div className="term"><div className="k">Response by</div><div className="v mono">{r.responseDeadline.replace('T', ' ').replace('Z', ' UTC')}</div></div>
      </div>
    </div>
  );
}

/* ============================ FUNDER ============================ */
function FunderView() {
  const { state, invitedFunders, requestFor, quoteFor, setFunderTab, setRole, submitQuote } = useStore();
  const invited = invitedFunders;
  useEffect(() => { if (invited.length && !invited.includes(state.funderTab)) setFunderTab(invited[0]); }, [invited, state.funderTab, setFunderTab]);
  const ft = invited.includes(state.funderTab) ? state.funderTab : (invited[0] ?? state.funderTab);
  const req = requestFor(ft);
  const quote = quoteFor(ft);
  const now = useNow(!!req && !quote);
  const deadlineSecs = secsUntil(state.responseDeadline, now);
  const windowOpen = deadlineSecs > 0;
  const settled = state.settlement;
  const won = settled?.funderKey === ft;
  const lost = !!settled && settled.funderKey !== ft;

  if (!req && !quote) return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <section className="panel">
        <div className="panel-h"><h2 className="lg">No request for you yet</h2><span className="spacer" /><span className="chip ghost">waiting</span></div>
        <div className="panel-b">
          <p className="t-ink2" style={{ fontSize: 13, lineHeight: 1.6 }}>As a <b>lender</b>, you receive a private financing request once a seller sends one. Nothing is here yet because no deal has been opened in this demo.</p>
          <p className="t-mut" style={{ fontSize: 12.5, marginTop: 10, lineHeight: 1.5 }}>In this demo you create the deal yourself: play the <b>Seller</b>, register an invoice and open the RFQ — then come back here to make an offer.</p>
          <button className="btn accent sm" style={{ marginTop: 14 }} onClick={() => setRole('seller')}>Start a deal as the Seller →</button>
        </div>
      </section>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>You are viewing as</div>
        <div className="funder-tabs">
          {invited.map((k) => (
            <button key={k} className={'ftab' + (k === ft ? ' on' : '')} onClick={() => setFunderTab(k)}>
              <div className="lab">Funder {k} · {FUNDER_PARTY_NAMES[k] ?? '—'}</div>
              <div className="sub">{quoteFor(k) ? 'offer submitted' : 'awaiting your offer'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid-funder">
        {req ? (
          <section className="panel">
            <div className="panel-h"><h2><Term id="rfq">RFQ</Term> Disclosure Package</h2><span className="spacer" /><span className="mono t-accent" style={{ fontSize: 10 }}>certificate-backed</span></div>
            <div style={{ padding: '6px 17px 14px' }}>
              {[
                { label: 'Certified invoice amount', value: fmtAmount(req.payableAmount, req.currency), redacted: false },
                { label: 'Payment terms', value: req.paymentTerms, redacted: false },
                { label: 'Due date', value: req.dueDate, redacted: false },
                { label: 'Certified risk rating', value: TIER_LABEL[req.riskTier] ?? req.riskTier, redacted: false },
                { label: 'Raw Debtor identity', value: 'withheld — Seller-only', redacted: true },
                { label: 'Other lenders’ offers', value: 'not visible to you', redacted: true },
              ].map((d) => (
                <div key={d.label} className="kvrow">
                  <span className="k">{d.label}</span>
                  {d.redacted ? <span className="redact-tag"><Icon name="lock" size={11} />{d.value}</span> : <span className="v">{d.value}</span>}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="panel">
            <div className="panel-h"><h2>Your submitted offer</h2><span className="spacer" /><span className="chip accent">funding locked</span></div>
            <div style={{ padding: '6px 17px 14px' }}>
              <div className="kvrow"><span className="k">Your price</span><span className="v">{usd(quote!.netPurchasePrice)}</span></div>
              <div className="kvrow"><span className="k">Recourse</span><span className="v">{RECOURSE_LABEL[quote!.recourseModel]}</span></div>
              <div className="kvrow"><span className="k">Debtor notification</span><span className="v">{quote!.debtorNotificationRequired ? 'Required' : 'Not required'}</span></div>
              <div className="kvrow"><span className="k">Funding</span><span className="v t-accent">Committed on-ledger</span></div>
            </div>
          </section>
        )}

        <div className="col">
          {req && !quote && windowOpen && (
            <QuoteComposer funderKey={ft} faceValue={req.payableAmount} deadlineSecs={deadlineSecs} onSubmit={submitQuote} />
          )}
          {req && !quote && !windowOpen && (
            <section className="panel" style={{ padding: '16px 17px' }}>
              <div className="eyebrow" style={{ marginBottom: 9 }}>Offer window closed</div>
              <p className="t-ink3" style={{ fontSize: 12.5, lineHeight: 1.5 }}>The response deadline passed before you submitted an offer, so this request can no longer be quoted.</p>
            </section>
          )}
          {quote && (
            <section className="panel" style={{ padding: '16px 17px' }}>
              <div className="eyebrow" style={{ marginBottom: 9 }}>Your offer status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="outcome-dot" style={{ background: won ? '#57e3a0' : lost ? '#6b7280' : '#e8c15f' }} />
                <span className="disp" style={{ fontWeight: 600, fontSize: 14.5, color: won ? '#57e3a0' : lost ? '#9aa1ad' : '#e8c15f' }}>
                  {won ? 'Won — the invoice is now yours' : lost ? 'Not selected — seller settled with another lender' : 'Submitted — awaiting the seller’s decision'}
                </span>
              </div>
              <p className="t-mut" style={{ fontSize: 11.5, marginTop: 10, lineHeight: 1.5 }}>
                {won ? 'Your locked funds paid the seller and the invoice transferred to you.' : lost ? 'Your funding lock is released.' : 'The seller can accept & settle once the quoting window closes.'}
              </p>
            </section>
          )}

          <section className="panel dashed" style={{ padding: '16px 17px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
              <Icon name="eyeoff" size={15} color="#6b7280" />
              <span className="t-ink3" style={{ fontSize: 12.5 }}>Other lenders’ offers — <span className="t-ink2" style={{ fontWeight: 600 }}>hidden from you</span></span>
            </div>
            <p className="t-mut" style={{ fontSize: 11, lineHeight: 1.5 }}>Each request and offer is private to its lender — you never see another lender’s price. Confirm it on the <Link href="/ledger" className="linklike">Ledger view</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

function QuoteComposer({ funderKey, faceValue, deadlineSecs, onSubmit }: { funderKey: string; faceValue: number; deadlineSecs: number; onSubmit: (k: string, f: QuoteForm) => void }) {
  const [f, setF] = useState<QuoteForm>({ netPurchasePrice: Math.round(faceValue * 0.969), recourseModel: 'WithoutRecourse', debtorNotificationRequired: false });
  const discount = faceValue > 0 ? (1 - f.netPurchasePrice / faceValue) * 100 : 0;
  return (
    <section className="panel">
      <div className="panel-h"><h2>Make an offer</h2><span className="spacer" /><span className="chip amber">closes in {fmtSecs(Math.max(0, deadlineSecs))}</span></div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div className="eyebrow sm" style={{ marginBottom: 7 }}>Your price to buy the invoice</div>
          <div className="netbox">
            <span className="mono t-ink3" style={{ fontSize: 18 }}>$</span>
            <input value={f.netPurchasePrice.toLocaleString('en-US')} inputMode="numeric"
              onChange={(e) => setF((s) => ({ ...s, netPurchasePrice: parseInt(String(e.target.value).replace(/[^0-9]/g, '')) || 0 }))} />
            <span className="mono t-mut" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>/ {usd(faceValue)} face</span>
          </div>
          <div className="t-mut" style={{ fontSize: 11, marginTop: 6 }}>{discount.toFixed(1)}% discount — your margin if the debtor pays in full.</div>
        </div>
        <div><div className="eyebrow sm" style={{ marginBottom: 7 }}>Recourse</div>
          <Seg val={f.recourseModel} onPick={(v) => setF((s) => ({ ...s, recourseModel: v as RecourseModel }))} opts={[{ label: 'Non-recourse', value: 'WithoutRecourse' }, { label: 'With recourse', value: 'WithRecourse' }]} /></div>
        <div><div className="eyebrow sm" style={{ marginBottom: 7 }}>Debtor notification</div>
          <Seg val={f.debtorNotificationRequired ? 'y' : 'n'} onPick={(v) => setF((s) => ({ ...s, debtorNotificationRequired: v === 'y' }))} opts={[{ label: 'Not required', value: 'n' }, { label: 'Required', value: 'y' }]} /></div>
        <span className="chip accent" style={{ justifyContent: 'center', padding: 9, borderRadius: 8 }}><Icon name="check" size={12} sw={2.5} /> Funds are locked on submit (demo token allocation)</span>
        <button className="btn accent block" disabled={f.netPurchasePrice <= 0} onClick={() => onSubmit(funderKey, f)}><Icon name="send" size={16} sw={2.4} /> Submit private offer</button>
        <p className="t-mut" style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.5 }}>Sealed to the seller only. Submit before the window closes — the seller settles after it.</p>
      </div>
    </section>
  );
}

function NextStep({ label, onGo }: { label: string; onGo: () => void }) {
  return <button className="btn accent sm" style={{ marginTop: 14 }} onClick={onGo}>{label}</button>;
}

/* ============================ COMPLIANCE ============================ */
function ComplianceRoleView() {
  const { state, issueCompliance, setRole } = useStore();
  const att = state.compliance;
  const rcv = state.receivable;
  return (
    <div className="grid-centered">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Compliance approval</h2><span className="spacer" /><span className="h-tag">Compliance role</span></div>
        <div style={{ padding: '6px 18px 14px' }}>
          {!rcv
            ? <p className="t-mut" style={{ fontSize: 12.5, padding: '8px 0', lineHeight: 1.5 }}>No invoice registered yet. Switch to <button className="linklike" onClick={() => setRole('seller')}>Seller</button> to register one, then approve it here.</p>
            : att
              ? <>
                  <AttestRow party="Compliance role" subject="Seller & invoice eligibility" result={att.sellerEligible && att.rfqEligible ? 'Eligible' : 'Not eligible'} tone="accent" />
                  <div style={{ ...attRowStyle }}>
                    <span className="t-ink3" style={{ fontSize: 12.5 }}>Compliance certificate</span>
                    <span className={'chip ' + (att.certified ? 'accent' : 'ghost')}>{att.certified ? 'Derived by Seller' : 'Awaiting Seller derivation'}</span>
                  </div>
                  <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 12 }}>Recorded on-ledger. In this demo this is a simple eligible / not-eligible check — a real deployment would run KYC and sanctions screening here. The Seller sees the result and derives a certificate that exposes only the approved terms.</p>
                  {state.risk
                    ? <NextStep label="Next: back to Seller to open the RFQ →" onGo={() => setRole('seller')} />
                    : <NextStep label="Next: set the risk as Risk Assessor →" onGo={() => setRole('risk')} />}
                </>
              : <ComplianceForm onIssue={issueCompliance} />}
        </div>
      </section>
      <div className="col">
        <HiddenNote title="Risk tier & quote terms — not visible to you">The Compliance Party reviews the seller/debtor identities and receivable terms it was disclosed. It does not see the certified risk tier, the per-Funder RFQ requests, or any Funder identities.</HiddenNote>
      </div>
    </div>
  );
}

function ComplianceForm({ onIssue }: { onIssue: (sellerEligible: boolean, rfqEligible: boolean) => void }) {
  const [sellerEligible, setSellerEligible] = useState(true);
  const [rfqEligible, setRfqEligible] = useState(true);
  const passed = sellerEligible && rfqEligible;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <Field label="Seller eligibility">
        <Seg val={sellerEligible ? 'yes' : 'no'} onPick={(v) => setSellerEligible(v === 'yes')} opts={[{ label: 'Eligible', value: 'yes' }, { label: 'Not eligible', value: 'no', danger: true }]} />
      </Field>
      <Field label="RFQ package eligibility">
        <Seg val={rfqEligible ? 'yes' : 'no'} onPick={(v) => setRfqEligible(v === 'yes')} opts={[{ label: 'Eligible', value: 'yes' }, { label: 'Not eligible', value: 'no', danger: true }]} />
      </Field>
      <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>In a real deployment this is where KYC, sanctions, and package-scope checks run. A negative result records the attestation but prevents certificate creation and RFQ opening.</p>
      <button className={"btn block " + (passed ? "accent" : "amber")} onClick={() => onIssue(sellerEligible, rfqEligible)}>
        <Icon name="check" size={15} sw={2.3} /> {passed ? 'Approve compliance' : 'Record not eligible'}
      </button>
    </div>
  );
}

/* ============================ RISK ============================ */
function RiskRoleView() {
  const { state, issueRisk, setRole } = useStore();
  const att = state.risk;
  const rcv = state.receivable;
  return (
    <div className="grid-centered">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Risk assessment</h2><span className="spacer" /><span className="h-tag">Risk role</span></div>
        <div style={{ padding: '6px 18px 14px' }}>
          {!rcv
            ? <p className="t-mut" style={{ fontSize: 12.5, padding: '8px 0', lineHeight: 1.5 }}>No invoice registered yet. Switch to <button className="linklike" onClick={() => setRole('seller')}>Seller</button> to register one, then rate it here.</p>
            : att
              ? <>
                  <AttestRow party="Risk role" subject="Invoice risk rating" result={TIER_LABEL[att.riskTier] ?? att.riskTier} tone="amber" />
                  <div style={{ ...attRowStyle }}>
                    <span className="t-ink3" style={{ fontSize: 12.5 }}>Risk certificate</span>
                    <span className={'chip ' + (att.certified ? 'accent' : 'ghost')}>{att.certified ? 'Derived by Seller' : 'Awaiting Seller derivation'}</span>
                  </div>
                  <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 12 }}>Lenders receive this certified <Term id="risktier">rating</Term> in their request — never the customer&apos;s raw records. It signals how likely the invoice is to be paid.</p>
                  {state.compliance
                    ? <NextStep label="Next: back to Seller to open the RFQ →" onGo={() => setRole('seller')} />
                    : <NextStep label="Next: approve as Compliance →" onGo={() => setRole('compliance')} />}
                </>
              : <RiskForm onIssue={issueRisk} />}
        </div>
      </section>
      <div className="col">
        <section className="panel" style={{ padding: '16px 17px' }}>
          <div className="eyebrow" style={{ marginBottom: 11 }}>Scope</div>
          <p className="t-ink2" style={{ fontSize: 12, lineHeight: 1.6 }}>The Risk Assessor is a <span className="t-amber">separate scoped role</span> from Compliance. It tiers the receivable terms it was disclosed and issues an attestation, so Funders can price risk from the certified tier — without raw Debtor records being disclosed.</p>
        </section>
        <HiddenNote title="Out of risk scope — not visible to you">Compliance eligibility decisions, the per-Funder RFQ requests, and Funder or Seller identities beyond what risk tiering requires are not disclosed to the Risk Assessor.</HiddenNote>
      </div>
    </div>
  );
}

function RiskForm({ onIssue }: { onIssue: (tier: RiskTier) => void }) {
  const [tier, setTier] = useState<RiskTier>('LowRisk');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <Field label="How likely is this invoice to be paid?">
        <Seg val={tier} onPick={(v) => setTier(v as RiskTier)} opts={[{ label: 'Low risk', value: 'LowRisk' }, { label: 'Medium', value: 'MediumRisk' }, { label: 'High risk', value: 'HighRisk' }]} />
      </Field>
      <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Lenders use this rating to price their offer. Lower risk = better terms for the seller.</p>
      <button className="btn accent block" onClick={() => onIssue(tier)}>
        <Icon name="risk" size={15} sw={2} /> Submit risk rating
      </button>
    </div>
  );
}

function AttestRow({ party, subject, result, tone }: { party: string; subject: string; result: string; tone: 'accent' | 'amber' }) {
  const bg = tone === 'accent' ? 'rgba(87,227,160,0.12)' : 'rgba(232,193,95,0.12)';
  const bd = tone === 'accent' ? 'rgba(87,227,160,0.28)' : 'rgba(232,193,95,0.28)';
  const col = tone === 'accent' ? '#57e3a0' : '#e8c15f';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: '1px solid var(--line3)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: bg, border: `1px solid ${bd}`, display: 'grid', placeItems: 'center', color: col, flex: 'none' }}>
        <Icon name={tone === 'accent' ? 'check' : 'risk'} size={15} sw={tone === 'accent' ? 2.5 : 2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{subject}</div>
        <div className="mono t-mut" style={{ fontSize: 11, marginTop: 2 }}>{party}</div>
      </div>
      <span className={'chip ' + tone}>{result}</span>
    </div>
  );
}

function HiddenNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel dashed" style={{ padding: '16px 17px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
        <Icon name="eyeoff" size={15} color="#6b7280" />
        <span className="t-ink3" style={{ fontSize: 12.5 }}>{title.split('—')[0]}—<span className="t-ink2" style={{ fontWeight: 600 }}>{title.split('—')[1]}</span></span>
      </div>
      <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.55 }}>{children}</p>
    </section>
  );
}

/* ============================ COORDINATOR ============================ */
function CoordinatorView() {
  const { state } = useStore();
  const rcv = state.receivable;
  const comp = state.compliance, risk = state.risk;
  const done = '#57e3a0', active = '#e8c15f', pend = '#3a3f48';
  const step = (ok: boolean, running: boolean) => (ok ? done : running ? active : pend);

  const steps = [
    { n: '1', label: 'Receivable registered', sub: rcv ? `${rcv.invoiceId} · ${usd(rcv.payableAmount)}` : 'awaiting origination', color: step(!!rcv, !rcv) },
    { n: '2', label: 'Compliance attestation', sub: comp ? (comp.sellerEligible && comp.rfqEligible ? 'Eligible' : 'Not eligible') : 'pending', color: step(!!comp, !!rcv && !comp) },
    { n: '3', label: 'Compliance certificate', sub: comp?.certified ? 'Seller-derived' : 'pending', color: step(!!comp?.certified, !!comp && !comp.certified) },
    { n: '4', label: 'Risk attestation', sub: risk ? (TIER_LABEL[risk.riskTier] ?? risk.riskTier) : 'pending', color: step(!!risk, !!rcv && !risk) },
    { n: '5', label: 'Risk certificate', sub: risk?.certified ? 'Seller-derived' : 'pending', color: step(!!risk?.certified, !!risk && !risk.certified) },
    { n: '6', label: 'Per-Funder RFQ requests', sub: state.rfqOpen ? `${state.requests.length} Funder${state.requests.length === 1 ? '' : 's'} invited` : 'pending', color: step(state.rfqOpen, !!comp && !!risk && !state.rfqOpen) },
  ];

  return (
    <div className="grid-2">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Phase 1 workflow status</h2><span className="spacer" /><span className="h-tag">routing only · {rcv?.invoiceId ?? '—'}</span></div>
        <div style={{ padding: 18 }}>
          {steps.map((t, i) => {
            const dotBg = t.color === pend ? '#1b1e24' : t.color;
            const dotFg = t.color === pend ? '#6b7280' : '#0c1217';
            return (
              <div className="tl-row" key={t.n}>
                <div className="tl-rail">
                  <span className="tl-dot" style={{ background: dotBg, color: dotFg, border: `1px solid ${t.color}` }}>{t.n}</span>
                  {i < steps.length - 1 && <span className="tl-line" />}
                </div>
                <div className="tl-body">
                  <div className="tl-label">{t.label}</div>
                  <div className="tl-sub" style={{ color: t.color }}>{t.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <div className="col">
        <section className="panel dashed" style={{ padding: '16px 17px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="lock" size={15} color="#6b7280" />
            <span className="t-ink3" style={{ fontSize: 12.5 }}>Phase 1 has <span className="t-ink2" style={{ fontWeight: 600 }}>no Coordinator party</span> on-ledger</span>
          </div>
          <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.55 }}>The origination workflow is Seller-driven end to end: the Seller registers the Receivable, gathers scoped attestations, derives the certificates, and authors one RFQRequest per Funder. A Coordinator/quote-router is introduced in a later phase. This view mirrors the on-ledger progress; it holds no privileged data.</p>
        </section>
        <section className="panel" style={{ padding: '16px 17px' }}>
          <div className="eyebrow" style={{ marginBottom: 11 }}>Parties in Phase 1</div>
          <div className="routed">
            {['Seller', `${state.requests.length} Funders`, 'Compliance', 'Risk Assessor'].map((p) => <span key={p}>{p}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================ AUDITOR ============================ */
function AuditorView() {
  const { state } = useStore();
  const comp = state.compliance, risk = state.risk;
  const rows = [
    { k: 'Receivable registered', v: state.receivable ? state.receivable.invoiceId : '—', color: state.receivable ? '#eef0f3' : '#6b7280' },
    { k: 'Compliance attestation', v: comp ? (comp.sellerEligible && comp.rfqEligible ? 'Eligible' : 'Not eligible') : 'pending', color: comp ? '#57e3a0' : '#6b7280' },
    { k: 'Compliance certificate', v: comp?.certified ? 'Derived' : 'pending', color: comp?.certified ? '#57e3a0' : '#6b7280' },
    { k: 'Risk attestation', v: risk ? (TIER_LABEL[risk.riskTier] ?? risk.riskTier) : 'pending', color: risk ? '#57e3a0' : '#6b7280' },
    { k: 'Risk certificate', v: risk?.certified ? 'Derived' : 'pending', color: risk?.certified ? '#57e3a0' : '#6b7280' },
    { k: 'Per-Funder RFQ requests', v: String(state.requests.length), color: state.requests.length ? '#57e3a0' : '#6b7280' },
  ];
  const withheld = ['Raw Debtor identity', 'Full compliance disclosure', 'Raw risk records', 'Per-Funder request contents', 'Funder identities'];

  return (
    <div className="grid-auditor">
      <section className="panel">
        <div className="panel-h">
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(87,227,160,0.12)', border: '1px solid rgba(87,227,160,0.28)', display: 'grid', placeItems: 'center', color: '#57e3a0', flex: 'none' }}><Icon name="shield" size={16} /></span>
          <h2 className="lg">Origination trail</h2><span className="spacer" /><span className="h-tag">Phase 1</span>
        </div>
        <div style={{ padding: '6px 18px 16px' }}>
          {rows.map((r) => (
            <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--line3)' }}>
              <span className="t-ink3" style={{ fontSize: 12.5 }}>{r.k}</span>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 500, textAlign: 'right', color: r.color }}>{r.v}</span>
            </div>
          ))}
          <p className="t-mut" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 12 }}>The scoped <span className="t-ink3">Compliance Receipt</span> — an entitled audit disclosure at RFQ finality — is a later phase. Phase 1 records only the origination trail above.</p>
        </div>
      </section>

      <section className="panel dashed-red" style={{ padding: '16px 17px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
          <Icon name="lock" size={15} color="#f0795f" />
          <span className="t-ink2" style={{ fontSize: 12.5, fontWeight: 600 }}>Withheld by default</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {withheld.map((w2) => (
            <div key={w2} style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'var(--hatch)', border: '1px solid var(--line2)', borderRadius: 7, padding: '8px 11px' }}>
              <Icon name="lock" size={12} color="#5a6069" />
              <span className="mono" style={{ fontSize: 11.5, color: '#7a808b' }}>{w2}</span>
            </div>
          ))}
        </div>
        <p className="t-mut" style={{ fontSize: 11, marginTop: 13, lineHeight: 1.55 }}>In Phase 1 the Auditor is not yet a party on any contract — nothing is disclosed to it on-ledger.</p>
      </section>
    </div>
  );
}

/* ============================ OUTSIDER ============================ */
function OutsiderView() {
  const rows = [
    { hash: '0x9f2a··4471', label: 'Contract created' },
    { hash: '0x4c7d··88a1', label: 'Choice exercised — view restricted' },
    { hash: '0xbb71··02de', label: 'Contract created' },
    { hash: '0x71bb··ee04', label: 'Contract created' },
  ];
  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Public ledger view</h2><span className="spacer" /><span className="live" style={{ fontSize: 10.5 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6b7280' }} />non-party</span></div>
        <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {rows.map((p) => (
            <div key={p.hash} className="public-row">
              <span className="mono" style={{ fontSize: 12, color: '#7a808b', flex: 'none' }}>{p.hash}</span>
              <span className="t-ink3" style={{ fontSize: 12.5 }}>{p.label}</span>
              <span className="spacer" />
              <span className="redact-tag" style={{ flex: 'none' }}><Icon name="lock" size={11} />contents sealed</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 18px 18px' }}>
          <div className="note">
            <Icon name="eyeoff" size={17} color="#57e3a0" />
            <div>No Receivable, attestation, certificate, RFQ request, identity or amount is visible to non-parties. Outsiders see only that opaque contracts were created — never <span className="t-accent">what</span>, <span className="t-accent">who</span>, or <span className="t-accent">how much</span>.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
