import { mkdir, writeFile, readFile, unlink } from "node:fs/promises";
import { resolve, normalize, sep } from "node:path";
import type { StorageProvider } from "./storage-provider";
import { StorageObjectNotFoundError } from "./storage-errors";

export class LocalFilesystemProvider implements StorageProvider {
  private readonly root: string;

  constructor(rootDir: string) {
    this.root = resolve(rootDir);
  }

  private resolvePath(key: string): string {
    const normalized = normalize(key);
    const resolved = resolve(this.root, normalized);
    const withinRoot =
      resolved.startsWith(this.root + sep) || resolved === this.root;

    if (!withinRoot) {
      throw new Error("Storage key escapes the storage root.");
    }

    return resolved;
  }

  private async ensureDir(filePath: string): Promise<void> {
    await mkdir(resolve(filePath, ".."), { recursive: true });
  }

  async store(key: string, data: Buffer, _contentType: string): Promise<void> {
    const filePath = this.resolvePath(key);
    await this.ensureDir(filePath);
    await writeFile(filePath, data);
  }

  async getUrl(key: string): Promise<string> {
    const filePath = this.resolvePath(key);
    return `file://${filePath}`;
  }

  async retrieve(key: string): Promise<Buffer> {
    const filePath = this.resolvePath(key);
    try {
      return await readFile(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new StorageObjectNotFoundError();
      }

      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    try {
      await unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        throw err;
      }
    }
  }
}
