import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  BotIcon,
  ExternalLinkIcon,
  FolderGit2Icon,
  GitBranchIcon,
  GitPullRequestIcon,
  UserIcon,
} from "lucide-react";

import type {
  PullRequestItem,
  RepoPullRequests,
} from "@/features/pull-requests/types/pull-request";
import { statusBadge } from "@/features/dashboard/lib/status-styles";
import { AiReviewMarkdown } from "@/features/pull-requests/components/ai-review-markdown";
import {
  PR_STATUS_LABELS,
  getPrStatusTone,
} from "@/features/pull-requests/utils/status";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function buildPrUrl(repoFullName: string, prNumber: number) {
  return `https://github.com/${repoFullName}/pull/${prNumber}`;
}

function buildRepoUrl(repoFullName: string) {
  return `https://github.com/${repoFullName}`;
}

function PullRequestMeta({ pullRequest }: { pullRequest: PullRequestItem }) {
  const openedAgo = formatDistanceToNow(new Date(pullRequest.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <UserIcon className="size-3" />
        {pullRequest.authorLogin ?? "unknown"}
      </span>
      <span className="inline-flex items-center gap-1">
        <GitBranchIcon className="size-3" />
        {pullRequest.baseBranch}
      </span>
      <span>opened {openedAgo}</span>
    </div>
  );
}

function AiReviewAccordion({ pullRequest }: { pullRequest: PullRequestItem }) {
  if (pullRequest.status === "rate_limited") {
    return (
      <p className="text-xs text-muted-foreground">
        Monthly review limit reached — upgrade to Pro for unlimited reviews.
      </p>
    );
  }

  if (!pullRequest.reviewComment) {
    return (
      <p className="text-xs text-muted-foreground">
        The AI review will appear here once it is ready.
      </p>
    );
  }

  return (
    <Accordion>
      <AccordionItem className="border-none">
        <AccordionTrigger className="py-1.5 text-muted-foreground hover:text-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BotIcon className="size-3.5" />
            View AI review
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="rounded-none border border-border bg-muted/40 p-3">
            <AiReviewMarkdown review={pullRequest.reviewComment} />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function PullRequestRow({
  repoFullName,
  pullRequest,
}: {
  repoFullName: string;
  pullRequest: PullRequestItem;
}) {
  const tone = getPrStatusTone(pullRequest.status);

  return (
    <div className="flex flex-col gap-2 border-b border-border py-4 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <GitPullRequestIcon className="size-4 shrink-0 text-muted-foreground" />
        <Link
          href={`/dashboard/pull-requests/${pullRequest.id}`}
          className="font-medium hover:underline"
        >
          {pullRequest.title}
        </Link>
        <Link
          href={buildPrUrl(repoFullName, pullRequest.prNumber)}
          target="_blank"
          className="text-xs text-muted-foreground hover:underline"
        >
          #{pullRequest.prNumber}
        </Link>
        <span className={statusBadge(tone, "ml-auto")}>
          {PR_STATUS_LABELS[pullRequest.status]}
        </span>
      </div>

      <PullRequestMeta pullRequest={pullRequest} />
      <AiReviewAccordion pullRequest={pullRequest} />
    </div>
  );
}

function RepoCard({ repo }: { repo: RepoPullRequests }) {
  const prCount = repo.pullRequests.length;
  const prLabel = prCount === 1 ? "pull request" : "pull requests";

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-sm">
          <FolderGit2Icon className="size-4 text-muted-foreground" />
          {repo.repoFullName}
          <span className="font-normal text-xs text-muted-foreground">
            {prCount} {prLabel}
          </span>
          <Link
            href={buildRepoUrl(repo.repoFullName)}
            target="_blank"
            className="ml-auto inline-flex items-center gap-1 text-xs font-normal text-muted-foreground hover:text-foreground hover:underline"
          >
            View on GitHub
            <ExternalLinkIcon className="size-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {repo.pullRequests.map((pullRequest) => (
          <PullRequestRow
            key={pullRequest.id}
            repoFullName={repo.repoFullName}
            pullRequest={pullRequest}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function NoPullRequestsYet() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
      <GitPullRequestIcon className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">No pull requests yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Open a pull request on a connected repository and the AI reviewer will
        pick it up automatically. Reviews show up here and as comments on
        GitHub.
      </p>
    </div>
  );
}

export function PullRequestsList({ repos }: { repos: RepoPullRequests[] }) {
  if (repos.length === 0) {
    return <NoPullRequestsYet />;
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {repos.map((repo) => (
        <RepoCard key={repo.repoFullName} repo={repo} />
      ))}
    </div>
  );
}
