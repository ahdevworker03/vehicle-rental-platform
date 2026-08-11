import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth";
import { prisma } from "../database";
import { AppError } from "../shared";

async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required.");
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new AppError(401, "INVALID_TOKEN_FORMAT", "Authorization header must use Bearer scheme.");
    }

    const payload = verifyAccessToken(parts[1]);

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, deleted_at: true },
    });

    if (!user) {
      throw new AppError(401, "USER_NOT_FOUND", "Authenticated user no longer exists.");
    }

    if (user.deleted_at) {
      throw new AppError(401, "ACCOUNT_DEACTIVATED", "This account has been deactivated.");
    }

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }

    next(new AppError(401, "INVALID_TOKEN", "The access token is invalid or expired."));
  }
}

function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, "AUTHENTICATION_REQUIRED", "Authentication is required."));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, "INSUFFICIENT_PERMISSIONS", "You do not have permission to perform this action."));
      return;
    }

    next();
  };
}

export { authenticate, requireRole };
