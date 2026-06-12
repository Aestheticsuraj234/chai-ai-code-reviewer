/**
 * @module lib/actions/auth
 * @description Server Actions for authentication flows.
 *
 * Server Actions are async functions marked with `"use server"` that run on
 * the server but can be called from Client Components (e.g. form `action` props).
 * This file starts the GitHub OAuth flow via Better Auth.
 */

"use server";

import { auth } from "@/lib/auth";
import { getSafeCallbackPath } from "@/lib/auth-routes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Starts GitHub OAuth sign-in and redirects the browser to GitHub's consent screen.
 *
 * @description Typically bound to a sign-in form:
 * `<form action={signInWithGithub}>`. Reads an optional `callbackUrl` hidden
 * field, sanitizes it, then asks Better Auth for the provider authorization URL.
 * @param formData - Submitted form data; may contain a `callbackUrl` field.
 * @returns Never returns on success — `redirect()` sends the user to GitHub.
 */
export async function signInWithGithub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");
  // FormData values are `FormDataEntryValue`; we only accept string callbacks.
  const redirectTo = getSafeCallbackPath(
    typeof callbackUrl === "string" ? callbackUrl : null
  );

  const result = await auth.api.signInSocial({
    body: {
      provider: "github",
      callbackURL: redirectTo,
    },
    headers: await headers(),
  });

  // Better Auth returns the GitHub authorize URL; navigate the user there.
  if (result.url) {
    redirect(result.url);
  }
}
