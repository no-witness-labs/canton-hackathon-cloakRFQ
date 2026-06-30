# Agent Instructions

This file is the canonical operating guide for AI agents working in this repository.

## Scope Discipline

- Keep changes focused on the user's requested task.
- Do not make unrelated refactors, formatting passes, or cleanup changes.
- Keep `CONTEXT.md` glossary-only.
- Preserve existing product decisions unless the user explicitly asks to revisit them.

## Branch And PR Workflow

- Do not work directly on `main`.
- Before starting a new task, sync `main` with `origin/main`.
- Create a fresh task branch from updated `main`.
- Push the task branch only.
- Open a draft PR against `main`.
- Do not merge PRs, push directly to `main`, force-push, or rewrite history unless explicitly instructed for a recovery task.

## Commit Checkpoints

Commit after each independently reviewable and locally validated milestone.

Do not commit after every small edit or failed attempt. Do not defer commits across multiple unrelated milestones.

Small tasks should usually be one commit. Medium tasks should usually be two to four commits. Large issues should commit per milestone.

Avoid WIP commits unless the user explicitly asks for checkpoint commits.

## Validation

- Run the narrowest useful validation for the changed files.
- At minimum, run `git diff --check` before committing.
- If a relevant tool is unavailable, state that clearly in the PR and final summary.

## Skill Use

- Use `karpathy-guidelines` for code-writing, code-modifying, refactoring, and test-related tasks. Apply it to keep changes simple, scoped, and verifiable.
- Use `grill-with-docs` for design clarification, business or technical modeling, ADR work, glossary refinement, and major planning decisions.
- Do not invoke specialized skills for trivial edits unless the user explicitly asks.

## More Detail

See `docs/AGENT_WORKFLOW.md` for branch naming, commit examples, PR expectations, automatic PR creation, and local push guardrail details.
