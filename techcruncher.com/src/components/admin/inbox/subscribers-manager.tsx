"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Subscriber } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { formatDate } from "@/lib/format";
import { useDebounced } from "@/hooks/use-debounced";
import { useAdminAuth } from "../auth-provider";
import { TextTabs } from "../controls";
import { useToast } from "../toast";
import {
  AdminPageHeader,
  ConfirmDialog,
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
  SimplePager,
  Spinner,
  StatusBadge,
  TableScroll,
} from "../ui";
import { downloadCsv } from "./csv";
import { SUBSCRIBERS_KEY } from "./keys";

type StatusFilter = "all" | Subscriber["status"];

const PAGE_SIZE = 50;
/** The API caps `limit` at 200. */
const EXPORT_PAGE_SIZE = 200;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Subscribed", value: "subscribed" },
  { label: "Unsubscribed", value: "unsubscribed" },
];

interface Filters {
  status?: string;
  search?: string;
}

async function fetchAllSubscribers(filters: Filters): Promise<Subscriber[]> {
  const all: Subscriber[] = [];
  let page = 1;
  let pages = 1;
  do {
    const response = await adminApi.subscribers({ ...filters, page, limit: EXPORT_PAGE_SIZE });
    all.push(...response.data);
    pages = response.pagination.pages;
    page += 1;
  } while (page <= pages);
  return all;
}

export function SubscribersManager() {
  const { can } = useAdminAuth();
  const canDelete = can("canDelete");
  const toast = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const term = useDebounced(search.trim(), 300);
  const [pendingDelete, setPendingDelete] = useState<Subscriber | null>(null);
  const [exporting, setExporting] = useState(false);

  const filters: Filters = { status: status === "all" ? undefined : status, search: term || undefined };

  const { data, isPending, isError, error, refetch, isPlaceholderData } = useQuery({
    queryKey: [...SUBSCRIBERS_KEY, page, status, term],
    queryFn: () => adminApi.subscribers({ ...filters, page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const remove = useMutation({
    mutationFn: (subscriber: Subscriber) => adminApi.deleteSubscriber(subscriber._id),
    onSuccess: () => {
      // Deleting the last row on a page would otherwise leave an empty page behind.
      if (data?.data.length === 1 && page > 1) setPage(page - 1);
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: SUBSCRIBERS_KEY });
      toast.success("Subscriber removed");
    },
    onError: (err) => toast.error(errorMessage(err, "Could not remove the subscriber")),
  });

  async function exportCsv() {
    setExporting(true);
    try {
      const rows = await fetchAllSubscribers(filters);
      downloadCsv(`subscribers-${status}-${new Date().toISOString().slice(0, 10)}.csv`, [
        ["Email", "Name", "Source", "Status", "Joined", "Unsubscribed"],
        ...rows.map((s) => [s.email, s.name ?? "", s.source ?? "", s.status, s.createdAt, s.unsubscribedAt ?? ""]),
      ]);
      toast.success(`Exported ${rows.length.toLocaleString("en-US")} subscribers`);
    } catch (err) {
      toast.error(errorMessage(err, "Export failed"));
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Subscribers"
        description="Newsletter sign-ups from the public site."
        actions={
          <>
            {data && (
              <span className="meta mr-2 flex items-baseline gap-1.5">
                <span className="headline text-[24px] tabular-nums">{data.stats.active.toLocaleString("en-US")}</span>
                active
              </span>
            )}
            <button type="button" className="adm-btn" onClick={exportCsv} disabled={exporting || !data?.pagination.total}>
              {exporting ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
              Export CSV
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TextTabs
          label="Filter subscribers by status"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(next) => {
            setStatus(next);
            setPage(1);
          }}
        />
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
          <input
            type="search"
            className="adm-input pl-8"
            placeholder="Search by email…"
            aria-label="Search subscribers"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <section className="adm-card">
        {isPending ? (
          <LoadingBlock label="Loading subscribers…" />
        ) : isError ? (
          <div className="p-4">
            <ErrorBlock message={errorMessage(error, "Could not load subscribers")} onRetry={() => refetch()} />
          </div>
        ) : data.data.length === 0 ? (
          <EmptyBlock title="No subscribers" message={term || status !== "all" ? "Nothing matches these filters." : undefined} />
        ) : (
          <>
            <TableScroll>
              <table className={isPlaceholderData ? "adm-table opacity-60" : "adm-table"}>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Unsubscribed</th>
                    {canDelete && <th className="text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((subscriber) => (
                    <tr key={subscriber._id}>
                      <td className="break-all font-medium text-ink">{subscriber.email}</td>
                      <td className="text-ink-soft">{subscriber.name || "—"}</td>
                      <td className="meta whitespace-nowrap">{subscriber.source || "—"}</td>
                      <td>
                        <StatusBadge status={subscriber.status} />
                      </td>
                      <td className="meta whitespace-nowrap tabular-nums">{formatDate(subscriber.createdAt)}</td>
                      <td className="meta whitespace-nowrap tabular-nums">{formatDate(subscriber.unsubscribedAt) || "—"}</td>
                      {canDelete && (
                        <td className="text-right">
                          <button
                            type="button"
                            className="adm-btn-danger adm-btn-sm"
                            aria-label={`Delete ${subscriber.email}`}
                            onClick={() => setPendingDelete(subscriber)}
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
            <SimplePager page={page} pages={data.pagination.pages} total={data.pagination.total} onChange={setPage} />
          </>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete subscriber"
        message={`Remove ${pendingDelete?.email ?? "this subscriber"} from the list permanently? To keep a record, leave them unsubscribed instead.`}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => pendingDelete && remove.mutate(pendingDelete)}
        onClose={() => setPendingDelete(null)}
      />
    </>
  );
}
