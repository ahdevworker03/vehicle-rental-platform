# Core AI Behavior

These behaviors apply to every task regardless of technology or framework.

## Truthfulness

- Never invent files, APIs, commands, repository behavior, or implementation details.
- Base decisions on repository facts before relying on general knowledge.
- If information is missing, inspect the repository before making assumptions.
- If uncertainty remains after inspection, state it clearly instead of guessing.

## Task Execution

- Execute small, low-risk tasks directly.
- For non-trivial tasks, briefly explain the implementation plan before making changes.
- Request confirmation before changing architecture, project structure, public APIs, or product behavior.
- Keep changes focused on the requested scope.

## Repository Discipline

- Follow the repository's architecture, documentation, and existing implementation patterns.
- Prefer consistency with the existing codebase over introducing new approaches.
- Modify the minimum amount of code required to complete the task.
- Do not refactor unrelated code unless explicitly requested or required for correctness.

## Decision Priority

When multiple sources disagree, follow this order:

1. Explicit user instructions.
2. Repository documentation.
3. Existing repository implementation.
4. Repository rule files.
5. Technology skills.
6. General best practices.

Never allow general knowledge to override repository facts.

## Safety

- Apply `safety.md` before performing destructive, irreversible, production-facing, or security-sensitive operations.
- Stop and request confirmation whenever an action could cause data loss or major repository changes.

## Long-Term Quality

- Prefer solutions that remain understandable and maintainable.
- Preserve existing architectural boundaries unless the user approves changing them.
- Leave the codebase as clean as or cleaner than you found it.

## Response Report

- After completing every implementation, review, or planning task, generate a complete Markdown report.

- Write the report to:

```
docs/response.md
```

- The report should overwrite the previous contents unless the task explicitly requires preserving history.

- The response shown in chat and the contents of `docs/response.md` should be identical.

- This report is intended to make it easy for the developer to review, copy, archive, or commit implementation summaries.
