/**
 * GitHub App singleton and install URL helper.
 *
 * A GitHub App is different from a personal access token — it is installed
 * per-account (user or org) and gets short-lived installation tokens via Octokit.
 * We create one shared `App` instance and reuse it across server code.
 *
 * @module features/github/utils/github-app
 */

import { App } from "octokit";

/** Cached Octokit `App` instance so we do not re-parse the private key on every request. */
let githubApp: App | null = null;

/**
 * Returns the shared GitHub App client used for API calls and webhook verification.
 *
 * The App is configured with:
 * - `appId` and `privateKey` — used to mint JWTs for GitHub's REST API
 * - `webhooks.secret` — used later to verify that webhook payloads really came from GitHub
 *
 * @returns A singleton Octokit `App` instance.
 */
export function getGithubApp() {
  if (!githubApp) {
    // GitHub stores multi-line keys as `\n` in env vars; convert them back to real newlines.
    githubApp = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      webhooks: { secret: process.env.GITHUB_WEBHOOK_SECRET! },
    });
  }

  return githubApp;
}

/**
 * Builds the URL where a user starts installing our GitHub App on their account.
 *
 * GitHub sends the `state` query param back to our callback so we know which
 * logged-in user completed the install flow.
 *
 * @param userId - The app's user id; stored in `state` and read on the OAuth callback.
 * @returns Full HTTPS URL to GitHub's "install this app" page.
 */
export function getGithubInstallUrl(userId: string) {
  const appName = process.env.GITHUB_APP_NAME!;
  const url = new URL(`https://github.com/apps/${appName}/installations/new`);
  // `state` round-trips through GitHub so we can link the installation to this user.
  url.searchParams.set("state", userId);
  return url.toString();
}
