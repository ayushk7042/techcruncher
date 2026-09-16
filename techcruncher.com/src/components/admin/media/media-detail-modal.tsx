"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { MediaItem } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/client";
import { formatBytes, formatDateTime } from "@/lib/format";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { ConfirmDialog, Modal, Spinner, TextAreaField, TextField } from "../ui";
import { isUploadable, MAX_UPLOAD_BYTES, MEDIA_KEY } from "./media-query";

type FormState = Required<Pick<MediaItem, "name" | "folder" | "alt" | "caption" | "title" | "credit" | "redirectUrl">> & {
  tags: string;
};

const toForm = (item: MediaItem): FormState => ({
  name: item.name,
  folder: item.folder,
  alt: item.alt ?? "",
  caption: item.caption ?? "",
  title: item.title ?? "",
  credit: item.credit ?? "",
  redirectUrl: item.redirectUrl ?? "",
  tags: (item.tags ?? []).join(", "),
});

export function MediaDetailModal({ item: initial, onClose }: { item: MediaItem; onClose: () => void }) {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const replaceRef = useRef<HTMLInputElement>(null);
  const [item, setItem] = useState(initial);
  const [form, setForm] = useState<FormState>(() => toForm(initial));
  const [confirmDelete, setConfirmDelete] = useState(false);
  // A derived article asset has no library document, so nothing here can write to it.
  const readOnly = Boolean(item.readOnly);
  const canPublish = can("canPublish") && !readOnly;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const refresh = () => queryClient.invalidateQueries({ queryKey: MEDIA_KEY });
  const url = item.secureUrl || item.url;

  const save = useMutation({
    mutationFn: (state: FormState) =>
      adminApi.updateMedia(item._id, {
        ...state,
        name: state.name.trim() || item.name,
        folder: state.folder.trim() || "uncategorized",
        tags: state.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }),
    onSuccess: ({ data }) => {
      refresh();
      setItem(data);
      setForm(toForm(data));
      toast.success("Media updated");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save media")),
  });

  const replace = useMutation({
    mutationFn: (file: File) => adminApi.replaceMedia(item._id, file),
    onSuccess: ({ data }) => {
      refresh();
      setItem(data);
      toast.success("File replaced");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not replace file")),
  });

  const remove = useMutation({
    mutationFn: (force: boolean) => adminApi.deleteMedia(item._id, force),
    onSuccess: () => {
      refresh();
      toast.success(`Deleted ${item.name}`);
      onClose();
    },
    onError: (error, force) => {
      // The server refuses while an article still shows this file.
      if (!force && error instanceof ApiError && error.status === 409) {
        if (window.confirm(`${error.message}\n\nArticles using it will show a broken image. Delete anyway?`)) {
          remove.mutate(true);
        }
        return;
      }
      toast.error(errorMessage(error, "Could not delete media"));
    },
  });

  const copyUrl = () =>
    navigator.clipboard.writeText(url).then(
      () => toast.success("URL copied"),
      () => toast.error("Could not copy the URL"),
    );

  const facts: [string, string][] = [
    ["Type", item.resourceType],
    ["Format", item.format?.toUpperCase() || "—"],
    ["Dimensions", item.width && item.height ? `${item.width} × ${item.height}` : "—"],
    ["Size", formatBytes(item.bytes)],
    ["Original", item.originalName || "—"],
    ["Added", formatDateTime(item.createdAt) || "—"],
  ];

  return (
    <>
      <Modal
        open
        size="xl"
        title={item.name}
        onClose={onClose}
        footer={
          <>
            {can("canDelete") && (
              <button type="button" className="adm-btn-danger mr-auto" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete
              </button>
            )}
            <button type="button" className="adm-btn" onClick={onClose}>
              Close
            </button>
            {canPublish && (
              <button type="submit" form="media-detail-form" className="adm-btn-primary" disabled={save.isPending}>
                {save.isPending && <Spinner className="h-3.5 w-3.5" />}
                Save changes
              </button>
            )}
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="flex items-center justify-center border border-line bg-raise">
              {item.resourceType === "video" ? (
                <video key={url} src={url} controls className="max-h-[420px] w-full" />
              ) : (
                <img src={url} alt={item.alt || item.name} className="max-h-[420px] w-full object-contain" />
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <input className="adm-input font-mono text-[12px]" readOnly value={url} aria-label="File URL" onFocus={(e) => e.target.select()} />
              <button type="button" className="adm-btn shrink-0" onClick={copyUrl}>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy
              </button>
              <a href={url} target="_blank" rel="noreferrer" className="adm-btn shrink-0" aria-label="Open file in a new tab">
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            <dl className="mt-4 grid grid-cols-2 border-t border-line">
              {facts.map(([label, value]) => (
                <div key={label} className="border-b border-line py-2 pr-2">
                  <dt className="eyebrow">{label}</dt>
                  <dd className="mt-1 truncate text-[13px] text-ink" title={value}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {canPublish && (
              <div className="mt-4">
                <button
                  type="button"
                  className="adm-btn"
                  disabled={replace.isPending}
                  onClick={() => replaceRef.current?.click()}
                >
                  {replace.isPending ? <Spinner className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
                  Replace file
                </button>
                <p className="adm-hint">Keeps this entry and its URL references; the old file is removed from storage.</p>
                <input
                  ref={replaceRef}
                  type="file"
                  accept={item.resourceType === "video" ? "video/*" : "image/*"}
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    if (!isUploadable(file) || file.size > MAX_UPLOAD_BYTES) {
                      toast.error(`Choose an image or video up to ${formatBytes(MAX_UPLOAD_BYTES)}.`);
                      return;
                    }
                    replace.mutate(file);
                  }}
                />
              </div>
            )}
          </div>

          <form
            id="media-detail-form"
            className="grid content-start gap-4 sm:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(form);
            }}
          >
            <fieldset disabled={!canPublish} className="contents">
              <TextField label="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              <TextField label="Folder" value={form.folder} onChange={(e) => set("folder", e.target.value)} />
              <TextField
                label="Alt text"
                className="sm:col-span-2"
                hint="Describes the image for screen readers and search."
                value={form.alt}
                onChange={(e) => set("alt", e.target.value)}
              />
              <TextAreaField label="Caption" className="sm:col-span-2" value={form.caption} onChange={(e) => set("caption", e.target.value)} />
              <TextField label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} />
              <TextField label="Credit" value={form.credit} onChange={(e) => set("credit", e.target.value)} />
              <TextField
                label="Redirect URL"
                type="url"
                className="sm:col-span-2"
                value={form.redirectUrl}
                onChange={(e) => set("redirectUrl", e.target.value)}
              />
              <TextField
                label="Tags"
                className="sm:col-span-2"
                hint="Comma separated."
                value={form.tags}
                onChange={(e) => set("tags", e.target.value)}
              />
            </fieldset>
          </form>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Delete media"
        confirmLabel="Delete"
        busy={remove.isPending}
        message={
          <>
            Delete <strong className="text-ink">{item.name}</strong> from the library and storage? Articles still pointing at
            its URL will show a broken image.
          </>
        }
        onConfirm={() => remove.mutate(false)}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
