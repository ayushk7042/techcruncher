"use client";

import { ArrowDown, ArrowUp, Library, Plus, X } from "lucide-react";
import { useState } from "react";
import { MediaPicker, mediaToImage } from "@/components/admin/image-field";
import { SelectField, TextField } from "@/components/admin/ui";
import type { ImageAsset, Video } from "@/types/api";
import { CollapsibleCard } from "./collapsible-card";
import { IconButton } from "../controls";
import { moveItem, replaceItem, type SectionProps } from "./news-form-state";

const PROVIDER_OPTIONS = ["youtube", "vimeo", "file", "other"].map((value) => ({ label: value, value }));

function GalleryEditor({ images, onChange }: { images: ImageAsset[]; onChange: (images: ImageAsset[]) => void }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const patch = (index: number, value: Partial<ImageAsset>) => onChange(replaceItem(images, index, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="adm-label mb-0">Gallery</span>
        <button type="button" className="adm-btn adm-btn-sm" onClick={() => setPickerOpen(true)}>
          <Library className="h-3 w-3" aria-hidden="true" /> Add images
        </button>
      </div>

      {images.length ? (
        <ol className="divide-y divide-line border border-line">
          {images.map((image, index) => (
            <li key={`${image.url}-${index}`} className="flex flex-wrap items-start gap-3 p-2 sm:flex-nowrap">
              <img src={image.thumbnailUrl || image.url} alt={image.alt || ""} className="h-16 w-24 shrink-0 bg-raise object-cover" />
              <div className="grid min-w-0 flex-1 gap-2">
                <input
                  className="adm-input"
                  placeholder="Caption"
                  aria-label={`Caption for image ${index + 1}`}
                  value={image.caption || ""}
                  onChange={(event) => patch(index, { caption: event.target.value })}
                />
                <input
                  className="adm-input"
                  placeholder="Alt text"
                  aria-label={`Alt text for image ${index + 1}`}
                  value={image.alt || ""}
                  onChange={(event) => patch(index, { alt: event.target.value })}
                />
                <input
                  className="adm-input"
                  type="url"
                  placeholder="Redirect link — https:// (optional)"
                  aria-label={`Redirect link for image ${index + 1}`}
                  value={image.redirectUrl || ""}
                  onChange={(event) => patch(index, { redirectUrl: event.target.value })}
                />
              </div>
              <div className="flex shrink-0 gap-0.5">
                <IconButton label="Move up" icon={ArrowUp} disabled={index === 0} onClick={() => onChange(moveItem(images, index, index - 1))} />
                <IconButton
                  label="Move down"
                  icon={ArrowDown}
                  disabled={index === images.length - 1}
                  onClick={() => onChange(moveItem(images, index, index + 1))}
                />
                <IconButton label="Remove image" icon={X} danger onClick={() => onChange(images.filter((_, i) => i !== index))} />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="adm-hint">No gallery images.</p>
      )}

      <MediaPicker
        multiple
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(items) => onChange([...images, ...items.map(mediaToImage)])}
      />
    </div>
  );
}

function VideosEditor({ videos, onChange }: { videos: Video[]; onChange: (videos: Video[]) => void }) {
  const patch = (index: number, value: Partial<Video>) => onChange(replaceItem(videos, index, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="adm-label mb-0">Videos</span>
        <button type="button" className="adm-btn adm-btn-sm" onClick={() => onChange([...videos, { url: "" }])}>
          <Plus className="h-3 w-3" aria-hidden="true" /> Add video
        </button>
      </div>

      {videos.length ? (
        <ol className="space-y-3">
          {videos.map((video, index) => (
            <li key={index} className="border border-line p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Video URL"
                  type="url"
                  className="sm:col-span-2"
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={video.url}
                  onChange={(event) => patch(index, { url: event.target.value })}
                />
                <TextField label="Title" value={video.title || ""} onChange={(event) => patch(index, { title: event.target.value })} />
                <TextField label="Caption" value={video.caption || ""} onChange={(event) => patch(index, { caption: event.target.value })} />
                <SelectField
                  label="Provider"
                  placeholder="Detect"
                  options={PROVIDER_OPTIONS}
                  value={video.provider || ""}
                  onChange={(event) => patch(index, { provider: event.target.value })}
                />
                <TextField
                  label="Duration (seconds)"
                  type="number"
                  min={0}
                  value={video.duration ?? ""}
                  onChange={(event) => patch(index, { duration: event.target.value ? Number(event.target.value) : undefined })}
                />
              </div>
              <button type="button" className="link-muted mt-3" onClick={() => onChange(videos.filter((_, i) => i !== index))}>
                Remove video
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="adm-hint">No videos.</p>
      )}
    </div>
  );
}

export function MediaCard({ form, set }: SectionProps) {
  const count = form.gallery.length + form.videos.length;
  return (
    <CollapsibleCard title={count ? `Media (${count})` : "Media"}>
      <GalleryEditor images={form.gallery} onChange={(images) => set("gallery", images)} />
      <VideosEditor videos={form.videos} onChange={(videos) => set("videos", videos)} />
    </CollapsibleCard>
  );
}
