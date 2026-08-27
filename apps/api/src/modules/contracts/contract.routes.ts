import { Router, type IRouter } from "express";
import {
  handleUpload,
  get,
  generate,
  remove,
  printable,
  pdf,
  listSigned,
  uploadSigned,
  getSigned,
  updateSigned,
  downloadSigned,
  deleteSigned,
} from "./contract.controller";
import {
  authenticate,
  requireOperationalOrganization,
  requireRole,
} from "../../middleware";
import { validateBody } from "../../middleware";
import { documentMetadataSchema } from "../media/media.validation";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get("/rentals/:id/contract", get);
router.get("/rentals/:id/contract/printable", printable);
router.get("/rentals/:id/contract/pdf", pdf);
router.get("/rentals/:id/contract/signed", listSigned);
router.get("/rentals/:id/contract/signed/:documentId", getSigned);
router.patch(
  "/rentals/:id/contract/signed/:documentId",
  requireRole("OWNER"),
  validateBody(documentMetadataSchema),
  updateSigned,
);
router.get(
  "/rentals/:id/contract/signed/:documentId/download",
  downloadSigned,
);
router.post(
  "/rentals/:id/contract",
  requireRole("OWNER"),
  generate,
);
router.post(
  "/rentals/:id/contract/signed",
  requireRole("OWNER"),
  handleUpload,
  uploadSigned,
);
router.delete(
  "/rentals/:id/contract",
  requireRole("OWNER"),
  remove,
);
router.delete(
  "/rentals/:id/contract/signed/:documentId",
  requireRole("OWNER"),
  deleteSigned,
);

export default router;
