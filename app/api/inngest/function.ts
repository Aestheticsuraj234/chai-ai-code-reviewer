/**
 * Example Inngest function (scaffold / learning).
 *
 * Demonstrates the core Inngest patterns used throughout this app:
 * - `inngest.createFunction` to define a durable workflow
 * - `step.run` for retriable, named units of work
 * - `step.sleep` for delays (e.g. waiting for Pinecone indexing)
 *
 * Production review and sync logic live in `features/reviews` and
 * `features/repo-sync`; this file is a minimal reference implementation.
 */
import { inngest } from "@/features/inngest/client";

/**
 * Processes a generic `app/task.created` event.
 *
 * Each `step.run` block is persisted: if the function crashes mid-run, Inngest
 * replays from the last completed step instead of starting over.
 *
 * @param event - Inngest event payload; expects `event.data.id`
 * @param step - Step runner for durable, retriable work units
 * @returns Completion message and the result from the handle-task step
 */
export const processTask = inngest.createFunction(
  { id: "process-task", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    // step.run gives this block a stable name in the Inngest dashboard
    const result = await step.run("handle-task", async () => {
      return { processed: true, id: event.data.id };
    });

    // step.sleep is also durable — the wait survives process restarts
    await step.sleep("pause", "1s");

    return { message: `Task ${event.data.id} complete`, result };
  }
);
