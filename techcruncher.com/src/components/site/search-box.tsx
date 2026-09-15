"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, Loader2, Search, TrendingUp, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { Category } from "@/types/api";
import { SmartImage } from "@/components/ui/smart-image";
import { useDebounced } from "@/hooks/use-debounced";
import { useDismiss } from "@/hooks/use-dismiss";
import { useLocalList } from "@/hooks/use-local-list";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";
import { formatDate, readTimeLabel } from "@/lib/format";
import { categoryOf, imageOf, newsDate, newsHref, searchHref } from "@/lib/news";

interface SearchBoxProps {
  topics?: Pick<Category, "name" | "slug">[];
  size?: "md" | "lg";
  autoFocus?: boolean;
  /** Bind ⌘K / Ctrl+K to this instance. */
  hotkey?: boolean;
  className?: string;
  onNavigate?: () => void;
}

export function SearchBox({ topics = [], size = "md", autoFocus, hotkey = false, className, onNavigate }: SearchBoxProps) {
  const router = useRouter();
  const listId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, updateRecent] = useLocalList<string>("tc-recent-searches");

  const term = useDebounced(value.trim(), 260);
  const enabled = term.length >= 2;

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search-typeahead", term],
    queryFn: ({ signal }) => publicApi.searchNews(term, 6, { signal }),
    enabled,
    staleTime: 30_000,
  });

  useDismiss(open, wrapperRef, () => setOpen(false));

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  const close = () => {
    setOpen(false);
    setActive(-1);
    onNavigate?.();
  };

  const submit = (q: string) => {
    const query = q.trim();
    if (!query) return;
    updateRecent((list) => [query, ...list.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 5));
    close();
    inputRef.current?.blur();
    router.push(searchHref(query));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!enabled || !results.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      close();
      router.push(newsHref(results[active]));
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
        className={cn(
          "flex items-center gap-2 border border-line bg-paper px-3 transition-colors duration-150 focus-within:border-ink",
          size === "lg" ? "h-11" : "h-9",
        )}
      >
        <Search className="h-3.5 w-3.5 shrink-0 text-ink-mute" aria-hidden="true" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          autoFocus={autoFocus}
          placeholder="Search stories, reviews, guides…"
          aria-label="Search"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          role="combobox"
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setValue(event.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-mute [&::-webkit-search-cancel-button]:hidden"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            className="p-1 text-ink-mute transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ) : (
          hotkey && (
            <kbd className="hidden shrink-0 border border-line px-1.5 py-0.5 font-sans text-[10px] font-medium text-ink-mute lg:block">
              ⌘K
            </kbd>
          )
        )}
      </form>

      {open && (
        <div
          id={listId}
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(400px,88vw)] overflow-hidden border border-line bg-paper shadow-pop"
        >
          {!enabled ? (
            <div className="p-4">
              {recent.length > 0 && (
                <div className="mb-4">
                  <p className="eyebrow mb-2 flex items-center gap-1.5">
                    <Clock3 className="h-3 w-3" aria-hidden="true" /> Recent
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recent.map((item) => (
                      <button key={item} type="button" onClick={() => submit(item)} className="filter-pill">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <p className="eyebrow mb-2 flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" aria-hidden="true" /> Popular topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {topics.slice(0, 4).map((topic) => (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => {
                      close();
                      router.push(`/category/${topic.slug}`);
                    }}
                    className="filter-pill"
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>
          ) : isFetching && results.length === 0 ? (
            <p className="meta flex items-center gap-2 px-5 py-5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Searching…
            </p>
          ) : results.length === 0 ? (
            <p className="px-5 py-5 text-[13px] text-ink-mute">No articles match “{term}”.</p>
          ) : (
            <>
              <ul role="listbox" className="max-h-[52vh] divide-y divide-line overflow-y-auto">
                {results.map((news, index) => {
                  const category = categoryOf(news);
                  return (
                    <li key={news._id} role="option" aria-selected={active === index}>
                      <button
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => {
                          close();
                          router.push(newsHref(news));
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                          active === index ? "bg-raise" : "hover:bg-raise",
                        )}
                      >
                        <div className="w-12 shrink-0">
                          <SmartImage src={imageOf(news)?.url} ratio="aspect-square" width={48} />
                        </div>
                        <span className="min-w-0 flex-1">
                          <span className="clamp-2 block font-display text-[14px] font-medium leading-snug text-ink">
                            {news.title}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-mute">
                            <span className="eyebrow">{category?.name || "News"}</span>•
                            <span>{formatDate(newsDate(news))}</span>•<span>{readTimeLabel(news.readTime).replace(" read", "")}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => submit(term)}
                className="flex w-full items-center justify-center gap-1.5 border-t border-line px-4 py-3 text-[12px] font-semibold text-ink-soft hover:text-accent"
              >
                See all results for “{term}” <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
