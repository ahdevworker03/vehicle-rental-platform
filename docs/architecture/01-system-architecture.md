# System Architecture

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Purpose](#purpose) |
| 2 | [System Overview](#system-overview) |
| 3 | [High-Level Architecture](#high-level-architecture) |
| 4 | [Core Components](#core-components) |
| 5 | [React Application](#react-application) |
| 6 | [Offline Layer](#offline-layer) |
| 7 | [Backend API](#backend-api) |
| 8 | [Database](#database) |
| 9 | [Data Flow](#data-flow) |
| 10 | [Online](#online) |
| 11 | [Offline](#offline) |
| 12 | [Multi-Tenant Architecture](#multi-tenant-architecture) |
| 13 | [Design Principles](#design-principles) |
| 14 | [Supporting Architecture Documents](#supporting-architecture-documents) |
| 15 | [Guiding Principle](#guiding-principle) |

## Purpose

This document provides a high-level overview of the entire system.

It explains how the major components interact, the responsibilities of each layer, and how data flows through the application.

This document intentionally avoids implementation details. Those are documented separately in the frontend, backend, database, API, and deployment architecture documents.

---

# System Overview

The platform is a multi-tenant Software as a Service (SaaS) application for vehicle rental businesses.

Each organization manages its own customers, vehicles, rentals, payments, maintenance records, and users while sharing the same application infrastructure.

The system follows a client-server architecture with a centralized backend and database, while supporting offline-first operation through local storage and data synchronization.

---

# High-Level Architecture

```text
                    Internet
                        │
                        ▼
               React Web Application
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
 Local Offline Database         REST API Requests
 (IndexedDB)                         │
         │                           ▼
         └──────────────► Express Backend
                                │
                           Business Logic
                                │
                             Prisma ORM
                                │
                           PostgreSQL
```

---

# Core Components

## React Application

The React application provides the user interface used by rental businesses.

Responsibilities include:

- User interface
- User interactions
- Form validation
- Local state management
- Offline storage
- Synchronization with the backend

---

## Offline Layer

The offline layer allows the application to continue operating without an internet connection.

Responsibilities include:

- Local data storage
- Queueing offline changes
- Detecting connectivity
- Synchronizing changes
- Handling synchronization failures

The offline layer is a core business requirement rather than an optional enhancement.

---

## Backend API

The backend exposes REST endpoints consumed by the frontend.

Responsibilities include:

- Authentication
- Authorization
- Business rules
- Validation
- Data access
- Synchronization endpoints

The backend does not contain presentation logic.

---

## Database

PostgreSQL is the system of record.

Responsibilities include:

- Persistent storage
- Data integrity
- Relationships
- Transactions
- Constraints

The database is considered the authoritative source of business data.

---

# Data Flow

## Online

1. User performs an action.
2. The application validates the request.
3. The request is sent to the backend.
4. Business rules are executed.
5. Data is stored in PostgreSQL.
6. The response is returned to the client.
7. The local offline database is updated.

---

## Offline

1. User performs an action.
2. The application stores the change locally.
3. The user continues working normally.
4. The change is marked for synchronization.
5. When connectivity returns, queued changes are synchronized with the backend.
6. PostgreSQL becomes consistent with the local changes.

---

# Multi-Tenant Architecture

The platform uses a shared application with logical tenant isolation.

Each organization has access only to its own data.

Every business operation must execute within the context of the authenticated organization.

Tenant isolation is enforced by the backend and database.

---

# Design Principles

The system follows these architectural principles:

- Business-driven development
- Separation of concerns
- Modular architecture
- Offline-first design
- API-first communication
- Secure by default
- Simplicity over unnecessary complexity
- Scalability through modularity

Detailed explanations of these principles are available in **00-architecture-principles.md**.

---

# Supporting Architecture Documents

This document provides the overall picture.

Additional documents describe individual areas in more detail:

- Technology Decisions
- Project Structure
- Frontend Architecture
- Backend Architecture
- Database Design
- API Design
- Authentication
- Offline-First
- Deployment

---

# Guiding Principle

The system is designed to support real rental businesses with a reliable, maintainable, and scalable architecture.

Every architectural decision should improve the system's ability to serve business needs while remaining simple enough to understand, maintain, and evolve over time.
