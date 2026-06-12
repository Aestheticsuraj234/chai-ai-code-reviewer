/**
 * Better Auth catch-all API route.
 *
 * Better Auth registers many auth endpoints (sign-in, sign-out, session, OAuth
 * callbacks, etc.) under a single dynamic segment. `toNextJsHandler` adapts
 * the auth instance to Next.js App Router `GET` and `POST` exports.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/** Handles all Better Auth HTTP methods at `/api/auth/*`. */
export const { POST, GET } = toNextJsHandler(auth);
