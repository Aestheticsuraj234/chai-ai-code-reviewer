"use server";

import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { deleteInstallation } from "@/features/github/server/installation";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export async function disconnectGithubApp() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  await deleteInstallation(session.user.id);
  redirect(DASHBOARD_ROUTES.github);
}
