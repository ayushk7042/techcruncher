"use client";

import type { RailKey } from "@/types/api";
import { Card, Toggle } from "../ui";
import { NewsPicker } from "./news-picker";
import { RAIL_LIMITS, type RailDraft } from "./state";
import { TextTabs } from "../controls";

/** Display order and what each rail drives on the public homepage. */
export const RAILS: { key: RailKey; label: string; drives: string }[] = [
  { key: "hero", label: "Hero lead slides", drives: "The lead slides of the top slider." },
  { key: "heroRail", label: "Hero remaining slides", drives: "The slides that follow the leads in the top slider." },
  { key: "featured", label: "Featured reporting", drives: "The “Featured reporting” band." },
  { key: "editorsPicks", label: "Editors' picks", drives: "The “Editors' picks” rail." },
  { key: "popular", label: "Most read", drives: "The “Most read” rail." },
  { key: "latest", label: "Latest lead", drives: "The lead stories of the latest band." },
  { key: "dontMiss", label: "The long read", drives: "The “The long read” band." },
  { key: "moreStories", label: "More from the newsroom", drives: "The “More from the newsroom” list." },
];

const MODE_OPTIONS = [
  { label: "Auto", value: "auto" as const },
  { label: "Manual", value: "manual" as const },
];

export function RailCard({
  railKey,
  label,
  drives,
  value,
  onChange,
  disabled,
}: {
  railKey: RailKey;
  label: string;
  drives: string;
  value: RailDraft;
  onChange: (value: RailDraft) => void;
  disabled: boolean;
}) {
  const limit = RAIL_LIMITS[railKey];
  const kept = value.items.length;

  return (
    <Card title={label} actions={<span className="meta tabular-nums">Max {limit}</span>}>
      <p className="text-[13px] text-ink-soft">{drives}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <Toggle label="Enabled" checked={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} disabled={disabled} />
        <TextTabs
          label={`${label} source`}
          options={MODE_OPTIONS}
          value={value.mode}
          onChange={(mode) => onChange({ ...value, mode })}
          disabled={disabled || !value.enabled}
        />
      </div>

      {!value.enabled ? (
        <p className="adm-hint mt-4">Hidden on the public homepage.</p>
      ) : value.mode === "manual" ? (
        <div className="mt-4">
          <NewsPicker
            label="Curated stories"
            max={limit}
            value={value.items}
            onChange={(items) => onChange({ ...value, items })}
            disabled={disabled}
            hint="Shown in this order. Empty slots fall back to the live feed."
          />
        </div>
      ) : (
        <p className="adm-hint mt-4">
          Filled from the live feed.
          {kept > 0 && ` ${kept} curated ${kept === 1 ? "story is" : "stories are"} kept for when you switch back to manual.`}
        </p>
      )}
    </Card>
  );
}
