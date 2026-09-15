"use client";

import { useEffect } from "react";

export const LEAVE_MESSAGE = "You have unsaved changes. Leave without saving?";

/** True when it is safe to navigate away: nothing is dirty, or the user agreed to discard. */
export const confirmDiscard = (dirty: boolean) => !dirty || window.confirm(LEAVE_MESSAGE);

function isInternalNavigation(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }
  const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return false;
  // same document, only the hash differs
  return !(url.pathname === window.location.pathname && url.search === window.location.search);
}

/**
 * Warns before unsaved work is lost: on reload / tab close (beforeunload) and
 * on clicks on in-app links. Links are intercepted in the capture phase so the
 * Next.js router never sees a cancelled click.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const onClick = (event: MouseEvent) => {
      if (!isInternalNavigation(event) || window.confirm(LEAVE_MESSAGE)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);
}
