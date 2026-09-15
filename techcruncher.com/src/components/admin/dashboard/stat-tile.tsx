import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/** Rule-topped figure block: mono label over a large tabular number. */
export function StatTile({
  label,
  value,
  suffix,
  href,
  highlight = false,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  href?: string;
  highlight?: boolean;
}) {
  const body = (
    <>
      <span className={cn("eyebrow flex items-center justify-between gap-2", highlight && "text-accent")}>
        {label}
        {href && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
      </span>
      <span className="headline mt-3 block text-[34px] tabular-nums sm:text-[40px]">
        {typeof value === "number" ? value.toLocaleString("en-US") : value}
        {suffix && <span className="meta ml-1.5 align-baseline">{suffix}</span>}
      </span>
    </>
  );

  const className = cn("block border-t-2 pt-3", highlight ? "border-accent" : "border-ink");

  return href ? (
    <Link href={href} className={cn(className, "transition-colors hover:border-accent")}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
