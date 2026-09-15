import Link from "next/link";
import type { Category } from "@/types/api";
import { Rail } from "@/components/site/headers";
import { categoryHref } from "@/lib/news";
import type { PublishingPace as Pace } from "./server";

export function PublishingPace({ pace }: { pace: Pace }) {
  const rows: { label: string; value: number | null }[] = [
    { label: "Published today", value: pace.today },
    { label: "This week", value: pace.week },
    { label: "This month", value: pace.month },
    { label: "Total published", value: pace.total },
  ];

  return (
    <Rail title="Publishing pace">
      <dl className="divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-[13.5px] text-ink-soft">{row.label}</dt>
            <dd className="headline text-[18px] tabular-nums">{row.value === null ? "—" : row.value.toLocaleString("en-US")}</dd>
          </div>
        ))}
      </dl>
    </Rail>
  );
}

export function TopicIndex({ topics }: { topics: Category[] }) {
  if (topics.length === 0) return null;

  return (
    <Rail title="Jump to a topic" action={{ label: "All topics", href: "/categories" }}>
      {topics.map((topic) => (
        <Link
          key={topic._id}
          href={categoryHref(topic)}
          className="group flex items-baseline justify-between gap-3 py-2.5 text-[13.5px]"
        >
          <span className="clamp-1 text-ink-soft transition-colors group-hover:text-accent">{topic.name}</span>
          <span className="meta shrink-0 tabular-nums">{topic.articleCount ?? 0}</span>
        </Link>
      ))}
    </Rail>
  );
}
