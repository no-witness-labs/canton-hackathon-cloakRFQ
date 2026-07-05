import { NextRequest } from 'next/server';

// Server-side proxy for the Canton JSON Ledger API. The browser calls `/v2/*`
// same-origin; this handler forwards to the configured participant, injecting an
// OIDC client-credentials Bearer token when one is configured (Canton DevNet via
// Seaport/fivenorth). With no OIDC env set it proxies straight to the local
// auth-disabled sandbox. The client secret never leaves the server.
//
// Env (web/.env.local — gitignored):
//   CLOAKRFQ_LEDGER_TARGET   e.g. https://ledger-api.validator.devnet.sandbox.fivenorth.io
//   CLOAKRFQ_OIDC_TOKEN_URL  e.g. https://auth.sandbox.fivenorth.io/application/o/token/
//   CLOAKRFQ_OIDC_CLIENT_ID  CLOAKRFQ_OIDC_CLIENT_SECRET  CLOAKRFQ_OIDC_AUDIENCE
//   CLOAKRFQ_OIDC_SCOPE      (default "daml_ledger_api")

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TARGET = (process.env.CLOAKRFQ_LEDGER_TARGET ?? 'http://127.0.0.1:6864').replace(/\/$/, '');
const OIDC = {
  tokenUrl: process.env.CLOAKRFQ_OIDC_TOKEN_URL,
  clientId: process.env.CLOAKRFQ_OIDC_CLIENT_ID,
  clientSecret: process.env.CLOAKRFQ_OIDC_CLIENT_SECRET,
  audience: process.env.CLOAKRFQ_OIDC_AUDIENCE,
  scope: process.env.CLOAKRFQ_OIDC_SCOPE ?? 'daml_ledger_api',
};

let cached: { value: string; exp: number } | null = null;
async function getToken(): Promise<string | null> {
  if (!OIDC.tokenUrl || !OIDC.clientId || !OIDC.clientSecret) return null; // local / no-auth
  if (cached && cached.exp - 60_000 > Date.now()) return cached.value;
  const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: OIDC.clientId, client_secret: OIDC.clientSecret, scope: OIDC.scope });
  if (OIDC.audience) body.set('audience', OIDC.audience);
  const res = await fetch(OIDC.tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const text = await res.text();
  if (!res.ok) throw new Error(`OIDC token exchange failed (HTTP ${res.status}): ${text}`);
  const j = JSON.parse(text);
  cached = { value: j.access_token, exp: Date.now() + Number(j.expires_in ?? 3600) * 1000 };
  return cached.value;
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const url = `${TARGET}/v2/${path.join('/')}${req.nextUrl.search}`;
  try {
    const headers: Record<string, string> = { 'Content-Type': req.headers.get('content-type') ?? 'application/json' };
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const init: RequestInit = { method: req.method, headers };
    if (req.method !== 'GET' && req.method !== 'HEAD') init.body = await req.text();
    const upstream = await fetch(url, init);
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ code: 'PROXY_ERROR', cause: String(e) }), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) { return proxy(req, params.path); }
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) { return proxy(req, params.path); }
