"use client";

import { useQuery } from "@tanstack/react-query";
import type { ImportJob } from "@/types/api";
import { adminApi } from "@/lib/api/admin";

const POLL_MS = 2000;

export const isFinished = (status?: ImportJob["status"]) =>
  status === "completed" || status === "failed" || status === "rolled_back";

/** One import job; with `poll`, refetches every 2s until the job reaches a final status. */
export function useImportJob(batchId: string, poll = false) {
  return useQuery({
    queryKey: ["admin", "import", "status", batchId],
    queryFn: () => adminApi.importStatus(batchId),
    refetchInterval: poll ? (query) => (isFinished(query.state.data?.status) ? false : POLL_MS) : false,
    staleTime: poll ? 0 : 60_000,
  });
}
