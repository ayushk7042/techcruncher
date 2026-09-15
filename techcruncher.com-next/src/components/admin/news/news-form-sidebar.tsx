"use client";

import { Save } from "lucide-react";
import { useId } from "react";
import { ImageField } from "@/components/admin/image-field";
import { Card, Field, SelectField, Spinner, TextAreaField, TextField, Toggle } from "@/components/admin/ui";
import type { Author, Category } from "@/types/api";
import { FLAG_FIELDS, STATUS_OPTIONS, type FormErrors, type SectionProps } from "./news-form-state";
import { TagInput } from "./tag-input";

export function PublishCard({
  form,
  set,
  saving,
  canSave,
  dirty,
  isCreate,
}: SectionProps & { saving: boolean; canSave: boolean; dirty: boolean; isCreate: boolean }) {
  const options = form.status === "trash" ? [...STATUS_OPTIONS, { label: "Trash", value: "trash" as const }] : STATUS_OPTIONS;

  return (
    <Card title="Publish" bodyClassName="space-y-4" actions={dirty ? <span className="eyebrow-accent">Unsaved</span> : undefined}>
      <SelectField
        label="Status"
        options={options}
        value={form.status}
        onChange={(event) => {
          const next = options.find((option) => option.value === event.target.value);
          if (next) set("status", next.value);
        }}
      />
      <TextField
        label="Published date"
        type="datetime-local"
        value={form.publishedDate}
        onChange={(event) => set("publishedDate", event.target.value)}
        hint={isCreate ? "Defaults to now." : undefined}
      />
      <TextField
        label="Schedule for"
        type="datetime-local"
        value={form.scheduledAt}
        onChange={(event) => set("scheduledAt", event.target.value)}
        hint="A future time sets the status to scheduled."
      />
      <button type="submit" className="adm-btn-primary w-full" disabled={saving || !canSave}>
        {saving ? <Spinner className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" aria-hidden="true" />}
        {isCreate ? "Create article" : "Save changes"}
      </button>
      {!canSave && <p className="adm-hint">Your role cannot publish or edit articles.</p>}
    </Card>
  );
}

export function TaxonomyCard({ form, set, errors, categories }: SectionProps & { errors: FormErrors; categories: Category[] }) {
  const categoryId = useId();
  const tagsId = useId();

  const roots = categories.filter((category) => !category.parent || category._id === form.category);
  const children = categories.filter((category) => form.category && category.parent === form.category);

  const onCategory = (value: string) => {
    set("category", value);
    const keepsSub = categories.some((category) => category._id === form.subCategory && category.parent === value);
    if (!keepsSub) set("subCategory", "");
  };

  return (
    <Card title="Taxonomy" bodyClassName="space-y-4">
      <Field label="Category" htmlFor={categoryId} error={errors.category}>
        <select
          id={categoryId}
          className="adm-select"
          aria-invalid={Boolean(errors.category)}
          value={form.category}
          onChange={(event) => onCategory(event.target.value)}
        >
          <option value="">Choose a category</option>
          {roots.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>
      <SelectField
        label="Sub-category"
        placeholder={children.length ? "None" : "No sub-categories"}
        disabled={!children.length}
        options={children.map((category) => ({ label: category.name, value: category._id }))}
        value={form.subCategory}
        onChange={(event) => set("subCategory", event.target.value)}
      />
      <Field label="Tags" htmlFor={tagsId} hint="New tags are created on save.">
        <TagInput id={tagsId} value={form.tags} onChange={(tags) => set("tags", tags)} />
      </Field>
    </Card>
  );
}

export function FeaturedImageCard({ form, set }: SectionProps) {
  return (
    <Card title="Featured image">
      <ImageField label="Image" value={form.featuredImage} onChange={(image) => set("featuredImage", image)} />
    </Card>
  );
}

export function FlagsCard({ form, set }: SectionProps) {
  return (
    <Card title="Placement" bodyClassName="space-y-3">
      {FLAG_FIELDS.map((flag) => (
        <Toggle key={flag.key} label={flag.label} checked={form[flag.key]} onChange={(checked) => set(flag.key, checked)} />
      ))}
      <TextField
        label="Priority"
        type="number"
        className="pt-2"
        value={form.priority}
        onChange={(event) => set("priority", Number(event.target.value) || 0)}
        hint="Higher numbers rank first in curated lists."
      />
    </Card>
  );
}

export function AuthorCard({ form, set }: SectionProps) {
  const patch = (value: Partial<Author>) => set("author", { ...form.author, ...value });

  return (
    <Card title="Author" bodyClassName="space-y-4">
      <TextField label="Name" value={form.author.name || ""} onChange={(event) => patch({ name: event.target.value })} />
      <TextField
        label="Designation"
        value={form.author.designation || ""}
        onChange={(event) => patch({ designation: event.target.value })}
      />
      <TextField label="Email" type="email" value={form.author.email || ""} onChange={(event) => patch({ email: event.target.value })} />
      <TextAreaField label="Bio" value={form.author.bio || ""} onChange={(event) => patch({ bio: event.target.value })} />
      <ImageField label="Photo" folder="authors" withMeta={false} value={form.author.image} onChange={(image) => patch({ image })} />
    </Card>
  );
}
