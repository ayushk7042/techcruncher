"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { publicApi } from "@/lib/api/public";
import { cn } from "@/lib/cn";

export function UnsubscribeForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("unsubscribe") || "");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    try {
      await publicApi.unsubscribe(email.trim());
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rule-strong mt-12 pt-4">
      <p className="eyebrow text-ink">Leaving?</p>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">Enter the address you subscribed with and we will stop sending the brief.</p>
      <div className="mt-4 flex items-center border-b-2 border-line-strong transition-colors focus-within:border-ink">
        <input
          type="email"
          aria-label="Email address"
          placeholder="your@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-mute"
        />
        <button
          type="submit"
          disabled={state === "sending" || state === "done"}
          className="h-10 shrink-0 px-1 font-mono text-[11px] font-medium uppercase tracking-eyebrow text-ink transition-colors hover:text-accent disabled:opacity-60"
        >
          Unsubscribe
        </button>
      </div>
      <p role={state === "error" ? "alert" : "status"} className={cn("meta mt-2.5 min-h-[14px]", state === "error" && "text-accent")}>
        {state === "done" && "You're unsubscribed. No more emails."}
        {state === "error" && "That didn't work. Please try again."}
      </p>
    </form>
  );
}
