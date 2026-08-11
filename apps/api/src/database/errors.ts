import { PrismaClientKnownRequestError } from "@workspace/db";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof PrismaClientKnownRequestError &&
    (error as PrismaClientKnownRequestError).code === "P2002"
  );
}

function isNotFoundError(error: unknown): boolean {
  return (
    error instanceof PrismaClientKnownRequestError &&
    (error as PrismaClientKnownRequestError).code === "P2025"
  );
}

function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof PrismaClientKnownRequestError &&
    (error as PrismaClientKnownRequestError).code === "P2003"
  );
}

export { isUniqueConstraintError, isNotFoundError, isForeignKeyError };
