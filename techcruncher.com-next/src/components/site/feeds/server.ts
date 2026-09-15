import "server-only";

import type { Category, News, NewsListParams, Paginated } from "@/types/api";
import type { FilterOption } from "@/components/site/filter-bar";
import { publicApi } from "@/lib/api/public";
import { daysAgoInput } from "./params";

const emptyPage = (limit = 0): Paginated<News> => ({
  success: false,
  data: [],
  pagination: { page: 1, limit, total: 0, pages: 0 },
});

/** First page for a server render; an unreachable API yields an empty page instead of an error. */
export async function loadNews(params: NewsListParams): Promise<Paginated<News>> {
  try {
    return await publicApi.listNews(params, { revalidate: 60 });
  } catch {
    return emptyPage(params.limit);
  }
}

export interface PublishingPace {
  today: number | null;
  week: number | null;
  month: number | null;
  total: number | null;
}

async function countSince(dateFrom?: string): Promise<number | null> {
  try {
    const page = await publicApi.listNews({ dateFrom, limit: 1 }, { revalidate: 60 });
    return page.pagination.total;
  } catch {
    return null;
  }
}

export async function loadPublishingPace(): Promise<PublishingPace> {
  const [today, week, month, total] = await Promise.all([
    countSince(daysAgoInput(0)),
    countSince(daysAgoInput(7)),
    countSince(daysAgoInput(30)),
    countSince(),
  ]);
  return { today, week, month, total };
}

export const topicOptions = (topics: Category[], withCounts = false): FilterOption[] =>
  topics.map((topic) => ({
    label: topic.name,
    value: topic.slug,
    count: withCounts ? topic.articleCount : undefined,
  }));
