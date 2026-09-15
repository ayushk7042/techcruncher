import { AdSlot } from "@/components/site/ad-slot";
import { ArticleCard, ArticleListRow, ArticleRankRow, ArticleTileCard, ArticleVideoCard, ArticleWideRow } from "@/components/site/cards";
import { Rail, SectionHeader } from "@/components/site/headers";
import { CategoryGrid } from "@/components/site/home/category-grid";
import { HeroSlider } from "@/components/site/home/hero-slider";
import { LongRead } from "@/components/site/home/long-read";
import { TopicTape } from "@/components/site/home/topic-tape";
import { NewsletterCard } from "@/components/site/newsletter-card";
import { EmptyState } from "@/components/site/states";
import { site } from "@/config/site";
import type { Homepage, News } from "@/types/api";
import { publicApi } from "@/lib/api/public";
import { getCategories, getHomeFeed } from "@/lib/api/server-data";
import { buildHomeBands } from "@/lib/home";
import { cn } from "@/lib/cn";
import { columnsFor } from "@/lib/news";

export const revalidate = 60;

async function loadHomepage(): Promise<Homepage | null> {
  try {
    return await publicApi.homepage({ revalidate: 60 });
  } catch {
    return null;
  }
}

async function loadRecentWithMedia(): Promise<News[]> {
  try {
    // The home feed omits video fields, so the video band reads the list endpoint.
    return (await publicApi.listNews({ sort: "latest", limit: 40 }, { revalidate: 120 })).data;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [feed, homepage, recent, categories] = await Promise.all([
    getHomeFeed(),
    loadHomepage(),
    loadRecentWithMedia(),
    getCategories(),
  ]);

  const bands = buildHomeBands(feed, homepage, recent);
  const topics = categories.filter((c) => !c.parent && c.showOnHome !== false);
  const hasStories = bands.slides.length + bands.featured.length + bands.latest.length > 0;

  let band = 0;
  const nextIndex = () => ++band;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${site.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HeroSlider slides={bands.slides} />
      <TopicTape categories={topics} />

      <div className="container space-y-12 py-10 sm:space-y-14 sm:py-12">
        <AdSlot position="home-top" />

        {!hasStories && <EmptyState title="The newsroom is warming up" message="Stories will appear here as soon as they are published." />}

        {bands.featured.length > 0 && (
          <section>
            <SectionHeader
              index={nextIndex()}
              kicker="Chosen by our editors"
              title="Featured reporting"
              action={{ label: "See all", href: "/trending" }}
            />
            <div
              className={cn(
                "grid gap-x-6 gap-y-9",
                bands.featured.length === 5 ? "grid-cols-2 lg:grid-cols-3" : columnsFor(bands.featured.length),
              )}
            >
              {bands.featured.map((news, i) => (
                <ArticleCard
                  key={news._id}
                  news={news}
                  size={bands.featured.length === 5 && i === 0 ? "lead" : "default"}
                  wideImage={bands.featured.length <= 2}
                  priority={i < 2}
                />
              ))}
            </div>
          </section>
        )}

        {bands.longRead && <LongRead news={bands.longRead} />}

        <AdSlot position="home-mid" ratio="aspect-[1200/200]" />

        {(bands.latest.length > 0 || bands.popular.length > 0) && (
          <div className="grid gap-10 lg:grid-cols-12">
            {bands.latest.length > 0 && (
              <section className="min-w-0 lg:col-span-8">
                <SectionHeader
                  index={nextIndex()}
                  kicker="As it happens"
                  title="Latest reporting"
                  action={{ label: "View all", href: "/latest" }}
                />
                <div className="divide-y divide-line border-b border-line">
                  {bands.latest.map((news) => (
                    <ArticleWideRow key={news._id} news={news} dense />
                  ))}
                </div>
              </section>
            )}

            <aside className={cn("min-w-0", bands.latest.length ? "lg:col-span-4" : "lg:col-span-12")}>
              <div className={cn("space-y-9 lg:sticky lg:top-28", !bands.latest.length && "grid gap-9 sm:grid-cols-2 sm:space-y-0")}>
                {bands.popular.length > 0 && (
                  <Rail title="Most read" action={{ label: "Leaderboard", href: "/popular" }}>
                    {bands.popular.map((news, i) => (
                      <ArticleRankRow key={news._id} news={news} rank={i + 1} dense />
                    ))}
                  </Rail>
                )}
                {bands.editorsPicks.length > 0 && (
                  <Rail title="Editors' picks">
                    {bands.editorsPicks.map((news) => (
                      <ArticleListRow key={news._id} news={news} dense />
                    ))}
                  </Rail>
                )}
                <NewsletterCard variant="plain" layout="compact" source="home-sidebar" />
                <AdSlot position="sidebar" className="hidden lg:block" />
              </div>
            </aside>
          </div>
        )}

        {bands.videos.length > 0 && (
          <section>
            <SectionHeader index={nextIndex()} kicker="Watch" title="On video" action={{ label: "All video", href: "/videos" }} />
            <div className={cn("grid gap-x-6 gap-y-9", columnsFor(bands.videos.length))}>
              {bands.videos.map((news) => (
                <ArticleVideoCard key={news._id} news={news} />
              ))}
            </div>
          </section>
        )}

        <CategoryGrid categories={topics.slice(0, 12)} index={nextIndex()} />

        <NewsletterCard variant="accent" layout="row" source="home" />

        {bands.more.length > 0 && (
          <section>
            <SectionHeader
              index={nextIndex()}
              kicker="Also today"
              title="More from the newsroom"
              action={{ label: "Browse the archive", href: "/latest" }}
            />
            <div className={cn("grid gap-x-6 gap-y-9", columnsFor(bands.more.length, true))}>
              {bands.more.map((news) => (
                <ArticleTileCard key={news._id} news={news} compact />
              ))}
            </div>
          </section>
        )}

        <AdSlot position="home-bottom" />
      </div>
    </>
  );
}
