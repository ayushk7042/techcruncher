"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useAdminAuth } from "@/components/admin/auth-provider";
import { useToast } from "@/components/admin/toast";
import { Card, Field, TextField } from "@/components/admin/ui";
import { adminApi, type NewsPayload } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import type { News } from "@/types/api";
import { ConversionCard } from "./conversion-card";
import { MediaCard } from "./media-card";
import { emptyForm, fromNews, slugify, toPayload, validate, type FormErrors, type SetField } from "./news-form-state";
import { AuthorCard, FeaturedImageCard, FlagsCard, PublishCard, TaxonomyCard } from "./news-form-sidebar";
import { RichTextEditor } from "./rich-text-editor";
import { SeoCard } from "./seo-card";
import { SourceLocationCard } from "./source-location-card";

/** Shared create / edit form. Pass `initial` to edit an existing article. */
export function NewsForm({ initial }: { initial?: News }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { can } = useAdminAuth();
  const descriptionId = useId();
  const isCreate = !initial;

  const [form, setForm] = useState(() => (initial ? fromNews(initial) : emptyForm()));
  const [baseline, setBaseline] = useState(form);
  const [errors, setErrors] = useState<FormErrors>({});
  // new articles follow the title until the slug is edited by hand
  const [slugFollowsTitle, setSlugFollowsTitle] = useState(isCreate);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(baseline), [form, baseline]);

  const { data: categories = [] } = useQuery({
    queryKey: ["admin", "categories", "options"],
    queryFn: () => adminApi.categories(),
    staleTime: 5 * 60_000,
  });

  const set = useCallback<SetField>((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => (prev[key as keyof FormErrors] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const setContent = useCallback((html: string) => set("content", html), [set]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useMutation({
    mutationFn: (payload: NewsPayload) => (initial ? adminApi.updateNews(initial._id, payload) : adminApi.createNews(payload)),
    onError: (error) => toast.error(errorMessage(error, "Could not save the article")),
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error("Fill in the highlighted fields before saving.");
      return;
    }

    const snapshot = form;
    save.mutate(toPayload(snapshot, isCreate), {
      onSuccess: (saved) => {
        saved.warnings?.forEach((warning) => toast.error(warning));
        queryClient.invalidateQueries({ queryKey: ["admin", "news"] });

        if (isCreate) {
          setBaseline(snapshot);
          toast.success("Article created");
          router.replace(`/admin/news/${saved._id}`);
          return;
        }

        // the API may de-duplicate the slug or derive the status from the schedule
        const confirmed = { slug: saved.slug, status: saved.status };
        setForm((prev) => ({ ...prev, ...confirmed }));
        setBaseline({ ...snapshot, ...confirmed });
        toast.success("Article saved");
      },
    });
  }

  const onTitle = (title: string) => {
    set("title", title);
    if (slugFollowsTitle) set("slug", slugify(title));
  };

  const onSlug = (value: string) => {
    setSlugFollowsTitle(isCreate && !value);
    set("slug", value.toLowerCase().replace(/\s+/g, "-"));
  };

  const sectionProps = { form, set };

  return (
    <form onSubmit={onSubmit} noValidate className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <Card title="Article" bodyClassName="space-y-4">
          <TextField
            label="Title"
            required
            value={form.title}
            error={errors.title}
            aria-invalid={Boolean(errors.title)}
            onChange={(event) => onTitle(event.target.value)}
            className="[&_input]:h-11 [&_input]:text-[16px] [&_input]:font-semibold"
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(event) => onSlug(event.target.value)}
            onBlur={() => set("slug", slugify(form.slug))}
            hint={
              slugFollowsTitle
                ? "Generated from the title."
                : isCreate
                  ? "Clear it to generate from the title again."
                  : "Changing the slug changes the public URL."
            }
          />
          <TextField label="Subtitle" value={form.subtitle} onChange={(event) => set("subtitle", event.target.value)} />
          <Field label="Short description" htmlFor={descriptionId} error={errors.description} hint="Standfirst shown under the headline.">
            <textarea
              id={descriptionId}
              rows={3}
              required
              aria-invalid={Boolean(errors.description)}
              className="adm-textarea"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </Field>
          <Field label="Excerpt" htmlFor={`${descriptionId}-excerpt`} hint="Used on cards and in feeds. Generated from the body when left empty.">
            <textarea
              id={`${descriptionId}-excerpt`}
              rows={2}
              className="adm-textarea"
              value={form.excerpt}
              onChange={(event) => set("excerpt", event.target.value)}
            />
          </Field>
        </Card>

        <RichTextEditor value={form.content} onChange={setContent} />

        <SeoCard {...sectionProps} />
        <MediaCard {...sectionProps} />
        <ConversionCard {...sectionProps} />
        <SourceLocationCard {...sectionProps} currentReadTime={initial?.readTime} />
      </div>

      <aside className="space-y-6">
        <PublishCard {...sectionProps} saving={save.isPending} canSave={can("canPublish")} dirty={dirty} isCreate={isCreate} />
        <TaxonomyCard {...sectionProps} errors={errors} categories={categories} />
        <FeaturedImageCard {...sectionProps} />
        <FlagsCard {...sectionProps} />
        <AuthorCard {...sectionProps} />
      </aside>
    </form>
  );
}
