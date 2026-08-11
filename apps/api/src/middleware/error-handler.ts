import type { Request, Response, NextFunction } from "express";
import { logger } from "../config";
import { AppError } from "../shared";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "NOT_FOUND", "The requested resource was not found."));
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  logger.error({ err }, "Unhandled error");

  const isProduction = process.env["NODE_ENV"] === "production";

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: isProduction
        ? "An unexpected error occurred."
        : err.message,
    },
  });
}
