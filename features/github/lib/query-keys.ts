export const githubRepoKeys = {
  all: ["github", "repos"] as const,
  list: () => [...githubRepoKeys.all, "list"] as const,
};
