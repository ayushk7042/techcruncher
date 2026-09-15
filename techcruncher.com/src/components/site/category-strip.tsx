"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Category } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";
import { formatDate, readTimeLabel } from "@/lib/format";
import { categoryHref, excerptOf, imageOf, newsDate, newsHref, readTimeOf, stripHtml, toCard } from "@/lib/news";

/* ------------------------------------------------------------------ */
/* Flyout                                                              */
/* ------------------------------------------------------------------ */

const FLYOUT_WIDTH = 560;

function CategoryFlyout({
  category,
  anchor,
  onEnter,
  onLeave,
}: {
  category: Category;
  anchor: DOMRect;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const { data = [], isPending } = useQuery({
    queryKey: ["flyout", category.slug],
    queryFn: ({ signal }) =>
      publicApi.listNews({ category: category.slug, limit: 4, sort: "latest" }, { signal }).then((r) => r.data.map(toCard)),
    staleTime: 5 * 60_000,
  });

  const left = Math.max(12, Math.min(anchor.left, window.innerWidth - FLYOUT_WIDTH - 12));

  return (
    <div
      role="dialog"
      aria-label={`${category.name} latest stories`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ top: anchor.bottom + 6, left, width: FLYOUT_WIDTH }}
      className="fixed z-[60] hidden overflow-hidden border border-line bg-paper shadow-pop lg:block"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <div className="min-w-0">
          <p className="headline text-[17px]">{category.name}</p>
          <p className="meta clamp-1 mt-0.5">{stripHtml(category.description) || `Latest ${category.name} coverage`}</p>
        </div>
        <Link
          href={categoryHref(category)}
          className="inline-flex shrink-0 items-center gap-1.5 text-[12px] font-semibold text-ink-soft hover:text-accent"
        >
          View all <span className="tabular-nums text-ink-mute">({category.articleCount ?? 0})</span>
          <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-4 p-5">
        {isPending ? (
          Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-16 w-16 shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          <p className="meta col-span-2 py-4 text-center">No stories published in {category.name} yet.</p>
        ) : (
          data.map((news) => (
            <Link key={news._id} href={newsHref(news)} className="group flex gap-3">
              <div className="w-16 shrink-0">
                <SmartImage src={imageOf(news)?.url} ratio="aspect-square" width={64} />
              </div>
              <span className="min-w-0">
                <span className="headline clamp-2 block text-[14px] transition-colors group-hover:text-accent">{news.title}</span>
                <span className="mt-1.5 flex items-center gap-1.5 text-[11px] text-ink-mute">
                  {formatDate(newsDate(news))}
                  <span className="text-line-strong">/</span>
                  {readTimeLabel(readTimeOf(news))}
                </span>
              </span>
            </Link>
          ))
        )}
      </div>

      {data[0] && (
        <p className="meta clamp-1 border-t border-line px-4 py-2.5">
          <span className="eyebrow mr-1.5 text-ink-soft">Latest</span>
          {excerptOf(data[0], 90)}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Strip                                                               */
/* ------------------------------------------------------------------ */

export function CategoryStrip({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  const [open, setOpen] = useState<{ category: Category; rect: DOMRect } | null>(null);
  const timers = useRef<{ open?: number; close?: number }>({});
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});

    // A vertical wheel scrolls the rail sideways.
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || el.scrollWidth <= el.clientWidth) return;
      event.preventDefault();
      el.scrollLeft += event.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      el.removeEventListener("wheel", onWheel);
    };
  }, [measure]);

  useEffect(() => {
    const current = timers.current;
    return () => {
      window.clearTimeout(current.open);
      window.clearTimeout(current.close);
    };
  }, []);

  const scrollBy = (dx: number) => trackRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  const scheduleOpen = (category: Category, target: HTMLElement) => {
    window.clearTimeout(timers.current.close);
    window.clearTimeout(timers.current.open);
    timers.current.open = window.setTimeout(() => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setOpen({ category, rect: target.getBoundingClientRect() });
      }
    }, 110);
  };

  const scheduleClose = () => {
    window.clearTimeout(timers.current.open);
    timers.current.close = window.setTimeout(() => setOpen(null), 160);
  };

  const keepOpen = () => window.clearTimeout(timers.current.close);

  const arrowClass =
    "absolute z-20 flex h-7 w-7 items-center justify-center border border-line bg-paper text-ink-soft transition-colors hover:border-ink hover:text-ink";

  return (
    <div className="relative flex min-w-0 flex-1 items-center" onKeyDown={(e) => e.key === "Escape" && setOpen(null)}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-canvas to-transparent transition-opacity",
          edges.start && "opacity-0",
        )}
      />
      {!edges.start && (
        <button type="button" aria-label="Scroll topics left" onClick={() => scrollBy(-260)} className={cn(arrowClass, "left-0")}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      <nav
        aria-label="Topics"
        ref={trackRef}
        onScroll={measure}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || !trackRef.current) return;
          drag.current = { active: true, startX: event.clientX, scrollLeft: trackRef.current.scrollLeft, moved: false };
        }}
        onPointerMove={(event) => {
          if (!drag.current.active || !trackRef.current) return;
          const dx = event.clientX - drag.current.startX;
          if (Math.abs(dx) > 4) drag.current.moved = true;
          trackRef.current.scrollLeft = drag.current.scrollLeft - dx;
        }}
        onPointerUp={() => (drag.current.active = false)}
        onPointerLeave={() => (drag.current.active = false)}
        onClickCapture={(event) => {
          // a drag should not also follow the link under the pointer
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className="no-scrollbar flex min-w-0 flex-1 cursor-grab items-stretch gap-5 overflow-x-auto scroll-smooth active:cursor-grabbing"
      >
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          const isOpen = open?.category._id === category._id;
          return (
            <Link
              key={category._id}
              href={categoryHref(category)}
              draggable={false}
              aria-current={active ? "page" : undefined}
              onMouseEnter={(event) => scheduleOpen(category, event.currentTarget)}
              onMouseLeave={scheduleClose}
              onFocus={(event) => scheduleOpen(category, event.currentTarget)}
              onBlur={scheduleClose}
              className={cn(
                "relative flex items-center whitespace-nowrap py-2.5 text-[13px] font-medium transition-colors",
                active || isOpen ? "text-ink" : "text-ink-soft hover:text-ink",
                active && "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-accent after:content-['']",
              )}
            >
              {category.shortLabel || category.name}
            </Link>
          );
        })}
      </nav>

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-canvas to-transparent transition-opacity",
          edges.end && "opacity-0",
        )}
      />
      {!edges.end && (
        <button type="button" aria-label="Scroll topics right" onClick={() => scrollBy(260)} className={cn(arrowClass, "right-0")}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      {open && <CategoryFlyout category={open.category} anchor={open.rect} onEnter={keepOpen} onLeave={scheduleClose} />}
    </div>
  );
}
