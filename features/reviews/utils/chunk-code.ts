/**
 * Chunking utilities for pull-request diffs.
 *
 * Before we embed PR changes in Pinecone, we split each file's patch into
 * smaller pieces. Embedding models work best on bounded text size, and smaller
 * chunks improve semantic search precision when the AI asks "what changed here?"
 */
import type { CodeChunk, PrFile } from "@/features/reviews/types/review";

/** Max lines per chunk — keeps each vector under typical embedding limits */
const MAX_CHUNK_LINES = 80;

/**
 * Builds a stable Pinecone record id for one chunk of a PR file.
 *
 * @param prNumber - Pull request number from GitHub
 * @param filePath - Repository-relative file path
 * @param part - Zero-based chunk index within the file
 * @returns Unique id, e.g. `pr-12--src/app.ts--part-0`
 */
function buildChunkId(prNumber: number, filePath: string, part: number) {
  return `pr-${prNumber}--${filePath}--part-${part}`;
}

/**
 * Splits all PR file patches into embeddable `CodeChunk` records.
 *
 * Each file's unified diff is walked line-by-line in windows of
 * `MAX_CHUNK_LINES`. Every window becomes one chunk with a unique id so
 * Pinecone can upsert and later retrieve it by semantic similarity.
 *
 * @param prNumber - Pull request number (included in chunk ids for traceability)
 * @param files - Changed files with patches from `getPullRequestFiles`
 * @returns Flat array of chunks ready for `saveChunksToPinecone`
 */
export function chunkPrFiles(prNumber: number, files: PrFile[]): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    const lines = file.patch.split("\n");

    // Slide a fixed-size window across the diff; large files produce many chunks
    for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
      const part = start / MAX_CHUNK_LINES;
      const text = lines.slice(start, start + MAX_CHUNK_LINES).join("\n");

      chunks.push({
        id: buildChunkId(prNumber, file.filePath, part),
        filePath: file.filePath,
        text,
      });
    }
  }

  return chunks;
}
