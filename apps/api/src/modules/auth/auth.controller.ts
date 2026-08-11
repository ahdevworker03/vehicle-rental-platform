import type { Request, Response, NextFunction } from "express";
import {
  registerOrganization,
  login,
  getCurrentUser,
  rotateRefreshToken,
  revokeRefreshToken,
} from "./auth.service";
import { ok, created, noContent } from "../../shared";
import type { RegisterInput, LoginInput, RefreshInput, LogoutInput } from "./auth.validation";

async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as RegisterInput;
    const tokens = await registerOrganization(input.email, input.password, input.organizationName);
    created(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

async function loginHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as LoginInput;
    const tokens = await login(input.email, input.password);
    ok(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as RefreshInput;
    const tokens = await rotateRefreshToken(input.refreshToken);
    ok(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = req.body as LogoutInput;
    await revokeRefreshToken(input.refreshToken);
    noContent(res);
  } catch (err) {
    next(err);
  }
}

async function currentUser(req: Request, res: Response, _next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      ok(res, null);
      return;
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      ok(res, null);
      return;
    }

    const user = await getCurrentUser(parts[1]);
    ok(res, {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organization_id,
      createdAt: user.created_at.toISOString(),
    });
  } catch {
    ok(res, null);
  }
}

export { register, loginHandler as login, refresh, logout, currentUser };
