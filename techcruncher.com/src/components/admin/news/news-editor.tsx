"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, ExternalLink, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { AdminPageHeader, ConfirmDialog, ErrorBlock, LoadingBlock } from "@/components/admin/ui";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { newsHref } from "@/lib/news";
import type { News } from "@/types/api";
import { NewsForm } from "./news-form";
import { useNewsAction } from "./use-news-action";

function EditorActions({ news }: { news: News }) {
  const router = useRouter();
  const { can } = useAdminAuth();
  const action = useNewsAction();
  const [confirmTrash, setConfirmTrash] = useState(false);
  const trashed = news.status === "trash";

  return (
    <>
      <Link href="/admin/news" className="adm-btn">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> All articles
      </Link>
      {news.status === "published" && (
        <a href={newsHref(news)} target="_blank" rel="noreferrer" className="adm-btn">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /> View live
        </a>
      )}
      {can("canPublish") && trashed && (
        <button
          type="button"
          className="adm-btn"
          disabled={action.isPending}
          onClick={() =>
            action.mutate(async () => {
              await adminApi.restoreNews(news._id);
              return "Restored as a draft";
            })
          }
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Restore
        </button>
      )}
      {can("canPublish") && (
        <button
          type="button"
          className="adm-btn"
          disabled={action.isPending}
          onClick={() =>
            action.mutate(async () => {
              const { data } = await adminApi.duplicateNews(news._id);
              router.push(`/admin/news/${data._id}`);
              return "Duplicated as a draft";
            })
          }
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Duplicate
        </button>
      )}
      {can("canDelete") && !trashed && (
        <button type="button" className="adm-btn-danger" onClick={() => setConfirmTrash(true)}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Move to trash
        </button>
      )}

      <ConfirmDialog
        open={confirmTrash}
        title="Move to trash?"
        message="The article is taken off the site. You can restore it from the trash later."
        confirmLabel="Move to trash"
        danger
        busy={action.isPending}
        onClose={() => setConfirmTrash(false)}
        onConfirm={() =>
          action.mutate(
            async () => {
              await adminApi.trashNews(news._id);
              router.push("/admin/news");
              return "Moved to trash";
            },
            { onSettled: () => setConfirmTrash(false) },
          )
        }
      />
    </>
  );
}

export function NewsEditor({ id }: { id: string }) {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["admin", "news", "detail", id],
    queryFn: () => adminApi.getNews(id),
    // the form keeps its own state; refetching on focus would only cost a request
    refetchOnWindowFocus: false,
  });

  if (isPending) return <LoadingBlock label="Loading article…" />;
  if (error) return <ErrorBlock message={errorMessage(error, "Could not load the article")} onRetry={() => refetch()} />;

  return (
    <>
      <AdminPageHeader title="Edit article" description={data.title} actions={<EditorActions news={data} />} />
      <NewsForm key={data._id} initial={data} />
    </>
  );
}
