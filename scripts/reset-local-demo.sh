#!/usr/bin/env bash
# Reset the local CloakRFQ demo ledger and generate fresh UI party config.
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

echo ""
echo "✓ Fresh local demo ledger is ready"
echo "  UI config: web/public/ledger-config.json"
echo "  If the web server is not running: npm --prefix web run dev"
echo "  Then hard-refresh: http://localhost:3000"
echo ""
echo "If the browser still shows stale party errors, run this in DevTools console:"
echo "  localStorage.clear(); location.reload();"
