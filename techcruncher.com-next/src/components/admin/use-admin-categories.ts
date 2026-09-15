"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { adminApi } from "@/lib/api/admin";
import { treeOptions } from "./categories/category-tree";

/** Prefix shared by every category cache in the panel; invalidate this after writes. */
export const CATEGORIES_KEY = ["admin", "categories"] as const;

/** Flat list of every category (any status) with live article counts. */
export const adminCategoriesQuery = {
  queryKey: [...CATEGORIES_KEY, "all"],
  queryFn: () => adminApi.categories(),
};

/** The one categories query of the panel, plus tree-ordered select options ("— Child"). */
export function useAdminCategories() {
  const query = useQuery(adminCategoriesQuery);
  const categories = useMemo(() => query.data ?? [], [query.data]);
  const options = useMemo(() => treeOptions(categories), [categories]);
  return { ...query, categories, options };
}
