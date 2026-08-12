import { Router, type IRouter } from "express";
import {
  handleUpload,
  listPhotos,
  getPhoto,
  uploadPhoto,
  deletePhoto,
  listDocuments,
  getDocument,
  uploadDocument,
  deleteDocument,
} from "./media.controller";
import { authenticate, requireRole } from "../../middleware";

const router: IRouter = Router();

// Photos
router.get("/vehicles/:vehicleId/photos", authenticate, listPhotos);
router.get("/vehicles/:vehicleId/photos/:id", authenticate, getPhoto);
router.post(
  "/vehicles/:vehicleId/photos",
  authenticate,
  requireRole("OWNER"),
  handleUpload,
  uploadPhoto,
);
router.delete("/vehicles/:vehicleId/photos/:id", authenticate, requireRole("OWNER"), deletePhoto);

// Documents
router.get("/vehicles/:vehicleId/documents", authenticate, listDocuments);
router.get("/vehicles/:vehicleId/documents/:id", authenticate, getDocument);
router.post(
  "/vehicles/:vehicleId/documents",
  authenticate,
  requireRole("OWNER"),
  handleUpload,
  uploadDocument,
);
router.delete("/vehicles/:vehicleId/documents/:id", authenticate, requireRole("OWNER"), deleteDocument);

export default router;
