"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import Link from "next/link";
import type { News, NewsListParams, Paginated } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { categoryOf } from "@/lib/news";
import { Card, ErrorBlock, LoadingBlock, StatusBadge, TableScroll } from "../ui";

const RECENT: NewsListParams = { sort: "updated", limit: 8 };
const SCHEDULED: NewsListParams = { status: "scheduled", limit: 5 };

const editHref = (news: News) => `/admin/news/${news._id}`;

function useDashboardNews(params: NewsListParams) {
  return useQuery({
    queryKey: ["admin", "news", "dashboard", params],
    queryFn: ({ signal }) => adminApi.listNews(params, signal),
  });
}

function ListBody({
  query,
  empty,
  children,
}: {
  query: UseQueryResult<Paginated<News>>;
  empty: string;
  children: (items: News[]) => React.ReactNode;
}) {
  if (query.isPending) return <LoadingBlock />;
  if (query.isError) {
    return (
      <div className="p-4">
        <ErrorBlock message={errorMessage(query.error, "Could not load articles")} onRetry={() => query.refetch()} />
      </div>
    );
  }
  if (query.data.data.length === 0) return <p className="meta px-4 py-6">{empty}</p>;
  return <>{children(query.data.data)}</>;
}

export function RecentArticles({ className }: { className?: string }) {
  const query = useDashboardNews(RECENT);

  return (
    <Card
      title="Recently updated"
      className={className}
      bodyClassName="p-0"
      actions={
        <Link href="/admin/news" className="link-muted">
          All articles
        </Link>
      }
    >
      <ListBody query={query} empty="No articles yet.">
        {(items) => (
          <TableScroll>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th className="whitespace-nowrap">Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((news) => (
                  <tr key={news._id}>
                    <td className="min-w-[240px]">
                      <Link href={editHref(news)} className="font-medium text-ink hover:text-accent">
                        {news.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap text-ink-soft">{categoryOf(news)?.name || "—"}</td>
                    <td>
                      <StatusBadge status={news.status} />
                    </td>
                    <td className="meta whitespace-nowrap tabular-nums">{formatDateTime(news.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </ListBody>
    </Card>
  );
}

export function ScheduledArticles() {
  const query = useDashboardNews(SCHEDULED);

  return (
    <Card title="Scheduled" bodyClassName="p-0">
      <ListBody query={query} empty="Nothing is scheduled.">
        {(items) => (
          <ul>
            {items.map((news) => (
              <li key={news._id} className="border-b border-line px-4 py-3 last:border-b-0">
                <Link href={editHref(news)} className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink hover:text-accent">
                  {news.title}
                </Link>
                <p className="meta mt-1.5 tabular-nums">
                  {[categoryOf(news)?.name, formatDateTime(news.scheduledAt || news.publishedDate)].filter(Boolean).join(" / ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </ListBody>
    </Card>
  );
}
