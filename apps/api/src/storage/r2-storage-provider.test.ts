import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: class {
    send = send;
  },
  PutObjectCommand: class {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  },
  GetObjectCommand: class {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  },
  DeleteObjectCommand: class {
    input: unknown;

    constructor(input: unknown) {
      this.input = input;
    }
  },
}));

import { R2StorageProvider } from "./r2-storage-provider";
import { StorageObjectNotFoundError } from "./storage-errors";

const bucket = "markab-files";
const key = "organization/vehicle/file.pdf";

describe("R2StorageProvider", () => {
  beforeEach(() => {
    send.mockReset();
  });

  function provider(): R2StorageProvider {
    return new R2StorageProvider({
      accountId: "account-id",
      accessKeyId: "access-key-id",
      secretAccessKey: "secret-access-key",
      bucket,
    });
  }

  it("stores the original bytes with their content type", async () => {
    const body = Buffer.from("file content");
    send.mockResolvedValue({});

    await provider().store(key, body, "application/pdf");

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: {
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: "application/pdf",
        },
      }),
    );
  });

  it("returns the retrieved object bytes as a Buffer", async () => {
    send.mockResolvedValue({
      Body: {
        transformToByteArray: vi
          .fn()
          .mockResolvedValue(Uint8Array.from([1, 2, 3])),
      },
    });

    await expect(provider().retrieve(key)).resolves.toEqual(
      Buffer.from([1, 2, 3]),
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ input: { Bucket: bucket, Key: key } }),
    );
  });

  it("maps a missing R2 object to StorageObjectNotFoundError", async () => {
    send.mockRejectedValue(
      Object.assign(new Error("not found"), { name: "NoSuchKey" }),
    );

    await expect(provider().retrieve(key)).rejects.toBeInstanceOf(
      StorageObjectNotFoundError,
    );
  });

  it("preserves unexpected R2 errors", async () => {
    const failure = new Error("R2 unavailable");
    send.mockRejectedValue(failure);

    await expect(provider().retrieve(key)).rejects.toBe(failure);
  });

  it("deletes the requested object", async () => {
    send.mockResolvedValue({});

    await provider().delete(key);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ input: { Bucket: bucket, Key: key } }),
    );
  });
});
