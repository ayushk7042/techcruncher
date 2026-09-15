"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link2, UploadCloud } from "lucide-react";
import { useId, useRef, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/lib/format";
import { useToast } from "../toast";
import { Spinner } from "../ui";
import { isUploadable, MAX_UPLOAD_BYTES, MEDIA_KEY } from "./media-query";

/** Small batches give real progress feedback and stay far below the 30-file request cap. */
const BATCH_SIZE = 5;

export function MediaUploadPanel({ folders }: { folders: string[] }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const folderListId = useId();
  const [folder, setFolder] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [url, setUrl] = useState("");

  const targetFolder = folder.trim() || undefined;

  async function upload(fileList: FileList | File[]) {
    const files = [...fileList];
    const accepted = files.filter((file) => isUploadable(file) && file.size <= MAX_UPLOAD_BYTES);
    const rejected = files.length - accepted.length;
    if (rejected) toast.error(`${rejected} file(s) skipped: only images and videos up to ${formatBytes(MAX_UPLOAD_BYTES)}.`);
    if (!accepted.length) return;

    let done = 0;
    setProgress({ done, total: accepted.length });
    try {
      for (let start = 0; start < accepted.length; start += BATCH_SIZE) {
        const batch = accepted.slice(start, start + BATCH_SIZE);
        await adminApi.uploadMediaMany(batch, targetFolder);
        done += batch.length;
        setProgress({ done, total: accepted.length });
      }
      toast.success(`Uploaded ${done} file(s)`);
    } catch (error) {
      toast.error(errorMessage(error, done ? `Upload stopped after ${done} file(s)` : "Upload failed"));
    } finally {
      setProgress(null);
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY });
    }
  }

  const register = useMutation({
    mutationFn: (link: string) => adminApi.registerMedia({ url: link, folder: targetFolder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY });
      setUrl("");
      toast.success("Added to the library");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not add URL")),
  });

  const uploading = progress !== null;

  return (
    <section className="adm-card mb-6">
      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!uploading) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            if (!uploading) upload(event.dataTransfer.files);
          }}
          className={cn(
            "m-4 flex min-h-[180px] flex-col items-center justify-center gap-3 border-2 border-dashed px-4 py-8 text-center transition-colors",
            dragging ? "border-accent bg-raise" : "border-line-strong",
          )}
        >
          {uploading ? (
            <div className="w-full max-w-sm" role="status" aria-live="polite">
              <p className="meta mb-3 flex items-center justify-center gap-2">
                <Spinner className="h-3.5 w-3.5" />
                Uploading {progress.done} of {progress.total}
              </p>
              <div className="h-1.5 w-full bg-raise">
                <div className="h-full bg-accent transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
            </div>
          ) : (
            <>
              <UploadCloud className="h-7 w-7 text-ink-mute" aria-hidden="true" />
              <p className="headline text-[18px] uppercase">Drop files to upload</p>
              <p className="meta">Images or videos, up to {formatBytes(MAX_UPLOAD_BYTES)} each</p>
              <button type="button" className="adm-btn adm-btn-sm mt-1" onClick={() => inputRef.current?.click()}>
                Choose files
              </button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) upload(event.target.files);
              event.target.value = "";
            }}
          />
        </div>

        <div className="space-y-4 border-t border-line p-4 lg:border-l lg:border-t-0">
          <div>
            <label htmlFor={`${folderListId}-folder`} className="adm-label">
              Target folder
            </label>
            <input
              id={`${folderListId}-folder`}
              className="adm-input"
              list={folderListId}
              placeholder="uncategorized"
              value={folder}
              disabled={uploading}
              onChange={(event) => setFolder(event.target.value)}
            />
            <datalist id={folderListId}>
              {folders.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <p className="adm-hint">Applies to uploads and URLs added here.</p>
          </div>

          <form
            className="border-t border-line pt-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (url.trim()) register.mutate(url.trim());
            }}
          >
            <label htmlFor={`${folderListId}-url`} className="adm-label">
              Add by URL
            </label>
            <div className="flex gap-2">
              <input
                id={`${folderListId}-url`}
                type="url"
                className="adm-input"
                placeholder="https://…/image.jpg"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <button type="submit" className="adm-btn shrink-0" disabled={!url.trim() || register.isPending}>
                {register.isPending ? <Spinner className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
                Add
              </button>
            </div>
            <p className="adm-hint">Registers an external image without re-uploading it.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
