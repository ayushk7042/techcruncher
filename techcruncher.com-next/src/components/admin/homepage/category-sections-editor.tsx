"use client";

import { Plus, Trash2 } from "lucide-react";
import { errorMessage } from "@/lib/api/client";
import { pad2 } from "@/lib/format";
import { ErrorBlock, SelectField } from "../ui";
import { NewsPicker } from "./news-picker";
import { MAX_SECTION_STORIES, nextKey, type CategorySectionDraft } from "./state";
import { useCategoryOptions } from "./use-category-options";

export function CategorySectionsEditor({
  value,
  onChange,
  disabled,
}: {
  value: CategorySectionDraft[];
  onChange: (value: CategorySectionDraft[]) => void;
  disabled: boolean;
}) {
  const categories = useCategoryOptions();
  const usedCategories = new Set(value.map((section) => section.category));

  const patch = (key: string, next: Partial<CategorySectionDraft>) =>
    onChange(value.map((section) => (section.key === key ? { ...section, ...next } : section)));

  return (
    <div className="space-y-6">
      {categories.isError && (
        <ErrorBlock message={errorMessage(categories.error, "Could not load categories")} onRetry={() => categories.refetch()} />
      )}

      {value.length === 0 && <p className="text-[13px] text-ink-soft">No category sections yet. The homepage shows none until you add one.</p>}

      {value.map((section, index) => (
        <div key={section.key} className="border-t-2 border-ink pt-4">
          <div className="flex items-end gap-3">
            <span className="meta pb-3 tabular-nums">{pad2(index + 1)}</span>
            <SelectField
              className="min-w-0 flex-1"
              label="Category"
              placeholder={categories.isPending ? "Loading categories…" : "Choose a category"}
              // A category already used by another section is hidden so each section stays distinct.
              options={categories.options.filter((option) => option.value === section.category || !usedCategories.has(option.value))}
              value={section.category}
              onChange={(event) => patch(section.key, { category: event.target.value })}
              disabled={disabled}
            />
            <button
              type="button"
              className="adm-btn-danger"
              onClick={() => onChange(value.filter((item) => item.key !== section.key))}
              disabled={disabled}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Remove
            </button>
          </div>
          {!section.category && <p className="adm-hint">Sections without a category are dropped on save.</p>}

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <NewsPicker
              label="Lead story"
              max={1}
              category={section.category}
              value={section.trending ? [section.trending] : []}
              onChange={(list) => patch(section.key, { trending: list[0] ?? null })}
              disabled={disabled}
            />
            <NewsPicker
              label="Sub stories"
              max={MAX_SECTION_STORIES}
              category={section.category}
              value={section.subTrending}
              onChange={(subTrending) => patch(section.key, { subTrending })}
              disabled={disabled}
            />
          </div>
        </div>
      ))}

      {!disabled && (
        <button
          type="button"
          className="adm-btn"
          onClick={() => onChange([...value, { key: nextKey(), category: "", trending: null, subTrending: [] }])}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add category section
        </button>
      )}
    </div>
  );
}
