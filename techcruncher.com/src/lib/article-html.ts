import "server-only";

import DOMPurify from "isomorphic-dompurify";
import type { ContentBlock, News } from "@/types/api";
import { site } from "@/config/site";
import { videoEmbed } from "./image";
import { stripHtml } from "./news";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const siteHost = (() => {
  try {
    return new URL(site.url).host;
  } catch {
    return "";
  }
})();

// Outbound links open in a new tab and never leak the opener.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName !== "A") return;
  const href = node.getAttribute("href") || "";
  if (/^https?:\/\//i.test(href) && !href.includes(siteHost)) {
    node.setAttribute("target", "_blank");
    const rel = new Set((node.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noopener");
    rel.add("noreferrer");
    node.setAttribute("rel", [...rel].join(" "));
  }
});

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const str = (value: unknown) => (typeof value === "string" ? value : "");

/** Legacy articles store their body as typed blocks instead of HTML. */
function blocksToHtml(blocks: ContentBlock[] = []): string {
  return blocks
    .map((block) => {
      const value = block.value;
      const data = asRecord(value);

      switch (block.type) {
        case "text": {
          const text = str(value);
          if (/<[a-z][\s\S]*>/i.test(text)) return text;
          return text
            .split(/\n{2,}/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
            .join("");
        }
        case "html":
        case "embed":
          return str(value) || str(data.html) || str(data.code);
        case "quote":
          return `<blockquote><p>${escapeHtml(str(value) || str(data.text))}</p></blockquote>`;
        case "image": {
          const url = str(value) || str(data.url);
          if (!url) return "";
          const caption = str(data.caption) || str(block.meta?.caption);
          const redirect = str(data.redirectUrl) || str(block.redirectUrl);
          return `<figure><img src="${escapeHtml(url)}" alt="${escapeHtml(str(data.alt) || caption)}"${
            redirect ? ` data-redirect="${escapeHtml(redirect)}"` : ""
          }>${
            caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""
          }</figure>`;
        }
        case "link": {
          const url = str(value) || str(data.url) || str(data.link);
          const label = str(data.text) || str(data.title) || url;
          return url ? `<p><a href="${escapeHtml(url)}">${escapeHtml(label)}</a></p>` : "";
        }
        case "affiliate": {
          const url = str(data.link) || str(data.url);
          const label = str(data.buttonText) || str(data.title) || "View deal";
          return url ? `<p><a href="${escapeHtml(url)}" rel="sponsored nofollow">${escapeHtml(label)}</a></p>` : "";
        }
        case "video": {
          const url = str(value) || str(data.url);
          if (!url) return "";
          const embed = videoEmbed(url);
          return embed.kind === "iframe"
            ? `<iframe src="${embed.src}" title="Video" loading="lazy" allowfullscreen></iframe>`
            : `<video src="${escapeHtml(url)}" controls preload="metadata"></video>`;
        }
        default:
          return "";
      }
    })
    .join("\n");
}

/**
 * Body images carry their click-through link as `data-redirect` (set in the
 * admin editor). An optional `<a …>` right before the image is captured so an
 * image that is already a link is left alone instead of nesting anchors.
 */
const IMAGE_WITH_REDIRECT = /(<a\b[^>]*>\s*)?(<img\b[^>]*?\sdata-redirect="([^"]*)"[^>]*>)/gi;

// Only web and site-relative links; the attribute is already entity-escaped by the sanitiser.
const SAFE_REDIRECT = /^(https?:\/\/|\/(?!\/))/i;

function linkImage(match: string, openAnchor: string | undefined, img: string, href: string): string {
  if (openAnchor || !SAFE_REDIRECT.test(href.trim())) return match;
  const newTab = !/\sdata-new-tab="false"/i.test(img);
  const attrs = newTab ? ' target="_blank" rel="noopener noreferrer nofollow"' : "";
  return `<a href="${href.trim()}"${attrs} class="image-link">${img}</a>`;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) || "section";

/**
 * Produces the sanitised article body plus a table of contents. h2/h3 get
 * stable ids, and tables are wrapped so they scroll instead of overflowing.
 */
export function renderArticleHtml(news: Pick<News, "content" | "contentBlocks" | "description">): {
  html: string;
  toc: TocItem[];
} {
  const source = news.content?.trim() ? news.content : blocksToHtml(news.contentBlocks);
  const raw = source?.trim() ? source : `<p>${escapeHtml(stripHtml(news.description || ""))}</p>`;

  const clean = DOMPurify.sanitize(raw, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "target", "loading", "rel"],
    FORBID_TAGS: ["style", "form", "input", "button"],
  });

  const toc: TocItem[] = [];
  const seen = new Map<string, number>();

  const html = clean
    .replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level: string, attrs: string, inner: string) => {
      const text = stripHtml(inner);
      if (!text) return match;
      const existing = attrs.match(/\sid="([^"]+)"/)?.[1];
      let id = existing || slugify(text);
      if (!existing) {
        const count = seen.get(id) || 0;
        seen.set(id, count + 1);
        if (count) id = `${id}-${count + 1}`;
      }
      toc.push({ id, text, level: Number(level) as 2 | 3 });
      return existing ? match : `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    })
    .replace(IMAGE_WITH_REDIRECT, linkImage)
    .replace(/<table/gi, '<div class="table-scroll"><table')
    .replace(/<\/table>/gi, "</table></div>");

  return { html, toc };
}
