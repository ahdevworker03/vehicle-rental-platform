# Backend Architecture

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Purpose](#purpose) |
| 2 | [Architecture Goals](#architecture-goals) |
| 3 | [Architectural Style](#architectural-style) |
| 4 | [Why This Architecture?](#why-this-architecture) |
| 5 | [Business-Driven](#business-driven) |
| 6 | [Maintainability](#maintainability) |
| 7 | [Scalability](#scalability) |
| 8 | [Learnability](#learnability) |
| 9 | [⭐ Project Organization](#project-organization) |
| 10 | [⭐ Module Structure](#module-structure) |
| 11 | [⭐ Dependency Rules](#dependency-rules) |
| 12 | [High-Level Request Flow](#high-level-request-flow) |
| 13 | [Backend Layers](#backend-layers) |
| 14 | [Routing](#routing) |
| 15 | [Controllers](#controllers) |
| 16 | [Services](#services) |
| 17 | [Repositories](#repositories) |
| 18 | [Database](#database) |
| 19 | [Validation Strategy](#validation-strategy) |
| 20 | [Business Rule Ownership](#business-rule-ownership) |
| 21 | [Security](#security) |
| 22 | [Multi-Tenant Design](#multi-tenant-design) |
| 23 | [Offline Support](#offline-support) |
| 24 | [Logging](#logging) |
| 25 | [Testing](#testing) |
| 26 | [Guiding Principle](#guiding-principle) |

## Purpose

This document defines the architecture of the backend for the Vehicle Rental Management Platform.

It describes how the backend is organized, how requests flow through the system, how business logic is structured, and how the source code is organized.

The architecture is driven by the product requirements, business workflows, and domain model rather than framework conventions.

This document serves as the implementation blueprint for backend development.

---

# Architecture Goals

The backend should be:

- Simple to understand.
- Easy to maintain.
- Modular.
- Scalable.
- Secure.
- Testable.
- Suitable for a multi-tenant SaaS application.
- Designed for offline synchronization.
- Consistent across all modules.

The objective is not to build the most complex architecture, but the one that best supports the product over the long term.

---

# Architectural Style

The backend follows a **modular layered architecture**.

Each business domain is implemented as an independent feature module.

Examples include:

- Authentication
- Organizations
- Users
- Customers
- Vehicles
- Rentals
- Maintenance
- Payments
- Dashboard

Every module owns its business logic while communicating with the rest of the application through clearly defined interfaces.

---

# Why This Architecture?

## Business-Driven

The structure mirrors the business domain rather than the framework.

Developers locate code by business feature instead of technical category.

---

## Maintainability

Modules evolve independently without affecting unrelated functionality.

---

## Scalability

New business domains can be introduced without restructuring the project.

---

## Learnability

Each layer has a single responsibility, making the request lifecycle easy to understand.

---

# ⭐ Project Organization

The backend is organized by **feature**, not by technical layer.

Instead of placing every controller, service, or repository in separate global folders, each business module owns its complete implementation.

Example:

```text
src/
│
├── config/
├── database/
├── middleware/
├── modules/
│   ├── customers/
│   ├── vehicles/
│   ├── rentals/
│   ├── maintenance/
│   └── auth/
│
├── shared/
├── types/
├── utils/
│
├── app.ts
└── server.ts
```

This structure keeps related code together, improves maintainability, and makes the project easier to navigate as it grows.

---

# ⭐ Module Structure

Each module should follow a consistent structure.

Example:

```text
customers/

customer.routes.ts

customer.controller.ts

customer.service.ts

customer.repository.ts

customer.validation.ts

customer.types.ts

customer.schemas.ts

customer.test.ts
```

A module owns everything related to its business domain.

No business logic should be spread across unrelated modules.

---

# ⭐ Dependency Rules

Dependencies should always flow in one direction.

```text
Route
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Rules:

- Routes only call controllers.
- Controllers only call services.
- Services contain business logic.
- Repositories access the database.
- Repositories never call services.
- Controllers never access the database directly.

Keeping these boundaries prevents tight coupling.

---

# High-Level Request Flow

```text
React Client

      ↓

REST API

      ↓

Route

      ↓

Controller

      ↓

Service

      ↓

Repository

      ↓

Prisma

      ↓

PostgreSQL

      ↓

Response
```

Each layer performs one responsibility and should never bypass another layer.

---

# Backend Layers

## Routing

Responsibilities:

- Register endpoints.
- Apply middleware.
- Forward requests.

Contains no business logic.

---

## Controllers

Responsibilities:

- Receive validated requests.
- Call services.
- Return HTTP responses.

Controllers should remain thin.

---

## Services

Responsibilities:

- Implement business rules.
- Coordinate workflows.
- Communicate between modules.
- Handle transactions.

Most application logic belongs here.

---

## Repositories

Responsibilities:

- Access PostgreSQL through Prisma.
- Execute queries.
- Hide persistence details.

Repositories should not contain business decisions.

---

## Database

Responsibilities:

- Store persistent data.
- Enforce relationships.
- Maintain integrity.
- Execute transactions.

PostgreSQL is the system of record.

---

# Validation Strategy

Validation occurs at multiple layers.

- Request validation checks incoming data.
- Business validation enforces business rules.
- Database constraints protect data integrity.

Each layer has a different responsibility.

---

# Business Rule Ownership

Every business rule has one owner.

Examples:

- Vehicle availability → Rental module
- Customer eligibility → Customer module
- Maintenance scheduling → Maintenance module

Business rules should never be duplicated.

---

# Security

Security is integrated into every layer.

Principles include:

- Authentication
- Authorization
- Input validation
- Secure password storage
- Least privilege

---

# Multi-Tenant Design

The platform serves multiple organizations through one application.

Every request executes within the authenticated organization's context.

Tenant isolation is enforced throughout the backend.

---

# Offline Support

Offline-first is a core requirement.

The backend supports:

- Synchronization endpoints
- Conflict detection
- Version tracking
- Data reconciliation

Offline support influences API and data design from the beginning.

---

# Logging

Logs should provide enough information to diagnose production issues while protecting sensitive information.

Important events include:

- Authentication
- Business operations
- Synchronization
- Errors
- Unexpected failures

---

# Testing

The architecture encourages:

- Unit tests
- Integration tests
- API tests
- Business rule verification

Tests should validate business behavior rather than implementation details.

---

# Guiding Principle

Every backend decision should answer one question:

> **Does this make the backend easier to understand, maintain, test, and extend while continuing to solve the business problems of vehicle rental businesses?**
