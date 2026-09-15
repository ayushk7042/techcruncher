import { AdSlot } from "@/components/site/ad-slot";
import { ArticleCard } from "@/components/site/cards";
import { SectionHeader } from "@/components/site/headers";
import type { AdPosition, Advertisement, HomepageGalleryRail, News } from "@/types/api";
import { cn } from "@/lib/cn";
import { columnsFor } from "@/lib/news";

export type RailSide = "left" | "right";

/** A rail that has something to show: a booked ad, or a banner stored on the homepage. */
export type ResolvedRail =
  | { kind: "ad"; position: AdPosition; ads: Advertisement[]; width: HomepageGalleryRail["width"] }
  | { kind: "banner"; image: string; alt: string; link: string; newTab: boolean; width: HomepageGalleryRail["width"] };

export type ResolvedRails = Partial<Record<RailSide, ResolvedRail>>;

/**
 * How the Featured reporting row is divided once rails are booked. The story
 * count is picked so the card grid comes out roughly as tall as a portrait
 * banner: two rails leave a 2x2 block, one narrow rail a 3x2 block.
 */
export function featuredLayout(rails: ResolvedRails) {
  const active = [rails.left, rails.right].filter(Boolean) as ResolvedRail[];
  if (active.length === 2) {
    return { count: 4, columns: 2, railSpan: "lg:col-span-3", mainSpan: "lg:col-span-6", grid: "grid-cols-2" };
  }
  if (active.length === 1) {
    return active[0].width === "narrow"
      ? { count: 6, columns: 3, railSpan: "lg:col-span-3", mainSpan: "lg:col-span-9", grid: "grid-cols-2 sm:grid-cols-3" }
      : { count: 4, columns: 2, railSpan: "lg:col-span-4", mainSpan: "lg:col-span-8", grid: "grid-cols-2" };
  }
  return null;
}

function RailBanner({ rail }: { rail: Extract<ResolvedRail, { kind: "banner" }> }) {
  // Whole image always visible: fitted inside the rail, with a blurred copy filling spare room on desktop.
  const image = (
    <>
      <img src={rail.image} alt="" aria-hidden="true" className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl lg:block" />
      <img src={rail.image} alt={rail.alt} loading="lazy" className="relative block h-auto w-full object-contain lg:h-full" />
    </>
  );
  return (
    <div className="relative overflow-hidden border border-line bg-raise lg:h-full lg:min-h-[360px]">
      {rail.link ? (
        <a
          href={rail.link}
          target={rail.newTab ? "_blank" : undefined}
          rel="noopener noreferrer sponsored"
          className="block transition-opacity hover:opacity-90 lg:absolute lg:inset-0"
        >
          {image}
        </a>
      ) : (
        <div className="lg:absolute lg:inset-0">{image}</div>
      )}
    </div>
  );
}

function Rail({ rail, className }: { rail: ResolvedRail; className: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      {rail.kind === "ad" ? (
        <AdSlot position={rail.position} initialAds={rail.ads} rail className="mx-auto max-w-[360px] lg:max-w-none" />
      ) : (
        <div className="mx-auto max-w-[360px] lg:h-full lg:max-w-none">
          <RailBanner rail={rail} />
        </div>
      )}
    </div>
  );
}

export function FeaturedBand({ stories, rails, index }: { stories: News[]; rails: ResolvedRails; index: number }) {
  const layout = featuredLayout(rails);

  const header = (
    <SectionHeader index={index} kicker="Chosen by our editors" title="Featured reporting" action={{ label: "See all", href: "/trending" }} />
  );

  if (!layout) {
    return (
      <section>
        {header}
        <div className={cn("grid gap-x-6 gap-y-9", stories.length === 5 ? "grid-cols-2 lg:grid-cols-3" : columnsFor(stories.length))}>
          {stories.map((news, i) => (
            <ArticleCard
              key={news._id}
              news={news}
              size={stories.length === 5 && i === 0 ? "lead" : "default"}
              wideImage={stories.length <= 2}
              priority={i < 2}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      {header}
      <div className="grid grid-cols-1 gap-x-6 gap-y-9 lg:grid-cols-12">
        {rails.left && <Rail rail={rails.left} className={cn("order-2 lg:order-none", layout.railSpan)} />}
        <div className={cn("order-1 min-w-0 lg:order-none", layout.mainSpan)}>
          <div className={cn("grid gap-x-6 gap-y-9", layout.grid)}>
            {stories.map((news, i) => (
              <ArticleCard key={news._id} news={news} showExcerpt={layout.columns === 2} priority={i < 2} />
            ))}
          </div>
        </div>
        {rails.right && <Rail rail={rails.right} className={cn("order-3 lg:order-none", layout.railSpan)} />}
      </div>
    </section>
  );
}
