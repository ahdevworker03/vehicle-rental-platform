import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ok, created, noContent, AppError } from "../../shared";
import { mediaService } from "./media.service";
import type { CreatePhotoInput, CreateDocumentInput } from "./media.types";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

function handleUpload(req: Request, res: Response, next: NextFunction): void {
  upload.single("file")(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        next(new AppError(422, "FILE_TOO_LARGE", "File exceeds the 10 MB size limit."));
        return;
      }
      next(new AppError(422, "UPLOAD_ERROR", err.message));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}

function parseSortOrder(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function parseCaption(value: unknown): string | undefined {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  return value.trim();
}

function parseCategory(value: unknown): CreateDocumentInput["category"] {
  const raw = typeof value === "string" ? value : "OTHER";
  return (["REGISTRATION", "INSURANCE", "OTHER"] as const).includes(raw as never)
    ? (raw as CreateDocumentInput["category"])
    : "OTHER";
}

async function listPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const photos = await mediaService.listVehiclePhotos(vehicleId, req.user!.org);
    ok(res, photos);
  } catch (err) {
    next(err);
  }
}

async function getPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const id = req.params.id as string;
    const photo = await mediaService.getVehiclePhoto(id, vehicleId, req.user!.org);
    ok(res, photo);
  } catch (err) {
    next(err);
  }
}

async function uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const file = req.file;

    if (!file) {
      res.status(422).json({ error: { code: "FILE_REQUIRED", message: "A file is required." } });
      return;
    }

    const input: CreatePhotoInput = {
      caption: parseCaption(req.body.caption),
      sortOrder: parseSortOrder(req.body.sort_order),
    };

    const photo = await mediaService.uploadVehiclePhoto(vehicleId, req.user!.org, file, input);
    created(res, photo);
  } catch (err) {
    next(err);
  }
}

async function deletePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const id = req.params.id as string;
    await mediaService.deleteVehiclePhoto(id, vehicleId, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

async function listDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const documents = await mediaService.listVehicleDocuments(vehicleId, req.user!.org);
    ok(res, documents);
  } catch (err) {
    next(err);
  }
}

async function getDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const id = req.params.id as string;
    const document = await mediaService.getVehicleDocument(id, vehicleId, req.user!.org);
    ok(res, document);
  } catch (err) {
    next(err);
  }
}

async function uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const file = req.file;

    if (!file) {
      res.status(422).json({ error: { code: "FILE_REQUIRED", message: "A file is required." } });
      return;
    }

    const input: CreateDocumentInput = {
      category: parseCategory(req.body.category),
    };

    const document = await mediaService.uploadVehicleDocument(vehicleId, req.user!.org, file, input);
    created(res, document);
  } catch (err) {
    next(err);
  }
}

async function deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const vehicleId = req.params.vehicleId as string;
    const id = req.params.id as string;
    await mediaService.deleteVehicleDocument(id, vehicleId, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

async function listCustomerDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.params.customerId as string;
    const documents = await mediaService.listCustomerDocuments(customerId, req.user!.org);
    ok(res, documents);
  } catch (err) {
    next(err);
  }
}

async function getCustomerDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.params.customerId as string;
    const id = req.params.id as string;
    const document = await mediaService.getCustomerDocument(id, customerId, req.user!.org);
    ok(res, document);
  } catch (err) {
    next(err);
  }
}

async function uploadCustomerDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.params.customerId as string;
    const file = req.file;

    if (!file) {
      res.status(422).json({ error: { code: "FILE_REQUIRED", message: "A file is required." } });
      return;
    }

    const input: CreateDocumentInput = {
      category: parseCategory(req.body.category),
    };

    const document = await mediaService.uploadCustomerDocument(customerId, req.user!.org, file, input);
    created(res, document);
  } catch (err) {
    next(err);
  }
}

async function deleteCustomerDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const customerId = req.params.customerId as string;
    const id = req.params.id as string;
    await mediaService.deleteCustomerDocument(id, customerId, req.user!.org);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

export {
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
};
