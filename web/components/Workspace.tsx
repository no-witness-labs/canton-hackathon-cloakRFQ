'use client';

import { Icon, type IconName } from '@/lib/icons';
import { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { subscribeTx, getTxLog, getTxVersion, isSessionMode, newSession } from '@/lib/ledger';
import {
  useStore, ROLES, LEGEND, BOUNDARY, truncParty, usd, FUNDER_PARTY_NAMES,
  type ReceivableForm, type RiskTier, type ComplianceView, type RiskView, type RFQRequestView,
} from '@/lib/store';

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
  const dealLabel = state.rfqOpen && state.receivable ? `${state.receivable.invoiceId} · RFQ open`
    : state.receivable ? `${state.receivable.invoiceId} · building`
    : 'Phase 1 · new deal';

  if (state.ready === null) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="mono t-ink3">Setting up your Canton ledger session…</div>
        <div className="mono t-mut" style={{ fontSize: 11, marginTop: 8 }}>first load provisions your own private parties (~20s on DevNet)</div>
      </div>
    </div>
  );
  if (state.ready === false) return (
    <div style={{ maxWidth: 560, margin: '60px auto', padding: 24 }}>
      <h1 className="disp" style={{ fontSize: 20, fontWeight: 700 }}>Sandbox not ready</h1>
      <p className="t-ink3" style={{ marginTop: 8 }}>The Canton ledger isn&apos;t reachable. Bring it up, then reload:</p>
      <pre style={{ background: 'var(--panel)', padding: 14, borderRadius: 10, marginTop: 10, color: 'var(--ink2)' }}>./scripts/start-sandbox.sh</pre>
      <p className="t-mut" style={{ marginTop: 8, fontSize: 13 }}>This Workspace reads live Phase 1 contracts; the per-party proof is at <b>/ledger</b>.</p>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <span className="brand-mark"><Icon name="lock" size={17} /></span>
            <div>
              <div className="brand-name">Cloak<span>RFQ</span> <span className="rec">Receipts</span></div>
              <div className="brand-sub">Private RFQ · Canton · Phase 1</div>
            </div>
          </div>
          <span className="spacer" />
          <NewDealButton />
          <TxIndicator />
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

// Live Phase 1 progress, shown across role views so the deal's journey is always visible.
function ProgressStepper() {
  const { state: s } = useStore();
  const steps = [
    { label: 'Receivable', done: !!s.receivable, active: !s.receivable },
    { label: 'Compliance', done: !!s.compliance, active: !!s.receivable && !s.compliance },
    { label: 'Risk', done: !!s.risk, active: !!s.receivable && !s.risk },
    { label: 'Certificates', done: !!(s.compliance?.certified && s.risk?.certified), active: !!s.compliance && !!s.risk && !s.rfqOpen },
    { label: 'RFQ open', done: s.rfqOpen, active: false },
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
        <button className="w-connect" onClick={toggleWalletMenu}><Icon name="card" size={15} /> Connect Wallet</button>
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
                  <div className="disp" style={{ fontWeight: 600, fontSize: 13.5 }}>Connect a party wallet</div>
                  <div className="t-ink3" style={{ fontSize: 11.5, marginTop: 2, lineHeight: 1.45 }}>You&apos;ll join the RFQ as <span className="t-ink2">{intentName}</span> — your ledger view follows the selected role.</div>
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

function Seg({ opts, val, onPick }: { opts: { label: string; value: string | number }[]; val: string | number; onPick: (v: string | number) => void }) {
  return (
    <div className="seg">
      {opts.map((o) => (
        <button key={String(o.value)} className={o.value === val ? 'on' : ''} onClick={() => onPick(o.value)}>{o.label}</button>
      ))}
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
      <div className="panel-h"><h2 className="lg">Register Receivable</h2><span className="spacer" /><span className="chip ghost">Seller-only · registrar = owner</span></div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
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
  const [funders, setFunders] = useState<string[]>(['A', 'B', 'C']);
  const toggle = (k: string) => setFunders((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const eligible = !!comp && comp.sellerEligible && comp.rfqEligible;
  const ready = eligible && !!risk && funders.length > 0;
  return (
    <section className="panel">
      <div className="panel-h"><h2 className="lg">Open RFQ</h2><span className="spacer" /><span className="chip ghost">certificate-backed</span></div>
      <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
        <p className="t-ink3" style={{ fontSize: 12.5, lineHeight: 1.5 }}>Opening the RFQ derives a <b>Compliance Certificate</b> and <b>Risk Certificate</b> from the attestations, then creates one private <b>RFQRequest</b> per invited Funder — each Funder sees only its own.</p>
        <Field label="Invite Funders">
          <div style={{ display: 'flex', gap: 8 }}>
            {['A', 'B', 'C'].map((k) => (
              <button key={k} className={'btn sm ' + (funders.includes(k) ? 'accent' : 'dark')} style={{ flex: 1 }} onClick={() => toggle(k)}>Funder {k}</button>
            ))}
          </div>
        </Field>
        <AttestStatus risk={risk} comp={comp} />
        {!eligible && comp && <p className="t-red" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Compliance marked the package not eligible — the certificate choice will reject. Re-issue an eligible attestation to proceed.</p>}
        <button className="btn accent block" disabled={!ready} onClick={() => onOpen(funders)}>
          <Icon name="send" size={16} sw={2.4} /> Open RFQ to {funders.length} Funder{funders.length === 1 ? '' : 's'}
        </button>
        {(!comp || !risk) && <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Issue both attestations first — from the <b>Compliance</b> and <b>Risk Assessor</b> roles.</p>}
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

  // Step 1 — register the Receivable
  if (!rcv) return (
    <div className="grid-origination">
      <ReceivableForm onCreate={createReceivable} />
      <StepHint title="Step 1 · Originate" body="Register the Receivable you want to finance. It is private to you on the ledger (registrar == owner) — the raw Debtor identity never leaves this contract. Next, gather the Compliance and Risk attestations, then open the RFQ." risk={risk} comp={comp} />
    </div>
  );

  const receivableCard = (
    <section className="panel">
      <div className="panel-h"><h2>Receivable</h2><span className="spacer" /><span className="h-tag">{rcv.invoiceId}</span></div>
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
      <div className="panel-h"><h2>Debtor</h2></div>
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
            <div className="t">RFQ package assembled.</div>
            <div className="s">Two Seller-derived certificates back the request, and each Funder received its own private RFQRequest — hidden from every other Funder.</div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-h"><h2 className="lg">Certificates</h2><span className="spacer" /><span className="chip ghost">Seller-derived</span></div>
          <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <StatusRow k="Compliance certificate" v={comp?.certified ? 'Derived' : 'Pending'} ok={!!comp?.certified} />
            <StatusRow k="Risk certificate" v={risk?.certified ? 'Derived' : 'Pending'} ok={!!risk?.certified} />
            <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 2 }}>Each certificate exposes only the Funder-visible certified terms — not the full compliance disclosure or raw risk data.</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-h">
            <h2 className="lg">Per-Funder RFQ requests</h2>
            <span className="h-tag">{state.requests.length} sent</span>
            <span className="spacer" />
            <span className="chip ghost"><Icon name="eyeoff" size={12} /> Funders isolated</span>
          </div>
          <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {state.requests.map((r) => <RFQRequestCard key={r.cid} r={r} />)}
            <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Quoting, selection and settlement are Phase 2/3 — not on the ledger yet. Phase 1 ends with these private requests. Verify per-party isolation on <b>/ledger</b>.</p>
          </div>
        </section>
      </div>
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
  const { state, invitedFunders, requestFor, setFunderTab } = useStore();
  const invited = invitedFunders;
  useEffect(() => { if (invited.length && !invited.includes(state.funderTab)) setFunderTab(invited[0]); }, [invited, state.funderTab, setFunderTab]);
  const ft = invited.includes(state.funderTab) ? state.funderTab : (invited[0] ?? state.funderTab);
  const req = requestFor(ft);

  if (!state.rfqOpen || !req) return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <section className="panel">
        <div className="panel-h"><h2 className="lg">No open RFQ</h2><span className="spacer" /><span className="chip ghost">waiting</span></div>
        <div className="panel-b">
          <p className="t-ink2" style={{ fontSize: 13, lineHeight: 1.6 }}>No RFQRequest has been addressed to you yet. Once the Seller opens the RFQ, your private RFQ Disclosure Package appears here — and only yours.</p>
          <p className="t-mut" style={{ fontSize: 12, marginTop: 8 }}>Switch to <span className="t-accent">Seller</span> to register a Receivable, gather attestations and open the RFQ.</p>
        </div>
      </section>
    </div>
  );

  const pkg = [
    { label: 'Certified receivable amount', value: fmtAmount(req.payableAmount, req.currency), redacted: false },
    { label: 'Payment terms', value: req.paymentTerms, redacted: false },
    { label: 'Issue date', value: req.issueDate, redacted: false },
    { label: 'Due date', value: req.dueDate, redacted: false },
    { label: 'Certified risk tier', value: TIER_LABEL[req.riskTier] ?? req.riskTier, redacted: false },
    { label: 'Response deadline', value: req.responseDeadline.replace('T', ' ').replace('Z', ' UTC'), redacted: false },
    { label: 'Raw Debtor identity', value: 'withheld — Seller-only', redacted: true },
    { label: 'Full compliance disclosure', value: 'withheld — Compliance-only', redacted: true },
    { label: 'Other Funders’ requests', value: 'not visible to you', redacted: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>You are viewing as</div>
        <div className="funder-tabs">
          {invited.map((k) => (
            <button key={k} className={'ftab' + (k === ft ? ' on' : '')} onClick={() => setFunderTab(k)}>
              <div className="lab">Funder {k} · {FUNDER_PARTY_NAMES[k] ?? '—'}</div>
              <div className="sub">other requests hidden</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid-funder">
        <section className="panel">
          <div className="panel-h"><h2>RFQ Disclosure Package</h2><span className="spacer" /><span className="mono t-accent" style={{ fontSize: 10 }}>certificate-backed</span></div>
          <div style={{ padding: '6px 17px 14px' }}>
            {pkg.map((d) => (
              <div key={d.label} className="kvrow">
                <span className="k">{d.label}</span>
                {d.redacted
                  ? <span className="redact-tag"><Icon name="lock" size={11} />{d.value}</span>
                  : <span className="v">{d.value}</span>}
              </div>
            ))}
          </div>
        </section>

        <div className="col">
          <section className="panel" style={{ padding: '16px 17px' }}>
            <div className="eyebrow" style={{ marginBottom: 9 }}>Your RFQ status</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="outcome-dot" style={{ background: '#57e3a0' }} />
              <span className="disp" style={{ fontWeight: 600, fontSize: 14.5, color: '#57e3a0' }}>Invited — private request received</span>
            </div>
            <p className="t-mut" style={{ fontSize: 11.5, marginTop: 10, lineHeight: 1.5 }}>Submitting a Private Quote against this request is <span className="t-ink3">Phase 2</span> — not on the ledger yet.</p>
          </section>

          <section className="panel dashed" style={{ padding: '16px 17px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
              <Icon name="eyeoff" size={15} color="#6b7280" />
              <span className="t-ink3" style={{ fontSize: 12.5 }}>Other Funders&apos; requests — <span className="t-ink2" style={{ fontWeight: 600 }}>hidden from you</span></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}><span className="bar" /><span className="bar" /></div>
            <p className="t-mut" style={{ fontSize: 11, marginTop: 11, lineHeight: 1.5 }}>On Canton, each RFQRequest names a single Funder as observer. You cannot see the Receivable, the attestations, the certificates, or any other Funder&apos;s request — confirm it on <b>/ledger</b>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================ COMPLIANCE ============================ */
function ComplianceRoleView() {
  const { state, issueCompliance } = useStore();
  const att = state.compliance;
  const rcv = state.receivable;
  return (
    <div className="grid-centered">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Compliance attestation</h2><span className="spacer" /><span className="h-tag">Compliance Party</span></div>
        <div style={{ padding: '6px 18px 14px' }}>
          {!rcv
            ? <p className="t-mut" style={{ fontSize: 12.5, padding: '8px 0', lineHeight: 1.5 }}>No Receivable yet. Switch to <span className="t-accent">Seller</span> to register one, then attest here.</p>
            : att
              ? <>
                  <AttestRow party="Compliance Party" subject="Seller & RFQ eligibility" result={att.sellerEligible && att.rfqEligible ? 'Eligible' : 'Not eligible'} tone="accent" />
                  <div style={{ ...attRowStyle }}>
                    <span className="t-ink3" style={{ fontSize: 12.5 }}>Compliance certificate</span>
                    <span className={'chip ' + (att.certified ? 'accent' : 'ghost')}>{att.certified ? 'Derived by Seller' : 'Awaiting Seller derivation'}</span>
                  </div>
                  <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 12 }}>Issued on-ledger with the full compliance disclosure. The Seller observes the result and derives a certificate that exposes only the certified terms.</p>
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
  const [eligible, setEligible] = useState(true);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <Field label="Eligibility result">
        <Seg val={eligible ? 'yes' : 'no'} onPick={(v) => setEligible(v === 'yes')} opts={[{ label: 'Eligible', value: 'yes' }, { label: 'Not eligible', value: 'no' }]} />
      </Field>
      <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5 }}>Sets both <span className="mono">sellerEligible</span> and <span className="mono">rfqEligible</span>. A not-eligible attestation blocks the Seller&apos;s certificate derivation.</p>
      <button className="btn accent block" onClick={() => onIssue(eligible, eligible)}>
        <Icon name="check" size={15} sw={2.3} /> Issue Compliance Attestation
      </button>
    </div>
  );
}

/* ============================ RISK ============================ */
function RiskRoleView() {
  const { state, issueRisk } = useStore();
  const att = state.risk;
  const rcv = state.receivable;
  return (
    <div className="grid-centered">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Risk attestation</h2><span className="spacer" /><span className="h-tag">Risk Assessor</span></div>
        <div style={{ padding: '6px 18px 14px' }}>
          {!rcv
            ? <p className="t-mut" style={{ fontSize: 12.5, padding: '8px 0', lineHeight: 1.5 }}>No Receivable yet. Switch to <span className="t-accent">Seller</span> to register one, then tier it here.</p>
            : att
              ? <>
                  <AttestRow party="Risk Assessor" subject="Receivable risk tier" result={TIER_LABEL[att.riskTier] ?? att.riskTier} tone="amber" />
                  <div style={{ ...attRowStyle }}>
                    <span className="t-ink3" style={{ fontSize: 12.5 }}>Risk certificate</span>
                    <span className={'chip ' + (att.certified ? 'accent' : 'ghost')}>{att.certified ? 'Derived by Seller' : 'Awaiting Seller derivation'}</span>
                  </div>
                  <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 12 }}>Funders receive the certified <span className="t-ink3">tier</span> in their RFQRequest — never the raw Debtor records.</p>
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
      <Field label="Risk tier">
        <Seg val={tier} onPick={(v) => setTier(v as RiskTier)} opts={[{ label: 'Low', value: 'LowRisk' }, { label: 'Medium', value: 'MediumRisk' }, { label: 'High', value: 'HighRisk' }]} />
      </Field>
      <button className="btn accent block" onClick={() => onIssue(tier)}>
        <Icon name="risk" size={15} sw={2} /> Issue Risk Attestation
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
