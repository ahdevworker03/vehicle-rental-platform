# Design & Architecture

Apply these rules whenever a task affects architecture, module boundaries, system design, or long-term maintainability.

## Design Principles

- Follow the documented architecture before introducing new patterns.
- Prefer simple designs over flexible designs that solve problems the project does not have.
- Keep responsibilities clearly separated between layers and modules.
- Introduce abstractions only when they remove real duplication or significantly improve clarity.
- Preserve clear boundaries between frontend, backend, database, and infrastructure.

## Architecture Consistency

- Reuse existing architectural patterns before creating new ones.
- Respect established folder structures and module boundaries.
- Avoid hidden coupling between unrelated features.
- Keep public interfaces small, stable, and intentional.

## Performance

- Prioritize correctness and maintainability before optimization.
- Measure performance before introducing optimizations.
- Avoid complexity introduced solely for theoretical performance gains.

## Future Growth

- Design for reasonable extensibility without over-engineering.
- Build for today's approved roadmap rather than speculative future requirements.
- Prefer incremental evolution over large architectural rewrites.

## Approval Required

Request confirmation before changing:

- System architecture
- Folder structure
- Module boundaries
- Public APIs
- Database schema
- Authentication strategy
- Deployment architecture
- Core business logic
- Major dependencies
- User experience or product behavior
- Generated code workflows

Routine implementation within the approved architecture does not require confirmation.
