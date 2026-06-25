# CloakRFQ

Privacy-preserving RFQ settlement on the Canton Network. This repository
holds both the planning documentation and the first implementation.

## Layout

```
docs/   Planning documentation — product brief, PRD, ADRs, technical design, roadmap.
web/    Next.js 14 (App Router + TypeScript) UI prototype of the MVP. See web/README.md.
```

## Web app

The `web/` directory is the Next.js port of the original HTML prototype —
the four RFQ surfaces (overview, trade, maker, portfolio) built as React
client components. All data is currently mocked client-side; the component
boundaries are where Canton wallet / ledger integrations slot in. See
`web/README.md` for details.

```bash
cd web
npm install
npm run dev   # http://localhost:3000
```

## Documentation files

- `CONTEXT.md` — glossary of canonical domain terms. This is not a spec or scratchpad.
- `docs/CLOAKRFQ_PROJECT_BRIEF.md` — consolidated product brief, resolved decisions, explicit Current workflow, privacy posture, non-goals, and open questions.
- `docs/CLOAKRFQ_PRD.md` — product requirements document for the MVP workflow.
- `docs/HACKATHON_ALIGNMENT.md` — Canton Hackathon track alignment and submission positioning. The project will submit under Track 1: Private DeFi & Capital Markets.
- `docs/HACKATHON_ROADMAP.md` — compact roadmap for completing the hackathon MVP and submission package.
- `docs/MANIFEST.md` — package completeness notes and file inventory.
- `docs/CLOAKRFQ_MVP_BUILD_SPEC.md` — implementation handoff spec for the MVP.
- `docs/technical-design/001-high-level-technical-design.md` — first implementation-oriented high-level technical design note.
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

Implementation-oriented technical design has started under `docs/technical-design/`.

Not complete as production implementation. Exact Daml templates/choices, quote-selection protocol details, and exact Proof-of-Funds mechanism remain open.

Settlement product decision is resolved as On-Ledger Demo Settlement. Compliance Receipt product decision is resolved as Scoped Compliance Receipt.

## Agent Git Workflow

This repository may be worked on by a local agent machine using a repo-scoped SSH deploy key. The intended steady-state workflow is **task branch -> automatic pull request -> human review -> manual merge**.

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

The human reviewer is responsible for reviewing the PR and merging it manually.

The PR should be created by GitHub-side automation after the agent pushes a task branch. The agent machine should not need a personal access token or a logged-in GitHub account just to create PRs. If automatic PR creation is not yet installed, the agent must still push only the task branch and report the branch name or compare URL as a temporary fallback.

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
```

After the branch push, GitHub-side automation should open a PR targeting `main`. The agent must not merge the PR.

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

## Automatic PR Creation

To avoid manual PR creation, install repository-side automation that opens a PR whenever a permitted task branch is pushed.

Recommended approach:

- keep the agent machine limited to the repo-scoped SSH deploy key;
- let the agent push task branches only;
- let GitHub Actions or a narrow GitHub App create the PR;
- keep PR review and merge as human-only steps.

A GitHub Actions workflow for this should live under `.github/workflows/` and run on pushes to task branch patterns such as `codex/**`, `docs/**`, `fix/**`, `feat/**`, `test/**`, `refactor/**`, `chore/**`, and `ci/**`.

The workflow should use least privilege permissions, for example:

```yaml
permissions:
  contents: read
  pull-requests: write
```

The workflow may use `gh pr create` with the workflow token to create the PR. The agent machine itself should not run `gh auth login` and should not hold personal GitHub credentials.

## Local Push Guardrail

The repository includes `.githooks/pre-push` to block accidental direct pushes to remote `main` from agent-machine clones.

Activate the committed hook in each local clone:

```bash
chmod +x .githooks/pre-push
git config core.hooksPath .githooks
```

After activation, this command should fail locally:

```bash
git push origin main
```

Expected failure message:

```text
ERROR: direct push to remote main is blocked.
Push a task branch and open a PR instead.
```

This is a local guardrail, not a complete security boundary. It prevents normal accidental pushes, but it can still be bypassed by someone intentionally disabling hooks. If GitHub branch protections/rulesets are available for the repository plan, use them as the stronger enforcement layer.
