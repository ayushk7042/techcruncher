import type { Metadata } from "next";
import { TagManager } from "@/components/admin/tags/tag-manager";

export const metadata: Metadata = { title: "Tags" };

export default function TagsPage() {
  return <TagManager />;
}
