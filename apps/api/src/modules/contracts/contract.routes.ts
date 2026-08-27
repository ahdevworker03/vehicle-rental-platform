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
  downloadSigned,
  deleteSigned,
} from "./contract.controller";
import {
  authenticate,
  requireOperationalOrganization,
  requireRole,
} from "../../middleware";

const router: IRouter = Router();
router.use(authenticate, requireOperationalOrganization);

router.get("/rentals/:id/contract", get);
router.get("/rentals/:id/contract/printable", printable);
router.get("/rentals/:id/contract/pdf", pdf);
router.get("/rentals/:id/contract/signed", listSigned);
router.get("/rentals/:id/contract/signed/:documentId", getSigned);
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
