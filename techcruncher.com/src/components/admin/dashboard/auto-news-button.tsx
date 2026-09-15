"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { ConfirmDialog } from "../ui";

export function AutoNewsButton() {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [lastCount, setLastCount] = useState<number | null>(null);

  const run = useMutation({
    mutationFn: adminApi.runAutoNews,
    onSuccess: ({ count }) => {
      setLastCount(count);
      setConfirming(false);
      toast.success(count ? `${count} draft placeholder${count === 1 ? "" : "s"} created` : "No categories have auto-update enabled");
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "news"] });
    },
    onError: (error) => toast.error(errorMessage(error, "Auto-news run failed")),
  });

  if (!can("canPublish")) return null;

  return (
    <>
      {lastCount !== null && (
        <span className="meta tabular-nums" role="status">
          Last run: {lastCount} created
        </span>
      )}
      <button type="button" className="adm-btn" onClick={() => setConfirming(true)}>
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Run auto-news
      </button>
      <ConfirmDialog
        open={confirming}
        title="Run auto-news"
        message="Creates draft placeholder articles for every active category with auto-update enabled, up to each category's daily limit. Drafts are not published."
        confirmLabel="Run now"
        busy={run.isPending}
        onConfirm={() => run.mutate()}
        onClose={() => setConfirming(false)}
      />
    </>
  );
}
