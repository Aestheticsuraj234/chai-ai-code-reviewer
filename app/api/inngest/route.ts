/**
 * Inngest serve endpoint — the worker runtime for background jobs.
 *
 * Inngest's cloud (or dev server) POSTs to this route to execute registered
 * functions step-by-step. The webhook → review pipeline looks like:
 *
 * 1. GitHub webhook → `savePullRequest` + `triggerReviewJob`
 * 2. Inngest receives `github/pr.received` → runs `reviewPullRequest`
 * 3. Optional: user clicks Sync → `triggerRepoSync` → `syncRepoCodebase`
 *
 * Exporting GET/POST/PUT from `serve()` wires up sync, introspection, and execution.
 */
import { inngest } from "@/features/inngest/client";
import { syncRepoCodebase } from "@/features/repo-sync/server/sync-repo-function";
import { reviewPullRequest } from "@/features/reviews/server/review-pr-function";
import { serve } from "inngest/next";
import { processTask } from "./function";

/**
 * Next.js route handlers that Inngest uses to run and manage functions.
 *
 * @returns HTTP method handlers (`GET`, `POST`, `PUT`) for the Inngest platform
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  // Each function is an independent workflow with its own steps and retries
  functions: [processTask, reviewPullRequest, syncRepoCodebase],
});
