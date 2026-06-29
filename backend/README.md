# backend — off-ledger ledger client

Off-ledger code for CloakRFQ: the client that talks to the Canton **JSON Ledger
API v2** on behalf of each party, plus any thin server/integration glue.

This folder is a **placeholder** (issue #13 sets up structure only). The actual
client lands with the frontend↔ledger integration (issue #21): per-party
`actAs`, `listActive` filtered by party (that filter *is* the privacy), and the
create/exercise command shapes. The bootstrap script already exercises these
endpoints (`/v2/packages`, `/v2/parties`, `/v2/commands/...`,
`/v2/state/active-contracts`) — see `../scripts/bootstrap.sh`.

## Split

- `ledger/`   — on-ledger Daml package (templates, choices, Daml Script tests).
- `backend/`  — off-ledger client / integration glue (this folder).
- `web/`      — Next.js UI (currently a mock; #21 wires it to the live ledger).
- `scripts/`  — dev orchestration (Canton sandbox + bootstrap).

See `../docs/RUNBOOK.md` to run the sandbox.
