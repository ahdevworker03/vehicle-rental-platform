# Start Here

This is the default entry point for every task.

Read this first, then load only the rule files that are relevant to the task.

---

## How to Use

1. Read `docs/rules/project.md` first.
2. Identify the task type.
3. Read only the rule files listed for that task.
4. Follow references only when they are directly relevant.
5. If repository facts conflict with a general rule, follow the repository.

---

## Task Routing

| Task Type                      | Files to Read (in Order)                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bug Fix**                    | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/safety.md` → `docs/rules/coding-standards.md` → `docs/rules/git.md` → `docs/rules/typeScript-rules.md` _(if TypeScript is involved)_ → `docs/rules/testing.md` _(if tests change)_                                                                                                                              |
| **New Feature**                | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/design-decisions.md` → `docs/rules/safety.md` → `docs/rules/coding-standards.md` → `docs/rules/git.md` → `docs/rules/typeScript-rules.md` _(if TypeScript is involved)_ → `docs/rules/testing.md` → `docs/rules/documentation.md` _(if repository truth changes)_ → `docs/rules/ui-ux.md` _(if UI is involved)_ |
| **Refactoring**                | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/design-decisions.md` → `docs/rules/safety.md` → `docs/rules/coding-standards.md` → `docs/rules/typeScript-rules.md` _(if TypeScript is involved)_ → `docs/rules/testing.md`                                                                                                                                     |
| **Documentation**              | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/documentation.md` → `docs/rules/development-workflow.md`                                                                                                                                                                                                                                                                                               |
| **Testing**                    | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/testing.md` → `docs/rules/safety.md`                                                                                                                                                                                                                                                                                                                   |
| **UI / UX Work**               | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/ui-ux.md` → `docs/rules/design-decisions.md` → `docs/rules/safety.md` → `docs/rules/typeScript-rules.md` _(if TypeScript is involved)_ → `docs/rules/testing.md`                                                                                                                                                |
| **Repository Cleanup**         | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/safety.md` → `docs/rules/coding-standards.md` → `docs/rules/git.md`                                                                                                                                                                                                                                             |
| **Monorepo / Package Changes** | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/monorepo.md` → `docs/rules/safety.md`                                                                                                                                                                                                                                                                           |
| **API Contract Changes**       | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/api-contracts.md` → `docs/rules/design-decisions.md` → `docs/rules/safety.md`                                                                                                                                                                                                                                   |
| **Generated Code Changes**     | `docs/rules/project.md` → `docs/rules/core-behavior.md` → `docs/rules/development-workflow.md` → `docs/rules/api-contracts.md` → `docs/rules/safety.md`                                                                                                                                                                                                                                                                      |

---

## Rule Priority

When guidance conflicts, follow this order:

1. Explicit user instructions
2. `docs/rules/project.md`
3. Architecture and project documentation
4. Existing repository patterns
5. Relevant rule files
6. AI assumptions

Never let assumptions override repository facts.

---

## Repository Truth

When documentation, comments, or planning documents conflict with the implemented code:

1. Treat the implementation as the current repository truth.
2. Report the inconsistency.
3. Do not silently "fix" code to match stale documentation.
4. Update documentation only when the current task explicitly requires it.

---

## Loading Principle

- Do **not** load every rule file by default.
- Load only the rule files required for the current task.
- Keep context focused by avoiding unrelated rules.
- Follow references only when they are directly relevant to the task.
