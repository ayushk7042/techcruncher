import { AdSlot } from "@/components/site/ad-slot";
import { ArticleListRow, ArticleRankRow, ArticleTileCard, ArticleVideoCard, ArticleWideRow } from "@/components/site/cards";
import { Rail, SectionHeader } from "@/components/site/headers";
import { CategoryGrid } from "@/components/site/home/category-grid";
import {
  FeaturedBand,
  featuredLayout,
  type RailSide,
  type ResolvedRail,
  type ResolvedRails,
} from "@/components/site/home/featured-band";
import { HeroSlider } from "@/components/site/home/hero-slider";
import { LongRead } from "@/components/site/home/long-read";
import { TopicTape } from "@/components/site/home/topic-tape";
import { NewsletterCard } from "@/components/site/newsletter-card";
import { EmptyState } from "@/components/site/states";
import { site } from "@/config/site";
import { AD_POSITIONS, type AdPosition, type Homepage, type News } from "@/types/api";
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

const RAIL_POSITIONS: Record<RailSide, AdPosition> = { left: "home-gallery-left", right: "home-gallery-right" };

const isAdPosition = (value: string): value is AdPosition => (AD_POSITIONS as readonly string[]).includes(value);

/**
 * Resolves the Homegallery Left / Right rails before render, so Featured
 * reporting is laid out for the rails that will actually show instead of
 * reflowing once an ad loads. Rails are a desktop column, so desktop
 * targeting decides whether one takes space.
 */
async function loadGalleryRails(homepage: Homepage | null): Promise<ResolvedRails> {
  const sides: RailSide[] = ["left", "right"];
  const entries = await Promise.all(
    sides.map(async (side): Promise<[RailSide, ResolvedRail | null]> => {
      const config = homepage?.gallery?.rails?.[side];
      if (config?.enabled === false) return [side, null];
      const width = config?.width || "narrow";

      if (config?.type === "banner") {
        return [
          side,
          config.image
            ? { kind: "banner", image: config.image, alt: config.imageAlt || "", link: config.link, newTab: config.openInNewTab !== false, width }
            : null,
        ];
      }

      const position = config?.adPosition && isAdPosition(config.adPosition) ? config.adPosition : RAIL_POSITIONS[side];
      try {
        const ads = await publicApi.serveAds(position, "desktop", undefined, { revalidate: 60 });
        const bookable = ads.filter((ad) => (ad.type === "script" ? Boolean(ad.scriptCode) : Boolean(ad.image?.url)));
        return [side, bookable.length ? { kind: "ad", position, ads: bookable, width } : null];
      } catch {
        return [side, null];
      }
    }),
  );
  return Object.fromEntries(entries.filter(([, rail]) => rail)) as ResolvedRails;
}

export default async function HomePage() {
  const [feed, homepage, recent, categories] = await Promise.all([
    getHomeFeed(),
    loadHomepage(),
    loadRecentWithMedia(),
    getCategories(),
  ]);

  const rails = await loadGalleryRails(homepage);
  const featuredGrid = featuredLayout(rails);
  const bands = buildHomeBands(feed, homepage, recent, {
    featuredCount: featuredGrid?.count,
    featuredColumns: featuredGrid?.columns,
  });
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
        {/* The strip keeps its size; each creative is fitted inside it whole, never cropped. */}
        <AdSlot position="home-top" fixed />

        {!hasStories && <EmptyState title="The newsroom is warming up" message="Stories will appear here as soon as they are published." />}

        {bands.featured.length > 0 && <FeaturedBand stories={bands.featured} rails={rails} index={nextIndex()} />}

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
