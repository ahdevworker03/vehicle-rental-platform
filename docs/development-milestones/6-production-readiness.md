# Milestone 6 — Production Readiness

## Milestone Goal

Take the completed Version 2 business capabilities to a production-ready state without expanding the product into Version 3. The release must be a secure, deployable, supportable multi-tenant SaaS application that a first real rental business can use for daily work, including approved offline operation through temporary connectivity loss.

The milestone delivers:

- A deliberately small Platform Admin surface for discovering client organizations, viewing basic account state, and changing lifecycle status.
- A secure, explicit, auditable `PLATFORM_OWNER` bootstrap and recovery process unavailable through normal tenant registration or tenant user management.
- Real password-reset email delivery through the existing secure reset-token workflow.
- An offline application and synchronization workflow in which PostgreSQL remains authoritative.
- Evidence-based performance improvements, focused bug fixes, regression protection, and production security hardening.
- Reproducible deployment, migration, backup, recovery, observability, smoke-testing, and operating procedures.
- Updated sources of truth and runbooks required to operate the release.

## Starting State

Milestones 1 through 5.8 are documented as complete. Milestone 5.8 closed with Step 56 and final human product QA complete.

### Already Implemented

- React/Express/PostgreSQL/Prisma monorepo, generated OpenAPI client and validation packages, tenant business modules, and Arabic-first tenant UI.
- Customer, vehicle, rental, contract, payment, expense, maintenance, maintenance-schedule, task, dashboard, analytics, and report capabilities with established module owners and lower-level tests. Milestone 6 does not rebuild those domains.
- The roles are exactly `PLATFORM_OWNER`, `OWNER`, and `EMPLOYEE`. Normal registration creates a tenant organization and its first `OWNER`; tenant user creation and invitations create only `EMPLOYEE`.
- Organization lifecycle states `TRIAL`, `ACTIVE`, `SUSPENDED`, and `CANCELLED`. Shared middleware permits tenant business operations for `TRIAL`/`ACTIVE`, blocks `SUSPENDED`/`CANCELLED`, and rejects `PLATFORM_OWNER` access to tenant business routes.
- A `PLATFORM_OWNER`-only status endpoint at `PATCH /api/platform/organizations/{organizationId}/status`, transactionally coupled to an append-only `AuditLog` record. Status changes, invitation events, and completed password resets are audited; there is no audit read API or UI.
- Password-reset request/confirm endpoints implement random opaque tokens, hash-only persistence, one-hour expiry, single-use consumption, replacement-password hashing, refresh-token revocation, transaction safety, anti-enumeration responses, and completion audit logging.
- A storage-provider abstraction with local filesystem storage; existing upload limits, tenant checks, server-generated keys, path protections, and controlled retrieval are development foundations.
- Vitest, Supertest, React Testing Library, database-backed API tests, frontend tests, and detailed manual/E2E test plans exist.

### Functionality Requiring Completion

- The password-reset delivery boundary is a test sink in `NODE_ENV=test` and otherwise performs no delivery.
- Platform administration has a status mutation but no organization discovery/detail contract, dedicated frontend route, or secure production bootstrap.
- Production environment validation, deployable artifacts, durable object storage, dependency-aware readiness, graceful shutdown, centralized observability, backups, restore evidence, and release runbooks are incomplete.
- The planned browser E2E suite is documented but has no executable runner, configuration, scripts, or scenarios.

### Technical Debt and Follow-Up Fixes

- A rental with no contract correctly produces `404 CONTRACT_NOT_FOUND`, and the UI renders an empty state, but contract queries retry and signed-document queries run before contract existence is known, creating expected `404` request/log noise.
- Most resource ID path parameters are not declared as UUIDs in OpenAPI and are not validated before Prisma. Malformed vehicle IDs can become internal `500` responses; the same boundary must be reviewed across all UUID resource routes.
- Authentication/session review found production-risk edge cases around deleted-user refresh/current-user behavior, refresh rotation, email identity normalization, account-role mutation, and API/implementation contract consistency. These require confirmation and focused correction, not a redesign.
- Tenant React Query data is not partitioned or cleared on account changes. The organization-status gate and role-aware frontend routing require final fail-closed verification; platform owners have no separate frontend destination.
- The API error boundary does not deliberately normalize malformed JSON, oversized JSON, or known Prisma input failures. Account-administration audit coverage is narrower than the completed Milestone 5.7 design intended.
- The API Docker image, development Compose file, environment examples, health endpoint, local file storage, and release scripts are not sufficient for production.

### Deferred or Future Work

- SaaS subscriptions, plans, billing, invoices, pricing, or usage metering; support CRM, tenant impersonation, customer-success tooling, or broad platform analytics.
- Payment gateways, Whish/QR payment processing, checkout, webhooks, refunds, or chargebacks; notification delivery, reminder workers, background schedulers, and automatic maintenance-record generation.
- Vehicle sales, online reservations, customer portal, branches, accounting integrations, public marketing site, and advanced analytics.
- MFA, OAuth, email verification, granular future permissions, and unrelated authentication redesign.
- Advanced synchronization infrastructure such as Redis, a message broker, background workers, multi-region replication, or general-purpose event sourcing unless measured production evidence later establishes a requirement.

## Scope

- Close production-critical correctness, API-contract, session, tenant-boundary, and error-normalization gaps that remain after Milestone 5.8.
- Complete the minimum platform organization operations needed by a platform owner: paginated/searchable organization discovery, basic organization detail, and the existing lifecycle-status action.
- Provide a secure operational path for initial and recovery `PLATFORM_OWNER` setup without exposing a public role-creation endpoint.
- Connect the existing password-reset workflow to a production email service with safe configuration, failure behavior, and verification.
- Implement the approved Version 2 offline read/search/write workflows through an explicit server/client synchronization design.
- Harden production configuration, secrets, HTTP controls, sessions, uploads, object storage, audit coverage, logs, and dependency handling according to verified attack surfaces.
- Establish representative performance baselines and fix only measured release bottlenecks.
- Make web, API, database migrations, object storage, and email deployable in separate staging and production environments.
- Add release automation, focused browser E2E tests, offline reconnect tests, production-like migration rehearsal, manual QA, production smoke testing, and current operational documentation.

## Non-Goals

- Rebuilding the tenant application, redesigning completed business modules, or carrying out a general refactor.
- Repeating Milestone 5.8 screen rebuild work. Its final authoritative-data and human-QA blockers must be closed in Milestone 5.8 or explicitly transferred with a documented reason.
- Turning the Platform Admin surface into a billing, support, impersonation, tenant-user-management, audit-analysis, or customer-success system.
- Allowing `PLATFORM_OWNER` creation through `POST /api/auth/register`, tenant invitations, `POST /api/users`, normal seed data, or a public bootstrap endpoint.
- Replacing the password-reset token domain, exposing reset tokens in API responses/logs, or adding MFA/OAuth as part of delivery work.
- Treating the existing transitional `apps/web/src/data` state or React Query cache as an offline synchronization system.
- Making PostgreSQL secondary to browser data, accepting client-supplied tenant identity, or bypassing server authorization/business rules during synchronization.
- Offline media upload/download, PDF generation, password reset, first-time login, Platform Admin work, or other external-service operations unless the approved offline operation matrix explicitly requires them.
- Speculative caching, Redis, workers, queues, search engines, or database indexes without a measured bottleneck or correctness requirement.
- A zero-downtime rolling old/new API deployment across the incompatible Task recurrence migration.

## Shared Planning / Implementation Rules

These rules apply milestone-wide and are not repeated inside each step unless a step has a special case.

- Inspect the actual implementation before changing it; repository code is the current truth.
- Prefer the smallest appropriate change that satisfies the requirement.
- OpenAPI (`lib/api-spec/openapi.yaml`) is the API contract source of truth; generated packages are regenerated, never edited manually.
- PostgreSQL remains authoritative; browser storage is a synchronized local projection and outbox only.
- Tenant isolation is mandatory everywhere; authorization is enforced server-side and frontend visibility is never treated as authorization.
- Schema changes require explicit justification and reviewed append-only migrations.
- Testing must be proportional to risk. Automated tests do not replace manual and product verification.
- Production bugs receive focused regression tests at the lowest reliable owner layer.
- No speculative infrastructure; measure before introducing caching, workers, or indexes.
- Milestone 5.8 (Step 56 and final human product QA) is the entry prerequisite.
- No dependent step starts until its prerequisite decisions, contract changes, migrations, focused tests, and verification are complete.
- Security, tenant isolation, financial correctness, rental availability, and synchronization-duplication failures are release blockers.

## Dependencies / Step Sequence

| Step | Depends On             | Reason                                                                                                                       |
| ---- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| 57   | Milestone 5.8 complete | Establishes the release truth, scope, operation matrix, and measurable gates and confirms the approved deployment providers. |
| 58   | 57                     | Correctness and identity decisions must precede new privileged and offline surfaces.                                         |
| 59   | 57-58                  | Delivery must preserve the corrected authentication/error behavior.                                                          |
| 60   | 57-59                  | Bootstrap should reuse verified password-reset delivery for credential activation/recovery.                                  |
| 61   | 57-60                  | Security and storage controls cover all known public, tenant, platform, email, and upload surfaces.                          |
| 62   | 57-61                  | Offline contracts depend on settled identity, authorization, security, and operation scope.                                  |
| 63   | 62                     | The client implements only the approved synchronization contract and conflict semantics.                                     |
| 64   | 57-63                  | Final measurements must include the completed online and offline data paths.                                                 |
| 65   | 57-64                  | Production deployment uses completed capabilities and verified capacity/security results.                                    |
| 66   | 58-65                  | Final E2E, manual, documentation, and release evidence verify the integrated product.                                        |

Major inputs and enablers: closed Milestone 5.8 with final defect disposition; current product requirements (`docs/product/02-business-requirements.md`, `docs/product/03-user-flows.md`); current architecture/schema contracts; a disposable PostgreSQL test/E2E database and a production-like staging database with representative non-sensitive data; approved staging and production providers (React/Vite frontend on Cloudflare Pages, Node/Express API on a Hetzner VPS, PostgreSQL co-located on the VPS, Cloudflare R2 private object storage, transactional email, Cloudflare edge, monitoring/logging); controlled test mailboxes, object-storage buckets, DNS/domain access, TLS, and secret-management access; and an approved pilot-capacity profile, performance targets, backup retention, RPO, and RTO.

---

## Approved Production Deployment Decisions

The following production deployment decisions are approved before Milestone 6 begins. They are not reopened unless a measured requirement justifies a change. Step 57 confirms these decisions and records the remaining operational details (pilot capacity/performance assumptions and validation criteria, RPO/RTO, backup retention, release ownership) rather than re-selecting providers. These decisions are reflected in `docs/architecture/02-technology-decisions.md` and `docs/architecture/09-deployment.md`.

- **Frontend** — React + TypeScript + Vite, deployed to Cloudflare Pages and delivered through Cloudflare's CDN, independently deployable from the API. It must not be hosted from the production VPS without a measured requirement.
- **Backend API** — Node.js + Express + Prisma, packaged with Docker, deployed to a Hetzner VPS in Nuremberg, Germany (initial region, subject to staging latency verification).
- **Initial capacity target** — approximately 4 vCPU / 8 GB RAM / 80 GB storage. The exact Hetzner plan may evolve; the architecture records the required capacity and provider, not a specific plan identifier.
- **Database** — PostgreSQL, initially co-located on the same Hetzner VPS as the API. PostgreSQL is not publicly exposed; database access is private/internal to the server/application environment, and backend credentials remain secret and environment-configured. PostgreSQL remains the authoritative system of record. API/database co-location is an intentional simplicity and cost decision, not a permanent constraint.
- **Object storage** — S3-compatible Cloudflare R2 for private vehicle photos, private customer/vehicle documents, signed rental documents/contracts where applicable, and other user-uploaded production files. Uploaded files must not depend on the VPS filesystem for durability. Access to tenant-owned private objects is controlled through authenticated server-side authorization and tenant isolation.
- **Backups** — PostgreSQL backups must leave the VPS (a VPS-only backup is not acceptable). Cloudflare R2 is the approved off-server backup destination. Backups are automated; retention is defined in Step 57; restore procedures are tested before production approval.
- **Edge / network** — Cloudflare provides DNS, proxying, HTTPS/TLS, DDoS protection, and appropriate edge-level rate limiting for public traffic before it reaches the VPS. Cloudflare protection does not replace backend security; Express remains responsible for authentication, authorization, organization isolation, validation, business-rule enforcement, and API-level protection.
- **VPS runtime** — Docker hosts the Node.js/Express API, Prisma runtime, PostgreSQL, and required reverse-proxy/runtime infrastructure. Docker Compose is used if it is the approved existing mechanism after repository inspection. No Kubernetes, orchestration platforms, or additional infrastructure without measured need.
- **Scaling** — the initial single-VPS topology is not a scalability blocker. Scaling is evidence-based: (1) vertically resize the VPS when measurements justify it; (2) move PostgreSQL to separate infrastructure when capacity/reliability/performance/operations justify separation; (3) add API instances and load balancing only when measured traffic requires horizontal scaling; (4) introduce Redis, queues, workers, Kubernetes, or distributed databases only when a concrete requirement or measured bottleneck justifies them. Future scaling infrastructure is not pre-built.

---

## Step 57 — Production Baseline and Release Decisions

### Objective

Create one evidence-based production-readiness baseline and lock the decisions required by later work without changing application behavior.

### Current State

- Milestone 5.8 is closed. Architecture documents establish the component topology and PostgreSQL authority. The production deployment providers are already approved (see "Approved Production Deployment Decisions" above); this step locks the remaining synchronization contracts, pilot performance targets, recovery objectives, and validates the approved initial capacity against representative staging measurements.
- The E2E and manual plans define release-critical workflows, but no executable E2E environment exists. Test, build, migration, Docker, storage, email, and health capabilities are incomplete for production.

### Scope

- Confirm Milestone 5.8 closure and import only its explicitly accepted Milestone 6 defect register; record a current-state matrix for every Milestone 6 objective (implemented, completion, debt, new work, deferred).
- Confirm the approved production topology (React/Vite frontend on Cloudflare Pages; Node/Express/Prisma API in Docker on a Hetzner VPS; PostgreSQL co-located on the VPS; Cloudflare R2 object storage; Cloudflare edge/network) using the existing React, Express, PostgreSQL, Prisma, object-storage, and email boundaries.
- Inspect and approve the smallest correct `PLATFORM_OWNER` persistence/bootstrap model against the current Prisma/domain model. Evaluate the viable options — including, but not limited to, a dedicated internal platform organization and making `organization_id` nullable — and approve exactly one. Do not pre-commit to either option before inspection.
- Approve the exact offline operation matrix from authoritative product documentation. Confirmed offline requirements are: opening the application after previous successful use, viewing previously synchronized data, customer search, vehicle search, customer creation, rental creation, approved editing of existing records, queueing local changes, automatic synchronization after reconnect, safe conflict handling, and duplicate prevention. Do not assume vehicle creation, payments, rental return/extension/cancellation, other rental lifecycle commands, or file/media operations are approved unless an authoritative current document explicitly says so; record the final matrix as this step's decision.
- Define conflict behavior for approved edits and any approved high-conflict rental/payment/lifecycle command.
- Select an email adapter/provider and define reset-link origin, sender identity, configuration, failure, and observability requirements; confirm Cloudflare R2 as the private durable object storage through the existing provider abstraction.
- Define representative pilot data volumes, devices, networks, browser support, and API/frontend/search/sync performance targets; define staging/production environments using the approved providers and initial region (Nuremberg, Germany, subject to staging latency verification), release ownership, backup retention, RPO/RTO, restore verification, and go/no-go authority.
- Complete a focused threat/attack-surface inventory covering public auth routes, refresh tokens, tenant APIs, platform APIs, local offline data, uploads/downloads, email links, secrets, and deployment controls.

### Non-Goals / Constraints

- No application, schema, API, infrastructure, or deployment behavior changes; no provider-specific architecture beyond what the approved topology needs; no new product capabilities, arbitrary performance numbers, or large-scale load requirements unrelated to the first production businesses.
- Contract changes use OpenAPI first; database changes use reviewed append-only migrations.
- Preserve the current access/refresh token architecture unless the threat review demonstrates a production blocker and an explicit authentication decision approves a change.

### Acceptance Criteria

- Milestone 5.8 is formally closed or its unresolved blockers have an explicit owner and prevent this step from passing; every later step has approved inputs and measurable exit criteria.
- The `PLATFORM_OWNER` persistence/bootstrap model is selected by explicit inspection and approval; the chosen internal organization, if any, must never appear as a client tenant or gain tenant-business privileges.
- The offline operation matrix names exact reads, searches, creates, and edits; unsupported actions are explicit and consistent with approved product scope.
- The approved production providers and environment boundaries are confirmed and recorded without introducing unneeded services; the initial capacity target (~4 vCPU / 8 GB RAM / 80 GB) and pilot capacity/performance targets and release-test data are documented and reproducible.
- RPO/RTO, backup/restore expectations, incident ownership, and go/no-go authority are approved.
- Threat-review findings are prioritized by actual exposure and mapped to Step 58 or Step 61; no deferred Version 3 feature enters the milestone.

### Verification

- Run the current API and web test suites, typecheck, lint, production builds, generated-artifact drift checks, and `git diff --check` to record the entry baseline.
- Verify all migrations from an empty disposable database and record migration status without touching development or production data; capture current bundle output, critical-page request counts, API timings, and representative baseline measurements.
- Review Milestone 5.8 final QA evidence and its remaining defect list; confirm staging/test accounts for `PLATFORM_OWNER`, two tenant `OWNER`s, and one `EMPLOYEE` can be created only through approved setup paths.
- Walk through provider, DNS, secret, backup, restore, and release permissions with the operator who will execute the first deployment.
- Project owner/operator approves the narrow Platform Admin scope, the offline operation matrix, and every online-only operation; a representative pilot rental-business user confirms the stated offline workflows.

### Dependencies

- Milestones 1 through 5.7 complete; Milestone 5.8 Step 56 and final human product QA complete.
- Project owner/operator available to approve the required product, architecture, security, and deployment decisions.

---

## Step 58 — Correctness, Contract, Session, and Tenant-Boundary Hardening

### Objective

Resolve confirmed production blockers at request, authentication, tenant, and frontend-data boundaries before adding privileged platform and offline capabilities.

### Current State

- Only platform organization-status and maintenance-schedule routes use UUID parameter validation; most OpenAPI path IDs are plain strings. The generic error handler maps unrecognized parser, payload-size, and Prisma input errors to `500`.
- A missing rental contract correctly returns `404 CONTRACT_NOT_FOUND`; `ContractSection` renders an empty state, but the global query policy retries once and the signed-document query starts independently.
- `authenticate` rejects soft-deleted users, but refresh rotation and `getCurrentUser` do not consistently apply the same active-user check; user soft deletion does not revoke sessions. User role update accepts only `EMPLOYEE` and does not protect an owner from self-demotion.
- Email identity is not consistently normalized across auth/onboarding paths; tenant query keys are not organization-partitioned and the QueryClient is not cleared on logout/account transition.

### Scope

- Declare every UUID resource parameter as `format: uuid` in OpenAPI and validate before controllers and Prisma, including the known malformed vehicle-ID case.
- Normalize malformed JSON, payload-too-large, unsupported-content, and known request-shape failures to deliberate safe client errors without leaking Prisma details.
- Preserve the REST-consistent missing-contract `404`; disable retries for this expected code, gate signed-document queries on confirmed contract existence, and suppress only expected empty-state telemetry noise.
- Make deleted-user behavior consistent across access-token authentication, `/auth/me`, refresh, and user deletion; revoke deleted users' refresh tokens transactionally where required.
- Make refresh-token rotation atomic or otherwise prove concurrent use cannot issue multiple valid successor sessions.
- Establish one normalized email identity rule across registration, login, direct user creation, invitations, and reset; preflight existing data for case-insensitive collisions before adding database-level enforcement.
- Prevent owner self-demotion and tenant orphaning; retain or remove the role-update operation per its approved useful behavior without inventing owner promotion.
- Reconcile organization-delete and `/auth/me` API descriptions/statuses with approved behavior; clear or partition tenant server-state caches on logout and account/organization change.
- Complete the narrow Milestone 5.7 audit obligation for actual account-administration actions without logging credentials or tokens.
- Resolve only accepted P0/P1 auth, role-routing, organization-gate, or data-boundary defects transferred from Milestone 5.8.

### Non-Goals / Constraints

- No replacement authentication system, OAuth, MFA, email verification, granular permission system, or tenant impersonation; no broad repository refactor or exhaustive rewrite of every error message.
- No nullable tenant relation for ordinary tenant users; no change from missing-contract `404` to nullable `200` unless product/API review rejects the minimal frontend-query correction.

### Acceptance Criteria

- Malformed vehicle and other UUID path IDs never reach Prisma and return the documented validation response rather than `500`; invalid JSON and payload-size errors return stable safe 4xx responses, and unexpected errors remain redacted in production.
- A rental without a contract renders one truthful empty state without signed-document requests, automatic retry loops, or expected error noise.
- Deleted users cannot restore, refresh, or continue a session; deleting a user invalidates its refresh credentials; one refresh token cannot produce multiple valid successor token pairs under tested concurrency.
- Email lookup and uniqueness behavior are consistent across all auth/onboarding paths and verified against migrated data.
- An owner cannot remove the final owner access path through self-demotion or an unsupported role update.
- API contracts match `/auth/me` and organization-delete behavior; logout and account switching cannot display another organization's cached server data.
- Account-administration audit entries are transactionally coupled, correctly attributed, and contain no sensitive material.
- Existing owner/employee authorization, organization lifecycle, tenant isolation, rental rules, and financial behavior remain unchanged.

### Verification

- Add table-driven route tests for malformed UUIDs across resource families, including vehicle list/detail/media/history paths where applicable.
- Add API tests for parser/payload errors and production-safe error bodies; add contract query/component tests proving no retry and no signed-document fetch before a contract exists.
- Add auth integration/concurrency tests for deleted users, refresh rotation, logout, `/auth/me`, email normalization, user deletion, role update, and audit coupling; add frontend provider/route tests for cache clearing/partitioning and fail-closed account/organization states.
- Run full API/web tests, typecheck, lint, build, OpenAPI generation/drift checks, migration reset/rehearsal where changed, and `git diff --check`.
- Manual: inspect Network/Console on a rental with no contract; try malformed IDs on representative routes; delete a disposable employee with an active session; log out of tenant A and sign into tenant B to confirm no A data appears; verify suspended/cancelled tenant and `PLATFORM_OWNER` routing fails closed.

### Dependencies

- Step 57 decisions and threat findings; approved disposition of Milestone 5.8 auth/account defects.
- Disposable two-tenant test data and migration backup before identity normalization work.

---

## Step 59 — Real Password-Reset Delivery

### Objective

Connect the existing password-reset domain to a real transactional email delivery path with production configuration, safe failure handling, and end-to-end verification.

### Current State

- Reset request/confirm endpoints, token generation/hash/expiry, previous-token invalidation, one-time consumption, password hashing, session revocation, transaction retry, test delivery sink, and completion audit exist.
- `deliverPasswordReset` stores plaintext tokens only for tests and does nothing in other environments. The frontend reset screen already consumes the generated API and reads the token from the reset URL.
- A synchronous provider failure for a known email could currently distinguish that account from an unknown account.

### Scope

- Implement the selected transactional email adapter behind the existing delivery boundary.
- Add validated environment configuration for provider credentials, sender identity, and the exact allowed frontend reset origin/path; build the reset link server-side from controlled configuration, never a client-supplied redirect URL.
- Send a concise reset message with the one-time HTTPS link, one-hour expiry, and ignore-if-not-requested guidance.
- Preserve the same public response and materially equivalent behavior for known, unknown, and deactivated accounts.
- Handle provider failure without exposing account existence: return the generic accepted response, emit redacted structured operational logs/metrics, and permit a later request to replace the unused token.
- Define retry behavior at the adapter boundary only if the selected provider supports a small bounded retry safely; do not add a worker/queue unless Step 57 identifies a concrete reliability requirement that cannot be met synchronously.
- Ensure provider payloads, logs, errors, and monitoring never persist or expose the raw token beyond the message needed for delivery.
- Document sender/DNS setup, provider credential rotation, delivery monitoring, bounce/failure investigation, and recovery.

### Non-Goals / Constraints

- No reset-token schema/domain redesign, user enumeration, token API response, token logging, or plaintext token persistence.
- No employee-invitation email system unless separately approved; the approved invitation workflow remains manual; no marketing email, notification center, generic email framework, background-job platform, MFA, or email verification; no customizable redirect URL supplied by callers.
- The existing API contract should not change unless provider-independent delivery status requires an approved internal-only interface; public reset request remains `204` and reset confirmation continues to revoke all refresh sessions and audit completion atomically.

### Acceptance Criteria

- A reset request for an active staging account delivers one valid reset link to the controlled mailbox; the link opens the correct deployed frontend route over HTTPS and permits one password change before expiry.
- Reused, expired, superseded, malformed, and deactivated-account tokens preserve existing safe behavior; completing reset revokes prior refresh sessions and the new password can log in.
- Unknown/deactivated/known requests have the same public response and do not reveal account existence through error bodies.
- Provider failures are observable to operators, safe to retry through a new request, and never expose token/credential material.
- API startup fails clearly when production email configuration is missing or unsafe; the production sender domain/configuration passes the selected provider's required verification before release.

### Verification

- Preserve existing token lifecycle/concurrency tests; add delivery-adapter unit/integration tests for link construction, correct recipient, expiry copy, safe payload, success, timeout, bounded failure, and redacted logging.
- Add route tests proving generic responses for known, unknown, deactivated, and provider-failure cases; add an E2E-compatible fake mailbox path for staging/release tests.
- Manual: request reset in staging using a real controlled mailbox; verify prior sessions are invalid after reset; verify reset URLs use the correct origin; simulate a provider outage and confirm generic response plus redacted operator diagnostics; confirm raw tokens/secrets are absent from logs.

### Dependencies

- Steps 57 and 58; approved provider, sender domain, frontend origin, test mailbox, and secret-management access.

---

## Step 60 — Simple Platform Administration and Secure Bootstrap

### Objective

Deliver the minimum platform-owner workflow needed to discover client organizations, inspect basic organization state, change lifecycle status, and securely establish/recover platform-owner access.

### Current State

- The role enum, organization lifecycle states, `PLATFORM_OWNER` authorization, status endpoint, tenant-route rejection, and transactional status audit already exist.
- All users currently require an organization. Normal registration always creates `OWNER`; tenant user creation/invitations create only `EMPLOYEE`; seed creates no users. There is no platform organization list/detail API, platform router/shell, bootstrap command, or runbook.

### Scope

- Add paginated organization list/search and basic organization detail endpoints under `/api/platform/organizations`, protected only for `PLATFORM_OWNER`.
- Return only the minimum organization information needed for the approved workflow: organization identity/profile, lifecycle status, and creation/update dates. Do not expose tenant business records or add optional extra fields simply because they may be useful.
- Reuse the existing status-change service and transactional audit behavior; add explicit confirmation and safe no-op handling.
- Add a dedicated `/platform` frontend boundary and compact platform shell. Route `PLATFORM_OWNER` users there instead of mounting tenant queries or tenant navigation.
- Provide list/search/filter by lifecycle status, basic detail, and lifecycle status action with loading, empty, error, confirmation, and success states; keep any internal platform organization out of client-organization results.
- Implement the `PLATFORM_OWNER` persistence/bootstrap model approved in Step 57, and no other. A production-only operational bootstrap command/script (not an HTTP endpoint or normal seed) must be explicit, idempotent, fail closed on conflicting email/role state, hash all persisted credentials, and record a non-sensitive `PLATFORM_OWNER_BOOTSTRAPPED` audit event.
- Generate and discard an unusable random initial secret, then invoke the verified reset-delivery path so the platform owner chooses the password through the existing one-time reset flow. Do not print or log a reusable initial password.
- Document prerequisites, exact invocation, dry-run/state inspection, expected audit evidence, repeat invocation behavior, credential recovery through reset, compromise response, and verification that normal registration cannot create the role.

### Non-Goals / Constraints

- No subscriptions, billing, plans, usage metering, tenant-user management, tenant data browsing, support CRM, impersonation, support tickets, audit dashboard, or advanced platform analytics.
- No public or authenticated HTTP bootstrap endpoint; no `PLATFORM_OWNER` option in registration, invitations, tenant user creation/update, or normal development seed; no platform access to tenant business routes.
- Platform organization IDs are the only client-controlled tenant identifiers in this boundary; every endpoint requires `PLATFORM_OWNER`, validates UUIDs, and never derives target tenant from a request body. Platform organization responses must not include password hashes, tokens, private files, tenant financial data, or business records.
- Bootstrap and lifecycle changes must be auditable with IDs and state transitions only, never secrets.

### Acceptance Criteria

- Normal registration, direct tenant user creation, invitations, and role update cannot create or promote `PLATFORM_OWNER`.
- An authorized operator can run the bootstrap once without exposing a password/token and can verify the expected platform user and audit record; re-running is a safe documented no-op for the same valid account and a hard failure for conflicting identity/role state.
- The bootstrapped user receives the approved one-time reset link, sets a password, logs in, and reaches `/platform`.
- `OWNER` and `EMPLOYEE` receive `403` from every platform endpoint and cannot render platform content through direct navigation; `PLATFORM_OWNER` cannot access tenant business APIs or tenant navigation.
- Platform organization list/search/filter/detail and status changes work with pagination and do not include any internal platform organization.
- Status changes preserve current tenant lifecycle behavior and create one correctly attributed audit record only when state actually changes.

### Verification

- Add backend authorization/tenant-safety tests for platform list, search, detail, status, malformed IDs, deleted organizations, and response-field minimization.
- Add bootstrap tests for first run, repeat run, conflicting email, discarded initial credential, reset activation, and audit output; add frontend route/component tests for role branching, direct-route denial, list/detail states, lifecycle confirmation, and absence of tenant navigation/queries.
- Add regression tests proving tenant registration and invitation roles remain fixed.
- Run full API/web tests, OpenAPI/generated drift checks, typecheck, lint, builds, migration checks if needed, and `git diff --check`.
- Manual: rehearse bootstrap from a production-like shell using staging secrets and a controlled mailbox; log in as all three roles and verify destinations and forbidden boundaries; search organizations, suspend/reactivate one, and verify tenant behavior in a separate session.

### Dependencies

- Steps 57 through 59; the approved Step 57 `PLATFORM_OWNER` persistence/bootstrap model.
- Controlled platform-owner email and operator access to the deployment environment/secrets.

---

## Step 61 — Production Security and File-Storage Hardening

### Objective

Harden the verified production attack surfaces and replace development-only file storage with durable private storage while preserving existing authorization, tenant isolation, and storage reliability behavior.

### Current State

- JWT validation, Argon2id, hash-only long-lived tokens, RBAC, tenant scoping, lifecycle middleware, production error redaction, CORS, structured logs, and selected audit events exist.
- There is no deliberate security-header policy, public/auth/upload rate limiting, request timeout, production proxy policy, or centralized strong environment validation.
- Browser tokens are persisted in local storage; the final production treatment and residual XSS/CSRF trade-off have not been formally reviewed.
- Uploads have 10 MB limits, allowlists, randomized tenant-prefixed keys, filename path stripping, and tenant-safe retrieval. MIME is trusted from client metadata, files are buffered, and physical object retention/reconciliation is undefined. Only `LocalFilesystemProvider` is configured.

### Scope

- Resolve every high/critical item from Step 57's actual attack-surface review or document an approved release disposition.
- Add production-safe security headers/CSP appropriate to the Vite app and API, HTTPS/HSTS at the correct deployment layer, explicit trusted-proxy behavior, strict production CORS, body/request timeouts, and safe content-type handling.
- Add scoped rate limits for login, registration if retained, refresh, reset request/confirm, invitation acceptance, bootstrap-independent platform APIs, and uploads, without creating cross-tenant denial through a shared key design.
- Centralize/fail-close production configuration for JWT/session material, database URL, origins, object storage, email, environment/version identity, and operational timeouts; reject placeholders and unsafe production defaults.
- Review browser access/refresh-token persistence against CSP, XSS, CSRF, offline session, and deployment constraints; implement the smallest approved safe choice and document residual risk.
- Add actual file-signature/content validation for supported PDF/JPEG/PNG/WebP files rather than trusting multipart MIME alone; bound upload/download memory and concurrency based on measured container limits.
- Implement the approved private object-storage provider through the existing storage abstraction, with tenant-safe opaque keys, service access, authenticated retrieval or short-lived access, and separate staging/production buckets.
- Define object retention/deletion, orphan/missing-object reconciliation, backup expectations, and operational repair without weakening metadata soft-delete behavior.
- Verify dependency/container/secret scanning in CI using the chosen deployment ecosystem's existing capabilities; add only tools that produce actionable release evidence.
- Confirm logs, audit metadata, email diagnostics, offline diagnostics, and error responses redact authorization, cookies if introduced, passwords, reset/invitation tokens, object credentials, and sensitive file content.

### Non-Goals / Constraints

- No MFA, OAuth, email verification, WAF product, SIEM purchase, malware platform, or enterprise compliance program without a verified requirement.
- No public object bucket or unauthenticated permanent file URL; no per-tenant storage billing, quota product, or media transformation pipeline.
- No generic security rewrite, custom cryptography, or frontend visibility treated as authorization.
- No Redis-backed rate limiting unless the selected deployment has multiple instances and testing proves an in-memory/provider-native option cannot enforce the required control.
- Backend authentication, authorization, tenant lookup, and resource ownership checks remain mandatory before file access even when object storage supports signed URLs.

### Acceptance Criteria

- Production starts only with explicit valid origins, strong secrets, database, email, and object-storage configuration; unsafe defaults fail startup.
- Supported security headers and HTTPS policy are present without breaking the app, generated API, downloads, print/PDF, or email reset flow; rate limits protect abuse-prone endpoints while normal tenant and platform workflows remain usable and testable.
- Tokens/sessions follow the approved browser-storage decision; XSS/CSRF mitigations and offline implications are verified.
- Spoofed MIME, unsupported signatures, empty filenames, oversized files, and abusive concurrent uploads fail safely; files persist across API replacement/restart, remain private, and cannot be retrieved across tenants or guessed by storage key.
- Metadata-write failure cleans up the new object; missing/orphaned object procedures are testable and observable.
- Production logs/errors/scans expose no tested secret, token, authorization header, or sensitive file content; high/critical dependency/container/secret findings are fixed or explicitly block release.

### Verification

- Add middleware tests for headers, CORS, proxy/IP handling, request limits/timeouts, content types, and rate-limit boundaries; add configuration tests for missing, placeholder, malformed, and valid production values.
- Add auth/session tests required by the approved storage decision; add file-signature, size, filename, concurrency, tenant-isolation, missing-object, compensation, and private-object-provider integration tests.
- Build and scan the production container/artifacts; run dependency and secret scans with reviewed output.
- Manual: inspect deployed headers, TLS redirects, CORS rejection, and CSP console behavior; exercise rate-limit thresholds and recovery; upload valid and spoofed files then restart/replace the API; attempt cross-tenant file access using known IDs/keys.

### Dependencies

- Steps 57 through 60; approved security dispositions, object-storage provider, access policy, retention policy, and token-storage decision.
- Isolated staging bucket and controlled test files.

---

## Step 62 — Offline Synchronization Contract and Server Reconciliation

### Objective

Define and implement the smallest reliable server protocol that accepts approved offline mutations idempotently, detects conflicts safely, and returns authoritative tenant data for local synchronization.

### Current State

- UUID primary keys, tenant ownership, `created_at`/`updated_at`, soft deletion, transactions, and existing business services provide useful foundations.
- OpenAPI exposes normal resource endpoints only. Creates generally use server-generated IDs, updates have no optimistic concurrency token, and list responses have no synchronization semantics. PostgreSQL and backend business rules are authoritative.

### Required Properties

The design must satisfy these guarantees. Implementation selects the simplest mechanism that satisfies them at first-production scale.

- PostgreSQL remains authoritative; browser storage is a synchronized local projection and outbox only.
- Tenant isolation is mandatory for all synchronization reads and mutations.
- Retrying the same queued operation must be idempotent: it must not create duplicate authoritative records or effects.
- Conflicts must be detected and handled safely where relevant; high-risk financial/availability outcomes are never blindly last-write-wins.
- Relevant server changes and deletions must reconcile correctly.
- Existing backend business rules (role, organization lifecycle, tenant ownership, rental availability, financial, validation, soft-delete) remain authoritative for queued operations.
- Pending local changes survive restart; reconnect synchronization is safe; failed/conflicting operations remain recoverable.

Do not pre-approve operation-receipt tables, global versioning, revision columns on every resource, cursor infrastructure, tombstone tables, event logs, or generic sync ledgers unless implementation inspection proves them necessary.

### Scope

- Implement only the Step 57 approved offline operation matrix. Confirmed operations (customer/vehicle search, customer creation, rental creation, approved editing of existing records) are supported; vehicle creation, payments, rental return/extension/cancellation, other lifecycle commands, and file/media operations remain online-only unless Step 57's authoritative decision includes them.
- Choose the smallest stable identity strategy that lets offline-created records be referenced by dependent queued operations without temporary-ID ambiguity, and preserve command dependency/order rules (e.g., customer/vehicle before rental).
- Choose the smallest idempotency mechanism that guarantees duplicate-safe retries: repeating the same queued mutation must return/reconstruct the original outcome and cannot create a second record, payment, rental, or lifecycle transition.
- Choose revision/version/conflict semantics appropriate to the records and workflows that actually require concurrent-change detection. Do not use client clocks as authority, and do not add version fields to resources that do not need them.
- Choose bounded refresh, incremental pull, or another simple reconciliation mechanism based on expected data volume and measured needs; the client must have an authoritative way to reconcile relevant server changes and deletions.
- Reuse existing domain services for queued operations so synchronization executes the same role, organization lifecycle, tenant ownership, rental availability, financial, validation, and soft-delete rules as online calls.
- Define deliberate, recoverable conflict responses that include a safe machine-readable reason and the current authoritative server representation when authorized; remove stale local data for deleted records from normal local views without erasing queue/conflict evidence too early.
- Audit only sensitive platform/security actions already in scope; do not turn synchronization into event sourcing or log every business payload.

### Non-Goals / Constraints

- No client authority over organization ID, user role, server time, availability, balance, lifecycle validity, or conflict winner.
- No general distributed transaction, CRDT, multi-master database, event-sourcing system, message broker, Redis, or background worker.
- No automatic merge of rental, payment, maintenance, or other high-risk lifecycle/financial conflicts; no offline file/blob transfer unless explicitly included in the approved matrix; no generic synchronization framework for unimplemented modules.

### Acceptance Criteria

- Every approved offline command has a documented payload, dependency, authorization rule, idempotency outcome, conflict rule, and authoritative response.
- Retrying any accepted mutation ID does not create a duplicate record, payment, rental, or lifecycle transition.
- Cross-tenant IDs, stale/deleted users, unauthorized employees, platform owners, and non-operational organizations cannot synchronize tenant mutations.
- Stale edits produce an explicit conflict with enough authorized current data for resolution; no data is silently lost.
- Any approved rental availability/financial conflict preserves current server business rules and never uses blind last-write-wins.
- Pull returns only the authenticated tenant's approved data and propagates deletes reliably across interrupted/retried pages.
- Partial/failing batches report per-operation outcome without marking failed operations as synchronized; existing online API behavior remains correct and generated clients are current.

### Verification

- Add API/database tests for first apply, exact retry, changed-payload key reuse, concurrent duplicate submission, retention, and transaction rollback.
- Add conflict tests for stale edits and any approved high-risk operations; add two-tenant and all-role synchronization authorization tests, including suspension, cancellation, user deletion, and session expiry.
- Add pull/delete-propagation tests for initial sync, incremental changes, pagination interruption, and retry; add migration tests from empty and representative pre-sync data.
- Manual: queue/replay representative operations; re-submit the same operation concurrently and verify one authoritative effect; create a server-side edit between local read and queued update and verify conflict payload; suspend a tenant or delete a user before reconnect and verify queued changes remain unapplied.

### Dependencies

- Steps 57 through 61; approved offline matrix, conflict policy, batch/retention limits, and representative sync dataset.
- Backup and migration rehearsal plan for new synchronization fields/tables.

---

## Step 63 — Offline Client, Queue, and Synchronization UX

### Objective

Make the built web application available after a successful online login, store approved tenant data locally, support approved offline reads/search/mutations, and synchronize truthfully and safely after reconnect.

### Current State

- React Query manages live server state but is not persisted as a trustworthy domain database; `apps/web/src/data` is transitional mock/local state and must not become the offline store.
- Session restoration calls `/auth/me`; an offline failure can trigger refresh and clear the local session. No service worker/application-shell cache, IndexedDB schema, queue, connectivity state, or synchronization UI exists.

### Scope

- Add a service worker/application-shell cache sufficient to reopen the released application offline after at least one successful online load.
- Add one versioned IndexedDB-backed local domain store for the approved synchronized entities, revisions, outbox operations, and conflict/failure state.
- Keep local data partitioned by authenticated organization and user context; clear or lock it on logout/account change per the approved security policy.
- On successful online authentication, persist only the minimum validated session identity/state needed to unlock previously synchronized offline data; first login and credential verification remain online-only.
- Distinguish network failure from invalid/revoked/expired credentials. Do not clear a valid offline workspace merely because `/auth/me` is unreachable; clear/block on authoritative auth failure when the server is reachable.
- Populate local projections from successful online queries/synchronization and serve approved offline lists/details/search from IndexedDB, not mocks.
- Queue approved offline commands with stable record and operation IDs, dependency order, creation time, expected revision, attempt state, and safe payload.
- Apply local optimistic projections only where the operation matrix permits; clearly mark pending local records/actions and never show a financial/lifecycle command as server-confirmed before synchronization.
- Synchronize on application start when online, on connectivity restoration, and on explicit user retry/manual sync; use browser online events only as a trigger and determine real reachability from requests.
- Process dependencies deterministically, use bounded retries/backoff for transient failures, stop on auth/organization terminal states, and preserve failed/conflicted operations for recovery.
- Pull authoritative updates/deletions after reconciliation and update React Query/local views from one consistent result.
- Provide global and contextual states (offline, pending, synchronizing, up to date, failed, conflict, authentication required, organization unavailable) and conflict review/recovery for approved edits.
- Define safe local schema evolution so an incompatible version pauses synchronization without silently deleting unsynchronized work.

### Non-Goals / Constraints

- No offline first-time login, password reset, Platform Admin, external email, or unsupported external service; no reuse of transitional mock hooks/data as synchronized truth.
- No silent success, silent conflict overwrite, unbounded automatic retry, or client bypass of server rules; no background synchronization infrastructure beyond what the released browser safely supports and Step 57 approved.
- No multi-device real-time collaboration, CRDT, or offline media transfer unless explicitly approved.
- Elaborate multi-tab coordination, IndexedDB-corruption support/export tools, and complex service-worker compatibility/version protocols are not mandatory; introduce them only if implementation/testing proves they are required.
- `PLATFORM_OWNER` uses the online-only platform boundary and never initializes a tenant offline database.

### Acceptance Criteria

- After one successful online login and sync, the built app reopens offline and shows only that tenant's previously synchronized approved data.
- Approved customer/vehicle searches work offline against local data with the expected pilot volume.
- Every approved offline create/edit queues once, displays its truthful pending state, survives reload, and retains dependency order.
- Reconnect automatically pushes pending operations, handles duplicate-safe retries, pulls authoritative updates/deletions, and marks success only after server confirmation.
- Forced duplicate/retry scenarios produce one server effect and one reconciled local record; conflicts preserve local draft/evidence and current server data until the user selects an allowed recovery action.
- Transient network failures retry safely; validation/business conflicts do not retry forever.
- Logout, user/organization switch, user deletion, suspension/cancellation, and server-auth failure cannot expose or mutate another/unauthorized tenant's local data.
- Service-worker updates do not strand the app on an incompatible local schema or stale API contract; UI always distinguishes local pending, stale offline, synchronizing, synchronized, failed, and conflicted state.

### Verification

- Add deterministic local-store tests for schema evolution, tenant partitioning, indexes/search, outbox persistence/order, state transitions, and restart safety.
- Add synchronization coordinator tests for startup/reconnect/manual triggers, transient retry/backoff, auth stop, conflict preservation, partial success, pull reconciliation, and deletion.
- Add frontend component tests for all synchronization states and operation-specific pending/conflict UI.
- Add browser E2E scenarios for online seed/sync, disconnect, offline read/search, an approved offline create/edit, reload, reconnect, duplicate prevention, and final server/UI reconciliation; add browser tests for tenant logout/switch and non-operational/deleted-account reconnect behavior.
- Manual: install/load the staging build, synchronize representative data, close/reopen offline, and execute the full approved outage workflow; toggle offline during request/queue/pull; keep pending operations across browser restart; create a controlled server conflict from a second session; inspect IndexedDB isolation on logout and tenant switch.

### Dependencies

- Step 62 complete and generated synchronization client available; Step 61 local-data/session security decision complete.
- Controlled offline-capable staging environment and representative two-tenant dataset.

---

## Step 64 — Measured Performance Optimization

### Objective

Measure the completed product against approved pilot targets, fix verified bottlenecks, and prove that normal online/offline workflows remain responsive without speculative infrastructure.

### Current State

- No repository performance budgets, representative benchmark dataset, route-level bundle report, repeatable API benchmark, database query plan record, or synchronization performance target exists.
- Search uses database substring filters and existing indexes may not serve all query shapes; dashboard, reports, analytics, rentals, payment summaries, and media are likely measurement priorities based on current request patterns. No Redis, background workers, server cache, or aggregate reporting API exists, and none is assumed necessary.

### Scope

- Re-run the Step 57 baseline with the completed platform/security/offline implementation and representative pilot data.
- Measure frontend startup, route bundle/loading, navigation, search time, render responsiveness, request count/payload, media behavior, and Core Web Vitals where meaningful.
- Measure API p50/p95 latency, error rate, query count, payload size, database time/plan, connection/resource use, and concurrent normal-workflow behavior.
- Measure initial sync size/time, reconnect duration, outbox throughput, conflict/retry overhead, IndexedDB query/search time, and UI responsiveness while syncing.
- Profile dashboard payment-summary fan-out, broad report/analytics fetches, unbounded lists, media Blob loading, and search query plans before selecting fixes.
- Implement only fixes tied to a failed target or demonstrated release risk (e.g., route splitting, query consolidation, bounded pagination, targeted server summaries, lazy media retrieval, reduced invalidation/refetch, payload reduction, evidence-based indexes).
- Preserve the approved financial definitions and business rules; if a server aggregate endpoint is justified, derive it from the same authoritative records and test parity with current selectors.
- Define production monitoring thresholds that can detect regression after release.

### Non-Goals / Constraints

- No Redis, CDN data cache, background worker, message queue, search engine, denormalized reporting store, or horizontal scaling solely as a precaution.
- No arbitrary micro-optimization, broad rewrite, or removal of accessibility/RTL/error states for speed; no large-scale stress/soak target beyond approved pilot and near-term capacity.
- No index added without a captured query and plan demonstrating need; no cache without invalidation and tenant-isolation analysis.

### Acceptance Criteria

- Every optimization references a recorded baseline, target, bottleneck, and before/after result.
- Approved startup, navigation, search, dashboard, report, API, database, and synchronization targets pass with representative data/network/device conditions.
- Critical pages do not exhibit unbounded request fan-out as tenant records grow within the pilot profile; search and list behavior remain correct and responsive at the approved record volume.
- Offline initial/reconnect synchronization completes within the approved target without freezing the UI or losing operations.
- No optimization weakens tenant isolation, error truthfulness, financial accuracy, accessibility, or offline duplicate/conflict guarantees.
- Production metrics/alerts can identify regressions in latency, errors, database saturation, storage, and sync failures; unneeded infrastructure remains absent.

### Verification

- Add repeatable frontend bundle/budget reporting and API/database benchmark commands using deterministic representative data.
- Add query-count/request-count regressions for any corrected fan-out pattern; add pagination/aggregate/index parity tests where implementation changes public behavior or financial data paths.
- Run browser performance audits under the approved device/network profile and store release evidence outside generated application code; run sync throughput/reconnect tests with queued operations and representative local data.
- Manual: use the complete staging product under realistic mobile/desktop hardware and constrained network; review search, long lists, dashboard, analytics, reports, media, and reconnect synchronization for lag/freeze; confirm exported reports/contracts and local offline views remain accurate.

### Dependencies

- Steps 57 through 63; approved pilot volume/device/network targets and reproducible representative dataset.
- Production-like staging database and observability sufficient to measure API/query behavior.

---

## Step 65 — Production Deployment, Migrations, and Operations

### Objective

Create reproducible staging/production deployment and operating procedures for the frontend (Cloudflare Pages), API (Hetzner VPS), PostgreSQL (co-located on the VPS), object storage (Cloudflare R2), email, monitoring, backups, migrations, rollback, and smoke verification.

### Current State

- Vite can build static frontend assets and the API has a multi-stage non-root Dockerfile; the final runtime image currently copies only `dist` and `package.json` and must be proven and corrected.
- Development Compose provides PostgreSQL but omits auth/email/storage production configuration, migration execution, durable object storage, and an API health check.
- `GET /api/healthz` returns process status only; startup does not verify critical dependency readiness and shutdown does not drain/disconnect.
- Prisma migrations are version controlled and `db:migrate:deploy` exists in `lib/db`, but there is no production release orchestration. The Task recurrence migration removes the legacy recurrence column and is incompatible with overlapping old/new API versions.

### Scope

- Produce reproducible frontend and API artifacts using frozen dependencies, current generated artifacts, production configuration validation, and immutable release identifiers.
- Fix and verify the API runtime image, build context (`.dockerignore`), non-root execution, runtime dependencies, source maps policy, health check, and graceful `SIGTERM`/`SIGINT` drain/Prisma disconnect.
- Configure Cloudflare Pages frontend static hosting, SPA rewrites, cache rules for hashed assets/HTML/service worker, security headers, API origin, and HTTPS domains.
- Provision isolated staging and production PostgreSQL environments. Production PostgreSQL is co-located with the production API on the approved Hetzner VPS and remains private/internal-only. Staging must use separate configuration and data and must never share production data.
- Add distinct liveness and dependency-aware readiness; readiness must include database connectivity and minimum safe storage/configuration checks without turning temporary external email failure into unsafe process behavior.
- Establish centralized structured logs, release/version correlation, request IDs where useful, exception capture, availability/error/latency/storage/sync/reset-delivery alerts, and a concise operator dashboard.
- Add CI gates for frozen install, generated drift, typecheck, lint, API/web tests, production builds, migration checks, container build/start smoke, security scans, and the stable critical E2E suite.
- Add a production migration command/job using `prisma migrate deploy`; never use development migration/reset/push against staging or production; rehearse migrations from empty and representative pre-release databases with failure handling and `prisma migrate status` verification.
- Define automatic PostgreSQL backups to off-server Cloudflare R2 (a VPS-only backup is not acceptable), object-storage durability/retention, monitoring, access control, and a timed restore drill verifying business/file consistency.
- Write deployment, rollback, incident, backup/restore, secret rotation, storage repair, reset-delivery, platform-bootstrap, and production smoke runbooks without duplicating architecture sources.
- Deploy staging and complete a full release rehearsal before production.

### Non-Goals / Constraints

- No platform migration to a different frontend/backend/database technology without a verified blocker; no Kubernetes, multi-region, autoscaling, blue/green complexity, service mesh, or zero-downtime promise not required by the first release.
- No production database reset, `prisma db push`, manual schema editing, or migration-history rewrite; no rolling deployment across the incompatible Task recurrence migration.
- No production test using real customer data or destructive smoke actions outside an approved disposable account.

### Task Recurrence Atomic Deployment Rule

The following sequence is mandatory in substance. There is no rolling old/new API overlap across this migration.

1. Stop/drain all old API instances.
2. Apply the migration.
3. Start only the compatible new API.
4. Verify Task API and recurrence behavior.
5. Deploy/enable the compatible frontend.

After this migration succeeds, normal rollback to the old API is unsafe because the removed column/type no longer exist. Preferred post-migration recovery is fix-forward on the new API line. Emergency rollback restores the verified pre-migration database backup and redeploys the old API/frontend together under an approved write-loss decision.

### Acceptance Criteria

- CI produces passing reproducible web/API artifacts from a clean checkout with frozen dependencies and current generated code.
- The API image starts as non-root with all runtime dependencies, reports versioned liveness/readiness, handles termination gracefully, and does not depend on writable local application storage.
- The frontend loads direct SPA routes, updates service-worker assets safely, calls the correct API, and uses HTTPS/security/cache headers.
- Staging and production configurations are isolated, complete, secret-managed, and fail closed when required values are missing.
- `prisma migrate deploy` succeeds from empty and representative data; migration status is clean afterward; the Task recurrence cutover is rehearsed exactly without old/new API overlap.
- Automated backups are monitored and a restore drill meets approved RPO/RTO with validated tenant/business/file consistency.
- Central logs, error reporting, readiness/uptime, latency/error, database, storage, sync, and email-delivery alerts are verified.
- Staging deployment, rollback/fix-forward rehearsal, and non-destructive smoke tests pass; operators can execute bootstrap, reset-delivery investigation, deployment, migration, rollback/recovery, and incident procedures from current runbooks.

### Verification

- Run the full CI pipeline from a clean checkout and prove generated drift/failing tests/scans block deployment.
- Build and start the production API image with production-like configuration; probe liveness/readiness and exercise graceful termination.
- Build/deploy the frontend and test root/direct routes, hashed assets, service-worker update, API connectivity, headers, and offline app-shell load.
- Run empty and representative-data `prisma migrate deploy` rehearsals plus migration status checks; run P0 E2E and required platform/reset/offline deployment smoke scenarios against staging.
- Exercise automated backup creation and scripted restore validation in an isolated environment.
- Manual: execute the complete staging release using only the runbook; simulate dependency unavailability and confirm readiness/alerts distinguish database/storage/configuration failures from liveness; rehearse the Task atomic cutover and emergency restore path.

### Dependencies

- Steps 57 through 64; approved providers, domains, secrets, alert destinations, backup policy, RPO/RTO, and maintenance window.
- Operator access and a production-like staging environment.

---

## Step 66 — Regression Hardening, Release Verification, and Documentation

### Objective

Prove the integrated Version 2 product is safe and usable in production, fix release-blocking defects at their root, update authoritative documentation/runbooks, and make the final go/no-go decision.

### Current State

- Lower-level API/frontend coverage is substantial and should be extended rather than replaced.
- `docs/testing/e2e-test-plan.md` defines six P0 and two optional P1 initial scenarios, but no executable suite exists; `docs/testing/manual-test-plan.md` defines responsive, RTL, accessibility, browser, file, print/PDF, offline, security-state, and release checks. README and several architecture/testing statements are stale relative to current implementation.

### Scope

- Add one maintainable browser E2E runner and isolated environment using the built web app, real API, disposable PostgreSQL database, controlled storage, deterministic seed, and fake/test email.
- Implement the six documented P0 workflows first: authenticated access/session, customer/vehicle-to-reservation, pickup/return, unavailable-vehicle conflict, partial payment/balance, and tenant/employee access boundary; add the maintenance and task P1 workflows only when stable and materially useful.
- Add focused Platform Admin organization/status and password-reset delivery/confirmation E2E coverage because those become release-critical Milestone 6 boundaries.
- Add the approved offline disconnect/reconnect scenarios from Step 63, including duplicate prevention, conflict/failure recovery, tenant cache isolation, and final server/UI state.
- Execute the full risk-based API/web regression and add tests only for meaningful release defects at the lowest reliable owner layer.
- Execute the applicable manual plan across workflows, roles, two tenants, browsers, responsive widths, Arabic RTL, accessibility, files, contracts, PDF/print, CSV, offline, performance, security states, staging, and production smoke.
- Triage defects by release impact; fix root causes with the smallest coherent change and rerun affected plus broader risk-based checks.
- Reconcile dashboard, analytics, reports, balances, rental/vehicle states, and synchronized local/server records against controlled data.
- Complete security review findings, performance evidence, migration/restore evidence, deployment evidence, known-risk disposition, and go/no-go record.
- Update existing product, architecture, testing, API, environment, README, and operational sources of truth only where released behavior changed; remove stale statements rather than creating duplicate explanations.

### Non-Goals / Constraints

- No exhaustive E2E duplication of validation matrices, financial combinations, transactions, concurrency, or every CRUD action already owned by lower-level tests.
- No general refactor, cosmetic redesign, broad test-coverage target, or unrelated dependency migration; no deferred feature added to avoid or conceal a release defect.
- No acceptance of a tenant-isolation, auth, data-integrity, financial, rental lifecycle, sync duplication, migration, security, or deployment failure merely because other checks pass.
- E2E setup may seed/reset only the dedicated disposable database and controlled storage; retries do not hide flaky product behavior; production smoke is non-destructive.

### Acceptance Criteria

- All P0 E2E scenarios pass deterministically; approved platform, reset, and offline E2E scenarios pass; required P1 scenarios pass or have an explicit evidence-based disposition.
- Full API/web tests, typecheck, lint, production builds, generated drift, migrations, container/startup, security scans, and performance gates pass.
- Manual two-tenant/three-role workflow, responsive, RTL, accessibility, browser, file, contract/PDF/print/CSV, offline, and staging release checks pass.
- Every known P0/P1 defect and production blocker is fixed and reverified; lower-severity issues have an owner and approved release disposition.
- Financial values and lifecycle state reconcile across database, API, tenant UI, reports/analytics, and offline local projections.
- Security, performance, backup/restore, Task migration, deployment, rollback/fix-forward, alerting, and smoke evidence is attached to the release decision.
- Authoritative documentation describes released behavior and actual operations without stale mock/offline/deployment/auth statements or duplicate sources of truth.
- Project owner/operator approves go-live based on documented verification evidence; a representative pilot rental-business user validates the real product workflow.

### Verification

- Run clean install/generated drift/typecheck/lint/test/build/migration/container/security/performance checks through CI.
- Run the complete required E2E suite repeatedly against a reset isolated environment to establish determinism; run focused regression tests for every fixed defect and full affected-package suites.
- Run production-like deployment smoke probes and non-destructive production health/shell checks after release; verify migration status, backup completion, alert delivery, and version correlation automatically where the selected providers support it.
- Manual: execute `manual-test-plan.md` release sections with recorded evidence; complete the full owner rental lifecycle, employee restrictions, cross-tenant denial, platform lifecycle workflow, real reset email, storage/files, reports/exports, and approved offline outage/reconnect workflows; verify 375px/768px/1024px/1440px/1920px layouts, keyboard/focus/screen-reader critical paths, and supported Chromium/Firefox/Safari behavior; conduct a timed operator rehearsal for bootstrap, deployment, migration, backup restore, incident detection, rollback/fix-forward, and recovery.

### Dependencies

- Steps 58 through 65 complete; stable staging release candidate, isolated E2E environment, controlled mail/storage, and representative data.
- Project owner/operator and a representative pilot rental-business user available for final verification.

---

## Key Production Risks

| Risk                                                                             | Control / Release Gate                                                                                                                             |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-tenant API, query-cache, local-database, file, or synchronization exposure | Two-tenant backend, frontend, E2E, offline, and manual tests; authenticated tenant context only; release block on any exposure.                    |
| Unauthorized or insecure `PLATFORM_OWNER` creation                               | No public path or normal seed; explicit idempotent operational bootstrap; discarded initial secret; reset activation; audit and runbook rehearsal. |
| Platform owner entering tenant business workflows                                | Backend tenant-route rejection plus dedicated frontend role branch and direct-route tests.                                                         |
| Password-reset enumeration or token leakage through provider failure/logging     | Generic response, controlled URL, redacted telemetry, adapter tests, real-mail staging review, no raw token persistence/logging.                   |
| Offline duplicate rental/payment/lifecycle mutations                             | Duplicate-safe operation IDs, concurrency tests, queue persistence, and reconnect E2E.                                                             |
| Offline stale overwrite or availability/financial corruption                     | Server revisions/conflicts, no last-write-wins for high-risk commands, authoritative pull, explicit user recovery.                                 |
| Stale/revoked user or suspended tenant continuing offline indefinitely           | Approved offline session policy, truthful stale state, server enforcement on reconnect, push stop/block behavior, local-data lock/clear rules.     |
| Local data exposure on shared browser or tenant switch                           | Organization/user partitioning, logout/account-switch policy, cache clearing, storage inspection tests, no platform offline store.                 |
| Upload spoofing, memory exhaustion, lost files, or cross-tenant retrieval        | Signature checks, limits/concurrency, private durable object storage, storage compensation/reconciliation, tenant authorization tests.             |
| Speculative optimization changing financial/business truth                       | Measured baseline and parity/regression tests; no infrastructure or aggregate change without evidence.                                             |
| Production migration incompatibility or unrecoverable rollback                   | Staging rehearsal, verified backup, atomic Task recurrence cutover, no rolling old/new API, fix-forward plus emergency full restore procedure.     |
| Green health while database/storage is unavailable                               | Separate liveness/readiness, dependency probes, monitoring/alerts, deployment smoke tests.                                                         |
| Flaky or destructive release testing                                             | Isolated disposable data/storage/email, deterministic seeds, no hidden retries, non-destructive production smoke.                                  |
| Documentation diverging from released behavior                                   | Final source-of-truth reconciliation and operator runbook rehearsal before go-live.                                                                |

## Milestone Definition of Done

Milestone 6 is complete only when all of the following are true:

- Milestone 5.8 is closed and no production release relies on runtime mock business data or an unresolved P0/P1 tenant UI/auth blocker.
- Tenant isolation is verified across API reads/writes, relationships, reports, files, query caches, local offline data, synchronization payloads, platform boundaries, and two-tenant E2E/manual workflows.
- Authentication and authorization are production-safe: deleted/revoked users cannot restore sessions, refresh rotation is safe, role and organization lifecycle rules are enforced server-side, secrets/tokens are protected, and frontend visibility is not treated as authorization.
- Normal registration, tenant users, invitations, seed data, and public APIs cannot create `PLATFORM_OWNER`.
- The `PLATFORM_OWNER` persistence/bootstrap model approved in Step 57 is implemented, idempotent, auditable, rehearsed, and documented, using secure reset activation without exposing reusable credentials.
- The simple Platform Admin surface can list/search/view client organizations and safely change lifecycle status, while exposing no tenant business data, billing, impersonation, or other deferred systems.
- Password reset is genuinely deliverable through the production email provider; a real controlled recipient can receive, use once, and recover from an expired/failed link, and provider failure does not enumerate accounts or leak tokens.
- The approved offline workflows work through initial synchronization, disconnect, offline reopen/read/search/mutation, reload, reconnect, retry, conflict, and final authoritative reconciliation.
- Offline mutation retries are idempotent and do not create duplicate customers, rentals, payments, or lifecycle effects; high-risk conflicts never silently overwrite server data.
- Offline authentication/session and local-data behavior is secure and truthful for logout, tenant switch, token expiry/revocation, deleted users, and suspended/cancelled organizations.
- Known production blockers are resolved, including expected missing-contract request/log noise and malformed vehicle/other UUID IDs becoming controlled client errors rather than Prisma `500`s.
- File uploads/downloads use durable private production storage and pass content, size, filename, memory/concurrency, tenant-isolation, persistence, compensation, and recovery verification.
- Security hardening is verified against the actual attack surface, with production configuration fail-closed, safe headers/origins/timeouts/rate limits, redacted logs/errors, and no unresolved high/critical security or dependency finding.
- Performance is acceptable against approved representative data/device/network targets, and every optimization has before/after evidence without speculative infrastructure.
- CI/release checks are reproducible; the web and API artifacts deploy successfully; readiness, graceful shutdown, monitoring, alerting, backups, and restore procedures work.
- All production migrations succeed from representative data. The Task recurrence migration is deployed atomically with old API instances drained, and its fix-forward/emergency restore procedure is rehearsed.
- The critical E2E suite, full risk-based regression, manual release plan, staging rehearsal, and non-destructive production smoke tests pass with recorded evidence.
- Product behavior, API/schema truth, architecture, environment configuration, security/deployment procedures, testing plans, README, and operational runbooks match the released system without duplicate or stale sources of truth.
- A real rental-business owner and employee can use the application on supported desktop/mobile browsers to manage customers, vehicles, rentals, contracts, payments, maintenance, expenses, tasks, and business insight, continue approved work during a temporary outage, and recover after reconnect. Operational recovery can be performed using documented runbooks without ad-hoc source-code or direct-database intervention.

## Milestone Status

**Status:** Planned

**Current Step:** Not started

**Entry Gate:** Complete Milestone 5.8 Step 56 and final human product QA before Step 57 begins.
