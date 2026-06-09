import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { getGithubApp } from "@/features/github/utils/github-app";
import { prisma } from "@/lib/db";

export async function getInstallationStatus(
  userId: string
): Promise<GithubInstallationStatus> {
  const installation = await prisma.githubInstallation.findUnique({
    where: { userId },
  });

  if (!installation) {
    return { connected: false, accountLogin: null, installedAt: null };
  }

  return {
    connected: true,
    accountLogin: installation.accountLogin,
    installedAt: installation.createdAt.toISOString(),
  };
}

export async function saveInstallation(userId: string, installationId: number) {
  const app = getGithubApp();
  const { data } = await app.octokit.request(
    "GET /app/installations/{installation_id}",
    { installation_id: installationId }
  );

  const account = data.account;
  const accountLogin =
    account && "login" in account ? account.login : account?.slug ?? null;

  await prisma.githubInstallation.upsert({
    where: { userId },
    create: {
      userId,
      installationId,
      accountLogin,
      accountType: data.target_type ?? null,
    },
    update: {
      installationId,
      accountLogin,
      accountType: data.target_type ?? null,
    },
  });
}

export async function deleteInstallation(userId: string) {
  await prisma.githubInstallation.delete({ where: { userId } });
}

export async function getUserInstallationId(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: { userId },
    select: { installationId: true },
  });

  return installation?.installationId ?? null;
}
