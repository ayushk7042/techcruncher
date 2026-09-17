import "server-only";

import { cache } from "react";
import type { Category, HomeFeed, News, Tag } from "@/types/api";
import { publicApi } from "./public";

/**
 * Loaders shared by server components. Each one degrades to an empty value so
 * a slow or offline API never takes the whole page down with it.
 */

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    console.error("[api]", (error as Error).message);
    return fallback;
  }
}

export const getCategories = cache(() =>
  safe<Category[]>(publicApi.categories({ withCounts: true }, { revalidate: 300, tags: ["categories"] }), []),
);

export const getCategoriesWithCovers = cache(() =>
  safe<Category[]>(publicApi.categories({ withCounts: true, withCover: true }, { revalidate: 300, tags: ["categories"] }), []),
);

export const getTags = cache(() =>
  safe<Tag[]>(publicApi.tags({ limit: 12, sort: "popular" }, { revalidate: 600, tags: ["tags"] }).then((r) => r.data), []),
);

const EMPTY_FEED: HomeFeed = {
  hero: null,
  breaking: [],
  featured: [],
  editorsPick: [],
  trending: [],
  popular: [],
  latest: [],
  dontMiss: [],
};

export const getHomeFeed = cache(() =>
  safe<HomeFeed>(publicApi.homeFeed({ revalidate: 60, tags: ["homepage", "news"] }), EMPTY_FEED),
);

/** The single most urgent headline for the masthead dateline. */
export const getTopHeadline = cache(async (): Promise<Pick<News, "title" | "slug"> | null> => {
  const feed = await getHomeFeed();
  const story = feed.breaking[0] || feed.trending[0] || feed.latest[0];
  return story ? { title: story.title, slug: story.slug } : null;
});

export const getPopular = cache(() =>
  safe(publicApi.listNews({ sort: "popular", limit: 5 }, { revalidate: 300, tags: ["news"] }).then((r) => r.data), [] as News[]),
);

/** Topics ordered by how much they publish, for filter bars and indexes. */
export const topicsByVolume = (categories: Category[]) =>
  [...categories].filter((c) => (c.articleCount || 0) > 0).sort((a, b) => (b.articleCount || 0) - (a.articleCount || 0));
