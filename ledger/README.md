# CloakRFQ Ledger

Daml package for CloakRFQ's on-ledger contracts (Daml SDK **3.5.x**, built with
`dpm`).

- `daml.yaml` — package metadata (`cloakrfq-ledger`).
- `daml/CloakRFQ.daml` — templates (scaffold today; Phase 1–3 templates land in
  #9–#11).
- `test/` — Daml Script tests (`cloakrfq-test`), including the party-visibility
  proofs (#22).
- `multi-package.yaml` — builds the package and its tests together.

The current package is **setup-only** — no business templates yet.

## Build & run

See [`../docs/RUNBOOK.md`](../docs/RUNBOOK.md). In short:

```bash
cd ledger && dpm build            # builds cloakrfq-ledger + cloakrfq-test
../scripts/start-sandbox.sh       # Canton sandbox + parties + web/public/ledger-config.json
```
