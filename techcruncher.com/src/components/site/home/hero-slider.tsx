"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/cn";
import { formatDate, pad2, readTimeLabel } from "@/lib/format";
import { authorName, categoryHref, categoryOf, excerptOf, imageOf, newsDate, newsHref, readTimeOf, type CardNews } from "@/lib/news";

const INTERVAL = 7000;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = (listener: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

const readReducedMotion = () => window.matchMedia(REDUCED_MOTION).matches;

const subscribeVisibility = (listener: () => void) => {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
};

const controlClass =
  "flex h-9 w-9 items-center justify-center bg-white/10 text-white backdrop-blur transition-colors hover:bg-accent";

export function HeroSlider({ slides }: { slides: CardNews[] }) {
  const [index, setIndex] = useState(0);
  // null = the visitor has not chosen; reduced-motion users start paused.
  const [playChoice, setPlayChoice] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, () => false);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);

  const count = slides.length;
  const playing = playChoice ?? !reducedMotion;
  const running = playing && !hovered && !focused && !hidden && count > 1;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(id);
  }, [running, index, go]);

  if (!count) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Top stories"
      className="relative isolate overflow-hidden bg-ink-950 text-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setFocused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(index - 1);
        if (event.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(event) => (touchStart.current = event.touches[0]?.clientX ?? null)}
      onTouchEnd={(event) => {
        if (touchStart.current === null) return;
        const dx = (event.changedTouches[0]?.clientX ?? 0) - touchStart.current;
        if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
        touchStart.current = null;
      }}
    >
      <div className="relative h-[440px] sm:h-[520px] lg:h-[620px]">
        {slides.map((news, i) => {
          const live = i === index;
          const image = imageOf(news);
          const category = categoryOf(news);
          const date = newsDate(news);
          return (
            <div
              key={news._id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!live}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                live ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <SmartImage
                src={image?.url}
                alt={image?.alt || news.title}
                fill
                width={1920}
                priority={i === 0}
                imgClassName={cn(live && "animate-slow-zoom")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/75 to-ink-950/15" />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-ink-950/85 via-ink-950/25 to-transparent lg:block" />
              <Link href={newsHref(news)} tabIndex={-1} aria-hidden="true" className="absolute inset-0 z-10" />

              {live && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
                  <div className="container pb-6">
                    <div key={news._id} className="max-w-3xl animate-fade-up">
                      <div className="flex items-center gap-3">
                        <span className="chip-live">Top story</span>
                        {category ? (
                          <Link
                            href={categoryHref(category)}
                            className="chip pointer-events-auto text-white/70 transition-colors hover:text-brand-300"
                          >
                            {category.name}
                          </Link>
                        ) : (
                          <span className="chip text-white/70">News</span>
                        )}
                      </div>
                      <h2 className="headline mt-3.5 text-[32px] text-white sm:text-[48px] lg:text-[64px]">
                        <Link href={newsHref(news)} className="pointer-events-auto transition-colors hover:text-brand-300">
                          {news.title}
                        </Link>
                      </h2>
                      <p className="clamp-2 mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70">{excerptOf(news, 180)}</p>
                      <p className="meta mt-4 flex flex-wrap items-center gap-x-2 text-white/55">
                        <span className="text-white/80">{authorName(news)}</span>
                        <span aria-hidden="true">/</span>
                        {date && <span>{formatDate(date)}</span>}
                        <span aria-hidden="true">/</span>
                        <span>{readTimeLabel(readTimeOf(news))}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {count > 1 && (
          <div className="absolute right-0 top-0 z-20 flex items-center gap-px p-3 sm:p-4">
            <button
              type="button"
              aria-label={playing ? "Pause slideshow" : "Play slideshow"}
              onClick={() => setPlayChoice(!playing)}
              className={controlClass}
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4 fill-current" aria-hidden="true" />}
            </button>
            <button type="button" aria-label="Previous story" onClick={() => go(index - 1)} className={controlClass}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next story" onClick={() => go(index + 1)} className={controlClass}>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {count > 1 && (
        <div className="relative z-20 border-t border-white/15 bg-ink-950">
          <div className="container">
            <ul className="no-scrollbar flex overflow-x-auto">
              {slides.map((news, i) => {
                const live = i === index;
                return (
                  <li key={news._id} className="relative min-w-[200px] flex-1 border-r border-white/10 last:border-r-0">
                    <span
                      aria-hidden="true"
                      key={live && running ? `run-${index}` : `idle-${i}`}
                      className={cn(
                        "absolute inset-x-0 top-0 h-[2px] origin-left bg-accent",
                        live && running && "animate-progress",
                        !live && "scale-x-0",
                      )}
                    />
                    <button
                      type="button"
                      aria-current={live}
                      onClick={() => go(i)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3.5 text-left",
                        live ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
                      )}
                    >
                      <span className={cn("meta", live ? "text-accent" : "text-white/35")}>{pad2(i + 1)}</span>
                      <span className="min-w-0">
                        <span className={cn("chip block", live ? "text-white/60" : "text-white/35")}>
                          {categoryOf(news)?.name || "News"}
                        </span>
                        <span className={cn("headline clamp-2 mt-1.5 block text-[13.5px]", live ? "text-white" : "text-white/60")}>
                          {news.title}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
