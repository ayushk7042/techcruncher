"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Category } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { ApiError, errorMessage } from "@/lib/api/client";
import { useToast } from "../toast";
import { ConfirmDialog, SelectField } from "../ui";
import { CATEGORIES_KEY } from "./category-query";
import { treeOptions } from "./category-tree";

interface Usage {
  articleCount: number;
  childCount: number;
}

/** Reads the counts the API attaches to its 409 "category is in use" answer. */
function readUsage(error: unknown): Usage | null {
  if (!(error instanceof ApiError) || error.status !== 409) return null;
  const data = error.data as Partial<Usage> | null;
  return { articleCount: Number(data?.articleCount) || 0, childCount: Number(data?.childCount) || 0 };
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

export function CategoryDeleteDialog({
  category,
  categories,
  onClose,
}: {
  category: Category;
  categories: Category[];
  onClose: () => void;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [usage, setUsage] = useState<Usage | null>(null);
  const [moveTo, setMoveTo] = useState("");

  const targets = useMemo(() => treeOptions(categories, new Set([category._id])), [categories, category._id]);

  const remove = useMutation({
    mutationFn: (options: { force?: boolean; moveTo?: string }) => adminApi.deleteCategory(category._id, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success(`Deleted ${category.name}`);
      onClose();
    },
    onError: (error) => {
      const inUse = readUsage(error);
      if (inUse) setUsage(inUse);
      else toast.error(errorMessage(error, "Could not delete category"));
    },
  });

  if (!usage) {
    return (
      <ConfirmDialog
        open
        danger
        title="Delete category"
        confirmLabel="Delete"
        busy={remove.isPending}
        message={
          <>
            Delete <strong className="text-ink">{category.name}</strong>? This cannot be undone.
          </>
        }
        onConfirm={() => remove.mutate({})}
        onClose={onClose}
      />
    );
  }

  const needsTarget = usage.articleCount > 0 && !moveTo;

  return (
    <ConfirmDialog
      open
      danger
      title="Category in use"
      confirmLabel="Move and delete"
      busy={remove.isPending}
      message={
        <div className="space-y-4">
          <p>
            <strong className="text-ink">{category.name}</strong> still has {plural(usage.articleCount, "article")} and{" "}
            {plural(usage.childCount, "sub-category")}.
          </p>
          {usage.childCount > 0 && <p>Its sub-categories will move to the top level.</p>}
          {usage.articleCount > 0 && (
            <SelectField
              label="Move articles to"
              value={moveTo}
              placeholder="Choose a category…"
              options={targets}
              onChange={(event) => setMoveTo(event.target.value)}
            />
          )}
        </div>
      }
      onConfirm={() => {
        if (needsTarget) {
          toast.error("Choose where the articles should go");
          return;
        }
        remove.mutate({ force: true, moveTo: moveTo || undefined });
      }}
      onClose={onClose}
    />
  );
}
