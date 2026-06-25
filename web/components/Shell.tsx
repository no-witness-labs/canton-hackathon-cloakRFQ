'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '@/lib/icons';
import { useApp } from './Providers';

const TITLES: Record<string, { h1: string; sub: string; maker?: boolean }> = {
  '/': { h1: 'Overview', sub: 'Privacy-preserving RFQ settlement' },
  '/trade': { h1: 'Request quote', sub: 'Cloaked RFQ · private best-price discovery' },
  '/maker': { h1: 'Maker desk', sub: 'Halo Markets · liquidity provider', maker: true },
  '/portfolio': { h1: 'Portfolio', sub: 'Balances · settlement history · privacy' },
};

const NAV: { href: string; icon: IconName; label: string }[] = [
  { href: '/trade', icon: 'swap', label: 'Request quote' },
  { href: '/maker', icon: 'layers', label: 'Maker desk' },
  { href: '/portfolio', icon: 'wallet', label: 'Portfolio' },
];

const BOT: { href: string; icon: IconName; label: string }[] = [
  { href: '/', icon: 'grid', label: 'Overview' },
  { href: '/trade', icon: 'swap', label: 'Trade' },
  { href: '/maker', icon: 'layers', label: 'Maker' },
  { href: '/portfolio', icon: 'wallet', label: 'Wallet' },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { connected, addr, party, toggle } = useApp();
  const t = TITLES[path] ?? TITLES['/'];

  return (
    <>
      <div className="app">
        <aside className="side">
          <div className="brand">
            <span className="mark"><Icon name="shield" size={17} /></span>
            <div><b>Cloak<span>RFQ</span></b><div className="net">Canton Network</div></div>
          </div>
          <nav className="nav">
            <Link href="/" className={path === '/' ? 'on' : ''}><Icon name="grid" /> Overview</Link>
            <div className="nav-sec">Trade</div>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={path === n.href ? 'on' : ''}>
                <Icon name={n.icon} /> {n.label}
              </Link>
            ))}
            <div className="nav-sec">Resources</div>
            <Link href="/#how"><Icon name="book" /> How it works</Link>
          </nav>
          <div className="side-foot">
            <button className={'wallet' + (connected ? ' connected' : '')} onClick={toggle} aria-pressed={connected}>
              <span className="dot" />
              <span className="w-main">
                <span className="k">{connected ? addr : 'Connect wallet'}</span>
                <span className="v">{connected ? 'Canton · ' + party : 'Not connected'}</span>
              </span>
            </button>
          </div>
        </aside>

        <div className="main">
          <header className="topbar">
            <button className="burger" aria-label="Menu"><Icon name="menu" /></button>
            <div>
              <h1>{t.h1}</h1>
              <div className="sub">{t.sub}</div>
            </div>
            <span className="spacer" />
            {t.maker ? (
              <span className="toggle-on hide-sm"><span className="tiny muted">Quoting</span><span className="badge buy"><span className="live" /> live</span></span>
            ) : (
              <span className="badge accent hide-sm"><span className="live" /> Canton testnet</span>
            )}
            <button className={'btn sm topwallet' + (connected ? ' connected' : '')} onClick={toggle}>
              {connected ? (
                <><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--buy)', boxShadow: '0 0 0 3px var(--buy-dim)' }} /><span className="mono" style={{ fontSize: 12.5 }}>{addr}</span></>
              ) : (
                <><Icon name="wallet" size={16} /><span>Connect wallet</span></>
              )}
            </button>
          </header>

          {children}
        </div>
      </div>

      <nav className="botnav">
        {BOT.map((n) => (
          <Link key={n.href} href={n.href} className={path === n.href ? 'on' : ''}>
            <Icon name={n.icon} />{n.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
