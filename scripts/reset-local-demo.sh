#!/usr/bin/env bash
# Reset the local CloakRFQ demo ledger, generate fresh UI party config, and
# ensure the web app is running.
#
# This resets the terminal-controlled state: Canton sandbox, uploaded DARs,
# allocated demo parties, and web/public/ledger-config.json. Browser tabs can
# still hold old party IDs in memory, so hard-refresh the UI after this finishes.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "→ Resetting local CloakRFQ demo"
"$ROOT/scripts/stop-sandbox.sh"
"$ROOT/scripts/start-sandbox.sh"

if curl --silent --fail --output /dev/null http://127.0.0.1:3000; then
  echo "✓ Web app already running on http://localhost:3000"
else
  [ -d "$ROOT/web/node_modules" ] || {
    echo "Web dependencies are missing. Run: npm --prefix web install" >&2
    exit 1
  }

  echo "→ Starting web app (logs: /tmp/cloakrfq-web.log)"
  nohup setsid npm --prefix web run dev </dev/null > /tmp/cloakrfq-web.log 2>&1 &
  WEB_PID=$!

  until curl --silent --fail --output /dev/null http://127.0.0.1:3000; do
    kill -0 "$WEB_PID" 2>/dev/null || {
      echo "Web app process died. See /tmp/cloakrfq-web.log" >&2
      exit 1
    }
    sleep 1
  done
  echo "✓ Web app ready on http://localhost:3000 (pid: $WEB_PID)"
fi

echo ""
echo "✓ Fresh local demo is ready"
echo "  UI config: web/public/ledger-config.json"
echo "  Open or hard-refresh: http://localhost:3000"
echo ""
echo "If the browser still shows stale party errors, run this in DevTools console:"
echo "  localStorage.clear(); location.reload();"
