"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/article-html";
import { useScrollLock } from "@/hooks/use-dismiss";
import { MobileTableOfContents } from "./table-of-contents";

interface ArticleReaderProps {
  html: string;
  toc: TocItem[];
}

/** Article body with a lightbox for images that are not already links. */
export function ArticleReader({ html, toc }: ArticleReaderProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string; caption: string } | null>(null);

  useScrollLock(Boolean(lightbox));

  // Mark images that are not inside a link so CSS shows the zoom cursor.
  useEffect(() => {
    bodyRef.current?.querySelectorAll("img").forEach((img) => {
      img.dataset.linked = img.closest("a") ? "true" : "false";
      if (!img.getAttribute("loading")) img.loading = "lazy";
    });
  }, [html]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setLightbox(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const onBodyClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName !== "IMG" || target.closest("a")) return;
    const img = target as HTMLImageElement;
    const caption = img.closest("figure")?.querySelector("figcaption")?.textContent || img.dataset.caption || "";
    setLightbox({ src: img.currentSrc || img.src, alt: img.alt, caption });
  };

  return (
    <>
      <MobileTableOfContents items={toc} />

      <div
        id="article-body"
        ref={bodyRef}
        onClick={onBodyClick}
        className="article-body mt-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-ink-950/95 p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 p-2 text-white/70 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <img src={lightbox.src} alt={lightbox.alt} className="max-h-[85vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          {lightbox.caption && (
            <p className="mt-4 max-w-2xl text-center text-[13px] leading-relaxed text-white/60">{lightbox.caption}</p>
          )}
        </div>
      )}
    </>
  );
}
