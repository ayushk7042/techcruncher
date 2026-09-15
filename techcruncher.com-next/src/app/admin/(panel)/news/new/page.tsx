import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { NewsForm } from "@/components/admin/news/news-form";
import { AdminPageHeader } from "@/components/admin/ui";

export const metadata: Metadata = { title: "New article" };

export default function NewArticlePage() {
  return (
    <>
      <AdminPageHeader
        title="New article"
        actions={
          <Link href="/admin/news" className="adm-btn">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All articles
          </Link>
        }
      />
      <NewsForm />
    </>
  );
}
