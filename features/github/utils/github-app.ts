import { App } from "octokit";

let githubApp: App | null = null;

export function getGithubApp() {
  if (!githubApp) {
    githubApp = new App({
      appId: process.env.GITHUB_APP_ID!,
      privateKey: process.env.GITHUB_APP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    });
  }

  return githubApp;
}

export function getGithubInstallUrl(userId: string) {
  const appName = process.env.GITHUB_APP_NAME!;
  const url = new URL(`https://github.com/apps/${appName}/installations/new`);
  url.searchParams.set("state", userId);
  return url.toString();
}
