import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className={cn("meta flex flex-wrap items-center gap-1.5", className)}>
      {all.map((crumb, index) => {
        const last = index === all.length - 1;
        return (
          <Fragment key={`${crumb.label}-${index}`}>
            {crumb.href && !last ? (
              <Link href={crumb.href} className="transition-colors hover:text-accent">
                {crumb.label}
              </Link>
            ) : (
              <span className={cn(last && "text-ink-soft")} aria-current={last ? "page" : undefined}>
                {crumb.label}
              </span>
            )}
            {!last && (
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  crumbs?: Crumb[];
  children?: React.ReactNode;
}

/** Standing head of every listing and static route. */
export function PageHeader({ eyebrow, title, description, crumbs, children }: PageHeaderProps) {
  return (
    <header className="border-b-2 border-ink">
      <div className="container pb-5 pt-5 sm:pb-6 sm:pt-6">
        <Breadcrumbs items={crumbs ?? [{ label: title }]} className="mb-4" />
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
          <div className="min-w-0">
            <p className="eyebrow-accent mb-2">{eyebrow}</p>
            <h1 className="headline text-[38px] uppercase sm:text-[52px] lg:text-[60px]">{title}</h1>
          </div>
          {description && <p className="max-w-sm pb-1.5 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */

interface SectionHeaderProps {
  index?: number;
  kicker?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  as?: "h2" | "h3";
}

/** Numbered home band header. */
export function SectionHeader({ index, kicker, title, subtitle, action, as: Heading = "h2" }: SectionHeaderProps) {
  return (
    <div className="rule-strong mb-6 pt-2.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
        <div className="flex min-w-0 items-baseline gap-4">
          {index !== undefined && (
            <span className="font-mono text-[11px] font-medium tabular-nums text-accent">{pad2(index)}</span>
          )}
          <div className="min-w-0">
            {kicker && <p className="eyebrow mb-1.5">{kicker}</p>}
            <Heading className="headline text-[24px] sm:text-[28px]">{title}</Heading>
          </div>
        </div>
        {action && <ActionLink {...action} />}
      </div>
      {subtitle && <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">{subtitle}</p>}
    </div>
  );
}

export function ActionLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="link-muted group inline-flex shrink-0 items-center gap-1.5">
      {label}
      <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
}

/* ------------------------------------------------------------------ */

/** Sidebar module: 2px rule, eyebrow title, optional action, divided rows. */
export function Rail({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="rule-strong flex items-baseline justify-between gap-3 pt-2">
        <h2 className="eyebrow text-ink">{title}</h2>
        {action && (
          <Link href={action.href} className="link-muted">
            {action.label}
          </Link>
        )}
      </div>
      <div className="divide-y divide-line">{children}</div>
    </section>
  );
}

/** Appended article section: rule-strong eyebrow heading + note. */
export function AppendedSection({
  title,
  note,
  children,
  id,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section className="mt-10" id={id}>
      <div className="rule-strong flex items-baseline justify-between gap-4 pt-2">
        <h2 className="eyebrow text-ink">{title}</h2>
        {note && <span className="meta">{note}</span>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function GroupHeader({ title, count }: { title: string; count?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-ink pb-2.5">
      <h2 className="eyebrow text-ink">{title}</h2>
      {count && <span className="meta">{count}</span>}
    </div>
  );
}
