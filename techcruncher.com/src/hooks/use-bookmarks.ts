"use client";

import { useCallback } from "react";
import type { SavedStory } from "@/lib/news";
import { useLocalList } from "./use-local-list";

const KEY = "tc-bookmarks";

export type { SavedStory };

export function useBookmarks() {
  const [items, update] = useLocalList<SavedStory>(KEY);

  const isSaved = useCallback((slug: string) => items.some((item) => item.slug === slug), [items]);

  /** `story` is built on the server with toSavedStory, so the full article never reaches the client. */
  const toggle = useCallback(
    (story: SavedStory) =>
      update((current) =>
        current.some((item) => item.slug === story.slug)
          ? current.filter((item) => item.slug !== story.slug)
          : [story, ...current].slice(0, 200),
      ),
    [update],
  );

  const remove = useCallback((slug: string) => update((current) => current.filter((i) => i.slug !== slug)), [update]);

  return { items, isSaved, toggle, remove };
}
