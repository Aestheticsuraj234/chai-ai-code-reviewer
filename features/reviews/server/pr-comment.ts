/**
 * Posts the AI-generated review back to GitHub as a PR comment.
 *
 * Final delivery step in the webhook → review pipeline: after Inngest finishes
 * chunking, searching Pinecone, and calling the LLM, this module publishes the
 * markdown review on the pull request so authors see it in GitHub's UI.
 */
import { getGithubApp } from "@/features/github/utils/github-app";
import { splitRepoFullName } from "@/features/reviews/utils/repo-name";

/**
 * Creates an issue comment on a pull request (GitHub treats PRs as issues).
 *
 * @param installationId - GitHub App installation id for API authentication
 * @param repoFullName - Repository in `owner/repo` form
 * @param prNumber - Pull request number (same as issue number on GitHub)
 * @param body - Markdown review text from `generateReview`
 * @returns Resolves when the comment is created on GitHub
 */
export async function postPrComment(
  installationId: number,
  repoFullName: string,
  prNumber: number,
  body: string
) {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const { owner, repo } = splitRepoFullName(repoFullName);

  await octokit.request(
    "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
    { owner, repo, issue_number: prNumber, body }
  );
}
