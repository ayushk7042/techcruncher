import Link from "next/link";
import { site } from "@/config/site";
import type { Category, Tag } from "@/types/api";
import { SocialIcon } from "@/components/ui/social-icon";
import { categoryHref, tagHref } from "@/lib/news";
import { NewsletterCard } from "./newsletter-card";

const linkClass = "text-[13px] text-ink-soft transition-colors hover:text-accent";

const editorial = [
  { label: "Latest", href: "/latest" },
  { label: "Trending", href: "/trending" },
  { label: "Most read", href: "/popular" },
  { label: "Photography", href: "/gallery" },
  { label: "Video", href: "/videos" },
  { label: "Reading list", href: "/bookmarks" },
];

const company = [
  { label: "About us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Newsletter", href: "/newsletter" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms of use", href: "/terms" },
  { label: "Sitemap", href: "/sitemap" },
];

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow">{title}</h2>
      {children}
    </div>
  );
}

export function Footer({ categories, tags }: { categories: Category[]; tags: Tag[] }) {
  const footerTopics = categories.filter((c) => c.showInFooter);
  const topics = (footerTopics.length ? footerTopics : categories).slice(0, 6);
  const following = tags.length
    ? tags.slice(0, 10).map((t) => ({ label: t.name, href: tagHref(t) }))
    : categories.slice(0, 10).map((c) => ({ label: c.name, href: categoryHref(c) }));

  return (
    <footer className="mt-16 border-t-2 border-ink">
      <div className="border-b border-line">
        <div className="container grid gap-9 py-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="headline text-[38px] uppercase sm:text-[46px]" style={{ fontStretch: "80%" }}>
              {site.name}
              <span className="text-accent">.</span>
            </p>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-ink-soft">
              Independent reporting on the technology, business and culture shaping what comes next — written plainly,
              sourced openly, corrected in public.
            </p>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {site.socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-8 w-8 items-center justify-center border border-line text-ink-soft transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                >
                  <SocialIcon name={social.icon} />
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-7">
            <NewsletterCard variant="plain" source="footer" />
          </div>
        </div>
      </div>

      <div className="container grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4">
        <Column title="Editorial">
          <ul className="mt-3.5 space-y-2">
            {editorial.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Column>
        <Column title="Topics">
          <ul className="mt-3.5 space-y-2">
            {topics.map((category) => (
              <li key={category._id}>
                <Link href={categoryHref(category)} className={linkClass}>
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </Column>
        <Column title="Company">
          <ul className="mt-3.5 space-y-2">
            {company.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Column>
        <Column title="Following">
          <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-2">
            {following.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </div>
        </Column>
      </div>

      <div className="border-t border-line">
        <div className="container flex flex-col items-center justify-between gap-2 py-5 sm:flex-row">
          <p className="meta">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="meta">Sponsored placements are labelled and never shape our reporting.</p>
        </div>
      </div>
    </footer>
  );
}
