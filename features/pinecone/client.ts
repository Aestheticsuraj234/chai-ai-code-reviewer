import { Pinecone } from "@pinecone-database/pinecone";

let pinecone: Pinecone | null = null;

export function getPineconeIndex() {
  if (!pinecone) {
    pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  }

  return pinecone.index(process.env.PINECONE_INDEX!);
}
