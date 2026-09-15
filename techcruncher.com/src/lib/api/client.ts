import { API_BASE_URL } from "@/config/site";

export const TOKEN_STORAGE_KEY = "tc-admin-token";
export const UNAUTHORIZED_EVENT = "tc:unauthorized";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  /** JSON body; ignored when `form` is set. */
  body?: unknown;
  form?: FormData;
  /** Attach the admin bearer token (browser only). */
  auth?: boolean;
  signal?: AbortSignal;
  /** Next.js data-cache controls for server-side fetches. */
  revalidate?: number | false;
  cache?: RequestCache;
}

export function readToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Performs the request and returns the successful Response untouched (file
 * downloads). Normalises the backend's two error shapes (`{ message }` and
 * `{ success: false, message }`) into ApiError.
 */
export async function requestRaw(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = "GET", query, body, form, auth, signal, revalidate, cache } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (!form && body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = readToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit & { next?: { revalidate?: number | false } } = {
    method,
    headers,
    signal,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
  };

  if (cache) init.cache = cache;
  else if (revalidate !== undefined) init.next = { revalidate };

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), init);
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiError(0, "Could not reach the server. Check your connection and try again.");
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      (data && typeof data === "object" && "message" in data && String(data.message)) ||
      response.statusText ||
      "Request failed";

    if (response.status === 401 && auth && typeof window !== "undefined") {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(response.status, message, data);
  }

  return response;
}

/** Single entry point for JSON API calls. An empty success body resolves to undefined. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await requestRaw(path, options);
  const text = response.status === 204 ? "" : await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const errorMessage = (error: unknown, fallback = "Something went wrong"): string =>
  error instanceof Error && error.message ? error.message : fallback;
