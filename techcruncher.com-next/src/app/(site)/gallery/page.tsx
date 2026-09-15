import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/site/headers";
import { GalleryWall, GalleryWallSkeleton } from "@/components/site/feeds/gallery-wall";
import { MEDIA_PARAMS } from "@/components/site/feeds/params";
import { loadNews, topicOptions } from "@/components/site/feeds/server";
import { TopicFilter } from "@/components/site/feeds/topic-filter";
import { getCategories, topicsByVolume } from "@/lib/api/server-data";

const description = "Images from every published story. Open one to read the story behind it.";

export const metadata: Metadata = { title: "Photography", description };

export default async function GalleryPage() {
  const [initial, categories] = await Promise.all([loadNews(MEDIA_PARAMS), getCategories()]);

  return (
    <>
      <PageHeader eyebrow="Picture desk" title="Photography" description={description}>
        <TopicFilter options={topicOptions(topicsByVolume(categories))} allLabel="All photographs" />
      </PageHeader>

      <div className="container py-9">
        <Suspense fallback={<GalleryWallSkeleton />}>
          <GalleryWall initial={initial} />
        </Suspense>
      </div>
    </>
  );
}
