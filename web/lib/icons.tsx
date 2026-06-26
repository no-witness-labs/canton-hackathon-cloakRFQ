import type { ReactElement } from 'react';

export type IconName =
  | 'lock' | 'check' | 'plus' | 'eyeoff' | 'bolt' | 'alert' | 'risk'
  | 'xcircle' | 'up' | 'down' | 'info' | 'send' | 'shield' | 'clock'
  | 'card' | 'user' | 'key' | 'chevdown' | 'chevright' | 'logout';

const P: Record<IconName, ReactElement> = {
  lock: (<><rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>),
  check: (<polyline points="20 6 9 17 4 12" />),
  plus: (<path d="M12 2v20M2 12h20" />),
  eyeoff: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7a10.94 10.94 0 0 1-5-1.2" /><path d="M1 1l22 22" /></>),
  bolt: (<path d="M13 2L3 14h7l-1 8 10-12h-7z" />),
  alert: (<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>),
  risk: (<><path d="M12 2L2 20h20L12 2z" /><path d="M12 9v5M12 17h.01" /></>),
  xcircle: (<><circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" /></>),
  up: (<path d="M12 19V5M5 12l7-7 7 7" />),
  down: (<path d="M12 5v14M5 12l7 7 7-7" />),
  info: (<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>),
  send: (<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />),
  shield: (<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />),
  clock: (<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>),
  card: (<><rect x="2" y="6" width="20" height="13" rx="2.5" /><path d="M2 10h20" /><path d="M17 14h.5" /></>),
  user: (<><path d="M16 11a4 4 0 1 0-8 0" /><path d="M3 20a9 9 0 0 1 18 0" /><circle cx="12" cy="7" r="4" /></>),
  key: (<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3" />),
  chevdown: (<polyline points="6 9 12 15 18 9" />),
  chevright: (<polyline points="9 18 15 12 9 6" />),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>),
};

export function Icon({ name, size = 16, sw = 2, className, color }: { name: IconName; size?: number; sw?: number; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color ?? 'currentColor'}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {P[name]}
    </svg>
  );
}
