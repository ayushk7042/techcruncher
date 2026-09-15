import { Suspense } from "react";
import { FilterBar, type FilterOption } from "@/components/site/filter-bar";
import { cn } from "@/lib/cn";

/** FilterBar reads search params, so it renders inside its own Suspense boundary. */
export function TopicFilter({
  options,
  allLabel,
  className = "mt-6",
}: {
  options: FilterOption[];
  allLabel: string;
  className?: string;
}) {
  if (options.length === 0) return null;

  return (
    <div className={cn("min-h-[30px]", className)}>
      <Suspense fallback={null}>
        <FilterBar options={options} allLabel={allLabel} />
      </Suspense>
    </div>
  );
}
