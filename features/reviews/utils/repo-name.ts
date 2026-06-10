export function splitRepoFullName(repoFullName: string) {
  const [owner, repo] = repoFullName.split("/");
  return { owner, repo };
}
