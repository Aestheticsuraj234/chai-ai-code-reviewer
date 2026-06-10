import type { CodeChunk } from "@/features/reviews/types/review";
import type { RepoFile } from "@/features/repo-sync/types/repo-sync";

const MAX_CHUNK_LINES = 80;

function buildChunkId(filePath: string, part: number) {
  return `repo--${filePath}--part-${part}`;
}

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
