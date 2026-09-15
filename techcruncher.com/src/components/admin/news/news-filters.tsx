"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Category, NewsSort } from "@/types/api";

export const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
  { label: "Trash", value: "trash" },
] as const;

export const SORT_OPTIONS: { label: string; value: NewsSort }[] = [
  { label: "Latest", value: "latest" },
  { label: "Recently updated", value: "updated" },
  { label: "Most viewed", value: "popular" },
  { label: "Title A–Z", value: "title" },
  { label: "Oldest", value: "oldest" },
];

export const FLAG_FILTERS = [
  { key: "featured", label: "Featured" },
  { key: "trending", label: "Trending" },
  { key: "breaking", label: "Breaking" },
  { key: "editorsPick", label: "Editors' pick" },
] as const;

export type FlagFilter = (typeof FLAG_FILTERS)[number]["key"];

export interface NewsFilterValues {
  search: string;
  status: string;
  category: string;
  sort: NewsSort;
  flags: FlagFilter[];
}

/** Parents first, each followed by its children. */
function categoryOptions(categories: Category[]) {
  const roots = categories.filter((category) => !category.parent);
  return roots.flatMap((root) => [
    { value: root._id, label: root.name },
    ...categories
      .filter((category) => category.parent === root._id)
      .map((child) => ({ value: child._id, label: `— ${child.name}` })),
  ]);
}

export function NewsFilters({
  values,
  categories,
  onSearch,
  onChange,
}: {
  values: NewsFilterValues;
  categories: Category[];
  onSearch: (value: string) => void;
  /** Patch of URL params; null removes a key. */
  onChange: (patch: Record<string, string | null>) => void;
}) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap gap-1.5" aria-label="Status">
        {STATUS_FILTERS.map((option) => {
          const active = values.status === option.value;
          return (
            <button
              key={option.value || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ status: option.value || null })}
              className={cn("filter-pill", active && "filter-pill-active")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-mute" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search articles"
            placeholder="Search title, slug, author, tag…"
            className="adm-input pl-8"
            value={values.search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>
        <select
          aria-label="Category"
          className="adm-select"
          value={values.category}
          onChange={(event) => onChange({ category: event.target.value || null })}
        >
          <option value="">All categories</option>
          {categoryOptions(categories).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort"
          className="adm-select"
          value={values.sort}
          onChange={(event) => onChange({ sort: event.target.value === "latest" ? null : event.target.value })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="eyebrow mr-1">Flags</span>
        {FLAG_FILTERS.map((flag) => {
          const active = values.flags.includes(flag.key);
          return (
            <button
              key={flag.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ [flag.key]: active ? null : "1" })}
              className={cn("filter-pill", active && "filter-pill-active")}
            >
              {flag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
