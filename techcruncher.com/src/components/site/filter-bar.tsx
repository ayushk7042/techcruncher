"use client";

import { useUrlState } from "@/hooks/use-url-state";
import { cn } from "@/lib/cn";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterBarProps {
  options: FilterOption[];
  allLabel?: string;
  /** Query-string key the selection is stored under. */
  param?: string;
  className?: string;
}

/** Topic pills; the selection lives in the URL so feeds and headers agree. */
export function FilterBar({ options, allLabel = "All topics", param = "topic", className }: FilterBarProps) {
  const { get, set } = useUrlState();
  const active = get(param);

  const pill = (label: string, value: string, count?: number) => {
    const selected = active === value;
    return (
      <button
        key={value || "all"}
        type="button"
        aria-pressed={selected}
        onClick={() => set({ [param]: value || null, page: null })}
        className={cn("filter-pill", selected && "filter-pill-active")}
      >
        {label}
        {count !== undefined && <span className="ml-1.5 tabular-nums opacity-45">{count}</span>}
      </button>
    );
  };

  return (
    <div className={cn("no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1", className)}>
      {pill(allLabel, "")}
      {options.map((option) => pill(option.label, option.value, option.count))}
    </div>
  );
}
