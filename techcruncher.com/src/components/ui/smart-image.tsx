"use client";

import { ImageOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";
import { imageUrl } from "@/lib/image";

interface SmartImageProps {
  src?: string;
  alt?: string;
  /** Aspect ratio utility, e.g. "aspect-[4/3]". Ignored with `fill`. */
  ratio?: string;
  /** Rendered CSS width in px, used to request a right-sized Cloudinary asset. */
  width?: number;
  priority?: boolean;
  fit?: "cover" | "contain";
  fill?: boolean;
  overlay?: boolean;
  className?: string;
  imgClassName?: string;
}

export function SmartImage({
  src,
  alt = "",
  ratio = "aspect-[4/3]",
  width,
  priority = false,
  fit = "cover",
  fill = false,
  overlay = false,
  className,
  imgClassName,
}: SmartImageProps) {
  const resolved = imageUrl(src, width);
  const ref = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(resolved ? "loading" : "error");

  // A cached image can finish before hydration attaches onLoad.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) setStatus(img.naturalWidth > 0 ? "loaded" : "error");
  }, [resolved]);

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-raise",
        fill ? "absolute inset-0 h-full w-full" : ratio,
        className,
      )}
    >
      {status === "loading" && <div className="skeleton absolute inset-0" />}

      {resolved && status !== "error" && (
        <>
          {fit === "contain" && (
            <img
              src={resolved}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-2xl"
            />
          )}
          <img
            ref={ref}
            src={resolved}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : undefined}
            decoding="async"
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={cn(
              "relative h-full w-full object-center transition-all duration-500",
              fit === "contain" ? "object-contain" : "object-cover",
              status === "loaded" ? "opacity-100" : "opacity-0",
              imgClassName,
            )}
          />
        </>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-raise text-ink-mute">
          <ImageOff className="h-5 w-5" aria-hidden="true" />
          <span className="eyebrow">{site.name}</span>
        </div>
      )}

      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      )}
    </div>
  );
}
