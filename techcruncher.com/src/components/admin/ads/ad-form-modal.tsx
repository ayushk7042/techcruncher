"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { AD_POSITIONS, type AdPosition, type Advertisement, type Device, type ImageAsset } from "@/types/api";
import { adminApi, type AdPayload } from "@/lib/api/admin";
import { errorMessage } from "@/lib/api/client";
import { toDateTimeInput } from "@/lib/format";
import { categoryListQuery } from "../categories/category-query";
import { flattenTree } from "../categories/category-tree";
import { ImageField } from "../image-field";
import { useToast } from "../toast";
import { Card, Field, LoadingBlock, Modal, SelectField, Spinner, TextField, Toggle } from "../ui";
import { ADS_KEY, DEVICES } from "./ad-query";

interface FormState {
  name: string;
  position: AdPosition | "";
  type: Advertisement["type"];
  display: Advertisement["display"];
  maxHeight: string;
  image?: ImageAsset;
  targetUrl: string;
  openInNewTab: boolean;
  scriptCode: string;
  devices: Device[];
  categories: string[];
  priority: string;
  startsAt: string;
  endsAt: string;
  status: Advertisement["status"];
}

type Errors = Partial<Record<"name" | "position" | "creative" | "schedule", string>>;

/** Slots whose image creatives are resized to the section on the homepage, whatever was uploaded. */
const POSITION_SIZE_HINTS: Partial<Record<AdPosition, string>> = {
  "home-top":
    "Full-width strip under the topics bar (970 × 140, taller on phones). The whole image is fitted inside, never cropped; about 1940 × 280 px fills it edge to edge. Two or more active ads here rotate automatically.",
  "home-gallery-left":
    "Left column beside Featured reporting, as tall as that section on desktop. The whole image is fitted inside, never cropped; a portrait image (about 600 × 1200 px) fills it best. Two or more active ads rotate automatically.",
  "home-gallery-right":
    "Right column beside Featured reporting, as tall as that section on desktop. The whole image is fitted inside, never cropped; a portrait image (about 600 × 1200 px) fills it best. Two or more active ads rotate automatically.",
};

const toForm = (ad?: Advertisement): FormState => ({
  name: ad?.name ?? "",
  position: ad?.position ?? "",
  type: ad?.type ?? "image",
  display: ad?.display ?? "banner",
  maxHeight: ad?.maxHeight ? String(ad.maxHeight) : "",
  image: ad?.image?.url ? ad.image : undefined,
  targetUrl: ad?.targetUrl ?? "",
  openInNewTab: ad?.openInNewTab ?? true,
  scriptCode: ad?.scriptCode ?? "",
  devices: ad?.devices?.length ? ad.devices : DEVICES.map((d) => d.value),
  categories: (ad?.categories ?? []).map((c) => (typeof c === "string" ? c : c._id)),
  priority: String(ad?.priority ?? 0),
  startsAt: toDateTimeInput(ad?.startsAt),
  endsAt: toDateTimeInput(ad?.endsAt),
  status: ad?.status ?? "active",
});

/** datetime-local values are local wall-clock time; the API stores UTC. */
const toIso = (value: string) => (value ? new Date(value).toISOString() : null);

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.position) errors.position = "Choose where the ad appears";
  if (form.type === "image" && !form.image?.url) errors.creative = "Add an image";
  if (form.type === "script" && !form.scriptCode.trim()) errors.creative = "Paste the ad code";
  if (form.startsAt && form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) {
    errors.schedule = "End must be after the start";
  }
  return errors;
}

function toPayload(form: FormState, position: AdPosition): AdPayload {
  const common: AdPayload = {
    name: form.name.trim(),
    position,
    type: form.type,
    devices: form.devices,
    categories: form.categories,
    priority: Number(form.priority) || 0,
    startsAt: toIso(form.startsAt),
    endsAt: toIso(form.endsAt),
    status: form.status,
  };
  if (form.type === "script") return { ...common, scriptCode: form.scriptCode };
  return {
    ...common,
    image: form.image,
    targetUrl: form.targetUrl.trim(),
    openInNewTab: form.openInNewTab,
    display: form.display,
    maxHeight: Number(form.maxHeight) > 0 ? Number(form.maxHeight) : null,
  };
}

export function AdFormModal({ ad, onClose }: { ad?: Advertisement; onClose: () => void }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(() => toForm(ad));
  const [errors, setErrors] = useState<Errors>({});
  const categories = useQuery(categoryListQuery);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const toggleIn = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const save = useMutation({
    mutationFn: (payload: AdPayload) => (ad ? adminApi.updateAd(ad._id, payload) : adminApi.createAd(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADS_KEY });
      toast.success(ad ? "Ad updated" : "Ad created");
      onClose();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save ad")),
  });

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length || !form.position) return;
    save.mutate(toPayload(form, form.position));
  }

  const formId = ad ? `ad-form-${ad._id}` : "ad-form-new";

  return (
    <Modal
      open
      size="lg"
      title={ad ? `Edit ${ad.name}` : "New ad"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose} disabled={save.isPending}>
            Cancel
          </button>
          <button type="submit" form={formId} className="adm-btn-primary" disabled={save.isPending}>
            {save.isPending && <Spinner className="h-3.5 w-3.5" />}
            {ad ? "Save changes" : "Create ad"}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-5" noValidate>
        <Card title="Placement">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" required value={form.name} error={errors.name} onChange={(e) => set("name", e.target.value)} />
            <Field
              label="Position"
              error={errors.position}
              hint={form.position ? POSITION_SIZE_HINTS[form.position] : undefined}
              htmlFor={`${formId}-position`}
            >
              <select
                id={`${formId}-position`}
                className="adm-select font-mono text-[12px]"
                value={form.position}
                onChange={(e) => set("position", e.target.value as AdPosition)}
              >
                <option value="">Choose a slot…</option>
                {AD_POSITIONS.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </Field>
            <SelectField
              label="Status"
              value={form.status}
              options={[
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
              ]}
              onChange={(e) => set("status", e.target.value as Advertisement["status"])}
            />
            <TextField
              label="Priority"
              type="number"
              hint="Higher wins when several ads share a slot."
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            />
          </div>
        </Card>

        <Card title="Creative">
          <div className="mb-4 flex border border-line sm:w-fit" role="radiogroup" aria-label="Ad type">
            {(["image", "script"] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={form.type === type}
                onClick={() => set("type", type)}
                className={
                  form.type === type
                    ? "h-9 flex-1 bg-ink px-4 font-mono text-[10px] uppercase tracking-eyebrow text-canvas"
                    : "h-9 flex-1 px-4 font-mono text-[10px] uppercase tracking-eyebrow text-ink-soft hover:text-ink"
                }
              >
                {type === "image" ? "Image banner" : "Script / HTML"}
              </button>
            ))}
          </div>

          {form.type === "image" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <ImageField label="Image" folder="ads" withMeta={false} value={form.image} onChange={(value) => set("image", value)} />
                {errors.creative && <p className="mt-1 text-[11.5px] text-accent">{errors.creative}</p>}
              </div>
              <div className="space-y-4">
                <TextField
                  label="Target URL"
                  type="url"
                  placeholder="https://"
                  value={form.targetUrl}
                  onChange={(e) => set("targetUrl", e.target.value)}
                />
                <Toggle label="Open in new tab" checked={form.openInNewTab} onChange={(checked) => set("openInNewTab", checked)} />
                <SelectField
                  label="Display"
                  value={form.display}
                  options={[
                    { value: "banner", label: "Banner" },
                    { value: "frame", label: "Frame" },
                  ]}
                  hint={
                    form.display === "banner"
                      ? "Banner keeps the image's own proportions at the slot's full width, with no cropping or empty space."
                      : "Frame holds the slot's standard size (e.g. 300×250) and fits the image inside, so rotations share one height."
                  }
                  onChange={(e) => set("display", e.target.value as Advertisement["display"])}
                />
                <TextField
                  label="Max height (px)"
                  type="number"
                  min={0}
                  max={1200}
                  placeholder="Slot default"
                  hint="Optional ceiling for this creative; capped at 1200."
                  value={form.maxHeight}
                  onChange={(e) => set("maxHeight", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <Field label="Ad code" error={errors.creative} htmlFor={`${formId}-script`}>
              <p className="mb-2 flex items-start gap-2 border border-accent px-3 py-2 text-[12.5px] text-ink">
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                This code runs as-is on the public site for every visitor. Only paste code from a network you trust.
              </p>
              <textarea
                id={`${formId}-script`}
                rows={8}
                spellCheck={false}
                className="adm-textarea font-mono text-[12px]"
                placeholder="<script async src=…></script>"
                value={form.scriptCode}
                onChange={(e) => set("scriptCode", e.target.value)}
              />
            </Field>
          )}
        </Card>

        <Card title="Targeting">
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset>
              <legend className="adm-label">Devices</legend>
              <div className="flex flex-wrap gap-4">
                {DEVICES.map((device) => (
                  <label key={device.value} className="flex cursor-pointer items-center gap-2 text-[13px] text-ink">
                    <input
                      type="checkbox"
                      className="accent-accent"
                      checked={form.devices.includes(device.value)}
                      onChange={() => set("devices", toggleIn(form.devices, device.value))}
                    />
                    {device.label}
                  </label>
                ))}
              </div>
              <p className="adm-hint">None selected shows the ad everywhere.</p>
            </fieldset>

            <div className="grid grid-cols-1 gap-4">
              <TextField
                label="Starts"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
              />
              <TextField
                label="Ends"
                type="datetime-local"
                error={errors.schedule}
                hint="Leave both empty to run until paused."
                value={form.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
              />
            </div>

            <fieldset className="sm:col-span-2">
              <legend className="adm-label">
                Categories {form.categories.length > 0 && <span className="text-accent">({form.categories.length})</span>}
              </legend>
              {categories.isPending ? (
                <LoadingBlock label="Loading categories…" />
              ) : (
                <div className="grid max-h-56 gap-x-4 gap-y-1.5 overflow-y-auto border border-line p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {flattenTree(categories.data ?? []).map(({ category, depth }) => (
                    <label
                      key={category._id}
                      className="flex cursor-pointer items-center gap-2 text-[13px] text-ink"
                      style={{ paddingLeft: `${depth * 14}px` }}
                    >
                      <input
                        type="checkbox"
                        className="accent-accent"
                        checked={form.categories.includes(category._id)}
                        onChange={() => set("categories", toggleIn(form.categories, category._id))}
                      />
                      <span className="truncate">{category.name}</span>
                    </label>
                  ))}
                </div>
              )}
              <p className="adm-hint">Leave empty to run on every category and on pages without one.</p>
            </fieldset>
          </div>
        </Card>
      </form>
    </Modal>
  );
}
