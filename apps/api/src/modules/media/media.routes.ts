import { Router, type IRouter } from "express";
import {
  handleUpload,
  listPhotos,
  getPhoto,
  servePhoto,
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
  updateVehicleDocument,
  updateCustomerDocument,
  downloadVehicleDocument,
  downloadCustomerDocument,
} from "./media.controller";
import {
  authenticate,
  requireOperationalOrganization,
  requireRole,
} from "../../middleware";
import { validateBody } from "../../middleware";
import { documentMetadataSchema } from "./media.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

// Photos
router.get("/vehicles/:vehicleId/photos", listPhotos);
router.get("/vehicles/:vehicleId/photos/:id/serve", servePhoto);
router.get("/vehicles/:vehicleId/photos/:id", getPhoto);
router.post(
  "/vehicles/:vehicleId/photos",
  requireRole("OWNER"),
  handleUpload,
  uploadPhoto,
);
router.delete(
  "/vehicles/:vehicleId/photos/:id",
  requireRole("OWNER"),
  deletePhoto,
);

// Documents
router.get("/vehicles/:vehicleId/documents", listDocuments);
router.get("/vehicles/:vehicleId/documents/:id", getDocument);
router.patch(
  "/vehicles/:vehicleId/documents/:id",
  requireRole("OWNER"),
  validateBody(documentMetadataSchema),
  updateVehicleDocument,
);
router.get(
  "/vehicles/:vehicleId/documents/:id/download",
  downloadVehicleDocument,
);
router.post(
  "/vehicles/:vehicleId/documents",
  requireRole("OWNER"),
  handleUpload,
  uploadDocument,
);
router.delete(
  "/vehicles/:vehicleId/documents/:id",
  requireRole("OWNER"),
  deleteDocument,
);

// Customer documents
router.get(
  "/customers/:customerId/documents",
  listCustomerDocuments,
);
router.get(
  "/customers/:customerId/documents/:id",
  getCustomerDocument,
);
router.patch(
  "/customers/:customerId/documents/:id",
  requireRole("OWNER"),
  validateBody(documentMetadataSchema),
  updateCustomerDocument,
);
router.get(
  "/customers/:customerId/documents/:id/download",
  downloadCustomerDocument,
);
router.post(
  "/customers/:customerId/documents",
  requireRole("OWNER"),
  handleUpload,
  uploadCustomerDocument,
);
router.delete(
  "/customers/:customerId/documents/:id",
  requireRole("OWNER"),
  deleteCustomerDocument,
);

export default router;
