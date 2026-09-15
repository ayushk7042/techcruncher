/**
 * Cloudinary delivery URLs are resized to 2× the rendered CSS width.
 * Non-Cloudinary URLs are returned untouched.
 */
export function imageUrl(url: string | undefined, cssWidth?: number): string | undefined {
  if (!url) return undefined;
  if (!cssWidth || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const width = Math.min(2400, Math.round(cssWidth * 2));
  const [head, tail] = url.split("/upload/");
  // Drop any transformation that was baked into the stored URL.
  const cleanTail = tail.replace(/^([a-z]{1,3}_[^/]+\/)+/, "");
  return `${head}/upload/f_auto,q_auto:best,dpr_auto,w_${width},c_limit/${cleanTail}`;
}

/** Extracts a YouTube / Vimeo embed URL, or null for direct files. */
export function videoEmbed(url: string): { kind: "iframe" | "file"; src: string; provider: string } {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) return { kind: "iframe", src: `https://www.youtube.com/embed/${youtube[1]}`, provider: "YouTube" };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo[1]}`, provider: "Vimeo" };

  return { kind: "file", src: url, provider: "Video" };
}

export function videoThumb(url: string): string | undefined {
  const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return youtube ? `https://i.ytimg.com/vi/${youtube[1]}/hqdefault.jpg` : undefined;
}

export const formatDuration = (seconds?: number) => {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};
