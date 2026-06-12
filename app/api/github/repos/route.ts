/**
 * Paginated GitHub repositories API for the dashboard Repositories page.
 *
 * Authenticated users with a connected GitHub App can fetch installation repos
 * page by page. Each repo is enriched with codebase sync status from our DB.
 */

import { getUserInstallationId } from "@/features/github/server/installation";
import { getInstallationReposPage } from "@/features/github/server/repos";
import { getRepoSyncStatuses } from "@/features/repo-sync/server/sync-status";
import { getServerSession } from "@/lib/auth-session";
import { NextResponse } from "next/server";

/**
 * Returns one page of repositories for the user's GitHub App installation.
 *
 * Query params:
 * - `page` (optional, default 1) — 1-based page number for infinite scroll.
 *
 * @param request - Incoming GET with optional `?page=` search param.
 * @returns JSON with repos, pagination flags, and sync status per repo.
 */
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
  // Clamp to at least page 1 — invalid values become NaN and get corrected
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const data = await getInstallationReposPage(installationId, page);

  // Batch-load sync status for all repos on this page in one query
  const repoFullNames = data.repos.map((repo) => repo.fullName);
  const syncStatuses = await getRepoSyncStatuses(repoFullNames);

  const repos = data.repos.map((repo) => ({
    ...repo,
    syncStatus: syncStatuses[repo.fullName] ?? null,
  }));

  return NextResponse.json({ ...data, repos });
}
