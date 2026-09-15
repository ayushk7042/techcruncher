"use client";

import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ContactMessage } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { TextTabs } from "../controls";
import { EmptyBlock, ErrorBlock, LoadingBlock, StatusBadge } from "../ui";
import { ContactDetail } from "./contact-detail";
import { CONTACTS_KEY } from "./keys";

type StatusFilter = "all" | ContactMessage["status"];

const STATUS_LABELS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Replied", value: "replied" },
  { label: "Closed", value: "closed" },
];

export function ContactInbox() {
  const { data, isPending, isError, error, refetch } = useQuery({ queryKey: CONTACTS_KEY, queryFn: adminApi.contacts });
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const tabs = useMemo(
    () =>
      STATUS_LABELS.map((tab) => ({
        ...tab,
        count: (data ?? []).filter((message) => tab.value === "all" || message.status === tab.value).length,
      })),
    [data],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter(
      (message) =>
        (status === "all" || message.status === status) &&
        (!term || [message.name, message.email, message.subject, message.message].some((field) => field?.toLowerCase().includes(term))),
    );
  }, [data, status, search]);

  const selected = data?.find((message) => message._id === selectedId) ?? null;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TextTabs label="Filter messages by status" options={tabs} value={status} onChange={setStatus} />
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
          <input
            type="search"
            className="adm-input pl-8"
            placeholder="Search name, email, message…"
            aria-label="Search messages"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {isPending ? (
        <LoadingBlock label="Loading messages…" />
      ) : isError ? (
        <ErrorBlock message={errorMessage(error, "Could not load messages")} onRetry={() => refetch()} />
      ) : (
        <div className="grid border border-line bg-paper lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="border-b border-line lg:border-b-0 lg:border-r">
            {visible.length === 0 ? (
              <EmptyBlock title="No messages" message={data.length ? "Nothing matches this filter." : "The inbox is empty."} />
            ) : (
              <ul className="max-h-[72vh] overflow-y-auto">
                {visible.map((message) => {
                  const active = message._id === selectedId;
                  return (
                    <li key={message._id} className="border-b border-line last:border-b-0">
                      <button
                        type="button"
                        aria-current={active || undefined}
                        onClick={() => setSelectedId(message._id)}
                        className={cn(
                          "block w-full border-l-2 px-4 py-3 text-left transition-colors",
                          active ? "border-accent bg-raise" : "border-transparent hover:bg-raise/60",
                        )}
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className={cn("truncate text-[13.5px] text-ink", message.status === "new" && "font-semibold")}>
                            {message.name}
                          </span>
                          <span className="meta shrink-0 tabular-nums">{formatDate(message.createdAt)}</span>
                        </span>
                        <span className="mt-1 block truncate text-[13px] text-ink-soft">{message.subject || "(No subject)"}</span>
                        <span className="mt-2 flex items-center justify-between gap-3">
                          <span className="meta truncate">{message.email}</span>
                          <StatusBadge status={message.status} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="min-w-0">
            {selected ? (
              <ContactDetail key={selected._id} contact={selected} onDeleted={() => setSelectedId(null)} />
            ) : (
              <EmptyBlock title="Select a message" message="Pick a message from the list to read it and reply." />
            )}
          </div>
        </div>
      )}
    </>
  );
}
