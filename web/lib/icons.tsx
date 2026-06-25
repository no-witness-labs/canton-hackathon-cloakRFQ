import type { ReactElement } from 'react';

export type IconName =
  | 'shield' | 'swap' | 'layers' | 'wallet' | 'lock' | 'eye' | 'eyeoff'
  | 'check' | 'bolt' | 'clock' | 'chart' | 'grid' | 'arrow' | 'menu'
  | 'plus' | 'flame' | 'book';

const PATHS: Record<IconName, ReactElement> = {
  shield: (<><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" /><path d="M9.5 12l1.8 1.8L15 10" /></>),
  swap: (<path d="M7 7h11l-3-3M17 17H6l3 3" />),
  layers: (<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5M3 17l9 5 9-5" opacity=".55" /></>),
  wallet: (<><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M3 9h18" /><circle cx="16.5" cy="13.5" r="1.3" fill="currentColor" stroke="none" /></>),
  lock: (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="2.6" /></>),
  eyeoff: (<><path d="M4 4l16 16" /><path d="M9.9 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.2 7.4A17 17 0 0 0 2 12s3.5 7 10 7a10.6 10.6 0 0 0 3.3-.5" /><path d="M9.7 9.8a3 3 0 0 0 4.4 4.1" /></>),
  check: (<path d="M4 12.5l5 5 11-12" />),
  bolt: (<path d="M13 3L5 13h6l-1 8 8-10h-6z" />),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 8v4.5l3 2" /></>),
  chart: (<><path d="M4 19V5M4 19h16" /><path d="M8 16l3.5-4 3 2.5L20 8" /></>),
  grid: (<><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>),
  arrow: (<path d="M5 12h14M13 6l6 6-6 6" />),
  menu: (<path d="M4 7h16M4 12h16M4 17h16" />),
  plus: (<path d="M12 5v14M5 12h14" />),
  flame: (<path d="M12 3c2 3 5 4.5 5 8a5 5 0 0 1-10 0c0-1.5.6-2.5 1.5-3.5C9 9 9.5 7 9 5c2 .5 2.5 1.5 3-2z" />),
  book: (<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 1 2-2h13" /></>),
};

export function Icon({ name, size = 18, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24" width={size} height={size} className={className}
      fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
