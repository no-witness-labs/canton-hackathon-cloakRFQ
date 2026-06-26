# CloakRFQ Ledger

Daml package for CloakRFQ on-ledger contracts.

This folder is intentionally separate from `backend/` and `web/`:

- `ledger/` holds Daml templates, choices, scripts, and ledger tests.
- `backend/` will hold off-ledger ledger-client code that submits commands and reads ledger state.
- `web/` holds the frontend demo.

The current package is setup-only. It does not implement Phase 1 business templates yet.

## Build

Install the Daml SDK, then run:

```bash
cd ledger
daml build
```

The no-op `CloakRFQ.Setup:setup` script exists only as a smoke-test entry point for the package.
