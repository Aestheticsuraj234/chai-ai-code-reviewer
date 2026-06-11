import type { ComponentType } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  FolderGit2Icon,
  GitPullRequestIcon,
  SparklesIcon,
} from "lucide-react";

import { GithubIcon } from "@/features/dashboard/components/icons/github-icon";
import { DASHBOARD_ROUTES } from "@/features/dashboard/lib/routes";
import { statusBadge } from "@/features/dashboard/lib/status-styles";
import type {
  OverviewActivityItem,
  OverviewData,
  OverviewRepoSummary,
} from "@/features/overview/types/overview";
import { PLAN_DETAILS } from "@/features/settings/lib/plan-details";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ACTIVITY_STATUS = {
  approved: { label: "Approved", tone: "success" as const },
  changes_requested: { label: "Changes requested", tone: "warning" as const },
  rate_limited: { label: "Rate limited", tone: "danger" as const },
};

function getRepoDescription(repos: OverviewRepoSummary): string {
  if (repos.totalCount === 0) {
    return "No repositories selected for the app";
  }

  if (repos.hasMorePages) {
    return `${repos.totalCount} repositories connected`;
  }

  return `${repos.publicCount} public · ${repos.privateCount} private`;
}

function getGithubStat(installation: OverviewData["installation"]) {
  if (!installation.connected) {
    return {
      value: "Not connected",
      description: "Install the GitHub App to start",
      accent: undefined,
    };
  }

  const account = installation.accountLogin
    ? `@${installation.accountLogin}`
    : "Installation active";

  return {
    value: "Connected",
    description: account,
    accent: "success" as const,
  };
}

function getRepositoriesStat(repos: OverviewRepoSummary | null) {
  if (!repos) {
    return {
      value: "—",
      description: "Connect GitHub App first",
      accent: undefined,
    };
  }

  return {
    value: String(repos.totalCount),
    description: getRepoDescription(repos),
    accent: "info" as const,
  };
}

type StatCard = {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  accent?: "success" | "info";
};

function getReviewsStat(overview: OverviewData) {
  if (overview.reviewsLimit === null) {
    return {
      value: String(overview.reviewsUsed),
      description: "Unlimited reviews on Pro",
    };
  }

  return {
    value: `${overview.reviewsUsed} / ${overview.reviewsLimit}`,
    description: "AI reviews used this month",
  };
}

function buildStats(overview: OverviewData): StatCard[] {
  const repoStat = getRepositoriesStat(overview.repos);
  const githubStat = getGithubStat(overview.installation);
  const planLabel = PLAN_DETAILS[overview.plan].label;
  const reviewsStat = getReviewsStat(overview);

  return [
    {
      title: "Repositories",
      value: repoStat.value,
      description: repoStat.description,
      icon: FolderGit2Icon,
      accent: repoStat.accent,
    },
    {
      title: "Reviews this month",
      value: reviewsStat.value,
      description: reviewsStat.description,
      icon: GitPullRequestIcon,
    },
    {
      title: "GitHub App",
      value: githubStat.value,
      description: githubStat.description,
      icon: GithubIcon,
      accent: githubStat.accent,
    },
    {
      title: "Current plan",
      value: planLabel,
      description: "Manage in settings",
      icon: SparklesIcon,
      accent: overview.plan === "free" ? undefined : "success",
    },
  ];
}

function ConnectGithubBanner() {
  return (
    <Card className="border-blue-500/25 bg-blue-500/5">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-sm">Connect GitHub to get started</CardTitle>
          <CardDescription>
            Install the GitHub App to list repositories and enable AI reviews on
            pull requests.
          </CardDescription>
        </div>
        <Button
          nativeButton={false}
          render={<Link href={DASHBOARD_ROUTES.github} />}
          className="shrink-0"
        >
          Connect GitHub
        </Button>
      </CardHeader>
    </Card>
  );
}

function ActivityList({ items }: { items: OverviewActivityItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Once AI PR reviews are enabled, summaries will appear
        here.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const config = ACTIVITY_STATUS[item.status];

        return (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-xs font-medium">
                {item.repoFullName}{" "}
                <span className="text-muted-foreground">{item.prNumber}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.reviewedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <span className={statusBadge(config.tone)}>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}

type OverviewContentProps = {
  overview: OverviewData;
};

export function OverviewContent({ overview }: OverviewContentProps) {
  const stats = buildStats(overview);
  const showConnectBanner = !overview.installation.connected;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={cn(
              stat.accent === "success" && "border-green-500/25",
              stat.accent === "info" && "border-blue-500/25"
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon
                className={cn(
                  "size-4",
                  stat.accent === "success" && "text-green-600 dark:text-green-400",
                  stat.accent === "info" && "text-blue-600 dark:text-blue-400",
                  !stat.accent && "text-muted-foreground"
                )}
              />
            </CardHeader>
            <CardContent>
              <p
                className={cn(
                  "text-2xl font-semibold tracking-tight",
                  stat.accent === "success" && "text-green-700 dark:text-green-400",
                  stat.accent === "info" && "text-blue-700 dark:text-blue-400"
                )}
              >
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {showConnectBanner ? <ConnectGithubBanner /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Latest AI review summaries from your repositories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ActivityList items={overview.recentActivity} />
        </CardContent>
      </Card>
    </div>
  );
}
