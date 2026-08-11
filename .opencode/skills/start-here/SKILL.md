---
name: start-here
description: Load for every task. Routes the agent to the minimum required repository rules based on task type. Use before any code, documentation, testing, API, monorepo, or generated-code work.
---

# Start Here

This is the default entry point for every task.

Read this first, then load only the rule files that are relevant to the task.

---

## How to Use

1. Read `project.md` first.
2. Identify the task type.
3. Read only the rule files listed for that task.
4. Follow references only when they are directly relevant.
5. If repository facts conflict with a general rule, follow the repository.

---

## Task Routing

| Task Type                      | Files to Read (in Order)                                                                                                                                                                                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bug Fix**                    | `project.md` → `core-behavior.md` → `development-workflow.md` → `safety.md` → `coding-standards.md` → `typeScript-rules.md` _(if TypeScript is involved)_ → `testing.md` _(if tests change)_                                                                                             |
| **New Feature**                | `project.md` → `core-behavior.md` → `development-workflow.md` → `design-decisions.md` → `safety.md` → `coding-standards.md` → `typeScript-rules.md` _(if TypeScript is involved)_ → `testing.md` → `documentation.md` _(if repository truth changes)_ → `ui-ux.md` _(if UI is involved)_ |
| **Refactoring**                | `project.md` → `core-behavior.md` → `development-workflow.md` → `design-decisions.md` → `safety.md` → `coding-standards.md` → `typeScript-rules.md` _(if TypeScript is involved)_ → `testing.md`                                                                                         |
| **Documentation**              | `project.md` → `core-behavior.md` → `documentation.md` → `development-workflow.md`                                                                                                                                                                                                       |
| **Testing**                    | `project.md` → `core-behavior.md` → `testing.md` → `safety.md`                                                                                                                                                                                                                           |
| **UI / UX Work**               | `project.md` → `core-behavior.md` → `development-workflow.md` → `ui-ux.md` → `design-decisions.md` → `safety.md` → `typeScript-rules.md` _(if TypeScript is involved)_ → `testing.md`                                                                                                    |
| **Repository Cleanup**         | `project.md` → `core-behavior.md` → `development-workflow.md` → `safety.md` → `coding-standards.md` → `git.md`                                                                                                                                                                           |
| **Monorepo / Package Changes** | `project.md` → `core-behavior.md` → `development-workflow.md` → `monorepo.md` → `safety.md`                                                                                                                                                                                              |
| **API Contract Changes**       | `project.md` → `core-behavior.md` → `development-workflow.md` → `api-contracts.md` → `generated-code.md` → `design-decisions.md` → `safety.md`                                                                                                                                           |
| **Generated Code Changes**     | `project.md` → `core-behavior.md` → `development-workflow.md` → `generated-code.md` → `api-contracts.md` → `safety.md`                                                                                                                                                                   |

---

## Rule Priority

When guidance conflicts, follow this order:

1. Explicit user instructions
2. `project.md`
3. Architecture and project documentation
4. Existing repository patterns
5. Relevant rule files
6. AI assumptions

Never let assumptions override repository facts.

---

## Loading Principle

- Do **not** load every rule file by default.
- Load only the rule files required for the current task.
- Keep context focused by avoiding unrelated rules.
- Follow references only when they are directly relevant to the task.

---

## Response Report

At the end of every implementation task:

1. Write the complete implementation report to:

```
docs/response.md
```

2. Replace the entire contents of the file with the current report.

3. Do **not** append to the file.

4. Do **not** keep previous reports.

5. The file must always contain **only the latest task report**.

The report written to `docs/response.md` must match the final response provided to the user.
