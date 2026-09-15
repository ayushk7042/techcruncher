import type { Metadata } from "next";
import { AdManager } from "@/components/admin/ads/ad-manager";

export const metadata: Metadata = { title: "Advertising" };

export default function AdsPage() {
  return <AdManager />;
}
