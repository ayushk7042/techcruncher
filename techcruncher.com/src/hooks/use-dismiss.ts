"use client";

import { useEffect, type RefObject } from "react";

type Refs = RefObject<HTMLElement | null> | RefObject<HTMLElement | null>[];

/**
 * Closes a menu on outside mousedown and on Escape. Pass every element that
 * counts as "inside" — including the button that toggles the menu, otherwise
 * that button's mousedown closes the menu and its click immediately reopens it.
 */
export function useDismiss(open: boolean, refs: Refs, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const list = Array.isArray(refs) ? refs : [refs];

    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!list.some((ref) => ref.current?.contains(target))) onClose();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, refs, onClose]);
}

/** Locks page scroll while a drawer or dialog is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
