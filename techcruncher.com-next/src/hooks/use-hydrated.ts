"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False during SSR and hydration, true afterwards. Use it to gate anything that
 * reads browser-only state so the first client render matches the server.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
