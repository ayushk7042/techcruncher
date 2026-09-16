"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ContactMessage } from "@/types/api";
import { site } from "@/config/site";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { truncate } from "@/lib/news";
import { useAdminAuth } from "../auth-provider";
import { useToast } from "../toast";
import { ConfirmDialog, StatusBadge } from "../ui";
import { CONTACTS_KEY } from "./keys";

/** Mail clients cap mailto URLs at roughly 2,000 characters, so the quoted original is shortened. */
const QUOTE_LIMIT = 900;

/**
 * Replies are written in the editor's own mail app: the panel never sent mail,
 * and storing a copy here only made it look as though it had.
 */
function mailtoHref(contact: ContactMessage) {
  const subject = contact.subject ? `Re: ${contact.subject}` : `Re: your message to ${site.name}`;
  const quoted = truncate(contact.message, QUOTE_LIMIT)
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `\n\nOn ${formatDateTime(contact.createdAt)}, ${contact.name} wrote:\n${quoted}`;
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactDetail({ contact, onDeleted }: { contact: ContactMessage; onDeleted: () => void }) {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const remove = useMutation({
    mutationFn: () => adminApi.deleteContact(contact._id),
    onSuccess: () => {
      queryClient.setQueryData<ContactMessage[]>(CONTACTS_KEY, (list) => list?.filter((message) => message._id !== contact._id));
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success("Message deleted");
      onDeleted();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not delete the message")),
  });

  const existingReply = contact.reply?.message;

  return (
    <article className="p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
        <div className="min-w-0">
          <p className="eyebrow tabular-nums">Received {formatDateTime(contact.createdAt)}</p>
          <h2 className="headline mt-2 break-words text-[24px]">{contact.subject || "(No subject)"}</h2>
          <p className="mt-2 break-words text-[13px] text-ink-soft">
            <span className="font-medium text-ink">{contact.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Messages saved before `status` existed carry none; they are new until answered. */}
          <StatusBadge status={contact.status ?? (existingReply ? "replied" : "new")} />
          {can("canDelete") && (
            <button type="button" className="adm-btn-danger adm-btn-sm" onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      </header>

      <p className="whitespace-pre-wrap break-words py-5 text-[14px] leading-relaxed text-ink">{contact.message}</p>

      {existingReply && (
        <section className="border-l-2 border-ink pl-4">
          <p className="eyebrow tabular-nums">Earlier reply {contact.reply?.repliedAt ? formatDateTime(contact.reply.repliedAt) : ""}</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-ink-soft">{existingReply}</p>
        </section>
      )}

      <section className="mt-6 border-t border-line pt-5">
        <span className="adm-label">Reply by email</span>
        <a href={mailtoHref(contact)} className="adm-btn-primary mt-1 inline-flex max-w-full">
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{contact.email}</span>
        </a>
        <p className="adm-hint">Opens your mail app with the subject filled in and the original message quoted.</p>
      </section>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete message"
        message={`Delete the message from ${contact.name}? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        busy={remove.isPending}
        onConfirm={() => remove.mutate()}
        onClose={() => setConfirmingDelete(false)}
      />
    </article>
  );
}
