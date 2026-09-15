import type {
  Advertisement,
  Category,
  Device,
  Envelope,
  HomeFeed,
  Homepage,
  News,
  NewsListParams,
  Paginated,
  Tag,
} from "@/types/api";
import { request, type RequestOptions } from "./client";

/**
 * Public (unauthenticated) endpoints. Safe to call from server components and
 * from the browser; server callers pass `revalidate` / `cache`.
 */

type Cache = Pick<RequestOptions, "revalidate" | "cache" | "signal">;

const listQuery = (params: NewsListParams) => ({
  ...params,
  featured: params.featured === undefined ? undefined : String(params.featured),
  trending: params.trending === undefined ? undefined : String(params.trending),
  popular: params.popular === undefined ? undefined : String(params.popular),
  breaking: params.breaking === undefined ? undefined : String(params.breaking),
  editorsPick: params.editorsPick === undefined ? undefined : String(params.editorsPick),
});

export const publicApi = {
  /* ---------------- news ---------------- */

  homeFeed: (opts: Cache = {}) =>
    request<Envelope<HomeFeed>>("/news/homefeed", opts).then((r) => r.data),

  listNews: (params: NewsListParams = {}, opts: Cache = {}) =>
    request<Paginated<News>>("/news/list", { ...opts, query: listQuery(params) }),

  searchNews: (q: string, limit = 8, opts: Cache = {}) =>
    request<Envelope<News[]>>("/news/search", { ...opts, query: { q, limit } }).then((r) => r.data),

  newsBySlug: (slug: string, opts: Cache = {}) =>
    request<News>(`/news/${encodeURIComponent(slug)}`, opts),

  relatedNews: (slug: string, limit = 6, opts: Cache = {}) =>
    request<Envelope<News[]>>(`/news/related/${encodeURIComponent(slug)}`, {
      ...opts,
      query: { limit },
    }).then((r) => r.data),

  likeNews: (slug: string, unlike = false) =>
    request<{ success: boolean; likes: number }>(`/news/${encodeURIComponent(slug)}/like`, {
      method: "POST",
      body: { unlike },
    }),

  shareNews: (slug: string) =>
    request<{ success: boolean; shareCount: number }>(`/news/${encodeURIComponent(slug)}/share`, {
      method: "POST",
    }),

  /* ---------------- taxonomy ---------------- */

  categories: (
    params: { withCounts?: boolean; withCover?: boolean; showInMenu?: boolean; parent?: string } = {},
    opts: Cache = {},
  ) =>
    request<Category[]>("/categories", {
      ...opts,
      query: {
        withCounts: params.withCounts ? "true" : undefined,
        withCover: params.withCover ? "true" : undefined,
        showInMenu: params.showInMenu ? "true" : undefined,
        parent: params.parent,
      },
    }),

  category: (idOrSlug: string, opts: Cache = {}) =>
    request<Envelope<Category>>(`/categories/${encodeURIComponent(idOrSlug)}`, opts).then((r) => r.data),

  tags: (params: { limit?: number; sort?: "popular" | "name" | "latest"; featured?: boolean } = {}, opts: Cache = {}) =>
    request<Paginated<Tag>>("/tags", {
      ...opts,
      query: { ...params, featured: params.featured ? "true" : undefined },
    }),

  tag: (idOrSlug: string, opts: Cache = {}) =>
    request<Envelope<Tag>>(`/tags/${encodeURIComponent(idOrSlug)}`, opts).then((r) => r.data),

  /* ---------------- homepage ---------------- */

  homepage: (opts: Cache = {}) => request<Homepage>("/homepage", opts),

  /* ---------------- ads ---------------- */

  serveAds: (position: string, device?: Device, category?: string, opts: Cache = {}) =>
    request<Envelope<Advertisement[]>>("/ads/serve", {
      ...opts,
      query: { position, device, category },
    }).then((r) => r.data),

  trackAdImpression: (id: string) => request(`/ads/${id}/impression`, { method: "POST" }),
  trackAdClick: (id: string) => request(`/ads/${id}/click`, { method: "POST" }),

  /* ---------------- reader actions ---------------- */

  subscribe: (email: string, source: string) =>
    request<Envelope<{ email: string; status: string }>>("/newsletter/subscribe", {
      method: "POST",
      body: { email, source },
    }),

  unsubscribe: (email: string) =>
    request<{ success: boolean; message: string }>("/newsletter/unsubscribe", {
      method: "POST",
      body: { email },
    }),

  contact: (payload: { name: string; email: string; subject?: string; message: string }) =>
    request("/contact", { method: "POST", body: payload }),
};
