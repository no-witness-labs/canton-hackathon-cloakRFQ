# CloakRFQ Runbook

Operational guide for running the on-ledger stack (Canton sandbox + JSON Ledger
API) locally. The web UI reads this ledger configuration and submits real Daml
commands through the JSON API.

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| `dpm` | Daml SDK `3.5.1` | on `PATH` via `export PATH="$HOME/.dpm/bin:$PATH"` |
| **OpenJDK** | **17** (or 21) | **Not Oracle JDK 20** — see [Troubleshooting](#jce-cannot-authenticate-the-provider-bc) |
| Node.js | 18+ | for the `web/` UI |

> **Why JDK 17 matters:** Canton 3.5 on Oracle JDK 20 fails JCE authentication of
> the bundled BouncyCastle provider, so every ledger transaction errors. The start
> script pins Homebrew OpenJDK 17 (`brew install openjdk@17`). Override with
> `CLOAKRFQ_JAVA_HOME=/path/to/jdk` if yours lives elsewhere.

## 2. One-command start

From the repo root:

```bash
# First run only:
npm --prefix web install

# Resets and starts Canton, bootstraps fresh demo parties, and starts the UI.
./scripts/reset-local-demo.sh
```

Open `http://localhost:3000`. The command intentionally wipes prior local
ledger state. Stop Canton with `./scripts/stop-sandbox.sh`; stop the Next.js
process separately when the demo is finished.

For ledger-only operation, use `./scripts/start-sandbox.sh`. To start only the
web process against an already-configured ledger, use `npm --prefix web run dev`.

### Ports

| Port | Service |
| --- | --- |
| 6865 | Canton gRPC Ledger API |
| 6864 | Canton JSON Ledger API v2 |
| 3000 | Next.js dev server (`web/`) |

## 3. What the scripts do

`reset-local-demo.sh` stops any existing local sandbox, calls
`start-sandbox.sh`, and ensures the Next.js web server is running.

`start-sandbox.sh`:

1. Pins `JAVA_HOME` to OpenJDK 17 and builds the DAR if missing (`dpm build --all` in `ledger/`).
2. Launches `dpm sandbox` (single-process Canton) in the background.
3. Waits for `HTTP JSON API Server started`, then for `/readyz` = 200.
4. Runs `scripts/bootstrap.sh`, which is idempotent:
   - uploads `ledger/contracts/.daml/dist/cloakrfq-contracts-v2-0.2.0.dar` and
     the test fixture DAR used by the mock CIP-56 demo path,
   - allocates one party per role — Seller, Funder A/B/C, Compliance, Risk,
     Coordinator, Auditor, Outsider, and USD Token Admin (reuses existing),
   - writes `web/public/ledger-config.json` (gitignored; the UI fetches it at runtime).

To re-bootstrap against an already-running sandbox: `./scripts/bootstrap.sh`.

> Bootstrap uploads the DAR, allocates parties, and writes the UI runtime
> configuration. The UI can then create the workflow contracts interactively.

## 4. Verifying the build (CI-style)

```bash
export JAVA_HOME="$HOME/.local/jvm/openjdk-17/usr/lib/jvm/java-17-openjdk-amd64"
export PATH="$JAVA_HOME/bin:$HOME/.dpm/bin:$PATH"
cd ledger && dpm build --all            # builds cloakrfq-lib + cloakrfq-contracts + cloakrfq-test (multi-package)
cd ledger/test && dpm test        # Daml Script tests
```

## 5. Project layout

| Folder | Role |
| --- | --- |
| `ledger/lib/` | shared Daml library package (`cloakrfq-lib`) |
| `ledger/contracts/` | deployable Daml contract package (`cloakrfq-contracts`) |
| `ledger/test/` | Daml Script tests (`cloakrfq-test`) |
| `backend/` | off-ledger ledger client / integration glue placeholder |
| `web/` | Next.js UI backed by the Canton JSON Ledger API |
| `scripts/` | dev orchestration (sandbox + bootstrap) |

## 6. Troubleshooting

### `JCE cannot authenticate the provider BC`
Canton is on the wrong JDK (e.g. Oracle JDK 20). Use OpenJDK 17/21:
Install OpenJDK 17, use the local `~/.local/jvm/openjdk-17` install, or set `CLOAKRFQ_JAVA_HOME`, then re-run `./scripts/start-sandbox.sh`.

### DAR upload returns HTTP 400 on startup
The JSON API logged "started" before the participant was fully ready. The start
script waits for `/readyz`; if you ran `bootstrap.sh` by hand, just re-run it.

### Port already in use
A previous sandbox is still running: `./scripts/stop-sandbox.sh`, then start again.
