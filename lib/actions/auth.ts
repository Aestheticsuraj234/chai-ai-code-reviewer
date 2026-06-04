"use server";

import { auth } from "@/lib/auth";
import { DEFAULT_AUTH_CALLBACK } from "@/lib/auth-routes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signInWithGithub() {
  const result = await auth.api.signInSocial({
    body: {
      provider: "github",
      callbackURL: DEFAULT_AUTH_CALLBACK,
    },
    headers: await headers(),
  });

  if (result.url) {
    redirect(result.url);
  }
}
