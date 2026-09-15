import type { Metadata } from "next";
import { Suspense } from "react";
import { ArticleFeed } from "@/components/site/article-feed";
import { PageHeader } from "@/components/site/headers";
import { ListSkeleton } from "@/components/ui/skeleton";
import { site } from "@/config/site";
import type { News, Paginated } from "@/types/api";
import { publicApi } from "@/lib/api/public";
import { initials } from "@/lib/news";

type Params = { name: string };

/** The API matches author.name as a regex, so the name is escaped first. */
const toAuthorFilter = (name: string) => `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const name = decodeURIComponent((await params).name);
  return { title: name, description: `Every story filed by ${name} for ${site.name}.` };
}

export default async function AuthorPage({ params }: { params: Promise<Params> }) {
  const name = decodeURIComponent((await params).name);
  const filter = { author: toAuthorFilter(name) };

  let initial: Paginated<News> | undefined;
  try {
    initial = await publicApi.listNews({ ...filter, limit: 16, sort: "latest" }, { revalidate: 120 });
  } catch {
    initial = undefined;
  }

  return (
    <>
      <PageHeader
        eyebrow="Author"
        title={name}
        description={`Every story filed by ${name} for ${site.name}.`}
        crumbs={[{ label: "Authors" }, { label: name }]}
      >
        <span className="mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-[16px] font-semibold text-canvas">
          {initials(name)}
        </span>
      </PageHeader>
      <div className="container py-9">
        <Suspense fallback={<ListSkeleton count={8} />}>
          <ArticleFeed params={filter} initial={initial} emptyMessage={`${name} has not published any stories yet.`} />
        </Suspense>
      </div>
    </>
  );
}
