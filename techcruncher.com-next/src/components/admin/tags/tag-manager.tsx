"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Combine, Pencil, Plus, RefreshCw, Search, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Tag } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { compactNumber } from "@/lib/format";
import { useDebounced } from "@/hooks/use-debounced";
import { useAdminAuth } from "../auth-provider";
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
import { TagFormModal } from "./tag-form-modal";
import { TagMergeDialog } from "./tag-merge-dialog";
import { TAGS_KEY, type TagSort } from "./tag-query";

const PAGE_SIZE = 25;

const SORTS: { value: TagSort; label: string }[] = [
  { value: "popular", label: "Most used" },
  { value: "name", label: "Name A–Z" },
  { value: "latest", label: "Newest" },
];

type Editing = { mode: "create" } | { mode: "edit"; tag: Tag };
type Dialog = { kind: "delete"; tag: Tag } | { kind: "bulk-delete" } | { kind: "merge" };

export function TagManager() {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const canPublish = can("canPublish");
  const canDelete = can("canDelete");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<TagSort>("popular");
  // Kept as a map so selections survive paging and the merge dialog can show names.
  const [selected, setSelected] = useState<Map<string, Tag>>(() => new Map());
  const [editing, setEditing] = useState<Editing | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const term = useDebounced(search.trim(), 300);

  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: [...TAGS_KEY, "list", { page, term, sort }],
    queryFn: () => adminApi.tags({ page, limit: PAGE_SIZE, search: term || undefined, sort }),
    placeholderData: keepPreviousData,
  });

  const tags = data?.data ?? [];

  const afterWrite = (message: string) => {
    queryClient.invalidateQueries({ queryKey: TAGS_KEY });
    setSelected(new Map());
    setDialog(null);
    toast.success(message);
  };
  const onError = (fallback: string) => (err: unknown) => toast.error(errorMessage(err, fallback));

  const removeOne = useMutation({
    mutationFn: (tag: Tag) => adminApi.deleteTag(tag._id),
    onSuccess: (_, tag) => afterWrite(`Deleted ${tag.name}`),
    onError: onError("Could not delete tag"),
  });

  const removeMany = useMutation({
    mutationFn: (ids: string[]) => adminApi.bulkDeleteTags(ids),
    onSuccess: (result) => afterWrite(`Deleted ${result.deleted} tag(s)`),
    onError: onError("Could not delete tags"),
  });

  const merge = useMutation({
    mutationFn: ({ sourceIds, targetId }: { sourceIds: string[]; targetId: string }) => adminApi.mergeTags(sourceIds, targetId),
    onSuccess: (result) => afterWrite(result.message || "Tags merged"),
    onError: onError("Could not merge tags"),
  });

  const recount = useMutation({
    mutationFn: adminApi.recountTags,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast.success(result.message);
    },
    onError: onError("Could not recount tags"),
  });

  const toggleOne = (tag: Tag) =>
    setSelected((current) => {
      const next = new Map(current);
      if (next.has(tag._id)) next.delete(tag._id);
      else next.set(tag._id, tag);
      return next;
    });

  const allOnPageSelected = tags.length > 0 && tags.every((tag) => selected.has(tag._id));
  const togglePage = () =>
    setSelected((current) => {
      const next = new Map(current);
      tags.forEach((tag) => (allOnPageSelected ? next.delete(tag._id) : next.set(tag._id, tag)));
      return next;
    });

  const selectedTags = [...selected.values()];

  return (
    <>
      <AdminPageHeader
        title="Tags"
        description="Topics attached to articles. Merge duplicates to consolidate their archives."
        actions={
          canPublish && (
            <>
              <button type="button" className="adm-btn" onClick={() => recount.mutate()} disabled={recount.isPending}>
                {recount.isPending ? <Spinner className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
                Recount usage
              </button>
              <button type="button" className="adm-btn-primary" onClick={() => setEditing({ mode: "create" })}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                New tag
              </button>
            </>
          )
        }
      />

      <section className="adm-card">
        <div className="adm-card-head flex-wrap">
          <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search tags"
              className="adm-input pl-8"
              placeholder="Search tags…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            {isFetching && !isPending && <Spinner className="h-3.5 w-3.5 text-ink-mute" />}
            <label htmlFor="tag-sort" className="eyebrow">
              Sort
            </label>
            <select
              id="tag-sort"
              className="adm-select w-auto"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as TagSort);
                setPage(1);
              }}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-line bg-raise px-4 py-2">
            <span className="meta mr-auto">{selected.size} selected</span>
            <button type="button" className="link-muted mr-2" onClick={() => setSelected(new Map())}>
              Clear
            </button>
            {canPublish && (
              <button
                type="button"
                className="adm-btn adm-btn-sm"
                disabled={selected.size < 2}
                title={selected.size < 2 ? "Select at least two tags" : undefined}
                onClick={() => setDialog({ kind: "merge" })}
              >
                <Combine className="h-3 w-3" aria-hidden="true" />
                Merge
              </button>
            )}
            {canDelete && (
              <button type="button" className="adm-btn-danger adm-btn-sm" onClick={() => setDialog({ kind: "bulk-delete" })}>
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                Delete
              </button>
            )}
          </div>
        )}

        {error ? (
          <div className="p-4">
            <ErrorBlock message={errorMessage(error, "Could not load tags")} onRetry={() => refetch()} />
          </div>
        ) : isPending ? (
          <LoadingBlock />
        ) : !tags.length ? (
          <EmptyBlock title={term ? "No matches" : "No tags"} message={term ? `Nothing matches “${term}”.` : undefined} />
        ) : (
          <>
            <TableScroll>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th className="w-8">
                      <input type="checkbox" aria-label="Select all on this page" checked={allOnPageSelected} onChange={togglePage} />
                    </th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th className="text-right">Usage</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((tag) => (
                    <tr key={tag._id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${tag.name}`}
                          checked={selected.has(tag._id)}
                          onChange={() => toggleOne(tag)}
                        />
                      </td>
                      <td className="font-medium text-ink">{tag.name}</td>
                      <td className="meta">{tag.slug}</td>
                      <td className="text-right font-mono text-[12px] tabular-nums">{compactNumber(tag.usageCount)}</td>
                      <td>
                        {tag.featured ? (
                          <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-label="Featured" />
                        ) : (
                          <span className="text-ink-mute">—</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={tag.status} />
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          {canPublish && (
                            <button type="button" className="adm-btn adm-btn-sm" onClick={() => setEditing({ mode: "edit", tag })}>
                              <Pencil className="h-3 w-3" aria-hidden="true" />
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              className="adm-btn adm-btn-sm hover:border-accent hover:text-accent"
                              aria-label={`Delete ${tag.name}`}
                              onClick={() => setDialog({ kind: "delete", tag })}
                            >
                              <Trash2 className="h-3 w-3" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
            {data && <SimplePager page={page} pages={data.pagination.pages} total={data.pagination.total} onChange={setPage} />}
          </>
        )}
      </section>

      {editing && (
        <TagFormModal
          key={editing.mode === "edit" ? editing.tag._id : "new"}
          tag={editing.mode === "edit" ? editing.tag : undefined}
          onClose={() => setEditing(null)}
        />
      )}

      {dialog?.kind === "delete" && (
        <ConfirmDialog
          open
          danger
          title="Delete tag"
          confirmLabel="Delete"
          busy={removeOne.isPending}
          message={
            <>
              Delete <strong className="text-ink">{dialog.tag.name}</strong>? It is removed from{" "}
              {dialog.tag.usageCount} article(s).
            </>
          }
          onConfirm={() => removeOne.mutate(dialog.tag)}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.kind === "bulk-delete" && (
        <ConfirmDialog
          open
          danger
          title="Delete tags"
          confirmLabel={`Delete ${selected.size}`}
          busy={removeMany.isPending}
          message={`Delete ${selected.size} selected tag(s)? They are removed from every article that uses them.`}
          onConfirm={() => removeMany.mutate([...selected.keys()])}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.kind === "merge" && (
        <TagMergeDialog
          tags={selectedTags}
          busy={merge.isPending}
          onMerge={(sourceIds, targetId) => merge.mutate({ sourceIds, targetId })}
          onClose={() => setDialog(null)}
        />
      )}
    </>
  );
}
