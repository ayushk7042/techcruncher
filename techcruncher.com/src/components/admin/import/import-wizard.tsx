"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileSpreadsheet, Play, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import type { ImportJob } from "@/types/api";
import { adminApi, saveResponseAsFile } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { formatBytes, pad2 } from "@/lib/format";
import { useAdminAuth } from "../auth-provider";
import { TextTabs } from "../controls";
import { useToast } from "../toast";
import { Card, Spinner, Toggle } from "../ui";
import { JobReport } from "./job-report";
import { ImportProgress } from "./import-progress";
import { ValidationReport, type ValidationResult } from "./validation-report";

type ImportMode = "upsert" | "create";

const MODE_OPTIONS: { label: string; value: ImportMode }[] = [
  { label: "Upsert", value: "upsert" },
  { label: "Create only", value: "create" },
];

interface RunState {
  batchId: string;
  /** Present when the server finished synchronously; otherwise the job is polled. */
  result: ImportJob | null;
}

export function ImportWizard() {
  const { can } = useAdminAuth();
  const canPublish = can("canPublish");
  const toast = useToast();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [downloading, setDownloading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [mode, setMode] = useState<ImportMode>("upsert");
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [run, setRun] = useState<RunState | null>(null);

  const validate = useMutation({
    mutationFn: (sheet: File) => adminApi.validateImport(sheet),
    onSuccess: ({ data }) => {
      setValidation(data);
      // Said out loud, because the report that follows looks like a finished import.
      toast.success("Sheet checked — nothing imported yet. Run step 3 to import.");
    },
    onError: (error) => toast.error(errorMessage(error, "Validation failed")),
  });

  const start = useMutation({
    mutationFn: (sheet: File) => adminApi.runImport(sheet, { mode, skipInvalid }),
    onSuccess: (response) => {
      setRun({ batchId: response.batchId, result: response.async ? null : (response.data ?? null) });
      queryClient.invalidateQueries({ queryKey: ["admin", "import", "history"] });
      if (response.async) {
        toast.success(response.message || "Import started in the background");
      } else {
        queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
        toast.success("Import finished");
      }
    },
    onError: (error) => toast.error(errorMessage(error, "Import failed")),
  });

  async function downloadTemplate() {
    setDownloading(true);
    try {
      await saveResponseAsFile(await adminApi.importSample(), "article-import-template.xlsx");
    } catch (error) {
      toast.error(errorMessage(error, "Could not download the template"));
    } finally {
      setDownloading(false);
    }
  }

  function chooseFile(next: File | null) {
    setFile(next);
    setValidation(null);
    setRun(null);
  }

  function reset() {
    chooseFile(null);
    if (fileInput.current) fileInput.current.value = "";
  }

  const errorCount = validation?.errorCount ?? 0;
  const blockedReason = !validation
    ? null
    : skipInvalid
      ? (validation.validRows ?? 0) === 0
        ? "No valid rows to import."
        : null
      : errorCount > 0
        ? `Fix the ${errorCount} validation error${errorCount === 1 ? "" : "s"} or turn on “Skip invalid rows”.`
        : null;

  return (
    <Card title="Import articles" bodyClassName="p-4 sm:p-5">
      <div className="space-y-10">
        <Step index={1} title="Get the template">
          <p className="mb-3 text-[13px] text-ink-soft">
            Every column is documented inside the workbook. Rows are matched to existing articles by slug.
          </p>
          <button type="button" className="adm-btn" onClick={downloadTemplate} disabled={downloading}>
            {downloading ? <Spinner className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
            Download template
          </button>
        </Step>

        <Step index={2} title="Validate a sheet">
          {!canPublish && <p className="mb-3 text-[13px] text-accent">Validating and importing require publishing permission.</p>}
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInput}
              id="import-file"
              type="file"
              accept=".xlsx,.xlsm,.csv"
              className="sr-only"
              disabled={!canPublish || start.isPending}
              onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
            />
            <label htmlFor="import-file" className="adm-btn cursor-pointer">
              <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
              {file ? "Choose another file" : "Choose .xlsx or .csv"}
            </label>
            {file && (
              <span className="meta min-w-0 truncate">
                {file.name} / {formatBytes(file.size)}
              </span>
            )}
            <button
              type="button"
              className="adm-btn-primary ml-auto"
              disabled={!file || !canPublish || validate.isPending || Boolean(run)}
              onClick={() => file && validate.mutate(file)}
            >
              {validate.isPending && <Spinner className="h-3.5 w-3.5" />}
              Validate
            </button>
          </div>
          {validation && (
            <div className="mt-6">
              <ValidationReport result={validation} />
            </div>
          )}
        </Step>

        {validation && file && (
          <Step index={3} title="Run the import — nothing is saved until you do">
            {run ? (
              <div className="space-y-5">
                {run.result ? <JobReport job={run.result} /> : <ImportProgress batchId={run.batchId} />}
                <button type="button" className="adm-btn" onClick={reset}>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Import another file
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <span className="adm-label">Mode</span>
                  <TextTabs label="Import mode" options={MODE_OPTIONS} value={mode} onChange={setMode} />
                  <p className="adm-hint">
                    {mode === "upsert"
                      ? "Creates new articles and updates existing ones with the same slug. Blank cells never wipe existing data."
                      : "Creates new articles only; rows whose slug already exists are skipped."}
                  </p>
                </div>
                <Toggle
                  label="Skip invalid rows"
                  hint="Import the valid rows and report the rest. When off, any validation error cancels the whole import."
                  checked={skipInvalid}
                  onChange={setSkipInvalid}
                />
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
                  {blockedReason && <p className="mr-auto text-[13px] text-accent">{blockedReason}</p>}
                  <button
                    type="button"
                    className="adm-btn-primary"
                    disabled={!canPublish || start.isPending || Boolean(blockedReason)}
                    onClick={() => start.mutate(file)}
                  >
                    {start.isPending ? <Spinner className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" aria-hidden="true" />}
                    Run import
                  </button>
                </div>
              </div>
            )}
          </Step>
        )}
      </div>
    </Card>
  );
}

function Step({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t-2 border-ink pt-4 first:border-t-0 first:pt-0">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="eyebrow-accent tabular-nums">{pad2(index)}</span>
        <h3 className="headline text-[20px] uppercase">{title}</h3>
      </div>
      {children}
    </section>
  );
}
