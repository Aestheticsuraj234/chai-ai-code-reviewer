/**
 * AI SDK provider configuration for code review generation.
 *
 * Reviews are produced by `generateReview` in `features/reviews/server/generate-review.ts`.
 * That function calls the Vercel AI SDK's `generateText` with a model routed through
 * OpenRouter. This file centralizes the provider so API keys and routing stay in one place.
 */
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * OpenRouter provider instance for the AI SDK.
 *
 * Pass a model id (e.g. `"openrouter/free"`) to `openrouter(modelId)` when
 * calling `generateText` or other AI SDK helpers.
 *
 * @example
 * ```ts
 * const { text } = await generateText({
 *   model: openrouter("openrouter/free"),
 *   prompt: "...",
 * });
 * ```
 */
export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});
