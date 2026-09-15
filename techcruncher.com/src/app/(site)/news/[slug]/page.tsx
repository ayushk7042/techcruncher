import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AdSlot, ScriptCreative } from "@/components/site/ad-slot";
import { ArticleReader } from "@/components/site/article/article-reader";
import {
  CallToAction,
  Deals,
  FurtherReading,
  Gallery,
  PrevNext,
  Sources,
  Topics,
  Videos,
  WrittenBy,
} from "@/components/site/article/article-extras";
import { ReadingProgress } from "@/components/site/article/reading-progress";
import { ShareBar } from "@/components/site/article/share-bar";
import { TableOfContents } from "@/components/site/article/table-of-contents";
import { ArticleCard, ArticleListRow, ArticleRankRow } from "@/components/site/cards";
import { Breadcrumbs, Rail } from "@/components/site/headers";
import { NewsletterCard } from "@/components/site/newsletter-card";
import { SmartImage } from "@/components/ui/smart-image";
import { site } from "@/config/site";
import type { News } from "@/types/api";
import { ApiError } from "@/lib/api/client";
import { publicApi } from "@/lib/api/public";
import { getPopular } from "@/lib/api/server-data";
import { renderArticleHtml } from "@/lib/article-html";
import { cn } from "@/lib/cn";
import { compactNumber, formatDate, formatDateTime, readTimeLabel } from "@/lib/format";
import {
  authorName,
  categoryHref,
  categoryOf,
  excerptOf,
  flagsOf,
  imageOf,
  initials,
  isPopulated,
  newsDate,
  newsHref,
  subCategoryOf,
  toSavedStory,
} from "@/lib/news";

type Params = { slug: string };

/** One API call per request, shared by generateMetadata and the page; it counts a view. */
const loadArticle = cache(async (slug: string): Promise<News | null> => {
  try {
    return await publicApi.newsBySlug(slug, { cache: "no-store" });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

async function settle<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const news = await loadArticle(slug);
  if (!news) return { title: "Story not found" };

  const url = news.canonicalUrl || `${site.url}${newsHref(news)}`;
  const description = news.metaDescription || news.seoDescription || excerptOf(news, 160);
  const ogImage = news.ogImage?.url || imageOf(news)?.url;
  const robots = (news.robots || "index, follow").toLowerCase();

  return {
    title: news.metaTitle || news.seoTitle || news.title,
    description,
    keywords: news.seoKeywords?.length ? news.seoKeywords : news.focusKeyword ? [news.focusKeyword] : undefined,
    alternates: { canonical: url },
    robots: { index: !robots.includes("noindex"), follow: !robots.includes("nofollow") },
    authors: news.author?.name ? [{ name: news.author.name }] : undefined,
    openGraph: {
      type: "article",
      url,
      title: news.metaTitle || news.title,
      description,
      images: ogImage ? [{ url: ogImage, alt: news.ogImage?.alt || news.title }] : undefined,
      publishedTime: newsDate(news) || undefined,
      modifiedTime: news.updatedDate || news.updatedAt || undefined,
      section: categoryOf(news)?.name,
      tags: news.tagNames,
    },
    twitter: {
      card: "summary_large_image",
      title: news.metaTitle || news.title,
      description,
      images: news.twitterImage?.url || ogImage ? [news.twitterImage?.url || ogImage!] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const news = await loadArticle(slug);
  if (!news) notFound();

  const category = categoryOf(news);
  const subCategory = subCategoryOf(news);
  const url = `${site.url}${newsHref(news)}`;
  const image = imageOf(news);
  const date = newsDate(news);
  const leadRedirect = image?.redirectUrl || news.imageRedirectUrl;
  const leadImage = image?.url ? (
    <SmartImage src={image.url} alt={image.alt || news.title} ratio="aspect-[16/9] lg:aspect-[2/1]" width={1600} priority />
  ) : null;
  const { html, toc } = renderArticleHtml(news);

  const [related, popular, categoryStories] = await Promise.all([
    settle(publicApi.relatedNews(news.slug, 8, { revalidate: 300 }), [] as News[]),
    getPopular(),
    category
      ? settle(
          publicApi.listNews({ category: category.slug, sort: "latest", limit: 50 }, { revalidate: 300 }).then((r) => r.data),
          [] as News[],
        )
      : Promise.resolve([] as News[]),
  ]);

  // Neighbours in the category feed: "previous" is older, "next" is newer.
  const position = categoryStories.findIndex((item) => item._id === news._id);
  const previous = position >= 0 ? categoryStories[position + 1] : undefined;
  const next = position > 0 ? categoryStories[position - 1] : undefined;
  const moreInCategory = categoryStories.filter((item) => item._id !== news._id).slice(0, 5);

  const editorsRelated = (news.relatedNews || []).filter(isPopulated).filter((item) => item.slug).slice(0, 4);
  const alsoLike = related.slice(0, 4);
  const standfirst = news.subtitle || news.shortDescription || excerptOf(news, 240);
  const flags = flagsOf(news);
  const place = [news.destination, news.region, news.country].filter(Boolean);
  const updated = news.updatedDate && date && new Date(news.updatedDate).getTime() - new Date(date).getTime() > 3_600_000;

  const stats = [
    { value: news.views, label: "reads" },
    { value: news.likes, label: "likes" },
    { value: news.shareCount, label: "shares" },
  ].filter((stat) => (stat.value || 0) > 0);

  const jsonLd = news.schemaMarkup || {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: news.title,
    description: excerptOf(news, 200),
    image: image?.url ? [image.url] : undefined,
    datePublished: date || undefined,
    dateModified: news.updatedDate || news.updatedAt || undefined,
    author: { "@type": "Person", name: authorName(news) },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: url,
    articleSection: category?.name,
    keywords: news.tagNames?.join(", "),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ReadingProgress />

      <div className="container py-7 sm:py-8">
        <AdSlot position="article-top" className="mb-8" category={category?._id} />

        <header>
          <Breadcrumbs
            items={[
              ...(category ? [{ label: category.name, href: categoryHref(category) }] : []),
              ...(subCategory ? [{ label: subCategory.name, href: categoryHref(subCategory) }] : []),
              { label: news.title },
            ]}
          />

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={categoryHref(category)} className="eyebrow-accent">
              {category?.name || "News"}
            </Link>
            {flags.length > 0 && (
              <>
                <span aria-hidden="true" className="h-3 w-px bg-line" />
                <span className="eyebrow">{flags.join(" / ")}</span>
              </>
            )}
          </div>

          <h1 className="headline mt-4 max-w-5xl text-[34px] sm:text-[46px] lg:text-[56px]">{news.title}</h1>
          {standfirst && <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-ink-soft">{standfirst}</p>}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-y border-line py-3">
            <div className="flex items-center gap-3">
              {news.author?.image?.url ? (
                <img src={news.author.image.url} alt="" className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-mono text-[11px] font-medium text-canvas">
                  {initials(authorName(news))}
                </span>
              )}
              <div>
                <p className="text-[13px] font-medium text-ink">
                  {authorName(news)}
                  {news.author?.designation && <span className="ml-2 font-normal text-ink-mute">{news.author.designation}</span>}
                </p>
                <p className="meta mt-1.5">
                  {date && <time dateTime={new Date(date).toISOString()}>{formatDateTime(date)}</time>}
                  <span className="text-line-strong"> / </span>
                  {readTimeLabel(news.readTime)}
                  {updated && (
                    <>
                      <span className="text-line-strong"> / </span>Updated {formatDate(news.updatedDate)}
                    </>
                  )}
                </p>
              </div>
            </div>
            {stats.length > 0 && (
              <dl className="meta flex gap-x-5">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-baseline gap-1.5">
                    <dd className="font-medium tabular-nums text-ink-soft">{compactNumber(stat.value)}</dd>
                    <dt>{stat.label}</dt>
                  </div>
                ))}
              </dl>
            )}
          </div>
          {place.length > 0 && <p className="meta mt-3">{place.join(" / ")}</p>}
        </header>

        {image?.url && (
          <figure className="mt-8">
            {leadRedirect ? (
              <a
                href={leadRedirect}
                target={image.openInNewTab === false ? undefined : "_blank"}
                rel={cn("noopener noreferrer", image.nofollow !== false && "nofollow")}
                className="block cursor-pointer transition-opacity hover:opacity-95"
              >
                {leadImage}
              </a>
            ) : (
              leadImage
            )}
            {(image.caption || image.credit) && (
              <figcaption className="meta mt-2 flex flex-wrap items-baseline justify-between gap-3 leading-relaxed">
                <span>{image.caption}</span>
                {image.credit && <span>Photograph: {image.credit}</span>}
              </figcaption>
            )}
          </figure>
        )}

        <div className="mt-9 grid gap-9 lg:grid-cols-12 lg:gap-10">
          <article className="min-w-0 lg:col-span-8">
            <ShareBar story={toSavedStory(news)} likes={news.likes} url={url} />
            <ArticleReader html={html} toc={toc} />

            {news.advertisement?.enabled !== false && news.advertisement?.code && (
              <div className="my-10">
                <ScriptCreative code={news.advertisement.code} />
              </div>
            )}
            <AdSlot position="article-inline" ratio="aspect-[970/180]" className="my-10" category={category?._id} />

            <Deals news={news} />
            <Videos news={news} />
            <Gallery news={news} />
            <CallToAction news={news} />
            <FurtherReading news={news} />
            <Topics news={news} />
            <Sources news={news} />
            <WrittenBy news={news} />
            <PrevNext previous={previous} next={next} />

            <AdSlot position="article-bottom" className="mt-10" category={category?._id} />
          </article>

          <aside className="min-w-0 lg:col-span-4">
            <div className="space-y-9 lg:sticky lg:top-28">
              <TableOfContents items={toc} />
              <AdSlot position="article-sidebar-top" category={category?._id} />
              {editorsRelated.length > 0 && (
                <Rail title="Editors' related picks">
                  {editorsRelated.map((item) => (
                    <ArticleListRow key={item._id} news={item} dense />
                  ))}
                </Rail>
              )}
              {popular.length > 0 && (
                <Rail title="Most read" action={{ label: "Leaderboard", href: "/popular" }}>
                  {popular.map((item, index) => (
                    <ArticleRankRow key={item._id} news={item} rank={index + 1} dense />
                  ))}
                </Rail>
              )}
              <AdSlot position="article-sidebar-middle" category={category?._id} />
              <NewsletterCard variant="plain" layout="compact" source="article" />
              <AdSlot position="sidebar-sticky" ratio="aspect-[300/600]" className="hidden lg:block" />
              {category && moreInCategory.length > 0 && (
                <Rail title={`More in ${category.name}`} action={{ label: "View all", href: categoryHref(category) }}>
                  {moreInCategory.map((item) => (
                    <ArticleListRow key={item._id} news={item} dense />
                  ))}
                </Rail>
              )}
              <AdSlot position="article-sidebar-bottom" category={category?._id} />
            </div>
          </aside>
        </div>

        {alsoLike.length > 0 && (
          <section className="mt-14">
            <div className="rule-strong pt-2.5">
              <h2 className="headline text-[24px] sm:text-[28px]">You might also like</h2>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4">
              {alsoLike.map((item) => (
                <ArticleCard key={item._id} news={item} showExcerpt={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
