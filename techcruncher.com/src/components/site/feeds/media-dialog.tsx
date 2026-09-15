"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useScrollLock } from "@/hooks/use-dismiss";

interface MediaDialogProps {
  label: string;
  onClose: () => void;
  /** Extra keys (e.g. arrows) handled while the dialog is open. */
  onKey?: (key: string) => void;
  children: React.ReactNode;
}

/** Full-screen dark viewer: Escape and backdrop close it, page scroll is locked. */
export function MediaDialog({ label, onClose, onKey, children }: MediaDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useScrollLock(true);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else onKey?.(event.key);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, onKey]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-y-auto bg-ink-950/95 p-4 sm:p-8"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 z-10 rounded-sm p-2 text-white/70 transition-colors hover:text-white"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
      {children}
    </div>
  );
}
