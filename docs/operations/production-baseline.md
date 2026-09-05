# Production Baseline

## Purpose

This record is the approved Step 57 baseline for Milestone 6. It fixes the
production decisions later steps depend on without changing application,
schema, API, or deployment behavior.

The governing product scope remains `docs/product/02-business-requirements.md`;
the approved deployment topology remains
`docs/architecture/09-deployment.md`.

## Entry Gate

Milestone 5.8 is closed. Its completion checklist records Step 56 and final
human product QA as complete. Its remaining work is limited to the explicitly
planned Milestone 6 items below; it transfers no unresolved P0 or P1
tenant-frontend defect.

| Objective                                                    | Current state                             | Milestone 6 disposition                                                   |
| ------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------- |
| Tenant business modules and lifecycle gate                   | Implemented                               | Regression protection in Steps 58 and 66                                  |
| Platform status action and audit                             | Implemented                               | Add discovery, frontend boundary, and bootstrap in Step 60                |
| Password-reset token lifecycle                               | Implemented; delivery is a test-only sink | Add Resend delivery in Step 59                                            |
| Private file metadata and local provider abstraction         | Implemented for development               | Add R2 provider and production hardening in Step 61                       |
| Offline operation                                            | Product requirement only                  | Define server protocol in Step 62 and client projection/outbox in Step 63 |
| Production configuration, image, compose, health, operations | Partial development foundation            | Complete in Steps 61 and 65                                               |
| Browser E2E                                                  | Plan only                                 | Add a narrow executable suite in Step 66                                  |
| Performance evidence                                         | Not yet captured                          | Baseline and resolve measured blockers in Steps 64 and 66                 |
| Deferred Version 3 work                                      | Not in scope                              | Do not implement in Milestone 6                                           |

## Approved Topology

The approved production topology is confirmed without adding services:

| Component           | Approved deployment                                                                     |
| ------------------- | --------------------------------------------------------------------------------------- |
| Frontend            | React, TypeScript, and Vite on Cloudflare Pages and CDN                                 |
| API                 | Node.js, Express, Prisma, and Docker on a Hetzner VPS in Nuremberg                      |
| Database            | PostgreSQL on the same VPS, private to the application environment                      |
| Runtime             | Docker Compose, including the API, PostgreSQL, and reverse proxy/runtime infrastructure |
| Object storage      | Private Cloudflare R2 through the existing storage-provider boundary                    |
| Edge                | Cloudflare DNS, proxy, TLS, DDoS protection, and edge rate limiting                     |
| Transactional email | Resend, using a verified sender identity and controlled frontend reset origin           |

The first pilot starts at approximately 4 vCPU, 8 GB RAM, and 80 GB storage.
PostgreSQL remains authoritative. The frontend remains independently deployable
and is not hosted from the VPS. No cache, queue, worker, broker, search engine,
or additional database is approved for this pilot.

Production PostgreSQL is co-located with the production API on the approved Hetzner VPS. Staging uses an isolated PostgreSQL database and configuration and must not share production data; its exact infrastructure placement may be selected during Step 65 as long as isolation is preserved.

## Platform Owner Model

### Decision

`PLATFORM_OWNER` users will belong to one dedicated internal platform
organization. The internal organization is not a client tenant and must never
be returned by tenant organization discovery or granted tenant-business access.

### Basis

The current Prisma model requires `User.organization_id`, the access-token
contract requires an `org` claim, and tenant middleware already explicitly
rejects `PLATFORM_OWNER`. Making the relation nullable would require a broader
authentication, token, relation, and tenant-context redesign without a current
benefit.

### Implementation Constraints

- Step 60 creates or resolves the internal organization only from the
  production-only bootstrap command.
- Normal registration, tenant user creation, invitations, role mutation, and
  normal seed data cannot create or promote a `PLATFORM_OWNER`.
- The internal organization is excluded from platform client-organization
  list, search, detail, and lifecycle actions.
- The bootstrap command is idempotent, fails on conflicting email/role state,
  hashes its discarded initial secret, and triggers the approved password-reset
  delivery path instead of exposing a reusable password.

## Offline Operation Matrix

The following matrix is the approved Version 2 offline scope. It supersedes
the broader illustrative examples in `docs/architecture/08-offline-first.md`
where they conflict.

| Operation                                                                   | Offline disposition | Conflict rule                                                                                                      |
| --------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Open after a prior successful online authentication                         | Supported           | Session and local-data validity remain server-controlled after reconnect                                           |
| View previously synchronized approved data                                  | Supported           | Pull reconciles authoritative updates and deletes                                                                  |
| Search customers                                                            | Supported           | Search the tenant-local projection only                                                                            |
| Search vehicles                                                             | Supported           | Search the tenant-local projection only                                                                            |
| Create customer                                                             | Supported           | Idempotent command; duplicate server outcome is returned safely                                                    |
| Create rental                                                               | Supported           | Server rechecks tenant ownership, role, lifecycle, customer/vehicle state, and availability; no client-side winner |
| Edit existing customer                                                      | Supported           | Server revision mismatch returns a conflict with authorized current data                                           |
| Edit existing vehicle                                                       | Supported           | Server revision mismatch returns a conflict with authorized current data                                           |
| Edit existing rental fields                                                 | Not approved        | Online only until a specific safe edit contract is approved                                                        |
| Queue approved local mutations                                              | Supported           | Persistent ordered outbox with stable mutation identity                                                            |
| Synchronize after reconnect                                                 | Supported           | Retry is idempotent; failed/conflicting items remain recoverable                                                   |
| Vehicle creation                                                            | Online only         | Not in approved offline scope                                                                                      |
| Payments, expenses, maintenance, tasks                                      | Online only         | Not in approved offline scope                                                                                      |
| Rental pickup, return, extension, cancellation, or other lifecycle commands | Online only         | High-conflict availability/financial behavior remains server-mediated                                              |
| Files, photos, PDF/contract generation, download                            | Online only         | External/private-object operations are excluded                                                                    |
| First login, logout recovery, password reset, invitations, Platform Admin   | Online only         | Authentication or external-service operations are excluded                                                         |

Step 62 must choose a stable identity strategy that allows an offline-created customer to be referenced by dependent queued operations without temporary-ID ambiguity. The implementation may use client-generated UUIDs, server reconciliation identifiers, or another inspected minimal mechanism, but the client/server identity contract must be explicit and duplicate-safe.

## Password Reset And Object Storage

Step 59 uses Resend behind `deliverPasswordReset`. The API constructs the
one-time HTTPS reset URL from a validated deployment configuration; callers
cannot supply a redirect. The sender identity must be verified before staging
or production release. Request responses remain generic for known, unknown,
deactivated, and provider-failure cases. Provider failures are redacted and
observable without logging raw reset tokens.

Step 61 implements private Cloudflare R2 through the existing
`StorageProvider` abstraction. R2 stores production uploads and off-server
PostgreSQL backups. The application retains authenticated server-side
authorization and tenant checks before object retrieval; R2 objects are not
public.

## Pilot Capacity And Performance Gates

All measurements use a warm staging environment with production-like API and
PostgreSQL configuration, the normal production build, no artificial
Redis/cache layer, and this representative dataset:

- Two tenant organizations.
- Fifty vehicles, 1,000 customers, and 500 rentals per organization.
- Up to ten concurrent users total.
- A representative mid-range mobile device and simulated 4G connection for
  frontend measurements.

| Area                                         | Gate                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------- |
| Normal API read/list/detail                  | P95 at or below 500 ms                                                     |
| Customer and vehicle search API              | P95 at or below 500 ms                                                     |
| Normal create/update mutation                | P95 at or below 800 ms                                                     |
| Representative workload error rate           | Below 1%, excluding intentional validation and business-conflict responses |
| Initial usable application load              | At or below 3 seconds without depending on a cached application session    |
| Normal post-load navigation                  | Usable content at or below 1 second                                        |
| Initial sync of about 1,000 relevant records | At or below 30 seconds                                                     |
| Reconnect sync with a small normal queue     | At or below 10 seconds                                                     |
| Offline IndexedDB customer/vehicle search    | At or below 300 ms for the representative local dataset                    |

The UI must remain responsive, queued operations must not be lost, and the
representative workload must not sustain CPU or memory saturation, create
unbounded request fan-out, or cause query growth disproportionate to the
dataset. Step 64 records measurements and addresses only demonstrated
bottlenecks.

## Recovery And Release Ownership

| Area               | Approved decision                                                                                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backup cadence     | Daily automated PostgreSQL backup to private Cloudflare R2                                                                                                              |
| Retention          | Retain 30 daily backups                                                                                                                                                 |
| RPO                | 24 hours                                                                                                                                                                |
| RTO                | 4 hours                                                                                                                                                                 |
| Restore evidence   | Restore a backup into an isolated staging database, run migration status, and perform authenticated smoke checks before production approval and periodically thereafter |
| Release authority  | Project owner/operator approves staging promotion and production go/no-go                                                                                               |
| Incident ownership | Project owner/operator owns initial incident coordination, customer communication, rollback/recovery decision, and post-incident record                                 |

Step 65 implements the backup, restore, deployment, and runbook procedures.
No production launch is approved until the first successful restore rehearsal,
provider/DNS/secret permission walkthrough, and production-like staging smoke
test are recorded.

## Threat Inventory

| Surface                                            | Primary exposure                                                                              | Required disposition                                                                                                                                              |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public auth, refresh, reset, and invitation routes | Credential stuffing, enumeration timing, reset-token disclosure, refresh replay               | Step 58 corrects identity/session consistency; Step 59 preserves generic delivery behavior; Step 61 adds scoped rate limits and validated configuration           |
| Tenant APIs                                        | Cross-tenant access, malformed identifiers, non-operational organizations, stale cached data  | Step 58 validates UUIDs, normalizes request failures, and clears/partitions tenant data; server authorization remains authoritative                               |
| Platform APIs and bootstrap                        | Unauthorized role creation, client-tenant disclosure, bootstrap secret exposure               | Step 60 uses the dedicated internal organization, platform-only endpoints, audited operational command, and reset activation                                      |
| Offline browser data and outbox                    | Shared-device disclosure, stale edits, replay, duplicate rental                               | Steps 62-63 define tenant-scoped projection, encrypted/appropriate browser-storage decision, stable mutation identities, revisions, conflicts, and reconciliation |
| Upload and download paths                          | MIME spoofing, resource exhaustion, object guessing, cross-tenant retrieval, orphaned objects | Step 61 validates signatures, bounds resources, implements private R2, and defines object reconciliation                                                          |
| Email links                                        | Host-header/redirect injection, unverified sender, raw token in logs                          | Step 59 builds links from controlled origin and redacts provider diagnostics                                                                                      |
| Secrets and deployment controls                    | Placeholder credentials, public database, over-privileged provider access, unpatched image    | Step 61 fails closed on production configuration; Step 65 applies least privilege, image/dependency/secret scanning, private database networking, and runbooks    |

The Step 58 and 61 items above are production blockers. Version 3 work,
including MFA, OAuth, billing, notifications, queues, Redis, and broad
platform tooling, is explicitly excluded.

## Exit Evidence

Step 57 is complete when the repository entry checks, empty-database migration
rehearsal, baseline bundle/request/timing capture, provider-permission
walkthrough, and required operator/product approvals are recorded. The current
repository does not yet have provider credentials, deployed staging resources,
or executable browser E2E infrastructure; those are later-step implementation
deliverables and not evidence that this decision record changes application
behavior.

### Recorded Entry Validation

Recorded on 2026-09-04 from the clean pre-Step-57 worktree:

| Check                                                     | Result                                                                                                                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                                               | Passed: 239 API tests and 281 web tests                                                                                                                                 |
| `pnpm typecheck`                                          | Passed                                                                                                                                                                  |
| `pnpm lint`                                               | Passed                                                                                                                                                                  |
| `pnpm build`                                              | Passed; Vite emitted existing source-map resolution and over-500 kB chunk warnings                                                                                      |
| `prettier --check docs/operations/production-baseline.md` | Passed                                                                                                                                                                  |
| `git diff --check`                                        | Passed                                                                                                                                                                  |
| OpenAPI code generation                                   | Blocked: Orval adds a trailing blank line to `lib/api-zod/src/generated/platform/platform.ts`; `tsc --build` rejects that generated output with `new blank line at EOF` |

The generated output was restored after this check, so the baseline record is
the only worktree change. The generator reproducibility defect must be fixed
at its source before Step 58/65 exit verification; generated files must not be
hand-edited to conceal it.

### Pending External Evidence

- Rehearse all migrations against an empty disposable PostgreSQL database and
  record migration status. No disposable database URL was available during
  this documentation implementation.
- Capture the approved staging bundle, request-count, API-timing, search, and
  synchronization measurements against the representative pilot dataset.
- Walk through Cloudflare, Hetzner, R2, Resend, DNS, TLS, backup, restore, and
  secret-management permissions with the project owner/operator.
- Confirm the documented offline matrix with a representative pilot rental
  business user before implementing synchronization.
