"use client";

import { cn } from "@/lib/cn";

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

/** Window of ±1 around the current page, plus first and last. */
function pageWindow(page: number, pages: number): (number | "gap")[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const base =
  "inline-flex h-9 min-w-9 items-center justify-center px-3 font-mono text-[11px] uppercase tracking-eyebrow transition-colors";

export function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1 border-t border-line pt-5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className={cn(base, "text-ink-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-30")}
      >
        Prev
      </button>
      {pageWindow(page, pages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-ink-mute">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(base, item === page ? "bg-accent text-white" : "text-ink-soft hover:bg-raise hover:text-ink")}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className={cn(base, "text-ink-soft hover:text-accent disabled:cursor-not-allowed disabled:opacity-30")}
      >
        Next
      </button>
    </nav>
  );
}
