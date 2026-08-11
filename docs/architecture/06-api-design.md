# API Design

## Purpose

This document defines the design principles and communication standards for the Vehicle Rental Management Platform API.

Its purpose is to ensure every client communicates with the backend in a consistent, predictable, and maintainable way.

This document defines **how the API works**, not the implementation of individual endpoints.

---

# Design Goals

The API should be:

- Simple to understand.
- Consistent.
- Predictable.
- Secure.
- Easy to consume.
- Easy to maintain.
- Suitable for offline synchronization.
- Independent of any frontend implementation.

---

# API Philosophy

The API is the contract between clients and the backend.

Clients should not need to understand backend implementation details.

The backend is responsible for enforcing business rules, validating requests, and protecting data integrity.

---

# Architectural Style

The platform exposes a RESTful API.

Resources represent business entities such as:

- Organizations
- Users
- Customers
- Vehicles
- Rentals
- Payments
- Maintenance

Endpoints operate on these resources using standard HTTP methods.

---

# Resource Naming

Resources should:

- Use plural nouns.
- Use lowercase letters.
- Use hyphens when necessary.
- Represent business concepts.

Examples:

```text
/customers

/vehicles

/rentals

/payments
```

Endpoints should never describe actions.

Avoid:

```text
/createCustomer

/getVehicles

/deleteRental
```

---

# HTTP Methods

The API follows standard REST conventions.

| Method | Purpose                   |
| ------ | ------------------------- |
| GET    | Retrieve resources        |
| POST   | Create resources          |
| PATCH  | Update existing resources |
| DELETE | Soft delete resources     |

Methods should always have a consistent meaning.

---

# Request Structure

Clients communicate using JSON.

Requests should include:

- Path parameters
- Query parameters
- Request body (when applicable)
- Authentication token

Only required information should be sent.

---

# Response Structure

Successful responses should follow a consistent format.

Example:

```json
{
  "data": {}
}
```

Collections return an array within the `data` property.

Response structures should remain consistent across the entire API.

---

# Error Responses

Errors should also follow a consistent format.

Example:

```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found."
  }
}
```

Errors should provide enough information for the client while avoiding exposure of internal implementation details.

---

# HTTP Status Codes

The API should use standard HTTP status codes.

Common responses include:

| Status | Meaning                                  |
| ------ | ---------------------------------------- |
| 200    | Success                                  |
| 201    | Resource created                         |
| 204    | Successful request with no response body |
| 400    | Invalid request                          |
| 401    | Authentication required                  |
| 403    | Permission denied                        |
| 404    | Resource not found                       |
| 409    | Business conflict                        |
| 422    | Validation failed                        |
| 500    | Unexpected server error                  |

Status codes should accurately represent the outcome of the request.

---

# Validation

Validation occurs before business logic is executed.

Validation includes:

- Required fields.
- Data types.
- Formats.
- Value ranges.
- Request structure.

Business validation is performed separately by the service layer.

---

# Authentication

Protected endpoints require authentication.

Authentication is performed using JWT access tokens.

Authentication details are documented separately in the Authentication Architecture document.

---

# Authentication Endpoints

Authentication endpoints are grouped under the `/api/auth/*` prefix.

All endpoints accept and return JSON.

## POST /api/auth/register

- **Purpose:** Register a new organization and its first user (OWNER role).
- **Request body:**
  ```json
  {
    "email": "owner@example.com",
    "password": "securepassword",
    "organizationName": "My Company"
  }
  ```
- **Success response:** `201 Created`
  ```json
  {
    "data": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresAt": "2026-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error responses:**
  - `400` Invalid request
  - `409` Email already exists
  - `422` Validation failed

## POST /api/auth/login

- **Purpose:** Authenticate a user and issue access and refresh tokens.
- **Request body:**
  ```json
  {
    "email": "owner@example.com",
    "password": "securepassword"
  }
  ```
- **Success response:** `200 OK`
  ```json
  {
    "data": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresAt": "2026-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error responses:**
  - `401` Invalid credentials
  - `422` Validation failed

## POST /api/auth/refresh

- **Purpose:** Exchange a valid refresh token for a new access and refresh token pair. The previous refresh token is invalidated.
- **Request body:**
  ```json
  {
    "refreshToken": "..."
  }
  ```
- **Success response:** `200 OK`
  ```json
  {
    "data": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresAt": "2026-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error responses:**
  - `401` Invalid or expired refresh token
  - `422` Validation failed

## POST /api/auth/logout

- **Purpose:** Revoke the provided refresh token and end the authenticated session.
- **Request body:**
  ```json
  {
    "refreshToken": "..."
  }
  ```
- **Success response:** `204 No Content` (no body)
- **Error responses:**
  - `422` Validation failed

## GET /api/auth/me

- **Purpose:** Retrieve the current authenticated user. Used by clients to restore the active session.
- **Request headers:** `Authorization: Bearer <accessToken>`
- **Success responses:**
  - `200 OK` with authenticated user information when the access token is valid:
    ```json
    {
      "data": {
        "id": "...",
        "email": "owner@example.com",
        "role": "OWNER",
        "organizationId": "...",
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    }
    ```
  - `200 OK` with `{ "data": null }` when no authenticated user exists (no token provided).
- **Error responses:**
  - `401` Unauthorized when an authentication attempt is made with an invalid or malformed token.

---

# Organization Endpoints

Organization endpoints are grouped under the `/api/organizations/*` prefix.

## Organization Identity From Authentication

The organization identity is **never supplied by the client** for these endpoints.

- The authenticated organization ID is obtained from `req.user.org`.
- `req.user.org` originates from the validated JWT `org` claim.
- Clients cannot request another organization's data by providing an organization ID.
- This is part of the platform's tenant isolation strategy.

Since every authenticated user belongs to exactly one organization, the API derives the organization context from authentication instead of a URL parameter. This reduces the attack surface and prevents cross-organization access caused by user-controlled organization identifiers.

## GET /api/organizations/me

- **Purpose:** Retrieve the current authenticated user's organization.
- **Request headers:** `Authorization: Bearer <accessToken>`
- **Success response:** `200 OK`
  ```json
  {
    "data": {
      "id": "...",
      "name": "My Company",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error responses:**
  - `401` Authentication required
  - `404` Organization not found

## PATCH /api/organizations/me

- **Purpose:** Update the current authenticated user's organization.
- **Request headers:** `Authorization: Bearer <accessToken>`
- **Request body:**
  ```json
  {
    "name": "My Renamed Company"
  }
  ```
- **Success response:** `200 OK`
  ```json
  {
    "data": {
      "id": "...",
      "name": "My Renamed Company",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  }
  ```
- **Error responses:**
  - `401` Authentication required
  - `403` Insufficient permissions
  - `404` Organization not found
  - `422` Validation failed

## DELETE /api/organizations/me

- **Purpose:** Soft-delete the current authenticated user's organization.
- **Request headers:** `Authorization: Bearer <accessToken>`
- **Success response:** `204 No Content` (no body)
- **Error responses:**
  - `401` Authentication required
  - `403` Insufficient permissions
  - `404` Organization not found

---

# Authorization

Authentication identifies the user.

Authorization determines what the user is allowed to do.

Permissions are evaluated according to:

- Organization
- User role
- Business rules

Authorization is enforced by the backend.

---

# Pagination

Collection endpoints should support pagination.

Typical query parameters include:

```text
?page=1&limit=20
```

Paginated responses should include metadata such as:

- Current page
- Page size
- Total records
- Total pages

---

# Filtering

Collection endpoints may support filtering.

Examples include:

- Vehicle status
- Rental status
- Customer
- Date ranges

Filtering should use query parameters.

---

# Sorting

Collection endpoints may support sorting.

Example:

```text
?sort=created_at&order=desc
```

Sorting should remain consistent across all resources.

---

# Searching

Search functionality should use query parameters.

Example:

```text
?search=john
```

Search behavior should remain predictable across the application.

---

# Versioning

The API should support future versioning.

Initial version:

```text
/api/v1
```

Future breaking changes should introduce a new API version rather than modifying existing contracts.

---

# Offline Synchronization

The API is designed to support offline-first operation.

Synchronization endpoints should:

- Receive locally created records.
- Detect conflicts.
- Resolve synchronization state.
- Return synchronization results.

Offline synchronization is considered a core API capability.

---

# Security

The API should:

- Require authentication where appropriate.
- Validate all incoming data.
- Never trust client input.
- Return only necessary information.
- Prevent unauthorized access.

Security applies to every endpoint.

---

# Consistency

Every endpoint should follow the same conventions.

Clients should not need to learn different patterns for different resources.

Consistency improves maintainability, usability, and developer experience.

---

# Future Expansion

The API should evolve without breaking existing clients.

New resources and capabilities should follow the same design principles defined in this document.

---

# Guiding Principle

Every API design decision should answer one question:

> **Does this make communication between clients and the backend simpler, more consistent, and easier to maintain while accurately supporting the business requirements?**
