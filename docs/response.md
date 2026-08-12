# Step 9.4a — Media File Serving (Backend): Complete

---

## Summary

Added authenticated file download endpoints for vehicle and customer documents. Reused the existing `StorageProvider` abstraction and `LocalFilesystemProvider` (no second storage system). Enforces organization isolation, soft-delete exclusion, and authentication. Updated the OpenAPI contract and regenerated the client.

---

## Files Modified

| File | Change |
|---|---|
| `apps/api/src/modules/media/media.service.ts` | Added `downloadVehicleDocument` / `downloadCustomerDocument` returning `{ buffer, mimeType, filename, size }` |
| `apps/api/src/modules/media/media.controller.ts` | Added thin download controllers + `sendFile` helper (Content-Type / Content-Disposition / Content-Length headers) |
| `apps/api/src/modules/media/media.routes.ts` | Added `GET .../documents/:id/download` for both vehicle and customer documents |
| `lib/api-spec/openapi.yaml` | Added `downloadVehicleDocument` and `downloadCustomerDocument` endpoints |
| `lib/api-client-react/src/generated/*` | Regenerated (added `downloadVehicleDocument`, `downloadCustomerDocument`, hooks) |
| `lib/api-zod/src/generated/*` | Regenerated |

No repository changes were required — the existing org-scoped `findDocument`/`findCustomerDocument` return the full `DocumentRecord` (including `storage_key`, `mime_type`, `original_filename`, `deleted_at`), which the download service reuses. No generated files were hand-edited.

---

## Endpoints

| Method | URL | Auth | Response |
|---|---|---|---|
| GET | `/api/vehicles/:vehicleId/documents/:id/download` | Any authenticated | 200 binary file |
| GET | `/api/customers/:customerId/documents/:id/download` | Any authenticated | 200 binary file |

Download is a **read** operation — any authenticated user can download (consistent with the existing media read policy where list/get are authenticated). Upload/delete remain OWNER-only.

---

## Security Checks

| Requirement | Implementation |
|---|---|
| Organization isolation | `ensureVehicleInOrg` / `ensureCustomerInOrg` → 404 if the owner entity isn't in `req.user.org` |
| Document belongs to requested owner | `repo.findDocument(documentId, vehicleId, orgId)` / `findCustomerDocument` — scoped by both id and org |
| Do not serve soft-deleted documents | `if (!document \|\| document.deleted_at) → 404 DOCUMENT_NOT_FOUND` |
| Never expose raw filesystem paths / storage keys as public URLs | Download resolves the storage key internally via `storageProvider.retrieve()` and serves raw bytes; the storage key is never exposed |
| Do not bypass auth middleware | All download routes use `authenticate` |
| Prisma access in repositories | Service calls `repo.*`; no Prisma in controller/service |
| Controllers thin | Controllers extract params, call service, set headers, send buffer |
| Business logic in service | Org check, soft-delete check, storage retrieval all in service |

---

## Response Headers

- `Content-Type`: the document's stored `mime_type` (e.g. `application/pdf`)
- `Content-Length`: byte length of the buffer
- `Content-Disposition: attachment; filename="<sanitized original_filename>"` — quotes/backslashes stripped to prevent header injection

---

## Runtime Verification (7/7 PASS)

| # | Test | Expected | Actual |
|---|---|---|---|
| 1 | Vehicle document download (auth) | 200, body = stored bytes | 200 `application/pdf`, `Content-Disposition: attachment; filename="vdoc.pdf"`, body `hello-vehicle-document` ✅ |
| 2 | Customer document download (auth) | 200, body = stored bytes | 200 `application/pdf`, `filename="cdoc.pdf"`, body `hello-customer-document` ✅ |
| 3 | Unauthenticated download | 401 | 401 ✅ |
| 4 | Cross-organization download | 404 | 404 ✅ |
| 5 | Delete then download | 404 | 404 ✅ |
| 6 | Existing vehicle doc list (regression) | 200 | 200 ✅ |
| 7 | Existing customer doc list + upload (regression) | 200 / 201 | 200 / 201 ✅ |

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Authenticated vehicle document download works | ✅ |
| Authenticated customer document download works | ✅ |
| Correct Content-Type returned | ✅ |
| Filename preserved safely | ✅ |
| Cross-organization access blocked | ✅ |
| Deleted documents cannot be downloaded | ✅ |
| Unauthenticated requests return 401 | ✅ |
| Existing vehicle/customer media endpoints still work | ✅ |
| Typecheck passes | ✅ |
| Build passes | ✅ |
| Lint passes | ✅ |
| Reused StorageProvider / no second storage system | ✅ |
| No frontend / cloud / unrelated features | ✅ |

---

## Notes

- The react-query client now exposes `useDownloadVehicleDocument` / `useDownloadCustomerDocument` hooks for the frontend to call (Step 9.4's download links can now be wired to real HTTP downloads in a follow-up if desired).
- The zod output correctly excluded binary download responses from backend validation (handled by the `zodTransformer`), and `tsc --build` passes.
