import { Check, TriangleAlert, X } from "lucide-react";
import type { ImportJob } from "@/types/api";
import { StatTile } from "../dashboard/stat-tile";
import { TableScroll } from "../ui";
import { IssuesTable } from "./job-report";

/** /import/validate answers with a job-shaped payload (plus `errorRows`). */
export type ValidationResult = ImportJob;

export function ValidationReport({ result }: { result: ValidationResult }) {
  const errorRows = result.errorRows ?? result.skippedCount ?? 0;
  const preview = result.preview ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-5">
        <StatTile label="Rows" value={result.totalRows} />
        <StatTile label="Valid" value={result.validRows ?? 0} />
        <StatTile label="With errors" value={errorRows} highlight={errorRows > 0} />
        <StatTile label="Will create" value={result.willCreate ?? 0} />
        <StatTile label="Will update" value={result.willUpdate ?? 0} />
      </div>

      {result.unknownHeaders?.length ? (
        <div role="note" className="flex gap-3 border border-accent px-4 py-3 text-[13px]">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          <p className="text-ink">
            Ignored columns not in the template:{" "}
            <span className="font-mono text-[12px] text-ink-soft">{result.unknownHeaders.join(", ")}</span>
          </p>
        </div>
      ) : null}

      {preview.length > 0 && (
        <div>
          <p className="adm-label">Preview (first {preview.length} rows)</p>
          <TableScroll>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Action</th>
                  <th>Image</th>
                  <th>Gallery</th>
                  <th>Valid</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr key={row.row}>
                    <td className="meta tabular-nums">{row.row}</td>
                    <td className="min-w-[200px] text-ink">{row.title || "—"}</td>
                    <td className="max-w-[180px] break-all font-mono text-[12px] text-ink-soft">{row.slug || "—"}</td>
                    <td className="whitespace-nowrap text-ink-soft">{row.category || "—"}</td>
                    <td>
                      <span className="adm-badge">{row.status}</span>
                    </td>
                    <td>
                      <span className={row.action === "update" ? "adm-badge border-ink text-ink" : "adm-badge"}>{row.action}</span>
                    </td>
                    <td className="meta">{row.hasImage ? "Yes" : "—"}</td>
                    <td className="meta tabular-nums">{row.galleryCount || "—"}</td>
                    <td>
                      {row.valid ? (
                        <Check className="h-4 w-4 text-ink" aria-label="Valid" />
                      ) : (
                        <X className="h-4 w-4 text-accent" aria-label="Has errors" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </div>
      )}

      {result.issues?.length ? <IssuesTable issues={result.issues} /> : <p className="meta">No validation issues.</p>}
    </div>
  );
}
