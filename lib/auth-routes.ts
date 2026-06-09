export const SIGN_IN_PATH = "/sign-in" as const;
export const DEFAULT_AUTH_CALLBACK = "/dashboard" as const;

export function getSafeCallbackPath(
  callbackUrl: string | null | undefined
): string {
  if (!callbackUrl) {
    return DEFAULT_AUTH_CALLBACK;
  }

  if (callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }

  return DEFAULT_AUTH_CALLBACK;
}

/** Routes accessible without a session */
export const PUBLIC_PATHS = ["/"] as const;

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname === `${path}/`
  );
}

export function isAuthPath(pathname: string): boolean {
  return (
    pathname === SIGN_IN_PATH || pathname.startsWith(`${SIGN_IN_PATH}/`)
  );
}
