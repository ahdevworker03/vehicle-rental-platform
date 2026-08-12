import { resolve } from "node:path";
import { LocalFilesystemProvider } from "../storage";

const DEFAULT_STORAGE_DIR = "./storage";

const storageDir = process.env["STORAGE_DIR"] || DEFAULT_STORAGE_DIR;

export const storageProvider = new LocalFilesystemProvider(resolve(storageDir));
