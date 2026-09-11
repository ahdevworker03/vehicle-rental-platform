const VALID_NODE_ENVS = ["development", "production", "test"] as const;

const VALID_LOG_LEVELS = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;

const VALID_STORAGE_PROVIDERS = ["local", "r2"] as const;

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "https://x1gtk7w1-5173.uks1.devtunnels.ms",
] as const;

type NodeEnv = (typeof VALID_NODE_ENVS)[number];
type LogLevel = (typeof VALID_LOG_LEVELS)[number];
type StorageProviderName = (typeof VALID_STORAGE_PROVIDERS)[number];

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

export interface EnvConfig {
  PORT: number;
  NODE_ENV: NodeEnv;
  LOG_LEVEL: LogLevel;
  CORS_ORIGINS: string[];
  STORAGE_PROVIDER: StorageProviderName;
  STORAGE_DIR?: string;
  R2?: R2Config;
}

function parseCorsOrigins(rawOrigins: string | undefined): string[] {
  const origins = rawOrigins
    ? rawOrigins
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [...DEFAULT_CORS_ORIGINS];

  if (origins.length === 0) {
    throw new Error("CORS_ORIGINS must include at least one origin.");
  }

  for (const origin of origins) {
    try {
      const url = new URL(origin);
      if (
        url.origin !== origin ||
        !["http:", "https:"].includes(url.protocol)
      ) {
        throw new Error();
      }
    } catch {
      throw new Error(`Invalid CORS origin: "${origin}"`);
    }
  }

  return origins;
}

function requiredR2Value(environment: NodeJS.ProcessEnv, name: string): string {
  const value = environment[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required when STORAGE_PROVIDER=r2.`);
  }

  return value;
}

export function loadEnv(
  environment: NodeJS.ProcessEnv = process.env,
): EnvConfig {
  const rawPort = environment["PORT"];

  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const nodeEnv = environment["NODE_ENV"] ?? "development";

  if (!VALID_NODE_ENVS.includes(nodeEnv as NodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV value: "${nodeEnv}". Must be one of: ${VALID_NODE_ENVS.join(", ")}`,
    );
  }

  const logLevel = (environment["LOG_LEVEL"] ?? "info") as LogLevel;

  if (!VALID_LOG_LEVELS.includes(logLevel)) {
    throw new Error(
      `Invalid LOG_LEVEL value: "${logLevel}". Must be one of: ${VALID_LOG_LEVELS.join(", ")}`,
    );
  }

  const storageProvider = (environment["STORAGE_PROVIDER"] ??
    "local") as StorageProviderName;

  if (!VALID_STORAGE_PROVIDERS.includes(storageProvider)) {
    throw new Error(
      `Invalid STORAGE_PROVIDER value: "${storageProvider}". Must be one of: ${VALID_STORAGE_PROVIDERS.join(", ")}`,
    );
  }

  const r2 =
    storageProvider === "r2"
      ? {
          accountId: requiredR2Value(environment, "R2_ACCOUNT_ID"),
          accessKeyId: requiredR2Value(environment, "R2_ACCESS_KEY_ID"),
          secretAccessKey: requiredR2Value(environment, "R2_SECRET_ACCESS_KEY"),
          bucket: requiredR2Value(environment, "R2_BUCKET"),
        }
      : undefined;

  return {
    PORT: port,
    NODE_ENV: nodeEnv as NodeEnv,
    LOG_LEVEL: logLevel,
    CORS_ORIGINS: parseCorsOrigins(environment["CORS_ORIGINS"]),
    STORAGE_PROVIDER: storageProvider,
    STORAGE_DIR: environment["STORAGE_DIR"],
    R2: r2,
  };
}

export const env = loadEnv();
