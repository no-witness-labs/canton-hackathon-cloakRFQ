'use client';

// Live privacy proof: reads the Canton ledger separately for each configured
// party. Switching party shows only contracts that party is entitled to see;
// the Outsider sees nothing.

import { useCallback, useEffect, useState } from 'react';
import { loadConfig, getParties, listActive, seedDemo, type Contract, type Role } from '@/lib/ledger';

const ROLES: { id: Role; label: string }[] = [
  { id: 'seller', label: 'Seller' },
  { id: 'funderA', label: 'Funder A' },
  { id: 'funderB', label: 'Funder B' },
  { id: 'funderC', label: 'Funder C' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'risk', label: 'Risk' },
  { id: 'coordinator', label: 'Coordinator' },
  { id: 'auditor', label: 'Auditor' },
  { id: 'outsider', label: 'Outsider' },
];

export default function LedgerPage() {
  const [ready, setReady] = useState<boolean | null>(null);
  const [role, setRole] = useState<Role>('seller');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(async (r: Role) => {
    setErr(null);
    try {
      const party = getParties()[r];
      setContracts(await listActive(party));
    } catch (e) { setErr(String(e)); }
  }, []);

  useEffect(() => { (async () => {
    const ok = await loadConfig();
    setReady(ok);
    if (ok) await refresh('seller');
  })(); }, [refresh]);

  const pick = async (r: Role) => { setRole(r); await refresh(r); };
  const seed = async () => { setBusy(true); setErr(null); try { await seedDemo(); await refresh(role); } catch (e) { setErr(String(e)); } finally { setBusy(false); } };

  if (ready === false) return (
    <main style={{ maxWidth: 640, margin: '60px auto', padding: 24, fontFamily: 'var(--font-body), sans-serif', color: 'var(--ink)' }}>
      <h1 className="disp" style={{ fontSize: 20 }}>Sandbox not ready</h1>
      <p className="t-ink3" style={{ marginTop: 8 }}>No <code>/ledger-config.json</code>. Bring up the ledger first:</p>
      <pre style={{ background: 'var(--panel)', padding: 14, borderRadius: 10, marginTop: 10 }}>./scripts/start-sandbox.sh</pre>
      <p className="t-mut" style={{ marginTop: 8, fontSize: 13 }}>Then reload this page.</p>
    </main>
  );

  return (
    <main style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(18px,3vw,30px)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <h1 className="disp" style={{ fontSize: 20, fontWeight: 700 }}>Live ledger</h1>
        <span className="t-mut mono" style={{ fontSize: 12 }}>per-party view · Canton JSON API</span>
        <span className="spacer" style={{ flex: 1 }} />
        <button className="btn accent sm" disabled={busy} onClick={seed}>{busy ? 'Seeding…' : 'Seed demo'}</button>
        <button className="btn dark sm" onClick={() => refresh(role)}>Refresh</button>
      </div>

      <div className="role-switch" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {ROLES.map((r) => (
          <button key={r.id} className={'role-btn' + (r.id === role ? ' on' : '')} onClick={() => pick(r.id)}>
            <span className="lab">{r.label}</span>
            <span className="sub mono">{contractsFor(r.id, role, contracts)}</span>
          </button>
        ))}
      </div>

      {err && <div className="banner red" style={{ marginTop: 14 }}>{err}</div>}

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="t-ink3" style={{ fontSize: 12.5 }}>
          {contracts.length === 0
            ? <><b>{ROLES.find((x) => x.id === role)?.label}</b> sees <b>nothing</b> — not a stakeholder on any contract.</>
            : <><b>{ROLES.find((x) => x.id === role)?.label}</b> sees <b>{contracts.length}</b> contract{contracts.length === 1 ? '' : 's'} it is entitled to:</>}
        </div>
        {contracts.map((c) => (
          <section key={c.contractId} className="panel" style={{ padding: '12px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="chip accent">{c.template}</span>
              <span className="mono t-mut" style={{ fontSize: 10.5 }}>{c.contractId.slice(0, 18)}…</span>
            </div>
            <pre className="mono" style={{ fontSize: 11.5, color: 'var(--ink2)', marginTop: 8, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {JSON.stringify(c.args, null, 2)}
            </pre>
          </section>
        ))}
      </div>
    </main>
  );
}

// Sub-label on the active role button: how many contracts that role currently sees.
function contractsFor(id: Role, active: Role, contracts: Contract[]): string {
  return id === active ? `${contracts.length} visible` : 'switch to view';
}
