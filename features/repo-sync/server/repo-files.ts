/**
 * Fetches indexable source files from a GitHub repository branch.
 *
 * First step of repo sync: walk the git tree, filter to code-like paths,
 * download blob contents, then hand files to `chunkRepoFiles`. Filters keep
 * the Pinecone index small and within starter-tier limits.
 */
import type { RepoFile } from "@/features/repo-sync/types/repo-sync";
import { getGithubApp } from "@/features/github/utils/github-app";
import { splitRepoFullName } from "@/features/reviews/utils/repo-name";

// Keep the index small and useful: skip huge files and cap the total count
// so we stay inside the Pinecone starter limits.
const MAX_FILE_SIZE_BYTES = 100_000;
const MAX_FILES = 200;

/** File extensions we consider worth embedding for code review context */
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

/** Paths inside these folders are never indexed (deps, build output, etc.) */
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

/**
 * @param path - Repository-relative file path
 * @returns True if the path ends with a known code extension
 */
function hasCodeExtension(path: string) {
  return CODE_EXTENSIONS.some((extension) => path.endsWith(extension));
}

/**
 * @param path - Repository-relative file path
 * @returns True if the path lives under a skipped directory
 */
function isSkippedPath(path: string) {
  return SKIPPED_FOLDERS.some((folder) => path.includes(folder));
}

/**
 * Decides whether a git tree entry should be downloaded and chunked.
 *
 * @param entry - Single node from GitHub's recursive tree API
 * @returns True for small, text-like blobs in allowed folders
 */
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

/**
 * Downloads up to `MAX_FILES` indexable files from a branch.
 *
 * Uses the recursive git tree endpoint, then fetches each blob's base64
 * content and decodes to UTF-8 strings for chunking.
 *
 * @param installationId - GitHub App installation id
 * @param repoFullName - Repository in `owner/repo` form
 * @param branch - Branch name or commit sha for the tree root
 * @returns Array of `{ filePath, content }` for `chunkRepoFiles`
 */
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
