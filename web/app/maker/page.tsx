'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/lib/icons';
import { fmt } from '@/lib/format';
import { useApp } from '@/components/Providers';

interface Rfq { id: string; dir: 'buy' | 'sell'; sz: number; asset: string; vs: string; mid: number; ttl0: number }
interface Fill { a: string; vs: string; s: string; side: 'buy' | 'sell'; sz: string; px: string; t: string }
type Status = { state: 'open' | 'quoted' | 'won' | 'passed' | 'expired'; price?: string };

const RFQS: Rfq[] = [
  { id: 'taker::a91f', dir: 'buy', sz: 50000, asset: 'CC', vs: 'USDC', mid: 0.655, ttl0: 26 },
  { id: 'taker::4c7d', dir: 'sell', sz: 12, asset: 'BTC', vs: 'USDC', mid: 64200, ttl0: 19 },
  { id: 'fund::deX2', dir: 'buy', sz: 180, asset: 'ETH', vs: 'USDC', mid: 3420, ttl0: 33 },
  { id: 'taker::71bb', dir: 'sell', sz: 240000, asset: 'CC', vs: 'USDC', mid: 0.655, ttl0: 14 },
];

const INV = [
  { a: 'CC', bal: '1,920,400', usd: '$1.26M', skew: 64, dir: 'long' },
  { a: 'USDC', bal: '612,800', usd: '$612.8K', skew: 50, dir: 'flat' },
  { a: 'ETH', bal: '74.2', usd: '$253.8K', skew: 38, dir: 'short' },
  { a: 'BTC', bal: '2.55', usd: '$163.7K', skew: 46, dir: 'flat' },
];

const SEED_FILLS: Fill[] = [
  { a: 'CC', vs: 'USDC', s: 'BOUGHT', side: 'buy', sz: '88,000', px: '0.6541', t: '2m' },
  { a: 'ETH', vs: 'USDC', s: 'SOLD', side: 'sell', sz: '45', px: '3,422.10', t: '9m' },
  { a: 'BTC', vs: 'USDC', s: 'BOUGHT', side: 'buy', sz: '1.20', px: '64,180', t: '14m' },
  { a: 'CC', vs: 'USDC', s: 'SOLD', side: 'sell', sz: '120,000', px: '0.6558', t: '21m' },
];

const midStr = (r: Rfq) => (r.mid >= 100 ? fmt(r.mid, 0) : r.mid.toFixed(4));
const suggested = (r: Rfq) => {
  const p = r.dir === 'buy' ? r.mid * 1.0012 : r.mid * 0.9988;
  return r.mid >= 100 ? p.toFixed(2) : p.toFixed(4);
};

export default function MakerPage() {
  const { requireWallet, toast } = useApp();
  const [status, setStatus] = useState<Record<string, Status>>(() => Object.fromEntries(RFQS.map((r) => [r.id, { state: 'open' as const }])));
  const [ttls, setTtls] = useState<Record<string, number>>(() => Object.fromEntries(RFQS.map((r) => [r.id, r.ttl0])));
  const [price, setPrice] = useState<Record<string, string>>(() => Object.fromEntries(RFQS.map((r) => [r.id, suggested(r)])));
  const [fills, setFills] = useState<Fill[]>(SEED_FILLS);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ttl tick for open RFQs only
  useEffect(() => {
    const iv = setInterval(() => {
      setTtls((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const r of RFQS) {
          if (status[r.id]?.state === 'open' && next[r.id] > 0) { next[r.id] = next[r.id] - 1; changed = true; }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [status]);

  // expire when ttl hits 0
  useEffect(() => {
    for (const r of RFQS) {
      if (status[r.id]?.state === 'open' && ttls[r.id] <= 0) {
        setStatus((s) => ({ ...s, [r.id]: { state: 'expired' } }));
      }
    }
  }, [ttls, status]);

  const sendQuote = (r: Rfq) => requireWallet(() => {
    const p = price[r.id];
    setStatus((s) => ({ ...s, [r.id]: { state: 'quoted', price: p } }));
    toast('Quote sent to ' + r.id + ' — privately', 'info');
    timers.current.push(setTimeout(() => {
      const won = Math.random() > 0.45;
      setStatus((s) => ({ ...s, [r.id]: { state: won ? 'won' : 'passed', price: p } }));
      if (won) {
        toast('You won the fill on ' + r.asset + ' — settled atomically', 'ok');
        setFills((f) => [{ a: r.asset, vs: r.vs, s: r.dir === 'buy' ? 'SOLD' : 'BOUGHT', side: r.dir === 'buy' ? 'sell' : 'buy', sz: fmt(r.sz, 0), px: p, t: 'now' }, ...f]);
      }
    }, 1400 + Math.random() * 1200));
  });

  const activeCount = RFQS.filter((r) => status[r.id]?.state === 'open').length;

  return (
    <div className="page wide">
      <div className="stats">
        <div className="panel stat"><div className="lab">Quoted volume · 24h</div><div className="val">$4.82M</div><div className="delta up">▲ 11.4%</div></div>
        <div className="panel stat"><div className="lab">Win rate</div><div className="val">38.6<span style={{ fontSize: 15 }}>%</span></div><div className="delta up">▲ 2.1pp</div></div>
        <div className="panel stat"><div className="lab"><span className="badge accent" style={{ padding: '2px 7px' }}><span className="live" /></span> Active RFQs</div><div className="val">{activeCount}</div><div className="delta muted">awaiting quote</div></div>
        <div className="panel stat"><div className="lab">Inventory value</div><div className="val">$2.14M</div><div className="delta down">▼ 0.3%</div></div>
        <div className="panel stat"><div className="lab">Realized P&amp;L · 24h</div><div className="val" style={{ color: 'var(--buy)' }}>+$9,840</div><div className="delta up">86 fills</div></div>
      </div>

      <div className="desk">
        <section className="panel">
          <div className="panel-h"><h2>Incoming RFQs</h2><span className="spacer" /><span className="badge accent"><Icon name="lock" size={12} /> disclosed to you</span></div>
          <div>
            {RFQS.map((r) => {
              const st = status[r.id];
              return (
                <div className={'rfq' + (st.state !== 'open' && st.state !== 'quoted' ? ' done' : '')} key={r.id}>
                  <div className="who">
                    <span className={'badge ' + (r.dir === 'buy' ? 'buy' : 'sell')}>{r.dir.toUpperCase()}</span>
                    <span className="id"><Icon name="lock" size={12} />cloaked · {r.id}</span>
                  </div>
                  <div className="deal">
                    <span className={'tok ' + r.asset.toLowerCase()}>{r.asset}</span>
                    <div>
                      <div className="sz">{fmt(r.sz, 0)} {r.asset}</div>
                      <div className="sub">vs {r.vs} · mid {midStr(r)}</div>
                      {st.state === 'open' && <div className="ttls">⏱ {Math.max(0, ttls[r.id])}s left</div>}
                    </div>
                  </div>
                  <div className="quote-in">
                    {st.state === 'open' && (
                      <>
                        <input value={price[r.id]} aria-label="Your price" onChange={(e) => setPrice((p) => ({ ...p, [r.id]: e.target.value }))} />
                        <button className="btn pri sm" onClick={() => sendQuote(r)}>Quote</button>
                      </>
                    )}
                    {st.state === 'quoted' && <span className="badge accent"><span className="live" /> quoted {st.price}</span>}
                    {st.state === 'won' && <span className="badge buy"><Icon name="check" size={12} /> filled {st.price}</span>}
                    {st.state === 'passed' && <span className="badge">passed · better quote won</span>}
                    {st.state === 'expired' && <span className="badge">RFQ expired</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid" style={{ gap: 18 }}>
          <section className="panel">
            <div className="panel-h"><h2>Inventory</h2><span className="spacer" /><span className="badge">auto-skew</span></div>
            <div className="panel-b">
              {INV.map((x) => {
                const col = x.dir === 'long' ? 'var(--buy)' : x.dir === 'short' ? 'var(--sell)' : 'var(--accent)';
                const left = x.skew < 50 ? x.skew : 50;
                const w = Math.abs(x.skew - 50);
                return (
                  <div className="inv-row" key={x.a}>
                    <span className={'tok ' + x.a.toLowerCase()}>{x.a}</span>
                    <div>
                      <div className="nm">{x.a}</div>
                      <div className="am">{x.bal} · {x.usd}</div>
                      <div className="skew" style={{ marginTop: 7 }}>
                        <i style={{ left: left + '%', width: w + '%', background: col }} />
                        <i style={{ left: '50%', width: 1, background: 'var(--faint)' }} />
                      </div>
                    </div>
                    <span className="badge" style={{ color: col }}>{x.dir}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel">
            <div className="panel-h"><h2>Recent fills</h2></div>
            <div className="panel-b" style={{ paddingTop: 6 }}>
              <table className="tbl"><tbody>
                {fills.map((x, i) => (
                  <tr key={i}>
                    <td><div className="pair"><span className={'tok sm ' + x.a.toLowerCase()}>{x.a}</span>{x.a}/{x.vs}</div></td>
                    <td><span className={'badge ' + (x.side === 'buy' ? 'buy' : 'sell')}>{x.s}</span></td>
                    <td className="r mono">{x.sz}</td>
                    <td className="r mono">{x.px}</td>
                    <td className="r mono faint">{x.t}</td>
                  </tr>
                ))}
              </tbody></table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
