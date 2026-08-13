# Git Conventions

These conventions define how version control is used in this repository. General Git workflows and tooling belong in the `git` skill.

## Commits

- Follow the Conventional Commits specification.
- Keep each commit focused on a single logical change.
- Write commit messages in the imperative mood.
- Avoid mixing unrelated changes in the same commit.
- Do not create temporary or "WIP" commits unless explicitly requested.

## Milestone Workflow

This repository follows a milestone-driven, AI-assisted implementation workflow.

Every implementation step follows this exact sequence:

1. Implement the current milestone step.
2. Perform an AI code review.
3. Perform a manual code review.
4. Perform manual testing.
5. Verify every acceptance criterion.
6. Commit.
7. Proceed to the next step.

Never skip any stage.

The atomic unit of work is **one completed milestone step**, not an arbitrary logical change. A single milestone step should normally produce exactly one commit. Do not split one step into multiple commits unless unrelated work was introduced accidentally. Do not combine multiple milestone steps into one commit.

### Definition of Done

A milestone step is complete only if all of the following are true:

- Implementation completed.
- AI review completed.
- Manual review completed.
- Acceptance criteria satisfied.
- Manual testing completed.
- No new TypeScript errors introduced.
- No new lint errors introduced.
- No existing functionality broken.
- Git diff reviewed.
- Ready for commit.

If any item fails, the milestone step is NOT complete.

### Commit Format

Commit title format: `feat(m1): complete step X.Y <step name>`

Commit body should contain:

- Implemented: summary of what was built.
- Verified: Build, TypeScript, Lint, Manual testing, Acceptance criteria.

Only include items actually verified. Never claim verification that was not performed.

### Before Every Commit

Review `git status`, `git diff`, and `git diff --staged`. Ensure:

- Only current milestone files are staged.
- No accidental files are included.
- No unrelated refactoring is mixed in.
- No temporary or generated files are committed.
- No secrets are committed.

### AI Responsibilities

The AI should:

- Suggest the appropriate commit title.
- Generate the complete commit body.
- Summarize the implementation.
- Verify acceptance criteria based only on available evidence.
- Clearly distinguish verified facts from assumptions.

The AI should NOT:

- Execute git commit automatically.
- Push commits automatically.
- Rewrite Git history.
- Stage unrelated files.
- Claim verification without evidence.

The final commit decision always belongs to the developer.

## Branches

- Follow the branch naming convention defined in `project.md`.
- Create branches from the latest target branch unless instructed otherwise.
- Keep branch scope limited to a single feature, fix, or task.

## Pull Requests

- Do not open pull requests unless the user requests them.
- When preparing a pull request, include:
  - A clear summary.
  - Testing performed.
  - Breaking changes, if any.
  - Related issues or tasks, when applicable.

## History

- Keep commit history clean and easy to understand.
- Do not rewrite shared history unless explicitly approved.
- Never force-push shared branches.

## Synchronization

- Ensure the working branch is up to date before merging or pushing when appropriate.
- Resolve conflicts deliberately rather than automatically.

## Repository Safety

- Never commit secrets, credentials, API keys, or environment files.
- Verify generated files before committing them.
- Respect the repository's ignore rules.
