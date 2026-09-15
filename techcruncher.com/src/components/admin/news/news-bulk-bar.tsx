"use client";

import { useState } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { ConfirmDialog } from "@/components/admin/ui";
import { adminApi } from "@/lib/api/admin";
import type { Category } from "@/types/api";
import { FLAG_FIELDS, STATUS_OPTIONS, type FlagKey } from "./news-form-state";
import { pluralArticles, useNewsAction } from "./use-news-action";

const compactControl = "adm-select h-7 w-auto text-[12px]";

export function NewsBulkBar({ ids, categories, onDone }: { ids: string[]; categories: Category[]; onDone: () => void }) {
  const { can } = useAdminAuth();
  const action = useNewsAction();
  const [tags, setTags] = useState("");
  const [flag, setFlag] = useState<FlagKey>("featured");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const busy = action.isPending;
  const tagList = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const run = (request: () => Promise<{ modified?: number; deleted?: number }>, verb: string, after?: () => void) =>
    action.mutate(
      async () => {
        const result = await request();
        return `${verb} ${pluralArticles(result.modified ?? result.deleted)}`;
      },
      {
        onSuccess: () => {
          after?.();
          onDone();
        },
      },
    );

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-raise px-4 py-2.5">
      <span className="eyebrow mr-1 text-ink">{ids.length} selected</span>

      {can("canPublish") && (
        <>
          <select
            aria-label="Set status"
            className={compactControl}
            value=""
            disabled={busy}
            onChange={(event) => {
              const status = STATUS_OPTIONS.find((option) => option.value === event.target.value)?.value;
              if (status) run(() => adminApi.bulkStatus(ids, status), "Updated");
            }}
          >
            <option value="">Set status…</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Move to category"
            className={compactControl}
            value=""
            disabled={busy}
            onChange={(event) => event.target.value && run(() => adminApi.bulkCategory(ids, event.target.value), "Moved")}
          >
            <option value="">Move to category…</option>
            {categories
              .filter((category) => !category.parent)
              .map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>

          <span className="flex items-center gap-1">
            <input
              aria-label="Tags to add or remove"
              placeholder="tag, another tag"
              className="adm-input h-7 w-40 text-[12px]"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              disabled={busy || !tagList.length}
              onClick={() => run(() => adminApi.bulkTags(ids, tagList, "add"), "Tagged", () => setTags(""))}
            >
              Add tags
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              disabled={busy || !tagList.length}
              onClick={() => run(() => adminApi.bulkTags(ids, tagList, "remove"), "Untagged", () => setTags(""))}
            >
              Remove
            </button>
          </span>

          <span className="flex items-center gap-1">
            <select
              aria-label="Flag"
              className={compactControl}
              value={flag}
              onChange={(event) => {
                const next = FLAG_FIELDS.find((option) => option.key === event.target.value);
                if (next) setFlag(next.key);
              }}
            >
              {FLAG_FIELDS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              disabled={busy}
              onClick={() => run(() => adminApi.bulkFlags(ids, { [flag]: true }), "Flagged")}
            >
              Set
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm"
              disabled={busy}
              onClick={() => run(() => adminApi.bulkFlags(ids, { [flag]: false }), "Unflagged")}
            >
              Unset
            </button>
          </span>
        </>
      )}

      {can("canDelete") && (
        <>
          <button type="button" className="adm-btn adm-btn-sm" disabled={busy} onClick={() => run(() => adminApi.bulkDelete(ids), "Trashed")}>
            Move to trash
          </button>
          <button type="button" className="adm-btn-danger adm-btn-sm" disabled={busy} onClick={() => setConfirmDelete(true)}>
            Delete permanently
          </button>
        </>
      )}

      <button type="button" className="link-muted ml-auto" onClick={onDone}>
        Clear selection
      </button>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete permanently?"
        message={`${pluralArticles(ids.length)} will be removed for good. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        busy={busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => run(() => adminApi.bulkDelete(ids, true), "Deleted", () => setConfirmDelete(false))}
      />
    </div>
  );
}
