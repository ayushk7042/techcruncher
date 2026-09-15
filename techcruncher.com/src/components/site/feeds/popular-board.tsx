"use client";

import Link from "next/link";
import type { News, Paginated } from "@/types/api";
import { AdSlot } from "@/components/site/ad-slot";
import { ArticleMeta } from "@/components/site/article-meta";
import { ArticleCard } from "@/components/site/cards";
import { CategoryChip } from "@/components/site/category-chip";
import { Rail } from "@/components/site/headers";
import { NewsletterCard } from "@/components/site/newsletter-card";
import { ListSkeleton } from "@/components/ui/skeleton";
import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/cn";
import { compactNumber, pad2 } from "@/lib/format";
import { categoryOf, newsDate, newsHref } from "@/lib/news";
import { FeedGate, feedState } from "./feed-gate";
import { PERIODS } from "./params";
import { Podium, TopicBars, totalsByTopic } from "./ranking";
import { usePopularNews } from "./use-topic-news";

const viewsOf = (news: News) => news.views || 0;

/** Period toggles plus the "{views} reads across {n} stories" summary. */
export function PopularControls({ initial }: { initial?: Paginated<News> }) {
  const { set } = useUrlState();
  const { period, data } = usePopularNews(initial);
  const stories = data?.data ?? [];
  const views = stories.reduce((sum, news) => sum + viewsOf(news), 0);

  return (
    <div className="flex flex-wrap items-center gap-6">
      <span className="eyebrow">Period</span>
      {PERIODS.map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={period === option.value}
          onClick={() => set({ period: option.value || null })}
          className={cn(
            "text-[13px] transition-colors",
            period === option.value
              ? "font-semibold text-ink underline decoration-accent decoration-2 underline-offset-[6px]"
              : "text-ink-mute hover:text-ink",
          )}
        >
          {option.label}
        </button>
      ))}
      {data && (
        <span className="meta ml-auto tabular-nums">
          {compactNumber(views)} reads across {stories.length} {stories.length === 1 ? "story" : "stories"}
        </span>
      )}
    </div>
  );
}

function PopularRow({ news, rank }: { news: News; rank: number }) {
  return (
    <article className="group relative flex items-baseline gap-5 py-5">
      <span className="w-7 shrink-0 font-mono text-[16px] tabular-nums text-line-strong transition-colors group-hover:text-accent">
        {pad2(rank)}
      </span>
      <div className="min-w-0 flex-1">
        <CategoryChip category={categoryOf(news)} linked={false} />
        <h3 className="headline mt-2 text-[17px]">
          <Link href={newsHref(news)} className="clamp-2 transition-colors group-hover:text-accent">
            <span className="absolute inset-0" aria-hidden="true" />
            {news.title}
          </Link>
        </h3>
        <ArticleMeta news={news} showAuthor compact className="mt-2.5" />
      </div>
      <div className="shrink-0 self-center text-right">
        <p className="headline text-[21px] tabular-nums">{compactNumber(news.views)}</p>
        <p className="eyebrow mt-1">reads</p>
      </div>
    </article>
  );
}

/** Reads per day since publication, so a young breakout can beat an old staple. */
function storyOfPeriod(stories: News[]): News | undefined {
  const now = Date.now();
  const pace = (news: News) => {
    const published = new Date(newsDate(news) ?? now).getTime();
    return viewsOf(news) / Math.max(1, (now - published) / 86_400_000);
  };
  return [...stories].sort((a, b) => pace(b) - pace(a))[0];
}

export function PopularBoard({ initial }: { initial?: Paginated<News> }) {
  const query = usePopularNews(initial);
  const stories = query.data?.data ?? [];
  const standout = storyOfPeriod(stories);

  return (
    <FeedGate
      state={feedState(query, stories.length === 0)}
      skeleton={<ListSkeleton count={4} />}
      onRetry={() => query.refetch()}
      dimmed={query.isPlaceholderData}
      emptyTitle="Nothing read yet"
      emptyMessage="No stories were read in this period. Try a longer one or another topic."
    >
      {() => (
        <>
          <Podium
            stories={stories}
            stat={(news) => (
              <span className="ml-auto text-[12px] tabular-nums text-ink-mute">{compactNumber(news.views)} reads</span>
            )}
          />

          <div className="mt-14 grid gap-9 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-8">
              {stories.length > 3 && (
                <Rail title="The rest of the top 30">
                  {stories.slice(3).map((news, index) => (
                    <PopularRow key={news._id} news={news} rank={index + 4} />
                  ))}
                </Rail>
              )}
            </div>
            <aside className="min-w-0 lg:col-span-4">
              <div className="space-y-9 lg:sticky lg:top-28">
                <Rail title="Where readers spend time">
                  <TopicBars totals={totalsByTopic(stories, viewsOf).slice(0, 6)} unit="reads" />
                </Rail>
                {standout && (
                  <Rail title="Story of the period">
                    <div className="pt-4">
                      <ArticleCard news={standout} />
                    </div>
                  </Rail>
                )}
                <NewsletterCard layout="compact" source="popular" />
                <AdSlot position="sidebar" />
              </div>
            </aside>
          </div>
        </>
      )}
    </FeedGate>
  );
}
