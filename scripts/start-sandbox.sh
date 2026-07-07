#!/usr/bin/env bash
# Start the Canton sandbox on OpenJDK 17 and bootstrap it for the CloakRFQ demo.
#
# Canton 3.5 must NOT run on Oracle JDK 20 — its bundled BouncyCastle provider
# fails JCE authentication there and every transaction errors. We pin OpenJDK 17.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEDGER="$ROOT/ledger"
cd "$LEDGER"

if [ -n "${CLOAKRFQ_JAVA_HOME:-}" ]; then
  JAVA_HOME="$CLOAKRFQ_JAVA_HOME"
elif [ -x "$HOME/.local/jvm/openjdk-17/usr/lib/jvm/java-17-openjdk-amd64/bin/java" ]; then
  JAVA_HOME="$HOME/.local/jvm/openjdk-17/usr/lib/jvm/java-17-openjdk-amd64"
elif [ -x "/usr/lib/jvm/java-17-openjdk-amd64/bin/java" ]; then
  JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
else
  JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
fi
[ -x "$JAVA_HOME/bin/java" ] || {
  echo "OpenJDK 17 not found at $JAVA_HOME" >&2
  echo "Install OpenJDK 17 or set CLOAKRFQ_JAVA_HOME" >&2
  exit 1
}
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$HOME/.dpm/bin:$PATH"

echo "→ Java: $(java -version 2>&1 | head -1)"
[ -f contracts/.daml/dist/cloakrfq-contracts-v2-0.2.0.dar ] || { echo "→ Building DAR"; dpm build --all; }

echo "→ Starting Canton sandbox (logs: ledger/log/canton.log)"
rm -f log/canton.log
dpm sandbox > /tmp/cloakrfq-sandbox.log 2>&1 &
SANDBOX_PID=$!
echo "  sandbox pid $SANDBOX_PID"

echo "→ Waiting for JSON Ledger API"
until grep -q "HTTP JSON API Server started" log/canton.log 2>/dev/null; do
  kill -0 "$SANDBOX_PID" 2>/dev/null || { echo "Sandbox process died — see ledger/log/canton.log" >&2; exit 1; }
  sleep 1
done
# The "started" log line precedes full readiness — wait for /readyz to avoid a
# race where the first package upload returns HTTP 400.
until [ "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:6864/readyz)" = "200" ]; do
  sleep 1
done

"$ROOT/scripts/bootstrap.sh"

echo ""
echo "✓ Sandbox ready on http://127.0.0.1:6864 (gRPC 6865). Sandbox pid: $SANDBOX_PID"
echo "  Next: npm --prefix web install && npm --prefix web run dev"
echo "  Stop the sandbox with: ./scripts/stop-sandbox.sh"
