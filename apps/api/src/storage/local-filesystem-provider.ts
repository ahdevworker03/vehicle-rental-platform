import { mkdir, writeFile, readFile, unlink, access } from "node:fs/promises";
import { resolve, normalize, sep } from "node:path";
import type { StorageProvider } from "./storage-provider";

export class LocalFilesystemProvider implements StorageProvider {
  private readonly root: string;

  constructor(rootDir: string) {
    this.root = resolve(rootDir);
  }

  private resolvePath(key: string): string {
    const normalized = normalize(key);
    const resolved = resolve(this.root, normalized);
    const withinRoot = resolved.startsWith(this.root + sep) || resolved === this.root;

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
    await access(filePath);
    return readFile(filePath);
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
