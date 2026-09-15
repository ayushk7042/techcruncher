"use client";

import { X } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useHydrated } from "@/hooks/use-hydrated";
import { ArticleCard } from "./cards";
import { EmptyState } from "./states";
import { ListSkeleton } from "@/components/ui/skeleton";

export function ReadingList() {
  const { items, remove } = useBookmarks();
  // Saved stories live in localStorage, which the server cannot see.
  const hydrated = useHydrated();

  if (!hydrated) return <ListSkeleton count={3} />;

  if (!items.length) {
    return <EmptyState title="Nothing saved yet" message="Press Save on any story and it will appear here." />;
  }

  return (
    <>
      <p className="eyebrow mb-6">{items.length} saved stories</p>
      <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((story) => (
          <div key={story.slug} className="relative">
            <ArticleCard news={story} />
            <button
              type="button"
              onClick={() => remove(story.slug)}
              aria-label={`Remove “${story.title}” from reading list`}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center bg-paper/90 text-ink-soft transition-colors hover:bg-ink hover:text-canvas"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
