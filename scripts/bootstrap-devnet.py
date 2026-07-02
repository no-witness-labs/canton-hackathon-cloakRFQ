#!/usr/bin/env python3
"""Bootstrap CloakRFQ onto a remote Canton participant (e.g. DevNet via Seaport / fivenorth).

Mirrors scripts/bootstrap.sh, but for an auth'd remote participant:
  1. exchange OIDC client-credentials for a Bearer token
  2. upload the DAR
  3. allocate the 9 namespaced parties
  4. grant the app's ledger user CanActAs for each
  5. write web/public/ledger-config.json

Reads credentials from the environment (same vars as web/.env.local — never hard-code
the secret). The web app then talks to the participant through its server-side /v2 proxy
(app/v2/[...path]/route.ts), which injects the same token.

Usage:
  set -a; . web/.env.local; set +a          # load creds into env
  CLOAKRFQ_LEDGER_USER_ID=6 python3 scripts/bootstrap-devnet.py
"""
import json, os, sys, urllib.request, urllib.parse, urllib.error

TOKEN_URL = os.environ["CLOAKRFQ_OIDC_TOKEN_URL"]
LEDGER    = os.environ["CLOAKRFQ_LEDGER_TARGET"].rstrip("/")
CID       = os.environ["CLOAKRFQ_OIDC_CLIENT_ID"]
SEC       = os.environ["CLOAKRFQ_OIDC_CLIENT_SECRET"]
AUD       = os.environ.get("CLOAKRFQ_OIDC_AUDIENCE", CID)
SCOPE     = os.environ.get("CLOAKRFQ_OIDC_SCOPE", "daml_ledger_api")
USER_ID   = os.environ.get("CLOAKRFQ_LEDGER_USER_ID", "6")  # the Daml user the token maps to
ROOT      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DAR       = os.path.join(ROOT, "ledger", ".daml", "dist", "cloakrfq-ledger-0.1.0.dar")

ROLES = {
    "seller": "cloakrfqSeller", "funderA": "cloakrfqFunderA", "funderB": "cloakrfqFunderB",
    "funderC": "cloakrfqFunderC", "compliance": "cloakrfqCompliance", "risk": "cloakrfqRisk",
    "coordinator": "cloakrfqCoordinator", "auditor": "cloakrfqAuditor", "outsider": "cloakrfqOutsider",
}


def token():
    body = urllib.parse.urlencode({
        "grant_type": "client_credentials", "client_id": CID, "client_secret": SEC,
        "audience": AUD, "scope": SCOPE,
    }).encode()
    req = urllib.request.Request(TOKEN_URL, data=body, headers={"Content-Type": "application/x-www-form-urlencoded"})
    return json.load(urllib.request.urlopen(req, timeout=30))["access_token"]


def api(tok, method, path, data=None, ctype="application/json"):
    headers = {"Authorization": f"Bearer {tok}"}
    if data is not None:
        headers["Content-Type"] = ctype
    req = urllib.request.Request(LEDGER + path, data=data, headers=headers, method=method)
    try:
        r = urllib.request.urlopen(req, timeout=90)
        b = r.read()
        return r.status, (json.loads(b) if b else {})
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {}


def main():
    if not os.path.exists(DAR):
        sys.exit(f"DAR not found: {DAR}\n  build it first: (cd ledger && dpm build)")
    # Optional run tag → fresh parties for a clean re-test (DevNet is persistent and
    # can't be wiped). e.g. `python3 scripts/bootstrap-devnet.py run2`
    tag = (sys.argv[1] if len(sys.argv) > 1 else os.environ.get("CLOAKRFQ_PARTY_SUFFIX", "")).strip()
    sfx = f"-{tag}" if tag else ""
    if tag:
        print(f"run tag: {tag} → parties suffixed with {sfx}")
    tok = token()
    print("✓ token acquired")

    code, _ = api(tok, "POST", "/v2/packages", open(DAR, "rb").read(), "application/octet-stream")
    print(f"{'✓' if code == 200 else '✗'} DAR upload (HTTP {code})")

    parties, pending, ns = {}, [], None
    for role, base in ROLES.items():
        hint = base + sfx
        _, resp = api(tok, "POST", "/v2/parties", json.dumps({"partyIdHint": hint}).encode())
        pid = (resp.get("partyDetails") or {}).get("party")  # None if it already exists
        if pid and "::" in pid:
            ns = pid.split("::", 1)[1]
        parties[role], _ = pid, pending.append((role, hint, pid))
    if any(p is None for _, _, p in pending):
        if ns is None:  # every party already existed → take the participant namespace from any local party
            _, plist = api(tok, "GET", "/v2/parties")
            ns = next((p["party"].split("::", 1)[1] for p in plist.get("partyDetails", []) if p.get("isLocal") and "::" in p["party"]), None)
        for role, hint, pid in pending:
            if pid is None and ns:
                parties[role] = f"{hint}::{ns}"
    for role in ROLES:
        print(f"  {role:12} {parties[role]}")

    rights = [{"kind": {"CanActAs": {"value": {"party": p}}}} for p in parties.values() if p]
    code, _ = api(tok, "POST", f"/v2/users/{USER_ID}/rights", json.dumps({"userId": USER_ID, "rights": rights}).encode())
    print(f"{'✓' if code == 200 else '✗'} granted CanActAs x{len(rights)} to user {USER_ID} (HTTP {code})")

    cfg = {"jsonApiUrl": LEDGER, "packageRef": "#cloakrfq-ledger", "userId": USER_ID, "parties": parties}
    out = os.path.join(ROOT, "web", "public", "ledger-config.json")
    open(out, "w").write(json.dumps(cfg, indent=2))
    print(f"✓ wrote {out}")
    print("\nDone. Start the web app (with web/.env.local set) and it will run against the remote participant.")


if __name__ == "__main__":
    main()
