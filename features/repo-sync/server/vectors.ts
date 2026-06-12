/**
 * Pinecone vector operations for repository codebase sync.
 *
 * Unlike PR review vectors (one namespace per PR), repo sync uses a single
 * long-lived namespace per repository (`buildRepoNamespace`). Re-syncs delete
 * the old namespace first so stale files do not pollute search results.
 */
import type { CodeChunk } from "@/features/reviews/types/review";
import { getPineconeIndex } from "@/features/pinecone/client";

// Pinecone allows at most 96 records per upsert when using integrated embedding
const UPSERT_BATCH_SIZE = 90;

/**
 * Removes all vectors in a repo's codebase namespace.
 *
 * Called before a re-sync so embeddings always match the latest tree snapshot.
 *
 * @param namespace - Repo namespace from `buildRepoNamespace`
 * @returns Resolves when Pinecone deletes the namespace
 */
export async function deleteRepoNamespace(namespace: string) {
  const index = getPineconeIndex();
  await index.deleteNamespace(namespace);
}

/**
 * Upserts repo code chunks in batches to respect Pinecone limits.
 *
 * Large repos may produce hundreds of chunks; batching avoids API errors and
 * keeps each upsert within integrated-embedding record caps.
 *
 * @param namespace - Repo namespace from `buildRepoNamespace`
 * @param chunks - Output of `chunkRepoFiles`
 * @returns Resolves when all batches are upserted
 */
export async function saveRepoChunks(namespace: string, chunks: CodeChunk[]) {
  const index = getPineconeIndex();

  for (let start = 0; start < chunks.length; start += UPSERT_BATCH_SIZE) {
    const batch = chunks.slice(start, start + UPSERT_BATCH_SIZE);

    const records = batch.map((chunk) => ({
      id: chunk.id,
      text: chunk.text,
      filePath: chunk.filePath,
    }));

    await index.namespace(namespace).upsertRecords({ records });
  }
}
