import { NextRequest } from 'next/server';

// Self-service per-visitor provisioning (Level 1). When CLOAKRFQ_SESSION_PROVISIONING=1
// (set on the DevNet deploy), each browser session gets its OWN party set so testers
// don't collide. The client passes a random `sid`; we allocate cloakrfq*-<sid> parties,
// grant the ledger user CanActAs, and return a ledger-config for that session. The DAR
// is assumed already uploaded to the participant (one-time, via bootstrap-devnet.py).
//
// When the flag is off (local sandbox), this returns { enabled:false } and the client
// falls back to the static /ledger-config.json — so local dev is unchanged.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;   // provisioning does ~9 sequential DevNet allocations (Vercel Pro; Hobby caps at 10s)

const ENABLED = process.env.CLOAKRFQ_SESSION_PROVISIONING === '1';
const TARGET = (process.env.CLOAKRFQ_LEDGER_TARGET ?? '').replace(/\/$/, '');
const USER_ID = process.env.CLOAKRFQ_LEDGER_USER_ID ?? '6';
const PKG = process.env.CLOAKRFQ_PACKAGE_REF ?? '#cloakrfq-contracts-v2';
const NS = process.env.CLOAKRFQ_PARTY_NAMESPACE ?? '';   // participant namespace; else derived from an allocation
const OIDC = {
  tokenUrl: process.env.CLOAKRFQ_OIDC_TOKEN_URL,
  clientId: process.env.CLOAKRFQ_OIDC_CLIENT_ID,
  clientSecret: process.env.CLOAKRFQ_OIDC_CLIENT_SECRET,
  audience: process.env.CLOAKRFQ_OIDC_AUDIENCE,
  scope: process.env.CLOAKRFQ_OIDC_SCOPE ?? 'daml_ledger_api',
};
const ROLES: Record<string, string> = {
  seller: 'cloakrfqSeller', funderA: 'cloakrfqFunderA', funderB: 'cloakrfqFunderB', funderC: 'cloakrfqFunderC',
  compliance: 'cloakrfqCompliance', risk: 'cloakrfqRisk', coordinator: 'cloakrfqCoordinator', auditor: 'cloakrfqAuditor', outsider: 'cloakrfqOutsider', tokenAdmin: 'cloakrfqTokenAdmin',
};

let tokenCache: { value: string; exp: number } | null = null;
async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.exp - 60_000 > Date.now()) return tokenCache.value;
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: OIDC.clientId!, client_secret: OIDC.clientSecret!, scope: OIDC.scope });
  if (OIDC.audience) body.set('audience', OIDC.audience);
  const r = await fetch(OIDC.tokenUrl!, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  if (!r.ok) throw new Error(`OIDC token ${r.status}: ${await r.text()}`);
  const j = await r.json();
  tokenCache = { value: j.access_token, exp: Date.now() + Number(j.expires_in ?? 3600) * 1000 };
  return tokenCache.value;
}
async function api(tok: string, method: string, path: string, body?: unknown): Promise<{ status: number; json: any }> {
  const r = await fetch(`${TARGET}${path}`, {
    method,
    headers: { Authorization: `Bearer ${tok}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const t = await r.text();
  return { status: r.status, json: t ? JSON.parse(t) : {} };
}

let nsCache: string | null = null;         // participant namespace (constant per validator)
const provisioned = new Set<string>();      // sessions already provisioned on this warm instance
let inflight = 0;

export async function GET(req: NextRequest) {
  if (!ENABLED || !TARGET || !OIDC.clientSecret) return Response.json({ enabled: false });
  const sid = (req.nextUrl.searchParams.get('sid') || '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
  if (!sid) return Response.json({ error: 'missing sid' }, { status: 400 });
  const sfx = `-${sid}`;
  const cfg = (ns: string) => ({ jsonApiUrl: TARGET, packageRef: PKG, userId: USER_ID, parties: Object.fromEntries(Object.entries(ROLES).map(([role, h]) => [role, `${h}${sfx}::${ns}`])) });

  if (provisioned.has(sid) && nsCache) return Response.json(cfg(nsCache));       // fast path (warm)
  if (inflight > 6) return Response.json({ error: 'busy, retry' }, { status: 429 }); // crude per-instance guard

  inflight++;
  try {
    const tok = await getToken();
    const hints = Object.values(ROLES);
    let ns: string | null = NS || nsCache;
    // Allocate one at a time — Canton serializes party (topology) allocation, so
    // concurrent requests conflict. New hints get created; existing ones error (ignored).
    for (const h of hints) {
      const { json } = await api(tok, 'POST', '/v2/parties', { partyIdHint: h + sfx });
      const pid = json?.partyDetails?.party;
      if (!ns && pid && String(pid).includes('::')) ns = String(pid).split('::', 2)[1];
    }
    if (!ns) {   // all already existed → take the participant namespace from any local party
      const { json } = await api(tok, 'GET', '/v2/parties');
      const p = (json.partyDetails || []).find((x: any) => x.isLocal && String(x.party).includes('::'));
      ns = p ? String(p.party).split('::', 2)[1] : null;
    }
    if (!ns) return Response.json({ error: 'could not resolve namespace' }, { status: 500 });
    nsCache = ns;
    const rights = hints.map((h) => ({ kind: { CanActAs: { value: { party: `${h}${sfx}::${ns}` } } } }));
    await api(tok, 'POST', `/v2/users/${encodeURIComponent(USER_ID)}/rights`, { userId: USER_ID, rights });
    provisioned.add(sid);
    return Response.json(cfg(ns));
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 502 });
  } finally {
    inflight--;
  }
}
