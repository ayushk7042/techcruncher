"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * JSON values persisted in localStorage and shared by every component that
 * reads the same key (bookmarks, liked stories, recent searches, reader prefs).
 */
const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readValue<T>(key: string, fallback: T, isValid: (value: unknown) => boolean): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }

  // Same raw string -> same object, so useSyncExternalStore sees a stable snapshot.
  const cached = cache.get(key);
  if (cached && cached.raw === raw) return cached.value as T;

  let value: T = fallback;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : fallback;
    value = isValid(parsed) ? (parsed as T) : fallback;
  } catch {
    value = fallback;
  }
  cache.set(key, { raw, value });
  return value;
}

function writeValue<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked; state simply does not persist
  }
  listeners.get(key)?.forEach((listener) => listener());
}

export function useLocalValue<T>(key: string, fallback: T, isValid: (value: unknown) => boolean = () => true) {
  // Callers pass literals; keep the first ones so snapshots stay referentially stable.
  const stable = useRef({ fallback, isValid }).current;

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key)!.add(listener);
      const onStorage = (event: StorageEvent) => event.key === key && listener();
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.get(key)?.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => readValue(key, stable.fallback, stable.isValid),
    () => stable.fallback,
  );

  const update = useCallback(
    (fn: (current: T) => T) => writeValue(key, fn(readValue(key, stable.fallback, stable.isValid))),
    [key, stable],
  );

  return [value, update] as const;
}

const EMPTY: unknown[] = [];

export function useLocalList<T>(key: string) {
  return useLocalValue<T[]>(key, EMPTY as T[], Array.isArray);
}
