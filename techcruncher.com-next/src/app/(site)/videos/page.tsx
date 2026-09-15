import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/site/headers";
import { MEDIA_PARAMS } from "@/components/site/feeds/params";
import { loadNews, topicOptions } from "@/components/site/feeds/server";
import { TopicFilter } from "@/components/site/feeds/topic-filter";
import { VideoDesk, VideoDeskSkeleton } from "@/components/site/feeds/video-desk";
import { getCategories, topicsByVolume } from "@/lib/api/server-data";

const description = "Explainers, reviews and interviews attached to our reporting.";

export const metadata: Metadata = { title: "Video", description };

export default async function VideosPage() {
  const [initial, categories] = await Promise.all([loadNews(MEDIA_PARAMS), getCategories()]);

  return (
    <>
      <PageHeader eyebrow="Watch" title="Video" description={description}>
        <TopicFilter options={topicOptions(topicsByVolume(categories))} allLabel="All video" />
      </PageHeader>

      <div className="container py-9">
        <Suspense fallback={<VideoDeskSkeleton />}>
          <VideoDesk initial={initial} />
        </Suspense>
      </div>
    </>
  );
}
