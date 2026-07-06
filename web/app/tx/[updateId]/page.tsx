'use client';

// "Waiting room" for the external explorer. A freshly-submitted transaction takes
// a few seconds to be indexed by 5N Lighthouse, so linking straight to it shows a
// 404. Instead we land here, poll Lighthouse's API until the tx is indexed (200),
// then forward to it — so the user never hits an error page. Off DevNet (no public
// explorer) we send them to the in-app Activity view instead.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { loadConfig, explorerTxUrl } from '@/lib/ledger';

type Status = 'checking' | 'slow' | 'nonDevnet';

export default function TxRedirectPage({ params }: { params: { updateId: string } }) {
  const id = params.updateId;
  const [status, setStatus] = useState<Status>('checking');
  const [tries, setTries] = useState(0);
  const target = useRef<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let n = 0;
    (async () => {
      await loadConfig();
      const url = explorerTxUrl(id);
      if (!url) { setStatus('nonDevnet'); return; }   // local sandbox — no public explorer
      target.current = url;
      const apiUrl = url.replace('/transactions/', '/api/transactions/');
      const poll = async () => {
        if (stopped) return;
        n += 1; setTries(n);
        try {
          const r = await fetch(apiUrl, { cache: 'no-store' });
          if (r.ok) { window.location.replace(url); return; }   // indexed → forward
        } catch { /* network hiccup — keep polling */ }
        if (n >= 30) { setStatus('slow'); return; }              // ~45s, then let them open manually
        setTimeout(poll, 1500);
      };
      poll();
    })();
    return () => { stopped = true; };
  }, [id]);

  const activityHref = `/activity?tx=${id}`;

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section className="panel" style={{ maxWidth: 460, width: '100%', padding: '26px 24px', textAlign: 'center' }}>
        {status === 'nonDevnet' ? (
          <>
            <h1 className="disp" style={{ fontSize: 17, fontWeight: 700 }}>No external explorer here</h1>
            <p className="t-ink3" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
              This ledger has no public explorer. View the transaction in the in-app activity feed.
            </p>
            <Link href={activityHref} className="btn accent" style={{ marginTop: 16, textDecoration: 'none', justifyContent: 'center' }}>View in Activity →</Link>
          </>
        ) : status === 'slow' ? (
          <>
            <h1 className="disp" style={{ fontSize: 17, fontWeight: 700 }}>Still indexing…</h1>
            <p className="t-ink3" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
              The explorer is taking a little longer than usual to index this transaction. You can open it anyway
              (it may briefly show &ldquo;not found&rdquo;), or view it in-app now.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
              {target.current && <a className="btn accent" href={target.current} style={{ textDecoration: 'none' }}>Open explorer anyway ↗</a>}
              <Link href={activityHref} className="btn dark" style={{ textDecoration: 'none' }}>View in Activity →</Link>
            </div>
          </>
        ) : (
          <>
            <span className="spinner" style={{ display: 'block', margin: '0 auto 16px' }} />
            <h1 className="disp" style={{ fontSize: 17, fontWeight: 700 }}>Opening transaction on the explorer…</h1>
            <p className="t-ink3" style={{ fontSize: 13, lineHeight: 1.6, marginTop: 8 }}>
              A new transaction takes a few seconds to be indexed. Hang tight — this will forward automatically once it&apos;s ready.
            </p>
            <p className="mono t-mut" style={{ fontSize: 11, marginTop: 12 }}>checking… ({tries})</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}>
              <Link href={activityHref} className="btn dark sm" style={{ textDecoration: 'none' }}>View in Activity instead →</Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
