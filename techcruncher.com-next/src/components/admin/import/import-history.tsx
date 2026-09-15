"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Undo2 } from "lucide-react";
import { useState } from "react";
import type { ImportJob } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { Card, ConfirmDialog, EmptyBlock, ErrorBlock, LoadingBlock, Modal, StatusBadge, TableScroll } from "../ui";
import { JobReport } from "./job-report";
import { useImportJob } from "./use-import-job";

const HISTORY_KEY = ["admin", "import", "history"] as const;

interface RollbackNotice {
  message: string;
  warning?: string;
}

export function ImportHistory() {
  const { can } = useAdminAuth();
  const canDelete = can("canDelete");
  const toast = useToast();
  const queryClient = useQueryClient();
  const [viewing, setViewing] = useState<string | null>(null);
  const [rollingBack, setRollingBack] = useState<ImportJob | null>(null);
  const [notice, setNotice] = useState<RollbackNotice | null>(null);

  const { data, isPending, isError, error, refetch } = useQuery({ queryKey: HISTORY_KEY, queryFn: adminApi.importHistory });

  const rollback = useMutation({
    mutationFn: (batchId: string) => adminApi.rollbackImport(batchId),
    onSuccess: (response, batchId) => {
      setNotice({ message: response.message, warning: response.warning });
      setRollingBack(null);
      queryClient.invalidateQueries({ queryKey: HISTORY_KEY });
      queryClient.invalidateQueries({ queryKey: ["admin", "import", "status", batchId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success("Import rolled back");
    },
    onError: (err) => toast.error(errorMessage(err, "Rollback failed")),
  });

  return (
    <Card title="Import history" bodyClassName="p-0">
      {notice && (
        <div role="status" className="border-b border-line px-4 py-3 text-[13px]">
          <p className="text-ink">{notice.message}</p>
          {notice.warning && <p className="mt-1 text-accent">{notice.warning}</p>}
        </div>
      )}

      {isPending ? (
        <LoadingBlock label="Loading history…" />
      ) : isError ? (
        <div className="p-4">
          <ErrorBlock message={errorMessage(error, "Could not load import history")} onRetry={() => refetch()} />
        </div>
      ) : data.length === 0 ? (
        <EmptyBlock title="No imports yet" message="Runs appear here with their counts, and can be rolled back." />
      ) : (
        <TableScroll>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>File</th>
                <th>Mode</th>
                <th>Status</th>
                <th className="text-right">Created</th>
                <th className="text-right">Updated</th>
                <th className="text-right">Skipped</th>
                <th className="text-right">Errors</th>
                <th>By</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((job) => (
                <tr key={job._id ?? job.batchId}>
                  <td className="meta whitespace-nowrap tabular-nums">{formatDateTime(job.createdAt)}</td>
                  <td className="max-w-[220px] break-words text-ink">{job.fileName || "—"}</td>
                  <td className="meta">{job.mode ?? "—"}</td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="text-right tabular-nums">{job.createdCount ?? 0}</td>
                  <td className="text-right tabular-nums">{job.updatedCount ?? 0}</td>
                  <td className="text-right tabular-nums">{job.skippedCount ?? 0}</td>
                  <td className={job.errorCount ? "text-right tabular-nums text-accent" : "text-right tabular-nums"}>{job.errorCount ?? 0}</td>
                  <td className="whitespace-nowrap text-ink-soft">{job.createdByAdmin?.name || job.createdByAdmin?.email || "—"}</td>
                  <td>
                    {job.batchId && (
                      <div className="flex justify-end gap-2">
                        <button type="button" className="adm-btn adm-btn-sm" onClick={() => setViewing(job.batchId ?? null)}>
                          <Eye className="h-3 w-3" aria-hidden="true" />
                          Details
                        </button>
                        {canDelete && job.status === "completed" && (
                          <button type="button" className="adm-btn-danger adm-btn-sm" onClick={() => setRollingBack(job)}>
                            <Undo2 className="h-3 w-3" aria-hidden="true" />
                            Rollback
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      )}

      <Modal open={Boolean(viewing)} title="Import details" size="lg" onClose={() => setViewing(null)}>
        {viewing && <ImportJobDetails batchId={viewing} />}
      </Modal>

      <ConfirmDialog
        open={Boolean(rollingBack)}
        title="Roll back import"
        message={
          <>
            Deletes every article created by <strong className="text-ink">{rollingBack?.fileName || "this import"}</strong> and restores
            articles it updated to their previous version. This cannot be undone.
          </>
        }
        confirmLabel="Roll back"
        danger
        busy={rollback.isPending}
        onConfirm={() => rollingBack?.batchId && rollback.mutate(rollingBack.batchId)}
        onClose={() => setRollingBack(null)}
      />
    </Card>
  );
}

function ImportJobDetails({ batchId }: { batchId: string }) {
  const { data, isPending, isError, error, refetch } = useImportJob(batchId);

  if (isPending) return <LoadingBlock />;
  if (isError) return <ErrorBlock message={errorMessage(error, "Could not load this import")} onRetry={() => refetch()} />;

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-4">
        <Detail label="File" value={data.fileName || "—"} />
        <Detail label="Mode" value={data.mode ?? "—"} />
        <Detail label="Started" value={formatDateTime(data.createdAt) || "—"} />
        <Detail label="Finished" value={formatDateTime(data.finishedAt) || "—"} />
      </dl>
      <div className="flex items-center gap-3">
        <StatusBadge status={data.status} />
        <span className="meta tabular-nums">{data.totalRows.toLocaleString("en-US")} rows</span>
      </div>
      <JobReport job={data} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-1.5 break-words text-ink">{value}</dd>
    </div>
  );
}
