import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Category } from "@/types/api";
import { categoryHref, stripHtml } from "@/lib/news";
import { SectionHeader } from "../headers";

/** "Browse by topic" — a typographic index, deliberately without images. */
export function CategoryGrid({ categories, index }: { categories: Category[]; index: number }) {
  if (!categories.length) return null;

  return (
    <section>
      <SectionHeader index={index} kicker="The index" title="Browse by topic" action={{ label: "All topics", href: "/categories" }} />
      <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category._id}
            href={categoryHref(category)}
            className="group flex items-baseline justify-between gap-4 border-b border-line py-3 transition-colors hover:border-ink"
          >
            <span className="min-w-0">
              <span className="headline clamp-1 block text-[19px] transition-colors group-hover:text-accent">{category.name}</span>
              {category.description && (
                <span className="clamp-1 mt-1 block text-[12px] text-ink-mute">{stripHtml(category.description)}</span>
              )}
            </span>
            <span className="meta flex shrink-0 items-baseline gap-2 tabular-nums">
              {category.articleCount ?? 0}
              <ArrowUpRight className="h-3.5 w-3.5 self-center opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
