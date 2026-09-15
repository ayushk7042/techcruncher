import type { Metadata } from "next";
import { Suspense } from "react";
import { NewsList } from "@/components/admin/news/news-list";
import { LoadingBlock } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Articles" };

export default function NewsListPage() {
  return (
    <Suspense fallback={<LoadingBlock label="Loading articles…" />}>
      <NewsList />
    </Suspense>
  );
}
