# Authentication & Authorization

## Purpose

This document defines how users authenticate, how access is controlled, and how sessions are managed within the Vehicle Rental Management Platform.

Its purpose is to provide a secure, simple, and maintainable authentication system that supports both online and offline operation.

---

# Authentication Goals

The authentication system should be:

- Secure.
- Simple to use.
- Easy to maintain.
- Suitable for a multi-tenant SaaS.
- Compatible with offline-first operation.
- Flexible enough for future enhancements.

The goal is to protect business data while keeping the user experience straightforward.

---

# Authentication Philosophy

Authentication should never become a barrier to using the application.

Business owners expect to log in once and remain signed in until they explicitly choose to log out.

The platform should avoid unnecessary login interruptions while maintaining appropriate security.

---

# Supported Authentication Methods

## Version 2

The platform supports:

- Email
- Password

This is the only authentication method required for the initial production release.

---

## Future Enhancements

Future versions may introduce additional authentication providers, including:

- Google Sign-In

Additional providers should integrate with the existing authentication system without changing the rest of the application.

---

# User Types

The platform is designed exclusively for internal business users.

Current users include:

- Business Owner

Future versions may introduce additional users such as:

- Manager
- Employee

Customers do not authenticate into the system.

---

# Authorization Model

The platform uses Role-Based Access Control (RBAC).

Every authenticated user belongs to exactly one organization.

Permissions are determined by the user's assigned role.

The backend is responsible for enforcing all authorization rules.

Clients must never decide what a user is allowed to access.

---

# Organization Isolation

Every authenticated user belongs to a single organization.

All protected requests execute within that organization's context.

Users can only access data that belongs to their own organization.

The organization identity is derived from authentication. The authenticated organization ID is obtained from `req.user.org`, which originates from the validated JWT `org` claim. Clients cannot request another organization's data by providing an organization ID. Organization-managed endpoints such as `GET /api/organizations/me` operate on the authenticated user's own organization.

Organization boundaries are enforced by the backend and the database.

---

# Session Management

The platform provides persistent login sessions.

Users remain signed in until they explicitly log out.

The application should not require users to log in again after a fixed period such as every day, week, or month.

Session management should remain transparent to the user while maintaining security internally.

---

# Token Strategy

Authentication is based on JSON Web Tokens (JWT).

The platform uses:

- Access Token
- Refresh Token

The access token is used to authenticate API requests.

The refresh token allows the application to obtain new access tokens without requiring the user to log in again.

This provides long-lived user sessions while maintaining secure authentication.

---

# Password Security

Passwords are never stored in plain text.

The platform stores only secure password hashes.

Authentication compares the submitted password against the stored hash.

Password handling should follow modern security best practices.

---

# Login Flow

The login process follows these steps:

1. User enters email and password.
2. Credentials are validated.
3. User identity is verified.
4. Access and refresh tokens are issued.
5. The authenticated session begins.

Successful authentication establishes the organization and user context for future requests.

---

# Logout Flow

Logging out immediately ends the authenticated session.

Stored authentication tokens are removed from the client.

Future requests require authentication again.

---

# Authentication API

Authentication is exposed through the `/api/auth/*` endpoint group.

## Registration

`POST /api/auth/register`

Registers a new organization and its first user (OWNER role). On success, access and refresh tokens are issued and returned to the client.

## Login

`POST /api/auth/login`

Authenticates a user with email and password. Credentials are validated, the user identity is verified, and access and refresh tokens are issued.

## Refresh

`POST /api/auth/refresh`

Exchanges a valid refresh token for a new access and refresh token pair. The previous refresh token is invalidated (rotation).

## Logout

`POST /api/auth/logout`

Revokes the provided refresh token, ending the authenticated session.

## Current User

`GET /api/auth/me`

Returns the current authenticated user. This endpoint is used by clients to restore the current authenticated session, for example when the application loads.

The endpoint:
- Returns the authenticated user information when a valid access token is provided.
- Returns `{ "data": null }` when no authenticated user exists.
- Returns `401` when an authentication attempt is made with an invalid or malformed token.

---

# Protected Resources

Authentication is required for all business operations, including:

- Customers
- Vehicles
- Rentals
- Payments
- Maintenance
- Reports
- Dashboard

Public endpoints should be kept to an absolute minimum.

---

# Offline Authentication

Offline authentication follows a simple model.

The first login always requires an internet connection.

Once authenticated successfully:

- The user remains signed in.
- The application can be opened without an internet connection.
- Previously synchronized data remains available.
- New business operations can continue while offline.

When connectivity returns, locally stored changes are synchronized with the backend.

Authentication itself cannot be performed offline.

---

# Security Principles

The authentication system follows these principles:

- Never trust client input.
- Authenticate before accessing protected resources.
- Authorize every protected operation.
- Store passwords securely.
- Protect authentication tokens.
- Enforce organization isolation.
- Minimize exposed information.

Security should be built into every authentication decision rather than added later.

---

# Future Expansion

The authentication architecture should support future enhancements without major redesign.

Possible future additions include:

- Google Sign-In
- Additional user roles
- Granular permissions
- Multi-factor authentication
- Password reset improvements

These features should integrate into the existing authentication system rather than replace it.

---

# Guiding Principle

Every authentication and authorization decision should answer one question:

> **Does this provide a secure, simple, and reliable way for business users to access their organization's data while supporting the operational needs of the platform?**
