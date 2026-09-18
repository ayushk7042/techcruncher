import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense, cache } from "react";
import { AdSlot } from "@/components/site/ad-slot";
import { ArticleFeed } from "@/components/site/article-feed";
import { FilterBar } from "@/components/site/filter-bar";
import { PageHeader } from "@/components/site/headers";
import { ListSkeleton } from "@/components/ui/skeleton";
import { site } from "@/config/site";
import type { Category, News, Paginated } from "@/types/api";
import { ApiError } from "@/lib/api/client";
import { publicApi } from "@/lib/api/public";
import { categoryHref, stripHtml } from "@/lib/news";

type Params = { slug: string };

const PAGE_SIZE = 16;

const loadCategory = cache(async (slug: string): Promise<Category | null> => {
  try {
    const category = await publicApi.category(slug, { revalidate: 300 });
    return category.status === "inactive" || category.hidden ? null : category;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) return { title: "Topic not found" };

  const description =
    category.metaDescription || category.seoDescription || stripHtml(category.description || "") || `Everything we publish about ${category.name}.`;

  return {
    title: category.metaTitle || category.seoTitle || category.name,
    description,
    alternates: { canonical: category.canonicalUrl || `${site.url}${categoryHref(category)}` },
    robots: category.robots?.includes("noindex") ? { index: false } : undefined,
    openGraph: { title: category.name, description, images: category.ogImage?.url ? [category.ogImage.url] : undefined },
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const category = await loadCategory(slug);
  if (!category) notFound();
  if (category.redirectUrl) redirect(category.redirectUrl);

  let initial: Paginated<News> | undefined;
  try {
    initial = await publicApi.listNews({ category: category.slug, page: 1, limit: PAGE_SIZE, sort: "latest" }, { revalidate: 60 });
  } catch {
    initial = undefined;
  }

  const children = (category.children || []).filter((child) => !child.hidden);
  const description = stripHtml(category.description || "") || `Everything we publish about ${category.name}.`;

  return (
    <>
      <PageHeader eyebrow="Topic" title={category.name} description={description} crumbs={[{ label: "Topics", href: "/categories" }, { label: category.name }]}>
        <p className="eyebrow mt-5">{category.articleCount ?? initial?.pagination.total ?? 0} stories published</p>
        {children.length > 0 && (
          <Suspense>
            <FilterBar
              className="mt-6"
              param="sub"
              allLabel={`All ${category.name}`}
              options={children.map((child) => ({ label: child.shortLabel || child.name, value: child.slug }))}
            />
          </Suspense>
        )}
      </PageHeader>

      <div className="container py-9">
        {/* Same treatment as the homepage strip: a little wider than the copy beneath it. */}
        <AdSlot position="category-top" fixed className="-mx-2 mb-12 w-auto sm:-mx-4 lg:-mx-8" category={category._id} />
        <Suspense fallback={<ListSkeleton count={8} />}>
          <ArticleFeed
            params={{ category: category.slug }}
            initial={initial}
            pageSize={PAGE_SIZE}
            topicParam="sub"
            topicField="subCategory"
            emptyMessage={`No stories published in ${category.name} yet.`}
          />
        </Suspense>
      </div>
    </>
  );
}
