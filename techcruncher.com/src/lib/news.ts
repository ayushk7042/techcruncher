import { site } from "@/config/site";
import type { Category, ContentBlock, ImageAsset, News, Paginated, Tag } from "@/types/api";

/** The fields a card, rail row or feed reads — everything a client component needs from a list item. */
export type CardNews = Pick<
  News,
  | "_id"
  | "slug"
  | "title"
  | "subtitle"
  | "excerpt"
  | "description"
  | "featuredImage"
  | "image"
  | "contentBlocks"
  | "ogImage"
  | "gallery"
  | "videos"
  | "category"
  | "author"
  | "publishedDate"
  | "createdAt"
  | "readTime"
  | "views"
  | "likes"
  | "shareCount"
>;

/** The slice of an article kept in the browser's reading list — enough to render a card. */
export type SavedStory = Pick<
  News,
  "_id" | "slug" | "title" | "excerpt" | "description" | "featuredImage" | "publishedDate" | "createdAt" | "readTime" | "author" | "category"
>;

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

export const newsHref = (news: Pick<News, "slug">) => `/news/${encodeURIComponent(news.slug)}`;

export const categoryHref = (category?: Pick<Category, "slug"> | null) =>
  category?.slug ? `/category/${encodeURIComponent(category.slug)}` : "/latest";

export const tagHref = (tag: Pick<Tag, "slug">) => `/tag/${encodeURIComponent(tag.slug)}`;

export const authorHref = (name: string) => `/author/${encodeURIComponent(name)}`;

export const searchHref = (q: string) => `/search?q=${encodeURIComponent(q)}`;

/* ------------------------------------------------------------------ */
/* Populated-or-id helpers                                             */
/* ------------------------------------------------------------------ */

export const isPopulated = <T extends { _id: string }>(value: T | string | null | undefined): value is T =>
  Boolean(value) && typeof value === "object";

export const categoryOf = (news: Pick<News, "category">): Category | null =>
  isPopulated(news.category) ? news.category : null;

export const subCategoryOf = (news: Pick<News, "subCategory">): Category | null =>
  isPopulated(news.subCategory) ? news.subCategory : null;

export const tagsOf = (news: Pick<News, "tags">): Tag[] => (news.tags || []).filter(isPopulated);

export const idOf = (value: { _id: string } | string | null | undefined): string =>
  !value ? "" : typeof value === "string" ? value : value._id;

/* ------------------------------------------------------------------ */
/* Presentation                                                        */
/* ------------------------------------------------------------------ */

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/** Single pass, so "&amp;lt;" decodes to "&lt;" rather than "<". */
const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1] === "x" || entity[1] === "X" ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });

export const stripHtml = (html = "") =>
  decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

export const truncate = (text: string, max: number) => {
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
};

export const excerptOf = (news: Pick<News, "excerpt" | "description" | "subtitle">, max = 160) =>
  truncate(stripHtml(news.excerpt || news.description || news.subtitle || ""), max);

export const authorName = (news: Pick<News, "author">) => news.author?.name?.trim() || site.desk;

export const newsDate = (news: Pick<News, "publishedDate" | "createdAt">) =>
  news.publishedDate || news.createdAt || null;

/**
 * Lead image, in order of preference: featuredImage, the legacy `image` field,
 * the social image, the gallery, then the first image block in a legacy body.
 */
export const imageOf = (
  news: Pick<News, "featuredImage" | "image" | "ogImage" | "gallery" | "contentBlocks">,
): ImageAsset | undefined => {
  const asset = [news.featuredImage, news.image, news.ogImage, ...(news.gallery || [])].find((img) => img?.url);
  return asset ?? blockImagesOf(news)[0];
};

/**
 * Trims a list item to what cards need before it crosses to a client
 * component: the body is dropped (only its image blocks survive, for photo
 * walls), the lead image is resolved and the read time is estimated.
 */
export const toCard = (news: News): CardNews => {
  const bodyImages = blockImagesOf(news).map(({ url, redirectUrl }): ContentBlock =>
    Object.assign({ type: "image" as const, value: url }, redirectUrl ? { redirectUrl } : {}),
  );
  const lead = news.featuredImage?.url || news.image?.url ? news.image : imageOf(news);

  return {
    _id: news._id,
    slug: news.slug,
    title: news.title,
    subtitle: news.subtitle,
    excerpt: news.excerpt,
    description: news.description,
    featuredImage: news.featuredImage,
    image: lead,
    contentBlocks: bodyImages.length ? bodyImages : undefined,
    gallery: news.gallery?.length ? news.gallery : undefined,
    videos: news.videos?.length ? news.videos : undefined,
    category: news.category,
    author: news.author?.name ? { name: news.author.name } : undefined,
    publishedDate: news.publishedDate,
    createdAt: news.createdAt,
    readTime: readTimeOf(news),
    views: news.views,
    likes: news.likes,
    shareCount: news.shareCount,
  };
};

export const toCardPage = (page: Paginated<News>): Paginated<CardNews> => ({ ...page, data: page.data.map(toCard) });

export const toSavedStory = (news: News): SavedStory => {
  const category = categoryOf(news);
  const lead = imageOf(news);
  return {
    _id: news._id,
    slug: news.slug,
    title: news.title,
    excerpt: news.excerpt,
    description: (news.description || "").slice(0, 300),
    featuredImage: lead?.url ? { url: lead.url, alt: lead.alt } : undefined,
    publishedDate: news.publishedDate,
    createdAt: news.createdAt,
    readTime: readTimeOf(news),
    author: news.author?.name ? { name: news.author.name } : undefined,
    category,
  };
};

/** A field the typed ContentBlock does not declare (legacy blocks carry `heading`, `redirectUrl`). */
export const blockField = (block: ContentBlock, key: string): unknown => (block as unknown as Record<string, unknown>)[key];

/** Image assets embedded in a legacy block body, in order. */
export const blockImagesOf = (news: Pick<News, "contentBlocks">): ImageAsset[] =>
  (news.contentBlocks || []).flatMap((block) => {
    if (block.type !== "image") return [];
    const value = block.value;
    const url = typeof value === "string" ? value : (value as { url?: unknown } | null)?.url;
    if (typeof url !== "string" || !url) return [];
    const redirectUrl = blockField(block, "redirectUrl");
    return [{ url, redirectUrl: typeof redirectUrl === "string" && redirectUrl ? redirectUrl : undefined }];
  });

const WORDS_PER_MINUTE = 200;

const countWords = (text: string) => (text.match(/\S+/g) || []).length;

/** Stored read time, or an estimate from the body when the API has none (legacy articles store 0). */
export const readTimeOf = (
  news: Pick<News, "readTime"> & Partial<Pick<News, "content" | "contentBlocks" | "description">>,
): number => {
  if (news.readTime && news.readTime > 0) return news.readTime;

  let words = countWords(stripHtml(news.content || ""));
  if (!words) {
    words = (news.contentBlocks || []).reduce((sum, block) => {
      const heading = blockField(block, "heading");
      const text = block.type === "text" && typeof block.value === "string" ? block.value : "";
      return sum + countWords(stripHtml(text)) + (typeof heading === "string" ? countWords(heading) : 0);
    }, 0);
  }
  if (!words) words = countWords(stripHtml(news.description || ""));

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
};

/** Replaces a bare category id with the matching category, so chips can show a name and link. */
export const withCategory = <T extends Pick<News, "category">>(news: T, categories: Category[]): T => {
  if (typeof news.category !== "string") return news;
  const id = news.category;
  const category = categories.find((c) => c._id === id);
  return category ? { ...news, category } : news;
};

export const hasVideo = (news: Pick<News, "videos">) => Boolean(news.videos?.some((v) => v?.url));

/** Trending score: views + likes×4 + shares×6. */
export const heatOf = (news: Pick<News, "views" | "likes" | "shareCount">) =>
  (news.views || 0) + (news.likes || 0) * 4 + (news.shareCount || 0) * 6;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TC";

export const flagsOf = (news: News) =>
  [
    news.breakingNews && "Breaking",
    news.featured && "Featured",
    news.editorsPick && "Editors' pick",
    news.trending && "Trending",
  ].filter(Boolean) as string[];

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** Grid never has more columns than items, so there are no orphan cells. */
export function columnsFor(count: number, wide = false): string {
  if (wide && count >= 6) return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6";
  if (count >= 4) return "grid-cols-2 lg:grid-cols-4";
  if (count === 3) return "grid-cols-2 sm:grid-cols-3";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  return "grid-cols-1";
}

/** Trim a list to whole rows of the largest column count that fits. */
export function trimToRows<T>(items: T[], sizes = [6, 4, 2]): T[] {
  for (const size of sizes) {
    if (items.length >= size) return items.slice(0, items.length - (items.length % size));
  }
  return items;
}

/**
 * A pool that hands out each story at most once, so homepage bands never
 * repeat a headline.
 */
export class StoryPool {
  private used = new Set<string>();

  constructor(private readonly fallback: News[] = []) {}

  claim(preferred: (News | null | undefined)[], size: number, backfill = true): News[] {
    const out: News[] = [];
    const take = (item?: News | null) => {
      if (!item?._id || out.length >= size || this.used.has(item._id)) return;
      this.used.add(item._id);
      out.push(item);
    };
    preferred.forEach(take);
    if (backfill) this.fallback.forEach(take);
    return out;
  }

  markUsed(items: (News | null | undefined)[]) {
    items.forEach((item) => item?._id && this.used.add(item._id));
  }

  /** Returns claimed stories that ended up not rendering, so later bands can use them. */
  release(items: News[]) {
    items.forEach((item) => this.used.delete(item._id));
  }
}
