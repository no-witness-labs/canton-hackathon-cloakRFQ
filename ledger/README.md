# CloakRFQ Ledger

Daml packages for CloakRFQ's on-ledger model (Daml SDK **3.5.x**, built with
`dpm`).

- `lib/` - shared pure library package (`cloakrfq-lib`): data types and
  helper functions only; no templates, choices, or party authorization.
- `contracts/` - deployable contract package (`cloakrfq-contracts`): templates,
  choices, and party authorization rules.
- `test/` - Daml Script tests (`cloakrfq-test`), including the party-visibility
  proofs (#22).
- `multi-package.yaml` - builds lib, contracts, and tests together.

Keep reusable library code in `cloakrfq-lib` only when it is shared by
contracts, tests, or later packages. Keep ledger behavior in
`cloakrfq-contracts`.

## Build & run

See [`../docs/RUNBOOK.md`](../docs/RUNBOOK.md). In short:

```bash
cd ledger && dpm build --all            # builds cloakrfq-lib + cloakrfq-contracts + cloakrfq-test
../scripts/start-sandbox.sh       # Canton sandbox + parties + web/public/ledger-config.json
```
