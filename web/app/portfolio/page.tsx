'use client';

import { useState } from 'react';
import { Icon } from '@/lib/icons';
import { useApp, ADDR } from '@/components/Providers';

const WALLETS: [string, string, string][] = [
  ['CW', 'Canton Wallet', 'DAML party · recommended'],
  ['LE', 'Ledger', 'Hardware signer'],
  ['WC', 'WalletConnect', 'Scan to pair'],
];

const BAL = [
  { a: 'CC', nm: 'Canton Coin', bal: '128,400', usd: '84,102.00', d: '+2.1%', up: true },
  { a: 'USDC', nm: 'USD Coin', bal: '46,920.40', usd: '46,920.40', d: '0.0%', up: null },
  { a: 'ETH', nm: 'Ethereum', bal: '3.42', usd: '11,696.40', d: '+1.4%', up: true },
  { a: 'BTC', nm: 'Bitcoin', bal: '0.184', usd: '11,812.80', d: '−0.6%', up: false },
] as const;

const ACT = [
  { a: 'CC', vs: 'USDC', side: 'buy', sz: '50,000', px: '0.6549', cp: 'Halo Markets', t: 'just now' },
  { a: 'BTC', vs: 'USDC', side: 'sell', sz: '0.50', px: '64,210', cp: 'Volt OTC', t: '2h ago' },
  { a: 'ETH', vs: 'USDC', side: 'buy', sz: '2.00', px: '3,418.5', cp: 'Aurex', t: '5h ago' },
  { a: 'CC', vs: 'USDC', side: 'sell', sz: '80,000', px: '0.6562', cp: 'Tide LP', t: 'yesterday' },
  { a: 'CC', vs: 'USDC', side: 'buy', sz: '120,000', px: '0.6531', cp: 'Halo Markets', t: '2d ago' },
] as const;

const PRIV0 = [
  { t: 'Cloak intent by default', d: 'New RFQs hide direction & size from the public ledger automatically.', on: true },
  { t: 'Disclose to whitelist only', d: 'Only makers on your approved list can ever see a request.', on: true },
  { t: 'Hide settled amounts from explorers', d: 'Counterparties see the fill; third parties see only that a contract was archived.', on: true },
  { t: 'Generate read-only viewing key', d: 'Share an auditor key that reveals history without spend rights.', on: false },
];

export default function PortfolioPage() {
  const { connected, connect, toast } = useApp();
  const [tab, setTab] = useState<'bal' | 'act' | 'priv'>('bal');
  const [priv, setPriv] = useState(PRIV0.map((p) => p.on));

  if (!connected) {
    return (
      <div className="page">
        <div className="gate"><div className="card">
          <div className="orb"><Icon name="wallet" size={36} /></div>
          <h2>Connect a Canton wallet</h2>
          <p>Your balances and trade history live on the privacy-preserving Canton ledger — visible to you and your counterparties, no one else.</p>
          <div className="wallet-opts">
            {WALLETS.map(([ic, name, sub]) => (
              <button key={name} className="wopt" onClick={() => { connect(); toast('Wallet connected · ' + ADDR, 'ok'); }}>
                <span className="ic">{ic}</span>
                <div><b>{name}</b><div className="s">{sub}</div></div>
                <span className="arr"><Icon name="arrow" size={16} /></span>
              </button>
            ))}
          </div>
          <p className="tiny faint" style={{ margin: 0 }}>By connecting you agree to disclose trade legs only to selected counterparties.</p>
        </div></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="pf-head">
        <div className="panel stat">
          <div className="lab">Total portfolio value</div>
          <div className="val" style={{ fontSize: 32 }}>$84,213.40</div>
          <div className="delta up">▲ $1,204.18 · 1.45% today</div>
        </div>
        <div className="panel stat"><div className="lab">Open RFQs</div><div className="val sm">1</div><div className="delta muted">1 cloaked · expiring 22s</div></div>
        <div className="panel stat"><div className="lab">Settled · 30d</div><div className="val sm">$612,940</div><div className="delta up">▲ 41 trades</div></div>
      </div>

      <div className="tabs">
        <button className={tab === 'bal' ? 'on' : ''} onClick={() => setTab('bal')}>Balances</button>
        <button className={tab === 'act' ? 'on' : ''} onClick={() => setTab('act')}>Activity</button>
        <button className={tab === 'priv' ? 'on' : ''} onClick={() => setTab('priv')}>Privacy</button>
      </div>

      {tab === 'bal' && (
        <section className="panel"><div className="panel-b">
          {BAL.map((x, i) => (
            <div className="bal-row" key={x.a} style={{ padding: '14px 0', borderBottom: i < BAL.length - 1 ? '1px solid var(--border)' : undefined }}>
              <span className={'tok ' + x.a.toLowerCase()}>{x.a}</span>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{x.nm}</div><div className="mono tiny muted">{x.bal} {x.a}</div></div>
              <div className="mono" style={{ fontWeight: 600, textAlign: 'right' }}>${x.usd}</div>
              <div className={'delta ' + (x.up === null ? 'muted' : x.up ? 'up' : 'down')}>{x.d}</div>
            </div>
          ))}
        </div></section>
      )}

      {tab === 'act' && (
        <section className="panel">
          <div className="panel-h"><h2>Settlement history</h2><span className="spacer" /><span className="badge accent"><Icon name="lock" size={12} /> private to you</span></div>
          <div className="panel-b" style={{ paddingTop: 6, overflowX: 'auto' }}>
            <table className="tbl">
              <thead><tr><th>Pair</th><th>Side</th><th className="r">Size</th><th className="r">Price</th><th className="r hide-sm">Counterparty</th><th className="r">When</th></tr></thead>
              <tbody>
                {ACT.map((x, i) => (
                  <tr key={i}>
                    <td><div className="pair"><span className={'tok sm ' + x.a.toLowerCase()}>{x.a}</span>{x.a}/{x.vs}</div></td>
                    <td><span className={'badge ' + (x.side === 'buy' ? 'buy' : 'sell')}>{x.side.toUpperCase()}</span></td>
                    <td className="r mono">{x.sz}</td>
                    <td className="r mono">{x.px}</td>
                    <td className="r mono hide-sm">{x.cp}</td>
                    <td className="r mono faint">{x.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'priv' && (
        <section className="panel">
          <div className="panel-h"><h2>Privacy controls</h2></div>
          <div className="panel-b" style={{ paddingTop: 4 }}>
            {PRIV0.map((p, i) => (
              <div className="priv-row" key={p.t}>
                <div className="pt"><b>{p.t}</b><p>{p.d}</p></div>
                <button className="switch" role="switch" aria-checked={priv[i]} style={{ marginLeft: 'auto' }}
                  onClick={() => { const v = !priv[i]; setPriv((s) => s.map((x, j) => (j === i ? v : x))); toast(v ? 'Privacy setting enabled' : 'Privacy setting disabled', v ? 'ok' : 'info'); }} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
