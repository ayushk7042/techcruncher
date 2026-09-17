"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { useId, useState } from "react";
import type { News } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { formatDate, pad2 } from "@/lib/format";
import { categoryOf, imageOf, newsDate } from "@/lib/news";
import { useDebounced } from "@/hooks/use-debounced";
import { SmartImage } from "@/components/ui/smart-image";
import { Spinner, StatusBadge } from "../ui";
import { IconButton } from "../controls";

/** One page of results; "Load more" walks the rest of the catalogue. */
const PAGE_SIZE = 25;

interface NewsPickerProps {
  label: string;
  hint?: string;
  value: News[];
  onChange: (value: News[]) => void;
  /** 1 turns the picker into a single-story slot that replaces on pick. */
  max: number;
  /** Restrict search results to a category id. */
  category?: string;
  disabled?: boolean;
}

/** Search published articles and keep an ordered, capped selection. */
export function NewsPicker({ label, hint, value, onChange, max, category, disabled = false }: NewsPickerProps) {
  const inputId = useId();
  const listId = `${inputId}-results`;
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const term = useDebounced(search.trim(), 300);

  const single = max === 1;
  const full = value.length >= max;
  const searchable = !disabled && (single || !full);
  const selectedIds = new Set(value.map((news) => news._id));
  // How many pages of the catalogue are on screen; reset whenever the query changes.
  const [pages, setPages] = useState(1);
  const [lastQuery, setLastQuery] = useState(`${term}|${category ?? ""}`);
  const queryKey = `${term}|${category ?? ""}`;
  if (queryKey !== lastQuery) {
    setLastQuery(queryKey);
    setPages(1);
  }

  const results = useQuery({
    queryKey: ["admin", "news", "picker", term, category ?? "", pages],
    queryFn: ({ signal }) =>
      adminApi.listNews(
        { search: term || undefined, category: category || undefined, status: "published", limit: PAGE_SIZE * pages, sort: "latest" },
        signal,
      ),
    enabled: open && searchable,
    staleTime: 30_000,
  });

  const total = results.data?.pagination.total ?? 0;
  const loaded = results.data?.data.length ?? 0;
  const options = (results.data?.data || []).filter((news) => !selectedIds.has(news._id));
  const hasMore = loaded < total;

  function pick(news: News) {
    const next = single ? [news] : [...value, news];
    onChange(next);
    setSearch("");
    if (next.length >= max) setOpen(false);
  }

  function move(index: number, offset: -1 | 1) {
    const next = [...value];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    onChange(next);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="adm-label mb-0">
          {label}
        </label>
        <span className={cn("meta tabular-nums", full && !single && "text-accent")}>
          {value.length}/{max}
        </span>
      </div>

      {value.length > 0 && (
        <ol className="mb-2 border-t border-line">
          {value.map((news, index) => (
            <li key={news._id} className="flex items-center gap-3 border-b border-line py-2">
              {!single && <span className="meta w-5 shrink-0 tabular-nums">{pad2(index + 1)}</span>}
              <SmartImage src={imageOf(news)?.url} width={56} ratio="aspect-[4/3]" className="w-14 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">{news.title}</p>
                <p className="meta mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  {categoryOf(news)?.name && <span>{categoryOf(news)?.name}</span>}
                  <span>{formatDate(newsDate(news))}</span>
                  {news.status && news.status !== "published" && <StatusBadge status={news.status} />}
                </p>
              </div>
              {!disabled && (
                <div className="flex shrink-0 items-center">
                  {!single && (
                    <>
                      <IconButton label={`Move "${news.title}" up`} disabled={index === 0} onClick={() => move(index, -1)}>
                        <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                      </IconButton>
                      <IconButton
                        label={`Move "${news.title}" down`}
                        disabled={index === value.length - 1}
                        onClick={() => move(index, 1)}
                      >
                        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                      </IconButton>
                    </>
                  )}
                  <IconButton label={`Remove "${news.title}"`} onClick={() => onChange(value.filter((item) => item._id !== news._id))}>
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </IconButton>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {searchable && (
        <div
          className="relative"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
          }}
        >
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
          <input
            id={inputId}
            type="search"
            className="adm-input pl-8"
            placeholder={single && value.length ? "Search to replace this story…" : "Search published articles…"}
            value={search}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setSearch(event.target.value);
              setOpen(true);
            }}
            onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
          />

          {open && (
            <div
              id={listId}
              role="listbox"
              className="absolute inset-x-0 top-full z-30 max-h-80 overflow-y-auto border border-t-0 border-ink bg-paper shadow-pop"
            >
              {results.isPending ? (
                <p className="meta flex items-center gap-2 px-3 py-3">
                  <Spinner className="h-3.5 w-3.5" /> Searching…
                </p>
              ) : results.isError ? (
                <p className="px-3 py-3 text-[12.5px] text-accent">{errorMessage(results.error, "Search failed")}</p>
              ) : options.length === 0 ? (
                <p className="meta px-3 py-3">No published articles match.</p>
              ) : (
                <>
                  {options.map((news) => (
                  <button
                    key={news._id}
                    type="button"
                    role="option"
                    aria-selected={false}
                    // Keep focus in the input so the blur handler does not close the list before the click lands.
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => pick(news)}
                    className="flex w-full items-center gap-3 border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-raise"
                  >
                    <SmartImage src={imageOf(news)?.url} width={48} ratio="aspect-[4/3]" className="w-12 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 block text-[13px] text-ink">{news.title}</span>
                      <span className="meta mt-1 block">
                        {[categoryOf(news)?.name, formatDate(newsDate(news))].filter(Boolean).join(" / ")}
                      </span>
                    </span>
                  </button>
                  ))}

                  <div className="flex items-center justify-between gap-3 border-t border-line px-3 py-2">
                    <span className="meta tabular-nums">
                      {loaded} of {total} article{total === 1 ? "" : "s"}
                    </span>
                    {hasMore && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm"
                        // Keep focus in the input so the list does not close before the click lands.
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => setPages((current) => current + 1)}
                        disabled={results.isFetching}
                      >
                        {results.isFetching && <Spinner className="h-3 w-3" />}
                        Load more
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {hint && <p className="adm-hint">{hint}</p>}
    </div>
  );
}
