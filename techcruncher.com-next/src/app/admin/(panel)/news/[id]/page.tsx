import type { Metadata } from "next";
import { NewsEditor } from "@/components/admin/news/news-editor";

export const metadata: Metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NewsEditor id={id} />;
}
