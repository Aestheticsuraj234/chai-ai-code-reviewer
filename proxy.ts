import { handleAuthProxy } from "@/lib/auth-proxy";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return handleAuthProxy(request);
}

export const config = {
  matcher: ["/sign-in", "/dashboard", "/dashboard/:path*"],
};
