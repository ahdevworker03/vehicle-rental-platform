import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageObjectNotFoundError } from "./storage-errors";
import type { StorageProvider } from "./storage-provider";

export interface R2StorageProviderOptions {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

function isNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { name, $metadata } = error as {
    name?: unknown;
    $metadata?: { httpStatusCode?: unknown };
  };

  return name === "NoSuchKey" || $metadata?.httpStatusCode === 404;
}

export class R2StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(options: R2StorageProviderOptions) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${options.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: options.accessKeyId,
        secretAccessKey: options.secretAccessKey,
      },
    });
    this.bucket = options.bucket;
  }

  async store(key: string, data: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      }),
    );
  }

  async retrieve(key: string): Promise<Buffer> {
    try {
      const response = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );

      if (!response.Body) {
        throw new Error("R2 returned an object without a body.");
      }

      return Buffer.from(await response.Body.transformToByteArray());
    } catch (error) {
      if (isNotFound(error)) {
        throw new StorageObjectNotFoundError();
      }

      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
