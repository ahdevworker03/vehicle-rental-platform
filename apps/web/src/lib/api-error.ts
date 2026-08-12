import { ApiError } from "@workspace/api-client-react";

export interface ApiErrorMessage {
  title: string;
  description?: string;
}

interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
  };
}

function extractBody(error: unknown): ApiErrorBody | null {
  if (error instanceof ApiError) {
    return (error.data ?? null) as ApiErrorBody | null;
  }
  return null;
}

export function getApiErrorMessage(error: unknown): ApiErrorMessage {
  if (error instanceof ApiError) {
    const body = extractBody(error);

    if (body?.error?.message) {
      return { title: body.error.message };
    }

    if (error.status >= 500) {
      return { title: "حدث خطأ غير متوقع. حاول مرة أخرى لاحقًا." };
    }

    if (error.status === 401) {
      return { title: "انتهت الجلسة. سجّل الدخول مرة أخرى." };
    }

    if (error.status === 403) {
      return { title: "ليس لديك صلاحية لتنفيذ هذا الإجراء." };
    }

    return { title: error.message || "حدث خطأ في الاتصال." };
  }

  return { title: "حدث خطأ في الاتصال بالخادم." };
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
