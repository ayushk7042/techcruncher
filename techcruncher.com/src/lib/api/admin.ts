import type {
  Advertisement,
  Category,
  ContactMessage,
  DashboardStats,
  Envelope,
  Homepage,
  ImageAsset,
  ImportJob,
  LoginResponse,
  MediaItem,
  News,
  NewsListParams,
  NewsStatus,
  Paginated,
  Subscriber,
  Tag,
} from "@/types/api";
import { request, requestRaw } from "./client";

/**
 * Authenticated endpoints used by the admin panel. Every call sends the bearer
 * token; a 401 fires UNAUTHORIZED_EVENT and the auth provider signs out.
 */

const auth = { auth: true } as const;

/** Payload accepted by POST /news and PUT /news/id/:id (see newsPayload.service). */
export type NewsPayload = Partial<Omit<News, "_id" | "category" | "subCategory" | "tags" | "relatedNews" | "image">> & {
  category?: string;
  subCategory?: string | null;
  tags?: string[];
  relatedNews?: string[];
  /** Legacy lead image; null clears it. */
  image?: ImageAsset | null;
};

export type CategoryPayload = Partial<Omit<Category, "_id" | "children" | "articleCount" | "coverImage">>;
export type AdPayload = Partial<Omit<Advertisement, "_id" | "categories" | "impressions" | "clicks">> & {
  categories?: string[];
};

export interface HomepagePayload {
  mainTrending?: string | null;
  subTrending?: string[];
  categorySections?: { category: string; trending: string | null; subTrending: string[] }[];
  customHomeBlocks?: Homepage["customHomeBlocks"];
  gallery?: Omit<Homepage["gallery"], "items"> & {
    items: { article: string | null; image: string; title: string; category: string; link: string; order: number }[];
  };
  sections?: Record<string, { enabled: boolean; mode: "auto" | "manual"; items: string[] }>;
}

export const adminApi = {
  /* ---------------- auth ---------------- */

  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: { email, password } }),

  /* ---------------- dashboard ---------------- */

  dashboard: () => request<DashboardStats>("/dashboard", auth),

  runAutoNews: () => request<{ message: string; count: number }>("/auto-news/run", { ...auth, method: "POST" }),

  /* ---------------- news ---------------- */

  listNews: (params: NewsListParams = {}, signal?: AbortSignal) =>
    request<Paginated<News>>("/news/list", { ...auth, signal, query: { ...params } }),

  getNews: (id: string) => request<News>(`/news/id/${id}`, auth),

  createNews: (payload: NewsPayload) => request<News>("/news", { ...auth, method: "POST", body: payload }),

  updateNews: (id: string, payload: NewsPayload) =>
    request<News>(`/news/id/${id}`, { ...auth, method: "PUT", body: payload }),

  changeStatus: (id: string, status: NewsStatus) =>
    request<Envelope<News>>(`/news/${id}/status`, { ...auth, method: "PATCH", body: { status } }),

  duplicateNews: (id: string) => request<Envelope<News>>(`/news/${id}/duplicate`, { ...auth, method: "POST" }),

  trashNews: (id: string) => request<{ success: boolean }>(`/news/${id}/trash`, { ...auth, method: "POST" }),

  restoreNews: (id: string, status: NewsStatus = "draft") =>
    request<Envelope<News>>(`/news/${id}/restore`, { ...auth, method: "POST", body: { status } }),

  deleteNews: (id: string) => request<{ message: string }>(`/news/${id}`, { ...auth, method: "DELETE" }),

  bulkStatus: (ids: string[], status: NewsStatus) =>
    request<{ modified: number }>("/news/bulk/status", { ...auth, method: "POST", body: { ids, status } }),

  /** Sub-categories are left untouched on the server when `subCategory` is omitted. */
  bulkCategory: (ids: string[], category: string) =>
    request<{ modified: number }>("/news/bulk/category", { ...auth, method: "POST", body: { ids, category } }),

  bulkTags: (ids: string[], tags: string[], mode: "add" | "replace" | "remove") =>
    request<{ modified: number }>("/news/bulk/tags", { ...auth, method: "POST", body: { ids, tags, mode } }),

  bulkFlags: (ids: string[], flags: Partial<Record<string, boolean>>) =>
    request<{ modified: number }>("/news/bulk/flags", { ...auth, method: "POST", body: { ids, flags } }),

  bulkDelete: (ids: string[], hard = false) =>
    request<{ modified?: number; deleted?: number }>("/news/bulk/delete", {
      ...auth,
      method: "POST",
      body: { ids, hard },
    }),

  facets: () =>
    request<Envelope<{ regions: string[]; countries: string[]; languages: string[]; authors: string[]; destinations: string[] }>>(
      "/news/facets",
    ).then((r) => r.data),

  /* ---------------- categories ---------------- */

  categories: () => request<Category[]>("/categories", { ...auth, query: { status: "all", withCounts: "true" } }),

  createCategory: (payload: CategoryPayload) =>
    request<Category>("/categories", { ...auth, method: "POST", body: payload }),

  updateCategory: (id: string, payload: CategoryPayload) =>
    request<Category>(`/categories/${id}`, { ...auth, method: "PUT", body: payload }),

  toggleCategoryVisibility: (id: string, patch: Partial<Pick<Category, "hidden" | "status" | "showOnHome" | "showInMenu" | "showInFooter" | "featured">>) =>
    request<Envelope<Category>>(`/categories/${id}/visibility`, { ...auth, method: "PATCH", body: patch }),

  reorderCategories: (items: { id: string; order: number; parent?: string | null }[]) =>
    request<{ success: boolean }>("/categories/reorder", { ...auth, method: "POST", body: { items } }),

  /** 409 when in use; pass force + moveTo to reassign articles. */
  deleteCategory: (id: string, options: { force?: boolean; moveTo?: string } = {}) =>
    request<{ message: string }>(`/categories/${id}`, {
      ...auth,
      method: "DELETE",
      query: { force: options.force ? "true" : undefined, moveTo: options.moveTo },
    }),

  /* ---------------- tags ---------------- */

  tags: (params: { page?: number; limit?: number; search?: string; sort?: string; status?: string } = {}) =>
    request<Paginated<Tag>>("/tags", { ...auth, query: { status: "all", ...params } }),

  createTag: (payload: Partial<Tag>) => request<Envelope<Tag>>("/tags", { ...auth, method: "POST", body: payload }),

  updateTag: (id: string, payload: Partial<Tag>) =>
    request<Envelope<Tag>>(`/tags/${id}`, { ...auth, method: "PUT", body: payload }),

  deleteTag: (id: string) => request<{ success: boolean }>(`/tags/${id}`, { ...auth, method: "DELETE" }),

  bulkDeleteTags: (ids: string[]) =>
    request<{ deleted: number }>("/tags/bulk-delete", { ...auth, method: "POST", body: { ids } }),

  mergeTags: (sourceIds: string[], targetId: string) =>
    request<Envelope<Tag>>("/tags/merge", { ...auth, method: "POST", body: { sourceIds, targetId } }),

  recountTags: () => request<{ message: string }>("/tags/recount", { ...auth, method: "POST" }),

  /* ---------------- media ---------------- */

  media: (params: { page?: number; limit?: number; search?: string; folder?: string; type?: string } = {}) =>
    request<Paginated<MediaItem>>("/media", { ...auth, query: params }),

  mediaFolders: () => request<Envelope<{ name: string; count: number }[]>>("/media/folders", auth).then((r) => r.data),

  uploadMedia: (file: File, meta: { folder?: string; alt?: string; caption?: string; name?: string } = {}) => {
    const form = new FormData();
    // multer reads text fields that arrive before the file
    Object.entries(meta).forEach(([key, value]) => value && form.append(key, value));
    form.append("file", file);
    return request<Envelope<MediaItem>>("/media/upload", { ...auth, method: "POST", form, query: { folder: meta.folder } });
  },

  uploadMediaMany: (files: File[], folder?: string) => {
    const form = new FormData();
    if (folder) form.append("folder", folder);
    files.forEach((file) => form.append("files", file));
    return request<{ success: boolean; count: number; data: MediaItem[] }>("/media/upload-multiple", {
      ...auth,
      method: "POST",
      form,
      query: { folder },
    });
  },

  registerMedia: (payload: Partial<MediaItem> & { url: string }) =>
    request<Envelope<MediaItem>>("/media/register", { ...auth, method: "POST", body: payload }),

  updateMedia: (id: string, payload: Partial<MediaItem>) =>
    request<Envelope<MediaItem>>(`/media/${id}`, { ...auth, method: "PUT", body: payload }),

  replaceMedia: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Envelope<MediaItem>>(`/media/${id}/replace`, { ...auth, method: "PUT", form });
  },

  /** 409 while an article still uses the file; pass force to delete anyway. */
  deleteMedia: (id: string, force = false) =>
    request<{ success: boolean }>(`/media/${id}`, {
      ...auth,
      method: "DELETE",
      query: { force: force ? "true" : undefined },
    }),

  bulkDeleteMedia: (ids: string[], force = false) =>
    request<{ deleted: number }>("/media/bulk-delete", {
      ...auth,
      method: "POST",
      body: { ids },
      query: { force: force ? "true" : undefined },
    }),

  /* ---------------- ads ---------------- */

  ads: (params: { position?: string; status?: string } = {}) =>
    request<{ success: boolean; data: Advertisement[]; positions: string[] }>("/ads", { ...auth, query: params }),

  createAd: (payload: AdPayload) =>
    request<Envelope<Advertisement>>("/ads", { ...auth, method: "POST", body: payload }),

  updateAd: (id: string, payload: AdPayload) =>
    request<Envelope<Advertisement>>(`/ads/${id}`, { ...auth, method: "PUT", body: payload }),

  deleteAd: (id: string) => request<{ success: boolean }>(`/ads/${id}`, { ...auth, method: "DELETE" }),

  /* ---------------- homepage ---------------- */

  homepage: () => request<Homepage>("/homepage", auth),

  saveHomepage: (payload: HomepagePayload) =>
    request<Homepage>("/homepage", { ...auth, method: "PUT", body: payload }),

  /* ---------------- inbox ---------------- */

  contacts: () => request<ContactMessage[]>("/contact", auth),

  // Replies are sent from the editor's own mail app, so the panel no longer
  // posts them; `PUT /contact/reply/:id` stays on the API for older clients.

  deleteContact: (id: string) => request<{ message: string }>(`/contact/${id}`, { ...auth, method: "DELETE" }),

  subscribers: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) =>
    request<Paginated<Subscriber> & { stats: { active: number } }>("/newsletter", { ...auth, query: params }),

  deleteSubscriber: (id: string) => request<{ success: boolean }>(`/newsletter/${id}`, { ...auth, method: "DELETE" }),

  /* ---------------- import / export ---------------- */

  importSample: () => requestRaw("/import/sample", auth),

  exportArticles: (params: { status?: string; category?: string; limit?: number } = {}) =>
    requestRaw("/import/export", { ...auth, query: params }),

  validateImport: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<Envelope<ImportJob>>("/import/validate", { ...auth, method: "POST", form });
  },

  runImport: (file: File, options: { mode: "upsert" | "create"; skipInvalid: boolean }) => {
    const form = new FormData();
    form.append("mode", options.mode);
    form.append("skipInvalid", String(options.skipInvalid));
    form.append("file", file);
    return request<{ success: boolean; batchId: string; async: boolean; message?: string; data?: ImportJob }>(
      "/import/run",
      { ...auth, method: "POST", form },
    );
  },

  importHistory: () => request<Envelope<ImportJob[]>>("/import/history", auth).then((r) => r.data),

  importStatus: (batchId: string) => request<Envelope<ImportJob>>(`/import/${batchId}`, auth).then((r) => r.data),

  rollbackImport: (batchId: string) =>
    request<{ success: boolean; message: string; warning?: string }>(`/import/${batchId}/rollback`, {
      ...auth,
      method: "POST",
    }),
};

/** Save a Response (xlsx export, template) as a file in the browser. */
export async function saveResponseAsFile(response: Response, fallbackName: string) {
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") || "";
  const name = disposition.match(/filename="?([^";]+)"?/)?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Some browsers start the download asynchronously; revoking at once can cancel it.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type { ImageAsset };
