"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { searchHref } from "@/lib/news";

export function SearchForm({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) router.push(searchHref(value.trim()));
      }}
      className="mt-8 flex max-w-xl items-end gap-4 border-b border-line-strong transition-colors focus-within:border-ink"
    >
      <Search className="mb-4 h-4 w-4 shrink-0 text-ink-mute" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search stories, reviews, guides…"
        aria-label="Search"
        className="h-12 w-full min-w-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-mute"
      />
      <button type="submit" className="h-12 shrink-0 text-[13px] font-semibold text-ink transition-colors hover:text-accent">
        Search
      </button>
    </form>
  );
}
