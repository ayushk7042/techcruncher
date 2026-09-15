import { adminApi } from "@/lib/api/admin";

/** Prefix shared by every category cache in the panel; invalidate this after writes. */
export const CATEGORIES_KEY = ["admin", "categories"] as const;

/** Flat list of every category (any status) with published article counts. */
export const categoryListQuery = {
  queryKey: [...CATEGORIES_KEY, "all"],
  queryFn: () => adminApi.categories(),
};
