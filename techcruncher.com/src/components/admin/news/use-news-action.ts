"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/admin/toast";
import { errorMessage } from "@/lib/api/client";

export const pluralArticles = (count = 0) => `${count} article${count === 1 ? "" : "s"}`;

/**
 * Runs a one-off article action: the callback performs the request and
 * returns the success message. Errors are toasted and every admin news query
 * is refreshed afterwards.
 */
export function useNewsAction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (run: () => Promise<string>) => run(),
    onSuccess: (message) => toast.success(message),
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin", "news"] }),
  });
}
