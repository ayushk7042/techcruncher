import type { ImageAsset, News, Video } from "@/types/api";
import { videoThumb } from "@/lib/image";
import { imageOf } from "@/lib/news";

export interface VideoClip {
  key: string;
  video: Video;
  story: News;
}

export interface Photo {
  url: string;
  image: ImageAsset;
  story: News;
}

export const collectClips = (stories: News[]): VideoClip[] =>
  stories.flatMap((story) =>
    (story.videos ?? [])
      .filter((video) => video?.url)
      .map((video, index) => ({ key: `${story._id}:${index}`, video, story })),
  );

export const posterOf = ({ video, story }: VideoClip): string | undefined =>
  video.thumbnail?.url || videoThumb(video.url) || imageOf(story)?.url;

/** Featured image and gallery images of every story, each URL shown once. */
export function collectPhotos(stories: News[]): Photo[] {
  const seen = new Set<string>();
  const photos: Photo[] = [];

  for (const story of stories) {
    for (const image of [story.featuredImage, ...(story.gallery ?? [])]) {
      const url = image?.url;
      if (!image || !url || seen.has(url)) continue;
      seen.add(url);
      photos.push({ url, image, story });
    }
  }
  return photos;
}
