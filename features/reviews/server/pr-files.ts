/**
 * Fetches changed files from a GitHub pull request.
 *
 * Part of the review pipeline's "fetch" phase: before chunking and embedding,
 * we need the unified diff (`patch`) for each file in the PR. This module
 * authenticates as the GitHub App installation and calls the pulls/files API.
 */
import type { PrFile } from "@/features/reviews/types/review";
import { getGithubApp } from "@/features/github/utils/github-app";
import { splitRepoFullName } from "@/features/reviews/utils/repo-name";

/** GitHub paginates file lists; 100 is enough for most classroom-sized PRs */
const FILES_PER_PAGE = 100;

/**
 * Downloads all reviewable files from a pull request.
 *
 * Returns only entries that include a `patch` (text diffs). Binary files,
 * renames without content, and some generated assets have no patch and are
 * skipped — there is nothing meaningful for the AI to review.
 *
 * @param installationId - GitHub App installation id (from webhook / DB)
 * @param repoFullName - Repository in `owner/repo` form
 * @param prNumber - Pull request number on GitHub
 * @returns Array of `{ filePath, patch }` objects ready for `chunkPrFiles`
 */
export async function getPullRequestFiles(
  installationId: number,
  repoFullName: string,
  prNumber: number
): Promise<PrFile[]> {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const { owner, repo } = splitRepoFullName(repoFullName);

  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}/files",
    { owner, repo, pull_number: prNumber, per_page: FILES_PER_PAGE }
  );

  const files: PrFile[] = [];

  for (const file of data) {
    // Binary files (images, lock files etc.) have no patch to review
    if (!file.patch) {
      continue;
    }

    files.push({ filePath: file.filename, patch: file.patch });
  }

  return files;
}
