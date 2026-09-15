import type { NewsPayload } from "@/lib/api/admin";
import { toDateTimeInput } from "@/lib/format";
import { idOf, tagsOf } from "@/lib/news";
import type { AffiliateLink, Author, ContentBlock, Cta, ImageAsset, News, NewsStatus, Video } from "@/types/api";

export const STATUS_OPTIONS: { label: string; value: NewsStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Scheduled", value: "scheduled" },
  { label: "Archived", value: "archived" },
];

export const FLAG_FIELDS = [
  { key: "featured", label: "Featured" },
  { key: "trending", label: "Trending" },
  { key: "popular", label: "Popular" },
  { key: "breakingNews", label: "Breaking news" },
  { key: "editorsPick", label: "Editors' pick" },
  { key: "isMainTrending", label: "Main trending" },
] as const;

export type FlagKey = (typeof FLAG_FIELDS)[number]["key"];

export interface NewsFormState extends Record<FlagKey, boolean> {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  excerpt: string;
  content: string;

  status: NewsStatus;
  publishedDate: string;
  scheduledAt: string;

  category: string;
  subCategory: string;
  tags: string[];
  featuredImage?: ImageAsset;
  priority: number;
  author: Author;

  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  robots: string;
  ogImage?: ImageAsset;
  /** Comma separated in the form, an array in the payload. */
  seoKeywords: string;

  gallery: ImageAsset[];
  videos: Video[];

  cta: Cta;
  affiliateLinks: AffiliateLink[];
  externalLink: string;
  adsLink: string;
  advertisement: { code: string; position: string; enabled: boolean };

  sourceName: string;
  sourceUrl: string;
  /** One URL per line. */
  sourceLinks: string;

  language: string;
  country: string;
  region: string;
  destination: string;
  /** Empty means "let the API calculate it". */
  readTime: string;
}

export type SetField = <K extends keyof NewsFormState>(key: K, value: NewsFormState[K]) => void;

export interface SectionProps {
  form: NewsFormState;
  set: SetField;
}

export type FormErrors = Partial<Record<"title" | "category" | "description", string>>;

export const emptyForm = (): NewsFormState => ({
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  excerpt: "",
  content: "",
  status: "draft",
  publishedDate: "",
  scheduledAt: "",
  category: "",
  subCategory: "",
  tags: [],
  featuredImage: undefined,
  featured: false,
  trending: false,
  popular: false,
  breakingNews: false,
  editorsPick: false,
  isMainTrending: false,
  priority: 0,
  author: { name: "", designation: "", bio: "", email: "" },
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  robots: "index, follow",
  ogImage: undefined,
  seoKeywords: "",
  gallery: [],
  videos: [],
  cta: { label: "", url: "", style: "primary", openInNewTab: true },
  affiliateLinks: [],
  externalLink: "",
  adsLink: "",
  advertisement: { code: "", position: "", enabled: true },
  sourceName: "",
  sourceUrl: "",
  sourceLinks: "",
  language: "en",
  country: "",
  region: "",
  destination: "",
  readTime: "",
});

export function fromNews(news: News): NewsFormState {
  const base = emptyForm();
  const tagNames = tagsOf(news).map((tag) => tag.name);

  return {
    ...base,
    title: news.title || "",
    slug: news.slug || "",
    subtitle: news.subtitle || "",
    description: news.description || "",
    excerpt: news.excerpt || "",
    content: news.content || blocksToHtml(news.contentBlocks),
    status: news.status,
    publishedDate: toDateTimeInput(news.publishedDate),
    scheduledAt: toDateTimeInput(news.scheduledAt),
    category: idOf(news.category),
    subCategory: idOf(news.subCategory),
    tags: tagNames.length ? tagNames : news.tagNames || [],
    featuredImage: news.featuredImage?.url ? news.featuredImage : undefined,
    featured: Boolean(news.featured),
    trending: Boolean(news.trending),
    popular: Boolean(news.popular),
    breakingNews: Boolean(news.breakingNews),
    editorsPick: Boolean(news.editorsPick),
    isMainTrending: Boolean(news.isMainTrending),
    priority: news.priority || 0,
    author: { ...base.author, ...news.author },
    metaTitle: news.metaTitle || "",
    metaDescription: news.metaDescription || "",
    focusKeyword: news.focusKeyword || "",
    canonicalUrl: news.canonicalUrl || "",
    robots: news.robots || base.robots,
    ogImage: news.ogImage?.url ? news.ogImage : undefined,
    seoKeywords: (news.seoKeywords || []).join(", "),
    gallery: news.gallery || [],
    videos: news.videos || [],
    cta: { ...base.cta, ...news.cta },
    affiliateLinks: news.affiliateLinks || [],
    externalLink: news.externalLink || "",
    adsLink: news.adsLink || "",
    advertisement: {
      code: news.advertisement?.code || "",
      position: news.advertisement?.position || "",
      enabled: news.advertisement?.enabled ?? true,
    },
    sourceName: news.sourceName || "",
    sourceUrl: news.sourceUrl || "",
    sourceLinks: (news.sourceLinks || []).join("\n"),
    language: news.language || base.language,
    country: news.country || "",
    region: news.region || "",
    destination: news.destination || "",
  };
}

export function validate(form: NewsFormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.category) errors.category = "Choose a category";
  if (!form.description.trim()) errors.description = "Short description is required";
  return errors;
}

const splitList = (value: string, separator: RegExp) =>
  value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);

const localToIso = (value: string) => (value ? new Date(value).toISOString() : undefined);

const isFuture = (value: string) => Boolean(value) && new Date(value).getTime() > Date.now();

/**
 * Builds the request body. Edits send every managed field so cleared inputs
 * clear on the server; creates drop empty values.
 */
export function toPayload(form: NewsFormState, isCreate: boolean): NewsPayload {
  const readTime = Number(form.readTime);

  const payload: NewsPayload = {
    title: form.title.trim(),
    slug: form.slug.trim() || undefined,
    subtitle: form.subtitle,
    description: form.description.trim(),
    excerpt: form.excerpt,
    content: form.content,

    // the API also derives this, but only when the status field is absent
    status: isFuture(form.scheduledAt) ? "scheduled" : form.status,
    publishedDate: localToIso(form.publishedDate),
    scheduledAt: localToIso(form.scheduledAt) ?? null,

    category: form.category,
    subCategory: form.subCategory || null,
    tags: form.tags,
    // an empty object is how the API is told to remove an image
    featuredImage: form.featuredImage ?? {},

    featured: form.featured,
    trending: form.trending,
    popular: form.popular,
    breakingNews: form.breakingNews,
    editorsPick: form.editorsPick,
    isMainTrending: form.isMainTrending,
    priority: form.priority,
    author: form.author,

    metaTitle: form.metaTitle,
    metaDescription: form.metaDescription,
    focusKeyword: form.focusKeyword,
    canonicalUrl: form.canonicalUrl,
    robots: form.robots,
    ogImage: form.ogImage ?? {},
    seoKeywords: splitList(form.seoKeywords, /,/),

    gallery: form.gallery.filter((image) => image.url),
    videos: form.videos.filter((video) => video.url.trim()),

    cta: form.cta,
    affiliateLinks: form.affiliateLinks.filter((link) => link.title || link.link),
    externalLink: form.externalLink,
    adsLink: form.adsLink,
    advertisement: form.advertisement,

    sourceName: form.sourceName,
    sourceUrl: form.sourceUrl,
    sourceLinks: splitList(form.sourceLinks, /\n/),

    language: form.language,
    country: form.country,
    region: form.region,
    destination: form.destination,
    readTime: readTime > 0 ? readTime : undefined,
  };

  return isCreate ? compact(payload) : payload;
}

const isBlank = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0);

const compact = (payload: NewsPayload): NewsPayload =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => !isBlank(value))) as NewsPayload;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

export const moveItem = <T>(list: T[], from: number, to: number): T[] => {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export const replaceItem = <T>(list: T[], index: number, patch: Partial<T>): T[] =>
  list.map((item, i) => (i === index ? { ...item, ...patch } : item));

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const readString = (value: unknown) => (typeof value === "string" ? value : "");

const textToParagraphs = (text: string) =>
  splitList(text, /\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");

/**
 * Legacy articles store their body as contentBlocks. Converts the block types
 * that map cleanly onto the editor so they can be migrated to `content`;
 * anything else is dropped from the draft (the stored blocks are untouched).
 */
export function blocksToHtml(blocks: ContentBlock[] = []): string {
  return blocks
    .map((block) => {
      const meta = block.meta || {};
      switch (block.type) {
        case "text":
          return textToParagraphs(readString(block.value));
        case "html":
          // parsed by the editor's schema, and sanitised again by the API on save
          return readString(block.value);
        case "quote":
          return `<blockquote>${textToParagraphs(readString(block.value))}</blockquote>`;
        case "image": {
          const source = isRecord(block.value) ? block.value : {};
          const src = readString(block.value) || readString(source.url);
          if (!/^https?:\/\//i.test(src)) return "";
          const alt = readString(source.alt) || readString(meta.alt);
          return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
        }
        default:
          return "";
      }
    })
    .join("");
}
