/**
 * Chunking utilities for full-repository sync.
 *
 * Mirrors `features/reviews/utils/chunk-code.ts` but operates on whole file
 * contents instead of PR patches. Synced chunks land in the repo Pinecone
 * namespace and are searched during review for surrounding context.
 */
import type { CodeChunk } from "@/features/reviews/types/review";
import type { RepoFile } from "@/features/repo-sync/types/repo-sync";

/** Same window size as PR chunking — keeps embedding input predictable */
const MAX_CHUNK_LINES = 80;

/**
 * Builds a stable Pinecone record id for one chunk of a repo file.
 *
 * @param filePath - Repository-relative file path
 * @param part - Zero-based chunk index within the file
 * @returns Unique id, e.g. `repo--src/lib/utils.ts--part-0`
 */
function buildChunkId(filePath: string, part: number) {
  return `repo--${filePath}--part-${part}`;
}

/**
 * Splits all repository files into embeddable `CodeChunk` records.
 *
 * Large files are walked in 80-line windows. Each window becomes one vector
 * in the repo namespace so semantic search can find relevant helpers, types,
 * and tests even when they are not part of the PR diff.
 *
 * @param files - Source files from `getRepoFiles`
 * @returns Flat array of chunks ready for `saveRepoChunks`
 */
export function chunkRepoFiles(files: RepoFile[]): CodeChunk[] {
  const chunks: CodeChunk[] = [];

  for (const file of files) {
    const lines = file.content.split("\n");

    for (let start = 0; start < lines.length; start += MAX_CHUNK_LINES) {
      const part = start / MAX_CHUNK_LINES;
      const text = lines.slice(start, start + MAX_CHUNK_LINES).join("\n");

      chunks.push({
        id: buildChunkId(file.filePath, part),
        filePath: file.filePath,
        text,
      });
    }
  }

  return chunks;
}
