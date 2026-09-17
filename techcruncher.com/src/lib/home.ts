import type { HomeFeed, Homepage, News, RailKey } from "@/types/api";
import { hasVideo, StoryPool, trimToRows } from "./news";

/**
 * Turns the automatic feed plus the editor's homepage curation into the exact
 * set of stories each band renders. Every band draws from one pool, so no
 * story appears twice (Most read is a ranking and is exempt).
 */

export interface HomeBands {
  slides: News[];
  featured: News[];
  /** Stories that fill the column under a Featured reporting banner rail. */
  featuredRails: News[];
  longRead: News | null;
  latest: News[];
  popular: News[];
  editorsPicks: News[];
  videos: News[];
  more: News[];
}

type Sections = Partial<Homepage["sections"]>;

const railEnabled = (sections: Sections, key: RailKey) => sections[key]?.enabled !== false;

/** Manually curated stories for a rail, or null when it runs on auto. */
const curated = (sections: Sections, key: RailKey): News[] | null => {
  const rail = sections[key];
  if (!rail || rail.mode !== "manual") return null;
  const items = (rail.items || []).filter((item): item is News => Boolean(item && typeof item === "object" && item.slug));
  return items.length ? items : null;
};

export function buildHomeBands(
  feed: HomeFeed,
  homepage: Homepage | null,
  recentWithMedia: News[],
  options: {
    /** Fixed Featured reporting size, used when banner rails share its row. */
    featuredCount?: number;
    /** Keep Featured reporting to whole rows of this many columns. */
    featuredColumns?: number;
    /** One story per banner rail, to fill the column under the banner. */
    featuredRailCount?: number;
    /** Stories already placed by hand elsewhere on the page; never repeated here. */
    claimed?: News[];
  } = {},
): HomeBands {
  const sections: Sections = homepage?.sections || {};

  const everything = [
    ...feed.latest,
    ...feed.dontMiss,
    ...feed.featured,
    ...feed.editorsPick,
    ...feed.trending,
    ...feed.breaking,
  ];
  const pool = new StoryPool(everything);
  pool.markUsed(options.claimed ?? []);
  const supply = new Set(everything.map((n) => n._id)).size;

  const slides = railEnabled(sections, "hero")
    ? pool.claim(
        [
          ...(curated(sections, "hero") ?? [homepage?.mainTrending, feed.hero]),
          ...(railEnabled(sections, "heroRail")
            ? (curated(sections, "heroRail") ?? [...(homepage?.subTrending || []), ...feed.breaking, ...feed.trending])
            : []),
        ],
        5,
      )
    : [];

  const featuredCount = options.featuredCount ?? (supply >= 16 ? 5 : supply >= 10 ? 3 : 2);
  const claimedFeatured = railEnabled(sections, "featured")
    ? pool.claim(curated(sections, "featured") ?? feed.featured, featuredCount)
    : [];
  // Stories dropped to keep whole rows are released to the bands below.
  const featured = options.featuredColumns ? trimToRows(claimedFeatured, [options.featuredColumns]) : claimedFeatured;
  pool.release(claimedFeatured.slice(featured.length));

  // Claimed right after the grid, so a rail shows a fresh story rather than one
  // repeated below. Follows curated Editors' picks when the panel sets them.
  const featuredRails = options.featuredRailCount
    ? pool.claim(curated(sections, "editorsPicks") ?? feed.editorsPick, options.featuredRailCount)
    : [];

  const longRead = railEnabled(sections, "dontMiss")
    ? (pool.claim(curated(sections, "dontMiss") ?? feed.dontMiss, 1)[0] ?? null)
    : null;

  // Seven rows, so the column finishes level with the sidebar beside it
  // (Most read, Editors' picks and the daily brief).
  const latest = railEnabled(sections, "latest") ? pool.claim(curated(sections, "latest") ?? feed.latest, 7) : [];

  const popular = railEnabled(sections, "popular") ? (curated(sections, "popular") ?? feed.popular).slice(0, 5) : [];

  const editorsPicks = railEnabled(sections, "editorsPicks")
    ? pool.claim(curated(sections, "editorsPicks") ?? feed.editorsPick, 4)
    : [];

  const videos = pool.claim(recentWithMedia.filter(hasVideo), 4, false);

  // Whole rows of four, matching the grid the band renders. The recent list is
  // appended so the band still fills its rows once the curated category bands
  // above have claimed their stories.
  const more = railEnabled(sections, "moreStories")
    ? trimToRows(pool.claim([...(curated(sections, "moreStories") ?? feed.dontMiss), ...recentWithMedia], 12), [4])
    : [];

  return { slides, featured, featuredRails, longRead, latest, popular, editorsPicks, videos, more };
}
