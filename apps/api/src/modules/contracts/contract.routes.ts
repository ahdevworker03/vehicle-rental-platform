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
import { authenticate, requireRole } from "../../middleware";

const router: IRouter = Router();

router.get("/rentals/:id/contract", authenticate, get);
router.get("/rentals/:id/contract/printable", authenticate, printable);
router.get("/rentals/:id/contract/pdf", authenticate, pdf);
router.get("/rentals/:id/contract/signed", authenticate, listSigned);
router.get("/rentals/:id/contract/signed/:documentId", authenticate, getSigned);
router.get("/rentals/:id/contract/signed/:documentId/download", authenticate, downloadSigned);
router.post("/rentals/:id/contract", authenticate, requireRole("OWNER"), generate);
router.post(
  "/rentals/:id/contract/signed",
  authenticate,
  requireRole("OWNER"),
  handleUpload,
  uploadSigned,
);
router.delete("/rentals/:id/contract", authenticate, requireRole("OWNER"), remove);
router.delete(
  "/rentals/:id/contract/signed/:documentId",
  authenticate,
  requireRole("OWNER"),
  deleteSigned,
);

export default router;
