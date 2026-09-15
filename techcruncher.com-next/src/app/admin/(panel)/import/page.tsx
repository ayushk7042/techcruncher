import { ExportCard } from "@/components/admin/import/export-card";
import { ImportHistory } from "@/components/admin/import/import-history";
import { ImportWizard } from "@/components/admin/import/import-wizard";
import { AdminPageHeader } from "@/components/admin/ui";

export default function ImportPage() {
  return (
    <>
      <AdminPageHeader
        title="Import / export"
        description="Bulk create or update articles from a spreadsheet, roll back a batch, or export articles to .xlsx."
      />
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <ImportWizard />
        </div>
        <ExportCard />
      </div>
      <div className="mt-10">
        <ImportHistory />
      </div>
    </>
  );
}
