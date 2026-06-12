/**
 * Pinecone vector database client.
 *
 * Both PR review and repo sync store code as embeddings in Pinecone so we can
 * do semantic search at review time. PR diffs live in a per-PR namespace;
 * full repo code lives in a separate per-repo namespace (see `buildPrNamespace`
 * and `buildRepoNamespace`). This module lazily creates one Pinecone client
 * and returns the configured index handle.
 */
import { Pinecone } from "@pinecone-database/pinecone";

/** Singleton client — created on first use to avoid work during cold imports. */
let pinecone: Pinecone | null = null;

/**
 * Returns the Pinecone index used for all code embeddings in this app.
 *
 * Pinecone's integrated embedding turns each record's `text` field into a
 * vector automatically on upsert. Namespaces partition data so PR chunks and
 * repo chunks never collide.
 *
 * @returns Pinecone index handle for `PINECONE_INDEX`
 */
export function getPineconeIndex() {
  if (!pinecone) {
    pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  }

  return pinecone.index(process.env.PINECONE_INDEX!);
}
