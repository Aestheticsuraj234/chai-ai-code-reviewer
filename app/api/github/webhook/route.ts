/**
 * Alternate GitHub webhook route (legacy or duplicate mount path).
 *
 * Some GitHub App configurations may point webhooks at `/api/github/webhook`
 * instead of `/api/webhooks/github`. Both routes use the same handler so
 * behavior stays identical regardless of which URL is configured.
 */

import { handleGithubWebhook } from "@/features/github/server/webhook-handler";

/** Next.js App Router POST handler — delegates to shared webhook logic. */
export const POST = handleGithubWebhook;
