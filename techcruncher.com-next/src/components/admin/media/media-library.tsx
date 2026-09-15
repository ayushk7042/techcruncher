"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Film, Search, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import type { MediaItem } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { useDebounced } from "@/hooks/use-debounced";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { AdminPageHeader, ConfirmDialog, EmptyBlock, ErrorBlock, LoadingBlock, SimplePager, Spinner } from "../ui";
import { MediaDetailModal } from "./media-detail-modal";
import { MEDIA_KEY, mediaFoldersQuery } from "./media-query";
import { MediaUploadPanel } from "./media-upload-panel";

const PAGE_SIZE = 30;

type MediaType = "all" | "image" | "video";
const TYPES: { value: MediaType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
];

export function MediaLibrary() {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const canPublish = can("canPublish");
  const canDelete = can("canDelete");

  const [folder, setFolder] = useState("all");
  const [type, setType] = useState<MediaType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [detail, setDetail] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const term = useDebounced(search.trim(), 300);

  const folders = useQuery(mediaFoldersQuery);
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: [...MEDIA_KEY, "library", { page, folder, type, term }],
    queryFn: () => adminApi.media({ page, limit: PAGE_SIZE, folder, type, search: term || undefined }),
    placeholderData: keepPreviousData,
  });

  const bulkDelete = useMutation({
    mutationFn: ({ ids, force }: { ids: string[]; force: boolean }) => adminApi.bulkDeleteMedia(ids, force),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY });
      setSelected(new Set());
      setConfirmBulk(false);
      toast.success(`Deleted ${result.deleted} file(s)`);
    },
    onError: (err, { ids, force }) => {
      // The server refuses while articles still show some of the files.
      if (!force && err instanceof ApiError && err.status === 409) {
        if (window.confirm(`${err.message}\n\nArticles using them will show broken images. Delete anyway?`)) {
          bulkDelete.mutate({ ids, force: true });
          return;
        }
        setConfirmBulk(false);
        return;
      }
      toast.error(errorMessage(err, "Could not delete files"));
    },
  });

  const items = data?.data ?? [];
  const folderList = folders.data ?? [];
  const totalFiles = folderList.reduce((sum, f) => sum + f.count, 0);

  const resetPage = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOnPageSelected = items.length > 0 && items.every((item) => selected.has(item._id));

  return (
    <>
      <AdminPageHeader
        title="Media"
        description="Every uploaded or registered image and video. Metadata set here is copied into articles when the file is picked."
        actions={
          canPublish && (
            <button type="button" className={showUpload ? "adm-btn" : "adm-btn-primary"} onClick={() => setShowUpload((v) => !v)}>
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              {showUpload ? "Hide upload" : "Upload"}
            </button>
          )
        }
      />

      {canPublish && showUpload && <MediaUploadPanel folders={folderList.map((f) => f.name)} />}

      <section className="adm-card">
        <div className="adm-card-head flex-wrap">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search media"
              className="adm-input pl-8"
              placeholder="Name, alt text, caption…"
              value={search}
              onChange={(event) => resetPage(setSearch)(event.target.value)}
            />
          </div>
          <select
            aria-label="Folder"
            className="adm-select w-auto"
            value={folder}
            onChange={(event) => resetPage(setFolder)(event.target.value)}
          >
            <option value="all">All folders ({totalFiles})</option>
            {folderList.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.count})
              </option>
            ))}
          </select>
          <div className="flex border border-line" role="group" aria-label="File type">
            {TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={type === option.value}
                onClick={() => resetPage(setType)(option.value)}
                className={cn(
                  "h-9 px-3 font-mono text-[10px] uppercase tracking-eyebrow transition-colors",
                  type === option.value ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {isFetching && !isPending && <Spinner className="h-3.5 w-3.5 text-ink-mute" />}
        </div>

        {items.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2">
            <label className="meta flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={allOnPageSelected}
                onChange={() =>
                  setSelected((current) => {
                    const next = new Set(current);
                    items.forEach((item) => (allOnPageSelected ? next.delete(item._id) : next.add(item._id)));
                    return next;
                  })
                }
              />
              Select page
            </label>
            {selected.size > 0 && (
              <>
                <span className="meta ml-auto">{selected.size} selected</span>
                <button type="button" className="link-muted" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
                {canDelete && (
                  <button type="button" className="adm-btn-danger adm-btn-sm" onClick={() => setConfirmBulk(true)}>
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {error ? (
          <div className="p-4">
            <ErrorBlock message={errorMessage(error, "Could not load media")} onRetry={() => refetch()} />
          </div>
        ) : isPending ? (
          <LoadingBlock />
        ) : !items.length ? (
          <EmptyBlock
            title={term || folder !== "all" || type !== "all" ? "No matches" : "Library is empty"}
            message={term ? `Nothing matches “${term}”.` : "Upload files or add one by URL."}
          />
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {items.map((item) => (
                <MediaTile
                  key={item._id}
                  item={item}
                  selected={selected.has(item._id)}
                  onToggle={() => toggle(item._id)}
                  onOpen={() => setDetail(item)}
                />
              ))}
            </ul>
            {data && <SimplePager page={page} pages={data.pagination.pages} total={data.pagination.total} onChange={setPage} />}
          </>
        )}
      </section>

      {detail && <MediaDetailModal key={detail._id} item={detail} onClose={() => setDetail(null)} />}

      <ConfirmDialog
        open={confirmBulk}
        danger
        title="Delete files"
        confirmLabel={`Delete ${selected.size}`}
        busy={bulkDelete.isPending}
        message={`Delete ${selected.size} file(s) from the library and storage? Articles still using them will show broken media.`}
        onConfirm={() => bulkDelete.mutate({ ids: [...selected], force: false })}
        onClose={() => setConfirmBulk(false)}
      />
    </>
  );
}

function MediaTile({
  item,
  selected,
  onToggle,
  onOpen,
}: {
  item: MediaItem;
  selected: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const isVideo = item.resourceType === "video";
  return (
    <li className={cn("group relative border-2 transition-colors", selected ? "border-accent" : "border-transparent hover:border-ink")}>
      <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Open ${item.name}`}>
        <div className="relative aspect-square w-full overflow-hidden bg-raise">
          {isVideo ? (
            <>
              <video src={item.url} muted preload="metadata" className="h-full w-full object-cover" />
              <span className="chip absolute bottom-1.5 right-1.5 bg-ink px-1.5 py-1 text-canvas">
                <Film className="h-3 w-3" aria-hidden="true" />
                Video
              </span>
            </>
          ) : (
            <img src={item.thumbnailUrl || item.url} alt={item.alt || item.name} loading="lazy" className="h-full w-full object-cover" />
          )}
        </div>
        <span className="block px-1 pt-1.5 text-[12px] font-medium leading-tight text-ink">
          <span className="clamp-1">{item.name}</span>
        </span>
        <span className="meta block px-1 pb-1.5 pt-1">
          {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
          {formatBytes(item.bytes)}
        </span>
      </button>
      <input
        type="checkbox"
        aria-label={`Select ${item.name}`}
        checked={selected}
        onChange={onToggle}
        className={cn(
          "absolute left-1.5 top-1.5 h-4 w-4 cursor-pointer accent-accent transition-opacity",
          selected ? "opacity-100" : "opacity-0 focus:opacity-100 group-hover:opacity-100",
        )}
      />
    </li>
  );
}
