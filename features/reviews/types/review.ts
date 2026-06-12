/**
 * Shared types for the pull-request review pipeline.
 *
 * These shapes flow from the GitHub webhook payload through database storage,
 * file fetching, chunking, vector search, and AI review generation.
 */

/**
 * A single changed file from a GitHub pull request, with its unified diff.
 */
export type PrFile = {
  /** Repository-relative path, e.g. `src/app/page.tsx` */
  filePath: string;
  /** Unified diff patch from the GitHub API (`file.patch`) */
  patch: string;
};

/**
 * A slice of code ready to embed in Pinecone.
 *
 * Large files and diffs are split into multiple chunks (see `chunkPrFiles`)
 * so each vector stays within embedding size limits.
 */
export type CodeChunk = {
  /** Unique id used as the Pinecone record id, e.g. `pr-42--src/foo.ts--part-0` */
  id: string;
  /** Source file path this chunk came from */
  filePath: string;
  /** Raw text stored in Pinecone and searched at review time */
  text: string;
};

/**
 * Subset of the GitHub `pull_request` webhook payload we persist and review.
 *
 * @see features/github/server/webhook-handler.ts — parses and validates webhooks
 */
export type PullRequestWebhookPayload = {
  /** Webhook action, e.g. `opened`, `synchronize`, `reopened` */
  action: string;
  /** GitHub App installation that received the event */
  installation: { id: number };
  repository: { full_name: string };
  pull_request: {
    number: number;
    title: string;
    user: { login: string } | null;
    head: { sha: string };
    base: { ref: string };
  };
};
