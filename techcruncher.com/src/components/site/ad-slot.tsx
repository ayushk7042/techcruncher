"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { AD_PLACEHOLDER, site } from "@/config/site";
import type { AdPosition, Advertisement, Device } from "@/types/api";
import { SmartImage } from "@/components/ui/smart-image";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";

const DEFAULT_RATIOS: Partial<Record<AdPosition, string>> = {
  "home-mid": "aspect-[1200/200]",
  "article-inline": "aspect-[970/180]",
  sidebar: "aspect-[300/250]",
  "article-sidebar-top": "aspect-[300/250]",
  "article-sidebar-middle": "aspect-[300/250]",
  "article-sidebar-bottom": "aspect-[300/250]",
  "sidebar-sticky": "aspect-[300/600]",
  "mobile-sticky-bottom": "aspect-[320/50]",
};

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

interface AdSlotProps {
  position: AdPosition;
  ratio?: string;
  label?: boolean;
  category?: string;
  /** Render a house newsletter strip when nothing is booked. */
  editorialFallback?: boolean;
  className?: string;
}

export function AdSlot({ position, ratio, label = true, category, editorialFallback = false, className }: AdSlotProps) {
  const device = useDevice();
  const { data } = useQuery({
    queryKey: ["ads", position, device, category],
    queryFn: ({ signal }) => publicApi.serveAds(position, device, category, { signal }),
    enabled: Boolean(device),
    staleTime: 5 * 60_000,
  });

  const ad: Advertisement | undefined = data?.[0];
  const tracked = useRef<string | null>(null);

  useEffect(() => {
    if (ad && tracked.current !== ad._id) {
      tracked.current = ad._id;
      publicApi.trackAdImpression(ad._id).catch(() => {});
    }
  }, [ad]);

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
            ratio || DEFAULT_RATIOS[position] || "aspect-[970/140]",
            className,
          )}
        >
          Ad zone / {position}
        </div>
      );
    }
    return null;
  }

  const frameRatio = ratio || DEFAULT_RATIOS[position] || "aspect-[970/140]";
  const onClick = () => publicApi.trackAdClick(ad._id).catch(() => {});

  let creative: React.ReactNode;
  if (ad.type === "script" && ad.scriptCode) {
    creative = <ScriptCreative code={ad.scriptCode} />;
  } else if (ad.image?.url) {
    creative =
      ad.display === "frame" ? (
        <SmartImage src={ad.image.url} alt={ad.image.alt || ad.name} ratio={frameRatio} fit="contain" width={970} />
      ) : (
        <img
          src={ad.image.url}
          alt={ad.image.alt || ad.name}
          loading="lazy"
          className="block h-auto w-full object-contain"
          style={ad.maxHeight ? { maxHeight: ad.maxHeight } : undefined}
        />
      );
  } else {
    return null;
  }

  return (
    <aside className={cn("w-full", className)}>
      {label && <p className="eyebrow mb-2 text-center">Advertisement</p>}
      <div className="overflow-hidden border border-line bg-raise">
        {ad.targetUrl && ad.type === "image" ? (
          <a
            href={ad.targetUrl}
            target={ad.openInNewTab ? "_blank" : undefined}
            rel="noopener noreferrer sponsored"
            onClick={onClick}
            className="block transition-opacity hover:opacity-90"
          >
            {creative}
          </a>
        ) : (
          creative
        )}
      </div>
    </aside>
  );
}
