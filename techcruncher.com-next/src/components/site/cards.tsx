import { Play } from "lucide-react";
import Link from "next/link";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/cn";
import { formatDuration, videoThumb } from "@/lib/image";
import { categoryOf, excerptOf, imageOf, newsHref, type CardNews } from "@/lib/news";
import { pad2 } from "@/lib/format";
import { ArticleMeta } from "./article-meta";
import { CategoryChip } from "./category-chip";

export type { CardNews };

/* ------------------------------------------------------------------ */
/* ArticleCard — default grid unit                                     */
/* ------------------------------------------------------------------ */

interface ArticleCardProps {
  news: CardNews;
  size?: "default" | "lead";
  showExcerpt?: boolean;
  priority?: boolean;
  wideImage?: boolean;
  className?: string;
}

export function ArticleCard({
  news,
  size = "default",
  showExcerpt = true,
  priority = false,
  wideImage = false,
  className,
}: ArticleCardProps) {
  const lead = size === "lead";
  const image = imageOf(news);
  const href = newsHref(news);

  return (
    <article className={cn("group flex h-full flex-col", lead && "col-span-2", className)}>
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <SmartImage
          src={image?.url}
          alt={image?.alt || news.title}
          ratio={lead || wideImage ? "aspect-[16/9]" : "aspect-[4/3]"}
          width={lead ? 960 : 720}
          priority={priority}
          imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className="rule-card mt-3 flex flex-1 flex-col pt-2.5">
        <CategoryChip category={categoryOf(news)} className="w-fit" />
        <h3 className={cn("headline mt-2", lead ? "text-[28px]" : "text-[19px]")}>
          <Link href={href} className="clamp-3 transition-colors group-hover:text-accent">
            {news.title}
          </Link>
        </h3>
        {showExcerpt && (
          <p
            className={cn(
              "clamp-2 mt-2 leading-relaxed text-ink-soft",
              lead ? "max-w-2xl text-[15px]" : "text-[13.5px]",
            )}
          >
            {excerptOf(news, lead ? 180 : 120)}
          </p>
        )}
        <ArticleMeta news={news} showAuthor className="mt-3" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleTileCard — dense grids                                       */
/* ------------------------------------------------------------------ */

export function ArticleTileCard({
  news,
  compact = false,
  badge,
  showExcerpt = false,
}: {
  news: CardNews;
  compact?: boolean;
  badge?: string;
  showExcerpt?: boolean;
}) {
  const image = imageOf(news);
  const href = newsHref(news);

  return (
    <article className="group flex h-full flex-col">
      <Link href={href} className="relative block" tabIndex={-1} aria-hidden="true">
        <SmartImage
          src={image?.url}
          alt={image?.alt || news.title}
          width={800}
          imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
        {badge && <span className="chip-live pointer-events-none absolute left-0 top-0">{badge}</span>}
      </Link>
      <div className="rule-card mt-2.5 flex flex-1 flex-col pt-2.5">
        <CategoryChip category={categoryOf(news)} className="w-fit" />
        <h3 className={cn("headline mt-2", compact ? "text-[15.5px]" : "text-[17px]")}>
          <Link href={href} className="clamp-3 transition-colors group-hover:text-accent">
            {news.title}
          </Link>
        </h3>
        {showExcerpt && (
          <p className="clamp-2 mt-2 text-[13px] leading-relaxed text-ink-soft">{excerptOf(news, 120)}</p>
        )}
        <ArticleMeta news={news} compact className="mt-auto pt-2.5" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleListRow — sidebars                                           */
/* ------------------------------------------------------------------ */

export function ArticleListRow({ news, dense = false }: { news: CardNews; dense?: boolean }) {
  const image = imageOf(news);

  return (
    <article className={cn("group relative flex items-start gap-3", dense ? "py-2.5" : "py-3.5")}>
      <div className="w-[72px] shrink-0">
        <SmartImage
          src={image?.url}
          alt=""
          ratio="aspect-square"
          width={72}
          imgClassName="transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <CategoryChip category={categoryOf(news)} linked={false} />
        <h3 className="headline mt-1.5 text-[15px]">
          <Link href={newsHref(news)} className="clamp-2 transition-colors group-hover:text-accent">
            <span className="absolute inset-0" aria-hidden="true" />
            {news.title}
          </Link>
        </h3>
        <ArticleMeta news={news} compact className="mt-1.5" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleRankRow — leaderboards                                       */
/* ------------------------------------------------------------------ */

export function ArticleRankRow({ news, rank, dense = false }: { news: CardNews; rank: number; dense?: boolean }) {
  return (
    <article className={cn("group relative flex items-baseline gap-3.5", dense ? "py-3" : "py-3.5")}>
      <span className="w-6 shrink-0 select-none font-mono text-[15px] font-medium leading-none tabular-nums text-accent">
        {pad2(rank)}
      </span>
      <div className="min-w-0 flex-1">
        <CategoryChip category={categoryOf(news)} linked={false} />
        <h3 className="headline mt-1.5 text-[15px]">
          <Link href={newsHref(news)} className="clamp-2 transition-colors group-hover:text-accent">
            <span className="absolute inset-0" aria-hidden="true" />
            {news.title}
          </Link>
        </h3>
        <ArticleMeta news={news} showViews compact className="mt-1.5" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleWideRow — long single-column lists                           */
/* ------------------------------------------------------------------ */

export function ArticleWideRow({ news, dense = false, priority = false }: { news: CardNews; dense?: boolean; priority?: boolean }) {
  const image = imageOf(news);

  return (
    <article className={cn("group relative flex flex-col gap-4 sm:flex-row sm:items-start", dense ? "py-4" : "py-5")}>
      <div className={cn("shrink-0", dense ? "sm:w-[152px]" : "sm:w-[200px]")}>
        <SmartImage
          src={image?.url}
          alt=""
          width={dense ? 152 : 200}
          priority={priority}
          imgClassName="transition-transform duration-[600ms] ease-out group-hover:scale-[1.03]"
        />
      </div>
      <div className="min-w-0 flex-1">
        <CategoryChip category={categoryOf(news)} linked={false} />
        <h3 className={cn("headline mt-1.5", dense ? "text-[19px]" : "text-[22px]")}>
          <Link href={newsHref(news)} className="clamp-2 transition-colors group-hover:text-accent">
            <span className="absolute inset-0" aria-hidden="true" />
            {news.title}
          </Link>
        </h3>
        <p className="clamp-2 mt-2 text-[13.5px] leading-relaxed text-ink-soft">{excerptOf(news, dense ? 125 : 170)}</p>
        <ArticleMeta news={news} showAuthor showViews className="mt-2.5" />
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* ArticleVideoCard                                                    */
/* ------------------------------------------------------------------ */

export function ArticleVideoCard({ news }: { news: CardNews }) {
  const video = news.videos?.find((v) => v?.url);
  const poster = video?.thumbnail?.url || (video ? videoThumb(video.url) : undefined) || imageOf(news)?.url;
  const href = newsHref(news);

  return (
    <article className="group flex h-full flex-col">
      <Link href={href} className="relative block" tabIndex={-1} aria-hidden="true">
        <SmartImage src={poster} alt="" ratio="aspect-video" width={640} />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-10 w-10 items-center justify-center bg-accent text-white transition-transform duration-300 group-hover:scale-105">
            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden="true" />
          </span>
        </span>
        {video?.duration ? (
          <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 text-[11px] tabular-nums text-white">
            {formatDuration(video.duration)}
          </span>
        ) : null}
      </Link>
      <div className="rule-card mt-2.5 flex flex-1 flex-col pt-2.5">
        <CategoryChip category={categoryOf(news)} className="w-fit" />
        <h3 className="headline mt-2 text-[16px]">
          <Link href={href} className="clamp-2 transition-colors group-hover:text-accent">
            {video?.title || news.title}
          </Link>
        </h3>
        <ArticleMeta news={news} compact className="mt-auto pt-2.5" />
      </div>
    </article>
  );
}
