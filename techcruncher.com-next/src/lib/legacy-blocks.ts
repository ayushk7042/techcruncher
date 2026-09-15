import type { ContentBlock } from "@/types/api";
import { videoEmbed } from "./image";

/**
 * Converts the typed `contentBlocks` body of articles created by the original
 * admin panel into HTML. Client-safe: the output is unsanitised, so server
 * renderers must sanitise it and the editor re-parses it through its schema.
 */

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const textToHtml = (text: string) => {
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
};

const sponsoredLink = (href: string, inner: string) =>
  `<a href="${escapeHtml(href)}" rel="sponsored nofollow noopener" target="_blank">${inner}</a>`;

function blockBody(block: ContentBlock): string {
  const value = block.value;
  const data = asRecord(value);

  switch (block.type) {
    case "text":
      return textToHtml(str(value) || str(data.text));
    case "html":
    case "embed":
      return str(value) || str(data.html) || str(data.code);
    case "quote":
      return `<blockquote><p>${escapeHtml(str(value) || str(data.text))}</p></blockquote>`;
    case "image": {
      const url = str(value) || str(data.url);
      if (!url) return "";
      const caption = str(data.caption) || str(block.meta?.caption);
      const img = `<img src="${escapeHtml(url)}" alt="${escapeHtml(str(data.alt) || str(block.meta?.alt) || caption)}">`;
      const redirect = str(block.redirectUrl);
      return `<figure>${redirect ? sponsoredLink(redirect, img) : img}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`;
    }
    case "link": {
      const url = str(value) || str(data.url) || str(data.link);
      const label = str(data.text) || str(data.title) || url;
      return url ? `<p><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></p>` : "";
    }
    case "affiliate": {
      const url = str(value) || str(data.link) || str(data.url) || str(block.redirectUrl);
      const label = str(data.buttonText) || str(data.title) || "View deal";
      return url ? `<p>${sponsoredLink(url, escapeHtml(label))}</p>` : "";
    }
    case "video": {
      const url = str(value) || str(data.url);
      if (!url) return "";
      const embed = videoEmbed(url);
      return embed.kind === "iframe"
        ? `<iframe src="${escapeHtml(embed.src)}" title="Video" loading="lazy" allowfullscreen></iframe>`
        : `<video src="${escapeHtml(url)}" controls preload="metadata"></video>`;
    }
    default:
      return "";
  }
}

export function blocksToHtml(blocks: ContentBlock[] = []): string {
  return blocks
    .map((block) => {
      const body = blockBody(block);
      const heading = str(block.heading);
      return heading ? `<h2>${escapeHtml(heading)}</h2>${body}` : body;
    })
    .filter(Boolean)
    .join("\n");
}
