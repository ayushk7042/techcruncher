"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import { Crosshair, Newspaper, X } from "lucide-react";
import { useState } from "react";
import { NewsPicker } from "@/components/admin/homepage/news-picker";
import { Card, Toggle } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { pad2 } from "@/lib/format";
import { newsHref } from "@/lib/news";
import type { ImageAsset } from "@/types/api";
import { IconButton } from "../controls";
import { replaceItem, type SectionProps } from "./news-form-state";

interface LinkValue {
  redirect: string;
  newTab: boolean;
}

const normalizeHref = (href: string) => (/^(https?:|\/)/i.test(href) ? href : `https://${href}`);

/** Site-relative links (another article's detail page) stay in the same tab by default. */
const isInternal = (href: string) => href.startsWith("/");

const assetLink = (image: ImageAsset): LinkValue => ({ redirect: image.redirectUrl || "", newTab: image.openInNewTab !== false });

/* ------------------------------------------------------------------ */
/* One image with its redirect link                                    */
/* ------------------------------------------------------------------ */

function ImageLinkRow({
  src,
  alt,
  title,
  note,
  value,
  onChange,
  onLocate,
  disabled = false,
  large = false,
}: {
  src: string;
  alt?: string;
  title: string;
  note?: string;
  value: LinkValue;
  onChange: (next: LinkValue) => void;
  onLocate?: () => void;
  disabled?: boolean;
  large?: boolean;
}) {
  const [picking, setPicking] = useState(false);

  // Finished links are normalised once, when the field loses focus or an article is picked.
  const commit = (raw: string) => {
    const trimmed = raw.trim();
    const redirect = trimmed ? normalizeHref(trimmed) : "";
    onChange({ redirect, newTab: redirect ? (isInternal(redirect) ? false : value.newTab) : true });
  };

  return (
    <li className="flex flex-wrap gap-3 p-3 sm:flex-nowrap">
      <img
        src={src}
        alt={alt || ""}
        className={cn("shrink-0 border border-line bg-raise object-contain", large ? "h-28 w-full sm:w-48" : "h-16 w-24")}
      />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="eyebrow shrink-0 text-ink">{title}</span>
          {note && <span className="meta clamp-1 min-w-0">{note}</span>}
        </div>

        <div className="flex gap-1.5">
          <input
            className="adm-input min-w-0 flex-1"
            placeholder="Redirect link — https://… or /news/article-slug"
            aria-label={`Redirect link for ${title}`}
            disabled={disabled}
            value={value.redirect}
            onChange={(event) => onChange({ ...value, redirect: event.target.value })}
            onBlur={(event) => commit(event.target.value)}
          />
          <button
            type="button"
            className={cn("adm-btn adm-btn-sm shrink-0", picking && "border-ink")}
            disabled={disabled}
            aria-expanded={picking}
            onClick={() => setPicking(!picking)}
          >
            <Newspaper className="h-3 w-3" aria-hidden="true" /> Article
          </button>
        </div>

        {picking && !disabled && (
          <NewsPicker
            label="Link to an article's detail page"
            max={1}
            value={[]}
            onChange={([news]) => {
              if (!news) return;
              commit(newsHref(news));
              setPicking(false);
            }}
          />
        )}

        {value.redirect && (
          <Toggle label="Open in a new tab" checked={value.newTab} disabled={disabled} onChange={(newTab) => onChange({ ...value, newTab })} />
        )}
      </div>

      <div className="flex shrink-0 items-start gap-0.5">
        {onLocate && <IconButton label={`Show ${title} in the editor`} icon={Crosshair} disabled={disabled} onClick={onLocate} />}
        <IconButton
          label={`Remove link from ${title}`}
          icon={X}
          disabled={disabled || !value.redirect}
          onClick={() => onChange({ redirect: "", newTab: true })}
        />
      </div>
    </li>
  );
}

function Group({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="eyebrow text-ink">{title}</h3>
      <p className="adm-hint mt-1">{hint}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Body images live in the editor document                             */
/* ------------------------------------------------------------------ */

interface BodyImage {
  pos: number;
  src: string;
  alt: string;
  redirect: string;
  newTab: boolean;
}

function readBodyImages(editor: Editor | null): BodyImage[] {
  const images: BodyImage[] = [];
  editor?.state.doc.descendants((node, pos) => {
    if (node.type.name !== "image") return;
    images.push({
      pos,
      src: String(node.attrs.src || ""),
      alt: String(node.attrs.alt || ""),
      redirect: String(node.attrs.redirect || ""),
      newTab: node.attrs.newTab !== false,
    });
  });
  return images;
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

/**
 * Every image the article uses, main image first, each with its own
 * click-through link. Main and gallery images write to the form; body images
 * write straight into the editor document (as `data-redirect`).
 */
export function ArticleImagesCard({ form, set, editor, htmlMode }: SectionProps & { editor: Editor | null; htmlMode: boolean }) {
  const bodyImages = useEditorState({ editor, selector: ({ editor: current }) => readBodyImages(current) }) ?? [];

  // No focus change, so typing in a link field keeps its caret.
  const updateBody = (pos: number, next: LinkValue) => {
    editor
      ?.chain()
      .command(({ tr }) => {
        const node = tr.doc.nodeAt(pos);
        if (!node || node.type.name !== "image") return false;
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, redirect: next.redirect || null, newTab: next.newTab });
        return true;
      })
      .run();
  };

  const main = form.featuredImage?.url ? form.featuredImage : undefined;
  const gallery = form.gallery.filter((image) => image.url);

  // With no main image set, the site falls back to the first image it can find — say which.
  const fallback = main
    ? undefined
    : form.ogImage?.url
      ? { url: form.ogImage.url, alt: form.ogImage.alt, source: "the SEO / social image" }
      : gallery[0]
        ? { url: gallery[0].url!, alt: gallery[0].alt, source: "the gallery" }
        : bodyImages[0]
          ? { url: bodyImages[0].src, alt: bodyImages[0].alt, source: "the article body" }
          : undefined;

  const total = (main ? 1 : 0) + bodyImages.length + gallery.length;
  const linked =
    (main?.redirectUrl ? 1 : 0) + bodyImages.filter((image) => image.redirect).length + gallery.filter((image) => image.redirectUrl).length;

  return (
    <Card
      title={total ? `Article images (${total})` : "Article images"}
      actions={total > 0 && <span className="meta">{linked} linked</span>}
      bodyClassName="space-y-6"
    >
      <p className="adm-hint mt-0">
        Clicking an image on the article page opens its redirect link. Paste any URL, or pick an article to send readers to its
        news detail page.
      </p>

      <Group title="Main image" hint="Shown at the top of the article and on homepage and section cards. Change the image itself in the Featured image card.">
        {main ? (
          <ol className="border border-line">
            <ImageLinkRow
              large
              src={main.url!}
              alt={main.alt}
              title="Main image"
              note={main.alt || main.caption}
              value={assetLink(main)}
              onChange={(next) => set("featuredImage", { ...main, redirectUrl: next.redirect, openInNewTab: next.newTab })}
            />
          </ol>
        ) : fallback ? (
          <div className="flex flex-wrap items-center gap-3 border border-dashed border-line-strong p-3">
            <img src={fallback.url} alt={fallback.alt || ""} className="h-20 w-32 shrink-0 bg-raise object-contain" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-ink">No main image is set, so the site uses this one from {fallback.source}.</p>
              <button
                type="button"
                className="adm-btn adm-btn-sm mt-2"
                onClick={() => set("featuredImage", { url: fallback.url, alt: fallback.alt || "" })}
              >
                Use as main image
              </button>
            </div>
          </div>
        ) : (
          <p className="border border-dashed border-line-strong p-3 text-[13px] text-ink-mute">
            No main image yet. Add one in the Featured image card.
          </p>
        )}
      </Group>

      <Group
        title={`Images in the body (${bodyImages.length})`}
        hint={htmlMode ? "Switch the body back to the visual editor to edit these links." : "In the order they appear in the article."}
      >
        {bodyImages.length ? (
          <ol className="divide-y divide-line border border-line">
            {bodyImages.map((image, index) => (
              <ImageLinkRow
                key={`${image.pos}-${image.src}`}
                src={image.src}
                alt={image.alt}
                title={`Body image ${pad2(index + 1)}`}
                note={image.alt || image.src.split("/").pop()}
                value={{ redirect: image.redirect, newTab: image.newTab }}
                disabled={htmlMode}
                onChange={(next) => updateBody(image.pos, next)}
                onLocate={() => editor?.chain().focus().setNodeSelection(image.pos).scrollIntoView().run()}
              />
            ))}
          </ol>
        ) : (
          <p className="text-[13px] text-ink-mute">No images in the body.</p>
        )}
      </Group>

      <Group title={`Gallery images (${gallery.length})`} hint="Shown in the Gallery section under the article. Add or reorder them in the Media card.">
        {gallery.length ? (
          <ol className="divide-y divide-line border border-line">
            {form.gallery.map((image, index) =>
              image.url ? (
                <ImageLinkRow
                  key={`${image.url}-${index}`}
                  src={image.url}
                  alt={image.alt}
                  title={`Gallery image ${pad2(index + 1)}`}
                  note={image.caption || image.alt}
                  value={assetLink(image)}
                  onChange={(next) => set("gallery", replaceItem(form.gallery, index, { redirectUrl: next.redirect, openInNewTab: next.newTab }))}
                />
              ) : null,
            )}
          </ol>
        ) : (
          <p className="text-[13px] text-ink-mute">No gallery images.</p>
        )}
      </Group>
    </Card>
  );
}
