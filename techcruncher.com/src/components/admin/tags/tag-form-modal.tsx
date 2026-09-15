"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Tag } from "@/types/api";
import { adminApi } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { useToast } from "../toast";
import { Modal, SelectField, Spinner, TextAreaField, TextField, Toggle } from "../ui";
import { TAGS_KEY } from "./tag-query";

type FormState = Pick<Tag, "name" | "slug" | "featured" | "status"> &
  Required<Pick<Tag, "description" | "seoTitle" | "seoDescription" | "focusKeyword">>;

const toForm = (tag?: Tag): FormState => ({
  name: tag?.name ?? "",
  slug: tag?.slug ?? "",
  description: tag?.description ?? "",
  featured: tag?.featured ?? false,
  status: tag?.status ?? "active",
  seoTitle: tag?.seoTitle ?? "",
  seoDescription: tag?.seoDescription ?? "",
  focusKeyword: tag?.focusKeyword ?? "",
});

export function TagFormModal({ tag, onClose }: { tag?: Tag; onClose: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toForm(tag));
  const [error, setError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: (payload: Partial<Tag>) => (tag ? adminApi.updateTag(tag._id, payload) : adminApi.createTag(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY });
      toast.success(tag ? "Tag updated" : "Tag created");
      onClose();
    },
    // Shown inline so a duplicate-name 409 stays next to the field that caused it.
    onError: (err) => setError(errorMessage(err, "Could not save tag")),
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setError("");
    save.mutate({ ...form, name: form.name.trim(), slug: form.slug.trim() || undefined });
  }

  const formId = tag ? `tag-form-${tag._id}` : "tag-form-new";

  return (
    <Modal
      open
      title={tag ? `Edit ${tag.name}` : "New tag"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose} disabled={save.isPending}>
            Cancel
          </button>
          <button type="submit" form={formId} className="adm-btn-primary" disabled={save.isPending}>
            {save.isPending && <Spinner className="h-3.5 w-3.5" />}
            {tag ? "Save changes" : "Create tag"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        {error && (
          <p role="alert" className="border border-accent px-3 py-2 text-[13px] text-accent sm:col-span-2">
            {error}
          </p>
        )}
        <TextField label="Name" required value={form.name} onChange={(event) => set("name", event.target.value)} />
        <TextField
          label="Slug"
          placeholder="auto from name"
          value={form.slug}
          onChange={(event) => set("slug", event.target.value)}
        />
        <TextAreaField
          label="Description"
          className="sm:col-span-2"
          value={form.description}
          onChange={(event) => set("description", event.target.value)}
        />
        <SelectField
          label="Status"
          value={form.status}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          onChange={(event) => set("status", event.target.value as Tag["status"])}
        />
        <div className="self-end pb-1.5">
          <Toggle label="Featured" checked={form.featured} onChange={(checked) => set("featured", checked)} />
        </div>

        <h3 className="eyebrow border-t border-line pt-4 text-ink sm:col-span-2">SEO</h3>
        <TextField
          label="SEO title"
          className="sm:col-span-2"
          value={form.seoTitle}
          hint={`${form.seoTitle.length} / 60 characters`}
          onChange={(event) => set("seoTitle", event.target.value)}
        />
        <TextAreaField
          label="SEO description"
          className="sm:col-span-2"
          value={form.seoDescription}
          hint={`${form.seoDescription.length} / 160 characters`}
          onChange={(event) => set("seoDescription", event.target.value)}
        />
        <TextField label="Focus keyword" value={form.focusKeyword} onChange={(event) => set("focusKeyword", event.target.value)} />
      </form>
    </Modal>
  );
}
