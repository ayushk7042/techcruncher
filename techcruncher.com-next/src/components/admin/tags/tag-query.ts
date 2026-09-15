/** Prefix for every tag cache; invalidate after writes so pickers elsewhere refresh too. */
export const TAGS_KEY = ["admin", "tags"] as const;

export type TagSort = "popular" | "name" | "latest";
