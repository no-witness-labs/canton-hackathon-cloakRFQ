'use client';

// Inline glossary term: a dotted-underlined word that reveals a plain-English
// definition on hover (desktop) or tap (mobile). Keyboard-accessible; closes on
// Escape or outside click. Unknown ids render the child text unchanged.

import { useEffect, useRef, useState } from 'react';
import { GLOSSARY } from '@/lib/glossary';

export function Term({ id, children }: { id: string; children?: React.ReactNode }) {
  const entry = GLOSSARY[id];
  const [open, setOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setCanHover(typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [open]);

  if (!entry) return <>{children ?? id}</>;

  return (
    <span className="term-wrap" ref={ref}>
      <button
        type="button"
        className="term"
        aria-expanded={open}
        aria-label={`${entry.term}: what's this?`}
        onMouseEnter={canHover ? () => setOpen(true) : undefined}
        onMouseLeave={canHover ? () => setOpen(false) : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={canHover ? undefined : (e) => { e.stopPropagation(); setOpen((v) => !v); }}
      >
        {children ?? entry.term}
      </button>
      {open && (
        <span className="term-pop" role="tooltip" onClick={(e) => e.stopPropagation()}>
          <span className="term-pop-t">{entry.term}</span>
          <span className="term-pop-d">{entry.def}</span>
        </span>
      )}
    </span>
  );
}
