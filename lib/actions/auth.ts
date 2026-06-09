"use server";

import { auth } from "@/lib/auth";
import { getSafeCallbackPath } from "@/lib/auth-routes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGithub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");
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

  if (result.url) {
    redirect(result.url);
  }
}
