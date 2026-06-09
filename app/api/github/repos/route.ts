import { getUserInstallationId } from "@/features/github/server/installation";
import { getInstallationReposPage } from "@/features/github/server/repos";
import { getServerSession } from "@/lib/auth-session";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const installationId = await getUserInstallationId(session.user.id);

  if (!installationId) {
    return NextResponse.json({ error: "GitHub App not connected" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const data = await getInstallationReposPage(installationId, page);

  return NextResponse.json(data);
}
