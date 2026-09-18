import { RAIL_KEYS, type HomeFeed, type Homepage, type News, type RailKey } from "@/types/api";
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
  // Every hand-picked story is held back before a single band claims, so an
  // automatic band above can never take one and leave its own band short.
  RAIL_KEYS.forEach((key) => pool.reserve(curated(sections, key) ?? []));
  const supply = new Set(everything.map((n) => n._id)).size;

  // `ownReserved` is true only for a rail that genuinely has hand-picked
  // stories. Passing it everywhere let the hero take another band's picks
  // through its own preferred list, which is how a manual choice went missing.
  const heroCurated = curated(sections, "hero");
  const heroRailCurated = curated(sections, "heroRail");

  const slides = railEnabled(sections, "hero")
    ? pool.claim(
        [
          ...(heroCurated ?? [homepage?.mainTrending, feed.hero]),
          ...(railEnabled(sections, "heroRail")
            ? (heroRailCurated ?? [...(homepage?.subTrending || []), ...feed.breaking, ...feed.trending])
            : []),
        ],
        5,
        true,
        Boolean(heroCurated || heroRailCurated),
      )
    : [];

  const featuredCount = options.featuredCount ?? (supply >= 16 ? 5 : supply >= 10 ? 3 : 2);
  const featuredCurated = curated(sections, "featured");
  const claimedFeatured = railEnabled(sections, "featured")
    ? pool.claim(featuredCurated ?? feed.featured, featuredCount, true, Boolean(featuredCurated))
    : [];
  // Stories dropped to keep whole rows are released to the bands below.
  const featured = options.featuredColumns ? trimToRows(claimedFeatured, [options.featuredColumns]) : claimedFeatured;
  pool.release(claimedFeatured.slice(featured.length));

  // Claimed right after the grid, so a rail shows a fresh story rather than one
  // repeated below. Follows curated Editors' picks when the panel sets them.
  const picksCurated = curated(sections, "editorsPicks");
  const featuredRails = options.featuredRailCount
    ? pool.claim(picksCurated ?? feed.editorsPick, options.featuredRailCount, true, Boolean(picksCurated))
    : [];

  const longReadCurated = curated(sections, "dontMiss");
  const longRead = railEnabled(sections, "dontMiss")
    ? (pool.claim(longReadCurated ?? feed.dontMiss, 1, true, Boolean(longReadCurated))[0] ?? null)
    : null;

  // Seven rows, so the column finishes level with the sidebar beside it
  // (Most read, Editors' picks and the daily brief).
  const latestCurated = curated(sections, "latest");
  const latest = railEnabled(sections, "latest")
    ? pool.claim(latestCurated ?? feed.latest, 7, true, Boolean(latestCurated))
    : [];

  const popular = railEnabled(sections, "popular") ? (curated(sections, "popular") ?? feed.popular).slice(0, 5) : [];

  const editorsPicks = railEnabled(sections, "editorsPicks")
    ? pool.claim(picksCurated ?? feed.editorsPick, 4, true, Boolean(picksCurated))
    : [];

  const videos = pool.claim(recentWithMedia.filter(hasVideo), 4, false);

  // Whole rows of four, matching the grid the band renders. The recent list is
  // appended so the band still fills its rows once the curated category bands
  // above have claimed their stories.
  const moreCurated = curated(sections, "moreStories");
  const more = railEnabled(sections, "moreStories")
    ? trimToRows(pool.claim([...(moreCurated ?? feed.dontMiss), ...recentWithMedia], 12, true, Boolean(moreCurated)), [4])
    : [];

  return { slides, featured, featuredRails, longRead, latest, popular, editorsPicks, videos, more };
}
