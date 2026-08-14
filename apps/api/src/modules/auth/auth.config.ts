const JWT_SECRET = process.env["JWT_SECRET"];
const REFRESH_TOKEN_SECRET = process.env["REFRESH_TOKEN_SECRET"];

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required but was not provided.",
  );
}

if (!REFRESH_TOKEN_SECRET) {
  throw new Error(
    "REFRESH_TOKEN_SECRET environment variable is required but was not provided.",
  );
}

export const authConfig = {
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  JWT_ALGORITHM: "HS256" as const,
  JWT_ISSUER: "vehicle-rental-platform",
  JWT_AUDIENCE: "vehicle-rental-api",
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY_MS: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  REFRESH_TOKEN_LENGTH: 64, // bytes for crypto.randomBytes
};
