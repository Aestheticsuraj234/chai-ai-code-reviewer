/**
 * Interactive repositories table with infinite scroll.
 *
 * Fetches pages from `/api/github/repos` via TanStack Query, supports
 * filtering by visibility and client-side search, and shows codebase sync
 * status per row. Uses Intersection Observer to load more pages automatically.
 */

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { LockIcon, StarIcon, UnlockIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { DashboardRepo } from "@/features/dashboard/lib/types";
import { statusBadge } from "@/features/dashboard/lib/status-styles";
import { githubReposInfiniteQuery } from "@/features/github/lib/repos-query";
import { SyncRepoButton } from "@/features/repo-sync/components/sync-repo-button";
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

/** Tab filter values matching repository visibility or "all". */
type RepoFilter = "all" | "public" | "private";

/**
 * Returns whether a repo passes the visibility tab filter.
 *
 * @param repo - Repository row to test.
 * @param filter - Active tab: all, public, or private.
 * @returns `true` if the repo should appear under the current filter.
 */
function doesRepoMatchFilter(
  repo: DashboardRepo,
  filter: RepoFilter
): boolean {
  if (filter === "all") {
    return true;
  }

  return repo.visibility === filter;
}

/**
 * Case-insensitive substring match against `repo.fullName`.
 *
 * @param repo - Repository row to test.
 * @param search - User-typed search string.
 * @returns `true` if the repo name contains the search query.
 */
function doesRepoMatchSearch(repo: DashboardRepo, search: string): boolean {
  const query = search.toLowerCase();
  return repo.fullName.toLowerCase().includes(query);
}

/**
 * Sorts repos by `updatedAt` descending (most recently updated first).
 *
 * @param repos - Unsorted repository array.
 * @returns A new sorted array (does not mutate the input).
 */
function sortByLatestUpdated(repos: DashboardRepo[]): DashboardRepo[] {
  return [...repos].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/**
 * Maps visibility to badge color: blue for public, amber for private.
 *
 * @param visibility - `"public"` or `"private"`.
 * @returns Badge tone key for `statusBadge()`.
 */
function getVisibilityBadgeTone(
  visibility: DashboardRepo["visibility"]
): "info" | "warning" {
  if (visibility === "public") {
    return "info";
  }

  return "warning";
}

/**
 * Small lock/unlock icon matching repository visibility.
 *
 * @param visibility - `"public"` or `"private"`.
 * @returns Lucide icon component.
 */
function VisibilityIcon({ visibility }: { visibility: DashboardRepo["visibility"] }) {
  if (visibility === "private") {
    return <LockIcon className="size-3" />;
  }

  return <UnlockIcon className="size-3" />;
}

/**
 * Renders table body rows for loading, error, empty, or data states.
 *
 * @param showLoading - True on initial fetch before any data exists.
 * @param isError - True when the infinite query failed.
 * @param repos - Filtered repos to render as rows.
 * @returns Table rows or a single spanning status row.
 */
function ReposTableBody({
  showLoading,
  isError,
  repos,
}: {
  showLoading: boolean;
  isError: boolean;
  repos: DashboardRepo[];
}) {
  if (showLoading) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-muted-foreground">
          Loading repositories…
        </TableCell>
      </TableRow>
    );
  }

  if (isError) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-muted-foreground">
          Failed to load repositories.
        </TableCell>
      </TableRow>
    );
  }

  if (repos.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-muted-foreground">
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

/**
 * Footer text below the table describing pagination progress.
 *
 * @param isFetchingNextPage - True while the next page request is in flight.
 * @param hasNextPage - Whether more pages exist on the server.
 * @param loadedCount - Number of repos loaded so far across all pages.
 * @param totalCount - Total repos reported by the API on page 1.
 * @returns Human-readable load status or null when nothing to show.
 */
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

/**
 * Main repositories list with tabs, search, table, and infinite scroll.
 *
 * @returns The full repositories page body (client component).
 */
export function ReposList() {
  const [filter, setFilter] = useState<RepoFilter>("all");
  const [search, setSearch] = useState("");
  // Sentinel element observed to trigger loading the next page
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = useInfiniteQuery(githubReposInfiniteQuery);

  // Distinguish initial load from background refetches
  const showLoading = isPending && !data;

  const repos = useMemo(() => {
    if (!data) {
      return [];
    }

    // Flatten all loaded pages into one array, then sort client-side
    const loadedRepos = data.pages.flatMap((page) => page.repos);
    return sortByLatestUpdated(loadedRepos);
  }, [data]);

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesFilter = doesRepoMatchFilter(repo, filter);
      const matchesSearch = doesRepoMatchSearch(repo, search);
      return matchesFilter && matchesSearch;
    });
  }, [repos, filter, search]);

  // Tab counts: "all" uses API total; public/private count loaded repos only
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

    // Start loading the next page when the sentinel nears the viewport
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
              <TableHead className="text-right">Codebase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <ReposTableBody
              showLoading={showLoading}
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

/**
 * Single row in the repositories table.
 *
 * @param repo - Repository data including sync status for the codebase column.
 * @returns A `<TableRow>` with all repository columns.
 */
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
      <TableCell className="text-right">
        <SyncRepoButton
          repoFullName={repo.fullName}
          branch={repo.defaultBranch}
          syncStatus={repo.syncStatus ?? null}
        />
      </TableCell>
    </TableRow>
  );
}
