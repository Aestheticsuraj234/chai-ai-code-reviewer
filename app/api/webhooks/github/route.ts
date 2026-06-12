/**
 * GitHub webhook endpoint (canonical URL).
 *
 * GitHub sends POST requests here when repository events occur (e.g. pull
 * request opened). The handler verifies the signature and dispatches work
 * to the review pipeline. Re-exported from the shared webhook handler module.
 */

import { handleGithubWebhook } from "@/features/github/server/webhook-handler";

/** Next.js App Router POST handler — delegates to shared webhook logic. */
export const POST = handleGithubWebhook;
