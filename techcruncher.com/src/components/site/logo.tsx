import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

interface LogoProps {
  compact?: boolean;
  tone?: "default" | "light";
  href?: string;
}

export function Logo({ compact = false, tone = "default", href = "/" }: LogoProps) {
  return (
    <Link href={href} aria-label={`${site.name} — home`} className="group inline-flex flex-col justify-center leading-none">
      <span className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "block w-[3px] shrink-0 bg-accent transition-transform duration-200 group-hover:scale-y-[1.15]",
            compact ? "h-4" : "h-5",
          )}
        />
        <span
          className={cn(
            "font-display font-extrabold uppercase tracking-[-0.035em]",
            compact ? "text-[18px]" : "text-[21px]",
            tone === "light" ? "text-white" : "text-ink",
          )}
          style={{ fontStretch: "80%" }}
        >
          {site.name}
        </span>
      </span>
      {!compact && (
        <span className={cn("eyebrow mt-1.5 hidden pl-[11px] sm:block", tone === "light" ? "text-white/50" : "text-ink-mute")}>
          {site.tagline}
        </span>
      )}
    </Link>
  );
}
