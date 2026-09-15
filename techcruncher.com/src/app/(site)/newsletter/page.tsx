import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/site/headers";
import { NewsletterCard } from "@/components/site/newsletter-card";
import { UnsubscribeForm } from "@/components/site/unsubscribe-form";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "The daily brief",
  description: `The ${site.name} daily brief: the stories that matter, in two minutes, every weekday.`,
};

export default function NewsletterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free, every weekday"
        title="The daily brief"
        description="What happened, and what it means — delivered before your first meeting."
      />
      <div className="container grid gap-14 py-14 lg:grid-cols-12 lg:gap-20">
        <div className="lg:col-span-7">
          <NewsletterCard variant="brand" source="newsletter-page" />
          <Suspense>
            <UnsubscribeForm />
          </Suspense>
        </div>
        <div className="article-body lg:col-span-5">
          <h2>What you get</h2>
          <ul>
            <li>The five stories worth your attention, each summarised in a few lines.</li>
            <li>One longer read from our reporters, chosen by the editors.</li>
            <li>Links to the original reporting and sources, always.</li>
            <li>No tracking pixels in the body, no sponsored slots dressed up as news.</li>
          </ul>
          <p>
            One email each weekday morning. Leave any time with one click, or with the form on this page.
          </p>
        </div>
      </div>
    </>
  );
}
