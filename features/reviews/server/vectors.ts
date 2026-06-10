import type { CodeChunk } from "@/features/reviews/types/review";
import { getPineconeIndex } from "@/features/pinecone/client";

const CONTEXT_RESULTS = 10;

export function buildPrNamespace(repoFullName: string, prNumber: number) {
  return `${repoFullName.replace("/", "--")}--pr-${prNumber}`;
}

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

  await index.namespace(namespace).upsertRecords({ records });
}

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
