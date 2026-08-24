import jwt from "jsonwebtoken";
import { authConfig } from "./auth.config";
import type { AccessTokenPayload } from "./auth.types";

const userRoles = ["PLATFORM_OWNER", "OWNER", "EMPLOYEE"] as const;

function isUserRole(role: unknown): role is AccessTokenPayload["role"] {
  return userRoles.some((userRole) => userRole === role);
}

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

  if (
    typeof decoded.sub !== "string" ||
    typeof decoded.org !== "string" ||
    !isUserRole(decoded.role)
  ) {
    throw new Error("Unexpected token payload");
  }

  return {
    sub: decoded.sub,
    org: decoded.org,
    role: decoded.role,
  };
}

export { generateAccessToken, verifyAccessToken };
