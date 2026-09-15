"use client";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { News, NewsListParams, Paginated } from "@/types/api";
import { ArticleMeta } from "@/components/site/article-meta";
import { CategoryChip } from "@/components/site/category-chip";
import { GroupHeader } from "@/components/site/headers";
import { ListSkeleton, Skeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { useUrlState } from "@/hooks/use-url-state";
import { publicApi } from "@/lib/api/public";
import { dayGroupLabel } from "@/lib/format";
import { useHydrated } from "@/hooks/use-hydrated";
import { categoryOf, excerptOf, imageOf, newsDate, newsHref } from "@/lib/news";
import { FeedGate, feedState } from "./feed-gate";
import { LATEST_PARAMS } from "./params";

export function LatestFeedSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[16/9] w-full" />
      <Skeleton className="mt-5 h-2.5 w-28" />
      <Skeleton className="mt-4 h-8 w-4/5" />
      <Skeleton className="mb-14 mt-4 h-3 w-48" />
      <ListSkeleton count={5} compact />
    </div>
  );
}

function LeadStory({ news }: { news: News }) {
  const image = imageOf(news);
  const href = newsHref(news);

  return (
    <article className="group mb-14">
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <SmartImage
          src={image?.url}
          alt=""
          ratio="aspect-[16/9]"
          width={860}
          priority
          imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.02]"
        />
      </Link>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="eyebrow-accent">Just published</span>
        <span aria-hidden="true" className="text-line-strong">
          /
        </span>
        <CategoryChip category={categoryOf(news)} />
      </div>
      <h2 className="headline mt-3.5 text-[28px] sm:text-[34px]">
        <Link href={href} className="transition-colors group-hover:text-accent">
          {news.title}
        </Link>
      </h2>
      <p className="clamp-3 mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{excerptOf(news, 220)}</p>
      <ArticleMeta news={news} showAuthor className="mt-4" />
    </article>
  );
}

function DayRow({ news }: { news: News }) {
  const image = imageOf(news);

  return (
    <article className="group relative flex gap-5 py-5">
      <div className="min-w-0 flex-1">
        <CategoryChip category={categoryOf(news)} linked={false} />
        <h3 className="headline mt-2 text-[18px]">
          <Link href={newsHref(news)} className="clamp-2 transition-colors group-hover:text-accent">
            <span className="absolute inset-0" aria-hidden="true" />
            {news.title}
          </Link>
        </h3>
        <p className="clamp-1 mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{excerptOf(news, 140)}</p>
        <ArticleMeta news={news} showAuthor showViews className="mt-2.5" />
      </div>
      <div className="w-[104px] shrink-0 sm:w-[132px]">
        <SmartImage
          src={image?.url}
          alt=""
          width={132}
          imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
    </article>
  );
}

/**
 * Consecutive stories bucketed under Today / Yesterday / This week / a date.
 * Day boundaries depend on the reader's time zone, so until hydration everything
 * sits in one bucket and server and client markup agree.
 */
function groupByDay(stories: News[], relative: boolean): { label: string; stories: News[] }[] {
  if (!relative) return stories.length ? [{ label: "Earlier", stories }] : [];
  const groups: { label: string; stories: News[] }[] = [];
  for (const news of stories) {
    const label = dayGroupLabel(newsDate(news));
    const last = groups.at(-1);
    if (last?.label === label) last.stories.push(news);
    else groups.push({ label, stories: [news] });
  }
  return groups;
}

export function LatestFeed({ initial }: { initial?: Paginated<News> }) {
  const topic = useUrlState().get("topic");
  const hydrated = useHydrated();
  const params: NewsListParams = topic ? { ...LATEST_PARAMS, category: topic } : LATEST_PARAMS;

  const query = useInfiniteQuery({
    queryKey: ["news-infinite", params],
    queryFn: ({ pageParam, signal }) => publicApi.listNews({ ...params, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: ({ pagination }) => (pagination.page < pagination.pages ? pagination.page + 1 : undefined),
    initialData: topic || !initial ? undefined : { pages: [initial], pageParams: [1] },
    placeholderData: keepPreviousData,
  });

  const stories = query.data?.pages.flatMap((page) => page.data) ?? [];
  const total = query.data?.pages[0]?.pagination.total ?? 0;
  const [lead, ...rest] = stories;

  return (
    <FeedGate
      state={feedState(query, stories.length === 0)}
      skeleton={<LatestFeedSkeleton />}
      onRetry={() => query.refetch()}
      dimmed={query.isPlaceholderData}
      emptyTitle="Nothing filed here yet"
      emptyMessage="No stories have been published under this topic. Try another one."
    >
      {() => (
        <>
          <LeadStory news={lead} />

          <div className="space-y-10">
            {groupByDay(rest, hydrated).map((group) => (
              <section key={group.label}>
                <GroupHeader title={group.label} count={`${group.stories.length} ${group.stories.length === 1 ? "story" : "stories"}`} />
                <div className="divide-y divide-line">
                  {group.stories.map((news) => (
                    <DayRow key={news._id} news={news} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {query.hasNextPage && (
            <button
              type="button"
              onClick={() => query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
              className="btn-outline mt-12 h-12 w-full"
            >
              {query.isFetchingNextPage && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              Load more stories
              <span className="tabular-nums opacity-60">
                {stories.length} of {total}
              </span>
            </button>
          )}
        </>
      )}
    </FeedGate>
  );
}
