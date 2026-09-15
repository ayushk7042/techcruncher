"use client";

import Link from "next/link";
import type { News, Paginated } from "@/types/api";
import { AdSlot } from "@/components/site/ad-slot";
import { CategoryChip } from "@/components/site/category-chip";
import { Rail } from "@/components/site/headers";
import { ListSkeleton } from "@/components/ui/skeleton";
import { SmartImage } from "@/components/ui/smart-image";
import { compactNumber, pad2 } from "@/lib/format";
import { categoryOf, excerptOf, heatOf, imageOf, newsHref } from "@/lib/news";
import { FeedGate, feedState } from "./feed-gate";
import { TRENDING_PARAMS } from "./params";
import { Bar, barWidth, MetaLine, Podium, TopicBars, totalsByTopic } from "./ranking";
import { useTopicNews } from "./use-topic-news";

function LeaderboardRow({ news, rank, top }: { news: News; rank: number; top: number }) {
  const heat = heatOf(news);
  const image = imageOf(news);

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
        <div className="mt-3 flex items-center gap-3">
          <Bar percent={barWidth(heat, top)} className="w-full max-w-[220px]" />
          <span className="meta shrink-0 tabular-nums">{compactNumber(heat)} heat</span>
        </div>
      </div>
      <div className="hidden w-[104px] shrink-0 self-start sm:block">
        <SmartImage src={image?.url} alt="" width={104} imgClassName="transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
    </article>
  );
}

function MostShared({ stories }: { stories: News[] }) {
  const shared = stories
    .filter((news) => (news.shareCount || 0) > 0)
    .sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0))
    .slice(0, 5);
  if (shared.length === 0) return null;

  return (
    <Rail title="Most shared">
      {shared.map((news, index) => (
        <article key={news._id} className="group relative flex items-baseline gap-3.5 py-3.5">
          <span className="w-6 shrink-0 font-mono text-[15px] font-medium leading-none tabular-nums text-accent">
            {pad2(index + 1)}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="headline text-[15px]">
              <Link href={newsHref(news)} className="clamp-2 transition-colors group-hover:text-accent">
                <span className="absolute inset-0" aria-hidden="true" />
                {news.title}
              </Link>
            </h3>
            <p className="meta mt-1.5 tabular-nums">{compactNumber(news.shareCount)} shares</p>
          </div>
        </article>
      ))}
    </Rail>
  );
}

function WhyTrending({ news }: { news: News }) {
  return (
    <aside className="mt-16 border-t border-ink pt-6">
      <p className="eyebrow-accent">Why this is trending</p>
      <h2 className="headline mt-3 text-[17px]">
        <Link href={newsHref(news)} className="transition-colors hover:text-accent">
          {news.title}
        </Link>
      </h2>
      <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink-soft">{excerptOf(news, 200)}</p>
      <MetaLine
        parts={[
          `${compactNumber(news.views)} reads`,
          `${compactNumber(news.likes)} likes`,
          `${compactNumber(news.shareCount)} shares`,
          `${compactNumber(heatOf(news))} heat`,
        ]}
        className="mt-3"
      />
    </aside>
  );
}

export function TrendingBoard({ initial }: { initial?: Paginated<News> }) {
  const query = useTopicNews(TRENDING_PARAMS, initial);
  const ranked = [...(query.data?.data ?? [])].sort((a, b) => heatOf(b) - heatOf(a));
  const topHeat = ranked[0] ? heatOf(ranked[0]) : 0;

  return (
    <FeedGate
      state={feedState(query, ranked.length === 0)}
      skeleton={<ListSkeleton count={4} />}
      onRetry={() => query.refetch()}
      dimmed={query.isPlaceholderData}
      emptyTitle="Nothing is trending yet"
      emptyMessage="Once readers start viewing, liking and sharing stories, the leaderboard fills in here."
    >
      {() => (
        <>
          <Podium stories={ranked} stat={(news) => <span className="eyebrow">{compactNumber(heatOf(news))} heat</span>} />

          <div className="mt-14 grid gap-9 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 lg:col-span-8">
              {ranked.length > 3 && (
                <Rail title="The full leaderboard">
                  {ranked.slice(3).map((news, index) => (
                    <LeaderboardRow key={news._id} news={news} rank={index + 4} top={topHeat} />
                  ))}
                </Rail>
              )}
            </div>
            <aside className="min-w-0 lg:col-span-4">
              <div className="space-y-9 lg:sticky lg:top-28">
                <Rail title="Hottest topics">
                  <TopicBars totals={totalsByTopic(ranked, heatOf).slice(0, 6)} unit="heat" />
                </Rail>
                <MostShared stories={ranked} />
                <AdSlot position="sidebar" />
              </div>
            </aside>
          </div>

          <WhyTrending news={ranked[0]} />
        </>
      )}
    </FeedGate>
  );
}
