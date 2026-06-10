export function buildRepoNamespace(repoFullName: string) {
  return `${repoFullName.replace("/", "--")}--codebase`;
}
