import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/headers";
import { EmptyState } from "@/components/site/states";
import { SmartImage } from "@/components/ui/smart-image";
import { getCategories } from "@/lib/api/server-data";
import { categoryHref, stripHtml } from "@/lib/news";

export const metadata: Metadata = {
  title: "Topics",
  description: "Pick a subject and read everything we have published on it.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader eyebrow="Directory" title="Topics" description="Pick a subject and read everything we have published on it." />
      <div className="container py-9">
        {categories.length === 0 ? (
          <EmptyState title="No topics yet" message="Topics appear here once the newsroom creates them." />
        ) : (
          <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category._id} href={categoryHref(category)} className="group flex gap-5 border-b border-line py-6 transition-colors hover:border-ink">
                {category.image?.url && (
                  <div className="w-[76px] shrink-0">
                    <SmartImage src={category.image.url} alt="" ratio="aspect-square" width={76} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-start justify-between gap-3">
                    <span className="headline clamp-1 text-[20px] transition-colors group-hover:text-accent">{category.name}</span>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-mute opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </p>
                  {category.description && (
                    <p className="clamp-2 mt-2 text-[13.5px] leading-relaxed text-ink-soft">{stripHtml(category.description)}</p>
                  )}
                  <p className="eyebrow mt-3">{category.articleCount ?? 0} stories</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
