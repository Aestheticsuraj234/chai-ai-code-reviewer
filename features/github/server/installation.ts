/**
 * Persists GitHub App installation data for each user.
 *
 * When someone installs our GitHub App, GitHub gives us an `installationId`.
 * We save that id in the database so later we can call the GitHub API on their behalf
 * and route incoming webhooks back to the right user.
 *
 * @module features/github/server/installation
 */

import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import { getGithubApp } from "@/features/github/utils/github-app";
import { prisma } from "@/lib/db";

/**
 * Pulls a display name from a GitHub account object.
 * User accounts use `login`; organization accounts may use `slug`.
 */
function getAccountLogin(
  account: { login?: string; slug?: string } | null | undefined
): string | null {
  if (!account) {
    return null;
  }

  if ("login" in account && account.login) {
    return account.login;
  }

  if (account.slug) {
    return account.slug;
  }

  return null;
}

/** Default shape when the user has not connected GitHub yet. */
function buildDisconnectedStatus(): GithubInstallationStatus {
  return { connected: false, accountLogin: null, installedAt: null };
}

/**
 * Reads whether the current user has installed the GitHub App.
 *
 * @param userId - The logged-in user's id in our database.
 * @returns Connection status including GitHub account login and install timestamp.
 */
export async function getInstallationStatus(
  userId: string
): Promise<GithubInstallationStatus> {
  const installation = await prisma.githubInstallation.findUnique({
    where: { userId },
  });

  if (!installation) {
    return buildDisconnectedStatus();
  }

  return {
    connected: true,
    accountLogin: installation.accountLogin,
    installedAt: installation.createdAt.toISOString(),
  };
}

/**
 * Saves or updates a GitHub App installation after the user completes the install flow.
 *
 * We call the GitHub API with our App credentials to fetch installation details
 * (account name, target type) before writing them to the database.
 *
 * @param userId - The user who just installed the app.
 * @param installationId - Numeric id GitHub assigns to this installation.
 * @returns Resolves when the row is upserted in `githubInstallation`.
 */
export async function saveInstallation(userId: string, installationId: number) {
  const app = getGithubApp();
  // Octokit uses the App JWT here — no user OAuth token needed for this endpoint.
  const { data } = await app.octokit.request(
    "GET /app/installations/{installation_id}",
    { installation_id: installationId }
  );

  const accountLogin = getAccountLogin(data.account);

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

/**
 * Removes the stored installation when the user disconnects or uninstalls the app.
 *
 * @param userId - The user whose installation row should be deleted.
 * @returns Resolves when the database row is removed.
 */
export async function deleteInstallation(userId: string) {
  await prisma.githubInstallation.delete({ where: { userId } });
}

/**
 * Looks up our user id from a GitHub installation id.
 *
 * Webhooks only include `installation.id` from GitHub — this bridges that id
 * back to the user who owns the connection in our app.
 *
 * @param installationId - GitHub's installation id from a webhook or API response.
 * @returns Our `userId`, or `null` if we have no record for that installation.
 */
export async function getUserIdByInstallationId(installationId: number) {
  const installation = await prisma.githubInstallation.findFirst({
    where: { installationId },
    select: { userId: true },
  });

  if (!installation) {
    return null;
  }

  return installation.userId;
}

/**
 * Returns the GitHub installation id for a user, if they have connected GitHub.
 *
 * Other features (e.g. listing repos) need this id to get an installation-scoped Octokit client.
 *
 * @param userId - The logged-in user's id.
 * @returns GitHub `installationId`, or `null` when GitHub is not connected.
 */
export async function getUserInstallationId(userId: string) {
  const installation = await prisma.githubInstallation.findUnique({
    where: { userId },
    select: { installationId: true },
  });

  if (!installation) {
    return null;
  }

  return installation.installationId;
}
