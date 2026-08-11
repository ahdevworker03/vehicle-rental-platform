import type { AccessTokenPayload } from "../modules/auth";

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export {};
