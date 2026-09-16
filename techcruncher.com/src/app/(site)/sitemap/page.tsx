import { ArrowUpRight, FileCode2, Rss } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/headers";
import { sections as navSections, site } from "@/config/site";
import type { Category } from "@/types/api";
import { getCategories } from "@/lib/api/server-data";
import { categoryHref } from "@/lib/news";

export const metadata: Metadata = {
  title: "Sitemap",
  description: `Every page on ${site.name}, in one place.`,
};

const company = [
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
];

const reading = [
  ...navSections,
  { label: "Search", href: "/search" },
  { label: "Reading list", href: "/bookmarks" },
  { label: "All topics", href: "/categories" },
];

/** A block of links with a rule on top, matching the section headers elsewhere. */
function LinkBlock({ title, note, links }: { title: string; note?: string; links: { label: string; href: string }[] }) {
  return (
    <section>
      <div className="rule-strong flex items-baseline justify-between gap-3 pt-2.5">
        <h2 className="eyebrow text-ink">{title}</h2>
        {note && <span className="meta tabular-nums">{note}</span>}
      </div>
      <ul className="mt-1 divide-y divide-line">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group flex items-center justify-between gap-3 py-2.5 text-[14px] text-ink-soft transition-colors hover:text-accent"
            >
              {link.label}
              <ArrowUpRight
                className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** One section with its story count and, where it has them, its sub-topics. */
function TopicRow({ category, subTopics }: { category: Category; subTopics: Category[] }) {
  return (
    <div className="border-b border-line py-4">
      <Link href={categoryHref(category)} className="group flex items-baseline justify-between gap-3">
        <span className="headline clamp-1 min-w-0 text-[18px] transition-colors group-hover:text-accent">{category.name}</span>
        <span className="meta shrink-0 tabular-nums">{category.articleCount ?? 0}</span>
      </Link>
      {subTopics.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {subTopics.map((child) => (
            <Link key={child._id} href={categoryHref(child)} className="filter-pill">
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function SitemapPage() {
  const categories = await getCategories();
  const parentOf = (category: Category) => (typeof category.parent === "string" ? category.parent : null);
  const topics = categories.filter((category) => !parentOf(category));
  const childrenOf = (category: Category) => categories.filter((item) => parentOf(item) === category._id);
  const stories = topics.reduce((sum, topic) => sum + (topic.articleCount ?? 0), 0);

  return (
    <>
      <PageHeader
        eyebrow="Index"
        title="Sitemap"
        description={`Every page on ${site.name}: ${topics.length} sections, ${categories.length} topics in all, ${stories} stories.`}
      />

      <div className="container grid gap-10 py-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="rule-strong flex items-baseline justify-between gap-3 pt-2.5">
            <h2 className="eyebrow text-ink">Topics</h2>
            <span className="meta tabular-nums">{categories.length} in total</span>
          </div>
          <div className="mt-1 sm:columns-2 sm:gap-x-10">
            {topics.map((category) => (
              <div key={category._id} className="break-inside-avoid">
                <TopicRow category={category} subTopics={childrenOf(category)} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-10 lg:col-span-5">
          <LinkBlock title="Reading" note={`${reading.length} pages`} links={reading} />
          <LinkBlock title="Company" note={`${company.length} pages`} links={company} />

          <section>
            <div className="rule-strong pt-2.5">
              <h2 className="eyebrow text-ink">For machines</h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/sitemap.xml" className="inline-flex items-center gap-2 border border-line px-3 py-2 text-[13px] text-ink-soft transition-colors hover:border-ink hover:text-ink">
                <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" /> sitemap.xml
              </a>
              <a href="/robots.txt" className="inline-flex items-center gap-2 border border-line px-3 py-2 text-[13px] text-ink-soft transition-colors hover:border-ink hover:text-ink">
                <Rss className="h-3.5 w-3.5" aria-hidden="true" /> robots.txt
              </a>
            </div>
            <p className="adm-hint mt-2 text-ink-mute">The machine-readable index search engines read.</p>
          </section>
        </div>
      </div>
    </>
  );
}
