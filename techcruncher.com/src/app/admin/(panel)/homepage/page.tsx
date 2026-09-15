import { HomepageManager } from "@/components/admin/homepage/homepage-manager";
import { AdminPageHeader } from "@/components/admin/ui";

export default function HomepagePage() {
  return (
    <>
      <AdminPageHeader
        title="Homepage"
        description="Curate the lead stories, rails, category sections and gallery on the public homepage. Changes go live when you save."
      />
      <HomepageManager />
    </>
  );
}
