---
name: openapi
description: OpenAPI work for this repository, especially `lib/api-spec/openapi.yaml`, generated client/schema packages, and contract-first API changes that affect `apps/api` or `apps/web`. Applicable when designing APIs, writing OpenAPI specifications, generating client SDKs, or validating API contracts.
---

# OpenAPI

## Purpose

This skill guides the agent in designing, maintaining, and leveraging OpenAPI specifications (OAS) for API-first development following the official OpenAPI Specification. OpenAPI provides a standard, language-agnostic interface to RESTful APIs, enabling documentation, client SDK generation, server stubs, validation, and testing. The skill covers specification design, tooling integration, contract-driven development, and versioning strategies to ensure APIs are well-documented, consistent, and backward-compatible.

---

## When to Load

- User is designing, reviewing, or refactoring API endpoints.
- User mentions: `OpenAPI`, `Swagger`, `OAS`, `specification`, `API contract`, `OpenAPI Generator`, `Redoc`, `Swagger UI`, `Spectral`, `API documentation`.
- User asks about generating client SDKs, validating API contracts, or keeping documentation in sync with code.
- User is setting up API documentation or contract testing.
- User is evaluating changes for backward compatibility.

---

## When NOT to Load

- General application code without API contract implications.
- Frontend or React component development.
- Infrastructure or deployment configuration unrelated to API documentation.
- Database schema design without API connection.

---

## Core Principles

1. **Documentation-First** – Design the API contract (OpenAPI specification) before writing implementation code. This ensures clarity, consistency, and client-driven design.
2. **Contract as Source of Truth** – The OpenAPI specification is the single source of truth for the API. All client and server implementations should be derived from or validated against it.
3. **Backward Compatibility** – Changes to the API must be backward-compatible unless versioning is explicitly introduced. The specification evolves without breaking existing clients.
4. **Reusability** – Use `$ref` to reuse schemas, parameters, responses, and examples across endpoints. Centralize common definitions to avoid duplication.
5. **Validation** – Validate the specification against the OpenAPI schema and lint it for best practices (e.g., with Spectral or Redocly CLI).
6. **Generate Where Possible** – Leverage OpenAPI generators to create client SDKs, server stubs, and documentation, reducing manual effort and keeping them in sync.

---

## Decision Rules

### OpenAPI Version Selection

- **IF** building a new API, **THEN** use OpenAPI 3.1.0 (the latest stable version) for improved type system, JSON Schema support, and webhooks.
- **IF** integrating with tools that only support 3.0.x, **THEN** use OpenAPI 3.0.3 as a fallback.
- **AVOID** using Swagger 2.0 (deprecated) unless forced by legacy tooling.

### Specification Organization

- **IF** the API has many endpoints, **THEN** split the specification into multiple files using `$ref` for modularity (e.g., `paths/`, `schemas/`, `parameters/`, `responses/`).
- **IF** using a monorepo, **THEN** place the OpenAPI specification in a shared package (e.g., `packages/api-contract`) to be consumed by both frontend and backend.
- **IF** generating client SDKs, **THEN** use OpenAPI Generator with appropriate generators for TypeScript, React Query, or other target languages.

### Documentation Generation

- **IF** you want interactive API documentation, **THEN** use Swagger UI or Redoc to render the specification.
- **IF** you need a developer portal, **THEN** consider Redocly or Stoplight for advanced customization.
- **ALWAYS** ensure the documentation is publicly accessible (or internally accessible) and up-to-date.

### Validation and Linting

- **IF** the specification is large or maintained by multiple teams, **THEN** use a linter like Spectral to enforce rules (e.g., required descriptions, consistent operation IDs, no missing responses).
- **IF** the API is versioned, **THEN** validate that each version is backward-compatible with the previous version using tools like OpenAPI Diff or `oas-validator`.
- **ALWAYS** validate the specification against the OpenAPI schema using `@apidevtools/swagger-parser` or similar.

### Client and Server Generation

- **IF** you need a TypeScript client for the frontend, **THEN** use `openapi-typescript` (for types only) or `openapi-generator` with the `typescript-axios` generator.
- **IF** you need server stubs, **THEN** use `openapi-generator` with the `nodejs-express` generator, but be aware that generated stubs require manual implementation of business logic.
- **IF** you need a mock server, **THEN** use `prism` from Stoplight to simulate responses based on examples.

### Versioning

- **IF** breaking changes are required, **THEN** use URL versioning (e.g., `/api/v1/users`, `/api/v2/users`).
- **IF** adding optional fields or non-breaking changes, **THEN** do not increment the version; additive changes are safe.
- **IF** deprecating a field, **THEN** mark it as `deprecated: true` in the specification and communicate a sunset date.

### Integration with Express

- **IF** using Express, **THEN** implement request validation by leveraging the OpenAPI specification (e.g., `express-openapi-validator`) to reject invalid requests before they reach the service layer.
- **IF** you need to generate Express route handlers from OpenAPI, **THEN** use tools like `openapi-backend` or `@asteasolutions/zod-to-openapi` if using Zod.

---

## Best Practices

1. **Write the specification first** – Design the contract before writing implementation code. This ensures the API is client-driven and well-thought-out.
2. **Use semantic versioning** – Align API versioning with the specification; increment the version only when breaking changes are made.
3. **Keep the specification in version control** – Track changes to the specification alongside code changes. This provides a history of API evolution.
4. **Reuse components** – Define reusable schemas, parameters, responses, and examples in the `components` section and reference them using `$ref`.
5. **Use operation IDs** – Assign unique `operationId` values to each endpoint for better client generation and debugging.
6. **Document examples** – Provide `example` or `examples` for request bodies, responses, and parameters to clarify usage.
7. **Define error responses** – For each endpoint, clearly document all possible HTTP status codes (4xx, 5xx) with corresponding error schemas.
8. **Validate specification in CI/CD** – Add a step to validate the specification and ensure it’s valid before deployment.
9. **Generate client SDKs in CI/CD** – Automate client generation and publish them as packages (e.g., to npm) to keep clients up-to-date.
10. **Use tags for grouping** – Use `tags` to group endpoints by domain (e.g., `users`, `orders`, `auth`) for better documentation navigation.

---

## Anti-Patterns

| Anti-Pattern                                    | Why it is wrong                                                | Correct approach                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Not keeping the specification in sync with code | Documentation becomes outdated and unreliable.                 | Update the specification with every code change; validate against implementation. |
| Manual documentation                            | Prone to errors and inconsistencies.                           | Use OpenAPI to generate documentation automatically.                              |
| Duplicating schemas across endpoints            | Maintenance burden; inconsistent validation.                   | Use `$ref` to reuse schemas.                                                      |
| Ignoring validation/linting                     | Invalid or non-standard specifications cause tooling failures. | Validate and lint the specification regularly.                                    |
| Hardcoding URLs in client code                  | Client breaks if base URL changes.                             | Generate client SDKs that use a base URL from configuration.                      |
| Breaking changes without versioning             | Existing clients break unexpectedly.                           | Use versioning or additive changes.                                               |
| Not using operation IDs                         | Generated client methods have unclear names.                   | Assign meaningful operation IDs.                                                  |
| Missing error responses                         | Clients cannot handle errors gracefully.                       | Document all error response codes.                                                |

---

## Common Mistakes & Edge Cases

| Mistake                                | Symptom                                                       | Solution                                                           |
| -------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| Missing `$ref` paths                   | Invalid specification; tooling fails.                         | Ensure `$ref` paths are relative and resolve correctly.            |
| Incorrect JSON Schema in OpenAPI 3.1   | Validation fails due to unsupported keywords.                 | Use OpenAPI 3.1’s JSON Schema dialect (draft 2020-12).             |
| Not including `required` in parameters | Parameters treated as optional incorrectly.                   | Set `required: true` where needed.                                 |
| Mixing `example` and `examples`        | Confusion; one may override the other.                        | Use `examples` for multiple scenarios, `example` for a single one. |
| Using non-standard extensions          | Tooling may ignore or fail.                                   | Use `x-` prefixed extensions sparingly and document them.          |
| Not handling content negotiation       | API only supports JSON but clients may request other formats. | Specify `consumes`/`produces` or `content` fields.                 |
| Missing security definitions           | Authentication not documented.                                | Define `securitySchemes` and apply them to endpoints.              |
| Generating client with outdated spec   | Client methods are stale.                                     | Automate generation in CI/CD.                                      |

---

## Related Skills

- `api-design` – for designing RESTful API endpoints and contracts that feed into OpenAPI.
- `express` – for implementing Express routes that validate against OpenAPI.
- `testing` – for using OpenAPI contract testing to validate API behavior.
- `validation` – for request validation based on OpenAPI schemas.
- `deployment` – for publishing OpenAPI documentation and client packages.
- `monorepo` – for managing shared API contracts in a monorepo.
- `typescript` – for generating TypeScript types from OpenAPI.

---

## Official References

- [OpenAPI Specification (OAS) – Version 3.1.0](https://swagger.io/specification/)
- [OpenAPI Specification – GitHub](https://github.com/OAI/OpenAPI-Specification)
- [Swagger Tools – Overview](https://swagger.io/tools/)
- [OpenAPI Generator – Official Site](https://openapi-generator.tech/)
- [Spectral – OpenAPI Linter](https://github.com/stoplightio/spectral)
- [Redoc – OpenAPI Documentation](https://github.com/Redocly/redoc)
- [Redocly CLI – Validation and Bundling](https://redocly.com/docs/cli/)
- [Stoplight Prism – Mock Server](https://github.com/stoplightio/prism)
- [express-openapi-validator – Validate Requests](https://github.com/cdimascio/express-openapi-validator)
- [openapi-typescript – Generate TypeScript Types](https://github.com/drwpow/openapi-typescript)
- [openapi-backend – Framework for Express](https://github.com/openapistack/openapi-backend)
- [OpenAPI Diff – Detect Breaking Changes](https://github.com/OpenAPITools/openapi-diff)
- [OpenAPI Best Practices – Microsoft](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [JSON Schema – OpenAPI 3.1 Dialect](https://json-schema.org/specification)
