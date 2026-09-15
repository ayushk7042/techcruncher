"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { pad2 } from "@/lib/format";
import { ImageField } from "../image-field";
import { TextField, Toggle } from "../ui";
import { IconButton, TextTabs } from "../controls";
import { NewsPicker } from "./news-picker";
import { emptyTile, GALLERY_TILES, type GalleryDraft, type GalleryTileDraft } from "./state";

const SOURCE_OPTIONS = [
  { label: "Auto", value: "auto" as const },
  { label: "Manual", value: "manual" as const },
];

const KIND_OPTIONS = [
  { label: "Article", value: "article" as const },
  { label: "Custom", value: "custom" as const },
];

export function GalleryEditor({
  value,
  onChange,
  disabled,
}: {
  value: GalleryDraft;
  onChange: (value: GalleryDraft) => void;
  disabled: boolean;
}) {
  const set = <K extends keyof GalleryDraft>(key: K, next: GalleryDraft[K]) => onChange({ ...value, [key]: next });
  const setItems = (items: GalleryTileDraft[]) => set("items", items);
  const patchTile = (key: string, next: Partial<GalleryTileDraft>) =>
    setItems(value.items.map((tile) => (tile.key === key ? { ...tile, ...next } : tile)));

  function move(index: number, offset: -1 | 1) {
    const items = [...value.items];
    [items[index], items[index + offset]] = [items[index + offset], items[index]];
    setItems(items);
  }

  return (
    <div className="space-y-6">
      <Toggle
        label="Show the gallery block"
        checked={value.enabled}
        onChange={(enabled) => set("enabled", enabled)}
        disabled={disabled}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Title" value={value.title} onChange={(e) => set("title", e.target.value)} disabled={disabled} />
        <TextField label="Subtitle" value={value.subtitle} onChange={(e) => set("subtitle", e.target.value)} disabled={disabled} />
        <TextField
          label="Action label"
          value={value.actionLabel}
          onChange={(e) => set("actionLabel", e.target.value)}
          disabled={disabled}
        />
        <TextField
          label="Action link"
          value={value.actionLink}
          onChange={(e) => set("actionLink", e.target.value)}
          placeholder="/gallery"
          disabled={disabled}
        />
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="adm-label mb-0">Tiles</span>
          <TextTabs label="Gallery tile source" options={SOURCE_OPTIONS} value={value.source} onChange={(source) => set("source", source)} disabled={disabled} />
        </div>
        <p className="adm-hint">
          {value.source === "auto"
            ? "Tiles are filled from the live feed. Curated tiles below are kept for manual mode."
            : `Up to ${GALLERY_TILES} tiles, shown in this order. A tile with no article, image or title is dropped on save.`}
        </p>
      </div>

      {value.source === "manual" && (
        <div className="space-y-6">
          {value.items.map((tile, index) => (
            <div key={tile.key} className="border-t-2 border-ink pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="eyebrow text-ink">Tile {pad2(index + 1)}</span>
                <TextTabs
                  label={`Tile ${index + 1} type`}
                  options={KIND_OPTIONS}
                  value={tile.kind}
                  onChange={(kind) => patchTile(tile.key, kind === "custom" ? { kind, article: null } : { kind })}
                  disabled={disabled}
                />
                {!disabled && (
                  <div className="flex items-center">
                    <IconButton label={`Move tile ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </IconButton>
                    <IconButton
                      label={`Move tile ${index + 1} down`}
                      disabled={index === value.items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </IconButton>
                    <IconButton label={`Remove tile ${index + 1}`} onClick={() => setItems(value.items.filter((item) => item.key !== tile.key))}>
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </IconButton>
                  </div>
                )}
              </div>

              {tile.kind === "article" ? (
                <div className="mt-4 space-y-4">
                  <NewsPicker
                    label="Article"
                    max={1}
                    value={tile.article ? [tile.article] : []}
                    onChange={(list) => patchTile(tile.key, { article: list[0] ?? null })}
                    disabled={disabled}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TileOverride label="Title override" value={tile.title} onChange={(title) => patchTile(tile.key, { title })} disabled={disabled} />
                    <TileOverride label="Image URL override" value={tile.image} onChange={(image) => patchTile(tile.key, { image })} disabled={disabled} />
                    <TileOverride
                      label="Category label override"
                      value={tile.category}
                      onChange={(category) => patchTile(tile.key, { category })}
                      disabled={disabled}
                    />
                    <TileOverride label="Link override" value={tile.link} onChange={(link) => patchTile(tile.key, { link })} disabled={disabled} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <ImageField
                      label="Image"
                      folder="homepage"
                      withMeta={false}
                      value={tile.image ? { url: tile.image } : undefined}
                      onChange={(image) => patchTile(tile.key, { image: image?.url ?? "" })}
                    />
                  </div>
                  <TextField label="Title" value={tile.title} onChange={(e) => patchTile(tile.key, { title: e.target.value })} disabled={disabled} />
                  <TextField
                    label="Category label"
                    value={tile.category}
                    onChange={(e) => patchTile(tile.key, { category: e.target.value })}
                    disabled={disabled}
                  />
                  <TextField
                    className="sm:col-span-2"
                    label="Link"
                    value={tile.link}
                    placeholder="https:// or /path"
                    onChange={(e) => patchTile(tile.key, { link: e.target.value })}
                    disabled={disabled}
                  />
                </div>
              )}
            </div>
          ))}

          {!disabled && value.items.length < GALLERY_TILES && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="adm-btn" onClick={() => setItems([...value.items, emptyTile("article")])}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Article tile
              </button>
              <button type="button" className="adm-btn" onClick={() => setItems([...value.items, emptyTile("custom")])}>
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Custom tile
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TileOverride({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  return (
    <TextField label={label} value={value} placeholder="Uses the article's" onChange={(e) => onChange(e.target.value)} disabled={disabled} />
  );
}
