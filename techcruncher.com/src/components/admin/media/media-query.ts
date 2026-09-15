import { adminApi } from "@/lib/api/admin";

/** Prefix for every media cache, including the shared MediaPicker's. */
export const MEDIA_KEY = ["admin", "media"] as const;

export const mediaFoldersQuery = {
  queryKey: [...MEDIA_KEY, "folders"],
  queryFn: () => adminApi.mediaFolders(),
};

/** Mirrors config/upload.js so oversized or unsupported files fail before the request. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export const isUploadable = (file: File) => file.type.startsWith("image/") || file.type.startsWith("video/");
