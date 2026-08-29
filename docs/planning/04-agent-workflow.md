# Agent Workflow

## Table of Contents

| # | Section |
| - | ------- |
| 1 | [Purpose](#purpose) |
| 2 | [Development Philosophy](#development-philosophy) |
| 3 | [Standard Development Lifecycle](#standard-development-lifecycle) |
| 4 | [Documentation Workflow](#documentation-workflow) |
| 5 | [Feature Development Workflow](#feature-development-workflow) |
| 6 | [Step 1 — Understand the Problem](#step-1--understand-the-problem) |
| 7 | [Step 2 — Review Existing Documentation](#step-2--review-existing-documentation) |
| 8 | [Step 3 — Design](#step-3--design) |
| 9 | [Step 4 — Implement](#step-4--implement) |
| 10 | [Step 5 — Test](#step-5--test) |
| 11 | [Step 6 — Document](#step-6--document) |
| 12 | [Step 7 — Commit](#step-7--commit) |
| 13 | [AI Collaboration Guidelines](#ai-collaboration-guidelines) |
| 14 | [Code Quality Standards](#code-quality-standards) |
| 15 | [Git Workflow](#git-workflow) |
| 16 | [Testing Workflow](#testing-workflow) |
| 17 | [Definition of Done](#definition-of-done) |
| 18 | [Continuous Improvement](#continuous-improvement) |

## Purpose

This document defines the standard development workflow for the Vehicle Rental Management Platform.

Its purpose is to ensure that every feature is planned, implemented, tested, documented, and reviewed consistently.

This workflow is designed to support two primary goals:

- Build a production-ready SaaS platform.
- Develop strong software engineering skills throughout the process.

Every feature developed for this project should follow this workflow.

---

# Development Philosophy

The project is guided by the following principles:

- Business problems drive technical decisions.
- Documentation comes before implementation.
- Understand the solution before writing code.
- Keep the product focused on validated customer needs.
- Prefer simple, maintainable solutions over unnecessary complexity.
- Build incrementally.
- Learn through implementation.
- Use AI to accelerate learning, not replace understanding.

---

# Standard Development Lifecycle

Every feature follows the same lifecycle.

```text
Business Requirement
        ↓
User Flow
        ↓
Domain Model
        ↓
Planning
        ↓
Architecture
        ↓
Database Design
        ↓
API Design
        ↓
Backend Development
        ↓
Frontend Integration
        ↓
Testing
        ↓
Documentation Update
        ↓
Git Commit
```

Following a consistent process improves quality and reduces unnecessary rework.

---

# Documentation Workflow

Before starting development:

1. Review the Product Vision.
2. Review the Business Requirements.
3. Review the User Flow.
4. Review the Domain Model.
5. Review the Version 2 Plan.

If the feature changes the business behavior of the product, update the relevant documentation before implementing the change.

Documentation should always reflect the current state of the product.

---

# Feature Development Workflow

For every feature:

## Step 1 — Understand the Problem

- What business problem is being solved?
- Why is this feature needed?
- Who benefits from it?

---

## Step 2 — Review Existing Documentation

Identify:

- Business rules
- Existing workflows
- Related entities
- Dependencies

---

## Step 3 — Design

Design the solution before implementation.

This may include:

- Database changes
- API endpoints
- Business logic
- Validation rules

---

## Step 4 — Implement

Develop the feature in small, testable increments.

Recommended order:

1. Database
2. Backend
3. Frontend
4. Integration

---

## Step 5 — Test

Verify:

- Business requirements
- Validation
- Error handling
- Edge cases
- Complete user workflow

---

## Step 6 — Document

If implementation changes the product, update the appropriate documentation before considering the feature complete.

---

## Step 7 — Commit

Create a clear Git commit describing the purpose of the change.

---

# AI Collaboration Guidelines

AI is a development partner.

Use AI for:

- Explaining concepts.
- Reviewing architecture.
- Generating initial implementations.
- Finding bugs.
- Improving documentation.
- Refactoring suggestions.
- Learning unfamiliar technologies.

Do not use AI to:

- Accept code without understanding it.
- Skip documentation.
- Make architectural decisions without review.
- Replace learning with copy-and-paste.

Every AI-generated solution should be reviewed, understood, and adapted when necessary.

---

# Code Quality Standards

Every contribution should aim for:

- Clear naming.
- Small, focused functions.
- Separation of concerns.
- Consistent project structure.
- Proper validation.
- Meaningful error handling.
- Reusable components.
- Readable code.

Code should prioritize maintainability over cleverness.

---

# Git Workflow

Every feature should follow this sequence:

```text
Plan
    ↓
Implement
    ↓
Test
    ↓
Review
    ↓
Commit
    ↓
Push
```

Commit messages should explain the purpose of the change and follow a consistent style.

Examples:

- `feat: add rental creation endpoint`
- `fix: prevent duplicate active rentals`
- `refactor: simplify vehicle status service`
- `docs: update domain model`

---

# Testing Workflow

Before marking a feature as complete, verify that:

- Business rules are satisfied.
- API responses are correct.
- Validation works as expected.
- Error cases are handled gracefully.
- Existing functionality has not been broken.
- Frontend and backend integrate correctly.

---

# Definition of Done

A feature is considered complete only when:

- Requirements are satisfied.
- Implementation follows the project architecture.
- Code has been reviewed.
- Testing has been completed.
- Relevant documentation has been updated.
- Changes have been committed to Git.

---

# Continuous Improvement

This workflow is intended to evolve with the project.

As development progresses, improvements may be made to the process based on practical experience.

Changes to the workflow should simplify development, improve quality, or enhance maintainability rather than add unnecessary complexity.
