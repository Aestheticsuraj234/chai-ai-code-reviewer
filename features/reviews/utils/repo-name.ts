/**
 * GitHub repository name helpers for the review pipeline.
 *
 * GitHub APIs expect `owner` and `repo` as separate path segments, but we store
 * `repoFullName` as `"owner/repo"` in the database and Pinecone namespaces.
 */

/**
 * Splits a GitHub `owner/repo` string into its two parts.
 *
 * @param repoFullName - Full repository name, e.g. `"vercel/next.js"`
 * @returns Owner and repository slug for Octokit requests
 */
export function splitRepoFullName(repoFullName: string) {
  const [owner, repo] = repoFullName.split("/");
  return { owner, repo };
}
