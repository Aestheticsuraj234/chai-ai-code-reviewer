"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { LockIcon, StarIcon, UnlockIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { DashboardRepo } from "@/features/dashboard/lib/types";
import { statusBadge } from "@/features/dashboard/lib/status-styles";
import type { InstallationReposPage } from "@/features/github/server/repos";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RepoFilter = "all" | "public" | "private";

async function fetchReposPage(page: number): Promise<InstallationReposPage> {
  const response = await fetch(`/api/github/repos?page=${page}`);

  if (!response.ok) {
    throw new Error("Failed to load repositories");
  }

  return response.json();
}

function getNextPageParam(lastPage: InstallationReposPage) {
  if (lastPage.hasMore) {
    return lastPage.page + 1;
  }

  return undefined;
}

function doesRepoMatchFilter(
  repo: DashboardRepo,
  filter: RepoFilter
): boolean {
  if (filter === "all") {
    return true;
  }

  return repo.visibility === filter;
}

function doesRepoMatchSearch(repo: DashboardRepo, search: string): boolean {
  const query = search.toLowerCase();
  return repo.fullName.toLowerCase().includes(query);
}

function getVisibilityBadgeTone(
  visibility: DashboardRepo["visibility"]
): "info" | "warning" {
  if (visibility === "public") {
    return "info";
  }

  return "warning";
}

function VisibilityIcon({ visibility }: { visibility: DashboardRepo["visibility"] }) {
  if (visibility === "private") {
    return <LockIcon className="size-3" />;
  }

  return <UnlockIcon className="size-3" />;
}

function ReposTableBody({
  isLoading,
  isError,
  repos,
}: {
  isLoading: boolean;
  isError: boolean;
  repos: DashboardRepo[];
}) {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center text-muted-foreground">
          Loading repositories…
        </TableCell>
      </TableRow>
    );
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center text-muted-foreground">
          Failed to load repositories.
        </TableCell>
      </TableRow>
    );
  }

  if (repos.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center text-muted-foreground">
          No repositories found.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {repos.map((repo) => (
        <RepoRow key={repo.id} repo={repo} />
      ))}
    </>
  );
}

function LoadMoreMessage({
  isFetchingNextPage,
  hasNextPage,
  loadedCount,
  totalCount,
}: {
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  loadedCount: number;
  totalCount: number;
}) {
  if (isFetchingNextPage) {
    return <>Loading more repositories…</>;
  }

  if (hasNextPage) {
    return (
      <>
        Showing {loadedCount} of {totalCount}
      </>
    );
  }

  if (loadedCount > 0) {
    return <>All {loadedCount} repositories loaded</>;
  }

  return null;
}

export function ReposList() {
  const [filter, setFilter] = useState<RepoFilter>("all");
  const [search, setSearch] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["github-repos"],
      queryFn: ({ pageParam }) => fetchReposPage(pageParam),
      initialPageParam: 1,
      getNextPageParam,
    });

  const repos = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.pages.flatMap((page) => page.repos);
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesFilter = doesRepoMatchFilter(repo, filter);
      const matchesSearch = doesRepoMatchSearch(repo, search);
      return matchesFilter && matchesSearch;
    });
  }, [repos, filter, search]);

  const counts = {
    all: totalCount,
    public: repos.filter((repo) => repo.visibility === "public").length,
    private: repos.filter((repo) => repo.visibility === "private").length,
  };

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as RepoFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="public">Public ({counts.public})</TabsTrigger>
            <TabsTrigger value="private">Private ({counts.private})</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search repositories…"
          className="max-w-xs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="rounded-none border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Repository</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead>Language</TableHead>
              <TableHead className="text-right">Stars</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ReposTableBody
              isLoading={isLoading}
              isError={isError}
              repos={filteredRepos}
            />
          </TableBody>
        </Table>
      </div>

      <div ref={loadMoreRef} className="py-2 text-center text-sm text-muted-foreground">
        <LoadMoreMessage
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          loadedCount={repos.length}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}

function RepoRow({ repo }: { repo: DashboardRepo }) {
  const badgeTone = getVisibilityBadgeTone(repo.visibility);
  const language = repo.language ?? "—";

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{repo.name}</span>
          <span className="text-xs text-muted-foreground">{repo.fullName}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className={statusBadge(badgeTone, "gap-1")}>
          <VisibilityIcon visibility={repo.visibility} />
          {repo.visibility}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">{repo.defaultBranch}</TableCell>
      <TableCell>{language}</TableCell>
      <TableCell className="text-right">
        <span className="inline-flex items-center justify-end gap-1 text-muted-foreground">
          <StarIcon className="size-3 text-amber-500" />
          {repo.stars}
        </span>
      </TableCell>
      <TableCell className="text-right text-muted-foreground">
        {formatDistanceToNow(new Date(repo.updatedAt), { addSuffix: true })}
      </TableCell>
    </TableRow>
  );
}
