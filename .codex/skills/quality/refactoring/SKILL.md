---
name: refactoring
description: Code refactoring methodology, identifying code smells, improving code structure and maintainability, applying standard refactoring patterns, reducing technical debt, preserving behavior while improving design, and building confidence through test coverage. Applicable when improving existing code, reducing complexity, paying down technical debt, or preparing code for future changes.
---

# Refactoring

## Purpose

This skill guides the agent in systematically improving code structure and design without altering external behavior. Refactoring is the disciplined practice of restructuring existing code to improve readability, reduce complexity, and enhance maintainability while preserving functionality. The skill covers identifying code smells, applying standard refactoring patterns, building confidence through tests, and managing refactoring in production environments.

---

## When to Load

- User is improving or cleaning up existing code without adding new features.
- User mentions: `refactor`, `refactoring`, `code smell`, `technical debt`, `improve`, `clean up`, `restructure`, `simplify`, `extract`, `inline`, `rename`.
- User asks about improving code quality, reducing duplication, or simplifying complex logic.
- User is paying down technical debt or preparing code for future changes.
- User is reviewing code and identifying improvement opportunities (see also `code-review` skill).

---

## When NOT to Load

- Writing new code or implementing new features.
- Debugging or fixing bugs (see `debugging` skill).
- Performance optimization without structural changes (see `performance` skill).
- General code review (see `code-review` skill).

---

## Core Principles

1. **Preserve External Behavior** – Refactoring changes the internal structure of code but must not change its observable behavior. All existing tests must pass before and after refactoring.
2. **Refactor in Small Steps** – Make one small change at a time, run tests, and verify the system still works. This minimizes risk and makes it easier to identify issues.
3. **Build Confidence with Tests** – Only refactor code that has good test coverage. Tests provide the safety net that ensures behavior is preserved.
4. **Refactor When Code Smells** – Don't refactor for the sake of refactoring. Refactor when you encounter specific code smells that indicate deeper design issues.
5. **Refactor Before Adding Features** – Clean up code before adding new functionality. This makes the new code easier to integrate and reduces complexity.
6. **Keep the Code Better Than You Found It** – Make small improvements to code you touch. This prevents degradation and gradually improves code quality over time.
7. **Know When to Stop** – Over-refactoring can be as harmful as under-refactoring. Stop when the code is clean enough and the changes are adding diminishing returns.

---

## Decision Rules

### When to Refactor

- **IF** the code is difficult to understand or explain, **THEN** refactor to improve clarity and readability.
- **IF** the code contains duplication (DRY violation), **THEN** extract the duplication into a shared function or module.
- **IF** the code is tightly coupled or hard to change, **THEN** refactor to reduce coupling and improve modularity.
- **IF** the code has become outdated relative to current practices, **THEN** refactor to align with current coding standards and patterns.
- **IF** the code is complex and error-prone (high cyclomatic complexity), **THEN** refactor to simplify and reduce complexity.
- **IF** the code is about to receive significant new features, **THEN** refactor beforehand to make the changes easier.
- **IF** the code has a large, monolithic function or component, **THEN** refactor to split it into smaller, focused pieces.

### When NOT to Refactor

- **DO NOT** refactor code that is about to be deleted or rewritten entirely.
- **DO NOT** refactor code without sufficient test coverage (unless you add tests first).
- **DO NOT** refactor code that is near a deadline or in a critical state (unless the refactoring reduces immediate risk).
- **DO NOT** refactor code where the cost (time, risk) outweighs the benefit (e.g., legacy code that works and changes rarely).

### Refactoring Strategy Selection

- **IF** the code has insufficient test coverage, **THEN** write characterization tests (tests that document current behavior) before refactoring.
- **IF** the code has good test coverage, **THEN** refactor with confidence; run tests after each small change.
- **IF** the code is in production and must maintain uptime, **THEN** implement refactoring in multiple small PRs to reduce deployment risk.
- **IF** the refactoring is large (affects many files), **THEN** plan it in phases; release incrementally to reduce risk.

---

## Standard Refactoring Patterns

### Extraction Patterns

- **Extract Method** – Convert a large function into smaller, focused functions with descriptive names.
- **Extract Variable** – Replace complex expressions with well-named variables that explain the intent.
- **Extract Constant** – Replace magic numbers or strings with named constants.
- **Extract Component** – In React, split a large component into smaller, reusable components.
- **Extract Hook** – In React, extract reusable logic into custom hooks.
- **Extract Service** – In backend code, extract business logic from route handlers into dedicated service modules.

### Simplification Patterns

- **Inline Method** – Replace a simple method with its body when the method name is no clearer than the implementation.
- **Inline Variable** – Remove unnecessary variables that add no clarity.
- **Simplify Conditionals** – Replace complex conditionals with guard clauses, switch statements, or polymorphism.
- **Remove Dead Code** – Delete unused code, imports, variables, or functions.
- **Reduce Nesting** – Flatten deeply nested conditionals by returning early or using guard clauses.

### Reorganization Patterns

- **Rename** – Rename variables, functions, or classes to better reflect their purpose.
- **Move Method** – Move a method to the class that uses it most.
- **Move Field** – Move a field to the class that owns it conceptually.
- **Split Variable** – Use separate variables for different purposes instead of reusing one.
- **Replace Magic Number with Constant** – Replace hard-coded values with meaningful constants.

### Abstraction Patterns

- **Introduce Parameter Object** – Group related parameters into an object or interface.
- **Replace Conditional with Polymorphism** – Use polymorphism instead of conditional logic for varying behavior.
- **Encapsulate Collection** – Hide internal collection implementation behind methods that expose only needed operations.
- **Extract Interface** – Define interfaces or types for complex objects to improve loose coupling.
- **Replace Type Code with Enum** – Use enums instead of numeric or string constants for type codes.

---

## Language-Specific Refactoring Patterns

### TypeScript/JavaScript

- **Use ES6+ syntax** – Replace `var` with `const`/`let`, use arrow functions, template literals, and destructuring.
- **Replace `any` with proper types** – Replace `any` with specific types, `unknown`, or `never` as appropriate.
- **Replace `any[]` with typed arrays** – Use `Array<Type>` or `Type[]` for typed collections.
- **Use `import type`** – Use `import type` for imports that are only used for types to avoid runtime imports.
- **Replace `{}` with `Record<string, unknown>` or `unknown`** – `{}` is too permissive; use appropriate types.

### React

- **Replace class components with functional components** – Functional components with hooks are the modern standard.
- **Extract logic into custom hooks** – Encapsulate reusable logic (e.g., `useFetch`, `useAuth`, `useForm`).
- **Extract large components into smaller ones** – Each component should have a single responsibility.
- **Replace inline styles with Tailwind classes** – Use Tailwind utilities for consistency and maintainability.
- **Replace Context for high-frequency updates** – Split Context or use external state management for frequent updates.

### Express/Node.js

- **Extract route handlers into controllers** – Keep route definitions simple; move logic to controllers.
- **Extract business logic into services** – Service modules encapsulate business rules and data operations.
- **Extract validation into separate middleware** – Remove inline validation; use Zod schemas and validation middleware.
- **Extract shared middleware** – Extract reusable middleware (auth, logging, error handling) to separate files.
- **Use async/await instead of callbacks** – Promises and async/await are the modern standard.

### Prisma

- **Extract query logic into repositories** – Encapsulate Prisma queries in repository classes/functions.
- **Use generated types** – Instead of defining manual types, use `Prisma.UserGetPayload` or `z.infer` with validated data.
- **Replace raw SQL with Prisma ORM** – Use Prisma's query API for safety and type safety.
- **Extract shared query fragments** – Use Prisma's `include` or `select` fragments for repeated queries.
- **Use `select` instead of `include` when only specific fields are needed** – Reduces data over-fetching.

---

## Refactoring Workflow

### Step 1: Identify the Code Smell

- Look for duplication, long methods, complex conditionals, large classes, tight coupling, or poor naming.
- Use linters and static analysis tools (ESLint, TypeScript) to identify problematic patterns.
- Use code review feedback and team discussions to identify areas for improvement.

### Step 2: Ensure Test Coverage

- If tests are missing, write characterization tests that verify current behavior.
- Run all tests and ensure they pass before refactoring.
- The goal is to have a safety net that confirms behavior is preserved.

### Step 3: Plan the Refactoring

- Decide on the specific refactoring pattern(s) to apply.
- Consider the impact on dependent code and other team members.
- Plan to refactor in small, incremental steps.

### Step 4: Apply the Refactoring

- Make one small change at a time.
- After each change, run tests to verify behavior is unchanged.
- If tests fail, fix the issue or revert the change.

### Step 5: Validate the Result

- Run all tests and ensure they pass.
- Verify that the code is now cleaner, more maintainable, and easier to understand.
- Review the changes with the team if significant.

### Step 6: Commit and Deploy

- Commit the changes with a clear message describing the refactoring.
- Deploy the changes separately from feature changes to reduce risk.
- Monitor for any issues after deployment.

---

## Anti-Patterns

| Anti-Pattern                                   | Why it is wrong                                         | Correct approach                                 |
| ---------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| Refactoring without tests                      | Behavior changes are not detected; bugs are introduced. | Ensure test coverage or write tests first.       |
| Refactoring and adding features simultaneously | Hard to identify what caused bugs; increases risk.      | Refactor separately from feature development.    |
| Over-refactoring                               | Wastes time, adds unnecessary complexity.               | Stop when the code is clean enough.              |
| Gold-plating                                   | Refactoring for perfect code rather than good enough.   | Balance perfection with practical needs.         |
| Changing style without changing structure      | Style changes should be automated; not a refactoring.   | Use linters and formatters for style.            |
| Refactoring without reviewing the changes      | Mistakes are not caught.                                | Review refactoring changes carefully.            |
| Refactoring code that is rarely touched        | Wastes effort; returns low value.                       | Focus on frequently changed or problematic code. |

---

## Common Mistakes & Edge Cases

| Mistake                               | Symptom                                             | Solution                                                       |
| ------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| Not running tests after each change   | Hard to identify which change broke something.      | Run tests after every small change.                            |
| Refactoring in large batches          | Risk increases; hard to review; hard to rollback.   | Refactor in small, focused PRs.                                |
| Changing logic during refactoring     | Behavior changes; tests fail.                       | Separate refactoring from behavior changes.                    |
| Not communicating with the team       | Conflicts and duplicate work.                       | Coordinate refactoring efforts.                                |
| Ignoring dependency management        | Refactoring breaks dependent code.                  | Update dependent code or use interfaces.                       |
| Refactoring without measuring impact  | Hard to know if the refactoring helped.             | Measure before and after (e.g., complexity metrics).           |
| Not documenting refactoring decisions | Future developers don't know why changes were made. | Document significant refactoring decisions in commit messages. |
| Overcomplicating simple code          | Code becomes harder to understand.                  | Simpler is often better; avoid unnecessary abstractions.       |

---

## Related Skills

- `code-review` – for identifying refactoring opportunities during code review.
- `testing` – for ensuring test coverage before refactoring.
- `typescript` – for applying TypeScript-specific refactoring patterns.
- `react` – for React component refactoring.
- `express` – for Express route and middleware refactoring.
- `prisma` – for Prisma query and schema refactoring.
- `performance` – for performance-aware refactoring.

---

## Official References

- [Martin Fowler – Refactoring](https://martinfowler.com/refactoring/)
- [Martin Fowler – Catalog of Refactorings](https://refactoring.com/catalog/)
- [Clean Code – Robert C. Martin](https://www.oreilly.com/library/view/clean-code/9780136083238/)
- [Refactoring Guru – Refactoring Techniques](https://refactoring.guru/refactoring/techniques)
- [Refactoring TypeScript – Examples](https://refactoring.guru/refactoring/techniques?lang=ts)
- [React – Optimizing Performance](https://react.dev/learn/render-and-commit)
- [Prisma – Code Review Best Practices](https://www.prisma.io/docs/orm/overview/prisma-in-your-stack/prisma-code-review-best-practices)
- [Google Engineering Practices – Refactoring](https://google.github.io/eng-practices/review/)
- [12 Factor App – Codebase](https://12factor.net/codebase)
- [OWASP – Code Review Guide](https://owasp.org/www-project-code-review-guide/)
