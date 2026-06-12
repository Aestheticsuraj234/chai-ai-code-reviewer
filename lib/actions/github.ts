/**
 * @module lib/actions/github
 * @description Server Actions for GitHub App integration in the dashboard.
 *
 * These actions bridge the UI to feature code under `features/github/`. They
 * enforce authentication before mutating installation data stored for the user.
 */

"use server";

import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { deleteInstallation } from "@/features/github/server/installation";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

/**
 * Disconnects the signed-in user's GitHub App installation from this product.
 *
 * @description Removes the installation record and related linkage so the user
 * must reconnect the GitHub App to sync repos again. Redirects guests to
 * sign-in and returns everyone else to the GitHub settings page.
 * @returns Never returns normally — ends with `redirect()` to the GitHub dashboard tab.
 */
export async function disconnectGithubApp() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  await deleteInstallation(session.user.id);
  redirect(DASHBOARD_ROUTES.github);
}
