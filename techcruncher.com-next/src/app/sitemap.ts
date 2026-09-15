import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import type { News } from "@/types/api";
import { publicApi } from "@/lib/api/public";
import { getCategories } from "@/lib/api/server-data";
import { categoryHref, newsHref } from "@/lib/news";

export const revalidate = 3600;

const STATIC_ROUTES = ["", "/latest", "/trending", "/popular", "/videos", "/gallery", "/categories", "/about", "/contact", "/newsletter", "/privacy", "/terms"];

const MAX_PAGES = 20; // 2,000 most recent stories

async function recentStories(): Promise<News[]> {
  const stories: News[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    try {
      const { data, pagination } = await publicApi.listNews({ page, limit: 100, sort: "latest" }, { revalidate: 3600 });
      stories.push(...data);
      if (!pagination.hasMore) break;
    } catch {
      break;
    }
  }
  return stories;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, stories] = await Promise.all([getCategories(), recentStories()]);

  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${site.url}${path}`, changeFrequency: "daily" as const, priority: path ? 0.6 : 1 })),
    ...categories.map((category) => ({
      url: `${site.url}${categoryHref(category)}`,
      lastModified: category.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...stories
      .filter((story) => !(story.robots || "").includes("noindex"))
      .map((story) => ({
        url: `${site.url}${newsHref(story)}`,
        lastModified: story.updatedDate || story.updatedAt || story.publishedDate || undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
