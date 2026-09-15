"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Reads and writes query-string state without a server round trip. Next's
 * router keeps useSearchParams in sync with history.replaceState.
 */
export function useUrlState() {
  const params = useSearchParams();
  const pathname = usePathname();

  const get = useCallback((key: string) => params.get(key) ?? "", [params]);

  const set = useCallback(
    (patch: Record<string, string | number | null | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        // page 1 is the default, so it is left out of the URL
        const isDefault = value === null || value === undefined || value === "" || (key === "page" && Number(value) === 1);
        if (isDefault) next.delete(key);
        else next.set(key, String(value));
      }
      const query = next.toString();
      window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
    },
    [params, pathname],
  );

  return { get, set, params };
}
