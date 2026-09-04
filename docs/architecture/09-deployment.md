# Deployment

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Purpose](#purpose) |
| 2 | [Deployment Goals](#deployment-goals) |
| 3 | [Deployment Philosophy](#deployment-philosophy) |
| 4 | [System Components](#system-components) |
| 5 | [Environment Strategy](#environment-strategy) |
| 6 | [Configuration Management](#configuration-management) |
| 7 | [Build Process](#build-process) |
| 8 | [Deployment Process](#deployment-process) |
| 9 | [Database Deployment](#database-deployment) |
| 10 | [File Storage](#file-storage) |
| 11 | [Monitoring](#monitoring) |
| 12 | [Logging](#logging) |
| 13 | [Backups](#backups) |
| 14 | [Disaster Recovery](#disaster-recovery) |
| 15 | [Scalability](#scalability) |
| 16 | [Security](#security) |
| 17 | [Future Expansion](#future-expansion) |
| 18 | [Guiding Principle](#guiding-principle) |

## Purpose

This document defines how the Vehicle Rental Management Platform is deployed, configured, secured, and operated across different environments.

Its purpose is to provide a deployment architecture that is reliable, scalable, maintainable, and suitable for a production SaaS application.

---

# Deployment Goals

The deployment architecture should:

- Be reliable.
- Be easy to maintain.
- Support future growth.
- Minimize downtime.
- Protect business data.
- Allow independent deployment of system components.

---

# Deployment Philosophy

Every system component should be independently deployable.

Frontend, backend, database, and supporting services should remain loosely coupled to simplify maintenance, upgrades, and future migrations.

Deployment decisions should avoid unnecessary vendor lock-in whenever possible.

---

# System Components

The deployed platform consists of:

- Frontend Application
- Backend API
- PostgreSQL Database
- Object Storage
- Edge / Network Layer
- Email Service
- Monitoring and Logging Services

Each component has a clearly defined responsibility.

The approved production topology deploys each component as follows:

| Component               | Technology                          | Production Location                                      |
| ----------------------- | ----------------------------------- | -------------------------------------------------------- |
| Frontend                | React + TypeScript + Vite           | Cloudflare Pages (assets delivered via Cloudflare CDN)   |
| Backend API             | Node.js + Express + Prisma + Docker | Hetzner VPS (Nuremberg, Germany)                         |
| Database                | PostgreSQL                          | Same Hetzner VPS as the API (private/internal access)    |
| Object Storage          | S3-compatible (Cloudflare R2)       | Cloudflare R2                                            |
| Edge / Network          | Cloudflare                          | DNS, proxying, TLS, DDoS, edge rate limiting             |
| VPS Runtime             | Docker (Docker Compose)             | Hetzner VPS (API, Prisma runtime, PostgreSQL, reverse proxy) |

The initial backend/database capacity target is approximately 4 vCPU, 8 GB RAM, and 80 GB storage. The exact Hetzner plan may evolve; the architecture records the required capacity and provider rather than a specific plan identifier.

The frontend is independently deployable from the API and must not be hosted from the production VPS unless a future measurable requirement justifies changing that decision.

The API and PostgreSQL initially share one VPS as an intentional simplicity and cost decision, not a permanent architectural constraint. PostgreSQL remains the authoritative system of record.

---

# Environment Strategy

The platform should maintain separate environments for:

- Development
- Staging
- Production

Each environment should have independent configuration and resources.

Production data must never be used directly within development environments.

---

# Configuration Management

Application configuration should be managed through environment variables.

Configuration should never be hardcoded into the application.

Sensitive information such as secrets, API keys, and database credentials must be stored securely.

---

# Build Process

Every deployment should produce reproducible builds.

The build process should:

- Install dependencies.
- Run automated tests.
- Validate application configuration.
- Build production assets.
- Prepare deployment artifacts.

Deployment should only proceed after successful validation.

---

# Deployment Process

Deployments should:

- Be repeatable.
- Minimize service interruption.
- Support rollback when necessary.
- Preserve existing business data.

Application updates should not require manual server configuration whenever possible.

---

# Database Deployment

PostgreSQL is initially deployed on the same Hetzner VPS as the backend API. This co-location is an approved simplicity and cost decision, not a permanent architectural constraint.

PostgreSQL must not be publicly exposed. Database access is internal/private to the server/application environment, and backend application credentials remain secret and environment-configured.

PostgreSQL remains the authoritative system of record for the platform.

Database schema changes should be managed through version-controlled migrations.

Schema changes should:

- Be repeatable.
- Be reversible whenever practical.
- Preserve existing data.

Database updates should be coordinated with application deployments.

---

# File Storage

Production file storage uses S3-compatible object storage on Cloudflare R2, so uploaded files do not depend on the VPS filesystem for durability.

User-uploaded files should be stored separately from the application.

Application deployments should never affect uploaded files.

Cloudflare R2 stores:

- Private vehicle photos
- Private customer/vehicle documents
- Signed rental documents/contracts where applicable
- Other user-uploaded production files
- Off-server PostgreSQL backups

Access to tenant-owned private objects is controlled through authenticated server-side authorization and tenant isolation rules, not through public object URLs.

---

# Monitoring

The production environment should continuously monitor:

- Application availability.
- API performance.
- Database health.
- System errors.
- Resource usage.

Monitoring should enable rapid detection of production issues.

---

# Logging

The platform should maintain centralized application logs.

Logs should assist with:

- Debugging.
- Error investigation.
- Performance analysis.
- Operational monitoring.

Sensitive information must never be written to application logs.

---

# Backups

Production data should be backed up automatically.

Because PostgreSQL and the API initially share one VPS, the VPS is a single failure domain. Backups must therefore leave the VPS; Cloudflare R2 is the approved off-server backup destination. A backup stored only on the VPS is not an acceptable production backup.

Backup procedures should:

- Run automatically.
- Leave the VPS (to Cloudflare R2).
- Be monitored.
- Be tested periodically.
- Support reliable restoration.

Backup retention is defined during Milestone 6, and restore procedures are tested before production approval.

Business continuity depends on verified backups.

---

# Disaster Recovery

The deployment architecture should support recovery from unexpected failures.

Recovery planning should include:

- Database restoration.
- Infrastructure recovery.
- Service restoration.
- Data validation.

Recovery procedures should be documented and tested.

---

# Scalability

The deployment architecture should support business growth without significant redesign.

The platform should allow independent scaling of:

- Frontend
- Backend
- Database
- Object Storage

Scaling decisions should minimize operational complexity while maintaining application performance.

The initial single-VPS backend/database topology is approved and is not considered a scalability blocker. Scaling remains evidence-based, in this order:

1. Vertically resize the Hetzner VPS when CPU, memory, or storage measurements justify it.
2. Move PostgreSQL to separate infrastructure when database capacity, reliability, performance, or operational requirements justify separation.
3. Add additional API instances and load balancing only when measured traffic requires horizontal scaling.
4. Introduce Redis, queues, workers, Kubernetes, distributed databases, or other infrastructure only when a concrete requirement or measured bottleneck justifies them.

Future scaling infrastructure is not pre-built.

---

# Security

Production deployments should enforce:

- HTTPS for all communication.
- Secure environment variable management.
- Least-privilege access.
- Regular security updates.
- Secure secret management.

Security applies to every deployed environment.

Cloudflare provides the edge/network layer: DNS, proxying, HTTPS/TLS, DDoS protection, and appropriate edge-level rate limiting for public traffic before it reaches the VPS. Cloudflare protections do not replace backend security. Express remains responsible for authentication, authorization, organization isolation, validation, business-rule enforcement, and API-level protection.

---

# Future Expansion

The deployment architecture should support future capabilities such as:

- Automated CI/CD pipelines.
- Multiple production regions.
- Load balancing.
- Content Delivery Networks (CDNs).
- Additional infrastructure services.

These enhancements should integrate without requiring major architectural changes.

---

# Guiding Principle

Every deployment decision should answer one question:

> **Does this provide a reliable, secure, scalable, and maintainable platform that can grow with the business while minimizing operational complexity?**
