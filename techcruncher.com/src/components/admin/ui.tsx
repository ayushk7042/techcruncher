"use client";

import { Loader2, X } from "lucide-react";
import { useEffect, useId } from "react";
import { useScrollLock } from "@/hooks/use-dismiss";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Page chrome                                                         */
/* ------------------------------------------------------------------ */

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink pb-4">
      <div className="min-w-0">
        <h1 className="headline text-[30px] uppercase sm:text-[36px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  title,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("adm-card", className)}>
      {(title || actions) && (
        <div className="adm-card-head">
          {title && <h2 className="eyebrow text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="adm-label">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-[11.5px] text-accent">{error}</p> : hint ? <p className="adm-hint">{hint}</p> : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string };

export function TextField({ label, hint, error, className, id, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <Field label={label} hint={hint} error={error} className={className} htmlFor={inputId}>
      <input id={inputId} className="adm-input" {...props} />
    </Field>
  );
}

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string };

export function TextAreaField({ label, hint, className, id, rows = 3, ...props }: TextAreaProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <Field label={label} hint={hint} className={className} htmlFor={inputId}>
      <textarea id={inputId} rows={rows} className="adm-textarea" {...props} />
    </Field>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
};

export function SelectField({ label, hint, options, placeholder, className, id, ...props }: SelectProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <Field label={label} hint={hint} className={className} htmlFor={inputId}>
      <select id={inputId} className="adm-select" {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 h-5 w-9 shrink-0 border transition-colors disabled:opacity-50",
          checked ? "border-ink bg-ink" : "border-line-strong bg-raise",
        )}
      >
        <span
          className={cn(
            "absolute top-[3px] h-3 w-3 transition-all",
            checked ? "left-[19px] bg-accent" : "left-[3px] bg-ink-mute",
          )}
        />
      </button>
      <label htmlFor={id} className="cursor-pointer select-none">
        <span className="block text-[13px] font-medium text-ink">{label}</span>
        {hint && <span className="adm-hint block">{hint}</span>}
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/* ------------------------------------------------------------------ */

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} aria-hidden="true" />;
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="meta flex items-center justify-center gap-2 py-16">
      <Spinner className="h-3.5 w-3.5" /> {label}
    </div>
  );
}

export function EmptyBlock({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
  return (
    <div className="py-14 text-center">
      <p className="headline text-[22px] uppercase">{title}</p>
      {message && <p className="mx-auto mt-2 max-w-md text-[13px] text-ink-soft">{message}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="border border-accent px-4 py-3 text-[13px] text-ink">
      <span className="eyebrow-accent mr-2">Error</span>
      {message}
      {onRetry && (
        <button type="button" onClick={onRetry} className="link-muted ml-3">
          Retry
        </button>
      )}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  published: "border-ink bg-ink text-canvas",
  active: "border-ink bg-ink text-canvas",
  subscribed: "border-ink bg-ink text-canvas",
  completed: "border-ink bg-ink text-canvas",
  replied: "border-ink text-ink",
  scheduled: "border-accent text-accent",
  importing: "border-accent text-accent",
  new: "border-accent bg-accent text-white",
  draft: "border-line-strong text-ink-soft",
  paused: "border-line-strong text-ink-soft",
  inactive: "border-line-strong text-ink-soft",
  archived: "border-line-strong text-ink-mute",
  trash: "border-accent text-accent",
  failed: "border-accent text-accent",
  unknown: "border-line-strong text-ink-mute",
  unsubscribed: "border-line-strong text-ink-mute",
  rolled_back: "border-line-strong text-ink-mute",
};

/**
 * `status` is API data and can be missing on documents written before the field
 * existed. It used to be read straight through, so one such row crashed the
 * whole page instead of showing an unknown badge.
 */
export function StatusBadge({ status }: { status?: string | null }) {
  const value = String(status ?? "unknown");
  return <span className={cn("adm-badge", STATUS_TONE[value])}>{value.replace("_", " ")}</span>;
}

/* ------------------------------------------------------------------ */
/* Dialog                                                              */
/* ------------------------------------------------------------------ */

/** Open dialogs, innermost last; only that one reacts to Escape. */
const openModals: symbol[] = [];

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    // Nested dialogs (a media picker inside a form) must close one at a time.
    const token = Symbol("modal");
    openModals.push(token);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && openModals[openModals.length - 1] === token) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      openModals.splice(openModals.indexOf(token), 1);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-ink-950/60" onClick={onClose} />
      <div
        className={cn(
          "relative w-full border-2 border-ink bg-paper shadow-pop",
          { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-6xl" }[size],
        )}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <h2 className="headline text-[18px] uppercase">{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1 text-ink-mute transition-colors hover:text-ink">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className={danger ? "adm-btn-danger" : "adm-btn-primary"} onClick={onConfirm} disabled={busy}>
            {busy && <Spinner className="h-3.5 w-3.5" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-[13.5px] leading-relaxed text-ink-soft">{message}</div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Table helpers                                                       */
/* ------------------------------------------------------------------ */

export function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function SimplePager({
  page,
  pages,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  total?: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <span className="meta">
        Page {page} of {Math.max(1, pages)}
        {total !== undefined && ` / ${total} total`}
      </span>
      <div className="flex gap-2">
        <button type="button" className="adm-btn adm-btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Prev
        </button>
        <button type="button" className="adm-btn adm-btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
