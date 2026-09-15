import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { News } from "@/types/api";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/cn";
import { videoEmbed } from "@/lib/image";
import { authorHref, initials, isPopulated, newsHref, searchHref, tagsOf } from "@/lib/news";
import { AppendedSection } from "../headers";

/* Everything appended below the body: deals, media, CTA, links, topics, sources, author. */

export function Deals({ news }: { news: News }) {
  const deals = (news.affiliateLinks || []).filter((deal) => deal.link);
  if (!deals.length) return null;

  return (
    <AppendedSection title="Mentioned in this story">
      <div className="divide-y divide-line border-y border-line">
        {deals.map((deal, index) => (
          <a
            key={`${deal.link}-${index}`}
            href={deal.link}
            target="_blank"
            rel="noopener noreferrer sponsored nofollow"
            className="group flex items-center gap-4 py-4"
          >
            {deal.productImage && (
              <div className="h-14 w-14 shrink-0">
                <SmartImage src={deal.productImage} ratio="aspect-square" width={56} fit="contain" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="headline clamp-2 text-[16px] transition-colors group-hover:text-accent">{deal.title || deal.link}</p>
              {deal.price && <p className="meta mt-1.5">{deal.price}</p>}
            </div>
            <span className="link-muted inline-flex shrink-0 items-center gap-1">
              {deal.buttonText || "Get deal"} <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
    </AppendedSection>
  );
}

export function Videos({ news }: { news: News }) {
  const videos = (news.videos || []).filter((video) => video.url);
  if (!videos.length) return null;

  return (
    <AppendedSection title="Watch">
      <div className="grid gap-8 sm:grid-cols-2">
        {videos.map((video, index) => {
          const embed = videoEmbed(video.url);
          return (
            <figure key={`${video.url}-${index}`}>
              <div className="aspect-video w-full bg-black">
                {embed.kind === "iframe" ? (
                  <iframe
                    src={embed.src}
                    title={video.title || news.title}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : (
                  <video src={embed.src} poster={video.thumbnail?.url} controls preload="metadata" className="h-full w-full" />
                )}
              </div>
              <figcaption className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {video.title && <span className="font-medium text-ink">{video.title}. </span>}
                {video.caption}{" "}
                <a href={video.redirectUrl || video.url} target="_blank" rel="noopener noreferrer" className="link-muted">
                  Watch on {video.provider || embed.provider}
                </a>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </AppendedSection>
  );
}

export function Gallery({ news }: { news: News }) {
  const images = (news.gallery || []).filter((image) => image.url);
  if (!images.length) return null;

  return (
    <AppendedSection title="Gallery" note={`${images.length} photographs`}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((image, index) => {
          const tile = <SmartImage src={image.url} alt={image.alt || image.caption || ""} ratio="aspect-square" width={320} />;
          return (
            <figure key={`${image.url}-${index}`}>
              {image.redirectUrl ? (
                <a
                  href={image.redirectUrl}
                  target={image.openInNewTab === false ? undefined : "_blank"}
                  rel={cn("noopener noreferrer", image.nofollow !== false && "nofollow")}
                >
                  {tile}
                </a>
              ) : (
                tile
              )}
              {(image.caption || image.credit) && (
                <figcaption className="meta mt-2 leading-relaxed">
                  {image.caption}
                  {image.credit && <span className="text-ink-mute"> — {image.credit}</span>}
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </AppendedSection>
  );
}

export function CallToAction({ news }: { news: News }) {
  const cta = news.cta;
  const links = [
    news.externalLink && { label: "Visit the source", href: news.externalLink, sponsored: false },
    news.adsLink && { label: "Sponsored link", href: news.adsLink, sponsored: true },
  ].filter(Boolean) as { label: string; href: string; sponsored: boolean }[];

  if (!cta?.url && !links.length) return null;

  return (
    <>
      {cta?.url && (
        <a
          href={cta.url}
          target={cta.openInNewTab === false ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={cn(
            "mt-12 flex h-12 items-center justify-center gap-2 px-6 text-center text-[13px] font-semibold transition-colors",
            cta.style === "primary" || !cta.style
              ? "bg-ink text-canvas hover:bg-accent"
              : "border border-line-strong text-ink hover:border-ink",
          )}
        >
          {cta.label || "Learn more"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel={link.sponsored ? "noopener noreferrer sponsored" : "noopener noreferrer"}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-accent"
            >
              {link.label}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export function FurtherReading({ news }: { news: News }) {
  const links = (news.internalLinks || [])
    .map((link) => (isPopulated(link.news) ? { news: link.news, label: link.anchorText || link.news.title } : null))
    .filter((link): link is { news: News; label: string } => Boolean(link?.news.slug));

  if (!links.length) return null;

  return (
    <AppendedSection title="Further reading">
      <div className="divide-y divide-line border-y border-line">
        {links.map((link) => (
          <Link key={link.news._id} href={newsHref(link.news)} className="group flex items-baseline justify-between gap-4 py-3.5">
            <span className="headline text-[16px] transition-colors group-hover:text-accent">{link.label}</span>
            <ArrowRight className="h-4 w-4 shrink-0 text-ink-mute transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </AppendedSection>
  );
}

export function Topics({ news }: { news: News }) {
  const tags = tagsOf(news);
  const tagNames = new Set(tags.map((t) => t.name.toLowerCase()));
  const keywords = (news.seoKeywords || []).filter((k) => k && !tagNames.has(k.toLowerCase())).slice(0, 6);

  if (!tags.length && !keywords.length) return null;

  return (
    <AppendedSection title="Topics in this story">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <Link key={tag._id} href={`/tag/${tag.slug}`} className="filter-pill">
            {tag.name}
          </Link>
        ))}
        {keywords.map((keyword) => (
          <Link key={keyword} href={searchHref(keyword)} className="filter-pill">
            {keyword}
          </Link>
        ))}
      </div>
    </AppendedSection>
  );
}

export function Sources({ news }: { news: News }) {
  const urls = [...new Set([news.sourceUrl, ...(news.sourceLinks || [])].filter(Boolean) as string[])];
  if (!news.sourceName && !urls.length) return null;

  return (
    <AppendedSection title="Sources & attribution">
      {news.sourceName && (
        <p className="text-[14px] text-ink-soft">
          Originally reported by <strong className="font-semibold text-ink">{news.sourceName}</strong>.
        </p>
      )}
      {urls.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {urls.map((url) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="meta break-all underline decoration-line-strong underline-offset-2 hover:text-accent"
              >
                {url}
              </a>
            </li>
          ))}
        </ul>
      )}
    </AppendedSection>
  );
}

export function WrittenBy({ news }: { news: News }) {
  const author = news.author;
  if (!author?.name) return null;

  const socials = Object.entries(author.social || {}).filter(([, href]) => href) as [string, string][];

  return (
    <AppendedSection title="Written by">
      <div className="flex gap-4">
        {author.image?.url ? (
          <img src={author.image.url} alt="" className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink font-mono text-[15px] text-canvas">
            {initials(author.name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="headline text-[22px]">{author.name}</p>
          {author.designation && <p className="eyebrow mt-1.5">{author.designation}</p>}
          {author.bio && <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-soft">{author.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12.5px] font-medium">
            <Link href={authorHref(author.name)} className="text-ink transition-colors hover:text-accent">
              More from this author
            </Link>
            {author.email && (
              <a href={`mailto:${author.email}`} className="text-ink transition-colors hover:text-accent">
                Email
              </a>
            )}
            {socials.map(([network, href]) => (
              <a key={network} href={href} target="_blank" rel="noopener noreferrer" className="capitalize text-ink-mute transition-colors hover:text-accent">
                {network}
              </a>
            ))}
          </div>
        </div>
      </div>
    </AppendedSection>
  );
}

export function PrevNext({ previous, next }: { previous?: News; next?: News }) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="More stories" className="mt-10 grid gap-px border-y border-line sm:grid-cols-2">
      {previous ? (
        <Link href={newsHref(previous)} className="group py-5 sm:pr-8">
          <span className="eyebrow">Previous story</span>
          <span className="headline clamp-2 mt-2 block text-[17px] transition-colors group-hover:text-accent">{previous.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={newsHref(next)} className="group py-5 text-right sm:border-l sm:border-line sm:pl-8">
          <span className="eyebrow">Next story</span>
          <span className="headline clamp-2 mt-2 block text-[17px] transition-colors group-hover:text-accent">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}
