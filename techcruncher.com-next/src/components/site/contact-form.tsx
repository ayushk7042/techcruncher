"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { publicApi } from "@/lib/api/public";
import { errorMessage } from "@/lib/api/client";
import { cn } from "@/lib/cn";

const fieldClass =
  "h-11 w-full border-b border-line bg-transparent text-[15px] text-ink outline-none transition-colors placeholder:text-ink-mute focus:border-ink";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      setState("error");
      setFeedback("Add your name and a message.");
      return;
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      setState("error");
      setFeedback("Enter a valid email address so we can reply.");
      return;
    }

    setState("sending");
    try {
      await publicApi.contact({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
      });
      setState("sent");
      setFeedback("Thanks — your message is with the newsroom. We reply to every note we can.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      setState("error");
      setFeedback(errorMessage(error, "Your message could not be sent. Please try again."));
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-1 block">Your name *</span>
          <input className={fieldClass} autoComplete="name" value={form.name} onChange={update("name")} required />
        </label>
        <label className="block">
          <span className="eyebrow mb-1 block">Email *</span>
          <input className={fieldClass} type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow mb-1 block">Subject</span>
        <input className={fieldClass} value={form.subject} onChange={update("subject")} />
      </label>
      <label className="block">
        <span className="eyebrow mb-1 block">Message *</span>
        <textarea className={cn(fieldClass, "h-auto py-3 leading-relaxed")} rows={7} value={form.message} onChange={update("message")} required />
      </label>

      <div className="flex flex-wrap items-center gap-6">
        <button type="submit" disabled={state === "sending"} className="btn-primary h-12 px-8">
          {state === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
          Send message
        </button>
        {feedback && (
          <p role={state === "error" ? "alert" : "status"} className={cn("text-[13px]", state === "error" ? "text-accent" : "text-ink-soft")}>
            {feedback}
          </p>
        )}
      </div>
    </form>
  );
}
