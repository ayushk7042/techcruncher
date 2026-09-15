import type { Metadata } from "next";
import { Suspense } from "react";
import { AdSlot } from "@/components/site/ad-slot";
import { PageHeader } from "@/components/site/headers";
import { NewsletterCard } from "@/components/site/newsletter-card";
import { LatestFeed, LatestFeedSkeleton } from "@/components/site/feeds/latest-feed";
import { PublishingPace, TopicIndex } from "@/components/site/feeds/latest-rail";
import { LATEST_PARAMS } from "@/components/site/feeds/params";
import { loadNews, loadPublishingPace, topicOptions } from "@/components/site/feeds/server";
import { TopicFilter } from "@/components/site/feeds/topic-filter";
import { getCategories, topicsByVolume } from "@/lib/api/server-data";

const description = "Everything our editors publish, newest first — filed by the day it ran.";

export const metadata: Metadata = { title: "Latest", description };

export default async function LatestPage() {
  const [initial, categories, pace] = await Promise.all([loadNews(LATEST_PARAMS), getCategories(), loadPublishingPace()]);
  const topics = topicsByVolume(categories);

  return (
    <>
      <PageHeader eyebrow="The feed" title="Latest" description={description}>
        <TopicFilter options={topicOptions(topics, true)} allLabel="All topics" />
      </PageHeader>

      <div className="container py-9">
        <div className="grid gap-9 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-8">
            <Suspense fallback={<LatestFeedSkeleton />}>
              <LatestFeed initial={initial} />
            </Suspense>
          </div>
          <aside className="min-w-0 lg:col-span-4">
            <div className="space-y-9 lg:sticky lg:top-28">
              <PublishingPace pace={pace} />
              <TopicIndex topics={topics.slice(0, 8)} />
              <NewsletterCard layout="compact" source="latest" />
              <AdSlot position="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
