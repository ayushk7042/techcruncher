import type { NewsListParams } from "@/types/api";

/** Query parameters shared by each page's server render and its client refetches. */

export const LATEST_PARAMS: NewsListParams = { sort: "latest", limit: 20 };
export const TRENDING_PARAMS: NewsListParams = { sort: "trending", limit: 40 };
/** Videos and photographs are gathered from the most recent stories. */
export const MEDIA_PARAMS: NewsListParams = { sort: "latest", limit: 100 };

export type Period = "" | "month" | "week";

export const PERIODS: { label: string; value: Period }[] = [
  { label: "All time", value: "" },
  { label: "This month", value: "month" },
  { label: "This week", value: "week" },
];

export const toPeriod = (value: string): Period => (value === "month" || value === "week" ? value : "");

/** yyyy-mm-dd, `days` before today (UTC, matching how the API parses the date). */
export function daysAgoInput(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export function popularParams(period: Period): NewsListParams {
  const params: NewsListParams = { sort: "popular", limit: 30 };
  if (period === "month") params.dateFrom = daysAgoInput(30);
  if (period === "week") params.dateFrom = daysAgoInput(7);
  return params;
}
