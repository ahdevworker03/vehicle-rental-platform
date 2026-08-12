export interface StorageProvider {
  store(key: string, data: Buffer, contentType: string): Promise<void>;
  getUrl(key: string): Promise<string>;
  retrieve(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
