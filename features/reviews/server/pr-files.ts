import type { PrFile } from "@/features/reviews/types/review";
import { getGithubApp } from "@/features/github/utils/github-app";
import { splitRepoFullName } from "@/features/reviews/utils/repo-name";

const FILES_PER_PAGE = 100;

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
