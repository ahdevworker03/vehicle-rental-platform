# Step 9.3 — Customer Documents (Backend): Complete

---

## Summary

Implemented Customer Documents (upload/list/get/delete) by extending the existing media infrastructure from Step 9.2. Reused the `StorageProvider`, `LocalFilesystemProvider`, media validation, error handling, and org-isolation patterns. No second storage system or duplicate infrastructure was created.

---

## Files Modified

| File | Change |
|---|---|
| `lib/db/prisma/schema.prisma` | `Document.vehicle_id` now nullable; added `customer_id` FK + `Customer` relation; added `Document.customer_id` index; added `documents Document[]` relation on `Customer` |
| `apps/api/src/modules/media/media.types.ts` | `DocumentRecord`/`DocumentResponse` now carry nullable `customer_id` |
| `apps/api/src/modules/media/media.repository.ts` | Added `findCustomer`, `listCustomerDocuments`, `findCustomerDocument`, `createCustomerDocument` |
| `apps/api/src/modules/media/media.service.ts` | Added customer document business logic (org check, storage key, store, soft delete) |
| `apps/api/src/modules/media/media.controller.ts` | Added customer document controllers |
| `apps/api/src/modules/media/media.routes.ts` | Added `/customers/:customerId/documents` routes |

## Files Created

| File | Purpose |
|---|---|
| `lib/db/prisma/migrations/20260812163450_add_customer_documents/` | Adds `customer_id`, makes `vehicle_id` nullable |
| `lib/db/prisma/migrations/20260812163526_document_ondelete_restrict/` | Corrects FK `onDelete` to RESTRICT |

---

## Schema Change

The `Document` model now supports two explicit owner FKs (per the media spec's extensibility note: "future entities may receive explicit FK relationships through future migrations"):

- `vehicle_id` → nullable FK → `Vehicle.id`, onDelete **RESTRICT**
- `customer_id` → nullable FK → `Customer.id`, onDelete **RESTRICT**
- Added `@@index([customer_id])`
- Exactly-one-owner is enforced at the service layer (a document belongs to either a vehicle or a customer)

No polymorphic `entity_type`/`entity_id` was introduced.

---

## Endpoint Summary

| Method | URL | Role | Response |
|---|---|---|---|
| GET | `/api/customers/:customerId/documents` | Any auth | 200 `{ data: DocumentResponse[] }` |
| GET | `/api/customers/:customerId/documents/:id` | Any auth | 200 `{ data: DocumentResponse }` |
| POST | `/api/customers/:customerId/documents` | OWNER | 201 `{ data: DocumentResponse }` |
| DELETE | `/api/customers/:customerId/documents/:id` | OWNER | 204 |

---

## Service / Repository Behavior

- `ensureCustomerInOrg` → 404 `CUSTOMER_NOT_FOUND` if the customer isn't in the authenticated org.
- Storage key: `<orgId>/customer/<uuid>.<ext>` (reused `generateStorageKey` with `"customer"` entity).
- MIME validation (documents): PDF / JPEG / PNG → else 422 `UNSUPPORTED_MIME_TYPE`.
- Size validation: > 10 MB → 422 `FILE_TOO_LARGE`.
- Filename sanitized (path separators removed).
- Soft delete via `deleted_at`; physical files **not** deleted (per spec).
- All Prisma access lives in the repository; controllers remain thin.

---

## Runtime Verification (12/12 PASS)

| # | Test | Expected | Actual |
|---|---|---|---|
| 1 | Upload customer document (OWNER) | 201 | 201 ✅ |
| 2 | List customer documents | 200, category=REGISTRATION | 200 ✅ |
| 3 | Get customer document | 200 | 200 ✅ |
| 4 | Cross-org list | 404 | 404 ✅ |
| 5 | Cross-org upload | 404 | 404 ✅ |
| 6 | Invalid MIME | 422 | 422 `UNSUPPORTED_MIME_TYPE` ✅ |
| 7 | File too large (>10MB) | 422 | 422 `FILE_TOO_LARGE` ✅ |
| 8 | Delete customer document | 204 | 204 ✅ |
| 9 | GET deleted | 404 | 404 ✅ |
| 10 | Unauthenticated | 401 | 401 ✅ |
| 11 | MANAGER upload → 403, list → 200 | 403 / 200 | 403 / 200 ✅ |
| 12 | File stored under `customer/` entity dir | exists | ✅ |

### Regression (existing media unaffected)

- Vehicle document upload still works (`vehicleId` populated). ✅
- Vehicle photo upload still works. ✅

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Upload works | ✅ |
| List works | ✅ |
| Delete works (soft) | ✅ |
| Cross-organization access blocked | ✅ (404) |
| Validation and API errors correct | ✅ |
| Typecheck passes | ✅ |
| Build passes | ✅ |
| Lint passes | ✅ |
| Reused StorageProvider / no second storage system | ✅ |
| OWNER-only mutations match existing policy | ✅ |
| No frontend UI / unrelated features | ✅ |

---

## Notes

- The `onDelete` for both `Document` FKs is **RESTRICT**, matching the documented business-record convention. Prisma's default for nullable FKs is `SET NULL`, so a follow-up migration was created to enforce RESTRICT.
- The backend has no test framework; runtime verification was performed per the project's testing conventions.
