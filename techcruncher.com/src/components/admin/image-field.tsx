"use client";

import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Library, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { ImageAsset, MediaItem } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { useDebounced } from "@/hooks/use-debounced";
import { useToast } from "./toast";
import { LoadingBlock, Modal, SimplePager, Spinner } from "./ui";

/* ------------------------------------------------------------------ */
/* Media library picker                                                */
/* ------------------------------------------------------------------ */

export function MediaPicker({
  open,
  onClose,
  onPick,
  multiple = false,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (items: MediaItem[]) => void;
  multiple?: boolean;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MediaItem[]>([]);
  const term = useDebounced(search, 300);

  const { data, isPending } = useQuery({
    queryKey: ["admin", "media", "picker", page, term],
    queryFn: () => adminApi.media({ page, limit: 24, search: term || undefined, type: "image" }),
    enabled: open,
  });

  const toggle = (item: MediaItem) => {
    if (!multiple) {
      onPick([item]);
      onClose();
      return;
    }
    setSelected((list) => (list.some((i) => i._id === item._id) ? list.filter((i) => i._id !== item._id) : [...list, item]));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Media library"
      size="xl"
      footer={
        multiple ? (
          <>
            <span className="meta mr-auto self-center">{selected.length} selected</span>
            <button type="button" className="adm-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="adm-btn-primary"
              disabled={!selected.length}
              onClick={() => {
                onPick(selected);
                setSelected([]);
                onClose();
              }}
            >
              Insert selected
            </button>
          </>
        ) : undefined
      }
    >
      <input
        className="adm-input mb-4"
        placeholder="Search by name, alt text or caption…"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />
      {isPending ? (
        <LoadingBlock />
      ) : !data?.data.length ? (
        <p className="py-10 text-center text-[13px] text-ink-mute">No images in the library yet. Upload one from the field.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {data.data.map((item) => {
              const isSelected = selected.some((i) => i._id === item._id);
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => toggle(item)}
                  className={cn(
                    "group relative border-2 text-left transition-colors",
                    isSelected ? "border-accent" : "border-transparent hover:border-ink",
                  )}
                >
                  <img src={item.thumbnailUrl || item.url} alt={item.alt || item.name} className="aspect-square w-full bg-raise object-cover" />
                  <span className="meta clamp-1 block px-1 py-1.5">{item.name}</span>
                </button>
              );
            })}
          </div>
          <SimplePager page={page} pages={data.pagination.pages} total={data.pagination.total} onChange={setPage} />
        </>
      )}
    </Modal>
  );
}

export const mediaToImage = (item: MediaItem): ImageAsset => ({
  public_id: item.public_id,
  url: item.secureUrl || item.url,
  thumbnailUrl: item.thumbnailUrl,
  width: item.width,
  height: item.height,
  format: item.format,
  alt: item.alt,
  caption: item.caption,
  title: item.title,
  credit: item.credit,
  redirectUrl: item.redirectUrl,
});

/* ------------------------------------------------------------------ */
/* Single image field                                                  */
/* ------------------------------------------------------------------ */

interface ImageFieldProps {
  label: string;
  value?: ImageAsset;
  onChange: (value: ImageAsset | undefined) => void;
  folder?: string;
  /** Show alt / caption / credit inputs under the preview. */
  withMeta?: boolean;
  hint?: string;
}

export function ImageField({ label, value, onChange, folder = "articles", withMeta = true, hint }: ImageFieldProps) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const patch = (next: Partial<ImageAsset>) => onChange({ ...(value || {}), ...next });

  async function upload(file: File) {
    setUploading(true);
    try {
      const { data } = await adminApi.uploadMedia(file, { folder });
      onChange({ ...mediaToImage(data), alt: value?.alt || data.alt, caption: value?.caption || data.caption });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(errorMessage(error, "Upload failed"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="adm-label">{label}</span>
      <div className="border border-line">
        {value?.url ? (
          <img src={value.url} alt={value.alt || ""} className="aspect-[16/9] w-full bg-raise object-cover" />
        ) : (
          <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 bg-raise text-ink-mute">
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
            <span className="eyebrow">No image</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 border-t border-line p-2">
          <button type="button" className="adm-btn adm-btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Spinner className="h-3 w-3" /> : <Upload className="h-3 w-3" aria-hidden="true" />}
            Upload
          </button>
          <button type="button" className="adm-btn adm-btn-sm" onClick={() => setPickerOpen(true)}>
            <Library className="h-3 w-3" aria-hidden="true" />
            Library
          </button>
          {value?.url && (
            <button type="button" className="adm-btn adm-btn-sm ml-auto" onClick={() => onChange(undefined)}>
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = "";
        }}
      />

      <div className="mt-2 space-y-2">
        <input
          className="adm-input"
          placeholder="…or paste an image URL"
          value={value?.url || ""}
          onChange={(event) => (event.target.value ? patch({ url: event.target.value, public_id: "" }) : onChange(undefined))}
        />
        {withMeta && value?.url && (
          <div className="grid gap-2 sm:grid-cols-2">
            <input className="adm-input" placeholder="Alt text" value={value.alt || ""} onChange={(e) => patch({ alt: e.target.value })} />
            <input className="adm-input" placeholder="Credit" value={value.credit || ""} onChange={(e) => patch({ credit: e.target.value })} />
            <input
              className="adm-input sm:col-span-2"
              placeholder="Caption"
              value={value.caption || ""}
              onChange={(e) => patch({ caption: e.target.value })}
            />
          </div>
        )}
      </div>
      {hint && <p className="adm-hint">{hint}</p>}

      <MediaPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={([item]) => item && onChange(mediaToImage(item))} />
    </div>
  );
}
