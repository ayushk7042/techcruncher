"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* Small controls shared by every admin section. */

export const iconButtonClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center border border-transparent text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

/** Square icon action for row tools (reorder, remove, toggle). */
export function IconButton({
  label,
  icon: Icon,
  children,
  onClick,
  disabled,
  danger,
  pressed,
}: {
  label: string;
  /** Pass an icon component, or render custom content as children. */
  icon?: LucideIcon;
  children?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  /** Set for toggle buttons only. */
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        iconButtonClass,
        danger && "hover:border-accent hover:text-accent",
        pressed && "border-ink bg-ink text-canvas hover:text-canvas",
      )}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : children}
    </button>
  );
}

/** Underlined text toggles — the panel's segmented control. */
export function TextTabs<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  className,
}: {
  label: string;
  options: { label: string; value: T; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "border-b-2 pb-1 font-mono text-[11px] font-medium uppercase tracking-eyebrow transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              active ? "border-accent text-ink" : "border-transparent text-ink-mute hover:text-ink",
            )}
          >
            {option.label}
            {option.count !== undefined && <span className="ml-1.5 tabular-nums text-ink-mute">{option.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
