"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { errorMessage } from "@/lib/api/client";
import { ErrorBlock, Spinner, StatusBadge } from "../ui";
import { JobReport } from "./job-report";
import { isFinished, useImportJob } from "./use-import-job";

/** Polls a background import and shows the final report once it settles. */
export function ImportProgress({ batchId }: { batchId: string }) {
  const queryClient = useQueryClient();
  const { data, isError, error } = useImportJob(batchId, true);
  const finished = isFinished(data?.status);

  useEffect(() => {
    if (!finished) return;
    queryClient.invalidateQueries({ queryKey: ["admin", "import", "history"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  }, [finished, queryClient]);

  if (isError) return <ErrorBlock message={errorMessage(error, "Could not read import progress")} />;

  if (!data || !finished) {
    const total = data?.totalRows ?? 0;
    const processed = data?.processed ?? 0;
    const percent = total ? Math.min(100, Math.round((processed / total) * 100)) : 0;

    return (
      <div aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <span className="meta flex items-center gap-2">
            <Spinner className="h-3.5 w-3.5" /> Importing in the background
          </span>
          <span className="meta tabular-nums">
            {processed.toLocaleString("en-US")} / {total.toLocaleString("en-US")} rows
          </span>
        </div>
        <div
          className="mt-2 h-2 border border-line"
          role="progressbar"
          aria-label="Import progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <StatusBadge status={data.status} />
        {data.status === "failed" && <span className="text-[13px] text-accent">The import stopped before finishing.</span>}
      </div>
      <JobReport job={data} />
    </div>
  );
}
