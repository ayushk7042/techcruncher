"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import type { News, Paginated } from "@/types/api";
import { CategoryChip } from "@/components/site/category-chip";
import { Rail } from "@/components/site/headers";
import { ListSkeleton, Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { formatDate } from "@/lib/format";
import { formatDuration, videoEmbed } from "@/lib/image";
import { categoryOf, excerptOf, hasVideo, newsDate, newsHref } from "@/lib/news";
import { FeedGate, feedState } from "./feed-gate";
import { collectClips, posterOf, type VideoClip } from "./media";
import { MediaDialog } from "./media-dialog";
import { MEDIA_PARAMS } from "./params";
import { MetaLine } from "./ranking";
import { useTopicNews } from "./use-topic-news";

const clipTitle = ({ video, story }: VideoClip) => video.title || story.title;
const providerOf = ({ video }: VideoClip) => video.provider || videoEmbed(video.url).provider;

function VideoFrame({ clip, autoplay }: { clip: VideoClip; autoplay: boolean }) {
  const embed = videoEmbed(clip.video.url);

  return (
    <div className="relative aspect-video w-full bg-black">
      {embed.kind === "iframe" ? (
        <iframe
          key={embed.src}
          src={autoplay ? `${embed.src}?autoplay=1` : embed.src}
          title={clipTitle(clip)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <video
          key={embed.src}
          src={embed.src}
          poster={posterOf(clip)}
          controls
          playsInline
          autoPlay={autoplay}
          preload="metadata"
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}

function PlayDot({ size }: { size: "sm" | "lg" }) {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span
        className={
          size === "sm"
            ? "flex h-7 w-7 items-center justify-center rounded-full bg-canvas/90 text-ink"
            : "flex h-11 w-11 items-center justify-center rounded-full bg-canvas/90 text-ink transition-transform duration-300 group-hover:scale-105"
        }
      >
        <Play className={size === "sm" ? "ml-px h-3 w-3 fill-current" : "ml-0.5 h-4 w-4 fill-current"} aria-hidden="true" />
      </span>
    </span>
  );
}

function PlayerBand({ clip, autoplay }: { clip: VideoClip; autoplay: boolean }) {
  const { video, story } = clip;
  const embed = videoEmbed(video.url);

  return (
    <div>
      <VideoFrame clip={clip} autoplay={autoplay} />
      <p className="eyebrow-accent mt-5">{categoryOf(story)?.name ?? "Video"}</p>
      <h2 className="headline mt-3 text-[26px] sm:text-[30px]">{clipTitle(clip)}</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{video.caption || excerptOf(story, 200)}</p>
      <MetaLine
        parts={[formatDate(newsDate(story)), providerOf(clip), formatDuration(video.duration)]}
        className="mt-4"
      />
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href={newsHref(story)} className="btn-primary h-11 px-6">
          Read the full story
        </Link>
        {embed.kind === "iframe" && (
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="link-muted">
            Watch on {providerOf(clip)}
          </a>
        )}
      </div>
    </div>
  );
}

function UpNext({ clips, onPick }: { clips: VideoClip[]; onPick: (clip: VideoClip) => void }) {
  return (
    <Rail title="Up next">
      {clips.map((clip) => (
        <button
          key={clip.key}
          type="button"
          onClick={() => onPick(clip)}
          className="group flex w-full items-start gap-4 py-4 text-left"
        >
          <span className="relative block w-[112px] shrink-0">
            <SmartImage src={posterOf(clip)} alt="" ratio="aspect-video" width={112} />
            <PlayDot size="sm" />
          </span>
          <span className="block min-w-0 flex-1">
            <CategoryChip category={categoryOf(clip.story)} linked={false} />
            <span className="headline clamp-2 mt-1.5 block text-[15px] transition-colors group-hover:text-accent">
              {clipTitle(clip)}
            </span>
            {clip.video.duration ? (
              <span className="meta mt-1.5 block tabular-nums">{formatDuration(clip.video.duration)}</span>
            ) : null}
          </span>
        </button>
      ))}
    </Rail>
  );
}

function ArchiveCard({ clip, onPlay }: { clip: VideoClip; onPlay: (clip: VideoClip) => void }) {
  const { video, story } = clip;

  return (
    <article className="group flex h-full flex-col">
      <button type="button" onClick={() => onPlay(clip)} className="relative block w-full" aria-label={`Play ${clipTitle(clip)}`}>
        <SmartImage
          src={posterOf(clip)}
          alt=""
          ratio="aspect-video"
          width={320}
          imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
        <PlayDot size="lg" />
        {video.duration ? (
          <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-[11px] tabular-nums text-white">
            {formatDuration(video.duration)}
          </span>
        ) : null}
      </button>
      <div className="rule-card mt-2.5 flex flex-1 flex-col pt-2.5">
        <CategoryChip category={categoryOf(story)} className="w-fit" />
        <h3 className="headline mt-2 text-[16px]">
          <button type="button" onClick={() => onPlay(clip)} className="clamp-2 text-left transition-colors group-hover:text-accent">
            {clipTitle(clip)}
          </button>
        </h3>
        <MetaLine parts={[formatDate(newsDate(story)), providerOf(clip)]} className="mt-2.5" />
        <Link href={newsHref(story)} className="link-muted mt-auto w-fit pt-3">
          Open the article
        </Link>
      </div>
    </article>
  );
}

function VideoModal({ clip, onClose }: { clip: VideoClip; onClose: () => void }) {
  return (
    <MediaDialog label={clipTitle(clip)} onClose={onClose}>
      <div className="w-full max-w-4xl">
        <VideoFrame clip={clip} autoplay />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow text-white/45">{categoryOf(clip.story)?.name ?? "Video"}</p>
            <h2 className="headline mt-2 text-[18px] text-white">{clipTitle(clip)}</h2>
          </div>
          <Link
            href={newsHref(clip.story)}
            className="btn h-10 shrink-0 border border-white/30 px-5 text-white hover:border-white hover:bg-white hover:text-ink"
          >
            Read the story
          </Link>
        </div>
      </div>
    </MediaDialog>
  );
}

export function VideoDeskSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-8">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="mt-5 h-2.5 w-20" />
        <Skeleton className="mt-4 h-8 w-3/4" />
      </div>
      <div className="lg:col-span-4">
        <ListSkeleton count={4} compact />
      </div>
    </div>
  );
}

export function VideoDesk({ initial }: { initial?: Paginated<News> }) {
  const query = useTopicNews(MEDIA_PARAMS, initial);
  const clips = collectClips((query.data?.data ?? []).filter(hasVideo));

  // No pick yet means the band shows the newest clip without autoplay.
  const [pickedKey, setPickedKey] = useState<string | null>(null);
  const [modalKey, setModalKey] = useState<string | null>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const closeModal = () => setModalKey(null);

  const picked = clips.find((clip) => clip.key === pickedKey);
  const activeIndex = picked ? clips.indexOf(picked) : 0;
  const active = clips[activeIndex];
  const upNext = [...clips.slice(activeIndex + 1), ...clips.slice(0, activeIndex)].slice(0, 5);
  const modalClip = clips.find((clip) => clip.key === modalKey);

  const pick = (clip: VideoClip) => {
    setPickedKey(clip.key);
    bandRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <FeedGate
      state={feedState(query, clips.length === 0)}
      skeleton={<VideoDeskSkeleton />}
      onRetry={() => query.refetch()}
      dimmed={query.isPlaceholderData}
      emptyTitle="No video yet"
      emptyMessage="Explainers, reviews and interviews attached to our reporting will appear here."
    >
      {() => (
        <>
          <div ref={bandRef} className="grid scroll-mt-32 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="min-w-0 lg:col-span-8">
              <PlayerBand clip={active} autoplay={Boolean(picked)} />
            </div>
            {upNext.length > 0 && (
              <div className="min-w-0 lg:col-span-4">
                <UpNext clips={upNext} onPick={pick} />
              </div>
            )}
          </div>

          <section className="mt-16">
            <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-3">
              <h2 className="eyebrow text-ink">Every video</h2>
              <span className="meta tabular-nums">
                {clips.length} {clips.length === 1 ? "clip" : "clips"}
              </span>
            </div>
            <div className="mt-8 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {clips.map((clip) => (
                <ArchiveCard key={clip.key} clip={clip} onPlay={(next) => setModalKey(next.key)} />
              ))}
            </div>
          </section>

          {modalClip && <VideoModal clip={modalClip} onClose={closeModal} />}
        </>
      )}
    </FeedGate>
  );
}
