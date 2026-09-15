"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import type { News, Paginated } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { formatDate, pad2 } from "@/lib/format";
import { categoryOf, newsDate, newsHref } from "@/lib/news";
import { FeedGate, feedState } from "./feed-gate";
import { collectPhotos, type Photo } from "./media";
import { MediaDialog } from "./media-dialog";
import { MEDIA_PARAMS } from "./params";
import { useTopicNews } from "./use-topic-news";

const arrowButton =
  "absolute top-1/2 z-10 -translate-y-1/2 rounded-sm p-2 text-white/70 transition-colors hover:text-white";

function PhotoViewer({
  photos,
  index,
  onNavigate,
  onClose,
}: {
  photos: Photo[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}) {
  const { image, story, url } = photos[index];
  const step = useCallback(
    (delta: number) => onNavigate((index + delta + photos.length) % photos.length),
    [index, photos.length, onNavigate],
  );
  const onKey = useCallback(
    (key: string) => {
      if (key === "ArrowLeft") step(-1);
      if (key === "ArrowRight") step(1);
    },
    [step],
  );
  const date = formatDate(newsDate(story));

  return (
    <MediaDialog label={image.alt || story.title} onClose={onClose} onKey={onKey}>
      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => step(-1)} aria-label="Previous photograph" className={`${arrowButton} left-2 sm:left-4`}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next photograph" className={`${arrowButton} right-2 sm:right-4`}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}

      <figure className="flex w-full max-w-5xl flex-col items-center px-8">
        <img src={url} alt={image.alt || story.title} className="max-h-[72vh] max-w-full object-contain" />
        <figcaption className="mt-5 w-full max-w-2xl text-center">
          <p className="eyebrow text-white/45">
            {categoryOf(story)?.name ?? "Photography"}
            <span className="ml-3 tabular-nums text-white/30">
              {pad2(index + 1)} / {pad2(photos.length)}
            </span>
          </p>
          <h2 className="headline mt-3 text-[22px] text-white">
            <Link href={newsHref(story)} className="transition-colors hover:text-accent">
              {story.title}
            </Link>
          </h2>
          {image.caption && <p className="mt-2 text-[13px] leading-relaxed text-white/55">{image.caption}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-eyebrow">
            <Link href={newsHref(story)} className="text-white/70 transition-colors hover:text-brand-300">
              Read the story
            </Link>
            {date && (
              <>
                <span aria-hidden="true" className="text-white/25">
                  /
                </span>
                <span className="text-white/40">{date}</span>
              </>
            )}
            {image.redirectUrl && (
              <>
                <span aria-hidden="true" className="text-white/25">
                  /
                </span>
                <a
                  href={image.redirectUrl}
                  target="_blank"
                  rel={image.nofollow ? "noopener noreferrer nofollow" : "noopener noreferrer"}
                  className="text-white/70 transition-colors hover:text-brand-300"
                >
                  Open link ↗
                </a>
              </>
            )}
          </div>
        </figcaption>
      </figure>
    </MediaDialog>
  );
}

export function GalleryWallSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-2.5 w-56" />
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

export function GalleryWall({ initial }: { initial?: Paginated<News> }) {
  const query = useTopicNews(MEDIA_PARAMS, initial);
  const photos = collectPhotos(query.data?.data ?? []);
  const storyCount = new Set(photos.map((photo) => photo.story._id)).size;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = () => setOpenIndex(null);

  return (
    <FeedGate
      state={feedState(query, photos.length === 0)}
      skeleton={<GalleryWallSkeleton />}
      onRetry={() => query.refetch()}
      dimmed={query.isPlaceholderData}
      emptyTitle="No photographs yet"
      emptyMessage="Images from published stories will appear here."
    >
      {() => (
        <>
          <p className="eyebrow mb-6 tabular-nums">
            {photos.length} {photos.length === 1 ? "photograph" : "photographs"} from {storyCount}{" "}
            {storyCount === 1 ? "story" : "stories"}
          </p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo, index) => (
              <button
                key={photo.url}
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`View photograph: ${photo.image.alt || photo.story.title}`}
                className="group block"
              >
                <SmartImage
                  src={photo.url}
                  alt=""
                  ratio="aspect-square"
                  width={360}
                  priority={index < 4}
                  className="rounded-none"
                  imgClassName="transition-opacity duration-300 group-hover:opacity-85"
                />
              </button>
            ))}
          </div>

          {openIndex !== null && photos[openIndex] && (
            <PhotoViewer photos={photos} index={openIndex} onNavigate={setOpenIndex} onClose={close} />
          )}
        </>
      )}
    </FeedGate>
  );
}
