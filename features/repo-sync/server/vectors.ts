import type { CodeChunk } from "@/features/reviews/types/review";
import { getPineconeIndex } from "@/features/pinecone/client";

// Pinecone allows at most 96 records per upsert when using integrated embedding
const UPSERT_BATCH_SIZE = 90;

export async function deleteRepoNamespace(namespace: string) {
  const index = getPineconeIndex();
  await index.deleteNamespace(namespace);
}

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
