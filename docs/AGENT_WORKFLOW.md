# CloakRFQ Agent Workflow

This document explains the agent workflow in more detail. The short canonical instruction set lives in `../AGENTS.md`.

## Intended Flow

This repository may be worked on by a local agent machine using a repo-scoped SSH deploy key. The intended steady-state workflow is:

```text
task branch -> draft pull request -> human review -> manual merge
```

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

## Start Of Work

For each new task, start from updated `main`:

```bash
git fetch origin
git switch main
git pull --ff-only origin main

git switch -c codex/<task-slug>
```

Use a branch prefix that matches the work:

- `docs/` for documentation-only changes;
- `feat/` for new implementation behavior;
- `fix/` for bug fixes or corrections;
- `test/` for tests;
- `refactor/` for structure-only changes;
- `chore/` for repository maintenance.

## Commit Checkpoints

Commit after each independently reviewable and locally validated milestone.

Do not commit after every small edit or failed attempt. Do not defer commits across multiple unrelated milestones.

Small tasks should usually be one commit. Medium tasks should usually be two to four commits. Large issues should commit per milestone.

Avoid WIP commits unless the user explicitly asks for checkpoint commits.

Examples of good milestone commits:

```text
chore(repo): add Daml package scaffold
feat(daml): add phase 1 receivable contracts
test(daml): cover phase 1 happy path
docs: document phase 1 setup
```

Examples of changes that usually do not need separate commits:

- typo fixes made while completing the same milestone;
- formatting caused by the same change;
- failed attempts that were reverted before success;
- helper files that only support the same logical change.

## Validation Before Commit

Run the narrowest useful validation for the changed files.

At minimum:

```bash
git status
git diff --check
```

Then stage only the intended files and commit:

```bash
git add <explicit paths>
git commit -m "docs(scope): describe the change"
```

If relevant tools are unavailable, do not hide that. State it in the PR body and final summary.

## Push And Pull Request

Push the task branch:

```bash
git push -u origin HEAD
```

After the branch push, GitHub-side automation should open a PR targeting `main`. If automatic PR creation is not installed or does not run, the agent should open a draft PR through available tooling or report the branch name and compare URL as a fallback.

The PR should stay draft until a human reviewer decides it is ready.

## Commit Message Style

Use Conventional Commit style:

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
