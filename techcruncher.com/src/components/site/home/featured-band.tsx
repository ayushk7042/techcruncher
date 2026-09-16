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
 * How the Featured reporting row is divided once rails are booked. Stories and
 * rails share one grid, two rows deep: the banner sits in the first row and the
 * rail's story in the second, so it lines up with the story cards beside it.
 */
export function featuredLayout(rails: ResolvedRails) {
  const active = [rails.left, rails.right].filter(Boolean) as ResolvedRail[];
  if (!active.length) return null;

  const wide = active.length === 1 && active[0].width !== "narrow";

  return {
    count: active.length === 2 ? 4 : wide ? 4 : 6,
    columns: active.length === 2 || wide ? 2 : 3,
    railSpan: wide ? "lg:col-span-4" : "lg:col-span-3",
    storySpan: wide ? "lg:col-span-4" : "lg:col-span-3",
    leftStart: "lg:col-start-1",
    rightStart: wide ? "lg:col-start-9" : "lg:col-start-10",
    // Stories begin after a left rail, otherwise at the first column.
    storyStart: !rails.left ? "lg:col-start-1" : wide ? "lg:col-start-5" : "lg:col-start-4",
  };
}

function RailBanner({ rail }: { rail: Extract<ResolvedRail, { kind: "banner" }> }) {
  // Full width, never cropped; spare room on desktop is filled with a blurred
  // copy of the same image rather than left blank.
  const image = (
    <span className="relative flex w-full items-center self-stretch overflow-hidden">
      <img
        src={rail.image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 hidden h-full w-full scale-110 object-cover opacity-40 blur-2xl lg:block"
      />
      <img src={rail.image} alt={rail.alt} loading="lazy" className="relative block h-auto w-full object-contain lg:h-full" />
    </span>
  );

  return (
    <div className={cn(AD_SHELL, "flex flex-col lg:h-full")}>
      <AdLabelBar />
      <div className="relative flex min-h-0 overflow-hidden lg:flex-1">
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
 * One rail: the banner in the grid's first row, a story in its second. On
 * desktop the cell spans both rows and borrows the grid's own row lines
 * (subgrid), which is what keeps the story level with the cards beside it.
 */
function Rail({ rail, story, spanClass, columnClass }: { rail: ResolvedRail; story?: News; spanClass: string; columnClass: string }) {
  return (
    <div
      className={cn(
        "order-last col-span-2 min-w-0 lg:order-none",
        spanClass,
        // Pinned to the first row and its own column: a rail written after the
        // stories would otherwise be auto-placed into the next free row.
        columnClass,
        "lg:row-start-1 lg:row-span-2 lg:grid lg:grid-rows-subgrid",
      )}
    >
      {/* min-h-0 + overflow-hidden: the banner fits the row, it never stretches it. */}
      <div className="relative mx-auto max-w-[360px] lg:mx-0 lg:min-h-0 lg:max-w-none lg:overflow-hidden">
        <div className="lg:absolute lg:inset-0">
          {rail.kind === "ad" ? <AdSlot position={rail.position} initialAds={rail.ads} rail /> : <RailBanner rail={rail} />}
        </div>
      </div>

      {story && (
        <div className="hidden min-w-0 lg:block">
          <ArticleCard news={story} showExcerpt={false} />
        </div>
      )}
    </div>
  );
}

export function FeaturedBand({
  stories,
  railStories = [],
  rails,
}: {
  stories: News[];
  /** One story per rail, filling the column under the banner. */
  railStories?: News[];
  rails: ResolvedRails;
}) {
  const layout = featuredLayout(rails);

  const header = (
    <SectionHeader kicker="Chosen by our editors" title="Featured reporting" action={{ label: "See all", href: "/trending" }} />
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
      {/* Stories and rails are children of the same grid, so every row lines up. */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-12">
        {rails.left && (
          <Rail rail={rails.left} story={railStories[0]} spanClass={layout.railSpan} columnClass={layout.leftStart} />
        )}

        {stories.map((news, i) => (
          // Only the first card names its column; the rest flow on from it.
          <div key={news._id} className={cn("min-w-0", layout.storySpan, i === 0 && layout.storyStart)}>
            <ArticleCard news={news} showExcerpt={layout.columns === 2} priority={i < 2} />
          </div>
        ))}

        {rails.right && (
          <Rail
            rail={rails.right}
            story={railStories[rails.left ? 1 : 0]}
            spanClass={layout.railSpan}
            columnClass={layout.rightStart}
          />
        )}
      </div>
    </section>
  );
}
