"use client";

import { ArrowRight, Check, Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { site } from "@/config/site";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";

type Variant = "plain" | "brand" | "accent";
type Layout = "stack" | "row" | "compact";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const compactSurfaces: Record<Variant, string> = {
  plain: "rule-strong pt-3.5",
  brand: "bg-ink p-5 text-canvas",
  accent: "bg-accent p-5 text-white",
};

const tones: Record<Variant, { surface: string; eyebrow: string; headline: string; body: string; field: string; input: string; button: string }> = {
  plain: {
    surface: "rule-strong pt-4",
    eyebrow: "text-accent",
    headline: "text-ink",
    body: "text-ink-soft",
    field: "border-line-strong focus-within:border-accent",
    input: "text-ink placeholder:text-ink-mute",
    button: "text-ink hover:text-accent",
  },
  brand: {
    surface: "bg-ink p-6 text-canvas sm:p-9",
    eyebrow: "text-accent",
    headline: "text-canvas",
    body: "text-canvas/60",
    field: "border-canvas/25 focus-within:border-accent",
    input: "text-canvas placeholder:text-canvas/40",
    button: "text-canvas hover:text-accent",
  },
  accent: {
    surface: "bg-accent p-6 text-white sm:p-9",
    eyebrow: "text-white/70",
    headline: "text-white",
    body: "text-white/75",
    field: "border-white/40 focus-within:border-white",
    input: "text-white placeholder:text-white/55",
    button: "text-white hover:text-ink",
  },
};

interface NewsletterCardProps {
  variant?: Variant;
  layout?: Layout;
  /** Where the signup came from; stored on the subscriber record. */
  source: string;
  className?: string;
}

export function NewsletterCard({ variant = "plain", layout = "stack", source, className }: NewsletterCardProps) {
  const tone = tones[variant];
  const compact = layout === "compact";
  const inputId = useId();

  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [note, setNote] = useState(`Join ${site.newsletterReaders} readers. No spam, ever.`);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState("error");
      setNote("Enter a valid email address.");
      return;
    }

    setState("loading");
    try {
      await publicApi.subscribe(email.trim(), source);
      setState("done");
      setNote("You're subscribed. Watch your inbox.");
    } catch {
      setState("error");
      setNote("Subscription failed. Please try again.");
    }
  }

  return (
    <div
      className={cn(
        compact ? compactSurfaces[variant] : tone.surface,
        layout === "row" && "flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn(layout === "row" && "max-w-md")}>
        <p className={cn("eyebrow", tone.eyebrow)}>The daily brief</p>
        <h2 className={cn("headline mt-2.5", compact ? "text-[20px]" : "text-[26px] sm:text-[32px]", tone.headline)}>
          The stories that matter, in two minutes.
        </h2>
        <p className={cn("mt-2 text-[13px] leading-relaxed", tone.body)}>One email each weekday. Free, and one click to leave.</p>
      </div>

      <form onSubmit={onSubmit} noValidate className={cn("mt-5", layout === "row" && "w-full lg:mt-0 lg:max-w-md")}>
        <div className={cn("flex items-center gap-0 border-b-2 transition-colors", tone.field)}>
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            disabled={state === "done"}
            onChange={(event) => {
              setEmail(event.target.value);
              if (state === "error") setState("idle");
            }}
            className={cn("h-10 w-full min-w-0 flex-1 bg-transparent text-[15px] outline-none", tone.input)}
          />
          <button
            type="submit"
            disabled={state === "loading" || state === "done"}
            className={cn(
              "inline-flex h-10 shrink-0 items-center gap-2 px-1 font-mono text-[11px] font-medium uppercase tracking-eyebrow transition-colors disabled:opacity-60",
              tone.button,
            )}
          >
            {state === "loading" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            {state === "done" ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Subscribed
              </>
            ) : (
              <>
                Subscribe
                {state !== "loading" && <ArrowRight className="h-3 w-3" aria-hidden="true" />}
              </>
            )}
          </button>
        </div>
        <p
          role={state === "error" ? "alert" : undefined}
          className={cn(
            "meta mt-2.5 min-h-[14px]",
            state === "error" && (variant === "accent" ? "text-white" : "text-accent"),
            variant === "brand" && state !== "error" && "text-canvas/45",
            variant === "accent" && state !== "error" && "text-white/60",
          )}
        >
          {note}
        </p>
      </form>
    </div>
  );
}
