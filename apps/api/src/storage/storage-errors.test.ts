import { describe, expect, it, vi } from "vitest";
import { logger } from "../config";
import { AppError } from "../shared";
import {
  retrieveStoredFile,
  StorageObjectNotFoundError,
  storeWithMetadata,
} from "./storage-errors";
import type { StorageProvider } from "./storage-provider";

function storageProvider(overrides: Partial<StorageProvider>): StorageProvider {
  return {
    store: vi.fn(),
    retrieve: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  };
}

describe("storage error boundary", () => {
  it("maps an absent stored object to a deliberate FILE_NOT_FOUND error", async () => {
    const provider = storageProvider({
      retrieve: vi.fn().mockRejectedValue(new StorageObjectNotFoundError()),
    });

    await expect(
      retrieveStoredFile(provider, "org/missing.pdf"),
    ).rejects.toMatchObject<Partial<AppError>>({
      statusCode: 404,
      code: "FILE_NOT_FOUND",
      message: "The requested file is no longer available.",
    });
  });

  it("preserves unexpected storage failures for the global internal-error handler", async () => {
    const failure = Object.assign(new Error("permission denied"), {
      code: "EACCES",
    });
    const provider = storageProvider({
      retrieve: vi.fn().mockRejectedValue(failure),
    });

    await expect(retrieveStoredFile(provider, "org/document.pdf")).rejects.toBe(
      failure,
    );
  });

  it("deletes a newly stored object when metadata persistence fails", async () => {
    const failure = new Error("database write failed");
    const provider = storageProvider({
      store: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    });

    await expect(
      storeWithMetadata(
        provider,
        "org/document.pdf",
        Buffer.from("file"),
        "application/pdf",
        () => Promise.reject(failure),
      ),
    ).rejects.toBe(failure);

    expect(provider.delete).toHaveBeenCalledWith("org/document.pdf");
  });

  it("logs a cleanup failure without hiding the metadata persistence failure", async () => {
    const failure = new Error("database write failed");
    const cleanupFailure = new Error("storage cleanup failed");
    const log = vi.spyOn(logger, "error").mockImplementation(() => logger);
    const provider = storageProvider({
      store: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockRejectedValue(cleanupFailure),
    });

    await expect(
      storeWithMetadata(
        provider,
        "org/document.pdf",
        Buffer.from("file"),
        "application/pdf",
        () => Promise.reject(failure),
      ),
    ).rejects.toBe(failure);

    expect(log).toHaveBeenCalledWith(
      { err: cleanupFailure, storageKey: "org/document.pdf" },
      "Failed to clean up stored object after metadata persistence failure",
    );
  });
});
