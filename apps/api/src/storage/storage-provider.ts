export interface StorageProvider {
  store(key: string, data: Buffer, contentType: string): Promise<void>;
  retrieve(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
