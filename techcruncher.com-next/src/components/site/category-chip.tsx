import Link from "next/link";
import type { Category } from "@/types/api";
import { cn } from "@/lib/cn";
import { categoryHref } from "@/lib/news";

interface CategoryChipProps {
  category?: Pick<Category, "name" | "slug" | "shortLabel"> | null;
  variant?: "soft" | "plain" | "solid";
  linked?: boolean;
  className?: string;
}

export function CategoryChip({ category, variant = "soft", linked = true, className }: CategoryChipProps) {
  const label = category?.shortLabel || category?.name || "News";
  const classes = cn(
    "chip",
    variant === "solid" ? "bg-black/55 px-2 py-1 text-white backdrop-blur-sm" : "text-ink-soft",
    linked && variant !== "solid" && "transition-colors hover:text-accent",
    className,
  );

  if (!linked) return <span className={classes}>{label}</span>;

  return (
    <Link href={categoryHref(category)} className={classes}>
      {label}
    </Link>
  );
}
