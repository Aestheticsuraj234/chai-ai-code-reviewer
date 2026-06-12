/**
 * TanStack Query options for loading GitHub repos with infinite scroll.
 *
 * The browser calls `/api/github/repos` (not Octokit directly) so GitHub tokens
 * stay on the server. This file only defines how the client caches those pages.
 *
 * @module features/github/lib/repos-query
 */

import { infiniteQueryOptions } from "@tanstack/react-query";

import type { DashboardRepo } from "@/features/dashboard/lib/types";
import { githubRepoKeys } from "@/features/github/lib/query-keys";

/** Shape of one page returned by `/api/github/repos`. */
export type GithubReposPage = {
  repos: DashboardRepo[];
  totalCount: number;
  page: number;
  hasMore: boolean;
};

// Repo list changes slowly, so keep it fresh for 10 minutes
const REPOS_STALE_TIME = 10 * 60 * 1000;

/** Fetches a single page from our API route (server uses Octokit under the hood). */
async function fetchReposPage(page: number): Promise<GithubReposPage> {
  const response = await fetch(`/api/github/repos?page=${page}`);

  if (!response.ok) {
    throw new Error("Failed to load repositories");
  }

  return response.json();
}

/** Tells infinite query which page number to load next, or `undefined` when done. */
function getNextPageParam(lastPage: GithubReposPage) {
  if (lastPage.hasMore) {
    return lastPage.page + 1;
  }

  return undefined;
}

/**
 * Pre-built `infiniteQueryOptions` for the dashboard repo picker.
 *
 * @returns TanStack Query config: key, fetcher, pagination, and stale time.
 */
export const githubReposInfiniteQuery = infiniteQueryOptions({
  queryKey: githubRepoKeys.list(),
  queryFn: ({ pageParam }) => fetchReposPage(pageParam),
  initialPageParam: 1,
  getNextPageParam,
  staleTime: REPOS_STALE_TIME,
});
