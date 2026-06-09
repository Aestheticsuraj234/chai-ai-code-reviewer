import {
  DEFAULT_AUTH_CALLBACK,
  isAuthPath,
  isPublicPath,
  SIGN_IN_PATH,
} from "@/lib/auth-routes";
import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

function redirectToSignIn(request: NextRequest, pathname: string) {
  const signInUrl = new URL(SIGN_IN_PATH, request.url);
  signInUrl.searchParams.set(
    "callbackUrl",
    `${pathname}${request.nextUrl.search}`
  );
  return NextResponse.redirect(signInUrl);
}

export async function handleAuthProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = getSessionCookie(request);

  if (isAuthPath(pathname) && session) {
    return NextResponse.redirect(new URL(DEFAULT_AUTH_CALLBACK, request.url));
  }

  if (isAuthPath(pathname)) {
    return NextResponse.next();
  }

  if (!session) {
    return redirectToSignIn(request, pathname);
  }

  return NextResponse.next();
}
