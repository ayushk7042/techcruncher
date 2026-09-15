import type { ImportIssue, ImportJob } from "@/types/api";
import { StatTile } from "../dashboard/stat-tile";
import { TableScroll } from "../ui";

export function IssuesTable({ issues }: { issues: ImportIssue[] }) {
  return (
    <div>
      <p className="adm-label tabular-nums">Issues ({issues.length.toLocaleString("en-US")})</p>
      <div className="max-h-96 overflow-y-auto border-t border-line">
        <TableScroll>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Row</th>
                <th>Field</th>
                <th>Message</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue, index) => (
                <tr key={`${issue.row}-${issue.field}-${index}`}>
                  <td className="meta tabular-nums">{issue.row || "—"}</td>
                  <td className="whitespace-nowrap font-mono text-[12px]">{issue.field}</td>
                  <td className="min-w-[220px] text-ink">{issue.message}</td>
                  <td className="max-w-[240px] break-words text-ink-soft">{issue.value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      </div>
    </div>
  );
}

export function JobReport({ job }: { job: ImportJob }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
        <StatTile label="Created" value={job.createdCount ?? 0} />
        <StatTile label="Updated" value={job.updatedCount ?? 0} />
        <StatTile label="Skipped" value={job.skippedCount ?? 0} />
        <StatTile label="Errors" value={job.errorCount ?? 0} highlight={Boolean(job.errorCount)} />
      </div>
      {job.issues?.length ? <IssuesTable issues={job.issues} /> : <p className="meta">No issues reported.</p>}
    </div>
  );
}
