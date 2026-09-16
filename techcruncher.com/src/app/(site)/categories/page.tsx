import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/headers";
import { EmptyState } from "@/components/site/states";
import { SmartImage } from "@/components/ui/smart-image";
import type { Category } from "@/types/api";
import { getCategoriesWithCovers } from "@/lib/api/server-data";
import { categoryHref, stripHtml } from "@/lib/news";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Topics",
  description: "Every section we cover, from the busiest desk to the newest.",
};

const coverOf = (category: Category) => category.coverImage?.url || category.image?.url || category.banner?.url;

/**
 * One topic. Body heights are fixed rather than content-driven, so a topic
 * with a 500-character description and one with none still line up.
 */
function TopicCard({ category, lead = false }: { category: Category; lead?: boolean }) {
  const description = stripHtml(category.description);
  const count = category.articleCount ?? 0;

  return (
    <Link
      href={categoryHref(category)}
      className={cn(
        "group flex h-full flex-col border border-line bg-paper transition-colors hover:border-ink",
        lead && "sm:col-span-2",
      )}
    >
      <div className="relative">
        <SmartImage
          src={coverOf(category)}
          alt=""
          ratio={lead ? "aspect-[21/9]" : "aspect-[16/9]"}
          width={lead ? 1120 : 560}
          imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
        <span className="chip-live absolute left-0 top-0">
          {count} {count === 1 ? "story" : "stories"}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <p className="flex items-start justify-between gap-3">
          <span className={cn("headline clamp-1 min-w-0 transition-colors group-hover:text-accent", lead ? "text-[26px]" : "text-[20px]")}>
            {category.name}
          </span>
          <ArrowUpRight
            className="mt-1 h-4 w-4 shrink-0 text-ink-mute transition-colors group-hover:text-accent"
            aria-hidden="true"
          />
        </p>
        <p className="clamp-2 mt-2 min-h-[2.9em] text-[13.5px] leading-relaxed text-ink-soft">
          {description || `Everything we publish on ${category.name}.`}
        </p>
      </div>
    </Link>
  );
}

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCovers();
  // Sections only — sub-topics live on each section's own page.
  const topics = categories
    .filter((category) => !category.parent)
    .sort((a, b) => (b.articleCount ?? 0) - (a.articleCount ?? 0));

  const [lead, ...rest] = topics;
  const total = topics.reduce((sum, topic) => sum + (topic.articleCount ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Directory"
        title="Topics"
        description={`${topics.length} sections, ${total} stories. Pick a desk and read everything it has filed.`}
      />
      <div className="container py-9">
        {topics.length === 0 ? (
          <EmptyState title="No topics yet" message="Topics appear here once the newsroom creates them." />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TopicCard category={lead} lead />
            {rest.map((category) => (
              <TopicCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
