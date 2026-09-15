"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <h1 className="headline text-[30px]">Something broke on our side</h1>
      <p className="max-w-md text-[14px] leading-relaxed text-ink-soft">The page failed to render. Reloading usually fixes it.</p>
      <button type="button" onClick={reset} className="btn-primary mt-2 h-11 px-6">
        Reload page
      </button>
    </div>
  );
}
