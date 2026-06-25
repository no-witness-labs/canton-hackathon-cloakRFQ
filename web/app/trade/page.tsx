'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/lib/icons';
import { fmt, usd, jitter } from '@/lib/format';
import { useApp } from '@/components/Providers';

type Dir = 'buy' | 'sell';
type Phase = 'idle' | 'broadcasting' | 'quotes' | 'settling' | 'done';
type Asset = 'CC' | 'USDC' | 'ETH' | 'BTC';
interface Quote { k: string; name: string; tag: string; price: number; ttl: number; max: number }
interface Receipt { dir: Dir; asset: Asset; sz: number; price: number; cost: number; maker: string }

const PX: Record<Asset, number> = { CC: 0.655, USDC: 1, ETH: 3420, BTC: 64200 };
const MAKERS: Record<string, { name: string; tag: string; spread: number }> = {
  Halo: { name: 'Halo Markets', tag: 'AA · 2ms', spread: 0.0011 },
  Aurex: { name: 'Aurex', tag: 'A+ · 4ms', spread: 0.0019 },
  Tide: { name: 'Tide LP', tag: 'A · 3ms', spread: 0.0026 },
  Volt: { name: 'Volt OTC', tag: 'A+ · 6ms', spread: 0.0015 },
};
const num = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;

export default function TradePage() {
  const { requireWallet, toast } = useApp();
  const [dir, setDir] = useState<Dir>('buy');
  const [cloak, setCloak] = useState(true);
  const [pay, setPay] = useState<Asset>('USDC');
  const [get, setGet] = useState<Asset>('CC');
  const [size, setSize] = useState('50,000');
  const [sel, setSel] = useState<Record<string, boolean>>({ Halo: true, Aurex: true, Tide: true, Volt: false });
  const [phase, setPhase] = useState<Phase>('idle');
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sz = num(size);
  const notional = sz * (PX[get] || 0);
  const verb = dir === 'buy' ? 'Buy' : 'Sell';

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => () => clearTimers(), []);

  // ttl countdown while quotes are live
  useEffect(() => {
    if (phase !== 'quotes') return;
    const iv = setInterval(() => setQuotes((qs) => qs.map((q) => ({ ...q, ttl: q.ttl - 1 }))), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  const swap = () => { setPay(get); setGet(pay); };

  const request = () => {
    const makers = Object.keys(sel).filter((k) => sel[k]);
    if (!makers.length) { toast('Select at least one maker to disclose to', 'info'); return; }
    if (!sz) { toast('Enter a size', 'info'); return; }
    requireWallet(() => runQuotes(makers));
  };

  const runQuotes = (makers: string[]) => {
    clearTimers();
    setReceipt(null);
    setQuotes([]);
    setPhase('broadcasting');
    const mid = PX[get] || 1;
    const data: Quote[] = makers.map((k, i) => {
      const m = MAKERS[k];
      const j = jitter(k.length + i);
      const edge = m.spread * (0.6 + j * 0.9);
      const price = dir === 'buy' ? mid * (1 + edge) : mid * (1 - edge);
      const ttl = 22 + Math.round(j * 12);
      return { k, name: m.name, tag: m.tag, price, ttl, max: ttl };
    });
    data.sort((a, b) => (dir === 'buy' ? a.price - b.price : b.price - a.price));

    timers.current.push(setTimeout(() => {
      setPhase('quotes');
      data.forEach((q, i) => {
        timers.current.push(setTimeout(() => setQuotes((prev) => [...prev, q]), i * 480));
      });
    }, 1100));
  };

  const settle = (q: Quote) => {
    clearTimers();
    const cost = q.price * sz;
    setPhase('settling');
    timers.current.push(setTimeout(() => {
      setReceipt({ dir, asset: get, sz, price: q.price, cost, maker: q.name });
      setPhase('done');
      toast('Trade settled atomically with ' + q.name, 'ok');
    }, 1700));
  };

  const reset = () => { clearTimers(); setPhase('idle'); setQuotes([]); setReceipt(null); };

  const dp = get === 'CC' ? 4 : 2;
  const qTitle = phase === 'idle' ? 'Competing quotes'
    : phase === 'settling' || phase === 'done' ? (phase === 'done' ? 'Settled' : 'Settling')
    : `${verb} ${fmt(sz, 0)} ${get}`;

  return (
    <div className="page wide">
      <div className="trade-grid">
        {/* ---------- TICKET ---------- */}
        <section className="panel ticket">
          <div className="panel-h"><h2>New RFQ ticket</h2><span className="spacer" /><span className="badge"><Icon name="clock" size={12} /> 30s expiry</span></div>
          <div className="panel-b">
            <div className="seg dir" style={{ width: '100%' }}>
              <button data-v="buy" className={dir === 'buy' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setDir('buy')}>Buy</button>
              <button data-v="sell" className={dir === 'sell' ? 'on' : ''} style={{ flex: 1 }} onClick={() => setDir('sell')}>Sell</button>
            </div>

            <div className="pair-row">
              <div className="field">
                <label>You pay</label>
                <select className="select" value={pay} onChange={(e) => setPay(e.target.value as Asset)}>
                  <option value="USDC">USDC</option><option value="ETH">ETH</option><option value="BTC">BTC</option><option value="CC">CC</option>
                </select>
              </div>
              <button className="swapbtn" aria-label="Swap" onClick={swap}><Icon name="swap" size={16} /></button>
              <div className="field">
                <label>You receive</label>
                <select className="select" value={get} onChange={(e) => setGet(e.target.value as Asset)}>
                  <option value="CC">CC · Canton Coin</option><option value="ETH">ETH</option><option value="BTC">BTC</option><option value="USDC">USDC</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Size ({get})</label>
              <input className="input num" inputMode="decimal" value={size} onChange={(e) => setSize(e.target.value)} />
              <div className="row between tiny faint">
                <span>≈ <span className="mono">{usd(notional)}</span> notional</span>
                <span>Balance <span className="mono">128,400 CC</span></span>
              </div>
            </div>

            <div className="cloak-card">
              <div className="ch">
                <Icon name="lock" size={17} /><b>Cloak intent</b>
                <button className="switch" role="switch" aria-checked={cloak} aria-label="Cloak intent" style={{ marginLeft: 'auto' }}
                  onClick={() => { const v = !cloak; setCloak(v); toast(v ? 'Intent cloaked — public ledger sees nothing' : 'Intent public — visible on the order book', v ? 'info' : 'ok'); }} />
              </div>
              <p className="tiny muted" style={{ marginTop: 8 }}>Direction and size are encrypted on-ledger and disclosed <b>only</b> to the makers you select — never to the public mempool. Settlement reveals nothing to non-parties.</p>
              <div className="preview">
                <div>
                  <div className="t">Public ledger sees</div>
                  <div className="line">
                    {cloak ? (<><span className="enc">RFQ·════</span><br /><span className="enc">════════</span></>)
                      : (<>{verb} {fmt(sz, 0)} {get}<br />vs {pay}</>)}
                  </div>
                </div>
                <div>
                  <div className="t">Selected makers see</div>
                  <div className="line muted">{verb} {fmt(sz, 0)} {get}<br />vs {pay}</div>
                </div>
              </div>
            </div>

            <div className="field">
              <label>Disclose to</label>
              <div className="makers-pick">
                {Object.entries(MAKERS).map(([k, m]) => (
                  <span key={k} className="mk" role="checkbox" aria-checked={!!sel[k]} onClick={() => setSel((s) => ({ ...s, [k]: !s[k] }))}>
                    <span className="dot" />{m.name}
                  </span>
                ))}
              </div>
            </div>

            <button className="btn pri block" style={{ fontSize: 15, padding: 14 }} onClick={request}><Icon name="bolt" size={16} /> Request quotes</button>
            <p className="tiny faint" style={{ textAlign: 'center', marginTop: -4 }}>Firm quotes · no slippage · atomic settlement on Canton</p>
          </div>
        </section>

        {/* ---------- QUOTES ---------- */}
        <section className="panel" style={{ minHeight: 480 }}>
          <div className="panel-h">
            <h2>{qTitle}</h2><span className="spacer" />
            {phase === 'quotes' && <span className="badge"><span className="live" /> {quotes.length} makers</span>}
          </div>

          {phase === 'idle' && (
            <div className="quotes-empty">
              <div>
                <div className="big"><Icon name="shield" size={26} /></div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>No active request</h3>
                <p className="muted tiny" style={{ maxWidth: 340 }}>Build a cloaked ticket and broadcast it. Selected makers respond with firm, executable quotes — you accept the best one. Your intent never touches the public order book.</p>
              </div>
            </div>
          )}

          {phase === 'broadcasting' && (
            <div className="quotes-empty"><div><div className="ring sm" /><p className="muted tiny">Broadcasting cloaked RFQ to {Object.keys(sel).filter((k) => sel[k]).length} makers…</p></div></div>
          )}

          {phase === 'quotes' && (
            <div className="panel-b">
              <div className="qlist">
                {quotes.map((q, i) => {
                  const best = i === 0;
                  const expired = q.ttl <= 0;
                  const cost = q.price * sz;
                  return (
                    <div className={'quote' + (best ? ' best' : '')} key={q.k} style={expired ? { opacity: 0.4 } : undefined}>
                      {best && <span className="best-tag">BEST PRICE</span>}
                      <div className="mkr">
                        <span className="av">{q.name.slice(0, 2).toUpperCase()}</span>
                        <div><b>{q.name}</b><div className="sub">{q.tag} · firm</div></div>
                      </div>
                      <div className="px"><div className="p">{q.price.toFixed(dp)}</div><div className="recv">{dir === 'buy' ? 'pay ' : 'recv '}{usd(cost)}</div></div>
                      <div className="ttl"><div className="ttlbar"><i style={{ width: Math.max(0, (q.ttl / q.max) * 100) + '%' }} /></div></div>
                      <div className="act">
                        {expired ? <span className="badge">expired</span>
                          : <button className={'btn ' + (best ? 'pri ' : '') + 'sm'} style={{ width: '100%' }} onClick={() => settle(q)}>Accept</button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {phase === 'settling' && (
            <div className="settle"><div><div className="ring" /><h3 style={{ fontSize: 16 }}>Atomic settlement on Canton</h3><p className="muted tiny" style={{ marginTop: 8 }}>Building privacy-preserving exercise · both legs settle or neither does</p></div></div>
          )}

          {phase === 'done' && receipt && (
            <div className="settle"><div style={{ width: '100%' }}>
              <div className="done"><Icon name="check" size={30} /></div>
              <h3 style={{ fontSize: 18 }}>Trade settled</h3>
              <p className="muted tiny" style={{ marginTop: 6 }}>Disclosed only to {receipt.maker}. No public footprint.</p>
              <div className="receipt">
                <div className="rr"><span className="k">Filled</span><span className="mono">{receipt.dir === 'buy' ? '+' : '−'}{fmt(receipt.sz, 0)} {receipt.asset}</span></div>
                <div className="rr"><span className="k">Price</span><span className="mono">{receipt.price.toFixed(receipt.asset === 'CC' ? 4 : 2)}</span></div>
                <div className="rr"><span className="k">{receipt.dir === 'buy' ? 'Paid' : 'Received'}</span><span className="mono">{usd(receipt.cost)}</span></div>
                <div className="rr"><span className="k">Counterparty</span><span className="mono">{receipt.maker}</span></div>
                <div className="rr"><span className="k">Settlement</span><span className="mono" style={{ color: 'var(--buy)' }}>atomic · 1 block</span></div>
                <div className="rr"><span className="k">Tx</span><span className="mono">cloak::{Math.abs(Math.round(receipt.cost)).toString(16)}a4</span></div>
              </div>
              <button className="btn block" style={{ marginTop: 18 }} onClick={reset}>New request</button>
            </div></div>
          )}
        </section>
      </div>
    </div>
  );
}
