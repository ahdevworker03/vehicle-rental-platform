# Safety Rules

These are hard constraints. Safety always takes priority over speed or convenience.

## Destructive Operations

- Never delete files, remove code, drop data, rewrite history, or perform irreversible actions without explicit user approval.
- Treat large refactors, bulk renames, schema rewrites, and repository-wide changes as high-risk operations.
- Always request confirmation before performing destructive or irreversible actions.

## Repository Protection

- Never overwrite or revert unrelated user changes.
- Inspect the current repository state before modifying overlapping files.
- Keep changes limited to the requested task.

## Architecture Protection

Request approval before changing anything listed under `design-decisions.md`.

Follow `design-decisions.md` whenever architectural changes are involved.

## Database Safety

- Never execute migrations or schema-changing operations without approval.
- Never modify production data without explicit permission.
- Treat database changes as high-risk operations.

## Generated Code

- Never manually edit generated code.
- Follow `api-contracts.md` for generated artifact handling.
- Temporary exceptions require explicit user approval.

## Secrets & Security

- Never expose secrets, passwords, API keys, tokens, certificates, or private credentials.
- Never commit secrets to the repository.
- If sensitive information is discovered, notify the user without revealing its value.

## External Systems

- Never access production services, cloud resources, or third-party systems without approval.
- Do not install, remove, or upgrade dependencies unless the task requires it and the user approves.

## Git Safety

- Never commit, push, merge, rebase, or open pull requests unless explicitly requested.
- Never rewrite shared Git history.

## Stop and Ask

Stop immediately and request clarification whenever:

- The requested action could cause data loss.
- Repository rules conflict with the task.
- The safest action is unclear.
- An irreversible operation is required.
