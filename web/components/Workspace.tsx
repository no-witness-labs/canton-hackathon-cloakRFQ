'use client';

import { Icon, type IconName } from '@/lib/icons';
import {
  useStore, ROLES, LEGEND, RECV, BOUNDARY, DLEVELS, calc, truncParty,
  type Role, type Quote,
} from '@/lib/store';

export default function Workspace() {
  const { state, setRole } = useStore();
  const role = state.role;
  const lg = LEGEND[role];

  if (state.ready === null) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <div className="mono t-ink3">Connecting to the Canton ledger…</div>
    </div>
  );
  if (state.ready === false) return (
    <div style={{ maxWidth: 560, margin: '60px auto', padding: 24 }}>
      <h1 className="disp" style={{ fontSize: 20, fontWeight: 700 }}>Sandbox not ready</h1>
      <p className="t-ink3" style={{ marginTop: 8 }}>The Canton ledger isn&apos;t reachable. Bring it up, then reload:</p>
      <pre style={{ background: 'var(--panel)', padding: 14, borderRadius: 10, marginTop: 10, color: 'var(--ink2)' }}>./scripts/start-sandbox.sh</pre>
      <p className="t-mut" style={{ marginTop: 8, fontSize: 13 }}>This Workspace now reads live contracts; the per-party proof is at <b>/ledger</b>.</p>
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
              <div className="brand-sub">Private RFQ · Canton</div>
            </div>
          </div>
          <span className="spacer" />
          <span className="live"><span className="dot" /> Live RFQ-4471</span>
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
        {role === 'seller' && <SellerView />}
        {role === 'funder' && <FunderView />}
        {role === 'compliance' && <ComplianceView />}
        {role === 'risk' && <RiskView />}
        {role === 'coordinator' && <CoordinatorView />}
        {role === 'auditor' && <AuditorView />}
        {role === 'outsider' && <OutsiderView />}
      </main>

      <Toast />
    </div>
  );
}

/* ============================ shared ============================ */
function Toast() {
  const { state } = useStore();
  if (!state.toast) return null;
  return (
    <div className="toast"><span className="dot" style={{ background: state.toastColor }} />{state.toast}</div>
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
        { k: 'Entitlements', v: 'No RFQ, quote, identity or settlement visibility', color: '#9aa1ad' },
      ]
    : [
        { k: 'Party ID', v: wParty.id, color: '#cdd2db' },
        { k: 'Participant node', v: wParty.node, color: '#cdd2db' },
        { k: 'Ledger', v: 'Canton Devnet · Demo Settlement Asset', color: '#cdd2db' },
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
                    <div className="mono" style={{ fontSize: 10, color: dotColor, marginTop: 2 }}>{observer ? 'Non-party · observer only' : `${wParty!.badge} · Canton Devnet`}</div>
                  </div>
                </div>
                <div style={{ padding: '10px 16px' }}>
                  {detailRows.map((d) => (
                    <div key={d.k} className="w-detail-row">
                      <span className="eyebrow sm">{d.k}</span>
                      <span className="mono" style={{ fontSize: 12, color: d.color, wordBreak: 'break-all', lineHeight: 1.4 }}>{d.v}</span>
                    </div>
                  ))}
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
                <div className="w-foot">Demo Settlement Asset · Canton Devnet — non-production. No real custody or signing.</div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ k, v, s, accent }: { k: string; v: string; s?: string; accent?: boolean }) {
  return (
    <div className={'stat' + (accent ? ' accent' : '')}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {s && <div className="s">{s}</div>}
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

/* ============================ SELLER ============================ */
function SellerView() {
  const { state, eligible, excludedQ } = useStore();
  return (
    <div className="grid-seller">
      <div className="col">
        {/* receivable */}
        <section className="panel">
          <div className="panel-h"><h2>Receivable</h2><span className="spacer" /><span className="h-tag">{RECV.ref}</span></div>
          <div className="panel-b">
            <div className="face">{RECV.face}</div>
            <div className="t-ink3" style={{ fontSize: 12.5, marginTop: 3 }}>Face value · {RECV.currency} · {RECV.invoice}</div>
            <div className="meta-grid">
              <div className="meta"><div className="k">Due</div><div className="v">{RECV.due}</div></div>
              <div className="meta"><div className="k">Recourse pref</div><div className="v">{RECV.recourse}</div></div>
              <div className="meta"><div className="k">Validity</div><div className="v t-accent" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="check" size={13} sw={2.5} />{RECV.validity}</div></div>
              <div className="meta"><div className="k">Settle pref</div><div className="v">{RECV.settlePref}</div></div>
            </div>
          </div>
        </section>

        {/* debtor */}
        <section className="panel">
          <div className="panel-h"><h2>Debtor</h2></div>
          <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}><span className="t-ink3" style={{ fontSize: 12.5 }}>Identity (to you)</span><span style={{ fontSize: 13, fontWeight: 600 }}>{RECV.debtor}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}><span className="t-ink3" style={{ fontSize: 12.5 }}>Risk attestation</span><span className="chip accent">{RECV.debtorRisk}</span></div>
            <p className="t-mut" style={{ fontSize: 11.5, lineHeight: 1.5, marginTop: 2 }}>Funders receive the <span className="t-ink3">Debtor Risk Attestation</span> — not the raw Debtor identity — before quoting.</p>
          </div>
        </section>

        {/* disclosure boundary */}
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
      </div>

      <div className="col">
        <div className="hook">
          <span className="hook-ic"><Icon name="plus" size={16} /></span>
          <div>
            <div className="t">Disclosure is part of the price.</div>
            <div className="s">The lowest all-in cost isn&apos;t always the Best Compliant Quote — recourse, settlement, debtor notification and required disclosure are priced in too.</div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-h">
            <h2 className="lg">Seller Quote View</h2>
            <span className="h-tag">{eligible.length} eligible</span>
            <span className="spacer" />
            <span className="chip ghost"><Icon name="eyeoff" size={12} /> identities hidden</span>
          </div>

          <div className="panel-b" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {eligible.map((q) => <QuoteCard key={q.key} q={q} />)}
            {excludedQ && (
              <div className="excluded">
                <Icon name="xcircle" size={16} color="#f0795f" />
                <div className="t-ink3" style={{ fontSize: 12 }}><span className="t-ink2" style={{ fontWeight: 600 }}>{excludedQ.label} · {excludedQ.net}</span> — highest headline price, but <span className="t-red">failed the Proof-of-Funds Gate</span>. Not shown as an Eligible Quote.</div>
              </div>
            )}
          </div>

          <div className="action"><ActionZone /></div>
        </section>
      </div>
    </div>
  );
}

function QuoteCard({ q }: { q: Quote }) {
  const { state, fallbackUsed } = useStore();
  const ph = state.phase;
  const isSelected = state.selected === q.key;
  const fbPos = state.fallback.indexOf(q.key);
  const isFallback = fbPos >= 0;
  const isWinner = state.winner === q.key;
  const settled = ph === 'settled';

  let statusLabel = 'Eligible · pending', statusColor = '#9aa1ad';
  if (settled) { if (isWinner) { statusLabel = 'Winner · settled'; statusColor = '#57e3a0'; } else { statusLabel = 'Unselected'; statusColor = '#6b7280'; } }
  else if (ph === 'failed') { if (isSelected) { statusLabel = 'Commitment failure'; statusColor = '#f0795f'; } else if (isFallback) { statusLabel = 'Fallback #' + (fbPos + 1); statusColor = '#e8c15f'; } else { statusLabel = 'Unselected'; statusColor = '#6b7280'; } }
  else if (ph === 'settling') { if (state.settleVia === q.key) { statusLabel = 'Settling…'; statusColor = '#e8c15f'; } else if (isFallback) { statusLabel = 'Fallback #' + (fbPos + 1); statusColor = '#e8c15f'; } else { statusLabel = 'Pending'; statusColor = '#6b7280'; } }
  else if (ph === 'selected') { if (isSelected) { statusLabel = 'Best Compliant Quote'; statusColor = '#57e3a0'; } else if (isFallback) { statusLabel = 'Fallback #' + (fbPos + 1); statusColor = '#e8c15f'; } else { statusLabel = 'Eligible'; statusColor = '#6b7280'; } }

  const hot = ((ph === 'selected' || ph === 'failed') && isSelected) || (settled && isWinner);
  const dim = settled && !isWinner;
  const cls = 'qcard' + (hot ? ' hot' : isFallback && ph !== 'quoting' ? ' fb' : '') + (dim ? ' dim' : '');
  const tagColor = statusColor === '#6b7280' || statusColor === '#9aa1ad' ? '#9aa1ad' : '#0c1217';
  const nameShown = isWinner && settled ? q.name : 'Funder · ' + q.label;
  const idNote = isWinner && settled ? 'identity disclosed — your counterparty' : 'pseudonymous';

  return (
    <div className={cls}>
      <span className="qtag" style={{ background: statusColor, color: tagColor }}>{statusLabel}</span>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
        <span className="q-av">{q.label}</span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="q-name">{nameShown}</div>
          <div className="q-id-note">{idNote}</div>
        </div>
        <div style={{ textAlign: 'right', flex: 'none' }}>
          <div className="q-net">{q.net}</div>
          <div className="q-net-sub">net · {q.disc} disc</div>
        </div>
      </div>

      <div className="q-stats">
        <Stat k="Advance" v={q.adv} s={q.advAmt} />
        <Stat k="Reserve" v={q.reserve} s="on debtor pay" />
        <Stat k="All-in cost" v={q.allIn} s={`${q.allInPct} of face`} />
        <Stat k="Eff. rate" v={q.effApr} s="annualized" accent />
      </div>

      <div className="q-terms">
        <div className="term"><div className="k">Recourse</div><div className="v">{q.recourse}</div></div>
        <div className="term"><div className="k">Settlement</div><div className="v mono">{q.settle}</div></div>
        <div className="term"><div className="k">Notification</div><div className="v">{q.notify}</div></div>
        <div className="term" style={{ gridColumn: '1/-1' }}>
          <div className="k">Required disclosure</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{ fontSize: 12.5 }}>{q.disclosure}</span>
            <span className="dlevel-pill" style={{ color: q.dColor, border: `1px solid ${q.dColor}` }}>{q.dLevel}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 13 }}>
        <span className="mono t-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600 }}><Icon name="check" size={12} sw={2.5} /> Proof-of-Funds passed</span>
        <span className="mono t-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 600 }}><Icon name="check" size={12} sw={2.5} /> Compliance eligible</span>
        <span className="spacer" />
        {ph === 'quoting' && <SelectButton q={q} />}
      </div>
    </div>
  );
}

function SelectButton({ q }: { q: Quote }) {
  const { onSelect } = useStore();
  return <button className="btn accent sm" onClick={() => onSelect(q.key)}>Select as Best Compliant Quote</button>;
}

function FallbackQueue() {
  const { state, qByKey, moveFb } = useStore();
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        <span className="mono t-amber" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Seller-controlled fallback queue</span>
        <span className="t-mut" style={{ fontSize: 11 }}>ordered by your criteria, not headline price</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.fallback.map((k, i) => {
          const q = qByKey(k);
          return (
            <div key={k} className="fb-row">
              <span className="fb-pos">#{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Funder · {q.label}</div>
                <div className="mono t-ink3" style={{ fontSize: 11 }}>{q.net} · {q.recourse} · {q.dLevel} disclosure</div>
              </div>
              <div style={{ display: 'flex', gap: 5, flex: 'none' }}>
                <button className="fb-move" onClick={() => moveFb(k, -1)} disabled={i === 0} aria-label="Move up"><Icon name="up" size={13} sw={2.4} /></button>
                <button className="fb-move" onClick={() => moveFb(k, 1)} disabled={i === state.fallback.length - 1} aria-label="Move down"><Icon name="down" size={13} sw={2.4} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionZone() {
  const { state, qByKey, fallbackUsed, onSettle, onFail, onPromote, onReset } = useStore();
  const ph = state.phase;

  if (ph === 'quoting') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="t-ink3">
      <Icon name="info" size={15} color="#6b7280" />
      <span style={{ fontSize: 12.5 }}>Select the <span className="t-ink2">Best Compliant Quote</span> to open the Settlement Window. Remaining eligible quotes form a Seller-controlled fallback queue.</span>
    </div>
  );

  if (ph === 'selected') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FallbackQueue />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn accent" onClick={onSettle}><Icon name="bolt" size={16} sw={2.4} /> Settle selected quote</button>
        <button className="btn ghost-red" onClick={onFail}>Simulate commitment failure</button>
      </div>
    </div>
  );

  if (ph === 'settling') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '6px 0' }}>
      <span className="spinner" />
      <div><div className="disp" style={{ fontWeight: 600, fontSize: 14 }}>On-Ledger Demo Settlement…</div><div className="t-ink3" style={{ fontSize: 12, marginTop: 1 }}>Assigning Receivable and transferring Demo Settlement Asset — both legs settle or neither does.</div></div>
    </div>
  );

  if (ph === 'failed') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="banner red">
        <Icon name="alert" size={18} color="#f0795f" />
        <div style={{ fontSize: 12.5 }}><b>Commitment Failure</b> — the Selected Quote&apos;s Funder failed to settle before RFQ Finality. Promote a Fallback Quote to recover.</div>
      </div>
      <FallbackQueue />
      <button className="btn amber" onClick={onPromote} style={{ alignSelf: 'flex-start' }}><Icon name="up" size={16} sw={2.4} /> Promote fallback quote</button>
    </div>
  );

  // settled
  const w = qByKey(state.winner!);
  const settledLine = fallbackUsed
    ? `Primary quote failed — ${w.name} promoted from fallback and settled.`
    : `Receivable assigned to ${w.name} · Demo Settlement Asset transferred to Seller.`;
  const rows: { k: string; v: string; color: string }[] = [
    { k: 'Receivable assigned to', v: w.name, color: '#eef0f3' },
    { k: 'Net Purchase Price received', v: w.net, color: '#57e3a0' },
    { k: 'Advance paid now', v: `${w.advAmt} · ${w.adv}`, color: '#eef0f3' },
    { k: 'Reserve released on Debtor payment', v: w.reserve, color: '#eef0f3' },
    { k: 'All-in cost · eff. rate', v: `${w.allIn} · ${w.effApr} APR`, color: '#eef0f3' },
    { k: 'Recourse', v: w.recourse, color: '#eef0f3' },
    { k: 'Settlement', v: `On-Ledger Demo · ${w.settle}`, color: '#eef0f3' },
    { k: 'Debtor Notification', v: w.notify === 'Required' ? 'Required — disclosed sale' : 'Not required — confidential', color: w.notify === 'Required' ? '#e8c15f' : '#57e3a0' },
    { k: 'Fallback', v: fallbackUsed ? 'Used' : 'None', color: fallbackUsed ? '#e8c15f' : '#9aa1ad' },
    { k: 'Demo Settlement Asset', v: 'non-production', color: '#9aa1ad' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(87,227,160,0.14)', display: 'grid', placeItems: 'center', color: '#57e3a0', flex: 'none' }}><Icon name="check" size={21} sw={2.5} /></span>
        <div><div className="disp" style={{ fontWeight: 600, fontSize: 16 }}>Receivable Sale settled</div><div className="t-ink3" style={{ fontSize: 12.5, marginTop: 1 }}>{settledLine}</div></div>
        <span className="spacer" />
        <button className="btn dark sm" onClick={onReset}>Run again</button>
      </div>
      <div className="receipt">
        {rows.map((r) => (
          <div key={r.k} className="receipt-row"><span className="k">{r.k}</span><span className="v" style={{ color: r.color }}>{r.v}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ============================ FUNDER ============================ */
function FunderView() {
  const { state, qByKey, curDraft, setFunderTab, setDraft, submitQuote } = useStore();
  const ft = state.funderTab;
  const cf = qByKey(ft);
  const draft = curDraft();
  const dc = calc(draft.net, draft.advPct);
  const submitted = !!state.quoteEdits[ft];
  const fbi = state.fallback.indexOf(ft);
  const ph = state.phase;

  let fout = 'Submitted — pending Seller selection', foc = '#9aa1ad';
  if (ph === 'settled') { if (state.winner === ft) { fout = 'Won — Receivable assigned to you, settlement complete'; foc = '#57e3a0'; } else { fout = 'Unselected — RFQ finalised with another Funder'; foc = '#6b7280'; } }
  else if (ph === 'failed') { if (state.selected === ft) { fout = 'Your Selected Quote hit Commitment Failure'; foc = '#f0795f'; } else if (fbi >= 0) { fout = 'In fallback queue · position ' + (fbi + 1); foc = '#e8c15f'; } else { fout = 'Unselected'; foc = '#6b7280'; } }
  else if (ph === 'settling') { if (state.settleVia === ft) { fout = 'Settling — On-Ledger Demo Settlement in progress'; foc = '#e8c15f'; } else if (state.selected === ft) { fout = 'Selected — in Settlement Window'; foc = '#57e3a0'; } else if (fbi >= 0) { fout = 'In fallback queue · position ' + (fbi + 1); foc = '#e8c15f'; } else { fout = 'Unselected'; foc = '#6b7280'; } }
  else if (ph === 'selected') { if (state.selected === ft) { fout = 'Selected as Best Compliant Quote'; foc = '#57e3a0'; } else if (fbi >= 0) { fout = 'In fallback queue · position ' + (fbi + 1); foc = '#e8c15f'; } else { fout = 'Not selected — quote still valid'; foc = '#6b7280'; } }

  const pkg = [
    { label: 'Receivable amount', value: '$480,000 USD', redacted: false },
    { label: 'Payment timing', value: 'Due in 45 days · T+45', redacted: false },
    { label: 'Receivable validity', value: 'Verified (attestation)', redacted: false },
    { label: 'Debtor payment risk', value: 'BBB+ · Low (Risk Attestation)', redacted: false },
    { label: 'Seller eligibility', value: 'Eligible (attestation)', redacted: false },
    { label: 'Jurisdiction / compliance', value: 'Eligible (attestation)', redacted: false },
    { label: 'Recourse preference', value: 'Non-recourse preferred', redacted: false },
    { label: 'Settlement preference', value: 'T+2', redacted: false },
    { label: 'Raw Debtor identity', value: 'withheld pre-quote', redacted: true },
    { label: 'Invoice document', value: 'withheld pre-quote', redacted: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 8 }}>You are quoting as</div>
        <div className="funder-tabs">
          {['A', 'B', 'C'].map((k) => {
            const q = qByKey(k);
            return (
              <button key={k} className={'ftab' + (k === ft ? ' on' : '')} onClick={() => setFunderTab(k)}>
                <div className="lab">Funder · {q.label}</div>
                <div className="sub">competing quotes hidden</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid-funder">
        {/* disclosure package */}
        <section className="panel">
          <div className="panel-h"><h2>RFQ Disclosure Package</h2><span className="spacer" /><span className="mono t-accent" style={{ fontSize: 10 }}>attestation-first</span></div>
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

        {/* composer + outcome + competing */}
        <div className="col">
          <section className="panel">
            <div className="panel-h">
              <h2>Compose Private Quote</h2><span className="spacer" />
              {submitted && <span className="chip accent">submitted</span>}
              <span className="mono t-mut" style={{ fontSize: 10 }}>Funder · {cf.label}</span>
            </div>
            <div style={{ padding: '14px 17px 16px', display: 'flex', flexDirection: 'column', gap: 15 }}>
              <div>
                <div className="eyebrow sm" style={{ marginBottom: 7 }}>Net Purchase Price offered</div>
                <div className="netbox">
                  <span className="mono t-ink3" style={{ fontSize: 18 }}>$</span>
                  <input value={draft.net.toLocaleString('en-US')} inputMode="numeric"
                    onChange={(e) => setDraft({ net: parseInt(String(e.target.value).replace(/[^0-9]/g, '')) || 0 })} />
                  <span className="mono t-mut" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>/ $480,000 face</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <Stat k="All-in cost" v={dc.allIn} s={`${dc.allInPct} of face`} />
                <Stat k="Eff. rate" v={dc.effApr} s="annualized" accent />
                <Stat k="Reserve" v={dc.reserve} s="held" />
              </div>

              <div><div className="eyebrow sm" style={{ marginBottom: 7 }}>Advance rate · {dc.advAmt} now</div>
                <Seg val={draft.advPct} onPick={(v) => setDraft({ advPct: Number(v) })} opts={[{ label: '85%', value: 85 }, { label: '88%', value: 88 }, { label: '90%', value: 90 }, { label: '92%', value: 92 }]} /></div>
              <div><div className="eyebrow sm" style={{ marginBottom: 7 }}>Recourse model</div>
                <Seg val={draft.recourse} onPick={(v) => setDraft({ recourse: String(v) })} opts={[{ label: 'Recourse', value: 'Recourse' }, { label: 'Non-recourse', value: 'Non-recourse' }, { label: 'Negotiable', value: 'Negotiable' }]} /></div>
              <div><div className="eyebrow sm" style={{ marginBottom: 7 }}>Settlement timing</div>
                <Seg val={draft.settle} onPick={(v) => setDraft({ settle: String(v) })} opts={[{ label: 'T+1', value: 'T+1' }, { label: 'T+2', value: 'T+2' }, { label: 'T+3', value: 'T+3' }]} /></div>
              <div><div className="eyebrow sm" style={{ marginBottom: 7 }}>Required disclosure <span className="t-amber" style={{ textTransform: 'none', letterSpacing: 0 }}>— priced into the deal</span></div>
                <Seg val={draft.dLevel} onPick={(v) => setDraft({ dLevel: String(v) })} opts={DLEVELS.map((d) => ({ label: d.label, value: d.dLevel }))} /></div>
              <div><div className="eyebrow sm" style={{ marginBottom: 7 }}>Debtor notification</div>
                <Seg val={draft.notify} onPick={(v) => setDraft({ notify: String(v) })} opts={[{ label: 'Required', value: 'Required' }, { label: 'Not required', value: 'Not required' }]} /></div>

              <span className="chip accent" style={{ justifyContent: 'center', padding: 9, borderRadius: 8 }}><Icon name="check" size={12} sw={2.5} /> Proof-of-Funds attached · passes the gate</span>
              <button className="btn accent block" onClick={submitQuote}><Icon name="send" size={16} sw={2.4} /> Submit Private Quote</button>
              <p className="t-mut" style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.5, marginTop: -6 }}>Sealed to the RFQ — competing Funders and the Coordinator never see it. Switch to <span className="t-accent">Seller</span> to watch it land in the Quote View.</p>
            </div>
          </section>

          <section className="panel" style={{ padding: '16px 17px' }}>
            <div className="eyebrow" style={{ marginBottom: 9 }}>Your quote outcome</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="outcome-dot" style={{ background: foc }} />
              <span className="disp" style={{ fontWeight: 600, fontSize: 14.5, color: foc }}>{fout}</span>
            </div>
          </section>

          <section className="panel dashed" style={{ padding: '16px 17px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11 }}>
              <Icon name="eyeoff" size={15} color="#6b7280" />
              <span className="t-ink3" style={{ fontSize: 12.5 }}>Competing Private Quotes — <span className="t-ink2" style={{ fontWeight: 600 }}>hidden from you</span></span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}><span className="bar" /><span className="bar" /></div>
            <p className="t-mut" style={{ fontSize: 11, marginTop: 11, lineHeight: 1.5 }}>In a Blind RFQ, you never see other Funders&apos; pricing or identities. The Coordinator can&apos;t read quote contents either.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================ COMPLIANCE ============================ */
function ComplianceView() {
  const attest = [
    { party: 'Compliance Party', subject: 'Seller eligibility — Northwind Components', result: 'Eligible' },
    { party: 'Compliance Party', subject: 'Jurisdiction & transaction eligibility', result: 'Eligible' },
    { party: 'Compliance Party', subject: 'Funder VC-7 eligibility', result: 'Eligible' },
    { party: 'Compliance Party', subject: 'Funder LC-3 eligibility', result: 'Eligible' },
    { party: 'Compliance Party', subject: 'Funder HF-9 eligibility', result: 'Eligible' },
  ];
  const pof = [
    { label: 'Funder · VC-7', status: 'Passed', ok: true },
    { label: 'Funder · LC-3', status: 'Passed', ok: true },
    { label: 'Funder · HF-9', status: 'Passed', ok: true },
    { label: 'Funder · OX-2', status: 'Failed — excluded', ok: false },
  ];
  return (
    <div className="grid-2">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Eligibility attestations</h2><span className="spacer" /><span className="h-tag">Compliance Party</span></div>
        <div style={{ padding: '6px 18px 12px' }}>
          {attest.map((a) => <AttestRow key={a.subject} a={a} tone="accent" />)}
        </div>
      </section>
      <div className="col">
        <section className="panel">
          <div className="panel-h"><h2>Proof-of-Funds Gate</h2></div>
          <div style={{ padding: '6px 17px 13px' }}>
            {pof.map((p) => (
              <div key={p.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '11px 0', borderBottom: '1px solid var(--line3)' }}>
                <span className="mono" style={{ fontSize: 13 }}>{p.label}</span>
                <span className={'chip ' + (p.ok ? 'accent' : 'red')}>{p.status}</span>
              </div>
            ))}
            <p className="t-mut" style={{ fontSize: 11, lineHeight: 1.5, marginTop: 10, paddingTop: 11, borderTop: '1px solid var(--line3)' }}>Proof-of-Funds is <span className="t-ink3">bid-eligibility evidence only</span> — not a funds lock, reserve, escrow, or settlement guarantee.</p>
          </div>
        </section>
        <HiddenNote title="Private Quote prices & terms — not visible to you">The Compliance Party issues eligibility attestations from scoped data. It does not see Net Purchase Price, fees, or other commercial quote terms — those flow to the Seller as status only.</HiddenNote>
      </div>
    </div>
  );
}

/* ============================ RISK ============================ */
function RiskView() {
  const attest = [
    { party: 'Risk Assessor', subject: 'Receivable validity — INV-4471', result: 'Verified' },
    { party: 'Risk Assessor', subject: 'Debtor Risk — Meridian Retail Group', result: 'BBB+ · Low' },
    { party: 'Risk Assessor', subject: 'Receivable Risk — dilution & dispute', result: 'Low' },
  ];
  return (
    <div className="grid-2">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">Risk attestations</h2><span className="spacer" /><span className="h-tag">Risk Assessor</span></div>
        <div style={{ padding: '6px 18px 12px' }}>
          {attest.map((a) => <AttestRow key={a.subject} a={a} tone="amber" />)}
        </div>
      </section>
      <div className="col">
        <section className="panel" style={{ padding: '16px 17px' }}>
          <div className="eyebrow" style={{ marginBottom: 11 }}>Scope</div>
          <p className="t-ink2" style={{ fontSize: 12, lineHeight: 1.6 }}>The Risk Assessor is a <span className="t-amber">separate scoped role</span> from Compliance, Coordination, and Audit. It evaluates Debtor and Receivable risk and issues attestations so Funders can price risk — without raw Debtor records being disclosed by default.</p>
        </section>
        <HiddenNote title="Out of risk scope — not visible to you">Private Quote prices and terms, eligibility decisions, the Quote Book, and Funder or Seller identities beyond what risk assessment requires are not disclosed to the Risk Assessor.</HiddenNote>
      </div>
    </div>
  );
}

function AttestRow({ a, tone }: { a: { party: string; subject: string; result: string }; tone: 'accent' | 'amber' }) {
  const bg = tone === 'accent' ? 'rgba(87,227,160,0.12)' : 'rgba(232,193,95,0.12)';
  const bd = tone === 'accent' ? 'rgba(87,227,160,0.28)' : 'rgba(232,193,95,0.28)';
  const col = tone === 'accent' ? '#57e3a0' : '#e8c15f';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0', borderBottom: '1px solid var(--line3)' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: bg, border: `1px solid ${bd}`, display: 'grid', placeItems: 'center', color: col, flex: 'none' }}>
        <Icon name={tone === 'accent' ? 'check' : 'risk'} size={15} sw={tone === 'accent' ? 2.5 : 2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.subject}</div>
        <div className="mono t-mut" style={{ fontSize: 11, marginTop: 2 }}>{a.party}</div>
      </div>
      <span className={'chip ' + tone}>{a.result}</span>
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
  const { state, fallbackUsed } = useStore();
  const ph = state.phase;
  const done = '#57e3a0', active = '#e8c15f', pend = '#3a3f48';
  let selSub = 'pending', selC: string = pend, setSub = 'pending', setC: string = pend, finSub = 'pending', finC: string = pend;
  if (ph === 'quoting') { selSub = 'Seller comparing eligible quotes'; selC = active; } else { selSub = 'Best Compliant Quote selected'; selC = done; }
  if (ph === 'settling') { setSub = 'attempting On-Ledger Demo Settlement'; setC = active; }
  else if (ph === 'failed') { setSub = 'Commitment Failure — fallback available'; setC = '#f0795f'; }
  else if (ph === 'settled') { setSub = 'completed' + (fallbackUsed ? ' via fallback' : ''); setC = done; }
  if (ph === 'settled') { finSub = 'reached'; finC = done; } else if (ph === 'failed') { finSub = 'pending — fallback in progress'; finC = active; }

  const steps = [
    { n: '1', label: 'Receivable created', sub: 'RCV-9F2A · $480,000', color: done },
    { n: '2', label: 'Blind RFQ opened', sub: '4 Funders invited', color: done },
    { n: '3', label: 'Disclosure Packages delivered', sub: 'attestation-first', color: done },
    { n: '4', label: 'Private Quotes submitted', sub: '4 received · 1 failed PoF gate', color: done },
    { n: '5', label: 'Seller selection', sub: selSub, color: selC },
    { n: '6', label: 'Settlement Window', sub: setSub, color: setC },
    { n: '7', label: 'RFQ Finality', sub: finSub, color: finC },
  ];

  return (
    <div className="grid-2">
      <section className="panel">
        <div className="panel-h"><h2 className="lg">RFQ workflow status</h2><span className="spacer" /><span className="h-tag">routing only · RFQ-4471</span></div>
        <div style={{ padding: 18 }}>
          {steps.map((t, i) => {
            const dotBg = t.color === pend ? '#1b1e24' : t.color;
            const dotFg = t.color === pend ? '#6b7280' : (t.color === '#f0795f' ? '#fff' : '#0c1217');
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
            <span className="t-ink3" style={{ fontSize: 12.5 }}>Private Quote contents — <span className="t-ink2" style={{ fontWeight: 600 }}>not disclosed to Coordinator</span></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['VC-7', 'LC-3', 'HF-9'].map((l) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono t-mut" style={{ fontSize: 11, width: 64, flex: 'none' }}>{l}</span>
                <span className="bar" style={{ flex: 1, height: 26 }} />
              </div>
            ))}
          </div>
          <p className="t-mut" style={{ fontSize: 11, marginTop: 12, lineHeight: 1.5 }}>The Coordinator routes invitations, deadlines and workflow state — but is not a quote-visible marketplace operator. Quote prices and terms stay sealed.</p>
        </section>
        <section className="panel" style={{ padding: '16px 17px' }}>
          <div className="eyebrow" style={{ marginBottom: 11 }}>Parties routed</div>
          <div className="routed">
            {['Seller', '4 Funders', 'Compliance', 'Risk Assessor', 'Auditor'].map((p) => <span key={p}>{p}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ============================ AUDITOR ============================ */
function AuditorView() {
  const { state, qByKey, fallbackUsed } = useStore();
  const ready = state.phase === 'settled';
  const w = state.winner ? qByKey(state.winner) : null;
  const rows = ready && w ? [
    { k: 'RFQ / workflow reference', v: 'RFQ-4471', color: '#eef0f3' },
    { k: 'Opaque Receivable reference', v: 'RCV-9F2A', color: '#eef0f3' },
    { k: 'Seller eligibility', v: 'Eligible', color: '#57e3a0' },
    { k: 'Winning Funder eligibility', v: 'Eligible · Funder ' + w.label, color: '#57e3a0' },
    { k: 'Risk Attestation reference', v: 'RA-22B7', color: '#eef0f3' },
    { k: 'Proof-of-Funds Gate (winning quote)', v: 'Passed', color: '#57e3a0' },
    { k: 'Quote-selection statement', v: 'Best Compliant Quote on Selection Criteria', color: '#eef0f3' },
    { k: 'Settlement status', v: fallbackUsed ? 'Completed via fallback' : 'Completed', color: '#57e3a0' },
    { k: 'Debtor Notification mode', v: w.notify === 'Required' ? 'Debtor notified' : 'Confidential — not notified', color: w.notify === 'Required' ? '#e8c15f' : '#57e3a0' },
    { k: 'Fallback status', v: fallbackUsed ? 'Fallback used — ' + w.label + ' promoted' : 'None', color: fallbackUsed ? '#e8c15f' : '#9aa1ad' },
    { k: 'RFQ Finality timestamp', v: '2026-06-25 14:32 UTC', color: '#9aa1ad' },
  ] : [];
  const withheld = ['Full RFQ workflow', 'Full Quote Book', 'All Private Quotes', 'Raw Proof-of-Funds data', 'Raw Sensitive Attributes', 'Raw invoice documents', 'Unselected Funder identities', 'Full party records'];

  return (
    <div className="grid-auditor">
      <section className="panel">
        <div className="panel-h">
          <span style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(87,227,160,0.12)', border: '1px solid rgba(87,227,160,0.28)', display: 'grid', placeItems: 'center', color: '#57e3a0', flex: 'none' }}><Icon name="shield" size={16} /></span>
          <h2 className="lg">Scoped Compliance Receipt</h2><span className="spacer" /><span className="h-tag">entitled disclosure</span>
        </div>
        {ready ? (
          <div style={{ padding: '6px 18px 16px' }}>
            {rows.map((r) => (
              <div key={r.k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '11px 0', borderBottom: '1px solid var(--line3)' }}>
                <span className="t-ink3" style={{ fontSize: 12.5 }}>{r.k}</span>
                <span className="mono" style={{ fontSize: 12.5, fontWeight: 500, textAlign: 'right', color: r.color }}>{r.v}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '48px 30px', textAlign: 'center' }}>
            <span style={{ display: 'inline-grid', width: 48, height: 48, borderRadius: 13, background: '#15171c', border: '1px solid var(--line4)', placeItems: 'center', color: '#6b7280', marginBottom: 14 }}><Icon name="clock" size={22} /></span>
            <div className="disp" style={{ fontWeight: 600, fontSize: 14.5 }}>Receipt issued at RFQ Finality</div>
            <p className="t-ink3" style={{ fontSize: 12.5, marginTop: 7, maxWidth: 330, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.55 }}>The Scoped Compliance Receipt is generated once the Receivable Sale settles. Switch to the <span className="t-accent">Seller</span> and complete settlement to populate it.</p>
          </div>
        )}
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
        <p className="t-mut" style={{ fontSize: 11, marginTop: 13, lineHeight: 1.55 }}>Auditors and Regulators verify the compliance trail without ever receiving the full RFQ, Quote Book, or raw evidence.</p>
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
    { hash: '0x71bb··ee04', label: 'Contract archived' },
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
            <div>No Receivable, RFQ, Private Quote, identity, price, or settlement detail is visible to non-parties. Outsiders see only that opaque contracts were created and archived — never <span className="t-accent">what</span>, <span className="t-accent">who</span>, or <span className="t-accent">how much</span>.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
