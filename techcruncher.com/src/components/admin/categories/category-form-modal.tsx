"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type { Category, ImageAsset } from "@/types/api";
import { adminApi, type CategoryPayload } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { ImageField } from "../image-field";
import { useToast } from "../toast";
import { Card, Modal, SelectField, Spinner, TextAreaField, TextField, Toggle } from "../ui";
import { CATEGORIES_KEY } from "./category-query";
import { descendantIds, slugify, treeOptions } from "./category-tree";

const ROBOTS = ["index, follow", "noindex, follow", "index, nofollow", "noindex, nofollow"];

type BooleanKey = "featured" | "hidden" | "showInMenu" | "showOnHome" | "showInFooter" | "autoUpdateEnabled";

interface FormState {
  name: string;
  slug: string;
  parent: string;
  description: string;
  shortLabel: string;
  icon: string;
  color: string;
  status: Category["status"];
  order: string;
  priority: string;
  featured: boolean;
  hidden: boolean;
  showInMenu: boolean;
  showOnHome: boolean;
  showInFooter: boolean;
  autoUpdateEnabled: boolean;
  dailyAutoUpdateLimit: string;
  redirectUrl: string;
  image?: ImageAsset;
  banner?: ImageAsset;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  robots: string;
}

const toForm = (category?: Category): FormState => ({
  name: category?.name ?? "",
  slug: category?.slug ?? "",
  parent: category?.parent ?? "",
  description: category?.description ?? "",
  shortLabel: category?.shortLabel ?? "",
  icon: category?.icon ?? "",
  color: category?.color ?? "",
  status: category?.status ?? "active",
  order: String(category?.order ?? 0),
  priority: String(category?.priority ?? 0),
  featured: category?.featured ?? false,
  hidden: category?.hidden ?? false,
  showInMenu: category?.showInMenu ?? true,
  showOnHome: category?.showOnHome ?? true,
  showInFooter: category?.showInFooter ?? false,
  autoUpdateEnabled: category?.autoUpdateEnabled ?? false,
  dailyAutoUpdateLimit: String(category?.dailyAutoUpdateLimit ?? 10),
  redirectUrl: category?.redirectUrl ?? "",
  image: category?.image?.url ? category.image : undefined,
  banner: category?.banner?.url ? category.banner : undefined,
  metaTitle: category?.metaTitle ?? "",
  metaDescription: category?.metaDescription ?? "",
  focusKeyword: category?.focusKeyword ?? "",
  canonicalUrl: category?.canonicalUrl ?? "",
  robots: category?.robots || ROBOTS[0],
});

const toPayload = (form: FormState): CategoryPayload => ({
  name: form.name.trim(),
  slug: form.slug.trim() || undefined,
  parent: form.parent || null,
  description: form.description,
  shortLabel: form.shortLabel,
  icon: form.icon,
  color: form.color,
  status: form.status,
  order: Number(form.order) || 0,
  priority: Number(form.priority) || 0,
  featured: form.featured,
  hidden: form.hidden,
  showInMenu: form.showInMenu,
  showOnHome: form.showOnHome,
  showInFooter: form.showInFooter,
  autoUpdateEnabled: form.autoUpdateEnabled,
  dailyAutoUpdateLimit: Number(form.dailyAutoUpdateLimit) || 0,
  redirectUrl: form.redirectUrl,
  // The API normalises an image without a url to "unset", so {} clears it.
  image: form.image ?? {},
  banner: form.banner ?? {},
  metaTitle: form.metaTitle,
  metaDescription: form.metaDescription,
  focusKeyword: form.focusKeyword,
  canonicalUrl: form.canonicalUrl,
  robots: form.robots,
});

const TOGGLES: { key: Exclude<BooleanKey, "autoUpdateEnabled">; label: string; hint: string }[] = [
  { key: "showInMenu", label: "Show in menu", hint: "Listed in the main navigation." },
  { key: "showOnHome", label: "Show on homepage", hint: "Eligible for a homepage section." },
  { key: "showInFooter", label: "Show in footer", hint: "Listed in the footer links." },
  { key: "featured", label: "Featured", hint: "Promoted in category pickers and rails." },
  { key: "hidden", label: "Hidden", hint: "Kept out of every public listing." },
];

export function CategoryFormModal({
  category,
  categories,
  onClose,
}: {
  /** Undefined when creating. */
  category?: Category;
  categories: Category[];
  onClose: () => void;
}) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toForm(category));
  const [slugEdited, setSlugEdited] = useState(Boolean(category));
  const [nameError, setNameError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));

  const parentOptions = useMemo(
    () => treeOptions(categories, category ? descendantIds(categories, category._id) : undefined),
    [categories, category],
  );

  const save = useMutation({
    mutationFn: (payload: CategoryPayload) =>
      category ? adminApi.updateCategory(category._id, payload) : adminApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
      toast.success(category ? "Category updated" : "Category created");
      onClose();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save category")),
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) {
      setNameError("Name is required");
      return;
    }
    save.mutate(toPayload(form));
  }

  const formId = category ? `category-form-${category._id}` : "category-form-new";

  return (
    <Modal
      open
      size="lg"
      title={category ? `Edit ${category.name}` : "New category"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose} disabled={save.isPending}>
            Cancel
          </button>
          <button type="submit" form={formId} className="adm-btn-primary" disabled={save.isPending}>
            {save.isPending && <Spinner className="h-3.5 w-3.5" />}
            {category ? "Save changes" : "Create category"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-5" noValidate>
        <Card title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Name"
              required
              value={form.name}
              error={nameError}
              onChange={(event) => {
                const name = event.target.value;
                setNameError("");
                setForm((current) => ({ ...current, name, slug: slugEdited ? current.slug : slugify(name) }));
              }}
            />
            <TextField
              label="Slug"
              value={form.slug}
              placeholder="auto from name"
              hint="Changing it breaks existing links to this category."
              onChange={(event) => {
                setSlugEdited(true);
                set("slug", event.target.value);
              }}
            />
            <SelectField
              label="Parent"
              value={form.parent}
              placeholder="None (top level)"
              options={parentOptions}
              onChange={(event) => set("parent", event.target.value)}
            />
            <SelectField
              label="Status"
              value={form.status}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              onChange={(event) => set("status", event.target.value as Category["status"])}
            />
            <TextAreaField
              label="Description"
              className="sm:col-span-2"
              value={form.description}
              onChange={(event) => set("description", event.target.value)}
            />
            <TextField
              label="Short label"
              hint="Compact label for nav pills."
              value={form.shortLabel}
              onChange={(event) => set("shortLabel", event.target.value)}
            />
            <TextField label="Icon" hint="Emoji or icon name." value={form.icon} onChange={(event) => set("icon", event.target.value)} />
            <div>
              <label htmlFor={`${formId}-color`} className="adm-label">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  aria-label="Pick color"
                  className="h-9 w-10 shrink-0 cursor-pointer border border-line bg-paper p-0.5"
                  value={/^#[0-9a-f]{6}$/i.test(form.color) ? form.color : "#000000"}
                  onChange={(event) => set("color", event.target.value)}
                />
                <input
                  id={`${formId}-color`}
                  className="adm-input"
                  placeholder="#e11d48"
                  value={form.color}
                  onChange={(event) => set("color", event.target.value)}
                />
              </div>
            </div>
            <TextField
              label="Redirect URL"
              type="url"
              hint="Send visitors elsewhere instead of the category page."
              value={form.redirectUrl}
              onChange={(event) => set("redirectUrl", event.target.value)}
            />
            <TextField
              label="Order"
              type="number"
              hint="Lower comes first among siblings."
              value={form.order}
              onChange={(event) => set("order", event.target.value)}
            />
            <TextField
              label="Priority"
              type="number"
              hint="Higher is listed first on the public site."
              value={form.priority}
              onChange={(event) => set("priority", event.target.value)}
            />
          </div>
        </Card>

        <Card title="Visibility">
          <div className="grid gap-4 sm:grid-cols-2">
            {TOGGLES.map((toggle) => (
              <Toggle
                key={toggle.key}
                label={toggle.label}
                hint={toggle.hint}
                checked={form[toggle.key]}
                onChange={(checked) => set(toggle.key, checked)}
              />
            ))}
          </div>
          <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
            <Toggle
              label="Auto update"
              hint="Let the auto-news job add articles to this category."
              checked={form.autoUpdateEnabled}
              onChange={(checked) => set("autoUpdateEnabled", checked)}
            />
            {form.autoUpdateEnabled && (
              <TextField
                label="Daily auto-update limit"
                type="number"
                min={0}
                value={form.dailyAutoUpdateLimit}
                onChange={(event) => set("dailyAutoUpdateLimit", event.target.value)}
              />
            )}
          </div>
        </Card>

        <Card title="Images">
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageField label="Image" folder="categories" value={form.image} onChange={(value) => set("image", value)} />
            <ImageField
              label="Banner"
              folder="categories"
              hint="Wide art for the top of the category page."
              value={form.banner}
              onChange={(value) => set("banner", value)}
            />
          </div>
        </Card>

        <Card title="SEO">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Meta title"
              className="sm:col-span-2"
              value={form.metaTitle}
              hint={`${form.metaTitle.length} / 60 characters`}
              onChange={(event) => set("metaTitle", event.target.value)}
            />
            <TextAreaField
              label="Meta description"
              className="sm:col-span-2"
              value={form.metaDescription}
              hint={`${form.metaDescription.length} / 160 characters`}
              onChange={(event) => set("metaDescription", event.target.value)}
            />
            <TextField label="Focus keyword" value={form.focusKeyword} onChange={(event) => set("focusKeyword", event.target.value)} />
            <SelectField
              label="Robots"
              value={form.robots}
              options={ROBOTS.map((value) => ({ value, label: value }))}
              onChange={(event) => set("robots", event.target.value)}
            />
            <TextField
              label="Canonical URL"
              type="url"
              className="sm:col-span-2"
              value={form.canonicalUrl}
              onChange={(event) => set("canonicalUrl", event.target.value)}
            />
          </div>
        </Card>
      </form>
    </Modal>
  );
}
