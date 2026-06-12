/**
 * Inngest client for background job orchestration.
 *
 * Inngest runs long-running work (PR reviews, repo syncs) outside the HTTP
 * request lifecycle. When a GitHub webhook arrives we only save the PR and
 * enqueue an event; this client is what sends those events and powers the
 * worker functions registered in `app/api/inngest/route.ts`.
 *
 * @see app/api/inngest/route.ts — HTTP endpoint Inngest calls to run functions
 * @see features/reviews/server/trigger-review.ts — enqueues `github/pr.received`
 * @see features/repo-sync/server/trigger-sync.ts — enqueues `repo/sync.requested`
 */
import { Inngest } from "inngest";

/**
 * Shared Inngest application instance.
 *
 * The `id` must match your Inngest app name in the dashboard. Every
 * `inngest.createFunction` and `inngest.send` call in this project uses
 * this single client.
 */
export const inngest = new Inngest({ id: "chai-ai-code-reviewer" });
