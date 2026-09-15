import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { ArticleFeed } from "@/components/site/article-feed";
import { PageHeader } from "@/components/site/headers";
import { ListSkeleton } from "@/components/ui/skeleton";
import type { News, Paginated, Tag } from "@/types/api";
import { ApiError } from "@/lib/api/client";
import { publicApi } from "@/lib/api/public";
import { stripHtml } from "@/lib/news";

type Params = { slug: string };

const loadTag = cache(async (slug: string): Promise<Tag | null> => {
  try {
    const tag = await publicApi.tag(slug, { revalidate: 300 });
    return tag.status === "inactive" ? null : tag;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const tag = await loadTag(slug);
  if (!tag) return { title: "Tag not found" };
  return {
    title: tag.seoTitle || tag.name,
    description: tag.seoDescription || stripHtml(tag.description || "") || `Everything we have published about ${tag.name}.`,
  };
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const tag = await loadTag(slug);
  if (!tag) notFound();

  // The list endpoint matches tags by id; names would be treated as a regex.
  const filter = { tag: tag._id };
  let initial: Paginated<News> | undefined;
  try {
    initial = await publicApi.listNews({ ...filter, limit: 16, sort: "latest" }, { revalidate: 60 });
  } catch {
    initial = undefined;
  }

  return (
    <>
      <PageHeader
        eyebrow="Tag"
        title={tag.name}
        description={stripHtml(tag.description || "") || `Everything we have published about ${tag.name}.`}
        crumbs={[{ label: "Tags" }, { label: tag.name }]}
      />
      <div className="container py-9">
        <Suspense fallback={<ListSkeleton count={8} />}>
          <ArticleFeed params={filter} initial={initial} />
        </Suspense>
      </div>
    </>
  );
}
