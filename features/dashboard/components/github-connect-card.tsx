/**
 * GitHub App connection card on the `/dashboard/github` page.
 *
 * Shows whether the user has installed the Chai reviewer GitHub App,
 * which account it is installed for, and actions to install or disconnect.
 * Server actions handle disconnect; install links out to GitHub's install flow.
 */

import { ExternalLinkIcon, UnplugIcon } from "lucide-react";

import { GithubIcon } from "@/features/dashboard/components/icons/github-icon";
import type { GithubInstallationStatus } from "@/features/dashboard/lib/types";
import {
  statusBadge,
  statusButtonClass,
} from "@/features/dashboard/lib/status-styles";
import { getGithubInstallUrl } from "@/features/github/utils/github-app";
import { disconnectGithubApp } from "@/lib/actions/github";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type GithubConnectCardProps = {
  userId: string;
  installation: GithubInstallationStatus;
};

/**
 * Explains which GitHub account the app is installed on.
 *
 * @param accountLogin - GitHub username or org name, or null if unknown.
 * @returns A short paragraph describing the active installation.
 */
function ConnectedDetails({ accountLogin }: { accountLogin: string | null }) {
  return (
    <p className="text-xs text-muted-foreground">
      Installed for{" "}
      <span className="font-medium text-green-700 dark:text-green-400">
        @{accountLogin}
      </span>
      . The app can read repository metadata and post review comments on pull
      requests.
    </p>
  );
}

/**
 * Bullet list of permissions the GitHub App requests before install.
 *
 * @returns A list encouraging the user to complete installation.
 */
function DisconnectedDetails() {
  return (
    <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
      <li>Access public and private repositories you select</li>
      <li>Receive webhooks for pull request events</li>
      <li>Post AI-generated review comments on PRs</li>
    </ul>
  );
}

/**
 * Form that submits a server action to remove the GitHub App installation.
 *
 * @returns A disconnect button wrapped in a `<form>`.
 */
function ConnectedActions() {
  return (
    <form action={disconnectGithubApp}>
      <Button
        type="submit"
        variant="outline"
        className={statusButtonClass.danger}
      >
        <UnplugIcon />
        Disconnect GitHub App
      </Button>
    </form>
  );
}

/**
 * External link button that starts the GitHub App installation flow.
 *
 * @param installUrl - URL generated with the user's ID for post-install callback.
 * @returns A link-styled button opening GitHub in the same tab.
 */
function DisconnectedActions({ installUrl }: { installUrl: string }) {
  return (
    <Button
      nativeButton={false}
      render={<a href={installUrl} />}
      className={statusButtonClass.success}
    >
      <GithubIcon />
      Install GitHub App
      <ExternalLinkIcon className="size-3 opacity-80" />
    </Button>
  );
}

/**
 * Picks connected vs disconnected explanatory copy.
 *
 * @param connected - Whether an installation exists for this user.
 * @param accountLogin - GitHub account login when connected.
 * @returns Either `ConnectedDetails` or `DisconnectedDetails`.
 */
function ConnectionDetails({
  connected,
  accountLogin,
}: {
  connected: boolean;
  accountLogin: string | null;
}) {
  if (connected) {
    return <ConnectedDetails accountLogin={accountLogin} />;
  }

  return <DisconnectedDetails />;
}

/**
 * Picks install vs disconnect action buttons.
 *
 * @param connected - Whether the app is already installed.
 * @param installUrl - GitHub install URL used when not connected.
 * @returns Either `ConnectedActions` or `DisconnectedActions`.
 */
function ConnectionActions({
  connected,
  installUrl,
}: {
  connected: boolean;
  installUrl: string;
}) {
  if (connected) {
    return <ConnectedActions />;
  }

  return <DisconnectedActions installUrl={installUrl} />;
}

/**
 * Main card UI for managing the GitHub App installation.
 *
 * Visual styling (green border, badge) changes based on connection state.
 *
 * @param userId - Used to build a personalized GitHub install URL.
 * @param installation - Current connection status from the database.
 * @returns The full GitHub App settings card.
 */
export function GithubConnectCard({
  userId,
  installation,
}: GithubConnectCardProps) {
  const { connected, accountLogin } = installation;
  // Install URL encodes userId so the callback can associate the installation
  const installUrl = getGithubInstallUrl(userId);

  // Default to neutral styling; switch to green when connected
  let cardBorderClass = "border-border";
  let iconWrapperClass = "border-border bg-muted";
  let statusTone: "success" | "neutral" = "neutral";
  let statusLabel = "Not connected";

  if (connected) {
    cardBorderClass = "border-green-500/30";
    iconWrapperClass =
      "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400";
    statusTone = "success";
    statusLabel = "Connected";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Card className={cn("max-w-2xl transition-colors", cardBorderClass)}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-none border",
                  iconWrapperClass
                )}
              >
                <GithubIcon className="size-5" />
              </span>
              <div>
                <CardTitle>GitHub App</CardTitle>
                <CardDescription>
                  Install the Chai reviewer app on your GitHub account or
                  organization to access public and private repositories.
                </CardDescription>
              </div>
            </div>
            <span className={statusBadge(statusTone)}>{statusLabel}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ConnectionDetails connected={connected} accountLogin={accountLogin} />
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <ConnectionActions connected={connected} installUrl={installUrl} />
        </CardFooter>
      </Card>
    </div>
  );
}
