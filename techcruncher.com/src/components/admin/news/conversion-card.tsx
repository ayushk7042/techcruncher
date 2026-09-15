"use client";

import { Plus } from "lucide-react";
import { Field, SelectField, TextField, Toggle } from "@/components/admin/ui";
import { AD_POSITIONS, type AffiliateLink, type Cta } from "@/types/api";
import { CollapsibleCard } from "./collapsible-card";
import { replaceItem, type SectionProps } from "./news-form-state";

const CTA_STYLES: { label: string; value: NonNullable<Cta["style"]> }[] = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
  { label: "Ghost", value: "ghost" },
];

const POSITION_OPTIONS = AD_POSITIONS.map((value) => ({ label: value, value }));

function AffiliateLinksEditor({ links, onChange }: { links: AffiliateLink[]; onChange: (links: AffiliateLink[]) => void }) {
  const patch = (index: number, value: Partial<AffiliateLink>) => onChange(replaceItem(links, index, value));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="adm-label mb-0">Affiliate links</span>
        <button type="button" className="adm-btn adm-btn-sm" onClick={() => onChange([...links, { title: "", link: "" }])}>
          <Plus className="h-3 w-3" aria-hidden="true" /> Add link
        </button>
      </div>
      {links.length ? (
        <ol className="space-y-3">
          {links.map((link, index) => (
            <li key={index} className="border border-line p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Title" value={link.title || ""} onChange={(event) => patch(index, { title: event.target.value })} />
                <TextField label="Link" type="url" value={link.link || ""} onChange={(event) => patch(index, { link: event.target.value })} />
                <TextField
                  label="Button text"
                  value={link.buttonText || ""}
                  onChange={(event) => patch(index, { buttonText: event.target.value })}
                />
                <TextField label="Price" value={link.price || ""} onChange={(event) => patch(index, { price: event.target.value })} />
                <TextField
                  label="Product image URL"
                  type="url"
                  className="sm:col-span-2"
                  value={link.productImage || ""}
                  onChange={(event) => patch(index, { productImage: event.target.value })}
                />
              </div>
              <button type="button" className="link-muted mt-3" onClick={() => onChange(links.filter((_, i) => i !== index))}>
                Remove link
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="adm-hint">No affiliate links.</p>
      )}
    </div>
  );
}

export function ConversionCard({ form, set }: SectionProps) {
  const patchCta = (value: Partial<Cta>) => set("cta", { ...form.cta, ...value });
  const patchAd = (value: Partial<NewsAdvertisement>) => set("advertisement", { ...form.advertisement, ...value });

  return (
    <CollapsibleCard title="Conversion">
      <fieldset className="space-y-3">
        <legend className="adm-label">Call to action</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Label" value={form.cta.label || ""} onChange={(event) => patchCta({ label: event.target.value })} />
          <TextField label="URL" type="url" value={form.cta.url || ""} onChange={(event) => patchCta({ url: event.target.value })} />
          <SelectField
            label="Style"
            options={CTA_STYLES}
            value={form.cta.style || "primary"}
            onChange={(event) => patchCta({ style: CTA_STYLES.find((option) => option.value === event.target.value)?.value })}
          />
          <div className="self-end pb-1.5">
            <Toggle label="Open in new tab" checked={form.cta.openInNewTab ?? true} onChange={(openInNewTab) => patchCta({ openInNewTab })} />
          </div>
        </div>
        <p className="adm-hint">Leave label and URL empty to hide the button.</p>
      </fieldset>

      <AffiliateLinksEditor links={form.affiliateLinks} onChange={(links) => set("affiliateLinks", links)} />

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label="External link"
          type="url"
          value={form.externalLink}
          onChange={(event) => set("externalLink", event.target.value)}
        />
        <TextField label="Ads link" type="url" value={form.adsLink} onChange={(event) => set("adsLink", event.target.value)} />
      </div>

      <fieldset className="space-y-3">
        <legend className="adm-label">Article advertisement</legend>
        <Field label="Ad code" htmlFor="news-ad-code" hint="Script or HTML placed in this article only.">
          <textarea
            id="news-ad-code"
            rows={4}
            spellCheck={false}
            className="adm-textarea font-mono text-[12px]"
            value={form.advertisement.code}
            onChange={(event) => patchAd({ code: event.target.value })}
          />
        </Field>
        <div className="grid items-end gap-3 sm:grid-cols-2">
          <SelectField
            label="Position"
            placeholder="Default"
            options={POSITION_OPTIONS}
            value={form.advertisement.position}
            onChange={(event) => patchAd({ position: event.target.value })}
          />
          <div className="pb-1.5">
            <Toggle label="Enabled" checked={form.advertisement.enabled} onChange={(enabled) => patchAd({ enabled })} />
          </div>
        </div>
      </fieldset>
    </CollapsibleCard>
  );
}

type NewsAdvertisement = SectionProps["form"]["advertisement"];
