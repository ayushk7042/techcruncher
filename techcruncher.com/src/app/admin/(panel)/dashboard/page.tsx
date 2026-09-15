import { RecentArticles, ScheduledArticles } from "@/components/admin/dashboard/article-lists";
import { AutoNewsButton } from "@/components/admin/dashboard/auto-news-button";
import { QuickActions } from "@/components/admin/dashboard/quick-actions";
import { StatsGrid } from "@/components/admin/dashboard/stats-grid";
import { AdminPageHeader } from "@/components/admin/ui";

export default function DashboardPage() {
  return (
    <>
      <AdminPageHeader title="Dashboard" description="Output, pipeline and inbox at a glance." actions={<AutoNewsButton />} />
      <StatsGrid />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <RecentArticles className="lg:col-span-2" />
        <div className="space-y-6">
          <QuickActions />
          <ScheduledArticles />
        </div>
      </div>
    </>
  );
}
