import { describe, expect, it } from "vitest";
import { loadEnv } from "./env";
import { createStorageProvider } from "./storage";
import { LocalFilesystemProvider, R2StorageProvider } from "../storage";

const baseEnv = {
  PORT: "3000",
  NODE_ENV: "test",
  LOG_LEVEL: "fatal",
  CORS_ORIGINS: "http://localhost:5173",
};

describe("storage configuration", () => {
  it("selects local filesystem storage explicitly", () => {
    const provider = createStorageProvider(
      loadEnv({ ...baseEnv, STORAGE_PROVIDER: "local" }),
    );

    expect(provider).toBeInstanceOf(LocalFilesystemProvider);
  });

  it("selects R2 storage explicitly", () => {
    const provider = createStorageProvider(
      loadEnv({
        ...baseEnv,
        STORAGE_PROVIDER: "r2",
        R2_ACCOUNT_ID: "account-id",
        R2_ACCESS_KEY_ID: "access-key-id",
        R2_SECRET_ACCESS_KEY: "secret-access-key",
        R2_BUCKET: "markab-files",
      }),
    );

    expect(provider).toBeInstanceOf(R2StorageProvider);
  });

  it("fails without revealing secrets when R2 configuration is incomplete", () => {
    const loadIncompleteR2 = () =>
      loadEnv({
        ...baseEnv,
        STORAGE_PROVIDER: "r2",
        R2_ACCOUNT_ID: "account-id",
        R2_ACCESS_KEY_ID: "access-key-id",
        R2_SECRET_ACCESS_KEY: "secret-value-must-not-leak",
      });

    expect(loadIncompleteR2).toThrowError(
      /R2_BUCKET is required when STORAGE_PROVIDER=r2/,
    );

    try {
      loadIncompleteR2();
    } catch (error) {
      expect((error as Error).message).not.toContain(
        "secret-value-must-not-leak",
      );
    }
  });
});
