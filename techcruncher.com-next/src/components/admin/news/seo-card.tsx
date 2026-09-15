"use client";

import { ImageField } from "@/components/admin/image-field";
import { SelectField, TextAreaField, TextField } from "@/components/admin/ui";
import { CollapsibleCard } from "./collapsible-card";
import type { SectionProps } from "./news-form-state";

const ROBOTS_OPTIONS = ["index, follow", "noindex, follow", "index, nofollow", "noindex, nofollow"].map((value) => ({
  label: value,
  value,
}));

const counter = (value: string, max: number) =>
  `${value.length} / ${max} characters${value.length > max ? " — longer than search engines display" : ""}`;

export function SeoCard({ form, set }: SectionProps) {
  return (
    <CollapsibleCard title="SEO">
      <TextField
        label="Meta title"
        value={form.metaTitle}
        placeholder={form.title}
        onChange={(event) => set("metaTitle", event.target.value)}
        hint={counter(form.metaTitle, 60)}
      />
      <TextAreaField
        label="Meta description"
        value={form.metaDescription}
        placeholder={form.description}
        onChange={(event) => set("metaDescription", event.target.value)}
        hint={counter(form.metaDescription, 160)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Focus keyword" value={form.focusKeyword} onChange={(event) => set("focusKeyword", event.target.value)} />
        <SelectField label="Robots" options={ROBOTS_OPTIONS} value={form.robots} onChange={(event) => set("robots", event.target.value)} />
      </div>
      <TextField
        label="Canonical URL"
        type="url"
        value={form.canonicalUrl}
        placeholder="https://"
        onChange={(event) => set("canonicalUrl", event.target.value)}
        hint="Only when the story first appeared elsewhere."
      />
      <TextField
        label="Keywords"
        value={form.seoKeywords}
        onChange={(event) => set("seoKeywords", event.target.value)}
        hint="Comma separated."
      />
      <ImageField
        label="Social share image"
        value={form.ogImage}
        onChange={(image) => set("ogImage", image)}
        withMeta={false}
        hint="Falls back to the featured image."
      />
    </CollapsibleCard>
  );
}
