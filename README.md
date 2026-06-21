# CloakRFQ Receipts Markdown Documentation

This bundle contains the current planning documentation for CloakRFQ Receipts.

## Files

- `CONTEXT.md` — glossary of canonical domain terms. This is not a spec or scratchpad.
- `docs/CLOAKRFQ_PROJECT_BRIEF.md` — consolidated product brief, resolved decisions, explicit Current workflow, privacy posture, non-goals, and open questions.
- `docs/MANIFEST.md` — package completeness notes and file inventory.
- `docs/CLOAKRFQ_MVP_BUILD_SPEC.md` — implementation handoff spec for the MVP.
- `docs/adr/0001-receivable-sale-rfq-mvp.md` — model the MVP as a Receivable Sale, not a secured loan.
- `docs/adr/0002-maximum-practical-privacy-for-rfqs.md` — target Maximum Practical Privacy for RFQs.
- `docs/adr/0003-functionality-preserving-privacy.md` — preserve real-world RFQ functionality before optimizing privacy.
- `docs/adr/0004-optional-debtor-notification.md` — make Debtor Notification optional and disclosure-controlled.
- `docs/adr/0005-require-funding-capacity-evidence-during-bidding.md` — require funding-capacity evidence during bidding; refined by ADR 0006.
- `docs/adr/0006-proof-of-funds-as-bid-eligibility-evidence.md` — require Proof of Funds as bid eligibility evidence, not a Funding Lock.
- `docs/adr/0007-controlled-funder-identity-disclosure.md` — control Funder identity disclosure timing.
- `docs/adr/0008-seller-controlled-fallback-queue.md` — use a Seller-Controlled Fallback Queue.
- `docs/adr/0009-binding-quotes-with-expiry.md` — use Binding Quotes with Quote Expiry for the MVP.
- `docs/adr/0010-on-ledger-demo-settlement.md` — use On-Ledger Demo Settlement for the MVP.
- `docs/adr/0011-scoped-compliance-receipts.md` — use Scoped Compliance Receipts for audit and regulatory disclosure.

## Status

Complete for current discovery/grilling phase as of 2026-06-20.

Ready to proceed to implementation design.

Not complete as production implementation. Exact Daml templates/choices, quote-selection protocol details, and exact Proof-of-Funds mechanism remain open.

Settlement product decision is resolved as On-Ledger Demo Settlement. Compliance Receipt product decision is resolved as Scoped Compliance Receipt.

## Agent Git Workflow

This repository may be worked on by a local agent machine using a repo-scoped SSH deploy key. The intended workflow is **task branch -> pull request -> human review -> manual merge**.

The agent machine may:

- clone and pull this repository;
- create a fresh branch for each task;
- make focused commits;
- push task branches such as `codex/<task-slug>`, `docs/<task-slug>`, or `fix/<task-slug>`.

The agent machine must not:

- hold personal GitHub account credentials;
- work directly on `main`;
- push directly to `main`;
- force-push;
- merge pull requests;
- rewrite history unless explicitly instructed for a recovery task.

The human reviewer is responsible for opening or reviewing the PR and merging it manually.

For each new task/job/issue, use this flow:

```bash
git fetch origin
git switch main
git pull --ff-only origin main

git switch -c codex/<task-slug>

# Do the requested work.

git status
git diff --check
git add .
git commit -m "docs(scope): describe the change"
git push -u origin HEAD

branch="$(git branch --show-current)"
echo "Create PR:"
echo "https://github.com/no-witness-labs/canton-hackathon-cloakRFQ/compare/main...${branch}?expand=1"
```

Use Conventional Commit style for commit messages:

- `docs:` documentation-only changes;
- `feat:` new implementation or protocol behavior;
- `fix:` bug fixes or corrections to incorrect docs/specs;
- `test:` tests;
- `refactor:` restructuring without behavior/spec changes;
- `chore:` repo maintenance;
- `ci:` CI/workflow changes.

Examples:

```text
docs(adr): clarify proof-of-funds eligibility evidence
feat(daml): add receivable sale rfq lifecycle
test(daml): cover quote expiry scenarios
chore(repo): add codex branch workflow
```

## Local Push Guardrail

Install this hook on every agent-machine clone to block accidental direct pushes to remote `main`.

This is a local guardrail, not a complete security boundary. It prevents normal accidental pushes, but it can still be bypassed by someone intentionally disabling hooks. If GitHub branch protections/rulesets are available for the repository plan, use them as the stronger enforcement layer.

```bash
mkdir -p .githooks

cat > .githooks/pre-push <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

while read -r local_ref local_sha remote_ref remote_sha; do
  if [ "$remote_ref" = "refs/heads/main" ]; then
    echo "ERROR: direct push to remote main is blocked."
    echo "Push a task branch and open a PR instead."
    exit 1
  fi
done
EOF

chmod +x .githooks/pre-push
git config core.hooksPath .githooks
```
