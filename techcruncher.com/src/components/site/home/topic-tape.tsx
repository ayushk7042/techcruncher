import Link from "next/link";
import type { Category } from "@/types/api";
import { categoryHref } from "@/lib/news";

export function TopicTape({ categories }: { categories: Category[] }) {
  if (categories.length < 3) return null;

  const renderList = (copy: boolean) =>
    categories.map((category) => (
      <li key={`${copy ? "b" : "a"}-${category._id}`} className="flex items-center">
        <span aria-hidden="true" className="px-4 font-mono text-[13px] text-accent">
          /
        </span>
        <Link
          href={categoryHref(category)}
          tabIndex={copy ? -1 : undefined}
          className="headline whitespace-nowrap text-[17px] uppercase text-canvas/75 transition-colors hover:text-canvas"
        >
          {category.name}
        </Link>
      </li>
    ));

  return (
    <section aria-label="Sections we cover" className="group overflow-hidden bg-ink text-canvas">
      <div className="flex items-stretch">
        <p className="eyebrow relative z-10 flex shrink-0 items-center bg-accent px-4 text-white">Now covering</p>
        <div className="flex w-max animate-marquee items-center py-3 group-hover:[animation-play-state:paused]">
          <ul className="flex items-center">{renderList(false)}</ul>
          <ul className="flex items-center" aria-hidden="true">
            {renderList(true)}
          </ul>
        </div>
      </div>
    </section>
  );
}
