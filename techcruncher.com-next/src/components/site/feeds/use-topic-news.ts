"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { News, NewsListParams, Paginated } from "@/types/api";
import { useUrlState } from "@/hooks/use-url-state";
import { publicApi } from "@/lib/api/public";
import { popularParams, toPeriod } from "./params";

/**
 * Lists stories for the topic a FilterBar wrote to `?topic=`. The server page
 * only covers the unfiltered view, so `initial` is ignored once a topic is set.
 */
export function useTopicNews(params: NewsListParams, initial?: Paginated<News>) {
  const topic = useUrlState().get("topic");
  const query: NewsListParams = topic ? { ...params, category: topic } : params;

  return useQuery({
    queryKey: ["news-list", query],
    queryFn: ({ signal }) => publicApi.listNews(query, { signal }),
    initialData: topic ? undefined : initial,
    placeholderData: keepPreviousData,
  });
}

/** Most-read list for the `?period=` toggle; shared by the header summary and the board. */
export function usePopularNews(initial?: Paginated<News>) {
  const period = toPeriod(useUrlState().get("period"));
  return { period, ...useTopicNews(popularParams(period), period ? undefined : initial) };
}
