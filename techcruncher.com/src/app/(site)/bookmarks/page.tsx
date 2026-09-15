import type { Metadata } from "next";
import { PageHeader } from "@/components/site/headers";
import { ReadingList } from "@/components/site/reading-list";

export const metadata: Metadata = { title: "Reading list", robots: { index: false } };

export default function BookmarksPage() {
  return (
    <>
      <PageHeader
        eyebrow="Saved"
        title="Reading list"
        description="Stories you saved, kept privately in this browser and never sent to us."
      />
      <div className="container py-9">
        <ReadingList />
      </div>
    </>
  );
}
