import type { RepoFile } from "@/features/repo-sync/types/repo-sync";
import { getGithubApp } from "@/features/github/utils/github-app";
import { splitRepoFullName } from "@/features/reviews/utils/repo-name";

// Keep the index small and useful: skip huge files and cap the total count
// so we stay inside the Pinecone starter limits.
const MAX_FILE_SIZE_BYTES = 100_000;
const MAX_FILES = 200;

const CODE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".py",
  ".go",
  ".rb",
  ".rs",
  ".java",
  ".kt",
  ".swift",
  ".c",
  ".h",
  ".cpp",
  ".cs",
  ".php",
  ".sql",
  ".prisma",
  ".css",
  ".md",
  ".yml",
  ".yaml",
];

const SKIPPED_FOLDERS = [
  "node_modules/",
  "dist/",
  "build/",
  ".next/",
  "generated/",
  "vendor/",
];

type TreeEntry = {
  path?: string;
  type?: string;
  sha?: string;
  size?: number;
};

function hasCodeExtension(path: string) {
  return CODE_EXTENSIONS.some((extension) => path.endsWith(extension));
}

function isSkippedPath(path: string) {
  return SKIPPED_FOLDERS.some((folder) => path.includes(folder));
}

function isIndexableFile(entry: TreeEntry) {
  if (entry.type !== "blob" || !entry.path || !entry.sha) {
    return false;
  }

  if (entry.size && entry.size > MAX_FILE_SIZE_BYTES) {
    return false;
  }

  if (isSkippedPath(entry.path)) {
    return false;
  }

  return hasCodeExtension(entry.path);
}

export async function getRepoFiles(
  installationId: number,
  repoFullName: string,
  branch: string
): Promise<RepoFile[]> {
  const app = getGithubApp();
  const octokit = await app.getInstallationOctokit(installationId);
  const { owner, repo } = splitRepoFullName(repoFullName);

  const { data: tree } = await octokit.request(
    "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
    { owner, repo, tree_sha: branch, recursive: "1" }
  );

  const entries = tree.tree.filter(isIndexableFile).slice(0, MAX_FILES);
  const files: RepoFile[] = [];

  for (const entry of entries) {
    const { data: blob } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
      { owner, repo, file_sha: entry.sha! }
    );

    const content = Buffer.from(blob.content, "base64").toString("utf-8");
    files.push({ filePath: entry.path!, content });
  }

  return files;
}
