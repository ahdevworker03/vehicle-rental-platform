import jwt from "jsonwebtoken";
import { authConfig } from "./auth.config";
import type { AccessTokenPayload } from "./auth.types";

function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, authConfig.JWT_SECRET, {
    algorithm: authConfig.JWT_ALGORITHM,
    issuer: authConfig.JWT_ISSUER,
    audience: authConfig.JWT_AUDIENCE,
    expiresIn: "15m" as const,
  });
}

function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, authConfig.JWT_SECRET, {
    algorithms: [authConfig.JWT_ALGORITHM],
    issuer: authConfig.JWT_ISSUER,
    audience: authConfig.JWT_AUDIENCE,
  });

  if (typeof decoded === "string") {
    throw new Error("Unexpected string token payload");
  }

  return {
    sub: decoded.sub as string,
    org: decoded.org as string,
    role: decoded.role as string,
  };
}

export { generateAccessToken, verifyAccessToken };
