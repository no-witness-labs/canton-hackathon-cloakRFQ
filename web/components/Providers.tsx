'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@/lib/icons';

const KEY = 'cloakrfq:wallet';
export const ADDR = '0x7Ac…CC4f';
export const PARTY = 'taker::cloak-9f2a';

type ToastKind = 'ok' | 'info';
type ToastItem = { id: number; msg: string; kind: ToastKind };

interface AppCtx {
  connected: boolean;
  addr: string;
  party: string;
  connect: () => void;
  disconnect: () => void;
  toggle: () => void;
  openConnect: (onDone?: () => void) => void;
  requireWallet: (cb: () => void) => void;
  toast: (msg: string, kind?: ToastKind) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function useApp(): AppCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within <Providers>');
  return v;
}

const WALLETS: [string, string, string][] = [
  ['CW', 'Canton Wallet', 'DAML party · recommended'],
  ['LE', 'Ledger', 'Hardware signer'],
  ['WC', 'WalletConnect', 'Scan to pair'],
];

export function Providers({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [modal, setModal] = useState<{ open: boolean; onDone?: () => void }>({ open: false });

  useEffect(() => {
    try { setConnected(localStorage.getItem(KEY) === '1'); } catch { /* noop */ }
  }, []);

  const toast = useCallback((msg: string, kind: ToastKind = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const connect = useCallback(() => {
    try { localStorage.setItem(KEY, '1'); } catch { /* noop */ }
    setConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* noop */ }
    setConnected(false);
    toast('Wallet disconnected', 'info');
  }, [toast]);

  const openConnect = useCallback((onDone?: () => void) => setModal({ open: true, onDone }), []);
  const closeModal = useCallback(() => setModal({ open: false }), []);

  const requireWallet = useCallback(
    (cb: () => void) => {
      if (connected) cb();
      else openConnect(cb);
    },
    [connected, openConnect],
  );

  const toggle = useCallback(() => {
    if (connected) disconnect();
    else openConnect();
  }, [connected, disconnect, openConnect]);

  // Esc closes modal
  useEffect(() => {
    if (!modal.open) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [modal.open, closeModal]);

  const pick = () => {
    const onDone = modal.onDone;
    connect();
    toast('Wallet connected · ' + ADDR, 'ok');
    closeModal();
    if (onDone) setTimeout(onDone, 180);
  };

  return (
    <Ctx.Provider value={{ connected, addr: ADDR, party: PARTY, connect, disconnect, toggle, openConnect, requireWallet, toast }}>
      {children}

      {modal.open && (
        <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Connect wallet">
            <button className="modal-x" aria-label="Close" onClick={closeModal}>×</button>
            <div className="m-orb"><Icon name="wallet" size={30} /></div>
            <h3>Connect a Canton wallet</h3>
            <p>Sign in to broadcast a cloaked RFQ. Your intent stays encrypted on-ledger — disclosed only to the makers you select.</p>
            <div className="wallet-opts">
              {WALLETS.map(([ic, name, sub]) => (
                <button key={name} className="wopt" onClick={pick}>
                  <span className="ic">{ic}</span>
                  <div><b>{name}</b><div className="s">{sub}</div></div>
                  <span className="arr"><Icon name="arrow" size={16} /></span>
                </button>
              ))}
            </div>
            <p className="tiny faint" style={{ margin: 0 }}>By connecting you agree to disclose trade legs only to selected counterparties.</p>
          </div>
        </div>
      )}

      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.kind}>
            <Icon name={t.kind === 'ok' ? 'check' : 'shield'} size={17} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
