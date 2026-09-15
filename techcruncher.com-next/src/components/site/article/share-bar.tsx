"use client";

import { Bookmark, BookmarkCheck, Check, Heart, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { SocialIcon } from "@/components/ui/social-icon";
import { useBookmarks, type SavedStory } from "@/hooks/use-bookmarks";
import { useHydrated } from "@/hooks/use-hydrated";
import { useLocalList } from "@/hooks/use-local-list";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";
import { compactNumber } from "@/lib/format";

const iconButton =
  "inline-flex h-9 w-9 items-center justify-center text-ink-mute transition-colors hover:bg-raise hover:text-ink";
const toggleBase = "inline-flex h-9 items-center gap-2 border px-3.5 text-[13px] font-medium transition-colors";
const toggleIdle = "border-line text-ink-soft hover:border-ink hover:text-ink";

interface ShareBarProps {
  /** Reading-list snapshot; also supplies the slug and title. */
  story: SavedStory;
  likes?: number;
  url: string;
}

export function ShareBar({ story: news, likes: initialLikes = 0, url }: ShareBarProps) {
  const [liked, updateLiked] = useLocalList<string>("tc-liked");
  const { isSaved, toggle } = useBookmarks();
  const [likes, setLikes] = useState(initialLikes);
  const [copied, setCopied] = useState(false);
  const hydrated = useHydrated();
  const canShare = hydrated && "share" in navigator;

  const isLiked = liked.includes(news.slug);
  const saved = isSaved(news.slug);

  async function toggleLike() {
    const unlike = isLiked;
    updateLiked((list) => (unlike ? list.filter((s) => s !== news.slug) : [...list, news.slug]));
    setLikes((n) => Math.max(0, n + (unlike ? -1 : 1)));
    try {
      const result = await publicApi.likeNews(news.slug, unlike);
      setLikes(result.likes);
    } catch {
      // keep the optimistic state; the counter is not critical
    }
  }

  const track = () => publicApi.shareNews(news.slug).catch(() => {});

  const openShare = (shareUrl: string) => {
    track();
    const left = window.screenX + (window.outerWidth - 640) / 2;
    const top = window.screenY + (window.outerHeight - 520) / 2;
    window.open(shareUrl, "share", `width=640,height=520,left=${left},top=${top},noopener,noreferrer`);
  };

  const encoded = encodeURIComponent(url);
  const title = encodeURIComponent(news.title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      track();
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked; nothing sensible to fall back to
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-2.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={isLiked}
          onClick={toggleLike}
          className={cn(toggleBase, isLiked ? "border-accent text-accent" : toggleIdle)}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} aria-hidden="true" />
          {likes > 0 ? compactNumber(likes) : "Like"}
        </button>
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => toggle(news)}
          className={cn(toggleBase, saved ? "border-ink bg-ink text-canvas" : toggleIdle)}
        >
          {saved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <span className="eyebrow mr-1 hidden sm:inline">Share</span>
        <button
          type="button"
          aria-label="Share on X"
          onClick={() => openShare(`https://twitter.com/intent/tweet?url=${encoded}&text=${title}`)}
          className={iconButton}
        >
          <SocialIcon name="x" />
        </button>
        <button
          type="button"
          aria-label="Share on Facebook"
          onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`)}
          className={iconButton}
        >
          <SocialIcon name="facebook" />
        </button>
        <button
          type="button"
          aria-label="Share on LinkedIn"
          onClick={() => openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`)}
          className={iconButton}
        >
          <SocialIcon name="linkedin" />
        </button>
        <button type="button" aria-label="Copy link" onClick={copyLink} className={iconButton}>
          {copied ? <Check className="h-4 w-4 text-accent" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        </button>
        {canShare && (
          <button
            type="button"
            aria-label="Share"
            onClick={() => navigator.share({ title: news.title, url }).then(track).catch(() => {})}
            className={cn(iconButton, "sm:hidden")}
          >
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
