import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/site/headers";
import { TRENDING_PARAMS } from "@/components/site/feeds/params";
import { loadNews, topicOptions } from "@/components/site/feeds/server";
import { TopicFilter } from "@/components/site/feeds/topic-filter";
import { TrendingBoard } from "@/components/site/feeds/trending-board";
import { ListSkeleton } from "@/components/ui/skeleton";
import { getCategories, topicsByVolume } from "@/lib/api/server-data";

const description = "Ranked by how much readers are viewing, liking and sharing each story.";

export const metadata: Metadata = { title: "Trending", description };

export default async function TrendingPage() {
  const [initial, categories] = await Promise.all([loadNews(TRENDING_PARAMS), getCategories()]);

  return (
    <>
      <PageHeader eyebrow="Right now" title="Trending" description={description}>
        <TopicFilter options={topicOptions(topicsByVolume(categories))} allLabel="Everything" />
      </PageHeader>

      <div className="container py-9">
        <Suspense fallback={<ListSkeleton count={4} />}>
          <TrendingBoard initial={initial} />
        </Suspense>
      </div>
    </>
  );
}
