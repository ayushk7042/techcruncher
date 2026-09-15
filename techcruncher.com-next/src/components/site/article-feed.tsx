"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useRef } from "react";
import type { AdPosition, NewsListParams, NewsSort, Paginated, News } from "@/types/api";
import { useUrlState } from "@/hooks/use-url-state";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";
import { AdSlot } from "./ad-slot";
import { ArticleCard } from "./cards";
import { Pagination } from "./pagination";
import { EmptyState, ErrorState } from "./states";
import { ListSkeleton } from "@/components/ui/skeleton";

const SORTS: { label: string; value: NewsSort }[] = [
  { label: "Latest", value: "latest" },
  { label: "Most read", value: "popular" },
  { label: "Oldest", value: "oldest" },
  { label: "A–Z", value: "title" },
];

interface ArticleFeedProps {
  /** Fixed filters for this page (category, tag, author, search…). */
  params: NewsListParams;
  /** First page rendered on the server for the default sort and topic. */
  initial?: Paginated<News>;
  header?: React.ReactNode;
  pageSize?: number;
  /** Query-string key a FilterBar writes a category slug to, if any. */
  topicParam?: string;
  /** API filter the topic slug is applied to (sub-category pills on a category page). */
  topicField?: "category" | "subCategory";
  adPosition?: AdPosition;
  emptyTitle?: string;
  emptyMessage?: string;
}

export function ArticleFeed({
  params,
  initial,
  header,
  pageSize = 16,
  topicParam = "topic",
  topicField = "category",
  adPosition = "category-infeed",
  emptyTitle,
  emptyMessage,
}: ArticleFeedProps) {
  const { get, set } = useUrlState();
  const page = Math.max(1, Number(get("page")) || 1);
  const sort = (get("sort") as NewsSort) || "latest";
  const topic = get(topicParam);
  const topRef = useRef<HTMLDivElement>(null);

  const query: NewsListParams = {
    ...params,
    ...(topic ? { [topicField]: topic } : {}),
    page,
    limit: pageSize,
    sort,
  };
  const isInitialView = page === 1 && sort === "latest" && !topic;

  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ["news-list", query],
    queryFn: ({ signal }) => publicApi.listNews(query, { signal }),
    initialData: isInitialView ? initial : undefined,
    placeholderData: keepPreviousData,
  });

  // Scroll back to the top of the feed when the page changes.
  const previousPage = useRef(page);
  useEffect(() => {
    if (previousPage.current !== page) {
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      previousPage.current = page;
    }
  }, [page]);

  const items = data?.data ?? [];
  const pagination = data?.pagination;
  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.total, pagination.page * pagination.limit) : 0;

  return (
    <div ref={topRef} className="scroll-mt-32">
      <div className="rule-strong mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pt-2.5">
        <div className="min-w-0">{header}</div>
        <div className="flex items-center gap-4 pb-0.5">
          <span className="eyebrow hidden sm:inline">Sort</span>
          {SORTS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={sort === option.value}
              onClick={() => set({ sort: option.value === "latest" ? null : option.value, page: null })}
              className={cn(
                "font-mono text-[11px] uppercase tracking-eyebrow transition-colors",
                sort === option.value
                  ? "text-ink underline decoration-accent decoration-2 underline-offset-[5px]"
                  : "text-ink-mute hover:text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {isPending ? (
        <ListSkeleton count={8} />
      ) : isError && !data ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      ) : (
        <>
          <div
            className={cn(
              "grid gap-x-6 gap-y-9 transition-opacity sm:grid-cols-2 lg:grid-cols-4",
              isPlaceholderData && "opacity-50",
            )}
          >
            {items.map((news, index) => (
              <Fragment key={news._id}>
                <ArticleCard news={news} priority={index < 3} />
                {index === 7 && items.length > 8 && (
                  <div className="sm:col-span-2 lg:col-span-4">
                    <AdSlot position={adPosition} ratio="aspect-[970/140]" category={params.category} />
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {pagination && (
            <>
              <Pagination page={pagination.page} pages={pagination.pages} onChange={(next) => set({ page: next })} />
              <p className="meta mt-3.5 text-center">
                {from}–{to} of {pagination.total} stories
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
