"use client";

import { CircleX, Copy, EyeOff, Pencil, RotateCcw, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { ConfirmDialog } from "@/components/admin/ui";
import { adminApi } from "@/lib/api/admin";
import type { News } from "@/types/api";
import { IconButton, iconButtonClass } from "../controls";
import { useNewsAction } from "./use-news-action";

export function NewsRowActions({ news }: { news: News }) {
  const { can } = useAdminAuth();
  const action = useNewsAction();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const trashed = news.status === "trash" || Boolean(news.deletedAt);
  const published = news.status === "published";
  const busy = action.isPending;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Link href={`/admin/news/${news._id}`} title="Edit" aria-label={`Edit ${news.title}`} className={iconButtonClass}>
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>

      {can("canPublish") && !trashed && (
        <>
          <IconButton
            label="Duplicate"
            icon={Copy}
            disabled={busy}
            onClick={() =>
              action.mutate(async () => {
                await adminApi.duplicateNews(news._id);
                return "Duplicated as a draft";
              })
            }
          />
          <IconButton
            label={published ? "Unpublish" : "Publish"}
            icon={published ? EyeOff : Send}
            disabled={busy}
            onClick={() =>
              action.mutate(async () => {
                await adminApi.changeStatus(news._id, published ? "draft" : "published");
                return published ? "Moved to drafts" : "Published";
              })
            }
          />
        </>
      )}

      {trashed
        ? can("canPublish") && (
            <IconButton
              label="Restore"
              icon={RotateCcw}
              disabled={busy}
              onClick={() =>
                action.mutate(async () => {
                  await adminApi.restoreNews(news._id);
                  return "Restored as a draft";
                })
              }
            />
          )
        : can("canDelete") && (
            <IconButton
              label="Move to trash"
              icon={Trash2}
              disabled={busy}
              onClick={() =>
                action.mutate(async () => {
                  await adminApi.trashNews(news._id);
                  return "Moved to trash";
                })
              }
            />
          )}

      {can("canDelete") && (
        <IconButton label="Delete permanently" icon={CircleX} danger disabled={busy} onClick={() => setConfirmDelete(true)} />
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete permanently?"
        message={
          <>
            <strong className="text-ink">{news.title}</strong> will be removed for good. This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        danger
        busy={busy}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() =>
          action.mutate(
            async () => {
              await adminApi.deleteNews(news._id);
              return "Article deleted";
            },
            { onSettled: () => setConfirmDelete(false) },
          )
        }
      />
    </div>
  );
}
