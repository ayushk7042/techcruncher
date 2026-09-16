import { AdSlot, AdLabelBar, AD_SHELL } from "@/components/site/ad-slot";
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
  // Full column width, never cropped; spare room on desktop is filled with a blurred copy
  // of the same image rather than left blank. self-stretch, not h-full: a percentage
  // height on a flex child cancels the stretch and the image sticks to the top.
  const image = (
    <span className="relative flex w-full items-center self-stretch overflow-hidden">
      <img src={rail.image} alt="" aria-hidden="true" className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl lg:block" />
      <img src={rail.image} alt={rail.alt} loading="lazy" className="relative block h-auto w-full object-contain" />
    </span>
  );
  return (
    <div className={AD_SHELL}>
      <AdLabelBar />
      <div className="relative flex overflow-hidden lg:min-h-[380px]">
        {rail.link ? (
          <a
            href={rail.link}
            target={rail.newTab ? "_blank" : undefined}
            rel="noopener noreferrer sponsored"
            className="flex w-full self-stretch transition-opacity hover:opacity-90"
          >
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </div>
  );
}

/**
 * A rail is the banner plus, on desktop, one story underneath: the column is
 * as tall as the story grid beside it, and a story fills what the banner does
 * not use instead of leaving the space empty.
 */
function Rail({ rail, story, className }: { rail: ResolvedRail; story?: News; className: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="mx-auto max-w-[360px] lg:sticky lg:top-28 lg:max-w-none">
        {rail.kind === "ad" ? <AdSlot position={rail.position} initialAds={rail.ads} rail /> : <RailBanner rail={rail} />}

        {story && (
          <div className="mt-6 hidden lg:block">
            <p className="eyebrow rule-strong pt-2">Also worth reading</p>
            <div className="mt-3">
              <ArticleCard news={story} showExcerpt={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FeaturedBand({
  stories,
  railStories = [],
  rails,
  index,
}: {
  stories: News[];
  /** One story per rail, filling the column under the banner. */
  railStories?: News[];
  rails: ResolvedRails;
  index: number;
}) {
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
        {rails.left && <Rail rail={rails.left} story={railStories[0]} className={cn("order-2 lg:order-none", layout.railSpan)} />}
        <div className={cn("order-1 min-w-0 lg:order-none", layout.mainSpan)}>
          <div className={cn("grid gap-x-6 gap-y-9", layout.grid)}>
            {stories.map((news, i) => (
              <ArticleCard key={news._id} news={news} showExcerpt={layout.columns === 2} priority={i < 2} />
            ))}
          </div>
        </div>
        {rails.right && (
          <Rail
            rail={rails.right}
            story={railStories[rails.left ? 1 : 0]}
            className={cn("order-3 lg:order-none", layout.railSpan)}
          />
        )}
      </div>
    </section>
  );
}
