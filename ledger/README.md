# CloakRFQ Ledger

Daml packages for CloakRFQ's on-ledger model (Daml SDK **3.5.x**, built with
`dpm`).

- `core/` — shared pure domain package (`cloakrfq-core`): data types and helper
  functions only; no templates, choices, or party authorization.
- `daml.yaml` — deployable contract package metadata (`cloakrfq-ledger`).
- `daml/CloakRFQ.daml` — templates and choices for the ledger package.
- `test/` — Daml Script tests (`cloakrfq-test`), including the party-visibility
  proofs (#22).
- `multi-package.yaml` — builds core, ledger, and tests together.

Keep reusable domain code in `cloakrfq-core` only when it is shared by contracts,
tests, or later packages. Keep ledger behavior in `cloakrfq-ledger`.

## Build & run

See [`../docs/RUNBOOK.md`](../docs/RUNBOOK.md). In short:

```bash
cd ledger && dpm build            # builds cloakrfq-core + cloakrfq-ledger + cloakrfq-test
../scripts/start-sandbox.sh       # Canton sandbox + parties + web/public/ledger-config.json
```
