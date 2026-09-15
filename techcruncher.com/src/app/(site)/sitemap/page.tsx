import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/headers";
import { sections } from "@/config/site";
import { getCategories } from "@/lib/api/server-data";
import { categoryHref } from "@/lib/news";

export const metadata: Metadata = { title: "Sitemap" };

const linkClass = "block py-3 text-[14px] text-ink-soft transition-colors hover:text-accent";

const company = [
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
];

export default async function SitemapPage() {
  const categories = await getCategories();

  const lists = [
    { title: "Reading", links: [...sections, { label: "Search", href: "/search" }, { label: "Reading list", href: "/bookmarks" }] },
    { title: "Topics", links: [{ label: "All topics", href: "/categories" }, ...categories.map((c) => ({ label: c.name, href: categoryHref(c) }))] },
    { title: "Company", links: company },
  ];

  return (
    <>
      <PageHeader eyebrow="Index" title="Sitemap" />
      <div className="container grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-16">
        {lists.map((list) => (
          <section key={list.title}>
            <h2 className="eyebrow rule-strong pt-2 text-ink">{list.title}</h2>
            <ul className="divide-y divide-line">
              {list.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
