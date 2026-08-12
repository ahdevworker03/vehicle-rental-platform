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
  listCustomerDocuments,
  getCustomerDocument,
  uploadCustomerDocument,
  deleteCustomerDocument,
  downloadVehicleDocument,
  downloadCustomerDocument,
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
router.get("/vehicles/:vehicleId/documents/:id/download", authenticate, downloadVehicleDocument);
router.post(
  "/vehicles/:vehicleId/documents",
  authenticate,
  requireRole("OWNER"),
  handleUpload,
  uploadDocument,
);
router.delete("/vehicles/:vehicleId/documents/:id", authenticate, requireRole("OWNER"), deleteDocument);

// Customer documents
router.get("/customers/:customerId/documents", authenticate, listCustomerDocuments);
router.get("/customers/:customerId/documents/:id", authenticate, getCustomerDocument);
router.get("/customers/:customerId/documents/:id/download", authenticate, downloadCustomerDocument);
router.post(
  "/customers/:customerId/documents",
  authenticate,
  requireRole("OWNER"),
  handleUpload,
  uploadCustomerDocument,
);
router.delete("/customers/:customerId/documents/:id", authenticate, requireRole("OWNER"), deleteCustomerDocument);

export default router;
