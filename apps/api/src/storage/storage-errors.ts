import { logger } from "../config";
import { AppError } from "../shared";
import type { StorageProvider } from "./storage-provider";

export class StorageObjectNotFoundError extends Error {
  constructor() {
    super("Stored object was not found.");
    this.name = "StorageObjectNotFoundError";
  }
}

export async function retrieveStoredFile(
  provider: StorageProvider,
  storageKey: string,
): Promise<Buffer> {
  try {
    return await provider.retrieve(storageKey);
  } catch (error) {
    if (error instanceof StorageObjectNotFoundError) {
      throw new AppError(
        404,
        "FILE_NOT_FOUND",
        "The requested file is no longer available.",
      );
    }

    throw error;
  }
}

export async function storeWithMetadata<T>(
  provider: StorageProvider,
  storageKey: string,
  data: Buffer,
  contentType: string,
  createMetadata: () => Promise<T>,
): Promise<T> {
  await provider.store(storageKey, data, contentType);

  try {
    return await createMetadata();
  } catch (error) {
    try {
      await provider.delete(storageKey);
    } catch (cleanupError) {
      logger.error(
        { err: cleanupError, storageKey },
        "Failed to clean up stored object after metadata persistence failure",
      );
    }

    throw error;
  }
}
