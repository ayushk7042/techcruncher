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
import { ConfirmDialog, Spinner, StatusBadge, TextAreaField } from "../ui";
import { CONTACTS_KEY } from "./keys";

/** Mail clients cap mailto URLs at roughly 2,000 characters, so the quoted original is shortened. */
const QUOTE_LIMIT = 900;

function mailtoHref(contact: ContactMessage, reply: string) {
  const subject = contact.subject ? `Re: ${contact.subject}` : `Re: your message to ${site.name}`;
  const quoted = truncate(contact.message, QUOTE_LIMIT)
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const body = `${reply.trim()}\n\nOn ${formatDateTime(contact.createdAt)}, ${contact.name} wrote:\n${quoted}`;
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactDetail({ contact, onDeleted }: { contact: ContactMessage; onDeleted: () => void }) {
  const { can } = useAdminAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [reply, setReply] = useState(contact.reply?.message ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const saveReply = useMutation({
    mutationFn: (message: string) => adminApi.replyContact(contact._id, message),
    onSuccess: (updated) => {
      queryClient.setQueryData<ContactMessage[]>(CONTACTS_KEY, (list) =>
        list?.map((message) => (message._id === updated._id ? updated : message)),
      );
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.success("Reply saved");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save the reply")),
  });

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
            <span className="font-medium text-ink">{contact.name}</span>{" "}
            <a href={`mailto:${contact.email}`} className="underline decoration-line-strong underline-offset-2 hover:text-accent">
              {contact.email}
            </a>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={contact.status} />
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
          <p className="eyebrow tabular-nums">Reply saved {formatDateTime(contact.reply?.repliedAt)}</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-ink-soft">{existingReply}</p>
        </section>
      )}

      <form
        className="mt-6 border-t border-line pt-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (reply.trim()) saveReply.mutate(reply.trim());
        }}
      >
        <TextAreaField
          label={existingReply ? "Update reply" : "Reply"}
          rows={6}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          hint="Saving records the reply and marks the message replied. It does not send an email; use “Open in mail app” to send it."
        />
        <div className="mt-3 flex flex-wrap justify-end gap-2">
          <a href={mailtoHref(contact, reply)} className="adm-btn">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            Open in mail app
          </a>
          <button type="submit" className="adm-btn-primary" disabled={!reply.trim() || saveReply.isPending}>
            {saveReply.isPending && <Spinner className="h-3.5 w-3.5" />}
            Save reply
          </button>
        </div>
      </form>

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
