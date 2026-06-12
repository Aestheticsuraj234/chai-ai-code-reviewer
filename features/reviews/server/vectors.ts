/**
 * Pinecone vector operations for pull-request reviews.
 *
 * PR diffs are embedded in a dedicated namespace per pull request so search
 * only sees that PR's changes. Namespace format: `owner--repo--pr-{number}`.
 * This is separate from repo-sync namespaces (`owner--repo--codebase`) which
 * hold the full indexed codebase for broader context during review.
 */
import type { CodeChunk } from "@/features/reviews/types/review";
import { getPineconeIndex } from "@/features/pinecone/client";

/** How many semantically similar chunks to pull into the AI prompt */
const CONTEXT_RESULTS = 10;

/**
 * Builds the Pinecone namespace string for one pull request's diff chunks.
 *
 * Slashes in `owner/repo` become `--` because Pinecone namespace names
 * should stay simple and URL-safe.
 *
 * @param repoFullName - Repository in `owner/repo` form
 * @param prNumber - Pull request number
 * @returns Namespace id, e.g. `acme--web-app--pr-42`
 */
export function buildPrNamespace(repoFullName: string, prNumber: number) {
  return `${repoFullName.replace("/", "--")}--pr-${prNumber}`;
}

/**
 * Upserts PR code chunks into a Pinecone namespace.
 *
 * Pinecone integrated embedding reads each record's `text` field and stores
 * vectors with metadata (`filePath`) for display in search results.
 *
 * @param namespace - PR-specific namespace from `buildPrNamespace`
 * @param chunks - Output of `chunkPrFiles`
 * @returns Resolves when all records are upserted
 */
export async function saveChunksToPinecone(
  namespace: string,
  chunks: CodeChunk[]
) {
  const index = getPineconeIndex();

  const records = chunks.map((chunk) => ({
    id: chunk.id,
    text: chunk.text,
    filePath: chunk.filePath,
  }));

  // namespace() scopes vectors so this PR never mixes with repo-wide sync data
  await index.namespace(namespace).upsertRecords({ records });
}

/**
 * Semantic search over embedded PR (or repo) chunks.
 *
 * The query is typically the PR title — similar chunks from the namespace
 * are returned as formatted snippets for the LLM prompt.
 *
 * @param namespace - Pinecone namespace (PR or repo codebase)
 * @param query - Natural-language search text, e.g. PR title
 * @returns Human-readable snippets: `File: path\n{chunk text}`
 */
export async function searchPrContext(namespace: string, query: string) {
  const index = getPineconeIndex();

  const response = await index.namespace(namespace).searchRecords({
    query: { topK: CONTEXT_RESULTS, inputs: { text: query } },
  });

  const snippets: string[] = [];

  for (const hit of response.result.hits) {
    const fields = hit.fields as { text?: string; filePath?: string };
    if (!fields.text) {
      continue;
    }

    snippets.push(`File: ${fields.filePath}\n${fields.text}`);
  }

  return snippets;
}
