import { resolve } from "node:path";
import { env } from "./env";
import {
  LocalFilesystemProvider,
  R2StorageProvider,
  type StorageProvider,
} from "../storage";

const DEFAULT_STORAGE_DIR = "./storage";

export function createStorageProvider(config: typeof env): StorageProvider {
  if (config.STORAGE_PROVIDER === "r2") {
    if (!config.R2) {
      throw new Error("R2 configuration is required when STORAGE_PROVIDER=r2.");
    }

    return new R2StorageProvider(config.R2);
  }

  return new LocalFilesystemProvider(
    resolve(config.STORAGE_DIR ?? DEFAULT_STORAGE_DIR),
  );
}

export const storageProvider = createStorageProvider(env);
