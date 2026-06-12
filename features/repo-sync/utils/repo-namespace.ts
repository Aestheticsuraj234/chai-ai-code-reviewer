/**
 * Pinecone namespace naming for full-repository sync.
 *
 * Repo-wide vectors use a different namespace than PR diff vectors so
 * semantic search never mixes "everything in main" with "only this PR's patch".
 * Format: `owner--repo--codebase` (slash replaced for safe namespace ids).
 */

/**
 * Builds the Pinecone namespace for a synced repository branch.
 *
 * @param repoFullName - Repository in `owner/repo` form
 * @returns Namespace id, e.g. `acme--web-app--codebase`
 */
export function buildRepoNamespace(repoFullName: string) {
  return `${repoFullName.replace("/", "--")}--codebase`;
}
