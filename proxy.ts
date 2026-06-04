import { handleAuthProxy } from "@/lib/auth-proxy";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return handleAuthProxy(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
