"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";

interface StateProps {
  title?: string;
  message?: string;
  action?: { label: string; href: string };
  onRetry?: () => void;
}

export function EmptyState({
  title = "Nothing here yet",
  message = "New stories are published every day — check back soon.",
  action = { label: "Browse the latest", href: "/latest" },
}: StateProps) {
  return (
    <div className="rule-strong py-12 text-center sm:py-16">
      <p className="eyebrow-accent">No results</p>
      <h3 className="headline mx-auto mt-3 max-w-lg text-[28px] uppercase sm:text-[34px]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">{message}</p>
      {action && (
        <div className="mt-6 flex justify-center">
          <Link href={action.href} className="btn-outline h-10 px-5">
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = "This didn't load",
  message = "The connection to our newsroom dropped. It's usually momentary.",
  onRetry,
}: StateProps) {
  return (
    <div className="rule-strong py-12 text-center sm:py-16" role="alert">
      <p className="eyebrow-accent">Something went wrong</p>
      <h3 className="headline mx-auto mt-3 max-w-lg text-[28px] uppercase sm:text-[34px]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-soft">{message}</p>
      <div className="mt-6 flex justify-center">
        {onRetry ? (
          <button type="button" onClick={onRetry} className="btn-outline h-10 px-5">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
        ) : (
          <Link href="/" className="btn-outline h-10 px-5">
            Back to the homepage
          </Link>
        )}
      </div>
    </div>
  );
}
