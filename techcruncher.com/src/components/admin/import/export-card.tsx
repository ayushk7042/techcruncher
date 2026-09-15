"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { adminApi, saveResponseAsFile } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { useCategoryOptions } from "../homepage/use-category-options";
import { useToast } from "../toast";
import { Card, SelectField, Spinner, TextField } from "../ui";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
];

/** The API caps an export at 10,000 rows. */
const MAX_ROWS = 10_000;

export function ExportCard() {
  const toast = useToast();
  const categories = useCategoryOptions();
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("5000");
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const rows = Math.min(MAX_ROWS, Math.max(1, Number.parseInt(limit, 10) || 5000));
      const response = await adminApi.exportArticles({ status, category: category || undefined, limit: rows });
      await saveResponseAsFile(response, "articles-export.xlsx");
      toast.success("Export downloaded");
    } catch (error) {
      toast.error(errorMessage(error, "Export failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Export articles">
      <form onSubmit={onSubmit} className="space-y-4">
        <p className="text-[13px] text-ink-soft">Download articles as .xlsx in the import format, newest first.</p>
        <SelectField label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />
        <SelectField
          label="Category"
          placeholder={categories.isPending ? "Loading categories…" : "All categories"}
          options={categories.options}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <TextField
          label="Row limit"
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_ROWS}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          hint={`Up to ${MAX_ROWS.toLocaleString("en-US")} rows.`}
        />
        <button type="submit" className="adm-btn-primary w-full" disabled={busy}>
          {busy ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
          Export .xlsx
        </button>
      </form>
    </Card>
  );
}
