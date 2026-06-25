import Link from 'next/link';
import { Icon } from '@/lib/icons';

const STEPS = [
  { n: '01', icon: 'lock', t: 'Cloak the request', p: "Pick a pair, size and direction. It's encrypted on-ledger before it ever leaves your wallet." },
  { n: '02', icon: 'layers', t: 'Disclose to makers', p: 'Only the makers you whitelist can decrypt and price the request — no public order book.' },
  { n: '03', icon: 'bolt', t: 'Compare firm quotes', p: 'Makers stream back executable quotes. You see the best price ranked, side by side.' },
  { n: '04', icon: 'check', t: 'Atomic settlement', p: 'Accept one quote. Both legs settle in a single Canton transaction — or neither does.' },
] as const;

const SURFACES = [
  { href: '/trade', icon: 'swap', t: 'Request quote', p: 'Build a cloaked RFQ, broadcast to chosen makers, and accept the best firm quote.' },
  { href: '/maker', icon: 'layers', t: 'Maker desk', p: 'Respond to incoming private RFQs, manage inventory skew, and track fills and P&L.' },
  { href: '/portfolio', icon: 'wallet', t: 'Portfolio', p: 'Connect a Canton wallet, view balances, settlement history, and privacy controls.' },
] as const;

const FEATS = [
  { icon: 'eyeoff', t: 'No information leakage', p: 'Intent never hits a public mempool, so nobody front-runs or fades your flow.' },
  { icon: 'bolt', t: 'Firm, not indicative', p: 'Quotes are executable on receipt — what you accept is what you get, no slippage.' },
  { icon: 'shield', t: 'Atomic & final', p: 'Canton settles both legs in one transaction with sub-transaction privacy.' },
  { icon: 'layers', t: 'Best-price competition', p: 'Multiple makers compete privately on the same request — tighter than a single desk.' },
] as const;

export default function Overview() {
  return (
    <div className="page wide">
      <section className="hero">
        <div>
          <span className="badge accent" style={{ marginBottom: 20 }}><Icon name="shield" size={12} /> Built on Canton Network</span>
          <h1>Trade size without <em>showing your hand.</em></h1>
          <p className="lede">CloakRFQ is a request-for-quote protocol where your direction and size stay encrypted on-ledger — disclosed only to the makers you choose. Get firm, competing quotes with zero slippage and atomic settlement.</p>
          <div className="cta">
            <Link href="/trade" className="btn pri"><Icon name="bolt" size={16} /> Request a quote</Link>
            <Link href="/maker" className="btn ghost"><Icon name="layers" size={16} /> Become a maker</Link>
          </div>
          <div className="meta">
            <div className="m"><b>0</b><span>public mempool leaks</span></div>
            <div className="m"><b>1 block</b><span>atomic settlement</span></div>
            <div className="m"><b>Firm</b><span>executable quotes</span></div>
          </div>
        </div>

        <div className="viz">
          <div className="vh"><span className="live" /> Live RFQ · CC / USDC</div>
          <div className="vcols">
            <div className="vcol pub">
              <div className="t"><Icon name="eyeoff" size={12} /> Public ledger</div>
              <div className="vline"><span className="enc">RFQ·════════</span></div>
              <div className="vline"><span className="enc">════ ════════</span></div>
              <div className="vline"><span className="enc">══════════</span></div>
            </div>
            <div className="vcol priv">
              <div className="t"><Icon name="lock" size={12} /> Selected makers</div>
              <div className="vline">Buy <b>50,000 CC</b></div>
              <div className="vline">vs USDC</div>
              <div className="vline faint">expires 28s</div>
            </div>
          </div>
          <div style={{ marginTop: 14, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 13, padding: '8px 14px' }}>
            <div className="qrow"><span>Halo Markets</span><span className="best">0.6549 ◆ best</span></div>
            <div className="qrow"><span>Volt OTC</span><span>0.6551</span></div>
            <div className="qrow"><span>Aurex</span><span>0.6557</span></div>
          </div>
        </div>
      </section>

      <div id="how" className="section-h"><h2>How an RFQ settles</h2><span>four steps</span></div>
      <div className="steps">
        {STEPS.map((s) => (
          <div className="step" key={s.n}>
            <div className="n">{s.n}</div>
            <div className="ic"><Icon name={s.icon} size={18} /></div>
            <b>{s.t}</b>
            <p>{s.p}</p>
          </div>
        ))}
      </div>

      <div className="section-h"><h2>Open the app</h2><span>three surfaces</span></div>
      <div className="surfaces">
        {SURFACES.map((s) => (
          <Link href={s.href} className="surf" key={s.href}>
            <div className="ic"><Icon name={s.icon} size={20} /></div>
            <h3>{s.t} <span className="go"><Icon name="arrow" size={17} /></span></h3>
            <p>{s.p}</p>
          </Link>
        ))}
      </div>

      <div className="section-h"><h2>Why it&apos;s different</h2><span>privacy by construction</span></div>
      <div className="feats">
        {FEATS.map((f) => (
          <div className="feat" key={f.t}>
            <Icon name={f.icon} size={20} />
            <b>{f.t}</b>
            <p>{f.p}</p>
          </div>
        ))}
      </div>

      <div className="foot">
        <span>CloakRFQ · prototype · Canton hackathon</span>
        <span>Demo data · testnet · no real funds</span>
      </div>
    </div>
  );
}
