'use client';

// Transaction explorer: every command the app submits to Canton is recorded here
// with its ledger updateId, offset, record time, and the contracts it created /
// archived. "Verify on ledger" re-fetches the transaction by id from the JSON API,
// proving the entry is authoritative on-chain (not a client-side fabrication).

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  loadConfig, getParties, subscribeTx, getTxLog, getTxVersion, fetchUpdateById, fetchHistory, partyLabel, explorerTxUrl,
  type LedgerTx,
} from '@/lib/ledger';

const short = (s: string, head = 10, tail = 6) => (s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s);
const clock = (iso: string) => (iso.length >= 19 ? iso.slice(11, 19) + ' UTC' : iso);

export default function ActivityPage() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [verified, setVerified] = useState<Record<string, { offset: number; recordTime: string } | 'fail'>>({});
  const [history, setHistory] = useState<LedgerTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState<string | null>(null);          // ?tx=<updateId> deep-link target
  const focusedOnce = useRef(false);

  useSyncExternalStore(subscribeTx, getTxVersion, getTxVersion);

  // Read the ?tx= deep-link from the URL (client-only; avoids useSearchParams Suspense).
  useEffect(() => { setFocus(new URLSearchParams(window.location.search).get('tx')); }, []);

  const load = useCallback(async () => {
    const ok = await loadConfig();
    setReady(ok);
    if (!ok) return;
    setLoading(true);
    try { setHistory(await fetchHistory(getParties().seller)); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  // Merge the persistent ledger history with the live in-session log (dedup by
  // updateId; the session entry wins because it carries the acting party).
  const byId = new Map<string, LedgerTx>();
  for (const t of history) byId.set(t.updateId, t);
  for (const t of getTxLog()) byId.set(t.updateId, { ...(byId.get(t.updateId) ?? t), ...t });
  const txs = [...byId.values()].sort((a, b) => b.offset - a.offset);

  const copy = useCallback((s: string) => { navigator.clipboard?.writeText(s); setCopied(s); setTimeout(() => setCopied(null), 1200); }, []);
  // When arriving via a "View transaction" deep-link, scroll to the row and verify
  // it on-ledger automatically (once it's present in the loaded history).
  useEffect(() => {
    if (!focus || focusedOnce.current) return;
    const tx = txs.find((t) => t.updateId === focus);
    if (!tx) return;
    focusedOnce.current = true;
    document.getElementById('tx-' + focus)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    verify(focus, tx.actAs);
  }, [focus, txs]);  // eslint-disable-line react-hooks/exhaustive-deps
  const verify = useCallback(async (updateId: string, actAs: string) => {
    const party = actAs || getParties().seller;  // hydrated rows have no actAs → query as the Seller (a stakeholder)
    const tx = await fetchUpdateById(updateId, party);
    setVerified((v) => ({ ...v, [updateId]: tx ? { offset: Number(tx.offset ?? 0), recordTime: String(tx.recordTime ?? '') } : 'fail' }));
  }, []);

  return (
    <main style={{ maxWidth: 940, margin: '0 auto', padding: 'clamp(18px,3vw,30px)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <h1 className="disp" style={{ fontSize: 20, fontWeight: 700 }}>Ledger activity</h1>
        <span className="t-mut mono" style={{ fontSize: 12 }}>{loading ? 'loading…' : `${txs.length} transaction${txs.length === 1 ? '' : 's'}`} · Canton JSON API</span>
        <span className="spacer" style={{ flex: 1 }} />
        <button className="btn dark sm" disabled={loading} onClick={load}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      <p className="t-mut" style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 16 }}>
        Every action submits a real Daml transaction. This is the <b>persistent</b> history read from the
        ledger&apos;s update stream — each row is the ledger&apos;s own receipt (its <b>updateId</b>, offset,
        record time, and the contracts it created/archived), and survives reloads.
      </p>

      {ready === false && (
        <div className="banner red">Sandbox not reachable — start it and reload.</div>
      )}
      {ready !== false && !loading && txs.length === 0 && (
        <section className="panel" style={{ padding: '20px 18px' }}>
          <p className="t-ink3" style={{ fontSize: 13, lineHeight: 1.6 }}>No transactions yet for this party.</p>
          <p className="t-mut" style={{ fontSize: 12, marginTop: 6 }}>Interact in the app — issue an attestation, create a Receivable, submit a quote — then Refresh. Everything is recorded permanently on the ledger.</p>
        </section>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {txs.map((tx) => {
          const v = verified[tx.updateId];
          const ex = explorerTxUrl(tx.updateId);
          return (
            <section key={tx.updateId + tx.offset} id={'tx-' + tx.updateId} className="panel"
              style={{ padding: '13px 16px', ...(focus === tx.updateId ? { border: '1px solid var(--accent)', boxShadow: '0 0 0 1px var(--accent)' } : {}) }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span className="chip accent">{tx.label}</span>
                {tx.actAs && <span className="chip ghost">as {partyLabel(tx.actAs)}</span>}
                <span className="spacer" style={{ flex: 1 }} />
                <span className="mono t-mut" style={{ fontSize: 11 }}>offset {tx.offset} · {clock(tx.recordTime)}</span>
              </div>

              <button onClick={() => copy(tx.updateId)} title="click to copy"
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: 'rgba(255,255,255,.03)', border: '1px solid var(--line3)', borderRadius: 8, padding: '7px 10px', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
                <span className="mono t-mut" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>updateId</span>
                <span className="mono t-ink2" style={{ fontSize: 11.5, wordBreak: 'break-all' }}>{short(tx.updateId, 20, 12)}</span>
                <span className="spacer" style={{ flex: 1 }} />
                <span className="mono t-accent" style={{ fontSize: 10 }}>{copied === tx.updateId ? 'copied ✓' : 'copy'}</span>
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10 }}>
                {tx.events.map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span className="mono" style={{ fontSize: 13, width: 12, color: e.kind === 'created' ? 'var(--accent)' : 'var(--red)' }}>{e.kind === 'created' ? '+' : '−'}</span>
                    <span className="chip" style={{ background: e.kind === 'created' ? 'rgba(87,227,160,.1)' : 'rgba(240,121,95,.1)', color: e.kind === 'created' ? 'var(--accent)' : 'var(--red)' }}>{e.template}</span>
                    <span className="mono t-mut" style={{ fontSize: 10.5 }}>{short(e.contractId, 8, 6)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11, flexWrap: 'wrap' }}>
                <button className="btn dark sm" onClick={() => verify(tx.updateId, tx.actAs)}>Verify on ledger</button>
                {ex && (
                  <a className="btn dark sm" href={`/tx/${tx.updateId}`} target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }} title="Open this transaction on the 5N Lighthouse explorer (waits for indexing)">
                    Explore on Lighthouse ↗
                  </a>
                )}
                {v === 'fail' && <span className="mono t-red" style={{ fontSize: 11 }}>not found</span>}
                {v && v !== 'fail' && <span className="mono t-accent" style={{ fontSize: 11 }}>✓ confirmed on-ledger · offset {v.offset} · {clock(v.recordTime)}</span>}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
