export const fmt = (n: number, d = 2) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export const usd = (n: number) => '$' + fmt(n, n >= 1000 ? 0 : 2);

// Deterministic per-maker jitter so SSR and client render identically
// (avoids Math.random hydration mismatches).
export const jitter = (seed: number) => Math.sin(seed * 9.7) * 0.5 + 0.5;
