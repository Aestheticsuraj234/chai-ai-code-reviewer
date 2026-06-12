/**
 * Renders AI-generated review text as formatted Markdown.
 *
 * Uses Streamdown for streaming-friendly Markdown with syntax highlighting
 * via the `@streamdown/code` plugin. Marked as `"use client"` because
 * Streamdown runs in the browser.
 */

"use client";

import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import "streamdown/styles.css";

/**
 * Displays an AI review comment with Markdown formatting and code blocks.
 *
 * @param review - Raw Markdown string stored in `pullRequest.reviewComment`.
 * @returns A styled Markdown container.
 */
export function AiReviewMarkdown({ review }: { review: string }) {
  return (
    <Streamdown plugins={{ code }} className="text-sm leading-relaxed">
      {review}
    </Streamdown>
  );
}
