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

export function GithubConnectCard({
  userId,
  installation,
}: GithubConnectCardProps) {
  const { connected, accountLogin } = installation;
  const installUrl = getGithubInstallUrl(userId);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <Card
        className={cn(
          "max-w-2xl transition-colors",
          connected ? "border-green-500/30" : "border-border"
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-none border",
                  connected
                    ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400"
                    : "border-border bg-muted"
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
            <span className={statusBadge(connected ? "success" : "neutral")}>
              {connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {connected ? (
            <p className="text-xs text-muted-foreground">
              Installed for{" "}
              <span className="font-medium text-green-700 dark:text-green-400">
                @{accountLogin}
              </span>
              . The app can read repository metadata and post review comments on
              pull requests.
            </p>
          ) : (
            <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
              <li>Access public and private repositories you select</li>
              <li>Receive webhooks for pull request events</li>
              <li>Post AI-generated review comments on PRs</li>
            </ul>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {connected ? (
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
          ) : (
            <Button
              nativeButton={false}
              render={<a href={installUrl} />}
              className={statusButtonClass.success}
            >
              <GithubIcon />
              Install GitHub App
              <ExternalLinkIcon className="size-3 opacity-80" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
