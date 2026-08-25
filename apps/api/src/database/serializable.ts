import { isTransactionConflictError } from "./errors";

export async function retrySerializable<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (isTransactionConflictError(error)) {
      return operation();
    }

    throw error;
  }
}
