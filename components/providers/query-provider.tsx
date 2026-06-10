"use client";

import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";

const QUERY_CACHE_KEY = "chai-code-reviewer-query-cache";

// Fresh data is reused without refetching
const STALE_TIME = 10 * 60 * 1000;

// Keep inactive queries long enough for localStorage restore
const GC_TIME = 24 * 60 * 60 * 1000;

function buildQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        gcTime: GC_TIME,
        retry: 1,
      },
    },
  });
}

function buildPersister() {
  if (typeof window === "undefined") {
    return createSyncStoragePersister({ storage: undefined });
  }

  return createSyncStoragePersister({
    storage: window.localStorage,
    key: QUERY_CACHE_KEY,
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(buildQueryClient);
  const [persister] = useState(buildPersister);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: GC_TIME,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
