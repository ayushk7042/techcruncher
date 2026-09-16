import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/api";
import { categoryHref } from "@/lib/news";
import { SectionHeader } from "../headers";

/** Three across on desktop, two on tablet: only whole rows are shown. */
const trimToWholeRows = (categories: Category[]) => {
  const capped = categories.slice(0, 12);
  const rows = Math.floor(capped.length / 6) * 6; // 6 divides by both 2 and 3
  return rows >= 6 ? capped.slice(0, rows) : capped.slice(0, capped.length - (capped.length % 2));
};

/**
 * "Browse by topic" — a typographic index. Every row is the same height and
 * carries the same three things (name, count, arrow), so the rules line up
 * across all three columns however long a topic's name or description is.
 */
export function CategoryGrid({ categories, index }: { categories: Category[]; index: number }) {
  const topics = trimToWholeRows(categories);
  if (!topics.length) return null;

  return (
    <section>
      <SectionHeader index={index} kicker="The index" title="Browse by topic" action={{ label: "All topics", href: "/categories" }} />
      <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((category) => (
          <Link
            key={category._id}
            href={categoryHref(category)}
            className="group flex h-[58px] items-center justify-between gap-4 border-b border-line transition-colors hover:border-ink"
          >
            <span className="headline clamp-1 min-w-0 text-[19px] transition-colors group-hover:text-accent">{category.name}</span>
            <span className="meta flex shrink-0 items-center gap-2 tabular-nums">
              {category.articleCount ?? 0}
              <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
