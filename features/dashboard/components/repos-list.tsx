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

async function fetchReposPage(page: number): Promise<InstallationReposPage> {
  const response = await fetch(`/api/github/repos?page=${page}`);

  if (!response.ok) {
    throw new Error("Failed to load repositories");
  }

  return response.json();
}

export function ReposList() {
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");
  const [search, setSearch] = useState("");
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ["github-repos"],
      queryFn: ({ pageParam }) => fetchReposPage(pageParam),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
    });

  const repos = useMemo(
    () => data?.pages.flatMap((page) => page.repos) ?? [],
    [data]
  );

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const filteredRepos = useMemo(() => {
    return repos.filter((repo) => {
      const matchesFilter = filter === "all" || repo.visibility === filter;
      const matchesSearch = repo.fullName
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [repos, filter, search]);

  const counts = {
    all: totalCount,
    public: repos.filter((r) => r.visibility === "public").length,
    private: repos.filter((r) => r.visibility === "private").length,
  };

  useEffect(() => {
    const element = loadMoreRef.current;

    if (!element || !hasNextPage || isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
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
          onValueChange={(value) =>
            setFilter(value as "all" | "public" | "private")
          }
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading repositories…
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Failed to load repositories.
                </TableCell>
              </TableRow>
            ) : filteredRepos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No repositories found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRepos.map((repo) => <RepoRow key={repo.id} repo={repo} />)
            )}
          </TableBody>
        </Table>
      </div>

      <div ref={loadMoreRef} className="py-2 text-center text-sm text-muted-foreground">
        {isFetchingNextPage
          ? "Loading more repositories…"
          : hasNextPage
            ? `Showing ${repos.length} of ${totalCount}`
            : repos.length > 0
              ? `All ${repos.length} repositories loaded`
              : null}
      </div>
    </div>
  );
}

function RepoRow({ repo }: { repo: DashboardRepo }) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{repo.name}</span>
          <span className="text-xs text-muted-foreground">{repo.fullName}</span>
        </div>
      </TableCell>
      <TableCell>
        <span
          className={statusBadge(
            repo.visibility === "public" ? "info" : "warning",
            "gap-1"
          )}
        >
          {repo.visibility === "private" ? (
            <LockIcon className="size-3" />
          ) : (
            <UnlockIcon className="size-3" />
          )}
          {repo.visibility}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">{repo.defaultBranch}</TableCell>
      <TableCell>{repo.language ?? "—"}</TableCell>
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
