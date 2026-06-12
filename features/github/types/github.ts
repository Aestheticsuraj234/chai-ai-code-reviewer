/**
 * TypeScript types for GitHub repository data shown in the app.
 *
 * These mirror fields we map from the GitHub REST API in `server/repos.ts`,
 * using camelCase names that fit the rest of our frontend code.
 *
 * @module features/github/types/github
 */

/** A single repository returned from a GitHub App installation listing. */
export type GithubRepo = {
  /** GitHub's numeric repo id, stored as a string for consistency with other ids. */
  id: string;
  /** Short repo name without owner, e.g. `my-app`. */
  name: string;
  /** Full name with owner, e.g. `acme/my-app`. */
  fullName: string;
  /** Whether the repo is public or private on GitHub. */
  visibility: "public" | "private";
  /** Default branch GitHub reports (usually `main` or `master`). */
  defaultBranch: string;
  /** ISO timestamp of last activity on the repo. */
  updatedAt: string;
  /** Primary language from GitHub, or null if unknown. */
  language: string | null;
  /** Star count from GitHub's `stargazers_count`. */
  stars: number;
};
