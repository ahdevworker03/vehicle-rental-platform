# Step 9.2 — Vehicle Photos & Documents (Backend): Complete

---

## Summary

Implemented the Vehicle Photos & Documents backend module per the authoritative Media specification. Reused the Step 9.1 `StorageProvider` abstraction and `LocalFilesystemProvider`. Added multipart upload support via `multer`, org-scoped repositories/services/controllers/routes, and enforced the 10 MB limit and approved MIME types.

---

## Files Created

| File | Purpose |
|---|---|
| `apps/api/src/config/storage.ts` | Wires `LocalFilesystemProvider` from `STORAGE_DIR` |
| `apps/api/src/modules/media/media.types.ts` | Photo/Document record + response types |
| `apps/api/src/modules/media/media.validation.ts` | MIME/size constants + Zod schemas |
| `apps/api/src/modules/media/media.repository.ts` | Org-scoped Prisma queries |
| `apps/api/src/modules/media/media.service.ts` | Business logic (verify org, storage key, store, soft delete) |
| `apps/api/src/modules/media/media.controller.ts` | Thin controllers + multer upload handling |
| `apps/api/src/modules/media/media.routes.ts` | Nested routes under `/vehicles/:vehicleId/...` |
| `apps/api/src/modules/media/index.ts` | Barrel export |

## Files Modified

| File | Change |
|---|---|
| `apps/api/package.json` | Added `multer` + `@types/multer` |
| `apps/api/src/routes/index.ts` | Mounted `mediaRouter` |
| `apps/api/.env` / `.env.example` | Added `STORAGE_DIR=./storage` |
| `.gitignore` | Added `apps/api/storage/` (runtime upload data) |

---

## Endpoint Summary

| Method | URL | Role | Response |
|---|---|---|---|
| GET | `/api/vehicles/:vehicleId/photos` | Any auth | 200 `{ data: PhotoResponse[] }` |
| GET | `/api/vehicles/:vehicleId/photos/:id` | Any auth | 200 `{ data: PhotoResponse }` |
| POST | `/api/vehicles/:vehicleId/photos` | OWNER | 201 `{ data: PhotoResponse }` |
| DELETE | `/api/vehicles/:vehicleId/photos/:id` | OWNER | 204 |
| GET | `/api/vehicles/:vehicleId/documents` | Any auth | 200 `{ data: DocumentResponse[] }` |
| GET | `/api/vehicles/:vehicleId/documents/:id` | Any auth | 200 `{ data: DocumentResponse }` |
| POST | `/api/vehicles/:vehicleId/documents` | OWNER | 201 `{ data: DocumentResponse }` |
| DELETE | `/api/vehicles/:vehicleId/documents/:id` | OWNER | 204 |

---

## Repository (`media.repository.ts`)

All queries are org-scoped + vehicle-scoped:
- `findVehicle(vehicleId, orgId)` — `findFirst({ where: { id, organization_id } })`
- `listPhotos(vehicleId, orgId)` — `findMany({ where: { vehicle_id, organization_id, deleted_at: null } })`
- `findPhoto(photoId, vehicleId, orgId)` — `findFirst({ where: { id, vehicle_id, organization_id } })`
- `createPhoto` / `softDeletePhoto` — org-verified before write
- Same for documents

## Service (`media.service.ts`)

- `ensureVehicleInOrg` — 404 `VEHICLE_NOT_FOUND` if vehicle not in the authenticated org
- Storage key: `<orgId>/vehicle/<uuid>.<ext>` (extension from validated MIME)
- MIME validation: photos → jpeg/png/webp; documents → pdf/jpeg/png
- Size validation: `> 10 MB` → 422 `FILE_TOO_LARGE`
- Filename sanitized (path separators removed)
- Soft delete: sets `deleted_at`; **no physical file deletion** (per spec)

## Validation

- MIME types enforced in service (photos vs documents)
- 10 MB limit enforced by multer (`limits.fileSize`) and service (`MAX_FILE_SIZE`)
- `category` validated (REGISTRATION/INSURANCE/OTHER)
- `sort_order`/`caption` parsed defensively

---

## Runtime Verification Results

| # | Test | Expected | Actual |
|---|---|---|---|
| 1 | Upload photo (OWNER) | 201 | 201 ✅ |
| 2 | List photos | 200, count=1 | 200 ✅ |
| 3 | Upload document (INSURANCE) | 201 | 201 ✅ |
| 4 | List documents | 200, category=INSURANCE | 200 ✅ |
| 5 | Get photo | 200 | 200 ✅ |
| 6 | Cross-org list | 404 | 404 ✅ |
| 7 | Cross-org upload | 404 | 404 ✅ |
| 8 | Invalid MIME | 422 | 422 `UNSUPPORTED_MIME_TYPE` ✅ |
| 9 | File too large (>10MB) | 422 | 422 `FILE_TOO_LARGE` ✅ (fixed) |
| 10 | Delete photo | 204 | 204 ✅ |
| 11 | GET deleted photo | 404 | 404 ✅ |
| 12 | Unauthenticated list | 401 | 401 ✅ |
| 13 | MANAGER upload | 403 | 403 ✅ |
| 14 | MANAGER can list | 200 | 200 ✅ |
| 15 | File stored on disk | exists | ✅ (`storage/<org>/vehicle/*.jpg`) |

---

## Issue Discovered & Fixed

**Large-file upload returned `INTERNAL_ERROR` (500) instead of `422 FILE_TOO_LARGE`.**

- Cause: multer's `limits.fileSize` rejects the upload before the service-level check runs, throwing a `MulterError` that fell through to the generic error handler.
- Fix: added a `handleUpload` wrapper that catches `MulterError` and converts `LIMIT_FILE_SIZE` → `AppError(422, "FILE_TOO_LARGE")`.
- Verified post-fix: 11 MB upload → `422 FILE_TOO_LARGE`; valid uploads still `201`.

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Upload works | ✅ |
| List works | ✅ |
| Delete works (soft) | ✅ |
| Validation works | ✅ (MIME + size + category) |
| Cross-organization access blocked | ✅ (404) |
| RBAC correct | ✅ (OWNER = mutations, auth = reads, MANAGER = 403 on mutations) |
| Storage integration works | ✅ (LocalFilesystemProvider; files on disk) |
| Typecheck passes | ✅ |
| Build passes | ✅ |
| Lint passes | ✅ |
| No API/frontend media UI / cloud / cleanup implemented | ✅ |

---

## Notes

- The backend has no test framework; runtime verification was performed per the project's testing conventions.
- The `apps/api/storage/` directory is a runtime data location and is git-ignored (not committed).
- No frontend media UI, cloud storage, or background cleanup was implemented — those remain out of scope for Step 9.2.
