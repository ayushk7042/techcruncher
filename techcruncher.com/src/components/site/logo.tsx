import Link from "next/link";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

type LogoSize = "sm" | "md" | "lg";

/**
 * "tone" picks the palette: "default" follows the site theme (navy on light,
 * white on dark); "light" forces the white version for always-dark surfaces.
 */
type LogoTone = "default" | "light";

const inkClass: Record<LogoTone, string> = {
  default: "text-[#1b2533] dark:text-[#fafafc]",
  light: "text-[#fafafc]",
};

const accentClass: Record<LogoTone, string> = {
  default: "fill-[#ff5a1f] dark:fill-[#ff6b33]",
  light: "fill-[#ff6b33]",
};

const wordmarkAccent: Record<LogoTone, string> = {
  default: "text-[#ff5a1f] dark:text-[#ff6b33]",
  light: "text-[#ff6b33]",
};

/** The "TC" monogram. Geometry mirrors public/brand/tc-mark-*.svg and public/favicon.svg. */
export function LogoMark({ className, tone = "default" }: { className?: string; tone?: LogoTone }) {
  return (
    <svg viewBox="0 0 100 71" aria-hidden="true" focusable="false" className={cn("block w-auto shrink-0", inkClass[tone], className)}>
      <path d="M9.3 0H66L53.7 15H37.3V71L20.3 52V15H0Z" fill="currentColor" />
      <path d="M82 20H66.5A23.7 23.7 0 0 0 66.5 67.4H96.7L82 51.55H66.5A7.85 7.85 0 0 1 66.5 35.85H68.3Z" fill="currentColor" />
      <path d="M71.7 0H100L87 15H58.7Z" className={accentClass[tone]} />
    </svg>
  );
}

const wordmarkSize: Record<LogoSize, string> = {
  sm: "text-[14px]",
  md: "text-[17px] sm:text-[21px]",
  lg: "text-[30px] sm:text-[40px]",
};

const taglineSize: Record<LogoSize, string> = {
  sm: "text-[7px] tracking-[0.3em]",
  md: "text-[8px] tracking-[0.34em]",
  lg: "text-[11px] tracking-[0.42em] sm:text-[13px]",
};

/** "TECH" in ink, "CRUNCHER" in brand orange, optional tagline underneath. */
export function Wordmark({
  size = "md",
  tone = "default",
  tagline = false,
}: {
  size?: LogoSize;
  tone?: LogoTone;
  tagline?: boolean;
}) {
  return (
    <span className="flex flex-col justify-center leading-none">
      <span
        className={cn("whitespace-nowrap font-display font-black uppercase tracking-[-0.01em]", wordmarkSize[size], inkClass[tone])}
        style={{ fontStretch: "112%" }}
      >
        Tech<span className={wordmarkAccent[tone]}>Cruncher</span>
      </span>
      {tagline && (
        <span
          className={cn(
            "mt-[0.5em] whitespace-nowrap font-sans font-medium uppercase",
            taglineSize[size],
            tone === "light" ? "text-white/70" : "text-[#1b2533]/80 dark:text-white/65",
          )}
        >
          {site.tagline}
        </span>
      )}
    </span>
  );
}

const markSize: Record<LogoSize, string> = {
  sm: "h-5",
  md: "h-7 sm:h-8",
  lg: "h-12 sm:h-16",
};

interface LogoProps {
  /** Shrunk masthead state: smaller mark, no tagline. */
  compact?: boolean;
  size?: LogoSize;
  tone?: LogoTone;
  href?: string | null;
}

export function Logo({ compact = false, size = "md", tone = "default", href = "/" }: LogoProps) {
  const resolved: LogoSize = compact ? "sm" : size;
  const content = (
    <span className="flex items-center gap-2.5 sm:gap-3">
      <LogoMark tone={tone} className={cn("transition-transform duration-200 group-hover:-translate-y-px", markSize[resolved])} />
      <Wordmark size={resolved} tone={tone} tagline={!compact && size !== "sm"} />
    </span>
  );

  if (href === null) {
    return (
      <span role="img" aria-label={site.name} className="inline-flex">
        {content}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={`${site.name} — home`} className="group inline-flex items-center">
      {content}
    </Link>
  );
}
