"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AD_PLACEHOLDER, site } from "@/config/site";
import type { AdPosition, Advertisement, Device } from "@/types/api";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";
import { imageUrl } from "@/lib/image";

const DEFAULT_RATIOS: Partial<Record<AdPosition, string>> = {
  "home-top": "aspect-[970/250] sm:aspect-[970/140]",
  "home-mid": "aspect-[1200/200]",
  "article-inline": "aspect-[970/180]",
  sidebar: "aspect-[300/250]",
  "article-sidebar-top": "aspect-[300/250]",
  "article-sidebar-middle": "aspect-[300/250]",
  "article-sidebar-bottom": "aspect-[300/250]",
  "sidebar-sticky": "aspect-[300/600]",
  "mobile-sticky-bottom": "aspect-[320/50]",
};

/** How long each creative stays up when a slot rotates. */
const ROTATE_MS = 6000;

const subscribeResize = (listener: () => void) => {
  window.addEventListener("resize", listener);
  return () => window.removeEventListener("resize", listener);
};

const readDevice = (): Device =>
  window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";

/** Undefined on the server, so ads are only requested once the viewport is known. */
function useDevice(): Device | undefined {
  return useSyncExternalStore<Device | undefined>(subscribeResize, readDevice, () => undefined);
}

/** Scripts inside a fragment made by createContextualFragment do execute. */
export function ScriptCreative({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.replaceChildren(document.createRange().createContextualFragment(code));
    return () => node.replaceChildren();
  }, [code]);

  return <div ref={ref} className="flex w-full justify-center" />;
}

const hasCreative = (ad: Advertisement) => (ad.type === "script" ? Boolean(ad.scriptCode) : Boolean(ad.image?.url));

/**
 * How a slot is sized:
 *   "frame"   — the slot keeps a fixed shape (ratio); creatives are fitted inside it.
 *   "natural" — the slot takes the creative's own height.
 *   "rail"    — fills the parent's height on desktop, natural below it.
 * In every mode the whole image stays visible (object-contain); spare room
 * around it shows a soft blurred copy instead of an empty box.
 */
type Layout = "frame" | "natural" | "rail";

function ImageCreative({ ad, layout }: { ad: Advertisement; layout: Layout }) {
  const src = imageUrl(ad.image?.url, 1320);
  const alt = ad.image?.alt || ad.name;

  if (layout === "natural") {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="mx-auto block h-auto max-w-full object-contain"
        style={ad.maxHeight ? { maxHeight: ad.maxHeight } : undefined}
      />
    );
  }

  const fitted = layout === "rail" ? "lg:absolute lg:inset-0" : "absolute inset-0";
  return (
    <div className={cn("relative h-full w-full overflow-hidden", fitted)}>
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl",
          layout === "rail" && "hidden lg:block",
        )}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "relative block object-contain",
          layout === "rail" ? "h-auto w-full lg:h-full" : "h-full w-full",
        )}
      />
    </div>
  );
}

interface AdSlotProps {
  position: AdPosition;
  ratio?: string;
  label?: boolean;
  category?: string;
  /** Render a house newsletter strip when nothing is booked. */
  editorialFallback?: boolean;
  /** Hold the slot's standard shape for every creative (fitted, never cropped). */
  fixed?: boolean;
  /** Fill the parent's height (homepage rails beside a story grid). */
  rail?: boolean;
  /** Desktop ads resolved on the server, so the first paint already holds the creative. */
  initialAds?: Advertisement[];
  className?: string;
}

export function AdSlot({
  position,
  ratio,
  label = true,
  category,
  editorialFallback = false,
  fixed = false,
  rail = false,
  initialAds,
  className,
}: AdSlotProps) {
  const device = useDevice();
  const { data } = useQuery({
    queryKey: ["ads", position, device, category],
    queryFn: ({ signal }) => publicApi.serveAds(position, device, category, { signal }),
    enabled: Boolean(device),
    initialData: device === "desktop" ? initialAds : undefined,
    staleTime: 5 * 60_000,
  });

  const ads = ((device ? data : initialAds) || []).filter(hasCreative);
  const count = ads.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = count ? index % count : 0;
  const ad: Advertisement | undefined = ads[current];

  // Two or more booked creatives rotate on their own; hovering holds the current one.
  useEffect(() => {
    if (count < 2 || paused) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  // One impression per creative, the first time it is actually on screen.
  const tracked = useRef(new Set<string>());
  useEffect(() => {
    if (ad && !tracked.current.has(ad._id)) {
      tracked.current.add(ad._id);
      publicApi.trackAdImpression(ad._id).catch(() => {});
    }
  }, [ad]);

  const frameRatio = ratio || DEFAULT_RATIOS[position] || "aspect-[970/140]";

  if (!ad) {
    if (editorialFallback && data) {
      return (
        <aside className={cn("border-y-2 border-ink py-3.5", className)}>
          <p className="eyebrow-accent">From {site.name}</p>
          <p className="headline mt-1.5 text-[18px]">The daily brief: what happened, and what it means, in two minutes.</p>
          <Link href="/newsletter" className="link-muted mt-2 inline-block text-ink">
            Subscribe free →
          </Link>
        </aside>
      );
    }
    if (AD_PLACEHOLDER) {
      return (
        <div
          className={cn(
            "eyebrow flex items-center justify-center border border-dashed border-line-strong bg-raise",
            rail ? "min-h-[250px] lg:h-full" : frameRatio,
            className,
          )}
        >
          Ad zone / {position}
        </div>
      );
    }
    return null;
  }

  const layout: Layout = rail ? "rail" : fixed || ads[0].display === "frame" ? "frame" : "natural";

  // Slides share one cell: a fixed frame pins them to its box; otherwise the
  // tallest creative sets the height so rotating never makes the page jump.
  const stackClass = {
    frame: "absolute inset-0",
    natural: "grid",
    rail: "grid lg:absolute lg:inset-0 lg:block",
  }[layout];
  const slideClass = {
    frame: "absolute inset-0 flex items-center justify-center",
    natural: "flex items-center justify-center [grid-area:1/1]",
    rail: "[grid-area:1/1] lg:absolute lg:inset-0",
  }[layout];
  const fillClass = layout === "natural" ? "block w-full" : layout === "rail" ? "block lg:absolute lg:inset-0" : "absolute inset-0 block";

  return (
    <aside className={cn("w-full", rail && "flex flex-col lg:h-full", className)}>
      {label && <p className="eyebrow mb-2 text-center">Advertisement</p>}
      <div
        className={cn(
          "relative overflow-hidden border border-line bg-raise",
          layout === "frame" && frameRatio,
          layout === "rail" && "lg:min-h-[360px] lg:flex-1",
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className={stackClass}>
          {ads.map((item, i) => {
            const active = i === current;
            const isImage = item.type === "image";
            const creative = isImage ? <ImageCreative ad={item} layout={layout} /> : <ScriptCreative code={item.scriptCode!} />;
            return (
              <div
                key={item._id}
                aria-hidden={!active}
                className={cn(
                  slideClass,
                  "transition-opacity duration-700 motion-reduce:transition-none",
                  active ? "z-[1] opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                {isImage && item.targetUrl ? (
                  <a
                    href={item.targetUrl}
                    target={item.openInNewTab ? "_blank" : undefined}
                    rel="noopener noreferrer sponsored"
                    tabIndex={active ? undefined : -1}
                    onClick={() => publicApi.trackAdClick(item._id).catch(() => {})}
                    className={cn(fillClass, "transition-opacity hover:opacity-90")}
                  >
                    {creative}
                  </a>
                ) : isImage ? (
                  <div className={fillClass}>{creative}</div>
                ) : (
                  creative
                )}
              </div>
            );
          })}
        </div>

        {count > 1 && (
          <div className="absolute bottom-2 left-1/2 z-[2] flex -translate-x-1/2 gap-1.5 bg-canvas/70 px-2 py-1 backdrop-blur">
            {ads.map((item, i) => (
              <button
                key={item._id}
                type="button"
                aria-label={`Show advertisement ${i + 1} of ${count}`}
                aria-current={i === current}
                onClick={() => setIndex(i)}
                className={cn("h-1.5 transition-all", i === current ? "w-4 bg-accent" : "w-1.5 bg-ink/30 hover:bg-ink/60")}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
