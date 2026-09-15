import Link from "next/link";
import type { Category, News } from "@/types/api";
import { CategoryChip } from "@/components/site/category-chip";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/cn";
import { compactNumber, pad2, readTimeLabel } from "@/lib/format";
import { categoryHref, categoryOf, imageOf, newsHref } from "@/lib/news";

/* ------------------------------------------------------------------ */
/* Meta line                                                           */
/* ------------------------------------------------------------------ */

/** Slash-separated mono meta; the slash travels with the part before it. */
export function MetaLine({ parts, className }: { parts: (string | false | null | undefined)[]; className?: string }) {
  const visible = parts.filter((part): part is string => Boolean(part));

  return (
    <div className={cn("meta flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {visible.map((part, index) => (
        <span key={`${index}-${part}`} className="flex items-center gap-x-2 whitespace-nowrap">
          {part}
          {index < visible.length - 1 && (
            <span aria-hidden="true" className="text-line-strong">
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bars                                                                */
/* ------------------------------------------------------------------ */

/** Width of a bar relative to the leader, never thinner than 6%. */
export const barWidth = (value: number, top: number) => (top > 0 ? Math.max(6, Math.round((value / top) * 100)) : 6);

export function Bar({ percent, className }: { percent: number; className?: string }) {
  return (
    <div className={cn("h-px bg-line", className)} aria-hidden="true">
      <div className="h-px bg-accent" style={{ width: `${percent}%` }} />
    </div>
  );
}

export interface TopicTotal {
  category: Category;
  value: number;
}

export function totalsByTopic(stories: News[], valueOf: (news: News) => number): TopicTotal[] {
  const totals = new Map<string, TopicTotal>();
  for (const news of stories) {
    const category = categoryOf(news);
    if (!category) continue;
    const entry = totals.get(category._id) ?? { category, value: 0 };
    entry.value += valueOf(news);
    totals.set(category._id, entry);
  }
  return [...totals.values()].filter((entry) => entry.value > 0).sort((a, b) => b.value - a.value);
}

/** Rail rows: rank, topic, value and a hairline bar. */
export function TopicBars({ totals, unit }: { totals: TopicTotal[]; unit: string }) {
  const top = totals[0]?.value ?? 0;

  return totals.map(({ category, value }, index) => (
    <div key={category._id} className="py-3">
      <div className="flex items-baseline gap-3">
        <span className="w-6 shrink-0 font-mono text-[13px] font-medium tabular-nums text-accent">{pad2(index + 1)}</span>
        <Link
          href={categoryHref(category)}
          className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink transition-colors hover:text-accent"
        >
          {category.shortLabel || category.name}
        </Link>
        <span className="meta shrink-0 tabular-nums">
          {compactNumber(value)} {unit}
        </span>
      </div>
      <Bar percent={barWidth(value, top)} className="ml-9 mt-2" />
    </div>
  ));
}

/* ------------------------------------------------------------------ */
/* Podium                                                              */
/* ------------------------------------------------------------------ */

const podiumColumns: Record<number, string> = { 1: "", 2: "md:grid-cols-2", 3: "md:grid-cols-3" };

interface PodiumProps {
  stories: News[];
  /** Figure shown beside the rank numeral. */
  stat: (news: News) => React.ReactNode;
}

export function Podium({ stories, stat }: PodiumProps) {
  const podium = stories.slice(0, 3);

  return (
    <ol className={cn("grid gap-x-6 gap-y-9", podiumColumns[podium.length])}>
      {podium.map((news, index) => {
        const image = imageOf(news);
        const href = newsHref(news);
        return (
          <li key={news._id} className="group flex flex-col">
            <div className="mb-4 flex items-baseline gap-3 border-b border-ink pb-2">
              <span className="font-mono text-[26px] font-medium tabular-nums text-accent">{pad2(index + 1)}</span>
              {stat(news)}
            </div>
            <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
              <SmartImage
                src={image?.url}
                alt=""
                width={440}
                priority={index === 0}
                imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
              />
            </Link>
            <CategoryChip category={categoryOf(news)} className="mt-3.5 w-fit" />
            <h2 className="headline mt-2 text-[19px]">
              <Link href={href} className="clamp-3 transition-colors group-hover:text-accent">
                {news.title}
              </Link>
            </h2>
            <MetaLine
              parts={[(news.views || 0) > 0 && `${compactNumber(news.views)} reads`, readTimeLabel(news.readTime)]}
              className="mt-3"
            />
          </li>
        );
      })}
    </ol>
  );
}
