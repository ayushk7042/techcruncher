"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, CornerDownRight, Pencil, Trash2 } from "lucide-react";
import type { Category } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";
import { compactNumber } from "@/lib/format";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { StatusBadge, TableScroll } from "../ui";
import { CATEGORIES_KEY } from "./category-query";
import type { CategoryRow } from "./category-tree";

type VisibilityFlag = "hidden" | "showInMenu" | "showOnHome" | "showInFooter" | "featured";

const FLAGS: { key: VisibilityFlag; label: string; title: string }[] = [
  { key: "showInMenu", label: "Menu", title: "Show in main menu" },
  { key: "showOnHome", label: "Home", title: "Show on homepage" },
  { key: "showInFooter", label: "Footer", title: "Show in footer" },
  { key: "featured", label: "Feat", title: "Featured" },
  { key: "hidden", label: "Hidden", title: "Hidden from the public site" },
];

export function CategoryTable({
  rows,
  onEdit,
  onDelete,
}: {
  rows: CategoryRow[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}) {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const canPublish = can("canPublish");
  const canDelete = can("canDelete");

  const refresh = () => queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });

  const toggle = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Record<VisibilityFlag, boolean>> }) =>
      adminApi.toggleCategoryVisibility(id, patch),
    onSuccess: refresh,
    onError: (error) => toast.error(errorMessage(error, "Could not update category")),
  });

  const reorder = useMutation({
    mutationFn: (siblings: Category[]) =>
      adminApi.reorderCategories(siblings.map((category, index) => ({ id: category._id, order: index }))),
    onSuccess: refresh,
    onError: (error) => toast.error(errorMessage(error, "Could not reorder")),
  });

  const move = (siblings: Category[], index: number, offset: -1 | 1) => {
    const next = [...siblings];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    reorder.mutate(next);
  };

  return (
    <TableScroll>
      <table className="adm-table">
        <thead>
          <tr>
            <th>Name</th>
            <th className="text-right">Articles</th>
            <th>Status</th>
            <th>Visibility</th>
            <th>Order</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ category, depth, siblings }) => {
            const index = siblings.findIndex((c) => c._id === category._id);
            const busy = toggle.isPending && toggle.variables?.id === category._id;
            return (
              <tr key={category._id}>
                <td>
                  <div className="flex items-start gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
                    {depth > 0 && <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-mute" aria-hidden="true" />}
                    {category.color && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0" style={{ backgroundColor: category.color }} aria-hidden="true" />
                    )}
                    <div className="min-w-0">
                      <p className={cn("font-medium text-ink", depth === 0 && "font-semibold")}>{category.name}</p>
                      <p className="meta mt-1">/{category.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="text-right font-mono text-[12px] tabular-nums">{compactNumber(category.articleCount)}</td>
                <td>
                  <StatusBadge status={category.status} />
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {FLAGS.map((flag) => {
                      const on = Boolean(category[flag.key]);
                      return (
                        <button
                          key={flag.key}
                          type="button"
                          title={flag.title}
                          aria-pressed={on}
                          disabled={!canPublish || busy}
                          onClick={() => toggle.mutate({ id: category._id, patch: { [flag.key]: !on } })}
                          className={cn(
                            "border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-eyebrow transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                            on
                              ? flag.key === "hidden"
                                ? "border-accent bg-accent text-white"
                                : "border-ink bg-ink text-canvas"
                              : "border-line text-ink-mute hover:border-ink hover:text-ink",
                          )}
                        >
                          {flag.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm"
                      aria-label={`Move ${category.name} up`}
                      disabled={!canPublish || index <= 0 || reorder.isPending}
                      onClick={() => move(siblings, index, -1)}
                    >
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm"
                      aria-label={`Move ${category.name} down`}
                      disabled={!canPublish || index >= siblings.length - 1 || reorder.isPending}
                      onClick={() => move(siblings, index, 1)}
                    >
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="flex justify-end gap-1">
                    {canPublish && (
                      <button type="button" className="adm-btn adm-btn-sm" onClick={() => onEdit(category)}>
                        <Pencil className="h-3 w-3" aria-hidden="true" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="adm-btn adm-btn-sm hover:border-accent hover:text-accent"
                        aria-label={`Delete ${category.name}`}
                        onClick={() => onDelete(category)}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableScroll>
  );
}
