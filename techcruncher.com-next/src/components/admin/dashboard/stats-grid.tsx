"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { ErrorBlock } from "../ui";
import { StatTile } from "./stat-tile";

export function StatsGrid() {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: adminApi.dashboard,
  });

  if (isError) return <ErrorBlock message={errorMessage(error, "Could not load dashboard stats")} onRetry={() => refetch()} />;

  const figure = (value?: number) => (isPending ? "—" : (value ?? 0));

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4" aria-busy={isPending}>
      <StatTile label="Total articles" value={figure(data?.totalNews)} href="/admin/news" />
      <StatTile label="Published" value={figure(data?.publishedNews)} />
      <StatTile label="Drafts" value={figure(data?.draftNews)} />
      <StatTile label="Categories" value={figure(data?.categories)} href="/admin/categories" />
      <StatTile label="AI-generated" value={figure(data?.aiNews)} />
      <StatTile label="Auto-update on" value={figure(data?.autoUpdateNews)} />
      <StatTile label="Avg SEO score" value={figure(data?.avgSeoScore)} suffix="/ 100" />
      <StatTile
        label="New messages"
        value={figure(data?.newContacts)}
        href="/admin/contacts"
        highlight={Boolean(data?.newContacts)}
      />
    </div>
  );
}
