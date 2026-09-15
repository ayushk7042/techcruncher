import type { Metadata } from "next";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/headers";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${site.name} newsroom — tips, corrections, partnerships and general questions.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Get in touch" title="Contact" description="Tips, corrections, partnerships or a simple hello — it all reaches a person." />
      <div className="container grid gap-14 py-14 lg:grid-cols-12 lg:gap-20">
        <section className="lg:col-span-7">
          <h2 className="eyebrow rule-strong mb-8 pt-2 text-ink">Send a message</h2>
          <ContactForm />
        </section>
        <aside className="lg:col-span-5">
          <h2 className="eyebrow rule-strong pt-2 text-ink">Desks</h2>
          <dl className="divide-y divide-line">
            {site.desks.map((desk) => (
              <div key={desk.email} className="py-5">
                <dt className="headline text-[19px]">{desk.label}</dt>
                <dd className="mt-1.5">
                  <a
                    href={`mailto:${desk.email}`}
                    className="text-[14px] font-medium text-ink underline decoration-accent decoration-[1.5px] underline-offset-[3px] transition-colors hover:text-accent"
                  >
                    {desk.email}
                  </a>
                  <p className="mt-1 text-[13px] text-ink-mute">{desk.note}</p>
                </dd>
              </div>
            ))}
            <div className="py-5">
              <dt className="headline text-[19px]">Newsroom</dt>
              <dd className="mt-1.5 text-[13px] text-ink-mute">Remote-first, publishing worldwide.</dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
