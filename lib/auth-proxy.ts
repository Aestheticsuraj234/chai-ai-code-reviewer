import { auth } from "@/lib/auth";
import {
  getSafeCallbackPath,
  isAuthPath,
  isPublicPath,
  SIGN_IN_PATH,
} from "@/lib/auth-routes";
import { NextRequest, NextResponse } from "next/server";

function redirectToSignIn(request: NextRequest, pathname: string) {
  const signInUrl = new URL(SIGN_IN_PATH, request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(signInUrl);
}

function getPostAuthRedirectPath(request: NextRequest): string {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  return getSafeCallbackPath(callbackUrl);
}

export async function handleAuthProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (isAuthPath(pathname)) {
    if (session) {
      const redirectPath = getPostAuthRedirectPath(request);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return NextResponse.next();
  }

  if (!session) {
    return redirectToSignIn(request, pathname);
  }

  return NextResponse.next();
}
