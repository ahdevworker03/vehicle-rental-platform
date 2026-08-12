import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { getAccessToken } from "@/lib/auth-token";

/**
 * Base URL for the API.
 *
 * The generated client already prefixes request paths with `/api`, so this
 * should be the API origin only (e.g. `http://localhost:3000`), or empty to
 * use the same origin as the application.
 */
const DEFAULT_API_ORIGIN = "";

export function configureApiClient(): void {
  const apiOrigin = import.meta.env.VITE_API_URL || DEFAULT_API_ORIGIN;
  setBaseUrl(apiOrigin);
  setAuthTokenGetter(() => getAccessToken());
}
