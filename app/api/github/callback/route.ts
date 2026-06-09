import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { saveInstallation } from "@/features/github/server/installation";
import { getServerSession } from "@/lib/auth-session";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get("installation_id");
  const session = await getServerSession();

  if (!session) {
    const callbackUrl = installationId
      ? `/api/github/callback?installation_id=${installationId}`
      : DASHBOARD_ROUTES.github;
    redirect(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (installationId) {
    await saveInstallation(session.user.id, Number(installationId));
  }

  redirect(DASHBOARD_ROUTES.github);
}
