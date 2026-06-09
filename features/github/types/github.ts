export type GithubRepo = {
  id: string;
  name: string;
  fullName: string;
  visibility: "public" | "private";
  defaultBranch: string;
  updatedAt: string;
  language: string | null;
  stars: number;
};
