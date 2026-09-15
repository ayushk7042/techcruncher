import type { News } from "@/types/api";
import { cn } from "@/lib/cn";
import { compactNumber, formatDate, readTimeLabel } from "@/lib/format";
import { authorName, newsDate, readTimeOf } from "@/lib/news";

interface ArticleMetaProps {
  news: Pick<News, "author" | "publishedDate" | "createdAt" | "readTime" | "views"> &
    Partial<Pick<News, "content" | "contentBlocks" | "description">>;
  showAuthor?: boolean;
  showViews?: boolean;
  /** Keep only the first two parts. */
  compact?: boolean;
  tone?: "default" | "light";
  className?: string;
}

/** Author / date / N min read / N reads — slash-separated, no icons. */
export function ArticleMeta({
  news,
  showAuthor = false,
  showViews = false,
  compact = false,
  tone = "default",
  className,
}: ArticleMetaProps) {
  const date = newsDate(news);
  const parts: React.ReactNode[] = [];

  if (showAuthor) parts.push(<span className="font-medium">{authorName(news)}</span>);
  if (date) parts.push(<time dateTime={new Date(date).toISOString()}>{formatDate(date)}</time>);
  parts.push(<span>{readTimeLabel(readTimeOf(news))}</span>);
  if (showViews && (news.views || 0) > 0) parts.push(<span>{compactNumber(news.views)} reads</span>);

  const visible = compact ? parts.slice(0, 2) : parts;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] leading-none",
        tone === "light" ? "text-white/70" : "text-ink-mute",
        className,
      )}
    >
      {visible.map((part, index) => (
        <span key={index} className="flex items-center gap-x-2 whitespace-nowrap">
          {part}
          {index < visible.length - 1 && (
            <span aria-hidden="true" className="text-line-strong">
              /
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
