import { inngest } from "@/features/inngest/client";
import { syncRepoCodebase } from "@/features/repo-sync/server/sync-repo-function";
import { reviewPullRequest } from "@/features/reviews/server/review-pr-function";
import { serve } from "inngest/next";
import { processTask } from "./function";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask, reviewPullRequest, syncRepoCodebase],
});