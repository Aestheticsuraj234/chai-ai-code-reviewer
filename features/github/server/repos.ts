/**
 * Fetches repositories visible to a GitHub App installation.
 *
 * Uses Octokit's installation-scoped client — GitHub issues a short-lived token
 * for that installation, so we can list repos without storing user OAuth tokens.
 *
 * @module features/github/server/repos
 */

import type { GithubRepo } from "@/features/github/types/github";
import { getGithubApp } from "@/features/github/utils/github-app";

/** GitHub allows up to 100 repos per page on the installation repositories endpoint. */
const REPOS_PER_PAGE = 100;

/** Maps GitHub's `private` boolean to our simpler `visibility` field. */
function getRepoVisibility(isPrivate?: boolean): GithubRepo["visibility"] {
  if (isPrivate) {
    return "private";
  }

  return "public";
}

/** One page of repos plus pagination metadata for infinite scroll UI. */
export type InstallationReposPage = {
  repos: GithubRepo[];
  totalCount: number;
  page: number;
  hasMore: boolean;
};

/** Normalizes a raw GitHub API repo object into our app's `GithubRepo` shape. */
function mapRepo(repo: {
  id: number;
  name: string;
  full_name: string;
  private?: boolean;
  default_branch?: string;
  updated_at?: string | null;
  language?: string | null;
  stargazers_count?: number | null;
}): GithubRepo {
  return {
    id: String(repo.id),
    name: repo.name,
    fullName: repo.full_name,
    visibility: getRepoVisibility(repo.private),
    defaultBranch: repo.default_branch ?? "main",
    updatedAt: repo.updated_at ?? new Date().toISOString(),
    language: repo.language ?? null,
    stars: repo.stargazers_count ?? 0,
  };
}

/**
 * Loads one page of repositories for a GitHub App installation.
 *
 * @param installationId - GitHub installation id (from our `githubInstallation` table).
 * @param page - 1-based page number for GitHub pagination.
 * @returns Repos on this page, total count, and whether another page exists.
 */
export async function getInstallationReposPage(
  installationId: number,
  page = 1
): Promise<InstallationReposPage> {
  const app = getGithubApp();
  // `getInstallationOctokit` exchanges the App JWT for an installation access token.
  const octokit = await app.getInstallationOctokit(installationId);
  const { data } = await octokit.request("GET /installation/repositories", {
    per_page: REPOS_PER_PAGE,
    page,
  });

  const totalCount = data.total_count;
  const repos = data.repositories.map(mapRepo);

  return {
    repos,
    totalCount,
    page,
    hasMore: page * REPOS_PER_PAGE < totalCount,
  };
}
