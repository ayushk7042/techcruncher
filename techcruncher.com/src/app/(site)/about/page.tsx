import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/headers";
import { NewsletterCard } from "@/components/site/newsletter-card";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `About ${site.name}`,
  description: site.description,
};

const numbers = [
  { label: "Published", value: "Seven days a week" },
  { label: "Coverage", value: "News / Reviews / Guides" },
  { label: "Newsletter", value: `${site.newsletterReaders} subscribers` },
  { label: "Corrections", value: "Marked in public, on the story" },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="Our story" title={`About ${site.name}`} description={site.description} />
      <div className="container grid gap-14 py-14 lg:grid-cols-12 lg:gap-20">
        <div className="article-body lg:col-span-8">
          <p>
            {site.name} is an independent newsroom covering the technology, business and culture shaping what comes next. We
            write for curious readers who want to understand a story, not just skim it.
          </p>
          <h2>What we publish</h2>
          <p>
            Daily reporting on the companies, products and people moving the industry; hands-on reviews; practical guides; and
            longer analysis when a story deserves the room.
          </p>
          <h2>How we work</h2>
          <p>
            We cite our sources and link to them. Sponsored placements are always labelled and never influence coverage. When we
            get something wrong, we correct it on the story and say what changed.
          </p>
          <h2>Get in touch</h2>
          <p>
            Tips, corrections and partnership enquiries are welcome — <Link href="/contact">contact the newsroom</Link>.
          </p>
        </div>
        <aside className="space-y-10 lg:col-span-4">
          <section>
            <h2 className="eyebrow rule-strong pt-2 text-ink">By the numbers</h2>
            <dl className="divide-y divide-line">
              {numbers.map((item) => (
                <div key={item.label} className="py-4">
                  <dt className="eyebrow">{item.label}</dt>
                  <dd className="headline mt-1.5 text-[18px]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <NewsletterCard variant="plain" layout="compact" source="about" />
        </aside>
      </div>
    </>
  );
}
