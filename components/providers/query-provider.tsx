/**
 * TanStack Query (React Query) provider for client-side data fetching.
 *
 * Wraps the dashboard subtree so components like `ReposList` can use
 * `useInfiniteQuery` and other hooks. The `QueryClient` is created once
 * per mount via `useState` to avoid recreating it on every render.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Provides a shared React Query client to descendant components.
 *
 * @param children - Client components that need access to query hooks.
 * @returns `QueryClientProvider` wrapping `{children}`.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializer ensures one stable QueryClient instance per provider mount
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
